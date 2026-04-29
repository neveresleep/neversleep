import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostFrontmatterSchema, type Post, type PostType, type ToolPage } from './types';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

// ---------------------------------------------------------------------------
// Core loaders
// ---------------------------------------------------------------------------

export function getPostsByLocale(lang: string): Post[] {
  const dir = path.join(POSTS_DIR, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
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
}

export function getPostBySlug(lang: string, slug: string): Post | undefined {
  return getPostsByLocale(lang).find((p) => p.slug === slug);
}

// ---------------------------------------------------------------------------
// Tool helpers
// ---------------------------------------------------------------------------

export function getAllTools(lang: string): string[] {
  const posts = getPostsByLocale(lang);
  return [...new Set(posts.flatMap((p) => p.tools))].sort();
}

export function getPostsByTool(lang: string, tool: string): Post[] {
  return getPostsByLocale(lang).filter((p) => p.tools.includes(tool));
}

// ---------------------------------------------------------------------------
// Group helpers
// ---------------------------------------------------------------------------

export function getPostsByGroup(lang: string, groupTasks: string[]): Post[] {
  return getPostsByLocale(lang).filter((p) => groupTasks.includes(p.task));
}

// ---------------------------------------------------------------------------
// Related posts
// ---------------------------------------------------------------------------

export function getRelatedPosts(post: Post, lang: string, limit = 3): Post[] {
  return getPostsByLocale(lang)
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.task === post.task || p.tools.some((t) => post.tools.includes(t)))
    )
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// New helpers
// ---------------------------------------------------------------------------

/**
 * Returns the most recent `limit` posts for a locale (already sorted desc by
 * date from getPostsByLocale, so we just slice).
 */
export function getLatestPosts(lang: string, limit = 10): Post[] {
  return getPostsByLocale(lang).slice(0, limit);
}

/**
 * Filters posts by their `type` field (guide | review | case | list).
 */
export function getPostsByType(lang: string, type: PostType): Post[] {
  return getPostsByLocale(lang).filter((p) => p.type === type);
}

/**
 * Returns all posts keyed by locale — useful for generating a full sitemap
 * without calling getPostsByLocale multiple times.
 *
 * Discovered locales are the subdirectories that actually exist under
 * POSTS_DIR so no hard-coded list is needed.
 */
export function getAllPostsAllLocales(): Record<string, Post[]> {
  if (!fs.existsSync(POSTS_DIR)) return {};

  const locales = fs
    .readdirSync(POSTS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  return Object.fromEntries(locales.map((locale) => [locale, getPostsByLocale(locale)]));
}

/**
 * Builds a list of ToolPage objects for a locale, sorted by post count
 * (most-covered tool first).  `firstSeen` is the date of the oldest post
 * referencing that tool.
 */
export function getToolsWithPosts(lang: string): ToolPage[] {
  const posts = getPostsByLocale(lang);

  const map = new Map<string, Post[]>();
  for (const post of posts) {
    for (const tool of post.tools) {
      const existing = map.get(tool);
      if (existing) {
        existing.push(post);
      } else {
        map.set(tool, [post]);
      }
    }
  }

  return Array.from(map.entries())
    .map(([slug, toolPosts]): ToolPage => {
      // Posts are already sorted desc; the last one is the oldest
      const sorted = [...toolPosts].sort((a, b) => a.date.getTime() - b.date.getTime());
      return {
        slug,
        posts: toolPosts.sort((a, b) => b.date.getTime() - a.date.getTime()),
        firstSeen: sorted[0]!.date,
      };
    })
    .sort((a, b) => b.posts.length - a.posts.length);
}

/**
 * Simple text search over `title`, `description`, and `tags`.
 * Case-insensitive, space-separated terms are ANDed together.
 * Intended as a dev-time fallback when Pagefind is unavailable.
 */
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
