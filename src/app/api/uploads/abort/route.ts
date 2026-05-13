import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/upload-session'
import { abortMultipartUpload, validateR2Key } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { uploadId?: string; key?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { uploadId, key } = body

  if (!uploadId || !key) {
    return NextResponse.json({ error: 'uploadId and key are required' }, { status: 400 })
  }

  if (!validateR2Key(key, session.project)) {
    return NextResponse.json({ error: 'Invalid or unauthorized key' }, { status: 403 })
  }

  try {
    await abortMultipartUpload(key, uploadId)
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('R2 abort error:', err)
    // Don't fail hard - the upload will be cleaned up by R2 eventually
    return NextResponse.json({ success: true, warning: 'Abort may have been delayed' })
  }
}
