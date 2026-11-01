import { eq } from 'drizzle-orm'
import { adminError, adminResponse, checkStaffMutation, getRequestRole, unauthorizedResponse } from '@/lib/admin-auth'
import { getPostById, isSlugTaken, parsePostId, revalidateBlog } from '@/lib/blog'
import { type BlogStatus, canDelete, canEdit, parseBlogDraft } from '@/lib/blog-workflow'
import { getDb } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, { params }: Context) {
  if (!getRequestRole(request)) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)
  const id = parsePostId((await params).id)
  if (!id) return adminError('Статья не найдена.', 404)

  try {
    const post = await getPostById(id)
    return post ? adminResponse({ post }) : adminError('Статья не найдена.', 404)
  } catch {
    return adminError('Не удалось загрузить статью.', 503)
  }
}

export async function PUT(request: Request, { params }: Context) {
  const role = checkStaffMutation(request)
  if (!role) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)
  const id = parsePostId((await params).id)
  if (!id) return adminError('Статья не найдена.', 404)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Некорректный запрос.')
  }

  const draft = parseBlogDraft(body)
  if (typeof draft === 'string') return adminError(draft)

  try {
    const current = await getPostById(id)
    if (!current) return adminError('Статья не найдена.', 404)
    if (!canEdit(current.status as BlogStatus, role)) {
      return adminError('Статья на согласовании или опубликована — редактировать её может только администратор.', 403)
    }
    if (await isSlugTaken(draft.slug, id)) return adminError('Статья с таким адресом уже есть — измените адрес.', 409)

    const [post] = await getDb()
      .update(blogPosts)
      .set({ ...draft, updatedBy: role, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning()
    if (current.status === 'published') revalidateBlog(current.slug, post.slug)
    return adminResponse({ post })
  } catch {
    return adminError('Не удалось сохранить статью.', 503)
  }
}

export async function DELETE(request: Request, { params }: Context) {
  const role = checkStaffMutation(request)
  if (!role) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)
  const id = parsePostId((await params).id)
  if (!id) return adminError('Статья не найдена.', 404)

  try {
    const current = await getPostById(id)
    if (!current) return adminError('Статья не найдена.', 404)
    if (!canDelete(current.status as BlogStatus, role)) return adminError('Удалять можно только черновики.', 403)
    await getDb().delete(blogPosts).where(eq(blogPosts.id, id))
    if (current.status === 'published') revalidateBlog(current.slug)
    return adminResponse({ ok: true })
  } catch {
    return adminError('Не удалось удалить статью.', 503)
  }
}
