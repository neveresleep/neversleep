import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://neversleep.chat'),
  title: {
    default: 'neversleep — ИИ под твою задачу',
    template: '%s | neversleep',
  },
  description: 'Гайды и обзоры ИИ-инструментов для не-разработчиков',
  openGraph: {
    type: 'website',
    siteName: 'neversleep',
    locale: 'ru_RU',
    alternateLocale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@neversleepchat',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`${manrope.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
