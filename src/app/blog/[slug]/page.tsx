import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import BlogPostClient from './BlogPostClient'

interface Props {
  params: { slug: string }
}

// enable static generation with revalidation
export const revalidate = 300 // revalidate every 5 minutes

async function getPost(slug: string) {
  try {
    if (!supabase) {
      return null
    }

    // check if user is authenticated
    const session = await getServerSession(authOptions)
    
    let query = supabase
      .from('blog_posts')
      .select('*')
      .eq('slug', slug)

    // if user is authenticated, they can view their own drafts
    if (session?.user?.role === 'admin' || session?.user?.role === 'contributor') {
      if (session.user.role === 'admin') {
        // admin can view all posts
      } else {
        // contributors can only view published posts OR their own drafts
        query = query.or(`published.eq.true,and(author_id.eq.${session.user.id},published.eq.false)`)
      }
    } else {
      // non-authenticated users can only view published posts
      query = query.eq('published', true)
    }

    const { data, error } = await query.single()

    if (error || !data) {
      return null
    }

    return data
  } catch (error) {
    console.error('Error fetching post:', error)
    return null
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug)
  
  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const title = post.og_title || post.title
  const description = post.meta_description || post.excerpt || post.content.substring(0, 160) + '...'
  const keywords = post.meta_keywords || post.tags
  const canonicalUrl = `https://blog.babalola.dev/${post.slug}`
  const ogImage = post.og_image || '/og-image.jpg'
  const twitterImage = post.twitter_image || post.og_image || '/og-image.jpg'

  return {
    title: `${title} | Babalola Opeyemi - Software Engineer Blog`,
    description,
    keywords: Array.isArray(keywords) ? keywords.join(', ') : keywords,
    authors: [{ name: 'Babalola Opeyemi', url: 'https://babalola.dev' }],
    creator: 'Babalola Opeyemi',
    publisher: 'Babalola Opeyemi',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      type: 'article',
      locale: 'en_GB',
      url: canonicalUrl,
      siteName: 'Babalola Opeyemi - Software Engineer Blog',
      title: post.og_title || post.title,
      description: post.og_description || post.meta_description || post.excerpt,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: ['Babalola Opeyemi'],
      section: 'Technology',
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      site: '@brainiac_ope',
      creator: '@brainiac_ope',
      title: post.twitter_title || post.og_title || post.title,
      description: post.twitter_description || post.og_description || post.meta_description || post.excerpt,
      images: [twitterImage],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    other: {
      'article:author': 'Babalola Opeyemi',
      'article:published_time': post.created_at,
      'article:modified_time': post.updated_at,
      'article:section': 'Technology',
      'article:tag': Array.isArray(post.tags) ? post.tags.join(', ') : post.tags,
      'reading-time': post.reading_time?.toString() || '',
      'prerequisites': Array.isArray(post.prerequisites) ? post.prerequisites.join(', ') : post.prerequisites || '',
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug)
  
  if (!post) {
    notFound()
  }

  return <BlogPostClient post={post} />
}