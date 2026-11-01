import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BlogFooter, BlogHeader } from "@/components/blog-shell"
import { JsonLd } from "@/components/json-ld"
import { getPublishedPost } from "@/lib/blog"
import { formatPostDate } from "@/lib/blog-workflow"
import { countWords, estimateReadingMinutes, extractHeadings, renderMarkdown } from "@/lib/markdown"
import { getMasterclassSettings } from "@/lib/masterclass"
import { PERSON_ID, WEBSITE_ID, absoluteUrl, authorBio, breadcrumbSchema, credentials, graph, personSchema } from "@/lib/seo"

// Pages are built on first visit and cached; publishing from the admin panel revalidates them.
export const revalidate = 3600

export function generateStaticParams() {
  return []
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPost((await params).slug)
  if (!post) return { title: "Статья не найдена — Игорь Беляев" }

  return {
    title: `${post.title} — Игорь Беляев`,
    description: post.excerpt || undefined,
    authors: [{ name: "Игорь Беляев", url: absoluteUrl("/blog") }],
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      authors: ["Игорь Беляев"],
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt || undefined, images: post.coverUrl ? [post.coverUrl] : undefined },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug)
  if (!post) notFound()
  const masterclass = await getMasterclassSettings()

  const url = absoluteUrl(`/blog/${post.slug}`)
  const headings = extractHeadings(post.body)
  const published = post.publishedAt ?? post.createdAt
  // Status changes also touch updatedAt, so only a gap of more than a day counts as a real update.
  const updated = post.updatedAt.getTime() - published.getTime() > 24 * 60 * 60 * 1000 ? post.updatedAt : null

  const structuredData = graph(
    {
      "@type": "BlogPosting",
      "@id": `${url}#article`,
      headline: post.title,
      description: post.excerpt || undefined,
      image: post.coverUrl ? [absoluteUrl(post.coverUrl)] : undefined,
      datePublished: published.toISOString(),
      dateModified: (updated ?? published).toISOString(),
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      mainEntityOfPage: url,
      isPartOf: { "@id": WEBSITE_ID },
      inLanguage: "ru-RU",
      wordCount: countWords(post.body),
      timeRequired: `PT${estimateReadingMinutes(post.body)}M`,
      articleSection: "Переговоры",
      hasPart: headings
        .filter((heading) => heading.level === 2)
        .map((heading) => ({ "@type": "WebPageElement", name: heading.text, url: `${url}#${heading.id}` })),
    },
    breadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Блог", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
    personSchema(),
  )

  return (
    <main className="min-h-dvh bg-black font-sans text-white">
      <JsonLd data={structuredData} />
      <BlogHeader />

      <article className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 md:pt-10">
        <header>
          <nav aria-label="Навигационная цепочка" className="text-sm text-zinc-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li><Link href="/" className="transition-colors hover:text-yellow-400">Главная</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link href="/blog" className="transition-colors hover:text-yellow-400">Блог</Link></li>
            </ol>
          </nav>
          <h1 className="mt-6 text-balance text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]">
            {post.title}
          </h1>
          {post.excerpt && <p className="mt-5 text-pretty text-lg leading-relaxed text-zinc-300">{post.excerpt}</p>}
          <p className="mt-5 flex flex-wrap gap-x-2 text-sm text-zinc-500">
            <span>
              Автор: <a href="#author" rel="author" className="text-zinc-300 transition-colors hover:text-yellow-400">Игорь Беляев</a>
            </span>
            <span aria-hidden="true">·</span>
            <time dateTime={published.toISOString()}>{formatPostDate(published)}</time>
            {updated && (
              <>
                <span aria-hidden="true">·</span>
                <span>обновлено <time dateTime={updated.toISOString()}>{formatPostDate(updated)}</time></span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>{estimateReadingMinutes(post.body)} мин чтения</span>
          </p>
        </header>

        {post.coverUrl && <img src={post.coverUrl} alt={post.title} className="mt-8 w-full rounded-2xl" />}

        {headings.filter((heading) => heading.level === 2).length >= 3 && (
          <nav aria-labelledby="toc-title" className="mt-10 rounded-2xl bg-zinc-950 p-6">
            <h2 id="toc-title" className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">Содержание</h2>
            <ol className="mt-4 flex flex-col gap-2 text-zinc-300">
              {headings
                .filter((heading) => heading.level === 2)
                .map((heading) => (
                  <li key={heading.id}>
                    <a href={`#${heading.id}`} className="transition-colors hover:text-yellow-400">{heading.text}</a>
                  </li>
                ))}
            </ol>
          </nav>
        )}

        <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />

        <aside id="author" aria-labelledby="author-title" className="mt-14 flex flex-col gap-5 rounded-2xl border border-zinc-800 p-6 sm:flex-row md:p-8">
          <img src="/expert.jpg" alt="Игорь Беляев" width={96} height={96} className="h-24 w-24 shrink-0 rounded-full object-cover object-top grayscale" />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-zinc-500">Об авторе</p>
            <h2 id="author-title" className="mt-2 text-xl font-black uppercase tracking-tight">Игорь Беляев</h2>
            <p className="mt-3 leading-relaxed text-zinc-400">{authorBio}</p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Сертификаты: {credentials.slice(0, 3).map((item) => `${item.issuer} (${item.year})`).join(", ")} и другие.
            </p>
          </div>
        </aside>
      </article>

      <section className="mx-5 mb-16 grid gap-6 rounded-2xl bg-zinc-950 p-6 md:mx-auto md:max-w-3xl md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-yellow-400">Мастер-класс · {masterclass.date}</p>
        <h2 className="text-balance text-2xl font-black uppercase leading-[1.02] tracking-[-0.02em] md:text-3xl">
          Уступить нельзя <span className="text-yellow-400">договориться</span>
        </h2>
        <p className="text-pretty leading-relaxed text-zinc-400">
          Два часа практики в Zoom: как обсуждать деньги и условия, выдерживать давление и говорить «нет» без лишней конфронтации.
        </p>
        <Link
          href={`/master?utm_source=blog&utm_medium=article&utm_content=${post.slug}`}
          className="inline-flex h-12 items-center justify-center justify-self-start rounded-full bg-yellow-400 px-7 font-bold text-black transition-opacity hover:opacity-90"
        >
          Подробнее о мастер-классе
        </Link>
      </section>

      <BlogFooter />
    </main>
  )
}
