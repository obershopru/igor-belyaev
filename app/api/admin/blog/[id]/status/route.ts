import { and, eq } from 'drizzle-orm'
import { adminError, adminResponse, checkStaffMutation, unauthorizedResponse } from '@/lib/admin-auth'
import { getPostById, parsePostId, revalidateBlog } from '@/lib/blog'
import { type BlogStatus, availableActions, isBlogAction } from '@/lib/blog-workflow'
import { getDb } from '@/lib/db'
import { blogPosts } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_COMMENT = 2000

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const values = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  const action = values.action
  const comment = typeof values.comment === 'string' ? values.comment.trim() : ''
  if (!isBlogAction(action)) return adminError('Неизвестное действие.')
  if (comment.length > MAX_COMMENT) return adminError(`Комментарий — не длиннее ${MAX_COMMENT} символов.`)
  if (action === 'return' && !comment) return adminError('Напишите, что нужно доработать.')

  try {
    const current = await getPostById(id)
    if (!current) return adminError('Статья не найдена.', 404)
    const status = current.status as BlogStatus
    if (!availableActions(status, role).includes(action)) {
      return adminError('Это действие недоступно для статьи в текущем статусе. Обновите страницу.', 409)
    }
    if (action === 'publish' && (!current.body.trim() || !current.excerpt.trim())) {
      return adminError('Перед публикацией заполните анонс и текст статьи.')
    }

    const now = new Date()
    const changes = {
      submit: { status: 'review', submittedAt: now, reviewComment: null },
      withdraw: { status: 'draft' },
      return: { status: 'draft', reviewComment: comment },
      publish: { status: 'published', publishedAt: current.publishedAt ?? now, reviewComment: null },
      unpublish: { status: 'draft' },
    }[action]

    // The status condition guards against two people acting on the same post at once.
    const [post] = await getDb()
      .update(blogPosts)
      .set({ ...changes, updatedBy: role, updatedAt: now })
      .where(and(eq(blogPosts.id, id), eq(blogPosts.status, status)))
      .returning()
    if (!post) return adminError('Статус статьи уже изменился. Обновите страницу.', 409)

    if (action === 'publish' || action === 'unpublish') revalidateBlog(post.slug)
    return adminResponse({ post })
  } catch {
    return adminError('Не удалось изменить статус статьи.', 503)
  }
}
