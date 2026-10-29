export const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'] as const

export type UtmKey = (typeof UTM_KEYS)[number]
export type Utm = Partial<Record<UtmKey, string>>

export type UtmColumns = {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
}

export const utmLabels: Record<UtmKey, string> = {
  utm_source: 'Источник',
  utm_medium: 'Канал',
  utm_campaign: 'Кампания',
  utm_content: 'Объявление',
  utm_term: 'Ключевое слово',
}

export const utmColumnByKey: Record<UtmKey, keyof UtmColumns> = {
  utm_source: 'utmSource',
  utm_medium: 'utmMedium',
  utm_campaign: 'utmCampaign',
  utm_content: 'utmContent',
  utm_term: 'utmTerm',
}

const MAX_LENGTH = 200
const STORAGE_KEY = 'utm'
const TTL_MS = 30 * 24 * 60 * 60 * 1000

// Request bodies are untrusted: keep only known keys with short string values.
export function parseUtm(value: unknown): UtmColumns {
  const input = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const columns = { utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null } as UtmColumns
  for (const key of UTM_KEYS) {
    const raw = input[key]
    const text = typeof raw === 'string' ? raw.trim().slice(0, MAX_LENGTH) : ''
    if (text) columns[utmColumnByKey[key]] = text
  }
  return columns
}

function readUrlUtm(): Utm {
  const params = new URLSearchParams(window.location.search)
  const utm: Utm = {}
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim()
    if (value) utm[key] = value.slice(0, MAX_LENGTH)
  }
  return utm
}

// Last-touch attribution: a visit with UTM tags replaces the stored ones, so a visitor who lands on one
// page and submits the form on another (or comes back later) still carries the source.
export function rememberUtm() {
  const utm = readUrlUtm()
  if (Object.keys(utm).length === 0) return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ utm, savedAt: Date.now() }))
  } catch {}
}

export function currentUtm(): Utm {
  const fromUrl = readUrlUtm()
  if (Object.keys(fromUrl).length > 0) return fromUrl
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null')
    if (stored && typeof stored.savedAt === 'number' && Date.now() - stored.savedAt < TTL_MS && stored.utm && typeof stored.utm === 'object') {
      return stored.utm as Utm
    }
  } catch {}
  return {}
}
