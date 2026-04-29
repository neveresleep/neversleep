import { z } from 'zod';
import type { GroupKey } from './groups';

// Re-export GroupKey so consumers can import it from a single types module
export type { GroupKey };

// ---------------------------------------------------------------------------
// Branded types
// ---------------------------------------------------------------------------

/** Branded string for tool slugs — prevents mixing raw strings with slug values */
export type ToolSlug = string & { readonly brand: unique symbol };

/** Helper to cast a raw string to a ToolSlug without a runtime cost */
export function toToolSlug(raw: string): ToolSlug {
  return raw as ToolSlug;
}

// ---------------------------------------------------------------------------
// Zod schema & inferred types
// ---------------------------------------------------------------------------

export const PostFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  task: z.string(),
  tools: z.array(z.string()),
  type: z.enum(['guide', 'review', 'case', 'list']),
  tags: z.array(z.string()).default([]),
  languages: z.array(z.string()).default(['ru']),
  date: z.coerce.date(),
  source: z.string().url().optional(),
  cover: z.string().url().or(z.string().regex(/^\//)).optional(),
  is_editorial: z.boolean().default(true),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

// ---------------------------------------------------------------------------
// Post — extends frontmatter with computed/runtime fields
// ---------------------------------------------------------------------------

export interface Post extends PostFrontmatter {
  /** Raw MDX source */
  content: string;
  /** ISO 639-1 locale this post was loaded from (e.g. "ru", "en") */
  lang: string;
  /** Estimated reading time in minutes (word count / 200) */
  readingTime: number;
}

// ---------------------------------------------------------------------------
// Scalar helpers
// ---------------------------------------------------------------------------

export type Locale = 'ru' | 'en';
export type PostType = 'guide' | 'review' | 'case' | 'list';
export type TimeOfDay = 'morning' | 'day' | 'evening' | 'night';

// ---------------------------------------------------------------------------
// ToolPage — aggregate type for /tools/[slug] pages
// ---------------------------------------------------------------------------

export interface ToolPage {
  /** Tool slug (URL-safe identifier, e.g. "chatgpt") */
  slug: string;
  /** All posts mentioning this tool, sorted by date desc */
  posts: Post[];
  /** Date of the earliest post that first referenced this tool */
  firstSeen: Date;
}
