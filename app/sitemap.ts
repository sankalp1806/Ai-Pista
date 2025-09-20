import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://aipista.app'
  const lastModified = new Date()

  return [
    {
      url: `${base}/`,
      lastModified,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/compare`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]
}
