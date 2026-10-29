import { createHmac, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'

const COOKIE_NAME = 'site_admin_session'
const SESSION_DURATION_SECONDS = 60 * 60 * 12
const CACHE_HEADERS = { 'Cache-Control': 'no-store, private' }

function getPassword() {
  return process.env.LEADS_EXPORT_PASSWORD
}

function safeEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left)
  const rightBytes = Buffer.from(right)
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes)
}

function sign(payload: string, secret: string) {
  return createHmac('sha256', `${secret}:site-admin-session:v1`).update(payload).digest('base64url')
}

export function isAdminConfigured() {
  return Boolean(getPassword())
}

export function verifyAdminCredentials(username: unknown, password: unknown) {
  const expectedPassword = getPassword()
  return username === 'admin' && typeof password === 'string' && Boolean(expectedPassword) && safeEqual(password, expectedPassword!)
}

export function createAdminSession() {
  const secret = getPassword()
  if (!secret) throw new Error('Admin password is not configured')
  const maxAge = SESSION_DURATION_SECONDS
  const payload = `admin:${Math.floor(Date.now() / 1000) + maxAge}`
  return { token: `${payload}.${sign(payload, secret)}`, maxAge }
}

function verifyToken(token: string | undefined) {
  const secret = getPassword()
  if (!secret || !token) return false

  const separator = token.lastIndexOf('.')
  if (separator < 0) return false
  const payload = token.slice(0, separator)
  const signature = token.slice(separator + 1)
  const [username, expiresAt] = payload.split(':')
  const expiry = Number(expiresAt)

  if (username !== 'admin' || !Number.isSafeInteger(expiry) || expiry <= Math.floor(Date.now() / 1000)) return false
  return safeEqual(signature, sign(payload, secret))
}

export function isAdminToken(token: string | undefined) {
  return verifyToken(token)
}

export function isAdminRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookie = cookieHeader.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE_NAME}=`))
  if (!cookie) return false

  try {
    return verifyToken(decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)))
  } catch {
    return false
  }
}

export function hasAdminAccess(request: Request) {
  if (isAdminRequest(request)) return true
  const password = getPassword()
  const authorization = request.headers.get('authorization')
  if (!password || !authorization?.startsWith('Basic ')) return false

  try {
    const credentials = Buffer.from(authorization.slice(6), 'base64').toString('utf8')
    const separator = credentials.indexOf(':')
    return separator >= 0 && credentials.slice(0, separator) === 'admin' && safeEqual(credentials.slice(separator + 1), password)
  } catch {
    return false
  }
}

export function hasSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  if (!origin) return false

  try {
    const url = new URL(request.url)
    const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0].trim()
    const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
    const host = forwardedHost || request.headers.get('host') || url.host
    const protocol = forwardedProto || url.protocol.slice(0, -1)
    return new URL(origin).origin === new URL(`${protocol}://${host}`).origin
  } catch {
    return false
  }
}

export function checkAdminMutation(request: Request) {
  return hasSameOrigin(request) && isAdminRequest(request)
}

export function setAdminCookie(response: NextResponse, token: string, maxAge: number) {
  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge,
  })
}

export function clearAdminCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 0,
  })
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Требуется вход в админ-панель.' }, { status: 401, headers: CACHE_HEADERS })
}

export function adminResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status, headers: CACHE_HEADERS })
}

export function adminError(message: string, status = 400) {
  return adminResponse({ error: message }, status)
}

export { COOKIE_NAME, SESSION_DURATION_SECONDS }
