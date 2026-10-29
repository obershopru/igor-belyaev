// Idempotent schema changes. Run once per deploy: node --env-file=.env.production scripts/migrate.mjs
import pg from 'pg'

const statements = [
  `ALTER TABLE workshop_leads ADD COLUMN IF NOT EXISTS payment_amount integer`,
  `ALTER TABLE workshop_leads ADD COLUMN IF NOT EXISTS bot_click_key text`,
  `ALTER TABLE workshop_leads ADD COLUMN IF NOT EXISTS bot_clicked_at timestamptz`,
  `CREATE UNIQUE INDEX IF NOT EXISTS workshop_leads_bot_click_key_idx ON workshop_leads (bot_click_key)`,
  `CREATE INDEX IF NOT EXISTS workshop_leads_created_at_idx ON workshop_leads (created_at)`,
]

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not configured')
  process.exit(1)
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL })
await client.connect()
try {
  for (const statement of statements) {
    await client.query(statement)
    console.log(`ok: ${statement}`)
  }
} finally {
  await client.end()
}
