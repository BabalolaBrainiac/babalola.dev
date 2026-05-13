import { NextRequest, NextResponse } from 'next/server'
import { getSessionFromRequest } from '@/lib/upload-session'
import { validateFileType, buildR2Key, initiateMultipartUpload, PART_SIZE, MAX_FILE_SIZE } from '@/lib/r2'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { filename?: string; contentType?: string; size?: number; project?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { filename, contentType, size, project } = body

  if (!filename || !contentType || size == null) {
    return NextResponse.json({ error: 'filename, contentType, and size are required' }, { status: 400 })
  }

  // Confirm project matches the session token
  const targetProject = project || session.project
  if (targetProject !== session.project) {
    return NextResponse.json({ error: 'Project does not match your upload token' }, { status: 403 })
  }

  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024 / 1024}GB` }, { status: 413 })
  }

  const validation = validateFileType(filename, contentType)
  if (!validation.valid) {
    return NextResponse.json({ error: validation.error }, { status: 415 })
  }

  const key = buildR2Key(session.project, filename)

  try {
    const { uploadId } = await initiateMultipartUpload(key, contentType)
    return NextResponse.json({
      uploadId,
      key,
      partSize:   PART_SIZE,
      totalParts: Math.ceil(size / PART_SIZE),
    })
  } catch (err) {
    console.error('R2 initiate error:', err)
    return NextResponse.json({ error: 'Failed to initiate upload' }, { status: 500 })
  }
}
