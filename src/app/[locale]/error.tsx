'use client';

import Link from 'next/link';
import AnimatedBackgroundClient from '@/components/home/AnimatedBackgroundClient';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <>
      <AnimatedBackgroundClient />
      <div className="min-h-screen flex items-center justify-center px-4">
        <div
          className="p-12 text-center max-w-md w-full"
          style={{
            background: 'rgba(255,255,255,0.65)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '20px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 1px 0 rgba(255,255,255,0.6) inset',
          }}
        >
          <p
            className="leading-none mb-4 font-bold"
            style={{ fontSize: '96px', color: 'rgba(15,23,36,0.15)' }}
          >
            :(
          </p>
          <h1
            className="font-bold mb-2"
            style={{ fontSize: '24px', color: '#0F1724' }}
          >
            Что-то пошло не так
          </h1>
          <p
            className="mb-8"
            style={{ fontSize: '16px', color: 'rgba(15,23,36,0.60)' }}
          >
            Произошла непредвиденная ошибка. Попробуй обновить страницу.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition-colors"
              style={{
                background: '#0F1724',
                fontSize: '15px',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Попробовать снова
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors"
              style={{
                background: 'rgba(15,23,36,0.08)',
                fontSize: '15px',
                color: '#0F1724',
                border: '1px solid rgba(15,23,36,0.12)',
              }}
            >
              На главную
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
