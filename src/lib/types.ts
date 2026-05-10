import { z } from 'zod';
import type { GroupKey } from './groups';

// Re-export GroupKey so consumers can import it from a single types module
export type { GroupKey };

// ---------------------------------------------------------------------------
// Zod schema & inferred types
// ---------------------------------------------------------------------------

export const PostFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  task: z.string(),
  type: z.enum(['guide', 'review', 'case', 'list']),
  tags: z.array(z.string()).default([]),
  professions: z.array(z.string()).default([]),
  tools: z.array(z.string()).default([]),
  media: z.enum(['text', 'image', 'video', '3d']).default('text'),
  languages: z.array(z.string()).default(['ru']),
  date: z.coerce.date(),
  source: z.string().optional(),
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
