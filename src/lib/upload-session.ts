import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'upload_session'

function secret() {
  return new TextEncoder().encode(process.env.UPLOAD_SESSION_SECRET!)
}

export interface UploadSession {
  tokenId: string
  project: string
  exp:     number
}

export async function createUploadSession(tokenId: string, project: string, expiresAt: Date): Promise<string> {
  return new SignJWT({ tokenId, project })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
    .setIssuedAt()
    .sign(secret())
}

export async function verifyUploadSession(token: string): Promise<UploadSession | null> {
  try {
    const { payload } = await jwtVerify(token, secret())
    return payload as unknown as UploadSession
  } catch {
    return null
  }
}

export async function getSessionFromRequest(request: Request): Promise<UploadSession | null> {
  const cookieHeader = request.headers.get('cookie') || ''
  const match = cookieHeader.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`))
  if (!match) return null
  const token = match.split('=').slice(1).join('=').trim()
  return verifyUploadSession(token)
}

export async function getSessionFromCookies(): Promise<UploadSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null
  return verifyUploadSession(token)
}

export function sessionCookieOptions(expiresAt: Date) {
  return {
    name:     COOKIE_NAME,
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path:     '/',
    expires:  expiresAt,
  }
}
