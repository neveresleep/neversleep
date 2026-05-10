'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import type { Post, PostType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

const TYPE_COLORS: Record<
  PostType,
  { bg: string; text: string; darkBg: string; darkText: string }
> = {
  guide: {
    bg: '#DBEAFE',
    text: '#1E40AF',
    darkBg: 'rgba(219,234,254,0.15)',
    darkText: '#93C5FD',
  },
  review: {
    bg: '#D1FAE5',
    text: '#065F46',
    darkBg: 'rgba(209,250,229,0.15)',
    darkText: '#6EE7B7',
  },
  case: {
    bg: '#FEF3C7',
    text: '#92400E',
    darkBg: 'rgba(254,243,199,0.15)',
    darkText: '#FCD34D',
  },
  list: {
    bg: '#EDE9FE',
    text: '#5B21B6',
    darkBg: 'rgba(237,233,254,0.15)',
    darkText: '#C4B5FD',
  },
};

interface PostCardProps {
  post: Post;
  locale: string;
  href: string;
}

export default function PostCard({ post, locale, href }: PostCardProps) {
  const t = useTranslations('post');
  const colors = TYPE_COLORS[post.type];
  const label = t(`types.${post.type}`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -6,
        scale: 1.015,
        transition: { duration: 0.2, ease: 'easeOut' },
      }}
      whileTap={{ scale: 0.98, y: -2 }}
    >
      <Link
        href={href}
        className="group block h-full no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 rounded-[20px]"
        aria-label={post.title}
      >
        <article
          className="flex flex-col h-full rounded-[20px] overflow-hidden border shadow-glass dark:shadow-glass-dark"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderColor: 'rgba(255,255,255,0.75)',
          }}
        >
          {/* Cover image */}
          {post.cover && (
            <div className="relative w-full h-40 overflow-hidden">
              <img
                src={post.cover}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="flex flex-col flex-1 p-6 gap-3">
            {/* Type badge */}
            <span
              className="self-start text-[12px] font-semibold tracking-[0.04em] uppercase px-2.5 py-1 rounded-full leading-none"
              style={{ background: colors.bg, color: colors.text }}
            >
              {label}
            </span>

            {/* Title */}
            <h3
              className="text-[18px] font-bold leading-[1.3] tracking-[-0.01em] text-[#0F1724] dark:text-white line-clamp-2"
            >
              {post.title}
            </h3>

            {/* Description */}
            <p className="text-[14px] leading-[1.6] text-[#0F1724]/70 dark:text-white/65 line-clamp-2 flex-1">
              {post.description}
            </p>

            {/* Footer: date + reading time */}
            <div className="flex items-center justify-between pt-2 border-t border-white/30 dark:border-white/10">
              <time
                dateTime={post.date.toISOString()}
                className="text-[12px] text-[#0F1724]/50 dark:text-white/40"
              >
                {formatDate(post.date, locale)}
              </time>
              <span className="text-[12px] text-[#0F1724]/50 dark:text-white/40">
                {post.readingTime} {t('readTime')}
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
