import { timingSafeEqual } from 'node:crypto'
import { desc } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const challengeHeaders = {
  'WWW-Authenticate': 'Basic realm="Leads export", charset="UTF-8"',
  'Cache-Control': 'no-store',
}

function isAuthorized(request: Request, password: string) {
  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith('Basic ')) return false

  let credentials: string
  try {
    credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
  } catch {
    return false
  }

  const separator = credentials.indexOf(':')
  if (separator < 0 || credentials.slice(0, separator) !== 'admin') return false

  const provided = Buffer.from(credentials.slice(separator + 1))
  const expected = Buffer.from(password)
  return provided.length === expected.length && timingSafeEqual(provided, expected)
}

function csvCell(value: unknown) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

export async function GET(request: Request) {
  const password = process.env.LEADS_EXPORT_PASSWORD
  if (!password) {
    return NextResponse.json({ error: 'Выгрузка не настроена.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  if (!isAuthorized(request, password)) {
    return new NextResponse('Требуется авторизация.', { status: 401, headers: challengeHeaders })
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: 'Хранилище заявок временно недоступно.' }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
  }

  try {
    const rows = await getDb()
      .select({
        id: workshopLeads.id,
        name: workshopLeads.name,
        phone: workshopLeads.phone,
        telegram: workshopLeads.telegram,
        consentAt: workshopLeads.consentAt,
        createdAt: workshopLeads.createdAt,
        source: workshopLeads.source,
        page: workshopLeads.page,
      })
      .from(workshopLeads)
      .orderBy(desc(workshopLeads.createdAt), desc(workshopLeads.id))

    const headings = ['ID', 'Имя', 'Телефон', 'Telegram', 'Согласие', 'Дата заявки', 'Источник', 'Страница']
    const csvRows = rows.map((row) => [
      row.id,
      row.name,
      row.phone,
      row.telegram,
      row.consentAt.toISOString(),
      row.createdAt.toISOString(),
      row.source === 'guide' ? 'Гайд' : 'Мастер-класс',
      row.source === 'guide' ? '' : `/${row.page ?? 'master'}`,
    ])
    const csv = `\uFEFF${[headings, ...csvRows].map((row) => row.map(csvCell).join(',')).join('\r\n')}`
    const date = new Date().toISOString().slice(0, 10)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="leads-${date}.csv"`,
        'Cache-Control': 'no-store, private',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Не удалось сформировать выгрузку.' }, { status: 500, headers: { 'Cache-Control': 'no-store' } })
  }
}
