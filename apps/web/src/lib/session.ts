import { cookies } from 'next/headers'

const COOKIE_NAME = 'session'

export type SessionUser = { sub: string; email: string; role: 'USER' | 'ADMIN'; exp: number }

// El JWT ya lo firma y valida la API — acá solo se lee el payload para
// mostrar datos en la UI y para saber cuándo expira la cookie.
function decodeJwtPayload(token: string): SessionUser | null {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const json = Buffer.from(parts[1], 'base64url').toString('utf8')
    return JSON.parse(json) as SessionUser
  } catch {
    return null
  }
}

export async function getSessionToken(): Promise<string | null> {
  const store = await cookies()
  return store.get(COOKIE_NAME)?.value ?? null
}

export async function getSession(): Promise<{ token: string; user: SessionUser } | null> {
  const token = await getSessionToken()
  if (!token) return null
  const user = decodeJwtPayload(token)
  if (!user || user.exp * 1000 < Date.now()) return null
  return { token, user }
}

export async function setSessionCookie(token: string): Promise<void> {
  const payload = decodeJwtPayload(token)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: payload ? new Date(payload.exp * 1000) : undefined,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
