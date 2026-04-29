'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Post } from '@/lib/types';
import type { GroupKey } from '@/lib/groups';
import { TASK_GROUPS } from '@/lib/groups';
import PostCard from '@/components/post/PostCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface PostFeedProps {
  posts: Post[];
  locale: string;
  selectedGroup?: GroupKey | null;
}

function postHref(post: Post, locale: string): string {
  const prefix = locale === 'ru' ? '' : `/${locale}`;
  return `${prefix}/p/${post.slug}`;
}

function groupPostsByTool(posts: Post[]): Map<string, Post[]> {
  const map = new Map<string, Post[]>();
  for (const post of posts) {
    const tool = post.tools[0];
    if (!tool) continue;
    const existing = map.get(tool);
    if (existing) {
      existing.push(post);
    } else {
      map.set(tool, [post]);
    }
  }
  return map;
}

const containerVariants = {
  show: {
    transition: { staggerChildren: 0.08 },
  },
};

export default function PostFeed({ posts, locale, selectedGroup }: PostFeedProps) {
  const filteredPosts = useMemo(() => {
    if (!selectedGroup) return posts;
    const tasks = TASK_GROUPS[selectedGroup].tasks as readonly string[];
    return posts.filter((p) => tasks.includes(p.task));
  }, [posts, selectedGroup]);

  const freshPosts = useMemo(
    () => [...filteredPosts].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [filteredPosts]
  );

  const guidePosts = useMemo(
    () => filteredPosts.filter((p) => p.type === 'guide'),
    [filteredPosts]
  );

  const byToolMap = useMemo(() => groupPostsByTool(filteredPosts), [filteredPosts]);

  return (
    <section aria-label="Лента постов" className="w-full max-w-5xl mx-auto px-4 sm:px-6">
      <Tabs defaultValue="fresh">
        <TabsList
          variant="line"
          className="mb-8 gap-6 border-b border-white/20 dark:border-white/10 w-full rounded-none justify-start"
        >
          <TabsTrigger value="fresh" className="text-[15px] pb-2 px-0">
            Свежее
          </TabsTrigger>
          <TabsTrigger value="byTool" className="text-[15px] pb-2 px-0">
            По инструментам
          </TabsTrigger>
          <TabsTrigger value="guides" className="text-[15px] pb-2 px-0">
            Гайды
          </TabsTrigger>
        </TabsList>

        {/* --- Свежее --- */}
        <TabsContent value="fresh">
          {freshPosts.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {freshPosts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  locale={locale}
                  href={postHref(post, locale)}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>

        {/* --- По инструментам --- */}
        <TabsContent value="byTool">
          {byToolMap.size === 0 ? (
            <EmptyState />
          ) : (
            <div className="flex flex-col gap-10">
              {Array.from(byToolMap.entries()).map(([tool, toolPosts]) => (
                <section key={tool} aria-label={`Инструмент: ${tool}`}>
                  <h3 className="text-[20px] font-bold tracking-[-0.02em] text-[#0F1724] dark:text-white mb-4 capitalize">
                    {tool}
                  </h3>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {toolPosts.map((post) => (
                      <PostCard
                        key={post.slug}
                        post={post}
                        locale={locale}
                        href={postHref(post, locale)}
                      />
                    ))}
                  </motion.div>
                </section>
              ))}
            </div>
          )}
        </TabsContent>

        {/* --- Гайды --- */}
        <TabsContent value="guides">
          {guidePosts.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {guidePosts.map((post) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  locale={locale}
                  href={postHref(post, locale)}
                />
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="py-16 text-center text-[15px] text-[#0F1724]/50 dark:text-white/40">
      Здесь пока пусто. Заходи позже — мы работаем.
    </div>
  );
}
