import type { MDXComponents } from 'mdx/types';
import Image from 'next/image';
import Link from 'next/link';

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <h1 className="mt-10 mb-4 text-3xl font-bold tracking-tight text-gray-900 leading-tight">
      {children}
    </h1>
  ),

  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 text-2xl font-bold tracking-tight text-gray-900 leading-snug">
      {children}
    </h2>
  ),

  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 text-xl font-semibold tracking-tight text-gray-800 leading-snug">
      {children}
    </h3>
  ),

  p: ({ children }) => (
    <p className="mb-5 text-[18px] leading-[1.75] text-gray-700">
      {children}
    </p>
  ),

  pre: ({ children }) => (
    <pre className="my-6 overflow-x-auto rounded-xl bg-gray-900 px-5 py-4 text-sm leading-relaxed text-gray-100 shadow-md">
      {children}
    </pre>
  ),

  code: ({ children, className }) => {
    // Block code rendered inside <pre> — don't double-style
    if (className) {
      return <code className={className}>{children}</code>;
    }
    return (
      <code className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[15px] font-mono text-rose-600">
        {children}
      </code>
    );
  },

  a: ({ href, children, ...props }) => {
    const isExternal = href?.startsWith('http') || href?.startsWith('//');
    if (isExternal) {
      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href ?? '/'}
        className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-800 transition-colors"
        {...props}
      >
        {children}
      </Link>
    );
  },

  ul: ({ children }) => (
    <ul className="mb-5 ml-6 list-disc space-y-1.5 text-[18px] leading-[1.75] text-gray-700 marker:text-gray-400">
      {children}
    </ul>
  ),

  ol: ({ children }) => (
    <ol className="mb-5 ml-6 list-decimal space-y-1.5 text-[18px] leading-[1.75] text-gray-700 marker:text-gray-500">
      {children}
    </ol>
  ),

  li: ({ children }) => (
    <li className="pl-1">{children}</li>
  ),

  blockquote: ({ children }) => (
    <blockquote className="my-6 rounded-xl border-l-4 border-blue-400 bg-blue-50 px-5 py-4 text-[17px] leading-relaxed text-blue-900 italic">
      {children}
    </blockquote>
  ),

  img: ({ src, alt, width, height }) => {
    if (!src) return null;
    const w = typeof width === 'number' ? width : 800;
    const h = typeof height === 'number' ? height : 450;
    return (
      <span className="my-7 block overflow-hidden rounded-2xl">
        <Image
          src={src}
          alt={alt ?? ''}
          width={w}
          height={h}
          className="w-full object-cover"
        />
      </span>
    );
  },
};
