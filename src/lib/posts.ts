import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostFrontmatterSchema, type Post, type PostType } from './types';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// ---------------------------------------------------------------------------
// Core loaders (memoized per-process — production builds + dev runtime)
// ---------------------------------------------------------------------------

const postsCache = new Map<string, Post[]>();

export function getPostsByLocale(lang: string): Post[] {
  const cached = postsCache.get(lang);
  if (cached) return cached;

  const dir = path.join(POSTS_DIR, lang);
  if (!fs.existsSync(dir)) {
    postsCache.set(lang, []);
    return [];
  }

  const posts = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx') && !f.startsWith('_') && !f.startsWith('.'))
    .map((filename) => {
      const raw = fs.readFileSync(path.join(dir, filename), 'utf-8');
      const { data, content } = matter(raw);
      const frontmatter = PostFrontmatterSchema.parse(data);
      const wordCount = content.split(/\s+/).length;
      return {
        ...frontmatter,
        content,
        lang,
        readingTime: Math.ceil(wordCount / 200),
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  postsCache.set(lang, posts);
  return posts;
}

export function getPostBySlug(lang: string, slug: string): Post | undefined {
  return getPostsByLocale(lang).find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// Group helpers
// ---------------------------------------------------------------------------

export function getPostsByGroup(lang: string, groupTasks: string[]): Post[] {
  return getPostsByLocale(lang).filter((p) => groupTasks.includes(p.task));
}

// ---------------------------------------------------------------------------
// Discover filter (composite: professions × tools)
// ---------------------------------------------------------------------------

export function getPostsByFilters(
  lang: string,
  filters: { professions?: string[]; tools?: string[] }
): Post[] {
  const profs = filters.professions ?? [];
  const tools = filters.tools ?? [];
  return getPostsByLocale(lang).filter((post) => {
    const profMatch = profs.length === 0 || profs.some((p) => post.professions.includes(p));
    const toolMatch = tools.length === 0 || tools.some((t) => post.tools.includes(t));
    return profMatch && toolMatch;
  });
}

// ---------------------------------------------------------------------------
// Related posts
// ---------------------------------------------------------------------------

export function getRelatedPosts(post: Post, lang: string, limit = 3): Post[] {
  return getPostsByLocale(lang)
    .filter((p) => p.slug !== post.slug && p.task === post.task)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// New helpers
// ---------------------------------------------------------------------------

export function getLatestPosts(lang: string, limit = 10): Post[] {
  return getPostsByLocale(lang).slice(0, limit);
}

export function getPostsByType(lang: string, type: PostType): Post[] {
  return getPostsByLocale(lang).filter((p) => p.type === type);
}

export function getAllPostsAllLocales(): Record<string, Post[]> {
  if (!fs.existsSync(POSTS_DIR)) return {};

  const locales = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return Object.fromEntries(locales.map((locale) => [locale, getPostsByLocale(locale)]));
}

export function searchPosts(lang: string, query: string): Post[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  if (terms.length === 0) return [];

  return getPostsByLocale(lang).filter((post) => {
    const haystack = [post.title, post.description, ...post.tags]
      .join(' ')
      .toLowerCase();
    return terms.every((term) => haystack.includes(term));
  });
}
