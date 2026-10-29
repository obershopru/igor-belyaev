import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { siteSettings, siteSettingsKeys } from '@/lib/db/schema'

export type MasterclassSettings = {
  date: string
  duration: string
  price: number
}

export const DEFAULT_MASTERCLASS_PRICE = 9990

export const defaultMasterclassSettings: MasterclassSettings = {
  date: '9 ноября, 19:30',
  duration: '2 часа',
  price: DEFAULT_MASTERCLASS_PRICE,
}

export function formatPrice(price: number) {
  return price.toLocaleString('ru-RU').replace(/ /g, ' ')
}

export function isValidMasterclassSettings(value: unknown): value is MasterclassSettings {
  if (!value || typeof value !== 'object') return false
  const settings = value as Record<string, unknown>
  return typeof settings.date === 'string'
    && settings.date.trim().length >= 3
    && settings.date.length <= 80
    && typeof settings.duration === 'string'
    && settings.duration.trim().length >= 1
    && settings.duration.length <= 40
    && Number.isSafeInteger(settings.price)
    && (settings.price as number) >= 1
    && (settings.price as number) <= 1_000_000
}

// Throws when the database is unavailable — use for payments, where a stale price is worse than an error.
export async function readMasterclassSettings(): Promise<MasterclassSettings> {
  const [setting] = await getDb()
    .select({ value: siteSettings.value })
    .from(siteSettings)
    .where(eq(siteSettings.key, siteSettingsKeys.masterclass))
    .limit(1)
  return isValidMasterclassSettings(setting?.value) ? setting.value : defaultMasterclassSettings
}

// Falls back to defaults — use for rendering pages.
export async function getMasterclassSettings(): Promise<MasterclassSettings> {
  if (!process.env.DATABASE_URL) return defaultMasterclassSettings
  try {
    return await readMasterclassSettings()
  } catch {
    return defaultMasterclassSettings
  }
}

export async function saveMasterclassSettings(settings: MasterclassSettings) {
  const value = { date: settings.date.trim(), duration: settings.duration.trim(), price: settings.price }
  await getDb()
    .insert(siteSettings)
    .values({ key: siteSettingsKeys.masterclass, value, updatedAt: new Date() })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } })
  return value
}
