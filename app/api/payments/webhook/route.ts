import { and, eq, isNull, lt, or } from 'drizzle-orm'
import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'
import { getYooKassaPayment, isMasterclassAmount } from '@/lib/yookassa'
import { sendSaleBotPaymentSuccess } from '@/lib/salebot'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'Database unavailable' }, { status: 503 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body || typeof body !== 'object') return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  const event = body as { event?: unknown; object?: { id?: unknown } }
  if (event.event !== 'payment.succeeded' && event.event !== 'payment.canceled') {
    return NextResponse.json({ ok: true })
  }

  const paymentId = typeof event.object?.id === 'string' ? event.object.id : ''
  if (!paymentId || paymentId.length > 128) return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 })

  try {
    const payment = await getYooKassaPayment(paymentId)
    const leadId = Number(payment.metadata?.lead_id)
    const checkoutKey = payment.metadata?.checkout_key

    if (
      payment.id !== paymentId ||
      !Number.isSafeInteger(leadId) ||
      !checkoutKey ||
      (payment.status !== 'succeeded' && payment.status !== 'canceled')
    ) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    const db = getDb()
    const match = and(
      eq(workshopLeads.id, leadId),
      eq(workshopLeads.source, 'masterclass'),
      eq(workshopLeads.checkoutKey, checkoutKey),
      eq(workshopLeads.yookassaPaymentId, paymentId),
    )

    const [lead] = await db.select({ paymentAmount: workshopLeads.paymentAmount }).from(workshopLeads).where(match).limit(1)
    if (!lead || !isMasterclassAmount(payment.amount, lead.paymentAmount)) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    if (payment.status === 'canceled') {
      await db.update(workshopLeads).set({ paymentStatus: 'canceled' }).where(and(match, eq(workshopLeads.paymentStatus, 'pending')))
      return NextResponse.json({ ok: true })
    }

    await db.update(workshopLeads).set({ paymentStatus: 'succeeded' }).where(match)

    const retryBefore = new Date(Date.now() - 2 * 60 * 1000)
    const [claimedLead] = await db.update(workshopLeads).set({
      salebotNotificationStatus: 'sending',
      salebotNotificationUpdatedAt: new Date(),
    }).where(and(
      match,
      eq(workshopLeads.paymentStatus, 'succeeded'),
      or(
        isNull(workshopLeads.salebotNotificationStatus),
        eq(workshopLeads.salebotNotificationStatus, 'failed'),
        and(
          eq(workshopLeads.salebotNotificationStatus, 'sending'),
          lt(workshopLeads.salebotNotificationUpdatedAt, retryBefore),
        ),
      ),
    )).returning({
      id: workshopLeads.id,
      phone: workshopLeads.phone,
      salebotClientId: workshopLeads.salebotClientId,
    })

    if (!claimedLead) return NextResponse.json({ ok: true })

    try {
      const result = await sendSaleBotPaymentSuccess(claimedLead.salebotClientId)
      const notificationStatus = result.delivered ? 'sent' : 'not_found'
      await db.update(workshopLeads).set({
        salebotNotificationStatus: notificationStatus,
        salebotNotificationUpdatedAt: new Date(),
      }).where(and(
        eq(workshopLeads.id, claimedLead.id),
        eq(workshopLeads.salebotNotificationStatus, 'sending'),
      ))
      return NextResponse.json({ ok: true })
    } catch {
      await db.update(workshopLeads).set({
        salebotNotificationStatus: 'failed',
        salebotNotificationUpdatedAt: new Date(),
      }).where(and(
        eq(workshopLeads.id, claimedLead.id),
        eq(workshopLeads.salebotNotificationStatus, 'sending'),
      ))
      return NextResponse.json({ error: 'SaleBot notification unavailable' }, { status: 503 })
    }
  } catch {
    return NextResponse.json({ error: 'Could not verify payment' }, { status: 503 })
  }
}
