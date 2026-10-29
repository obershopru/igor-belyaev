import { NextResponse } from 'next/server'
import { adminError, clearAdminCookie, hasSameOrigin } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!hasSameOrigin(request)) return adminError('Недопустимый источник запроса.', 403)
  const response = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store, private' } })
  clearAdminCookie(response)
  return response
}
