// Minimal Markdown for blog posts: headings, paragraphs, lists, quotes, images, links, bold, italic, code.
// Raw HTML is always escaped, so an article cannot inject scripts into the site.

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Expects an already escaped URL; anything but http(s), mailto, tel and site-relative links is dropped.
function safeUrl(url: string) {
  const trimmed = url.trim()
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(trimmed) ? trimmed : null
}

function isExternal(url: string) {
  return /^https?:\/\//i.test(url) && !/^https?:\/\/(www\.)?belyaevigor\.ru(\/|$)/i.test(url)
}

function renderInline(escaped: string) {
  // Finished tags are parked in placeholders so emphasis rules never touch URLs such as utm_source.
  const parked: string[] = []
  const park = (html: string) => {
    parked.push(html)
    return `\u0000${parked.length - 1}\u0000`
  }

  let text = escaped.replace(/`([^`]+)`/g, (_, code: string) => park(`<code>${code}</code>`))
  text = text.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (match, alt: string, url: string) => {
    const src = safeUrl(url)
    return src ? park(`<img src="${src}" alt="${alt}" loading="lazy" />`) : match
  })
  text = text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (match, label: string, url: string) => {
    const href = safeUrl(url)
    if (!href) return match
    const target = isExternal(href) ? ' target="_blank" rel="noopener noreferrer"' : ''
    return `${park(`<a href="${href}"${target}>`)}${label}${park('</a>')}`
  })
  text = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/(^|[^\p{L}\p{N}_])_(?!\s)(.+?)_(?![\p{L}\p{N}_])/gu, '$1<em>$2</em>')

  return text.replace(/\u0000(\d+)\u0000/g, (_, index: string) => parked[Number(index)])
}

type Block = { type: 'p' | 'quote' | 'ul' | 'ol'; lines: string[] }

export function renderMarkdown(source: string) {
  const html: string[] = []
  let block: Block | null = null

  const flush = () => {
    if (!block) return
    if (block.type === 'p') html.push(`<p>${block.lines.map(renderInline).join('<br />')}</p>`)
    if (block.type === 'quote') html.push(`<blockquote><p>${block.lines.map(renderInline).join('<br />')}</p></blockquote>`)
    if (block.type === 'ul' || block.type === 'ol') {
      html.push(`<${block.type}>${block.lines.map((line) => `<li>${renderInline(line)}</li>`).join('')}</${block.type}>`)
    }
    block = null
  }

  const append = (type: Block['type'], line: string) => {
    if (block?.type !== type) {
      flush()
      block = { type, lines: [] }
    }
    block!.lines.push(line)
  }

  for (const rawLine of escapeHtml(source.replace(/\r\n/g, '\n')).split('\n')) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()
    let match: RegExpMatchArray | null

    if (!trimmed) {
      flush()
    } else if ((match = trimmed.match(/^(#{1,6})\s+(.+)$/))) {
      flush()
      // The post title is the page's h1, so headings in the body start at h2.
      const level = Math.min(Math.max(match[1].length, 2), 4)
      html.push(`<h${level}>${renderInline(match[2])}</h${level}>`)
    } else if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flush()
      html.push('<hr />')
    } else if ((match = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
      flush()
      const src = safeUrl(match[2])
      if (src) {
        const caption = match[1] ? `<figcaption>${match[1]}</figcaption>` : ''
        html.push(`<figure><img src="${src}" alt="${match[1]}" loading="lazy" />${caption}</figure>`)
      }
    } else if ((match = trimmed.match(/^&gt;\s?(.*)$/))) {
      append('quote', match[1])
    } else if ((match = trimmed.match(/^[-*+]\s+(.+)$/))) {
      append('ul', match[1])
    } else if ((match = trimmed.match(/^\d+[.)]\s+(.+)$/))) {
      append('ol', match[1])
    } else {
      append('p', trimmed)
    }
  }
  flush()
  return html.join('\n')
}

export function estimateReadingMinutes(source: string) {
  const words = source.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 180))
}
