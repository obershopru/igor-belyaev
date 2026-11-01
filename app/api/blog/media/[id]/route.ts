import { eq } from 'drizzle-orm'
import { getDb } from '@/lib/db'
import { blogMedia } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ID_PATTERN = /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!ID_PATTERN.test(id) || !process.env.DATABASE_URL) return new Response('Not found', { status: 404 })

  try {
    const [media] = await getDb()
      .select({ contentType: blogMedia.contentType, data: blogMedia.data })
      .from(blogMedia)
      .where(eq(blogMedia.id, id))
      .limit(1)
    if (!media) return new Response('Not found', { status: 404 })

    // Every upload gets a new id, so the file behind a URL never changes.
    return new Response(new Uint8Array(media.data), {
      headers: {
        'Content-Type': media.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Security-Policy': "default-src 'none'",
      },
    })
  } catch {
    return new Response('Unavailable', { status: 503 })
  }
}
