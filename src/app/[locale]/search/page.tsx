'use client';

import { Suspense, useEffect, useRef, useState, useCallback } from 'react';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import PostCard from '@/components/post/PostCard';
import PostCardSkeleton from '@/components/ui/PostCardSkeleton';
import AnimatedBackground from '@/components/home/AnimatedBackground';
import { searchPostsAction } from '@/app/actions';
import type { Post } from '@/lib/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PagefindResult {
  url: string;
  meta: {
    title?: string;
  };
  excerpt: string;
}

type SearchState = 'idle' | 'loading' | 'done';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEBOUNCE_MS = 300;

const containerVariants = {
  show: { transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function postHref(post: Post, locale: string): string {
  const prefix = locale === 'ru' ? '' : `/${locale}`;
  return `${prefix}/p/${post.slug}`;
}

// Dev fallback: calls a Server Action so `fs` stays server-side
async function devSearch(locale: string, query: string): Promise<Post[]> {
  return searchPostsAction(locale, query);
}

// ---------------------------------------------------------------------------
// Pagefind result card (production only)
// ---------------------------------------------------------------------------

function PagefindResultCard({ result }: { result: PagefindResult }) {
  const title = result.meta.title ?? result.url;

  return (
    <motion.div variants={itemVariants}>
      <a
        href={result.url}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2 rounded-[20px]"
        aria-label={title}
      >
        <article
          className="flex flex-col gap-3 rounded-[20px] overflow-hidden border p-6 transition-all duration-200"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderColor: 'rgba(255,255,255,0.75)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.6) inset',
          }}
        >
          <h3 className="text-[18px] font-bold leading-[1.3] tracking-[-0.01em] text-[#0F1724] dark:text-white line-clamp-2">
            {title}
          </h3>
          {result.excerpt && (
            <p
              className="text-[14px] leading-[1.6] text-[#0F1724]/70 dark:text-white/65 line-clamp-3"
              dangerouslySetInnerHTML={{ __html: result.excerpt }}
            />
          )}
          <span className="text-[12px] text-[#3B82F6] truncate">{result.url}</span>
        </article>
      </a>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SearchPage() {
  return (
    <Suspense fallback={null}>
      <SearchPageContent />
    </Suspense>
  );
}

function SearchPageContent() {
  const params = useParams();
  const locale = (params?.locale as string) ?? 'ru';
  const searchParams = useSearchParams();
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  const isDev = process.env.NODE_ENV !== 'production';

  const initialQuery = searchParams.get('q') ?? '';

  const [inputValue, setInputValue] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [searchState, setSearchState] = useState<SearchState>(initialQuery ? 'loading' : 'idle');
  const [isFocused, setIsFocused] = useState(false);

  // Results — mutually exclusive per mode
  const [devResults, setDevResults] = useState<Post[]>([]);
  const [prodResults, setProdResults] = useState<PagefindResult[]>([]);

  // Pagefind instance ref so we init only once
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pagefindRef = useRef<any>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------ Sync URL → input when navigating back/forward ------
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    setInputValue(q);
    setQuery(q);
  }, [searchParams]);

  // ------ Core search executor ------
  const executeSearch = useCallback(
    async (q: string) => {
      const trimmed = q.trim();
      if (!trimmed) {
        setSearchState('idle');
        setDevResults([]);
        setProdResults([]);
        return;
      }

      setSearchState('loading');

      try {
        if (isDev) {
          const results = await devSearch(locale, trimmed);
          setDevResults(results);
          setProdResults([]);
        } else {
          // Production: use Pagefind
          if (!pagefindRef.current) {
            // Dynamic path prevents TypeScript from resolving the non-existent
            // module (it only exists at runtime after `next build && pagefind`).
            // webpackIgnore: runtime-only module, built by `npm run pagefind`
            // @ts-expect-error — not in node_modules, exists only after build
            pagefindRef.current = await import(/* webpackIgnore: true */ '/pagefind/pagefind.js');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (pagefindRef.current as any).init();
          }
          const raw = await pagefindRef.current.search(trimmed);
          const data: PagefindResult[] = await Promise.all(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            raw.results.map((r: any) => r.data())
          );
          setProdResults(data);
          setDevResults([]);
        }
      } catch (err) {
        console.error('[search] error:', err);
        setDevResults([]);
        setProdResults([]);
      } finally {
        setSearchState('done');
      }
    },
    [isDev, locale]
  );

  // ------ Run search when `query` changes ------
  useEffect(() => {
    executeSearch(query);
  }, [query, executeSearch]);

  // ------ Input change → debounce → push URL + update query ------
  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setInputValue(value);

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      const prefix = locale === 'ru' ? '' : `/${locale}`;
      if (value.trim()) {
        router.push(`${prefix}/search?q=${encodeURIComponent(value.trim())}`);
      } else {
        router.push(`${prefix}/search`);
      }
      setQuery(value);
    }, DEBOUNCE_MS);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      const prefix = locale === 'ru' ? '' : `/${locale}`;
      if (inputValue.trim()) {
        router.push(`${prefix}/search?q=${encodeURIComponent(inputValue.trim())}`);
      } else {
        router.push(`${prefix}/search`);
      }
      setQuery(inputValue);
    }
  }

  // ------ Derived state ------
  const totalResults = isDev ? devResults.length : prodResults.length;
  const isLoading = searchState === 'loading';
  const isDone = searchState === 'done';
  const hasQuery = query.trim().length > 0;
  const isEmpty = isDone && hasQuery && totalResults === 0;

  return (
    <>
      <AnimatedBackground />

      <div className="relative min-h-screen flex flex-col">
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 pt-[12vh] pb-16">

          {/* ------ Page heading ------ */}
          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="text-[32px] font-bold leading-[1.2] tracking-[-0.02em] text-[#0F1724] dark:text-white mb-8"
          >
            Поиск
          </motion.h1>

          {/* ------ Search input ------ */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
            className="mb-8"
          >
            <div role="search" aria-label="Поиск по сайту" className="relative w-full max-w-[680px]">
              <label htmlFor="search-input" className="sr-only">
                Поиск по сайту
              </label>

              <motion.div
                className="relative flex items-center h-[60px] rounded-full bg-white/65 dark:bg-[rgba(10,14,30,0.55)] border border-white/80 dark:border-white/12"
                style={{
                  backdropFilter: 'blur(20px) saturate(180%)',
                  boxShadow: isFocused
                    ? '0 0 0 3px rgba(59,130,246,0.35), 0 2px 20px rgba(0,0,0,0.08)'
                    : '0 2px 20px rgba(0,0,0,0.08)',
                  borderColor: isFocused ? 'rgba(59,130,246,0.60)' : undefined,
                  transition: 'box-shadow 150ms ease, border-color 150ms ease',
                }}
              >
                {/* Search icon */}
                <span
                  aria-hidden="true"
                  className="absolute left-[18px] top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150"
                  style={{
                    color: isFocused ? 'rgba(59,130,246,0.80)' : 'rgba(15,23,36,0.40)',
                  }}
                >
                  <Search size={20} />
                </span>

                <input
                  id="search-input"
                  type="search"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Введите запрос..."
                  autoComplete="off"
                  autoFocus
                  spellCheck={false}
                  className="w-full h-full bg-transparent border-none outline-none pl-[52px] pr-5 text-[17px] font-normal text-[#0F1724] dark:text-white placeholder:text-[rgba(15,23,36,0.45)] dark:placeholder:text-[rgba(255,255,255,0.40)]"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* ------ Dev mode banner ------ */}
          <AnimatePresence>
            {isDev && (
              <motion.div
                key="dev-banner"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="mb-6 overflow-hidden"
              >
                <div
                  className="rounded-[12px] px-4 py-3 text-[13px] font-medium border"
                  style={{
                    background: 'rgba(254,243,199,0.70)',
                    borderColor: 'rgba(251,191,36,0.50)',
                    color: '#92400E',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  Поиск в dev режиме — используется текстовый fallback (Pagefind недоступен без билда)
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------ Results counter ------ */}
          <AnimatePresence mode="wait">
            {isDone && hasQuery && (
              <motion.p
                key={`counter-${totalResults}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 text-[14px] text-[#0F1724]/55 dark:text-white/45"
              >
                {totalResults === 0
                  ? null
                  : `Найдено ${totalResults} ${pluralResults(totalResults)}`}
              </motion.p>
            )}
          </AnimatePresence>

          {/* ------ Loading skeletons ------ */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                key="skeletons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {Array.from({ length: 6 }).map((_, i) => (
                  <PostCardSkeleton key={i} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------ Empty state ------ */}
          <AnimatePresence>
            {isEmpty && (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="py-20 text-center"
              >
                <p className="text-[18px] font-semibold text-[#0F1724]/60 dark:text-white/50 mb-2">
                  Ничего не найдено по запросу
                </p>
                <p className="text-[15px] text-[#0F1724]/40 dark:text-white/35">
                  &laquo;{query}&raquo;
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------ Idle / no query ------ */}
          <AnimatePresence>
            {searchState === 'idle' && !hasQuery && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="py-20 text-center text-[15px] text-[#0F1724]/40 dark:text-white/35"
              >
                Введите запрос, чтобы найти статьи
              </motion.div>
            )}
          </AnimatePresence>

          {/* ------ Dev results (PostCard) ------ */}
          {!isLoading && isDev && devResults.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {devResults.map((post) => (
                <motion.div key={post.slug} variants={itemVariants}>
                  <PostCard
                    post={post}
                    locale={locale}
                    href={postHref(post, locale)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* ------ Production results (Pagefind cards) ------ */}
          {!isLoading && !isDev && prodResults.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {prodResults.map((result) => (
                <PagefindResultCard key={result.url} result={result} />
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pluralResults(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'результат';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'результата';
  return 'результатов';
}
