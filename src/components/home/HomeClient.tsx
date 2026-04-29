'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { Post } from '@/lib/types';
import type { GroupKey } from '@/lib/groups';
import HeroSearch from './HeroSearch';
import TaskGroupPills from './TaskGroupPills';

const AnimatedBackground = dynamic(
  () => import('@/components/home/AnimatedBackground'),
  { ssr: false }
);

const PostFeed = dynamic(
  () => import('@/components/home/PostFeed'),
  { loading: () => <div className="animate-pulse h-96 rounded-2xl bg-white/20" /> }
);

const heroContainer = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.55,
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
};

interface HomeClientProps {
  posts: Post[];
  locale: string;
}

export default function HomeClient({ posts, locale }: HomeClientProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedGroup, setSelectedGroup] = useState<GroupKey | null>(null);

  const resolvedHeroContainer = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : heroContainer;

  const resolvedHeroItem = shouldReduceMotion
    ? { hidden: { opacity: 1, y: 0 }, show: { opacity: 1, y: 0 } }
    : heroItem;

  return (
    <>
      <AnimatedBackground />

      <div className="relative min-h-screen flex flex-col">
        {/* Hero */}
        <section
          aria-label="Главный экран"
          className="flex flex-col items-center text-center pt-[15vh] pb-[8vh] px-4 sm:px-6 gap-6"
        >
          <motion.div
            variants={resolvedHeroContainer}
            initial="hidden"
            animate="show"
            className="flex flex-col items-center gap-5 w-full"
          >
            {/* Wordmark */}
            <motion.h1
              variants={resolvedHeroItem}
              className="font-extrabold leading-none tracking-[-0.04em] text-[#0F1724] dark:text-white"
              style={{ fontSize: 'clamp(48px, 9vw, 96px)' }}
            >
              neversleep
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={resolvedHeroItem}
              className="opacity-75 text-[#0F1724] dark:text-white font-normal"
              style={{
                fontSize: 'clamp(17px, 2.2vw, 24px)',
                lineHeight: '1.5',
                letterSpacing: '-0.01em',
              }}
            >
              ИИ под твою задачу — гайды, обзоры, кейсы
            </motion.p>

            {/* Search */}
            <motion.div variants={resolvedHeroItem} className="w-full flex justify-center">
              <HeroSearch locale={locale} />
            </motion.div>

            {/* Pill filters */}
            <motion.div variants={resolvedHeroItem} className="w-full flex justify-center">
              <TaskGroupPills
                onGroupSelect={setSelectedGroup}
                selectedGroup={selectedGroup}
              />
            </motion.div>
          </motion.div>
        </section>

        {/* Post feed */}
        <section
          aria-label="Публикации"
          className="flex-1 pb-16"
        >
          <PostFeed posts={posts} locale={locale} selectedGroup={selectedGroup} />
        </section>
      </div>
    </>
  );
}
