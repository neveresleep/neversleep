import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { generatePageMetadata } from '@/lib/seo';
import { getPostsByFilters } from '@/lib/posts';
import AnimatedBackgroundClient from '@/components/home/AnimatedBackgroundClient';
import DiscoverToolbar from '@/components/discover/DiscoverToolbar';
import FilterDrawer from '@/components/discover/FilterDrawer';
import DiscoverCard from '@/components/discover/DiscoverCard';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ p?: string; t?: string; q?: string; filter?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'discoverPage' });
  return generatePageMetadata({
    title: `${t('title')} — neversleep`,
    description: t('metaDescription'),
    lang: locale,
    canonicalPath: '/discover',
  });
}

function parseList(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function DiscoverPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations('discoverPage');

  const profs = parseList(sp.p);
  const tools = parseList(sp.t);
  const query = (sp.q ?? '').trim();
  const drawerOpen = sp.filter === '1';
  const active = { p: profs, t: tools };

  const basePath = locale === 'ru' ? '/discover' : `/${locale}/discover`;
  const hasFilters = profs.length > 0 || tools.length > 0 || query.length > 0;

  let posts = getPostsByFilters(locale, { professions: profs, tools });
  if (query.length > 0) {
    const needle = query.toLowerCase();
    posts = posts.filter((post) => {
      const haystack = [post.title, post.description, ...post.tags]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });
  }

  return (
    <main className="relative min-h-screen">
      <AnimatedBackgroundClient />

      <div className="relative w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Heading */}
        <header className="mb-6">
          <h1 className="text-[32px] sm:text-[40px] font-bold tracking-[-0.02em] text-[#0F1724] dark:text-white">
            {t('title')}
          </h1>
          <p className="text-[14px] sm:text-[15px] text-[#0F1724]/55 dark:text-white/55 max-w-2xl mt-1.5">
            {t('subtitle')}
          </p>
        </header>

        {/* Toolbar: Filter button + Search */}
        <DiscoverToolbar
          active={active}
          query={query}
          basePath={basePath}
          filterButtonLabel={t('filterButton')}
          searchPlaceholder={t('searchPlaceholder')}
        />

        {/* Grid / empty */}
        {posts.length === 0 ? (
          <section
            className="rounded-[20px] overflow-hidden px-6 py-16 text-center"
            style={{
              background: 'rgba(255,255,255,0.55)',
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
              border: '1px solid rgba(255,255,255,0.45)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            }}
          >
            <p className="text-[16px] font-semibold text-[#0F1724]/65 dark:text-white/55 mb-1">
              {hasFilters ? t('emptyFilteredTitle') : t('emptyTitle')}
            </p>
            <p className="text-[13.5px] text-[#0F1724]/45 dark:text-white/40">
              {hasFilters ? t('emptyFilteredHint') : t('emptyHint')}
            </p>
          </section>
        ) : (
          <section className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {posts.map((post) => (
              <DiscoverCard key={post.slug} post={post} locale={locale} />
            ))}
          </section>
        )}
      </div>

      {/* Filter drawer */}
      {drawerOpen && (
        <FilterDrawer
          active={active}
          query={query}
          basePath={basePath}
          locale={locale}
          labels={{
            title: t('drawerTitle'),
            professions: t('professionsLabel'),
            tools: t('toolsLabel'),
            reset: t('reset'),
            apply: t('drawerTitle'),
            close: t('drawerClose'),
          }}
        />
      )}
    </main>
  );
}
