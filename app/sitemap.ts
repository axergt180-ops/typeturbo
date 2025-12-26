// app/sitemap.ts
import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://typemeteor.sbs';
  
  const languages = [
    'indonesian', 'english', 'spanish', 'french', 'german', 'portuguese',
    'japanese', 'italian', 'russian', 'korean', 'chinese', 'arabic',
    'dutch', 'turkish', 'thai', 'vietnamese', 'hindi'
  ];

  // Homepage
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    }
  ];

  // Language pages
  languages.forEach(lang => {
    routes.push({
      url: `${baseUrl}/language/${lang}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    });
  });

  return routes;
}