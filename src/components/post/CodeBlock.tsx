'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export default function CodeBlock({ children }: Props) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  const onCopy = async () => {
    const text = preRef.current?.innerText ?? '';
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard not available — silently ignore
    }
  };

  return (
    <div className="relative my-6 group">
      <button
        type="button"
        onClick={onCopy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute top-3 right-3 z-10 inline-flex items-center justify-center h-8 w-8 rounded-lg bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>

      <pre
        ref={preRef}
        className="overflow-x-auto rounded-xl bg-gray-900 px-5 py-4 pr-12 text-[14px] leading-relaxed text-gray-100 shadow-md"
      >
        {children}
      </pre>
    </div>
  );
}
