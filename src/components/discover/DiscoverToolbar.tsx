import Link from 'next/link';
import { SlidersHorizontal, Search } from 'lucide-react';

interface Props {
  active: { p: string[]; t: string[] };
  query: string;
  basePath: string;
  filterButtonLabel: string;
  searchPlaceholder: string;
}

function buildOpenFilterUrl(
  basePath: string,
  state: { p: string[]; t: string[]; q: string }
): string {
  const params = new URLSearchParams();
  if (state.p.length) params.set('p', state.p.join(','));
  if (state.t.length) params.set('t', state.t.join(','));
  if (state.q) params.set('q', state.q);
  params.set('filter', '1');
  return `${basePath}?${params.toString()}`;
}

export default function DiscoverToolbar({
  active,
  query,
  basePath,
  filterButtonLabel,
  searchPlaceholder,
}: Props) {
  const activeCount = active.p.length + active.t.length;
  const openHref = buildOpenFilterUrl(basePath, { ...active, q: query });

  return (
    <div className="flex items-center gap-3 mb-8">
      {/* Filter button */}
      <Link
        href={openHref}
        scroll={false}
        className="inline-flex items-center gap-2 h-12 px-5 rounded-full bg-white/85 border border-white text-[#0F1724] text-[14px] font-semibold shadow-sm hover:bg-white transition-colors shrink-0"
        style={{ backdropFilter: 'blur(12px)' }}
      >
        <SlidersHorizontal size={16} />
        {filterButtonLabel}
        {activeCount > 0 && (
          <span className="ml-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-[#0F1724] text-white">
            {activeCount}
          </span>
        )}
      </Link>

      {/* Search input */}
      <form action={basePath} method="get" className="relative flex-1 min-w-0">
        {/* Preserve current filters when submitting search */}
        {active.p.length > 0 && (
          <input type="hidden" name="p" value={active.p.join(',')} />
        )}
        {active.t.length > 0 && (
          <input type="hidden" name="t" value={active.t.join(',')} />
        )}

        <Search
          size={18}
          className="absolute left-5 top-1/2 -translate-y-1/2 text-[#0F1724]/45 pointer-events-none"
          aria-hidden
        />
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder={searchPlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full h-12 pl-12 pr-5 rounded-full bg-white/65 border border-white/80 text-[14px] text-[#0F1724] placeholder:text-[#0F1724]/45 outline-none focus:border-[#3B82F6]/60 focus:ring-2 focus:ring-[#3B82F6]/25 transition"
          style={{ backdropFilter: 'blur(12px)' }}
        />
      </form>
    </div>
  );
}
