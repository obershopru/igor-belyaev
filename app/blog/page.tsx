import type { Metadata } from "next"
import Link from "next/link"
import { BlogFooter, BlogHeader } from "@/components/blog-shell"
import { JsonLd } from "@/components/json-ld"
import { getPublishedPosts } from "@/lib/blog"
import { formatPostDate } from "@/lib/blog-workflow"
import { PERSON_ID, WEBSITE_ID, absoluteUrl, breadcrumbSchema, graph, personSchema } from "@/lib/seo"

const description = "Статьи Игоря Беляева о переговорах и продажах: как обсуждать деньги, выдерживать давление и договариваться на своих условиях."

export const metadata: Metadata = {
  title: "Блог о переговорах — Игорь Беляев",
  description,
  alternates: { canonical: "/blog", types: { "application/rss+xml": "/blog/rss.xml" } },
  openGraph: { type: "website", title: "Блог о переговорах — Игорь Беляев", description, url: "/blog" },
}

// Publishing from the admin panel revalidates the list; the interval is a fallback.
export const revalidate = 300

export default async function BlogPage() {
  const posts = await getPublishedPosts()
  const [featured, ...rest] = posts
  const structuredData = graph(
    {
      "@type": "Blog",
      "@id": absoluteUrl("/blog#blog"),
      url: absoluteUrl("/blog"),
      name: "Блог о переговорах",
      description,
      inLanguage: "ru-RU",
      author: { "@id": PERSON_ID },
      publisher: { "@id": PERSON_ID },
      isPartOf: { "@id": WEBSITE_ID },
      blogPost: posts.map((post) => ({
        "@type": "BlogPosting",
        "@id": absoluteUrl(`/blog/${post.slug}#article`),
        headline: post.title,
        url: absoluteUrl(`/blog/${post.slug}`),
        datePublished: post.publishedAt?.toISOString(),
        image: post.coverUrl ? absoluteUrl(post.coverUrl) : undefined,
        author: { "@id": PERSON_ID },
      })),
    },
    breadcrumbSchema([
      { name: "Главная", path: "/" },
      { name: "Блог", path: "/blog" },
    ]),
    personSchema(),
  )

  return (
    <main className="min-h-dvh bg-black font-sans text-white">
      <JsonLd data={structuredData} />
      <BlogHeader />

      <section className="px-5 pb-10 pt-6 md:px-10 md:pb-14 md:pt-10">
        <h1 className="text-balance text-[clamp(2.25rem,6vw,4.5rem)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
          Блог о <span className="text-yellow-400">переговорах</span>
        </h1>
        <p className="mt-5 max-w-[52ch] text-pretty text-lg leading-relaxed text-zinc-400">
          Разбираю реальные ситуации из переговоров и продаж: что говорить, когда давят, как обсуждать деньги и не уступать лишнего.
        </p>
      </section>

      {posts.length === 0 ? (
        <p className="mx-5 rounded-2xl bg-zinc-950 p-8 text-zinc-400 md:mx-10">Первые статьи скоро появятся.</p>
      ) : (
        <section className="flex flex-col gap-6 px-5 pb-16 md:px-10">
          <Link href={`/blog/${featured.slug}`} className="group grid overflow-hidden rounded-2xl bg-zinc-950 lg:grid-cols-[1.2fr_1fr]">
            {featured.coverUrl ? (
              <img src={featured.coverUrl} alt={featured.title} className="aspect-video h-full w-full object-cover transition-opacity group-hover:opacity-90" />
            ) : (
              <div className="hidden lg:block" />
            )}
            <div className="flex flex-col justify-center gap-4 p-6 md:p-10">
              <time dateTime={featured.publishedAt?.toISOString()} className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{formatPostDate(featured.publishedAt)}</time>
              <h2 className="text-balance text-2xl font-black uppercase leading-[1.02] tracking-[-0.02em] transition-colors group-hover:text-yellow-400 md:text-4xl">
                {featured.title}
              </h2>
              {featured.excerpt && <p className="text-pretty leading-relaxed text-zinc-400">{featured.excerpt}</p>}
              <span className="text-sm font-bold text-yellow-400">Читать →</span>
            </div>
          </Link>

          {rest.length > 0 && (
            <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col overflow-hidden rounded-2xl bg-zinc-950">
                    {post.coverUrl && <img src={post.coverUrl} alt={post.title} loading="lazy" className="aspect-video w-full object-cover transition-opacity group-hover:opacity-90" />}
                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <time dateTime={post.publishedAt?.toISOString()} className="text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">{formatPostDate(post.publishedAt)}</time>
                      <h2 className="text-balance text-xl font-black uppercase leading-[1.05] tracking-[-0.01em] transition-colors group-hover:text-yellow-400">
                        {post.title}
                      </h2>
                      {post.excerpt && <p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{post.excerpt}</p>}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <BlogFooter />
    </main>
  )
}
