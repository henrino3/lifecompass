import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'LifeCompass - Reflect on Your Year, Design Your Future',
  description: 'A beautiful, immersive year-reflection experience. Look back on what you\'ve accomplished, and set your compass for the year ahead.',
  keywords: ['year compass', 'reflection', 'goal setting', 'new year', 'journaling', 'self improvement'],
  authors: [{ name: 'LifeCompass' }],
  openGraph: {
    title: 'LifeCompass - Reflect on Your Year, Design Your Future',
    description: 'A beautiful, immersive year-reflection experience.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LifeCompass - Reflect on Your Year',
    description: 'A beautiful, immersive year-reflection experience.',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'LifeCompass',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a1a',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="cosmic">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
