import { getLatestPosts } from '@/lib/posts';
import HomeClient from '@/components/home/HomeClient';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  const posts = getLatestPosts(locale, 20);

  return <HomeClient posts={posts} locale={locale} />;
}
