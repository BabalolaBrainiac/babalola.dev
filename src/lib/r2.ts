import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { createHmac } from 'crypto'

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const BUCKET = process.env.R2_UPLOADS_BUCKET_NAME!

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId:     process.env.CF_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CF_R2_SECRET_ACCESS_KEY!,
  },
})

export const ALLOWED_EXTENSIONS = new Set([
  'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'heic', 'heif', 'tiff', 'tif',
  'mp4', 'mov', 'mpeg', 'mpg', 'webm', 'mkv',
  'pdf',
  'mp3', 'wav', 'aac', 'm4a',
])

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif',
  'image/heic', 'image/heif', 'image/tiff',
  'video/mp4', 'video/quicktime', 'video/mpeg', 'video/webm', 'video/x-matroska',
  'application/pdf',
  'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/mp4',
])

export const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024 // 2GB
export const PART_SIZE     = 10 * 1024 * 1024        // 10MB per chunk

export function sanitizeFilename(originalName: string): string {
  const parts = originalName.split('.')
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : ''
  const base = parts.join('.')
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 100) || 'file'

  return ext ? `${base}.${ext}` : base
}

export function buildR2Key(project: string, filename: string): string {
  const timestamp = Date.now()
  const safe = sanitizeFilename(filename)
  return `uploads/${project}/${timestamp}-${safe}`
}

// Validates a client-supplied key has the expected shape and contains no path traversal
const R2_KEY_RE = /^uploads\/[a-z0-9_-]+\/\d+-[a-z0-9_.-]+$/
export function validateR2Key(key: string, project: string): boolean {
  return (
    R2_KEY_RE.test(key) &&
    key.startsWith(`uploads/${project}/`) &&
    !key.includes('..') &&
    !key.includes('//')
  )
}

export function publicUrl(key: string): string {
  const base = process.env.R2_UPLOADS_PUBLIC_URL?.replace(/\/$/, '')
  return `${base}/${key}`
}

export function validateFileType(filename: string, contentType: string): { valid: boolean; error?: string } {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `File type .${ext} is not allowed` }
  }
  const mimeBase = contentType.split(';')[0].trim().toLowerCase()
  if (!ALLOWED_MIME_TYPES.has(mimeBase)) {
    return { valid: false, error: `MIME type ${mimeBase} is not allowed` }
  }
  return { valid: true }
}

export async function initiateMultipartUpload(key: string, contentType: string): Promise<{ uploadId: string }> {
  const cmd = new CreateMultipartUploadCommand({
    Bucket:      BUCKET,
    Key:         key,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable',
  })
  const res = await r2Client.send(cmd)
  if (!res.UploadId) throw new Error('No UploadId returned from R2')
  return { uploadId: res.UploadId }
}

export async function getPresignedPartUrl(key: string, uploadId: string, partNumber: number): Promise<string> {
  const cmd = new UploadPartCommand({
    Bucket:     BUCKET,
    Key:        key,
    UploadId:   uploadId,
    PartNumber: partNumber,
  })
  return getSignedUrl(r2Client, cmd, { expiresIn: 3600 })
}

export async function completeMultipartUpload(
  key: string,
  uploadId: string,
  parts: { PartNumber: number; ETag: string }[]
): Promise<void> {
  const cmd = new CompleteMultipartUploadCommand({
    Bucket:          BUCKET,
    Key:             key,
    UploadId:        uploadId,
    MultipartUpload: { Parts: parts },
  })
  await r2Client.send(cmd)
}

export async function abortMultipartUpload(key: string, uploadId: string): Promise<void> {
  const cmd = new AbortMultipartUploadCommand({
    Bucket:   BUCKET,
    Key:      key,
    UploadId: uploadId,
  })
  await r2Client.send(cmd)
}

export function hashToken(rawToken: string): string {
  return createHmac('sha256', process.env.UPLOAD_TOKEN_HMAC_SECRET!)
    .update(rawToken)
    .digest('hex')
}
