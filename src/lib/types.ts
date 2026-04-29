import { z } from 'zod';

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
  cover: z.string().optional(),
  is_editorial: z.boolean().default(true),
});

export type PostFrontmatter = z.infer<typeof PostFrontmatterSchema>;

export interface Post extends PostFrontmatter {
  content: string;
  lang: string;
  readingTime: number;
}

export type Locale = 'ru' | 'en';
export type PostType = 'guide' | 'review' | 'case' | 'list';
