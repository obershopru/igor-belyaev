import { revalidatePath } from 'next/cache'
import { adminError, adminResponse, checkAdminMutation, isAdminRequest, unauthorizedResponse } from '@/lib/admin-auth'
import { isValidMasterclassSettings, readMasterclassSettings, saveMasterclassSettings } from '@/lib/masterclass'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  try {
    return adminResponse({ settings: await readMasterclassSettings() })
  } catch {
    return adminError('Не удалось загрузить настройки.', 503)
  }
}

export async function PUT(request: Request) {
  if (!checkAdminMutation(request)) return unauthorizedResponse()
  if (!process.env.DATABASE_URL) return adminError('База данных не настроена.', 503)

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return adminError('Некорректный запрос.')
  }

  if (!isValidMasterclassSettings(body)) {
    return adminError('Проверьте поля: дата — от 3 до 80 символов, длительность — до 40, цена — целое число от 1 до 1 000 000.')
  }

  try {
    const settings = await saveMasterclassSettings(body)
    revalidatePath('/master')
    return adminResponse({ settings })
  } catch {
    return adminError('Не удалось сохранить настройки.', 503)
  }
}
