import Link from 'next/link';
import type { PostType } from '@/lib/types';
import type { Post } from '@/lib/types';

// ---------------------------------------------------------------------------
// TypeBadge
// ---------------------------------------------------------------------------

const TYPE_STYLES: Record<PostType, string> = {
  guide:  'bg-emerald-100 text-emerald-700',
  review: 'bg-blue-100 text-blue-700',
  case:   'bg-purple-100 text-purple-700',
  list:   'bg-orange-100 text-orange-700',
};

const TYPE_LABELS: Record<PostType, string> = {
  guide:  'гайд',
  review: 'обзор',
  case:   'кейс',
  list:   'подборка',
};

interface TypeBadgeProps {
  type: PostType;
}

export function TypeBadge({ type }: TypeBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-widest ${TYPE_STYLES[type]}`}
    >
      {TYPE_LABELS[type]}
    </span>
  );
}

// ---------------------------------------------------------------------------
// TaskBadge
// ---------------------------------------------------------------------------

interface TaskBadgeProps {
  task: string;
}

export function TaskBadge({ task }: TaskBadgeProps) {
  return (
    <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-[12px] font-semibold uppercase tracking-widest text-gray-600">
      {task.replace(/-/g, ' ')}
    </span>
  );
}

// ---------------------------------------------------------------------------
// ToolBadge
// ---------------------------------------------------------------------------

interface ToolBadgeProps {
  tool: string;
  locale: string;
}

export function ToolBadge({ tool, locale }: ToolBadgeProps) {
  const href = locale === 'ru' ? `/tools/${tool}` : `/${locale}/tools/${tool}`;
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-[12px] font-semibold uppercase tracking-widest text-gray-500 transition-colors hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700"
    >
      {tool}
    </Link>
  );
}

// ---------------------------------------------------------------------------
// PostCard (used in RelatedPosts)
// ---------------------------------------------------------------------------

interface PostCardProps {
  post: Post;
  locale: string;
}

function PostCard({ post, locale }: PostCardProps) {
  const href = locale === 'ru' ? `/p/${post.slug}` : `/${locale}/p/${post.slug}`;
  return (
    <Link
      href={href}
      className="group flex flex-col gap-2 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
    >
      <div className="flex flex-wrap gap-1.5">
        <TypeBadge type={post.type} />
      </div>
      <h3 className="text-[16px] font-bold leading-snug tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
        {post.title}
      </h3>
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
// RelatedPosts
// ---------------------------------------------------------------------------

interface RelatedPostsProps {
  posts: Post[];
  locale: string;
}

export function RelatedPosts({ posts, locale }: RelatedPostsProps) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-16 border-t border-gray-100 pt-12">
      <h2 className="mb-6 text-xl font-bold tracking-tight text-gray-900">
        Похожее
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} locale={locale} />
        ))}
      </div>
    </section>
  );
}
