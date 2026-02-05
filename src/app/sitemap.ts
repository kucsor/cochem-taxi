import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://cochem-taxi.de'
  const date = new Date()

  return [
    {
      url: `${baseUrl}/de`,
      lastModified: date,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/en`,
      lastModified: date,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/de/rechner`,
      lastModified: date,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/en/rechner`,
      lastModified: date,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/de/legal`,
      lastModified: date,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/en/legal`,
      lastModified: date,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]
}
