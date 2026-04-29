import type { Metadata } from 'next';
import type { Post } from './types';
import type { GroupKey } from './groups';
import { TASK_GROUPS } from './groups';

// ---------------------------------------------------------------------------
// Routing constants
// Mirrors src/i18n/routing.ts without importing it (avoids next-intl pulling
// in server-only code in shared utility contexts).
// ---------------------------------------------------------------------------

const LOCALES = ['ru', 'en'] as const;
const DEFAULT_LOCALE = 'ru' as const;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Builds a canonical/alternate URL.
 * Default locale (`ru`) has no prefix (localePrefix: "as-needed").
 * All other locales are prefixed with `/<locale>`.
 */
function buildUrl(baseUrl: string, lang: string, pathname: string): string {
  const base = baseUrl.replace(/\/$/, '');
  const prefix = lang === DEFAULT_LOCALE ? '' : `/${lang}`;
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${base}${prefix}${path}`;
}

/**
 * Produces an `alternates.languages` record accepted by Next.js `Metadata`.
 * Includes an `x-default` entry pointing at the default-locale URL.
 */
function buildAlternates(
  baseUrl: string,
  pathname: string
): NonNullable<Metadata['alternates']>['languages'] {
  const result: Record<string, string> = {};
  for (const locale of LOCALES) {
    result[locale] = buildUrl(baseUrl, locale, pathname);
  }
  result['x-default'] = buildUrl(baseUrl, DEFAULT_LOCALE, pathname);
  return result;
}

// ---------------------------------------------------------------------------
// Post page metadata
// ---------------------------------------------------------------------------

/**
 * Generates full Next.js `Metadata` for an individual blog post page.
 *
 * @param post     The Post object (already loaded for the target lang).
 * @param lang     Active locale, e.g. "ru" or "en".
 * @param baseUrl  Production origin, e.g. "https://neversleep.ru".
 */
export function generatePostMetadata(post: Post, lang: string, baseUrl: string): Metadata {
  const pathname = `/posts/${post.slug}`;
  const canonical = buildUrl(baseUrl, lang, pathname);

  const ogImage = post.cover
    ? post.cover.startsWith('http')
      ? post.cover
      : buildUrl(baseUrl, lang, post.cover)
    : `${baseUrl.replace(/\/$/, '')}/og-default.png`;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical,
      languages: buildAlternates(baseUrl, pathname),
    },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description,
      url: canonical,
      locale: lang === 'ru' ? 'ru_RU' : 'en_US',
      publishedTime: post.date.toISOString(),
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Tool page metadata
// ---------------------------------------------------------------------------

const TOOL_PAGE_LABELS: Record<string, { ru: string; en: string }> = {
  default: {
    ru: 'Руководства и обзоры',
    en: 'Guides & reviews',
  },
};

/**
 * Generates `Metadata` for a tool landing page (`/tools/[slug]`).
 *
 * @param toolSlug  URL-safe tool identifier, e.g. "chatgpt".
 * @param postCount Number of posts associated with this tool.
 * @param lang      Active locale.
 * @param baseUrl   Production origin.
 */
export function generateToolPageMetadata(
  toolSlug: string,
  postCount: number,
  lang: string,
  baseUrl = ''
): Metadata {
  const label = TOOL_PAGE_LABELS['default']?.[lang as 'ru' | 'en'] ?? TOOL_PAGE_LABELS['default']!.en;
  const pathname = `/tools/${toolSlug}`;
  const canonical = buildUrl(baseUrl, lang, pathname);
  const ogImage = `${baseUrl.replace(/\/$/, '')}/og-default.png`;

  const title =
    lang === 'ru'
      ? `${toolSlug} — ${label} (${postCount})`
      : `${toolSlug} — ${label} (${postCount})`;

  const description =
    lang === 'ru'
      ? `Все материалы про ${toolSlug}: инструкции, кейсы и обзоры. ${postCount} публикаций.`
      : `All content about ${toolSlug}: guides, cases and reviews. ${postCount} posts.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildAlternates(baseUrl, pathname),
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      locale: lang === 'ru' ? 'ru_RU' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

// ---------------------------------------------------------------------------
// Group page metadata
// ---------------------------------------------------------------------------

/**
 * Generates `Metadata` for a task-group page (`/groups/[key]`).
 *
 * @param groupKey  One of the keys from TASK_GROUPS, e.g. "text".
 * @param lang      Active locale.
 * @param baseUrl   Production origin.
 */
export function generateGroupPageMetadata(
  groupKey: GroupKey,
  lang: string,
  baseUrl = ''
): Metadata {
  const group = TASK_GROUPS[groupKey];
  const pathname = `/groups/${groupKey}`;
  const canonical = buildUrl(baseUrl, lang, pathname);
  const ogImage = `${baseUrl.replace(/\/$/, '')}/og-default.png`;

  // Derive human-readable labels from the i18n key stored in group.labelKey
  // ("groups.text" → "text") while keeping it generic enough to handle
  // future keys. Full translations live in the i18n JSON files; here we
  // provide a safe fallback.
  const rawLabel = group.labelKey.split('.').pop() ?? groupKey;
  const title =
    lang === 'ru'
      ? `Группа задач: ${rawLabel}`
      : `Task group: ${rawLabel}`;
  const description =
    lang === 'ru'
      ? `Материалы блога по задачам группы «${rawLabel}»: ${group.tasks.join(', ')}.`
      : `Blog posts for task group "${rawLabel}": ${group.tasks.join(', ')}.`;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildAlternates(baseUrl, pathname),
    },
    openGraph: {
      type: 'website',
      title,
      description,
      url: canonical,
      locale: lang === 'ru' ? 'ru_RU' : 'en_US',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}
