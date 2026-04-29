import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getAllTools, getPostsByTool, getPostsByLocale } from '@/lib/posts';
import { TypeBadge, TaskBadge } from '@/components/post/PostBadges';
import Link from 'next/link';
import type { Post } from '@/lib/types';

// ---------------------------------------------------------------------------
// Static params — collect every unique tool across all locales
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const locales = ['ru', 'en'];
  const seen = new Set<string>();
  const params: { locale: string; name: string }[] = [];

  for (const locale of locales) {
    const tools = getAllTools(locale);
    for (const tool of tools) {
      const key = `${locale}:${tool}`;
      if (!seen.has(key)) {
        seen.add(key);
        params.push({ locale, name: tool });
      }
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
  params: Promise<{ locale: string; name: string }>;
}): Promise<Metadata> {
  const { locale, name } = await params;
  const posts = getPostsByTool(locale, name);
  if (posts.length === 0) return {};

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const count = posts.length;
  const noun = count === 1 ? 'материал' : count < 5 ? 'материала' : 'материалов';

  return {
    title: `${displayName} — ${count} ${noun} — neversleep`,
    description: `Гайды и обзоры по инструменту ${displayName} на neversleep.`,
  };
}

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------

function PostCard({ post, locale }: { post: Post; locale: string }) {
  const href = locale === 'ru' ? `/p/${post.slug}` : `/${locale}/p/${post.slug}`;
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex flex-wrap gap-1.5">
        <TypeBadge type={post.type} />
        <TaskBadge task={post.task} />
      </div>
      <h2 className="text-[16px] font-bold leading-snug tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h2>
      <p className="line-clamp-2 text-[14px] leading-relaxed text-gray-500">
        {post.description}
      </p>
      <div className="mt-auto pt-2 text-[12px] text-gray-400">
        {post.readingTime} мин
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function ToolPage({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}) {
  const { locale, name } = await params;
  const posts = getPostsByTool(locale, name);

  if (posts.length === 0) notFound();

  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  const count = posts.length;
  const noun = count === 1 ? 'материал' : count < 5 ? 'материала' : 'материалов';

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10">
          <h1 className="mb-2 text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight text-gray-900">
            {displayName}
          </h1>
          <p className="text-[16px] text-gray-500">
            {count} {noun}
          </p>
        </header>

        {/* Posts grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} locale={locale} />
          ))}
        </div>
      </div>
    </main>
  );
}
