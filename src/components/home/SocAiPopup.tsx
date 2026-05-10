'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Sparkles, X } from 'lucide-react';

const STORAGE_DISMISSED = 'socai_dismissed';
const STORAGE_SUBSCRIBED = 'socai_subscribed';
const STORAGE_WAITLIST = 'socai_waitlist';
const AUTO_DELAY_MS = 0;

const MOCK_PROFILES = [
  { initials: 'MK', color: '#7C3AED' },
  { initials: 'AB', color: '#059669' },
  { initials: 'IS', color: '#D97706' },
];

export default function SocAiPopup() {
  const t = useTranslations('socAi');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const dismissed = window.localStorage.getItem(STORAGE_DISMISSED) === '1';
    const subscribed = window.localStorage.getItem(STORAGE_SUBSCRIBED) === '1';
    if (subscribed) setSubmitted(true);
    if (dismissed || subscribed) return;

    const timer = window.setTimeout(() => setOpen(true), AUTO_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, []);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open || typeof window === 'undefined') return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function close() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_DISMISSED, '1');
    } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const value = email.trim();
    if (!value) return;
    try {
      const stored = JSON.parse(window.localStorage.getItem(STORAGE_WAITLIST) ?? '[]') as string[];
      if (!stored.includes(value)) stored.push(value);
      window.localStorage.setItem(STORAGE_WAITLIST, JSON.stringify(stored));
      window.localStorage.setItem(STORAGE_SUBSCRIBED, '1');
    } catch {}
    setSubmitted(true);
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="socai-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label={t('ariaLabel')}
        >
          <motion.div
            key="socai-modal"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[460px]"
          >
            <div
              className="rounded-[24px] overflow-hidden p-6 sm:p-7 relative"
              style={{
                background: 'rgba(255,255,255,0.96)',
                border: '1px solid rgba(255,255,255,0.7)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.12)',
              }}
            >
              {/* Close */}
              <button
                type="button"
                onClick={close}
                aria-label={t('close')}
                className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-[#0F1724]/55 hover:bg-black/[0.06] transition-colors"
              >
                <X size={18} />
              </button>

              {/* Tag */}
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={15} className="text-[#3B82F6]" />
                <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-[#3B82F6]">
                  soc-ai
                </span>
                <span className="text-[9px] font-semibold tracking-[0.10em] uppercase px-1.5 py-0.5 rounded-full bg-[#3B82F6]/12 text-[#3B82F6]">
                  {t('soon')}
                </span>
              </div>

              {/* Hook */}
              <h2 className="text-[22px] sm:text-[24px] font-bold leading-[1.2] tracking-[-0.01em] text-[#0F1724] mb-2 pr-8">
                {t('hook')}
              </h2>

              {/* Bait */}
              <p className="text-[14px] leading-[1.5] text-[#0F1724]/70 mb-5">
                {t('bait')}
              </p>

              {/* Mock avatars + social proof */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex -space-x-2">
                  {MOCK_PROFILES.map((p) => (
                    <div
                      key={p.initials}
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-white"
                      style={{ background: p.color }}
                      aria-hidden
                    >
                      {p.initials}
                    </div>
                  ))}
                </div>
                <span className="text-[12px] text-[#0F1724]/55">
                  {t('socialProof')}
                </span>
              </div>

              {/* Form / success */}
              {submitted ? (
                <div
                  className="rounded-[12px] px-4 py-3 text-[13.5px] font-medium"
                  style={{
                    background: 'rgba(16,185,129,0.12)',
                    border: '1px solid rgba(16,185,129,0.30)',
                    color: '#047857',
                  }}
                >
                  {t('thanks')}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
                  <label htmlFor="socai-email" className="sr-only">
                    {t('emailLabel')}
                  </label>
                  <input
                    id="socai-email"
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    className="flex-1 h-11 px-4 rounded-full bg-white border border-black/[0.10] text-[14px] text-[#0F1724] placeholder:text-[#0F1724]/40 outline-none focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/25 transition"
                  />
                  <button
                    type="submit"
                    className="h-11 px-5 rounded-full bg-[#0F1724] text-white text-[13.5px] font-semibold hover:bg-[#1f2a3d] transition-colors whitespace-nowrap"
                  >
                    {t('cta')}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
