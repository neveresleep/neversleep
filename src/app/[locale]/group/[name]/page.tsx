import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';

import { TASK_GROUPS, getGroupTasks } from '@/lib/groups';
import { getPostsByGroup } from '@/lib/posts';
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
// Metadata
// ---------------------------------------------------------------------------

const GROUP_LABELS_RU: Record<GroupKey, string> = {
  text: 'Тексты',
  visual: 'Визуал',
  work: 'Работа',
  automate: 'Автоматизации',
  nocode: 'Без кода',
};

const GROUP_LABELS_EN: Record<GroupKey, string> = {
  text: 'Text',
  visual: 'Visual',
  work: 'Work',
  automate: 'Automation',
  nocode: 'No-code',
};

function getGroupLabel(locale: string, key: GroupKey): string {
  return locale === 'ru' ? GROUP_LABELS_RU[key] : GROUP_LABELS_EN[key];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; name: string }>;
}): Promise<Metadata> {
  const { locale, name } = await params;

  if (!(name in TASK_GROUPS)) return {};
  const groupKey = name as GroupKey;
  const label = getGroupLabel(locale, groupKey);

  return {
    title: `${label} — neversleep`,
    description: `Гайды и обзоры ИИ-инструментов для задачи «${label}».`,
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
  const label = getGroupLabel(locale, groupKey);

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
              {posts.length} {posts.length === 1 ? 'материал' : posts.length < 5 ? 'материала' : 'материалов'}
            </p>
          ) : (
            <p className="text-[16px] text-gray-400">Скоро появятся материалы по этой теме</p>
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
