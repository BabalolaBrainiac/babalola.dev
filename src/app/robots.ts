import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/auth/', '/brainiac/', '/uploads/', '/learning/*/*'],
    },
    sitemap: 'https://babalola.dev/sitemap.xml',
  }
}
