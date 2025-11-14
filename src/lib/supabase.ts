import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// Only create client if key is available
export const supabase = supabaseKey ? createClient(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
}) : null

// Database types
export interface BlogPost {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  created_at: string
  updated_at: string
  published: boolean
  slug: string
  author_id: string
  author_name?: string
  author_email?: string
  // SEO metadata fields
  meta_description?: string
  meta_keywords?: string[]
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  canonical_url?: string
  reading_time?: number
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
}

export interface CreateBlogPost {
  title: string
  content: string
  excerpt: string
  tags: string[]
  published: boolean
  slug: string
  author_id: string
  // SEO metadata fields
  meta_description?: string
  meta_keywords?: string[]
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_title?: string
  twitter_description?: string
  twitter_image?: string
  canonical_url?: string
  reading_time?: number
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  prerequisites?: string[]
}

export interface BlogUser {
  id: string
  email: string
  name: string
  role: 'admin' | 'contributor'
  created_at: string
}
