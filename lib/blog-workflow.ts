import type { StaffRole } from '@/lib/admin-auth'

export type BlogStatus = 'draft' | 'review' | 'published'
export type BlogAction = 'submit' | 'withdraw' | 'return' | 'publish' | 'unpublish'

export const blogStatusLabels: Record<BlogStatus, string> = {
  draft: 'Черновик',
  review: 'На согласовании',
  published: 'Опубликовано',
}

export const blogActionLabels: Record<BlogAction, string> = {
  submit: 'Отправить на согласование',
  withdraw: 'Вернуть в черновики',
  return: 'Вернуть на доработку',
  publish: 'Опубликовать',
  unpublish: 'Снять с публикации',
}

// Workflow: the editor prepares a draft and sends it for review; only the admin publishes.
const transitions: Record<BlogAction, { from: BlogStatus[]; to: BlogStatus; roles: StaffRole[] }> = {
  submit: { from: ['draft'], to: 'review', roles: ['admin', 'editor'] },
  withdraw: { from: ['review'], to: 'draft', roles: ['admin', 'editor'] },
  return: { from: ['review'], to: 'draft', roles: ['admin'] },
  publish: { from: ['draft', 'review'], to: 'published', roles: ['admin'] },
  unpublish: { from: ['published'], to: 'draft', roles: ['admin'] },
}

export function isBlogStatus(value: unknown): value is BlogStatus {
  return value === 'draft' || value === 'review' || value === 'published'
}

export function isBlogAction(value: unknown): value is BlogAction {
  return typeof value === 'string' && value in transitions
}

export function availableActions(status: BlogStatus, role: StaffRole): BlogAction[] {
  return (Object.keys(transitions) as BlogAction[]).filter((action) => {
    const rule = transitions[action]
    return rule.from.includes(status) && rule.roles.includes(role)
  })
}

// The editor cannot change a post once it is under review or live: those belong to the admin.
export function canEdit(status: BlogStatus, role: StaffRole) {
  return role === 'admin' || status === 'draft'
}

export function canDelete(status: BlogStatus, role: StaffRole) {
  return role === 'admin' || status === 'draft'
}

const translit: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'j', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'shch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .split('')
    .map((char) => translit[char] ?? char)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
    .replace(/-+$/g, '')
}

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export type BlogDraft = { title: string; slug: string; excerpt: string; coverUrl: string | null; body: string }

const LIMITS = { title: 200, slug: 80, excerpt: 500, coverUrl: 500, body: 200_000 }

function isSafeUrl(value: string) {
  return /^(https?:\/\/|\/(?!\/))/i.test(value)
}

// Returns an error message for the editor, or the cleaned draft.
export function parseBlogDraft(value: unknown): BlogDraft | string {
  if (!value || typeof value !== 'object') return 'Некорректный запрос.'
  const input = value as Record<string, unknown>
  const title = typeof input.title === 'string' ? input.title.trim() : ''
  const excerpt = typeof input.excerpt === 'string' ? input.excerpt.trim() : ''
  const body = typeof input.body === 'string' ? input.body.replace(/\r\n/g, '\n') : ''
  const coverUrl = typeof input.coverUrl === 'string' && input.coverUrl.trim() ? input.coverUrl.trim() : null
  const slug = typeof input.slug === 'string' && input.slug.trim() ? input.slug.trim().toLowerCase() : slugify(title)

  if (!title) return 'Укажите заголовок статьи.'
  if (title.length > LIMITS.title) return `Заголовок — не длиннее ${LIMITS.title} символов.`
  if (!slug || slug.length > LIMITS.slug || !SLUG_PATTERN.test(slug)) {
    return 'Адрес статьи — латинские буквы, цифры и дефисы, до 80 символов.'
  }
  if (excerpt.length > LIMITS.excerpt) return `Анонс — не длиннее ${LIMITS.excerpt} символов.`
  if (body.length > LIMITS.body) return 'Текст статьи слишком длинный.'
  if (coverUrl && (coverUrl.length > LIMITS.coverUrl || !isSafeUrl(coverUrl))) {
    return 'Ссылка на обложку должна начинаться с https:// или /.'
  }
  return { title, slug, excerpt, coverUrl, body }
}

export function formatPostDate(date: Date | string | null) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' })
}
