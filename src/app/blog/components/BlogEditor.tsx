'use client'

import { useState } from 'react'
import { CreateBlogPost } from '@/lib/supabase'

interface BlogEditorProps {
  initialPost?: CreateBlogPost & { id?: string }
  onSave: (post: CreateBlogPost) => void
  onCancel: () => void
}

export default function BlogEditor({ initialPost, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(initialPost?.title || '')
  const [content, setContent] = useState(initialPost?.content || '')
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt || '')
  const [published, setPublished] = useState(initialPost?.published || false)
  const [isLoading, setIsLoading] = useState(false)
  
  // SEO metadata fields
  const [metaDescription, setMetaDescription] = useState(initialPost?.meta_description || '')
  const [metaKeywords, setMetaKeywords] = useState(initialPost?.meta_keywords?.join(', ') || '')
  const [ogTitle, setOgTitle] = useState(initialPost?.og_title || '')
  const [ogDescription, setOgDescription] = useState(initialPost?.og_description || '')
  const [ogImage, setOgImage] = useState(initialPost?.og_image || '')
  const [twitterTitle, setTwitterTitle] = useState(initialPost?.twitter_title || '')
  const [twitterDescription, setTwitterDescription] = useState(initialPost?.twitter_description || '')
  const [twitterImage, setTwitterImage] = useState(initialPost?.twitter_image || '')
  const [canonicalUrl, setCanonicalUrl] = useState(initialPost?.canonical_url || '')
  const [readingTime, setReadingTime] = useState(initialPost?.reading_time || 0)
  const [difficultyLevel, setDifficultyLevel] = useState(initialPost?.difficulty_level || 'intermediate')
  const [prerequisites, setPrerequisites] = useState(initialPost?.prerequisites?.join(', ') || '')

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  // Auto-generate tags from content
  const generateTags = (content: string) => {
    const techKeywords = [
      'javascript', 'typescript', 'react', 'nextjs', 'nodejs', 'python', 'java', 'c#',
      'aws', 'docker', 'kubernetes', 'terraform', 'microservices', 'api', 'database',
      'sql', 'nosql', 'mongodb', 'postgresql', 'redis', 'git', 'ci/cd', 'devops',
      'frontend', 'backend', 'fullstack', 'mobile', 'web', 'cloud', 'serverless'
    ]
    
    const words = content.toLowerCase().split(/\s+/)
    const foundTags = techKeywords.filter(keyword => 
      words.some(word => word.includes(keyword))
    )
    
    return Array.from(new Set(foundTags)).slice(0, 5) // Max 5 tags
  }

  const handleSave = async (saveAsDraft = false) => {
    if (!title.trim() || !content.trim()) {
      alert('Title and content are required')
      return
    }

    setIsLoading(true)
    
    const slug = generateSlug(title)
    const tags = generateTags(content)
    
    const post: CreateBlogPost = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || content.substring(0, 200) + '...',
      tags,
      published: saveAsDraft ? false : published,
      slug,
      author_id: '', // This will be set by the API
      // SEO metadata
      meta_description: metaDescription.trim() || excerpt.trim() || content.substring(0, 160) + '...',
      meta_keywords: metaKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
      og_title: ogTitle.trim() || title.trim(),
      og_description: ogDescription.trim() || metaDescription.trim() || excerpt.trim(),
      og_image: ogImage.trim() || '/og-image.jpg',
      twitter_title: twitterTitle.trim() || ogTitle.trim() || title.trim(),
      twitter_description: twitterDescription.trim() || ogDescription.trim() || metaDescription.trim(),
      twitter_image: twitterImage.trim() || ogImage.trim() || '/og-image.jpg',
      canonical_url: canonicalUrl.trim() || '',
      reading_time: readingTime || Math.ceil(content.split(' ').length / 200), // Auto-calculate if not set
      difficulty_level: difficultyLevel as 'beginner' | 'intermediate' | 'advanced',
      prerequisites: prerequisites.split(',').map(p => p.trim()).filter(p => p.length > 0)
    }

    try {
      await onSave(post)
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Error saving post')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="glass-card p-6">
        <h2 className="text-2xl font-bold font-mono gradient-text mb-6">
          {initialPost?.id ? 'Edit Post' : 'Create New Post'}
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="Enter post title..."
            />
          </div>

          <div>
            <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={15}
              className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none font-mono text-sm"
              placeholder="Write your post content here... Use markdown for formatting."
            />
            <p className="text-xs text-[var(--muted)] mt-2">
              Supports markdown formatting. Use ``` for code blocks.
            </p>
            
            {/* Interactive Code Block Helper */}
            <div className="mt-4 p-4 glass rounded-lg border border-[var(--glass-border)]">
              <h4 className="text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                🚀 Add Interactive Code Block
              </h4>
              <p className="text-xs text-[var(--muted)] mb-3">
                Insert an interactive code block that readers can run directly in the browser.
              </p>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: 'var(--foreground)' }}>
                    Language
                  </label>
                  <select 
                    id="codeLanguage"
                    className="w-full px-3 py-2 text-sm glass rounded border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="typescript">TypeScript</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: 'var(--foreground)' }}>
                    Code Title (optional)
                  </label>
                  <input
                    type="text"
                    id="codeTitle"
                    className="w-full px-3 py-2 text-sm glass rounded border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="e.g., Simple Fibonacci Algorithm"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-mono mb-1" style={{ color: 'var(--foreground)' }}>
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    id="codeDescription"
                    className="w-full px-3 py-2 text-sm glass rounded border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
                    placeholder="e.g., Try running this code to see the output!"
                  />
                </div>
                
                <button
                  onClick={() => {
                    const language = (document.getElementById('codeLanguage') as HTMLSelectElement)?.value || 'javascript'
                    const title = (document.getElementById('codeTitle') as HTMLInputElement)?.value || ''
                    const description = (document.getElementById('codeDescription') as HTMLInputElement)?.value || ''
                    
                    const codeBlock = `\n\n<CodeExecution 
  language="${language}"
  title="${title}"
  description="${description}"
  executable={true}
>
\`\`\`${language}
// Enter your code here
console.log("Hello, World!")
\`\`\`
</CodeExecution>\n\n`
                    
                    setContent(prev => prev + codeBlock)
                    
                    // Clear the form
                    ;(document.getElementById('codeTitle') as HTMLInputElement).value = ''
                    ;(document.getElementById('codeDescription') as HTMLInputElement).value = ''
                  }}
                  className="btn btn-primary text-sm"
                >
                  Insert Interactive Code Block
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
              Excerpt (optional)
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none"
              placeholder="Brief description of your post..."
            />
          </div>

          {/* SEO Metadata Section */}
          <div className="border-t border-[var(--glass-border)] pt-6">
            <h3 className="text-lg font-mono font-semibold mb-4 gradient-text">
              🔍 SEO & Social Media Metadata
            </h3>
            <p className="text-sm text-[var(--muted)] mb-6">
              These fields help with search engine optimization and social media sharing. Leave blank to use auto-generated values.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Meta Description
                </label>
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="SEO description (160 chars max)..."
                  maxLength={160}
                />
                <p className="text-xs text-[var(--muted)] mt-1">
                  {metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Keywords (comma-separated)
                </label>
                <input
                  type="text"
                  value={metaKeywords}
                  onChange={(e) => setMetaKeywords(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="keyword1, keyword2, keyword3..."
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Open Graph Title
                </label>
                <input
                  type="text"
                  value={ogTitle}
                  onChange={(e) => setOgTitle(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="Social media title..."
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Open Graph Description
                </label>
                <textarea
                  value={ogDescription}
                  onChange={(e) => setOgDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="Social media description..."
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Open Graph Image URL
                </label>
                <input
                  type="url"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Canonical URL
                </label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="https://blog.babalola.dev/post-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Reading Time (minutes)
                </label>
                <input
                  type="number"
                  value={readingTime}
                  onChange={(e) => setReadingTime(parseInt(e.target.value) || 0)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="Auto-calculated if empty"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Difficulty Level
                </label>
                <select
                  value={difficultyLevel}
                  onChange={(e) => setDifficultyLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-mono font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  Prerequisites (comma-separated)
                </label>
                <input
                  type="text"
                  value={prerequisites}
                  onChange={(e) => setPrerequisites(e.target.value)}
                  className="w-full px-4 py-2 glass rounded-lg border border-[var(--glass-border)] focus:border-[var(--accent)] focus:outline-none text-sm"
                  placeholder="Basic knowledge of JavaScript, Understanding of APIs..."
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="rounded border-[var(--glass-border)]"
              />
              <span className="text-sm font-mono" style={{ color: 'var(--foreground)' }}>
                Publish immediately
              </span>
            </label>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => handleSave(false)}
              disabled={isLoading}
              className="btn btn-primary"
            >
              {isLoading ? 'Saving...' : published ? 'Publish Post' : 'Save Post'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={isLoading}
              className="btn btn-secondary"
            >
              {isLoading ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              onClick={onCancel}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
