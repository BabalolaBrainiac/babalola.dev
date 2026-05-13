import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { hashToken, ALLOWED_EXTENSIONS } from '@/lib/r2'
import { createUploadSession, sessionCookieOptions } from '@/lib/upload-session'

const MAX_ATTEMPTS_PER_HOUR = 5

export async function POST(request: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 })
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'

  // Rate limit: max 5 failed attempts per IP per hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count: failedCount } = await supabase
    .from('upload_rate_limits')
    .select('*', { count: 'exact', head: true })
    .eq('ip', ip)
    .eq('success', false)
    .gte('created_at', oneHourAgo)

  if ((failedCount ?? 0) >= MAX_ATTEMPTS_PER_HOUR) {
    return NextResponse.json(
      { error: 'Too many failed attempts. Try again in 1 hour.' },
      { status: 429 }
    )
  }

  let body: { token?: string; project?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const rawToken = (body.token || '').replace(/-/g, '').toUpperCase().trim()
  if (!rawToken || rawToken.length < 8) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const tokenHash = hashToken(rawToken)

  const now = new Date().toISOString()
  const { data: tokenRow, error } = await supabase
    .from('upload_tokens')
    .select('id, project, expires_at, used_at')
    .eq('token_hash', tokenHash)
    .gt('expires_at', now)
    .is('used_at', null)
    .single()

  const recordAttempt = (success: boolean) =>
    supabase!.from('upload_rate_limits').insert({ ip, success })

  if (error || !tokenRow) {
    await recordAttempt(false)
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
  }

  await recordAttempt(true)

  const expiresAt = new Date(tokenRow.expires_at)
  const sessionJwt = await createUploadSession(tokenRow.id, tokenRow.project, expiresAt)

  const response = NextResponse.json({
    success: true,
    project: tokenRow.project,
    expiresAt: tokenRow.expires_at,
  })

  response.cookies.set({
    ...sessionCookieOptions(expiresAt),
    value: sessionJwt,
  })

  return response
}
