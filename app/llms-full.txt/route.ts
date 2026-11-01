import { getPublishedPostsWithBody } from '@/lib/blog'
import { buildLlmsFullTxt } from '@/lib/llms'

// Publishing from the admin panel revalidates this file; the interval is a fallback.
export const revalidate = 3600

export async function GET() {
  return new Response(buildLlmsFullTxt(await getPublishedPostsWithBody()), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
