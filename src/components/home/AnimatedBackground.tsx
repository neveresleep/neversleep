'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { TimeOfDay } from '@/lib/types';

interface GradientConfig {
  gradient: string;
  textColor: string;
  isDark: boolean;
}

const GRADIENTS: Record<TimeOfDay, GradientConfig> = {
  morning: {
    gradient: 'linear-gradient(180deg, #FFF1E6 0%, #FFD6A5 45%, #AECBFA 100%)',
    textColor: '#1A1A2E',
    isDark: false,
  },
  day: {
    gradient: 'linear-gradient(180deg, #E8F4FD 0%, #B8D9F8 50%, #D4EAFF 100%)',
    textColor: '#0F1724',
    isDark: false,
  },
  evening: {
    gradient: 'linear-gradient(180deg, #FF6B35 0%, #C9184A 40%, #560BAD 100%)',
    textColor: '#FFFFFF',
    isDark: true,
  },
  night: {
    gradient: 'linear-gradient(180deg, #0B0E1A 0%, #0D1B4B 50%, #1A1035 100%)',
    textColor: '#FFFFFF',
    isDark: true,
  },
};

function getTimeOfDay(hours: number): TimeOfDay {
  if (hours >= 6 && hours < 12) return 'morning';
  if (hours >= 12 && hours < 18) return 'day';
  if (hours >= 18 && hours < 22) return 'evening';
  return 'night';
}

interface Star {
  id: number;
  left: string;
  top: string;
  duration: string;
  delay: string;
}

function generateStars(count: number): Star[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 70}%`,
    duration: `${2 + Math.random() * 4}s`,
    delay: `${Math.random() * 5}s`,
  }));
}

interface AnimatedBackgroundProps {
  className?: string;
}

export default function AnimatedBackground({ className }: AnimatedBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();

  // SSR default: day gradient (neutral light)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('day');
  const [stars, setStars] = useState<Star[]>([]);
  const [mounted, setMounted] = useState(false);
  const starsRef = useRef<Star[]>([]);

  useEffect(() => {
    const tod = getTimeOfDay(new Date().getHours());
    setTimeOfDay(tod);
    setMounted(true);

    if (tod === 'night') {
      const generated = generateStars(100);
      starsRef.current = generated;
      setStars(generated);
    }
  }, []);

  const config = GRADIENTS[timeOfDay];
  const transitionDuration = shouldReduceMotion ? 0 : 2.0;

  return (
    <>
      <motion.div
        aria-hidden="true"
        className={`fixed inset-0 -z-10 ${className ?? ''}`}
        animate={{ background: config.gradient }}
        transition={{ duration: transitionDuration, ease: 'easeInOut' }}
        style={{
          background: mounted ? config.gradient : GRADIENTS.day.gradient,
        }}
      />

      <AnimatePresence>
        {mounted && timeOfDay === 'night' && (
          <motion.div
            aria-hidden="true"
            className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 1.5, ease: 'easeInOut' }}
          >
            {stars.map((star) => (
              <span
                key={star.id}
                className="star"
                style={
                  {
                    left: star.left,
                    top: star.top,
                    '--duration': star.duration,
                    '--delay': star.delay,
                  } as React.CSSProperties
                }
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
