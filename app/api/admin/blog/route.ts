import { desc } from 'drizzle-orm'
import { adminError, adminResponse, checkStaffMutation, getRequestRole, unauthorizedResponse } from '@/lib/admin-auth'
import { isSlugTaken } from '@/lib/blog'
import { parseBlogDraft } from '@/lib/blog-workflow'
import { getDb } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!getRequestRole(request)) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  try {
    const posts = await getDb()
      .select({
        id: blogPosts.id,
        slug: blogPosts.slug,
        title: blogPosts.title,
        status: blogPosts.status,
        reviewComment: blogPosts.reviewComment,
        createdBy: blogPosts.createdBy,
        updatedBy: blogPosts.updatedBy,
        updatedAt: blogPosts.updatedAt,
        submittedAt: blogPosts.submittedAt,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .orderBy(desc(blogPosts.updatedAt))
    return adminResponse({ posts })
  } catch {
    return adminError('Не удалось загрузить статьи.', 503)
  }
}

export async function POST(request: Request) {
  const role = checkStaffMutation(request)
  if (!role) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Некорректный запрос.')
  }

  const draft = parseBlogDraft(body)
  if (typeof draft === 'string') return adminError(draft)

  try {
    if (await isSlugTaken(draft.slug)) return adminError('Статья с таким адресом уже есть — измените адрес.', 409)
    const [post] = await getDb()
      .insert(blogPosts)
      .values({ ...draft, status: 'draft', createdBy: role, updatedBy: role })
      .returning()
    return adminResponse({ post }, 201)
  } catch {
    return adminError('Не удалось создать статью.', 503)
  }
}
