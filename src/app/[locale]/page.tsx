import { getPostsByLocale } from '@/lib/posts';
import HomeClient from '@/components/home/HomeClient';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  // Pass all posts; PostFeed slices the "fresh" tab itself.
  const posts = getPostsByLocale(locale);

  return <HomeClient posts={posts} locale={locale} />;
}
