import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { BlogFooter, BlogHeader } from "@/components/blog-shell"
import { getPublishedPost } from "@/lib/blog"
import { formatPostDate } from "@/lib/blog-workflow"
import { estimateReadingMinutes, renderMarkdown } from "@/lib/markdown"
import { getMasterclassSettings } from "@/lib/masterclass"

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
    metadataBase: new URL(process.env.SITE_URL || "https://belyaevigor.ru"),
    title: `${post.title} — Игорь Беляев`,
    description: post.excerpt || undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || undefined,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverUrl ? [post.coverUrl] : undefined,
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPost((await params).slug)
  if (!post) notFound()
  const masterclass = await getMasterclassSettings()

  return (
    <main className="min-h-dvh bg-black font-sans text-white">
      <BlogHeader />

      <article className="mx-auto w-full max-w-3xl px-5 pb-16 pt-6 md:pt-10">
        <Link href="/blog" className="text-sm text-zinc-500 transition-colors hover:text-yellow-400">
          ← Все статьи
        </Link>
        <h1 className="mt-6 text-balance text-[clamp(2rem,5vw,3.5rem)] font-black uppercase leading-[0.98] tracking-[-0.03em]">
          {post.title}
        </h1>
        <p className="mt-5 text-sm text-zinc-500">
          {formatPostDate(post.publishedAt)} · {estimateReadingMinutes(post.body)} мин чтения
        </p>
        {post.coverUrl && <img src={post.coverUrl} alt="" className="mt-8 w-full rounded-2xl" />}
        <div className="blog-content mt-10" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body) }} />
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
