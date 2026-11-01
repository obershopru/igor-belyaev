import { revalidatePath } from 'next/cache'
import { and, desc, eq, ne } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { type BlogPost, blogPosts } from '@/lib/db/schema'
import { SLUG_PATTERN } from '@/lib/blog-workflow'

export async function isSlugTaken(slug: string, exceptId?: number) {
  const condition = exceptId === undefined ? eq(blogPosts.slug, slug) : and(eq(blogPosts.slug, slug), ne(blogPosts.id, exceptId))
  const [row] = await getDb().select({ id: blogPosts.id }).from(blogPosts).where(condition).limit(1)
  return Boolean(row)
}

export async function getPostById(id: number) {
  const [post] = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id)).limit(1)
  return post ?? null
}

export type PublishedPostSummary = Pick<BlogPost, 'slug' | 'title' | 'excerpt' | 'coverUrl' | 'publishedAt'>

// Public pages fall back to an empty blog when the database is unavailable, like the masterclass page does.
export async function getPublishedPosts(): Promise<PublishedPostSummary[]> {
  if (!process.env.DATABASE_URL) return []
  try {
    return await getDb()
      .select({
        slug: blogPosts.slug,
        title: blogPosts.title,
        excerpt: blogPosts.excerpt,
        coverUrl: blogPosts.coverUrl,
        publishedAt: blogPosts.publishedAt,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt))
  } catch {
    return []
  }
}

export async function getPublishedPost(slug: string) {
  if (!process.env.DATABASE_URL || !SLUG_PATTERN.test(slug)) return null
  try {
    const [post] = await getDb()
      .select()
      .from(blogPosts)
      .where(and(eq(blogPosts.slug, slug), eq(blogPosts.status, 'published')))
      .limit(1)
    return post ?? null
  } catch {
    return null
  }
}

export function revalidateBlog(...slugs: string[]) {
  revalidatePath('/blog')
  for (const slug of new Set(slugs)) revalidatePath(`/blog/${slug}`)
}

export function parsePostId(value: string) {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0 ? id : null
}
