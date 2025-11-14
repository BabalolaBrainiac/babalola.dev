'use client'

import { useState } from 'react'

interface ShareButtonProps {
  title: string
  slug: string
  className?: string
}

export default function ShareButton({ title, slug, className = '' }: ShareButtonProps) {
  const [copied, setCopied] = useState(false)
  
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const postUrl = `${baseUrl}/blog/${slug}`
  
  const shareData = {
    title: title,
    text: `Check out this blog post: ${title}`,
    url: postUrl
  }

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
      // Fallback for older browsers
      const textArea = document.createElement('textarea')
      textArea.value = postUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      onClick={handleShare}
      className={`px-3 py-1.5 text-xs font-mono glass rounded hover:bg-[var(--accent)] hover:text-white transition-colors duration-200 ${className}`}
    >
      {copied ? '✓ Link Copied' : '🔗 Share'}
    </button>
  )
}