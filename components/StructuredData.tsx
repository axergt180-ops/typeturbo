// components/StructuredData.tsx
'use client';

interface StructuredDataProps {
  language?: string;
}

export default function StructuredData({ language }: StructuredDataProps) {
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Typemeteor',
    url: 'https://typemeteor.sbs',
    description: 'Free online typing speed test in 17 languages. Measure your WPM, track your progress, and compete with typists worldwide.',
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    inLanguage: ['en', 'id', 'es', 'fr', 'de', 'pt', 'ja', 'it', 'ru', 'ko', 'zh', 'ar', 'nl', 'tr', 'th', 'vi', 'hi'],
    featureList: [
      'Typing speed test',
      'WPM calculation',
      'Accuracy tracking',
      'Global leaderboard',
      'Multi-language support'
    ]
  };

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Typemeteor',
    url: 'https://typemeteor.sbs',
    logo: 'https://typemeteor.sbs/icon/meteoricon.png',
    sameAs: [
      // Tambahkan social media links jika ada
    ]
  };

  const breadcrumbSchema = language ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://typemeteor.sbs'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${language.charAt(0).toUpperCase() + language.slice(1)} Typing Test`,
        item: `https://typemeteor.sbs/language/${language}`
      }
    ]
  } : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
    </>
  );
}