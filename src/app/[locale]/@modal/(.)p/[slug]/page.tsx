import { notFound } from 'next/navigation';

import { getPostBySlug } from '@/lib/posts';
import PostView from '@/components/post/PostView';
import PostModal from '@/components/post/PostModal';

export default async function InterceptedPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  const closeLabel = locale === 'ru' ? 'Закрыть' : 'Close';

  return (
    <PostModal closeLabel={closeLabel}>
      <PostView post={post} locale={locale} />
    </PostModal>
  );
}
