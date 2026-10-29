import { and, eq, isNull } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'
import { isValidCheckoutKey } from '@/lib/yookassa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const jsonHeaders = { 'Cache-Control': 'no-store' }

// The key is an unguessable UUID issued with the lead, so it doubles as authorization.
export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'Unavailable' }, { status: 503, headers: jsonHeaders })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: jsonHeaders })
  }

  const key = body && typeof body === 'object' ? (body as Record<string, unknown>).key : null
  if (!isValidCheckoutKey(key)) return NextResponse.json({ error: 'Invalid key' }, { status: 400, headers: jsonHeaders })

  try {
    await getDb().update(workshopLeads).set({ botClickedAt: new Date() }).where(and(
      eq(workshopLeads.botClickKey, key),
      isNull(workshopLeads.botClickedAt),
    ))
    return NextResponse.json({ ok: true }, { headers: jsonHeaders })
  } catch {
    return NextResponse.json({ error: 'Unavailable' }, { status: 503, headers: jsonHeaders })
  }
}
