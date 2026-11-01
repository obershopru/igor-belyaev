import { getPublishedPostsWithBody } from '@/lib/blog'
import { renderMarkdown } from '@/lib/markdown'
import { SITE_URL, absoluteUrl } from '@/lib/seo'

// Publishing from the admin panel revalidates the feed; the interval is a fallback.
export const revalidate = 3600

function escapeXml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Feed readers and aggregators (Дзен, Feedly) open links outside the site, so relative URLs are made absolute.
function absolutizeHtml(html: string) {
  return html.replace(/(src|href)="(\/(?!\/)[^"]*)"/g, (_, attribute: string, path: string) => `${attribute}="${absoluteUrl(path)}"`)
}

export async function GET() {
  const posts = await getPublishedPostsWithBody()
  const items = posts.map((post) => {
    const url = absoluteUrl(`/blog/${post.slug}`)
    const cover = post.coverUrl ? `<p><img src="${escapeXml(absoluteUrl(post.coverUrl))}" alt="" /></p>` : ''
    const html = `${cover}${absolutizeHtml(renderMarkdown(post.body))}`
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${(post.publishedAt ?? post.createdAt).toUTCString()}</pubDate>
      <dc:creator>Игорь Беляев</dc:creator>
      <description>${escapeXml(post.excerpt)}</description>
      <content:encoded><![CDATA[${html.replace(/]]>/g, ']]]]><![CDATA[>')}]]></content:encoded>
    </item>`
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Блог Игоря Беляева о переговорах</title>
    <link>${SITE_URL}/blog</link>
    <description>Статьи эксперта по переговорам Игоря Беляева: цена, скидки, давление, сложные клиенты.</description>
    <language>ru</language>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
${items.join('\n')}
  </channel>
</rss>
`
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } })
}
