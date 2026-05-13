import { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabase'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://babalola.dev'

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://blog.babalola.dev',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  let blogRoutes: MetadataRoute.Sitemap = []

  if (supabase) {
    const { data } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (data) {
      blogRoutes = data.map(post => ({
        url: `https://blog.babalola.dev/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
    }
  }

  return [...staticRoutes, ...blogRoutes]
}
