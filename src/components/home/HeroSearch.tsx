'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { useTranslations } from 'next-intl';

const PLACEHOLDER_COUNT = 4;

interface HeroSearchProps {
  locale: string;
}

export default function HeroSearch({ locale }: HeroSearchProps) {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations('home');
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_COUNT);
    }, 3000);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  function handleSubmit() {
    const trimmed = query.trim();
    if (!trimmed) return;
    const prefix = locale === 'ru' ? '' : `/${locale}`;
    router.push(`${prefix}/search?q=${encodeURIComponent(trimmed)}`);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSubmit();
  }

  const placeholders = [
    t('placeholder0'),
    t('placeholder1'),
    t('placeholder2'),
    t('placeholder3'),
  ];

  return (
    <div
      role="search"
      aria-label={t('searchAriaLabel')}
      className="relative w-[min(680px,90vw)]"
    >
      <label htmlFor="hero-search" className="sr-only">
        {t('searchLabel')}
      </label>

      <motion.div
        className="relative flex items-center h-[60px] rounded-full bg-white/65 dark:bg-[rgba(10,14,30,0.55)] border border-white/80 dark:border-white/12 shadow-[0_2px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_2px_24px_rgba(0,0,0,0.35)]"
        style={{ backdropFilter: 'blur(20px) saturate(180%)' }}
        animate={
          isFocused
            ? {
                boxShadow:
                  '0 0 0 3px rgba(59,130,246,0.35), 0 2px 20px rgba(0,0,0,0.08)',
                borderColor: 'rgba(59,130,246,0.60)',
              }
            : {
                boxShadow: '0 2px 20px rgba(0,0,0,0.08)',
                borderColor: 'rgba(255,255,255,0.80)',
              }
        }
        transition={{ duration: shouldReduceMotion ? 0 : 0.15, ease: 'easeOut' }}
      >
        {/* Search icon */}
        <span
          aria-hidden="true"
          className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150"
          style={{
            color: isFocused
              ? 'rgba(59,130,246,0.80)'
              : 'rgba(15,23,36,0.40)',
          }}
        >
          <Search size={20} />
        </span>

        <input
          id="hero-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholders[placeholderIndex]}
          className="w-full h-full bg-transparent border-none outline-none pl-[52px] pr-[56px] text-[17px] font-normal text-[#0F1724] dark:text-white placeholder:text-[rgba(15,23,36,0.45)] dark:placeholder:text-[rgba(255,255,255,0.40)]"
          autoComplete="off"
          spellCheck={false}
        />

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          aria-label={t('searchButtonLabel')}
          className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-colors duration-150"
        >
          <Search size={15} />
        </button>
      </motion.div>
    </div>
  );
}
