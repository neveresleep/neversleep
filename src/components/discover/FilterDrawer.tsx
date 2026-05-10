import Link from 'next/link';
import { ArrowLeft, Users, Wrench, Check } from 'lucide-react';
import { PROFESSIONS } from '@/lib/professions';
import { TOOLS } from '@/lib/tools';

interface Props {
  active: { p: string[]; t: string[] };
  query: string;
  basePath: string;
  locale: string;
  labels: {
    title: string;
    professions: string;
    tools: string;
    reset: string;
    apply: string;
    close: string;
  };
}

function buildUrl(
  basePath: string,
  state: { p: string[]; t: string[]; q: string },
  options: { filter: boolean }
): string {
  const params = new URLSearchParams();
  if (state.p.length) params.set('p', state.p.join(','));
  if (state.t.length) params.set('t', state.t.join(','));
  if (state.q) params.set('q', state.q);
  if (options.filter) params.set('filter', '1');
  const qs = params.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

function buildToggleUrl(
  basePath: string,
  current: { p: string[]; t: string[]; q: string },
  toggle: { type: 'p' | 't'; slug: string }
): string {
  const next = { ...current, p: [...current.p], t: [...current.t] };
  const arr = next[toggle.type];
  next[toggle.type] = arr.includes(toggle.slug)
    ? arr.filter((s) => s !== toggle.slug)
    : [...arr, toggle.slug];
  return buildUrl(basePath, next, { filter: true });
}

export default function FilterDrawer({ active, query, basePath, locale, labels }: Props) {
  const closeUrl = buildUrl(basePath, { ...active, q: query }, { filter: false });
  const resetUrl = buildUrl(basePath, { p: [], t: [], q: query }, { filter: true });
  const hasActive = active.p.length > 0 || active.t.length > 0;

  return (
    <>
      {/* Backdrop — click closes drawer */}
      <Link
        href={closeUrl}
        scroll={false}
        aria-label={labels.close}
        className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
      />

      {/* Drawer */}
      <aside
        className="fixed top-0 left-0 bottom-0 z-40 w-[320px] sm:w-[360px] flex flex-col"
        style={{
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderRight: '1px solid rgba(0,0,0,0.06)',
          boxShadow: '0 16px 48px rgba(0,0,0,0.18)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-black/[0.06]">
          <Link
            href={closeUrl}
            scroll={false}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-full bg-white border border-[#3B82F6] text-[#0F1724] text-[13px] font-semibold hover:bg-[#EFF6FF] transition-colors"
            aria-label={labels.close}
          >
            <ArrowLeft size={14} />
            {labels.title}
          </Link>
          {hasActive && (
            <Link
              href={resetUrl}
              scroll={false}
              className="text-[12px] font-medium text-[#3B82F6] hover:underline"
            >
              {labels.reset}
            </Link>
          )}
        </div>

        {/* Sections */}
        <div className="flex-1 overflow-y-auto px-1 py-2">
          <FilterSection
            type="p"
            icon={<Users size={16} />}
            label={labels.professions}
            active={active}
            query={query}
            basePath={basePath}
            locale={locale}
            defaultOpen
          />
          <FilterSection
            type="t"
            icon={<Wrench size={16} />}
            label={labels.tools}
            active={active}
            query={query}
            basePath={basePath}
            locale={locale}
          />
        </div>
      </aside>
    </>
  );
}

interface SectionProps {
  type: 'p' | 't';
  icon: React.ReactNode;
  label: string;
  active: { p: string[]; t: string[] };
  query: string;
  basePath: string;
  locale: string;
  defaultOpen?: boolean;
}

function FilterSection({
  type,
  icon,
  label,
  active,
  query,
  basePath,
  locale,
  defaultOpen,
}: SectionProps) {
  const items =
    type === 'p'
      ? PROFESSIONS.map((p) => ({
          slug: p.slug,
          label: locale === 'ru' ? p.ru : p.en,
          color: p.color,
          letter: p.letter,
        }))
      : TOOLS.map((t) => ({
          slug: t.slug,
          label: t.name,
          color: t.color,
          letter: t.letter,
        }));

  const activeList = active[type];
  const activeCount = activeList.length;

  return (
    <details
      className="group border-b border-black/[0.06] last:border-b-0"
      open={defaultOpen}
    >
      <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-black/[0.02] transition-colors [&::-webkit-details-marker]:hidden">
        <span className="text-[#0F1724]/65">{icon}</span>
        <span className="flex-1 text-[14px] font-semibold text-[#0F1724]">
          {label}
        </span>
        {activeCount > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#3B82F6] text-white">
            {activeCount}
          </span>
        )}
        <svg
          className="text-[#0F1724]/45 transition-transform duration-200 group-open:rotate-180"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </summary>

      <ul className="pb-2">
        {items.map((item) => {
          const isActive = activeList.includes(item.slug);
          const href = buildToggleUrl(
            basePath,
            { ...active, q: query },
            { type, slug: item.slug }
          );
          return (
            <li key={item.slug}>
              <Link
                href={href}
                scroll={false}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-black/[0.04] transition-colors"
              >
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: item.color }}
                  aria-hidden
                >
                  {item.letter}
                </span>
                <span className="flex-1 text-[13.5px] text-[#0F1724]">
                  {item.label}
                </span>
                <span
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#0F1724] border-[#0F1724] text-white'
                      : 'bg-white border-black/15 text-transparent'
                  }`}
                  aria-hidden
                >
                  <Check size={12} strokeWidth={3} />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </details>
  );
}
