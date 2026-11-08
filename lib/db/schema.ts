import { bigint, customType, index, integer, jsonb, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core'

const bytea = customType<{ data: Buffer }>({ dataType: () => 'bytea' })

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
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  utmTerm: text('utm_term'),
})

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const blogPosts = pgTable('blog_posts', {
  id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull().default(''),
  coverUrl: text('cover_url'),
  body: text('body').notNull().default(''),
  status: text('status').notNull().default('draft'),
  reviewComment: text('review_comment'),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  submittedAt: timestamp('submitted_at', { withTimezone: true }),
  publishedAt: timestamp('published_at', { withTimezone: true }),
}, (table) => [
  uniqueIndex('blog_posts_slug_idx').on(table.slug),
  index('blog_posts_status_published_idx').on(table.status, table.publishedAt),
])

// Blog images live in the database so they survive redeploys and a move to another host.
export const blogMedia = pgTable('blog_media', {
  id: text('id').primaryKey(),
  contentType: text('content_type').notNull(),
  data: bytea('data').notNull(),
  size: integer('size').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type BlogPost = typeof blogPosts.$inferSelect

export type WorkshopLead = typeof workshopLeads.$inferSelect
export type NewWorkshopLead = typeof workshopLeads.$inferInsert
export type SiteSetting = typeof siteSettings.$inferSelect

export type SiteSettingKey = 'site_content' | 'analytics_settings' | 'masterclass' | 'masterclass_copy'

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
  masterclassCopy: 'masterclass_copy',
} as const
