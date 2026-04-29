'use server';

import { searchPosts } from '@/lib/posts';
import type { Post } from '@/lib/types';

const ALLOWED_LOCALES = new Set(['ru', 'en']);

export async function searchPostsAction(lang: string, query: string): Promise<Post[]> {
  if (!ALLOWED_LOCALES.has(lang)) return [];
  const trimmed = query.trim().slice(0, 200);
  if (!trimmed) return [];
  return searchPosts(lang, trimmed);
}
