// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://typemeteor.sbs'),
  title: {
    default: "Typemeteor - Free Typing Speed Test in 17 Languages",
    template: "%s | Typemeteor"
  },
  description: "Test your typing speed with Typemeteor. Free online typing test available in 17 languages including Indonesian, English, Spanish, French, German, and more. Improve your WPM and compete on the leaderboard.",
  keywords: ['typing test', 'typing speed', 'WPM', 'words per minute', 'multilingual typing', 'free typing test', 'typemeteor', 'tes mengetik', 'test de dactylographie'],
  authors: [{ name: 'Typemeteor' }],
  creator: 'Typemeteor',
  publisher: 'Typemeteor',
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
    type: 'website',
    locale: 'en_US',
    url: 'https://typemeteor.sbs',
    title: 'Typemeteor - Test Your Typing Speed in Multiple Languages',
    description: 'Free online typing speed test in 17 languages. Measure your WPM, track your progress, and compete with typists worldwide.',
    siteName: 'Typemeteor',
    images: [{
      url: '/og-image.png', // Tambahkan gambar OG nanti
      width: 1200,
      height: 630,
      alt: 'Typemeteor - Typing Speed Test'
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Typemeteor - Free Typing Speed Test',
    description: 'Test your typing speed in 17 languages. Improve your WPM and compete globally.',
    images: ['/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code', // Ganti dengan kode verifikasi Google
  },
  alternates: {
    canonical: 'https://typemeteor.sbs',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/icon/meteoricon.png" />
        <link rel="apple-touch-icon" href="/icon/meteoricon.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}