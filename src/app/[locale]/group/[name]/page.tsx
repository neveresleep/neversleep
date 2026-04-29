import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

import { TASK_GROUPS, getGroupTasks } from '@/lib/groups';
import { getPostsByGroup } from '@/lib/posts';
import { generatePageMetadata } from '@/lib/seo';
import { TypeBadge, TaskBadge } from '@/components/post/PostBadges';
import type { GroupKey } from '@/lib/types';
import type { Post } from '@/lib/types';

// ---------------------------------------------------------------------------
// Static params — one entry per locale × group key
// ---------------------------------------------------------------------------

export async function generateStaticParams() {
  const locales = ['ru', 'en'];
  const groupKeys = Object.keys(TASK_GROUPS) as GroupKey[];
  const params: { locale: string; name: string }[] = [];

  for (const locale of locales) {
    for (const name of groupKeys) {
      params.push({ locale, name });
    }
  }

  return params;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pluralMaterial(
  n: number,
  locale: string,
  t: Awaited<ReturnType<typeof getTranslations<'groupPage'>>>
): string {
  if (locale !== 'ru') {
    return n === 1 ? t('material1') : t('material2');
  }
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return t('material1');
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return t('material2');
  return t('material5');
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

  if (!(name in TASK_GROUPS)) return {};
  const groupKey = name as GroupKey;

  const tGroups = await getTranslations({ locale, namespace: 'groups' });
  const tPage = await getTranslations({ locale, namespace: 'groupPage' });
  const label = tGroups(groupKey);

  return generatePageMetadata({
    title: `${label} — neversleep`,
    description: tPage('metaDescription', { label }),
    lang: locale,
    canonicalPath: `/group/${name}`,
  });
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
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function GroupPage({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}) {
  const { locale, name } = await params;

  if (!(name in TASK_GROUPS)) notFound();
  const groupKey = name as GroupKey;

  const groupTasks = getGroupTasks(groupKey);
  const posts = getPostsByGroup(locale, groupTasks);

  const tGroups = await getTranslations({ locale, namespace: 'groups' });
  const tPage = await getTranslations({ locale, namespace: 'groupPage' });
  const label = tGroups(groupKey);

  return (
    <main className="min-h-screen bg-white px-4 pb-24 pt-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <header className="mb-10">
          <h1 className="mb-2 text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight text-gray-900">
            {label}
          </h1>
          {posts.length > 0 ? (
            <p className="text-[16px] text-gray-500">
              {posts.length} {pluralMaterial(posts.length, locale, tPage)}
            </p>
          ) : (
            <p className="text-[16px] text-gray-400">{tPage('comingSoon')}</p>
          )}
        </header>

        {/* Posts grid */}
        {posts.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} locale={locale} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
