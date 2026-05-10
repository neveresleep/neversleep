'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { usePathname, useRouter, Link } from '@/i18n/navigation';
import { useEffect, useState } from 'react';

export default function Header() {
  const t = useTranslations('nav');
  const tTheme = useTranslations('theme');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function switchLocale() {
    const nextLocale = locale === 'ru' ? 'en' : 'ru';
    router.replace(pathname, { locale: nextLocale });
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-semibold text-base tracking-tight hover:opacity-80 transition-opacity">
          {t('logo')}
        </Link>

        {/* Nav + controls */}
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-4">
            <Link
              href="/discover"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('discover')}
            </Link>
            <Link
              href="/search"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('search')}
            </Link>
            <span className="text-sm text-muted-foreground/60 flex items-center gap-1.5 cursor-default select-none">
              soc-ai
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6]">
                {t('soon')}
              </span>
            </span>
            <Link
              href="/about"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('about')}
            </Link>
          </nav>

          {/* Language switcher */}
          <button
            onClick={switchLocale}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wide"
            aria-label={locale === 'ru' ? 'Switch to English' : 'Переключить на русский'}
          >
            {locale === 'ru' ? 'EN' : 'RU'}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={mounted && theme === 'dark' ? tTheme('light') : tTheme('dark')}
          >
            {mounted && theme === 'dark' ? (
              <Sun size={16} aria-hidden />
            ) : (
              <Moon size={16} aria-hidden />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
