import type { MetadataRoute } from 'next'
import { getPublishedPosts } from '@/lib/blog'
import { absoluteUrl } from '@/lib/seo'

// Publishing from the admin panel revalidates the sitemap; the interval is a fallback.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPublishedPosts()
  const latest = posts.reduce<Date | undefined>((max, post) => (!max || post.updatedAt > max ? post.updatedAt : max), undefined)

  return [
    { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
    { url: absoluteUrl('/master'), changeFrequency: 'weekly', priority: 0.9 },
    { url: absoluteUrl('/blog'), lastModified: latest, changeFrequency: 'weekly', priority: 0.8 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      images: post.coverUrl ? [absoluteUrl(post.coverUrl)] : undefined,
    })),
  ]
}
