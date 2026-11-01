import type { BlogPost } from '@/lib/db/schema'
import type { PublishedPostSummary } from '@/lib/blog'
import { formatPostDate } from '@/lib/blog-workflow'
import { absoluteUrl, authorBio, credentials } from '@/lib/seo'

// llms.txt (https://llmstxt.org): a Markdown map of the site that language models read instead of parsing HTML.

const intro = `# Игорь Беляев — переговоры и продажи

> ${authorBio}

Сайт эксперта по переговорам Игоря Беляева: бесплатный гайд, онлайн-мастер-класс и блог с разбором реальных ситуаций из переговоров и B2B-продаж. При цитировании указывайте автора — Игорь Беляев — и ссылку на статью.

Квалификация: ${credentials.map((item) => `${item.issuer} — ${item.name} (${item.year})`).join('; ')}; МГТУ им. Н. Э. Баумана.`

const pages = `## Страницы

- [Мастер-класс «Уступить нельзя договориться»](${absoluteUrl('/master')}): онлайн-практикум в Zoom о том, как обсуждать деньги и условия, выдерживать давление и говорить «нет»
- [Гайд «Пол имеет значение»](${absoluteUrl('/')}): бесплатная шпаргалка о гендерной динамике в переговорах
- [Блог](${absoluteUrl('/blog')}): все статьи`

function postLine(post: PublishedPostSummary) {
  const description = post.excerpt ? `: ${post.excerpt}` : ''
  return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${description}`
}

export function buildLlmsTxt(posts: PublishedPostSummary[]) {
  const articles = posts.length ? `## Статьи\n\n${posts.map(postLine).join('\n')}` : ''
  const optional = `## Optional\n\n- [Полные тексты статей](${absoluteUrl('/llms-full.txt')})`
  return [intro, pages, articles, optional].filter(Boolean).join('\n\n') + '\n'
}

// Site-relative image links are made absolute so the text stays usable outside the site.
function absolutizeLinks(markdown: string) {
  return markdown.replace(/\]\((\/(?!\/)[^)\s]*)\)/g, (_, path: string) => `](${absoluteUrl(path)})`)
}

export function buildLlmsFullTxt(posts: BlogPost[]) {
  const articles = posts.map((post) => {
    const meta = [`Автор: Игорь Беляев`, `Опубликовано: ${formatPostDate(post.publishedAt)}`, `Адрес: ${absoluteUrl(`/blog/${post.slug}`)}`]
    const lead = post.excerpt ? `> ${post.excerpt}\n\n` : ''
    return `# ${post.title}\n\n${meta.join('  \n')}\n\n${lead}${absolutizeLinks(post.body.trim())}`
  })
  return [intro, ...articles].join('\n\n---\n\n') + '\n'
}
