'use server';

import { searchPosts } from '@/lib/posts';
import type { Post } from '@/lib/types';

export async function searchPostsAction(lang: string, query: string): Promise<Post[]> {
  if (!query.trim()) return [];
  return searchPosts(lang, query);
}
