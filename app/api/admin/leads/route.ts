import { desc } from 'drizzle-orm'
import { adminError, adminResponse, isAdminRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { getDb } from '@/lib/db'
import { workshopLeads } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_LEADS = 10000

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  try {
    const rows = await getDb()
      .select({
        id: workshopLeads.id,
        createdAt: workshopLeads.createdAt,
        source: workshopLeads.source,
        name: workshopLeads.name,
        phone: workshopLeads.phone,
        telegram: workshopLeads.telegram,
        botClickKey: workshopLeads.botClickKey,
        botClickedAt: workshopLeads.botClickedAt,
        paymentStatus: workshopLeads.paymentStatus,
        paymentAmount: workshopLeads.paymentAmount,
        salebotNotificationStatus: workshopLeads.salebotNotificationStatus,
        utmSource: workshopLeads.utmSource,
        utmMedium: workshopLeads.utmMedium,
        utmCampaign: workshopLeads.utmCampaign,
        utmContent: workshopLeads.utmContent,
        utmTerm: workshopLeads.utmTerm,
      })
      .from(workshopLeads)
      .orderBy(desc(workshopLeads.createdAt))
      .limit(MAX_LEADS)
    // Guide leads created before click tracking have no key: their bot visits are unknown, not absent.
    const leads = rows.map(({ botClickKey, ...lead }) => ({ ...lead, botClickTracked: botClickKey !== null }))
    return adminResponse({ leads })
  } catch {
    return adminError('Не удалось загрузить заявки.', 503)
  }
}
