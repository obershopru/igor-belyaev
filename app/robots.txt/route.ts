import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

// AI search and answer engines are welcome: being quoted by them is the point of the blog.
// A crawler that matches its own group ignores "*", so every group repeats the closed paths.
const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
  'PerplexityBot', 'Perplexity-User',
  'Google-Extended', 'Applebot-Extended',
  'YandexAdditional',
]

const CLOSED = ['/admin', '/api/admin/', '/master/payment']

export function GET() {
  const closed = CLOSED.map((path) => `Disallow: ${path}`).join('\n')
  const groups = [
    `User-agent: *\nAllow: /\n${closed}`,
    // Яндекс склеивает адреса с UTM-метками в один, а не индексирует каждую рекламную ссылку отдельно.
    `User-agent: Yandex\nAllow: /\n${closed}\nClean-param: utm_source&utm_medium&utm_campaign&utm_content&utm_term`,
    ...AI_CRAWLERS.map((agent) => `User-agent: ${agent}\nAllow: /\n${closed}`),
  ]

  const body = `${groups.join('\n\n')}\n\nSitemap: ${SITE_URL}/sitemap.xml\n`
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
}
