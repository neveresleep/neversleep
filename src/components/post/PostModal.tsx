'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  closeLabel?: string;
}

export default function PostModal({ children, closeLabel = 'Закрыть' }: Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  const close = () => router.back();

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Lock background scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label={closeLabel}
        onClick={close}
        className="fixed inset-0 bg-black/75 backdrop-blur-md cursor-default"
      />

      {/* Sheet */}
      <div
        ref={dialogRef}
        className="relative z-10 w-full max-w-3xl my-6 sm:my-10 mx-3 sm:mx-6 rounded-[20px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.4)] overflow-hidden"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={close}
          aria-label={closeLabel}
          className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/85 text-[#0F1724] shadow-md hover:bg-white transition-colors"
          style={{ backdropFilter: 'blur(12px)' }}
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Content (scrolls inside the sheet) */}
        <div className="px-4 sm:px-8 pt-12 pb-12">
          {children}
        </div>
      </div>
    </div>
  );
}
