import { bigint, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export const workshopLeads = pgTable('workshop_leads', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  telegram: text('telegram').notNull(),
  consentAt: timestamp('consent_at', { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  source: text('source').notNull().default('masterclass'),
  checkoutKey: text('checkout_key'),
  yookassaPaymentId: text('yookassa_payment_id'),
  paymentStatus: text('payment_status'),
  paymentConfirmationUrl: text('payment_confirmation_url'),
  salebotNotificationStatus: text('salebot_notification_status'),
  salebotNotificationUpdatedAt: timestamp('salebot_notification_updated_at', { withTimezone: true }),
  salebotClientId: text('salebot_client_id'),
  paymentAmount: integer('payment_amount'),
  botClickKey: text('bot_click_key'),
  botClickedAt: timestamp('bot_clicked_at', { withTimezone: true }),
})

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export type WorkshopLead = typeof workshopLeads.$inferSelect
export type NewWorkshopLead = typeof workshopLeads.$inferInsert
export type SiteSetting = typeof siteSettings.$inferSelect

export type SiteSettingKey = 'site_content' | 'analytics_settings' | 'masterclass'

export const defaultSettingKeys: SiteSettingKey[] = ['site_content', 'analytics_settings']

export const contentDefaults = {
  siteContent: null,
  analyticsSettings: null,
}

export type SiteSettingsValue = Record<string, unknown>

export const siteSettingsKeys = {
  content: 'site_content',
  analytics: 'analytics_settings',
  masterclass: 'masterclass',
} as const
