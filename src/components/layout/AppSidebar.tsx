'use client';

import { Home, Search, Settings, Sparkles, Compass } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';

interface NavItem {
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  labelKey: 'home' | 'discover' | 'search';
}

const NAV: NavItem[] = [
  { href: '/',         icon: Home,    labelKey: 'home' },
  { href: '/discover', icon: Compass, labelKey: 'discover' },
  { href: '/search',   icon: Search,  labelKey: 'search' },
];

interface Props {
  active?: 'home' | 'discover' | 'search';
}

export default function AppSidebar({ active }: Props) {
  const t = useTranslations('nav');
  const pathname = usePathname();

  const isActive = (key: NavItem['labelKey']) => {
    if (active) return active === key;
    if (key === 'home') return pathname === '/';
    if (key === 'discover') return pathname.startsWith('/discover');
    if (key === 'search') return pathname.startsWith('/search');
    return false;
  };

  return (
    <aside className="w-[200px] shrink-0 sticky top-4 self-start py-2">
      <div
        className="rounded-[20px] overflow-hidden flex flex-col py-5"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          border: '1px solid rgba(255,255,255,0.45)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          className="px-5 pb-4 text-[15px] font-semibold tracking-tight text-[#0F1724] dark:text-white hover:opacity-80 transition-opacity"
        >
          neversleep
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3">
          {NAV.map((item) => {
            const active = isActive(item.labelKey);
            const Icon = item.icon;
            return (
              <Link
                key={item.labelKey}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-[#3B82F6] text-white shadow-sm'
                    : 'text-[#0F1724]/70 dark:text-white/65 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]'
                }`}
              >
                <Icon size={16} />
                <span className="text-[14px] font-medium">{t(item.labelKey)}</span>
              </Link>
            );
          })}

          {/* Non-clickable soc-ai indicator */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#0F1724]/45 dark:text-white/40 cursor-default select-none"
            aria-disabled="true"
          >
            <Sparkles size={16} />
            <span className="text-[14px] font-medium flex-1">{t('socAi')}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#3B82F6]/15 text-[#3B82F6]">
              {t('soon')}
            </span>
          </div>
        </nav>

        {/* Bottom */}
        <div className="mt-6 pt-4 px-3 border-t border-black/[0.06] dark:border-white/[0.08]">
          <button
            type="button"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#0F1724]/70 dark:text-white/65 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors"
          >
            <Settings size={16} />
            <span className="text-[14px] font-medium">{t('settings')}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
