import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/upload-session'
import { getPresignedPartUrl, validateR2Key } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { uploadId?: string; key?: string; partNumber?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { uploadId, key, partNumber } = body

  if (!uploadId || !key || partNumber == null) {
    return NextResponse.json({ error: 'uploadId, key, and partNumber are required' }, { status: 400 })
  }

  if (!validateR2Key(key, session.project)) {
    return NextResponse.json({ error: 'Invalid or unauthorized key' }, { status: 403 })
  }

  if (partNumber < 1 || partNumber > 10000) {
    return NextResponse.json({ error: 'Invalid part number (1-10000)' }, { status: 400 })
  }

  try {
    const url = await getPresignedPartUrl(key, uploadId, partNumber)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('R2 presign error:', err)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
