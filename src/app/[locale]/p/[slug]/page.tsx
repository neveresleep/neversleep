import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import { getPostBySlug, getPostsByLocale, getRelatedPosts } from '@/lib/posts';
import { generatePageMetadata } from '@/lib/seo';
import { mdxComponents } from '@/components/post/MDXComponents';
import { TypeBadge, TaskBadge, ToolBadge, RelatedPosts } from '@/components/post/PostBadges';

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

  const related = getRelatedPosts(post, locale, 3);

  const formattedDate = post.date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-12">
      <article className="max-w-2xl mx-auto">
        {/* Badges row */}
        <div className="mb-5 flex flex-wrap gap-2">
          <TypeBadge type={post.type} />
          <TaskBadge task={post.task} />
          {post.tools.map((tool) => (
            <ToolBadge key={tool} tool={tool} locale={locale} />
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-[clamp(28px,5vw,40px)] font-extrabold leading-tight tracking-tight text-gray-900">
          {post.title}
        </h1>

        {/* Meta: date + reading time */}
        <div className="mb-8 flex items-center gap-3 text-[14px] text-gray-400">
          <time dateTime={post.date.toISOString()}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readingTime} мин</span>
        </div>

        {/* Cover image */}
        {post.cover && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <Image
              src={post.cover}
              alt={post.title}
              width={800}
              height={450}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        {/* MDX content */}
        <div className="prose-reset">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>
      </article>

      {/* Related posts */}
      <div className="max-w-2xl mx-auto">
        <RelatedPosts posts={related} locale={locale} />
      </div>
    </main>
  );
}
