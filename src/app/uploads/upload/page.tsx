'use client'

import { useState, useCallback, useRef, DragEvent, ChangeEvent } from 'react'
import { useSearchParams } from 'next/navigation'

const PART_SIZE = 10 * 1024 * 1024

const PROJECT_LABELS: Record<string, string> = {
  kokokollective: 'Koko Kollective',
}

type FileStatus = 'staged' | 'uploading' | 'done' | 'error'

interface QueuedFile {
  id:        string
  file:      File
  status:    FileStatus
  progress:  number
  publicUrl: string
  error?:    string
}

export default function UploadPage() {
  const searchParams = useSearchParams()
  const project      = searchParams.get('project') || ''
  const projectLabel = PROJECT_LABELS[project] || project

  const [dragging, setDragging]       = useState(false)
  const [queue, setQueue]             = useState<QueuedFile[]>([])
  const [uploading, setUploading]     = useState(false)
  const [allDone, setAllDone]         = useState(false)
  const [globalError, setGlobalError] = useState('')
  const fileInputRef                  = useRef<HTMLInputElement>(null)

  const stageFiles = useCallback((incoming: File[]) => {
    if (uploading || allDone) return
    const entries: QueuedFile[] = incoming.map(f => ({
      id:        `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file:      f,
      status:    'staged',
      progress:  0,
      publicUrl: '',
    }))
    setQueue(prev => [...prev, ...entries])
  }, [uploading, allDone])

  function removeFromQueue(id: string) {
    setQueue(prev => prev.filter(f => f.id !== id))
  }

  async function startUpload() {
    const pending = queue.filter(f => f.status === 'staged' || f.status === 'error')
    if (!pending.length || uploading) return

    setUploading(true)
    setGlobalError('')

    // Mark all pending as uploading
    setQueue(prev => prev.map(f =>
      f.status === 'staged' || f.status === 'error'
        ? { ...f, status: 'uploading' as FileStatus, progress: 0, error: undefined }
        : f
    ))

    let allSucceeded = true

    for (const entry of pending) {
      try {
        const url = await uploadFile(entry)
        setQueue(prev => prev.map(f =>
          f.id === entry.id ? { ...f, status: 'done', publicUrl: url, progress: 100 } : f
        ))
      } catch (err: unknown) {
        allSucceeded = false
        const msg = err instanceof Error ? err.message : 'Upload failed'
        setQueue(prev => prev.map(f =>
          f.id === entry.id ? { ...f, status: 'error', error: msg, progress: 0 } : f
        ))
      }
    }

    if (allSucceeded) {
      // Expire the token only once all files are done
      await fetch('/api/uploads/finalize', { method: 'POST' }).catch(() => {})
      setAllDone(true)
    }

    setUploading(false)
  }

  async function uploadFile(entry: QueuedFile): Promise<string> {
    const { file } = entry

    const initRes = await fetch('/api/uploads/initiate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        filename:    file.name,
        contentType: file.type || 'application/octet-stream',
        size:        file.size,
        project,
      }),
    })

    if (!initRes.ok) {
      const err = await initRes.json().catch(() => ({}))
      if (initRes.status === 401) {
        setGlobalError('Session expired. Please re-enter your token.')
        setTimeout(() => { window.location.href = '/uploads' }, 2000)
      }
      throw new Error(err.error || 'Failed to initiate upload')
    }

    const { uploadId, key, totalParts } = await initRes.json()

    const parts: { PartNumber: number; ETag: string }[] = []
    let uploadedBytes = 0

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * PART_SIZE
      const chunk = file.slice(start, Math.min(start + PART_SIZE, file.size))

      const urlRes = await fetch('/api/uploads/part-url', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ uploadId, key, partNumber }),
      })

      if (!urlRes.ok) {
        abortUpload(key, uploadId)
        throw new Error('Failed to get upload URL')
      }

      const { url } = await urlRes.json()

      const putRes = await fetch(url, {
        method:  'PUT',
        body:    chunk,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      })

      if (!putRes.ok) {
        abortUpload(key, uploadId)
        throw new Error(`Upload failed at part ${partNumber} (HTTP ${putRes.status})`)
      }

      const etag = putRes.headers.get('ETag') || putRes.headers.get('etag') || ''
      parts.push({ PartNumber: partNumber, ETag: etag })

      uploadedBytes += chunk.size
      const progress = Math.round((uploadedBytes / file.size) * 100)
      setQueue(prev => prev.map(f => f.id === entry.id ? { ...f, progress } : f))
    }

    const completeRes = await fetch('/api/uploads/complete', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uploadId, key, parts }),
    })

    if (!completeRes.ok) {
      const err = await completeRes.json().catch(() => ({}))
      throw new Error(err.error || 'Failed to complete upload. Your token is still valid.')
    }

    const { publicUrl } = await completeRes.json()
    return publicUrl
  }

  function abortUpload(key: string, uploadId: string) {
    fetch('/api/uploads/abort', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ uploadId, key }),
    }).catch(() => {})
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) stageFiles(files)
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (files.length) stageFiles(files)
    e.target.value = ''
  }

  const staged   = queue.filter(f => f.status === 'staged')
  const failed   = queue.filter(f => f.status === 'error')
  const done     = queue.filter(f => f.status === 'done')
  const canAdd   = !uploading && !allDone
  const canUpload = (staged.length > 0 || failed.length > 0) && !uploading && !allDone

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Upload Files</h1>
        <p className="mt-1 text-sm text-gray-400">
          Project: <span className="font-medium text-gray-200">{projectLabel}</span>
        </p>
      </div>

      {globalError && (
        <div className="mb-6 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-sm text-red-300">
          {globalError}
        </div>
      )}

      {/* Drop zone */}
      {canAdd && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition ${
            dragging ? 'border-blue-500 bg-blue-950/30' : 'border-gray-700 bg-gray-900/30 hover:border-gray-500'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={onFileInput}
            accept="image/*,video/*,audio/*,.pdf"
          />
          <svg className="mx-auto mb-3 h-9 w-9 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-sm font-medium text-gray-300">
            {queue.length > 0 ? 'Add more files' : 'Drop files here or click to browse'}
          </p>
          <p className="mt-1 text-xs text-gray-500">Images, videos, PDFs, audio — max 2GB per file</p>
        </div>
      )}

      {/* File queue */}
      {queue.length > 0 && (
        <div className="mt-4 space-y-2">
          {queue.map(f => (
            <div key={f.id} className="rounded-lg border border-gray-800 bg-gray-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <FileIcon type={f.file.type} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-200">{f.file.name}</p>
                  <p className="text-xs text-gray-500">{formatBytes(f.file.size)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {f.status === 'staged' && (
                    <button
                      onClick={() => removeFromQueue(f.id)}
                      className="rounded p-1 text-gray-600 hover:bg-gray-800 hover:text-gray-300"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                  <span className={`min-w-[3rem] text-right text-xs font-medium ${
                    f.status === 'done'      ? 'text-green-400'
                    : f.status === 'error'   ? 'text-red-400'
                    : f.status === 'uploading' ? 'text-blue-400'
                    : 'text-gray-600'
                  }`}>
                    {f.status === 'done'       ? 'Done'
                     : f.status === 'error'    ? 'Failed'
                     : f.status === 'uploading' ? `${f.progress}%`
                     : 'Queued'}
                  </span>
                </div>
              </div>
              {f.status === 'uploading' && (
                <div className="mt-2.5 h-1 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-200"
                    style={{ width: `${f.progress}%` }}
                  />
                </div>
              )}
              {f.status === 'error' && f.error && (
                <p className="mt-1 text-xs text-red-400">{f.error}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Primary action */}
      {canUpload && (
        <button
          onClick={startUpload}
          className="mt-4 w-full rounded-lg bg-white px-4 py-3 font-medium text-gray-900 transition hover:bg-gray-100"
        >
          Upload {staged.length + failed.length} {staged.length + failed.length === 1 ? 'file' : 'files'}
        </button>
      )}

      {/* In-progress hint */}
      {uploading && (
        <p className="mt-4 text-center text-xs text-gray-500">
          Uploading {queue.filter(f => f.status === 'uploading').length} of {queue.length}... do not close this page.
        </p>
      )}

      {/* Success */}
      {allDone && done.length > 0 && (
        <div className="mt-8 rounded-xl border border-green-800 bg-green-950/20 p-6">
          <div className="mb-4 flex items-center gap-2">
            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-base font-semibold text-green-300">
              {done.length} {done.length === 1 ? 'file' : 'files'} uploaded
            </h2>
          </div>

          <p className="mb-4 text-sm text-gray-400">
            Share these with the website developer.
          </p>

          <div className="space-y-2">
            {done.map(f => (
              <div key={f.id} className="flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs text-gray-500">{f.file.name}</p>
                  <code className="block truncate text-xs text-green-300">{f.publicUrl}</code>
                </div>
                <button
                  onClick={() => navigator.clipboard.writeText(f.publicUrl)}
                  className="shrink-0 rounded px-2 py-1 text-xs text-gray-500 transition hover:bg-gray-800 hover:text-white"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>

          {done.length > 1 && (
            <div className="mt-3 rounded-lg bg-gray-900/80 p-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="text-xs text-gray-500">All URLs</p>
                <button
                  onClick={() => navigator.clipboard.writeText(done.map(f => f.publicUrl).join('\n'))}
                  className="text-xs text-gray-500 hover:text-white"
                >
                  Copy all
                </button>
              </div>
              <textarea
                readOnly
                className="w-full resize-none bg-transparent font-mono text-xs leading-5 text-gray-300 focus:outline-none"
                rows={done.length}
                value={done.map(f => f.publicUrl).join('\n')}
              />
            </div>
          )}

          <p className="mt-4 text-xs text-gray-600">
            Your access token has been used and is now expired.
          </p>
        </div>
      )}
    </div>
  )
}

function FileIcon({ type }: { type: string }) {
  const isImage = type.startsWith('image/')
  const isVideo = type.startsWith('video/')
  const isPdf   = type === 'application/pdf'

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-800 text-gray-400">
      {isImage ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ) : isVideo ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ) : isPdf ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )}
    </div>
  )
}

function formatBytes(bytes: number): string {
  if (bytes < 1024)        return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 ** 3)   return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}
