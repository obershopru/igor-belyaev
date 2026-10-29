import { NextResponse } from 'next/server'
import {
  adminError,
  createAdminSession,
  hasSameOrigin,
  isAdminConfigured,
  setAdminCookie,
  verifyAdminCredentials,
} from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS = 10
const WINDOW_MS = 15 * 60 * 1000
const attempts = new Map<string, { count: number; resetAt: number }>()

function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || request.headers.get('x-real-ip') || 'unknown'
}

function isThrottled(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt <= now) return false
  return entry.count >= MAX_ATTEMPTS
}

function recordFailure(ip: string) {
  const now = Date.now()
  const entry = attempts.get(ip)
  if (!entry || entry.resetAt <= now) attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
  else entry.count += 1
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) return adminError('Админ-панель не настроена.', 503)
  if (!hasSameOrigin(request)) return adminError('Недопустимый источник запроса.', 403)

  const ip = clientIp(request)
  if (isThrottled(ip)) return adminError('Слишком много попыток. Попробуйте через 15 минут.', 429)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Некорректный запрос.')
  }

  const values = body && typeof body === 'object' ? body as Record<string, unknown> : {}
  if (!verifyAdminCredentials(values.username, values.password)) {
    recordFailure(ip)
    return adminError('Неверный логин или пароль.', 401)
  }

  attempts.delete(ip)
  const { token, maxAge } = createAdminSession()
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store, private' } })
  setAdminCookie(response, token, maxAge)
  return response
}
