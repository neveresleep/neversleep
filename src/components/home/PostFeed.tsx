'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Clock, Sparkles, BookOpen } from 'lucide-react';
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
// Tool icon placeholders
// ---------------------------------------------------------------------------

const PLACEHOLDER_TOOLS = [
  { name: 'ChatGPT',    color: '#10A37F', letter: 'G' },
  { name: 'Claude',     color: '#C96442', letter: 'C' },
  { name: 'Midjourney', color: '#111827', letter: 'M' },
  { name: 'Gemini',     color: '#4285F4', letter: 'G' },
  { name: 'n8n',        color: '#EA4B71', letter: 'n' },
  { name: 'Notion',     color: '#000000', letter: 'N' },
];

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
      {/* Type dot */}
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
// Tools grid (placeholders)
// ---------------------------------------------------------------------------

function ToolsGrid({ locale }: { locale: string }) {
  return (
    <div className="grid grid-cols-3 gap-4 px-5 pb-5 pt-2">
      {PLACEHOLDER_TOOLS.map((tool) => (
        <Link
          key={tool.name}
          href={`${locale === 'ru' ? '' : `/${locale}`}/tools/${tool.name.toLowerCase()}`}
          className="flex flex-col items-center gap-2 group"
        >
          <div
            className="w-14 h-14 rounded-[16px] flex items-center justify-center text-white text-[22px] font-bold shadow-sm group-hover:scale-105 transition-transform duration-150"
            style={{ background: tool.color }}
          >
            {tool.letter}
          </div>
          <span className="text-[11px] font-medium text-[#0F1724]/60 dark:text-white/55 truncate max-w-full text-center">
            {tool.name}
          </span>
        </Link>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Scrollable post list (3 visible, up to 10)
// ---------------------------------------------------------------------------

// 1 row ≈ 62px (py-3 * 2 = 24px + 2 text lines ≈ 38px)
const ROW_H = 62;
const VISIBLE = 3;

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
    <div
      className="overflow-y-auto scrollbar-thin"
      style={{ maxHeight: ROW_H * VISIBLE }}
    >
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
  const guides = useMemo(() => filtered.filter((p) => p.type === 'guide').slice(0, 10), [filtered]);

  return (
    <section
      aria-label={t('feedAriaLabel')}
      className="w-full max-w-5xl mx-auto px-4 sm:px-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Panel 1 — Свежее */}
        <GlassPanel title={t('sections.fresh')} icon={<Clock size={15} />}>
          <PostList posts={fresh} locale={locale} />
        </GlassPanel>

        {/* Panel 2 — Инструменты */}
        <GlassPanel title={t('sections.byTool')} icon={<Sparkles size={15} />}>
          <ToolsGrid locale={locale} />
        </GlassPanel>

        {/* Panel 3 — Гайды */}
        <GlassPanel title={t('sections.guides')} icon={<BookOpen size={15} />}>
          <PostList posts={guides} locale={locale} />
        </GlassPanel>
      </div>
    </section>
  );
}
