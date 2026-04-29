'use client';

import dynamic from 'next/dynamic';

const AnimatedBackground = dynamic(
  () => import('@/components/home/AnimatedBackground'),
  { ssr: false }
);

export default function AnimatedBackgroundClient() {
  return <AnimatedBackground />;
}
