import Link from 'next/link';
import { Box } from 'lucide-react';
import type { Post } from '@/lib/types';

interface Props {
  post: Post;
  locale: string;
}

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  guide:  { bg: '#DBEAFE', text: '#1E40AF' },
  review: { bg: '#D1FAE5', text: '#065F46' },
  case:   { bg: '#FEF3C7', text: '#92400E' },
  list:   { bg: '#EDE9FE', text: '#5B21B6' },
};

const TYPE_LABELS_RU: Record<string, string> = {
  guide: 'Гайд',
  review: 'Обзор',
  case: 'Кейс',
  list: 'Подборка',
};

const TYPE_LABELS_EN: Record<string, string> = {
  guide: 'Guide',
  review: 'Review',
  case: 'Case',
  list: 'List',
};

function formatCardDate(date: Date, locale: string): string {
  const now = new Date();
  const sameYear = date.getFullYear() === now.getFullYear();
  return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-US', {
    day: 'numeric',
    month: 'short',
    ...(sameYear ? {} : { year: 'numeric' }),
  });
}

export default function DiscoverCard({ post, locale }: Props) {
  const href = `${locale === 'ru' ? '' : `/${locale}`}/p/${post.slug}`;
  const typeLabel = (locale === 'ru' ? TYPE_LABELS_RU : TYPE_LABELS_EN)[post.type] ?? post.type;
  const typeColor = TYPE_COLORS[post.type] ?? { bg: '#E5E7EB', text: '#374151' };
  const hasCover = Boolean(post.cover);

  return (
    <Link
      href={href}
      className="group block mb-4 break-inside-avoid no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 rounded-[20px]"
      aria-label={post.title}
    >
      <article
        className="flex flex-col rounded-[20px] overflow-hidden border transition-all duration-200 group-hover:-translate-y-0.5"
        style={{
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(16px) saturate(180%)',
          WebkitBackdropFilter: 'blur(16px) saturate(180%)',
          borderColor: 'rgba(255,255,255,0.7)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}
      >
        {/* Cover (only when post has one) */}
        {hasCover && (
          <div className="relative w-full aspect-[4/3] overflow-hidden bg-black/[0.05]">
            {post.media === 'video' ? (
              <video
                src={`/videos/${post.slug}.mp4`}
                poster={post.cover}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            ) : (
              <img
                src={post.cover}
                alt=""
                aria-hidden
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
            )}
            {post.media === '3d' && (
              <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-black/70 text-white text-[10px] font-semibold tracking-wider uppercase">
                <Box size={10} />
                3D
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2.5 p-4">
          {/* Type badge */}
          <span
            className="self-start text-[10px] font-semibold tracking-[0.08em] uppercase px-2 py-0.5 rounded-full leading-none"
            style={{ background: typeColor.bg, color: typeColor.text }}
          >
            {typeLabel}
          </span>

          {/* Title */}
          <h3 className="text-[15px] font-bold leading-[1.3] tracking-[-0.005em] text-[#0F1724] dark:text-white line-clamp-2 group-hover:text-[#3B82F6] transition-colors">
            {post.title}
          </h3>

          {/* Description (only when no cover, gives flat cards more body) */}
          {!hasCover && (
            <p className="text-[13px] leading-[1.5] text-[#0F1724]/65 dark:text-white/55 line-clamp-3">
              {post.description}
            </p>
          )}

          {/* Footer: tools chips + publish date */}
          <div className="flex items-center justify-between gap-2 pt-1 mt-0.5">
            <div className="flex flex-wrap gap-1 min-w-0">
              {post.tools.slice(0, 3).map((tool) => (
                <span
                  key={tool}
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-black/[0.05] text-[#0F1724]/65 dark:bg-white/[0.08] dark:text-white/60"
                >
                  {tool}
                </span>
              ))}
            </div>
            <time
              dateTime={post.date.toISOString()}
              className="text-[11px] text-[#0F1724]/45 dark:text-white/40 shrink-0"
            >
              {formatCardDate(post.date, locale)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  );
}
