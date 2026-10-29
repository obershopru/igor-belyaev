import { and, eq } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'
import { readMasterclassSettings } from '@/lib/masterclass'
import { parseUtm } from '@/lib/utm'
import { createYooKassaPayment, getYooKassaConfig, isYooKassaCheckoutUrl } from '@/lib/yookassa'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const jsonHeaders = { 'Cache-Control': 'no-store' }

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status, headers: jsonHeaders })
}

export async function POST(request: Request) {
  const config = getYooKassaConfig()
  if (!config || !process.env.DATABASE_URL) {
    return jsonError('Онлайн-оплата пока не настроена. Попробуйте позже.', 503)
  }

  if (request.headers.get('origin') !== config.siteUrl) {
    return jsonError('Недопустимый источник запроса.', 403)
  }

  if (!request.headers.get('content-type')?.includes('application/json')) {
    return jsonError('Некорректный формат запроса.', 415)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Проверьте заполненные поля.', 400)
  }

  if (!body || typeof body !== 'object') return jsonError('Проверьте заполненные поля.', 400)

  const values = body as Record<string, unknown>
  const name = typeof values.name === 'string' ? values.name.trim() : ''
  const phone = typeof values.phone === 'string' ? values.phone.trim() : ''
  const telegram = typeof values.telegram === 'string' ? values.telegram.trim() : ''
  const salebotClientId = typeof values.salebotClientId === 'string' ? values.salebotClientId.trim() : ''
  const checkoutKey = typeof values.checkoutKey === 'string' ? values.checkoutKey : ''
  const phoneDigits = phone.replace(/\D/g, '')

  if (name.length < 2 || name.length > 120) return jsonError('Укажите имя длиной от 2 до 120 символов.', 400)
  if (phoneDigits.length < 10 || phoneDigits.length > 15 || !/^[0-9+() .-]+$/.test(phone)) {
    return jsonError('Проверьте номер телефона.', 400)
  }
  const telegramUsername = telegram.startsWith('@') ? telegram.slice(1) : telegram
  if (!/^[A-Za-z0-9_]{5,32}$/.test(telegramUsername) || (salebotClientId && !/^\d{1,20}$/.test(salebotClientId)) || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(checkoutKey) || values.consent !== true) {
    return jsonError('Укажите корректный ник Telegram и подтвердите согласие на обработку данных.', 400)
  }

  try {
    const db = getDb()
    const { price } = await readMasterclassSettings()
    const [inserted] = await db.insert(workshopLeads).values({
      name,
      phone,
      telegram,
      salebotClientId: salebotClientId || null,
      source: 'masterclass',
      consentAt: new Date(),
      checkoutKey,
      paymentStatus: 'pending',
      paymentAmount: price,
      ...parseUtm(values.utm),
    }).onConflictDoNothing().returning({
      id: workshopLeads.id,
      phone: workshopLeads.phone,
      paymentStatus: workshopLeads.paymentStatus,
      paymentAmount: workshopLeads.paymentAmount,
      yookassaPaymentId: workshopLeads.yookassaPaymentId,
      paymentConfirmationUrl: workshopLeads.paymentConfirmationUrl,
    })

    const lead = inserted ?? (await db.select({
      id: workshopLeads.id,
      phone: workshopLeads.phone,
      paymentStatus: workshopLeads.paymentStatus,
      paymentAmount: workshopLeads.paymentAmount,
      yookassaPaymentId: workshopLeads.yookassaPaymentId,
      paymentConfirmationUrl: workshopLeads.paymentConfirmationUrl,
    }).from(workshopLeads).where(and(
      eq(workshopLeads.checkoutKey, checkoutKey),
      eq(workshopLeads.source, 'masterclass'),
    )).limit(1))[0]

    if (!lead) return jsonError('Не удалось создать заявку. Попробуйте ещё раз.', 500)

    if (lead.paymentStatus === 'succeeded') {
      return NextResponse.json({ redirectUrl: `${config.siteUrl}/master/payment?checkout_key=${encodeURIComponent(checkoutKey)}` }, { headers: jsonHeaders })
    }

    if (lead.paymentConfirmationUrl && isYooKassaCheckoutUrl(lead.paymentConfirmationUrl)) {
      return NextResponse.json({ redirectUrl: lead.paymentConfirmationUrl }, { headers: jsonHeaders })
    }

    const leadPrice = lead.paymentAmount ?? price
    if (lead.paymentAmount === null) {
      await db.update(workshopLeads).set({ paymentAmount: leadPrice }).where(eq(workshopLeads.id, lead.id))
    }
    const payment = await createYooKassaPayment({ leadId: lead.id, checkoutKey, phone: lead.phone, price: leadPrice })
    const confirmationUrl = payment.confirmation?.confirmation_url

    if (!payment.id || payment.status !== 'pending' || !isYooKassaCheckoutUrl(confirmationUrl)) {
      return jsonError('ЮKassa не вернула ссылку на оплату. Проверьте настройки магазина.', 502)
    }

    await db.update(workshopLeads).set({
      yookassaPaymentId: payment.id,
      paymentStatus: payment.status,
      paymentConfirmationUrl: confirmationUrl,
    }).where(and(
      eq(workshopLeads.id, lead.id),
      eq(workshopLeads.checkoutKey, checkoutKey),
    ))

    return NextResponse.json({ redirectUrl: confirmationUrl }, { status: 201, headers: jsonHeaders })
  } catch {
    return jsonError('Не удалось создать платёж. Проверьте настройки ЮKassa и попробуйте ещё раз.', 502)
  }
}
