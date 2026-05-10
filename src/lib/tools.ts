export interface Tool {
  slug: string;
  name: string;
  letter: string;
  color: string;
}

export const TOOLS: Tool[] = [
  { slug: 'chatgpt',    name: 'ChatGPT',    letter: 'G', color: '#10A37F' },
  { slug: 'claude',     name: 'Claude',     letter: 'C', color: '#C96442' },
  { slug: 'midjourney', name: 'Midjourney', letter: 'M', color: '#111827' },
  { slug: 'gemini',     name: 'Gemini',     letter: 'G', color: '#4285F4' },
  { slug: 'sora',       name: 'Sora',       letter: 'S', color: '#000000' },
  { slug: 'runway',     name: 'Runway',     letter: 'R', color: '#0EA5E9' },
  { slug: 'n8n',        name: 'n8n',        letter: 'n', color: '#EA4B71' },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
