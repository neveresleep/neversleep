import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { AnimatedBackgroundClient } from '@/components/home/AnimatedBackgroundClient';

const TOOLS = [
  { name: 'ChatGPT',    slug: 'chatgpt',    color: '#10A37F', letter: 'G' },
  { name: 'Claude',     slug: 'claude',     color: '#C96442', letter: 'C' },
  { name: 'Gemini',     slug: 'gemini',     color: '#4285F4', letter: 'G' },
  { name: 'Midjourney', slug: 'midjourney', color: '#111827', letter: 'M' },
  { name: 'n8n',        slug: 'n8n',        color: '#EA4B71', letter: 'n' },
  { name: 'Notion',     slug: 'notion',     color: '#000000', letter: 'N' },
];

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function ToolsIndexPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('nav');

  const toolHref = (slug: string) =>
    `${locale === 'ru' ? '' : `/${locale}`}/tools/${slug}`;

  return (
    <main className="relative min-h-screen flex flex-col">
      <AnimatedBackgroundClient />

      <div className="flex-1 flex items-start justify-start px-4 sm:px-8 pt-10 pb-16">
        {/* Glass card — left side */}
        <div
          className="w-full max-w-xs rounded-[20px] overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.55)',
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            border: '1px solid rgba(255,255,255,0.45)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Card header */}
          <div className="px-5 pt-5 pb-3">
            <span className="text-[13px] font-semibold text-[#0F1724]/60 dark:text-white/55 tracking-wide uppercase">
              {t('tools')}
            </span>
          </div>

          {/* Tool list — alphabetical */}
          <ul className="pb-3">
            {TOOLS.map((tool) => (
              <li key={tool.slug}>
                <Link
                  href={toolHref(tool.slug)}
                  className="group flex items-center gap-3 px-5 py-3 hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors duration-150"
                >
                  <div
                    className="shrink-0 w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[14px] font-bold shadow-sm group-hover:scale-105 transition-transform duration-150"
                    style={{ background: tool.color }}
                  >
                    {tool.letter}
                  </div>
                  <span className="text-[14px] font-medium text-[#0F1724] dark:text-white group-hover:text-[#3B82F6] transition-colors">
                    {tool.name}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
