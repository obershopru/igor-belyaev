import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'
import { parseUtm } from '@/lib/utm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const jsonHeaders = { 'Cache-Control': 'no-store' }

export async function POST(request: Request) {
  const origin = request.headers.get('origin')
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim()
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
  const host = forwardedHost || request.headers.get('host')
  const protocol = forwardedProto || new URL(request.url).protocol.slice(0, -1)
  let requestOrigin = new URL(request.url).origin

  if (host) {
    try {
      requestOrigin = new URL(`${protocol}://${host}`).origin
    } catch {
      return NextResponse.json({ error: 'Недопустимый источник запроса.' }, { status: 403, headers: jsonHeaders })
    }
  }

  if (origin && origin !== requestOrigin) {
    return NextResponse.json({ error: 'Недопустимый источник запроса.' }, { status: 403, headers: jsonHeaders })
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return NextResponse.json({ error: 'Некорректный формат запроса.' }, { status: 415, headers: jsonHeaders })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Проверьте заполненные поля.' }, { status: 400, headers: jsonHeaders })
  }

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Проверьте заполненные поля.' }, { status: 400, headers: jsonHeaders })
  }

  const values = body as Record<string, unknown>
  const name = typeof values.name === 'string' ? values.name.trim() : ''
  const phone = typeof values.phone === 'string' ? values.phone.trim() : ''
  const telegram = typeof values.telegram === 'string' ? values.telegram.trim() : ''
  const source = values.source === 'guide' ? 'guide' : values.source === 'masterclass' ? 'masterclass' : null
  const phoneDigits = phone.replace(/\D/g, '')

  if (name.length < 2 || name.length > 120) {
    return NextResponse.json({ error: 'Укажите имя длиной от 2 до 120 символов.' }, { status: 400, headers: jsonHeaders })
  }

  if (phoneDigits.length < 10 || phoneDigits.length > 15 || !/^[0-9+() .-]+$/.test(phone)) {
    return NextResponse.json({ error: 'Проверьте номер телефона.' }, { status: 400, headers: jsonHeaders })
  }

  if (telegram.length > 64 || !source || values.consent !== true) {
    return NextResponse.json({ error: 'Проверьте контактные данные и подтвердите согласие.' }, { status: 400, headers: jsonHeaders })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Форма временно недоступна. Попробуйте позже.' }, { status: 503, headers: jsonHeaders })
  }

  try {
    const botClickKey = source === 'guide' ? randomUUID() : null
    await getDb().insert(workshopLeads).values({
      name,
      phone,
      telegram,
      source,
      consentAt: new Date(),
      botClickKey,
      ...parseUtm(values.utm),
    })

    return NextResponse.json({ ok: true, botClickKey }, { status: 201, headers: jsonHeaders })
  } catch {
    return NextResponse.json({ error: 'Не удалось сохранить заявку. Попробуйте ещё раз.' }, { status: 500, headers: jsonHeaders })
  }
}
