import type { Metadata } from 'next';

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
// Universal SEO params interface
// ---------------------------------------------------------------------------

export interface SeoParams {
  /** Page title (already localised by the caller). */
  title: string;
  /** Page description (already localised by the caller). */
  description: string;
  /** Active locale, e.g. "ru" or "en". */
  lang: string;
  /**
   * Path component of the canonical URL, shared across locales.
   * Example: `/p/chatgpt-post`, `/group/text`, `/`.
   * Must start with `/`.
   */
  canonicalPath: string;
  /**
   * Absolute URL or root-relative path of the Open Graph image.
   * When omitted no image meta is emitted (avoids referencing non-existent
   * files).
   */
  ogImage?: string;
  /** Open Graph page type. Defaults to `'website'`. */
  type?: 'website' | 'article';
}

// ---------------------------------------------------------------------------
// Universal metadata generator
// ---------------------------------------------------------------------------

/**
 * Generates a complete Next.js `Metadata` object including:
 * - `title` / `description`
 * - `alternates.canonical` + `alternates.languages` (hreflang for ru / en)
 * - Full `openGraph` block
 * - Full `twitter` block
 *
 * The base URL is resolved from `NEXT_PUBLIC_SITE_URL` so staging / production
 * environments never need code changes.
 */
export function generatePageMetadata(params: SeoParams): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://neversleep.chat';
  const { title, description, lang, canonicalPath, ogImage, type = 'website' } = params;

  const canonical = buildUrl(baseUrl, lang, canonicalPath);

  // Resolve ogImage to an absolute URL when it is root-relative.
  const ogImageAbsolute = ogImage
    ? ogImage.startsWith('http')
      ? ogImage
      : `${baseUrl.replace(/\/$/, '')}${ogImage}`
    : undefined;

  const images = ogImageAbsolute
    ? [{ url: ogImageAbsolute, width: 1200, height: 630, alt: title }]
    : undefined;

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildAlternates(baseUrl, canonicalPath),
    },
    openGraph: {
      type,
      title,
      description,
      url: canonical,
      locale: lang === 'ru' ? 'ru_RU' : 'en_US',
      ...(images ? { images } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImageAbsolute ? { images: [ogImageAbsolute] } : {}),
    },
  };
}
