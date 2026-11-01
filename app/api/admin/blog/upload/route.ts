import { randomUUID } from 'node:crypto'
import { adminError, adminResponse, checkStaffMutation, unauthorizedResponse } from '@/lib/admin-auth'
import { getDb } from '@/lib/db'
import { blogMedia } from '@/lib/db/schema'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_SIZE = 5 * 1024 * 1024

// The type is taken from the file's signature, not from what the browser claims.
function detectImageType(bytes: Buffer) {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { type: 'image/jpeg', ext: 'jpg' }
  if (bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return { type: 'image/png', ext: 'png' }
  if (bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP') return { type: 'image/webp', ext: 'webp' }
  if (bytes.length >= 6 && /^GIF8[79]a$/.test(bytes.toString('ascii', 0, 6))) return { type: 'image/gif', ext: 'gif' }
  return null
}

export async function POST(request: Request) {
  const role = checkStaffMutation(request)
  if (!role) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  let file: FormDataEntryValue | null
  try {
    file = (await request.formData()).get('file')
  } catch {
    return adminError('Некорректный запрос.')
  }
  if (!(file instanceof File)) return adminError('Выберите файл.')
  if (file.size > MAX_SIZE) return adminError('Картинка больше 5 МБ — уменьшите её перед загрузкой.')

  const data = Buffer.from(await file.arrayBuffer())
  const image = detectImageType(data)
  if (!image) return adminError('Подходят только JPG, PNG, WebP и GIF.')

  try {
    const id = `${randomUUID()}.${image.ext}`
    await getDb().insert(blogMedia).values({ id, contentType: image.type, data, size: data.length, uploadedBy: role })
    return adminResponse({ url: `/api/blog/media/${id}` }, 201)
  } catch {
    return adminError('Не удалось загрузить картинку.', 503)
  }
}
