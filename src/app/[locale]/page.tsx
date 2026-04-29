import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { getPostsByLocale } from '@/lib/posts';
import { generatePageMetadata } from '@/lib/seo';
import HomeClient from '@/components/home/HomeClient';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home' });

  return generatePageMetadata({
    title: `neversleep — ${t('subtitle')}`,
    description:
      locale === 'ru'
        ? 'Гайды и обзоры ИИ-инструментов для не-разработчиков'
        : 'AI tool guides and reviews for non-developers',
    lang: locale,
    canonicalPath: '/',
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  // Pass all posts; PostFeed slices the "fresh" tab itself.
  const posts = getPostsByLocale(locale);

  return <HomeClient posts={posts} locale={locale} />;
}
