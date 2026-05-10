import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getPostBySlug, getPostsByLocale } from '@/lib/posts';
import { generatePageMetadata } from '@/lib/seo';
import PostView from '@/components/post/PostView';

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export const dynamicParams = false;

export async function generateStaticParams() {
  const locales = ['ru', 'en'];
  const params: { locale: string; slug: string }[] = [];

  for (const locale of locales) {
    const posts = getPostsByLocale(locale);
    for (const post of posts) {
      params.push({ locale, slug: post.slug });
    }
  }

  return params;
}

// ---------------------------------------------------------------------------
// Metadata
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) return {};

  return generatePageMetadata({
    title: `${post.title} — neversleep`,
    description: post.description,
    lang: locale,
    canonicalPath: `/p/${post.slug}`,
    ogImage: post.cover,
    type: 'article',
  });
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function PostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(locale, slug);
  if (!post) notFound();

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-12">
      <PostView post={post} locale={locale} />
    </main>
  );
}
