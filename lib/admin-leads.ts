export type AdminLead = {
  id: number
  createdAt: string
  source: string
  name: string
  phone: string
  telegram: string
  botClickTracked: boolean
  botClickedAt: string | null
  paymentStatus: string | null
  paymentAmount: number | null
  salebotNotificationStatus: string | null
}

export type SourceFilter = 'all' | 'guide' | 'masterclass'
export type StatusFilter = 'all' | 'clicked' | 'not_clicked' | 'succeeded' | 'pending' | 'canceled'

export type LeadFilters = {
  from: string
  to: string
  source: SourceFilter
  status: StatusFilter
  query: string
}

const DEFAULT_PRICE = 9990
const TIME_ZONE = 'Europe/Moscow'

export const sourceLabels: Record<string, string> = {
  guide: 'Гайд',
  masterclass: 'Мастер-класс',
}

export const paymentLabels: Record<string, string> = {
  succeeded: 'Оплачено',
  pending: 'Ожидает оплаты',
  canceled: 'Отменено',
}

export const salebotLabels: Record<string, string> = {
  sent: 'Отправлено',
  sending: 'Отправляется',
  failed: 'Ошибка',
  not_found: 'Нет ID клиента',
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('ru-RU', {
    timeZone: TIME_ZONE,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatMoney(value: number) {
  return `${value.toLocaleString('ru-RU').replace(/ /g, ' ')} ₽`
}

// Calendar day in Moscow time as YYYY-MM-DD, so filters match what the admin sees in the table.
export function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat('sv-SE', { timeZone: TIME_ZONE }).format(new Date(value))
}

export function daysAgoKey(days: number) {
  return dayKey(new Date(Date.now() - days * 24 * 60 * 60 * 1000))
}

export function leadAmount(lead: AdminLead) {
  return lead.paymentAmount ?? DEFAULT_PRICE
}

export function botClickLabel(lead: AdminLead) {
  if (lead.source !== 'guide') return '—'
  if (lead.botClickedAt) return 'Перешёл'
  return lead.botClickTracked ? 'Не перешёл' : 'Нет данных'
}

// One person may leave several leads; phone is the most reliable identifier, Telegram the fallback.
export function personKey(lead: AdminLead) {
  const digits = lead.phone.replace(/\D/g, '')
  if (digits.length >= 10) return `phone:${digits.slice(-10)}`
  return `tg:${lead.telegram.trim().replace(/^@/, '').toLowerCase()}`
}

export function inPeriod(lead: AdminLead, from: string, to: string) {
  const day = dayKey(lead.createdAt)
  return (!from || day >= from) && (!to || day <= to)
}

function matchesStatus(lead: AdminLead, status: StatusFilter) {
  switch (status) {
    case 'all': return true
    case 'clicked': return lead.source === 'guide' && lead.botClickedAt !== null
    case 'not_clicked': return lead.source === 'guide' && lead.botClickTracked && lead.botClickedAt === null
    default: return lead.source === 'masterclass' && lead.paymentStatus === status
  }
}

function matchesQuery(lead: AdminLead, query: string) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  const digits = needle.replace(/\D/g, '')
  return lead.name.toLowerCase().includes(needle)
    || lead.telegram.toLowerCase().includes(needle.replace(/^@/, ''))
    || (digits.length >= 3 && lead.phone.replace(/\D/g, '').includes(digits))
}

export function filterLeads(leads: AdminLead[], filters: LeadFilters) {
  return leads.filter((lead) =>
    inPeriod(lead, filters.from, filters.to)
    && (filters.source === 'all' || lead.source === filters.source)
    && matchesStatus(lead, filters.status)
    && matchesQuery(lead, filters.query),
  )
}

export function summarize(leads: AdminLead[]) {
  const guide = leads.filter((lead) => lead.source === 'guide')
  const tracked = guide.filter((lead) => lead.botClickTracked)
  const clicked = guide.filter((lead) => lead.botClickedAt !== null)
  const masterclass = leads.filter((lead) => lead.source === 'masterclass')
  const paid = masterclass.filter((lead) => lead.paymentStatus === 'succeeded')
  return {
    people: new Set(leads.map(personKey)).size,
    guide: guide.length,
    tracked: tracked.length,
    clicked: clicked.length,
    masterclass: masterclass.length,
    paid: paid.length,
    revenue: paid.reduce((sum, lead) => sum + leadAmount(lead), 0),
  }
}

export function percent(part: number, total: number) {
  return total > 0 ? `${Math.round((part / total) * 100)}%` : '—'
}

function csvCell(value: unknown) {
  let text = String(value ?? '')
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`
  return `"${text.replace(/"/g, '""')}"`
}

// A phone like "+7 900…" would be parsed by Excel as a formula; ="…" makes it plain text without a visible quote mark.
function phoneCell(phone: string) {
  return /^[0-9+() .-]+$/.test(phone) ? `"=""${phone}"""` : csvCell(phone)
}

function telegramCell(telegram: string) {
  return csvCell(telegram.trim().replace(/^@/, ''))
}

// Semicolon separator and BOM so Russian-locale Excel opens the file with correct columns and Cyrillic.
export function leadsToCsv(leads: AdminLead[]) {
  const header = ['Дата', 'Тип', 'Имя', 'Телефон', 'Telegram', 'Переход в бота', 'Оплата', 'Сумма', 'Salebot'].map(csvCell)
  const rows = leads.map((lead) => [
    csvCell(formatDateTime(lead.createdAt)),
    csvCell(sourceLabels[lead.source] ?? lead.source),
    csvCell(lead.name),
    phoneCell(lead.phone),
    telegramCell(lead.telegram),
    csvCell(botClickLabel(lead)),
    csvCell(lead.source === 'masterclass' ? paymentLabels[lead.paymentStatus ?? ''] ?? '—' : '—'),
    csvCell(lead.source === 'masterclass' ? leadAmount(lead) : ''),
    csvCell(lead.source === 'masterclass' ? salebotLabels[lead.salebotNotificationStatus ?? ''] ?? '—' : '—'),
  ])
  return `﻿${[header, ...rows].map((row) => row.join(';')).join('\r\n')}`
}
