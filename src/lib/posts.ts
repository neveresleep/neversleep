import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { PostFrontmatterSchema, type Post } from './types';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');

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

export function getAllTools(lang: string): string[] {
  const posts = getPostsByLocale(lang);
  return [...new Set(posts.flatMap((p) => p.tools))].sort();
}

export function getPostsByTool(lang: string, tool: string): Post[] {
  return getPostsByLocale(lang).filter((p) => p.tools.includes(tool));
}

export function getPostsByGroup(lang: string, groupTasks: string[]): Post[] {
  return getPostsByLocale(lang).filter((p) => groupTasks.includes(p.task));
}

export function getRelatedPosts(post: Post, lang: string, limit = 3): Post[] {
  return getPostsByLocale(lang)
    .filter(
      (p) =>
        p.slug !== post.slug &&
        (p.task === post.task || p.tools.some((t) => post.tools.includes(t)))
    )
    .slice(0, limit);
}
