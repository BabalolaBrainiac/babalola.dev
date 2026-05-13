import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/upload-session'
import { completeMultipartUpload, publicUrl, validateR2Key } from '@/lib/r2'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    uploadId?: string
    key?: string
    parts?: { PartNumber: number; ETag: string }[]
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { uploadId, key, parts } = body

  if (!uploadId || !key || !parts?.length) {
    return NextResponse.json({ error: 'uploadId, key, and parts are required' }, { status: 400 })
  }

  if (!validateR2Key(key, session.project)) {
    return NextResponse.json({ error: 'Invalid or unauthorized key' }, { status: 403 })
  }

  // Validate parts
  const validParts = parts.filter(p =>
    Number.isInteger(p.PartNumber) && p.PartNumber >= 1 &&
    typeof p.ETag === 'string' && p.ETag.length > 0
  )
  if (validParts.length !== parts.length) {
    return NextResponse.json({ error: 'Invalid parts array' }, { status: 400 })
  }

  try {
    await completeMultipartUpload(key, uploadId, validParts)
  } catch (err) {
    console.error('R2 complete error:', err)
    return NextResponse.json({ error: 'Failed to complete upload. Your token remains valid - you can retry.' }, { status: 500 })
  }

  return NextResponse.json({
    success:   true,
    publicUrl: publicUrl(key),
    key,
  })
}
