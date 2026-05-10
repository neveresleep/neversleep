'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Clock } from 'lucide-react';
import type { Post } from '@/lib/types';
import type { GroupKey } from '@/lib/groups';
import { TASK_GROUPS } from '@/lib/groups';

interface PostFeedProps {
  posts: Post[];
  locale: string;
  selectedGroup?: GroupKey | null;
}

function postHref(post: Post, locale: string): string {
  return `${locale === 'ru' ? '' : `/${locale}`}/p/${post.slug}`;
}

// ---------------------------------------------------------------------------
// Glass panel wrapper
// ---------------------------------------------------------------------------

function GlassPanel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col rounded-[20px] overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.55)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.45)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}
    >
      {/* Panel header */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-3">
        <span className="text-[#0F1724]/50 dark:text-white/50">{icon}</span>
        <span className="text-[13px] font-semibold text-[#0F1724]/60 dark:text-white/55 tracking-wide uppercase">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact post row
// ---------------------------------------------------------------------------

function PostRow({ post, locale }: { post: Post; locale: string }) {
  const t = useTranslations('post');

  const TYPE_COLORS: Record<string, string> = {
    guide: '#059669',
    review: '#2563EB',
    case: '#7C3AED',
    list: '#D97706',
  };

  return (
    <Link
      href={postHref(post, locale)}
      className="group flex items-start gap-3 px-5 py-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-150"
    >
      <span
        className="mt-[5px] shrink-0 w-2 h-2 rounded-full"
        style={{ background: TYPE_COLORS[post.type] ?? '#94A3B8' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-medium leading-[1.35] text-[#0F1724] dark:text-white truncate group-hover:text-[#3B82F6] transition-colors">
          {post.title}
        </p>
        <p className="text-[12px] text-[#0F1724]/45 dark:text-white/40 mt-0.5">
          {post.date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
            day: 'numeric',
            month: 'short',
          })}{' '}
          · {post.readingTime} {t('readTime')}
        </p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Scrollable post list
// ---------------------------------------------------------------------------

function PostList({ posts, locale }: { posts: Post[]; locale: string }) {
  const t = useTranslations('home');
  if (posts.length === 0) {
    return (
      <p className="px-5 pb-5 text-[13px] text-[#0F1724]/40 dark:text-white/35">
        {t('empty')}
      </p>
    );
  }

  return (
    <div className="overflow-y-auto scrollbar-thin">
      {posts.slice(0, 10).map((post) => (
        <PostRow key={post.slug} post={post} locale={locale} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PostFeed({ posts, locale, selectedGroup }: PostFeedProps) {
  const t = useTranslations('home');

  const filtered = useMemo(() => {
    if (!selectedGroup) return posts;
    const tasks = TASK_GROUPS[selectedGroup].tasks as readonly string[];
    return posts.filter((p) => tasks.includes(p.task));
  }, [posts, selectedGroup]);

  const fresh = useMemo(() => filtered.slice(0, 10), [filtered]);

  return (
    <section
      aria-label={t('feedAriaLabel')}
      className="w-full max-w-2xl mx-auto px-4 sm:px-6"
    >
      <GlassPanel title={t('sections.fresh')} icon={<Clock size={15} />}>
        <PostList posts={fresh} locale={locale} />
      </GlassPanel>
    </section>
  );
}
