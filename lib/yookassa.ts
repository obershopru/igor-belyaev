import { and, eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'
import { DEFAULT_MASTERCLASS_PRICE } from '@/lib/masterclass'

const API_URL = 'https://api.yookassa.ru/v3'
export const MASTERCLASS_DESCRIPTION = 'Участие в онлайн-мастер-классе по переговорам'

export type YooKassaPayment = {
  id: string
  status: string
  amount?: { value?: string; currency?: string }
  metadata?: Record<string, string>
  confirmation?: { confirmation_url?: string }
}

export function getYooKassaConfig() {
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim()
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim()
  const siteUrl = process.env.SITE_URL?.trim()
  const vatCode = Number(process.env.YOOKASSA_VAT_CODE)

  if (!shopId || !secretKey || !siteUrl || !Number.isInteger(vatCode) || vatCode < 1) return null

  try {
    const url = new URL(siteUrl)
    if (url.protocol !== 'https:' && url.hostname !== 'localhost') return null
    return { shopId, secretKey, siteUrl: url.origin, vatCode }
  } catch {
    return null
  }
}

async function yooKassaRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getYooKassaConfig()
  if (!config) throw new Error('YooKassa is not configured')

  const authorization = Buffer.from(`${config.shopId}:${config.secretKey}`).toString('base64')
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Authorization: `Basic ${authorization}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  })

  if (!response.ok) throw new Error(`YooKassa request failed (${response.status})`)
  return response.json() as Promise<T>
}

function formatReceiptPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+7${digits}`
  if (digits.length === 11 && digits.startsWith('8')) return `+7${digits.slice(1)}`
  return `+${digits}`
}

export async function createYooKassaPayment({
  leadId,
  checkoutKey,
  phone,
  price,
}: {
  leadId: number
  checkoutKey: string
  phone: string
  price: number
}) {
  const config = getYooKassaConfig()
  if (!config) throw new Error('YooKassa is not configured')
  const amount = price.toFixed(2)

  return yooKassaRequest<YooKassaPayment>('/payments', {
    method: 'POST',
    headers: { 'Idempotence-Key': checkoutKey },
    body: JSON.stringify({
      amount: { value: amount, currency: 'RUB' },
      payment_method_data: { type: 'sbp' },
      capture: true,
      confirmation: {
        type: 'redirect',
        return_url: `${config.siteUrl}/master/payment?checkout_key=${encodeURIComponent(checkoutKey)}`,
      },
      description: MASTERCLASS_DESCRIPTION,
      metadata: { lead_id: String(leadId), checkout_key: checkoutKey },
      receipt: {
        customer: { phone: formatReceiptPhone(phone) },
        items: [
          {
            description: MASTERCLASS_DESCRIPTION,
            quantity: '1.00',
            amount: { value: amount, currency: 'RUB' },
            payment_mode: 'full_payment',
            payment_subject: 'service',
            vat_code: config.vatCode,
          },
        ],
      },
    }),
  })
}

export function getYooKassaPayment(paymentId: string) {
  return yooKassaRequest<YooKassaPayment>(`/payments/${encodeURIComponent(paymentId)}`)
}

export function isYooKassaCheckoutUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && ['yookassa.ru', 'yoomoney.ru'].some((domain) =>
      url.hostname === domain || url.hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

// Leads created before prices became editable have no stored amount and were charged the default price.
export function isMasterclassAmount(amount: YooKassaPayment['amount'], expectedPrice: number | null) {
  return amount?.currency === 'RUB' && Number(amount.value) === (expectedPrice ?? DEFAULT_MASTERCLASS_PRICE)
}

export function isValidCheckoutKey(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function isYooKassaConfigured() {
  return getYooKassaConfig() !== null
}

export async function getLeadPaymentByCheckoutKey(checkoutKey: string) {
  const [lead] = await getDb()
    .select({ paymentId: workshopLeads.yookassaPaymentId, status: workshopLeads.paymentStatus })
    .from(workshopLeads)
    .where(and(eq(workshopLeads.checkoutKey, checkoutKey), eq(workshopLeads.source, 'masterclass')))
    .limit(1)
  return lead ?? null
}

export async function verifyAndStorePayment(paymentId: string) {
  const db = getDb()
  const [lead] = await db
    .select({ id: workshopLeads.id, checkoutKey: workshopLeads.checkoutKey, paymentAmount: workshopLeads.paymentAmount })
    .from(workshopLeads)
    .where(and(eq(workshopLeads.yookassaPaymentId, paymentId), eq(workshopLeads.source, 'masterclass')))
    .limit(1)

  if (!lead?.checkoutKey) return null

  const payment = await getYooKassaPayment(paymentId)
  if (
    payment.id !== paymentId ||
    payment.metadata?.lead_id !== String(lead.id) ||
    payment.metadata?.checkout_key !== lead.checkoutKey ||
    !isMasterclassAmount(payment.amount, lead.paymentAmount)
  ) {
    throw new Error('YooKassa payment does not match the order')
  }

  if (payment.status === 'succeeded') {
    await db.update(workshopLeads).set({ paymentStatus: 'succeeded' }).where(eq(workshopLeads.id, lead.id))
  } else if (payment.status === 'canceled') {
    await db.update(workshopLeads).set({ paymentStatus: 'canceled' }).where(and(
      eq(workshopLeads.id, lead.id),
      eq(workshopLeads.paymentStatus, 'pending'),
    ))
  }

  return payment.status
}
