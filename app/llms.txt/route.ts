import { getPublishedPosts } from '@/lib/blog'
import { buildLlmsTxt } from '@/lib/llms'

// Publishing from the admin panel revalidates this file; the interval is a fallback.
export const revalidate = 3600

export async function GET() {
  return new Response(buildLlmsTxt(await getPublishedPosts()), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
