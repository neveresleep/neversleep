import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const API_KEY = process.env.DEEPSEEK_API_KEY;
const SOURCE = process.env.SOURCE_URL;
const LANG = process.env.LANG;
const USER_NOTE = process.env.USER_NOTE;

const POSTS_DIR = path.resolve('src/content/posts');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-zа-яё0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// ---------------------------------------------------------------------------
// Step 1: get source content
// ---------------------------------------------------------------------------

async function fetchSource(raw) {
  const url = raw.trim();
  if (url.startsWith('http://') || url.startsWith('https://')) {
    console.log(`Fetching: ${url}`);
    const res = await fetch(url, {
      headers: { 'User-Agent': 'neversleep-bot/1.0' },
    });
    const html = await res.text();

    // Try to find text content — look for <title>, <meta>, twitter cards
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] || '';
    const desc = html.match(/<meta name="description" content="([^"]+)"/)?.[1]
      || html.match(/<meta property="og:description" content="([^"]+)"/)?.[1]
      || '';
    const twitterText = html.match(/<meta name="twitter:description" content="([^"]+)"/)?.[1] || '';
    const bodyText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 4000);

    return `Title: ${title}\nDescription: ${desc}${twitterText ? '\nTweet: ' + twitterText : ''}\n\nBody:\n${bodyText}`;
  }
  return raw;
}

// ---------------------------------------------------------------------------
// Step 2: call DeepSeek
// ---------------------------------------------------------------------------

async function callLLM(prompt, system) {
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });
  const data = await res.json();
  if (!data.choices || !data.choices[0]) {
    throw new Error(`DeepSeek error: ${JSON.stringify(data)}`);
  }
  return data.choices[0].message.content;
}

// ---------------------------------------------------------------------------
// Step 3: generate MDX
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `You are a tech writer for neversleep.chat — a blog about AI for non-developers.

Your job is to turn a source (X/Twitter post, article, video, or raw text) into a practical MDX post.

RULES:
- Write in a "to-do" format — step-by-step, actionable, no fluff
- No AI clichés ("unlock the power", "game-changer", "delve into")
- If you don't know a fact, say "точно не известно" — never make things up
- Write for non-devs: explain technical terms simply
- Include practical steps someone can actually follow

OUTPUT FORMAT — first output the frontmatter block, then the content:

---
title: "Russian title here"
slug: "kebab-case-slug-here"
description: "One-line description, max 160 chars"
task: "one-word-task"  // examples: video, music, text, image, design, code, writing, research, productivity, automation, chatbot, landing, presentation, data, voice, learning, translation, notes, search, social, avatars, games, agents, editing
type: "guide"  // guide | review | case | list
tags: [tag1, tag2, tag3]
professions: [profession1, profession2]  // examples: designer, developer, nocode, freelancer, writer, student, marketer, manager, researcher, teacher, creator, journalist
tools: [tool1, tool2]  // lowercase tool names used
media: "text"  // text | image | video | 3d
languages: [ru]
date: YYYY-MM-DD
source: "https://..."
is_editorial: true
---

Then the MDX content in Russian.

IMPORTANT: If the source has an embedded video/tweet X link — include the original embed or link at the top of the content.

Use markdown: ## for headings, \`\`\` for code blocks, **bold** for UI elements.

Keep it useful. Think: "what would a busy person need to copy-paste to get this done?"`;

async function generatePost(sourceText, lang) {
  const langPrompt = lang === 'en'
    ? '\n\nIMPORTANT: Write the entire post in English. The title, description, tags, and content must be in English.'
    : '\n\nIMPORTANT: Write the entire post in Russian. The title, description, tags, and content must be in Russian.';

  const userNote = USER_NOTE ? `\n\nUser's note/context: ${USER_NOTE}` : '';

  const prompt = `Source content:\n\n${sourceText}${langPrompt}${userNote}`;

  const result = await callLLM(prompt, SYSTEM_PROMPT);
  return result;
}

// ---------------------------------------------------------------------------
// Step 4: save MDX file
// ---------------------------------------------------------------------------

function savePost(content, lang) {
  // Parse frontmatter to get slug
  const slugMatch = content.match(/slug:\s*"([^"]+)"/);
  if (!slugMatch) throw new Error('Could not parse slug from generated content');
  const slug = slugMatch[1];

  const dir = path.join(POSTS_DIR, lang);
  fs.mkdirSync(dir, { recursive: true });

  const filepath = path.join(dir, `${slug}.mdx`);
  fs.writeFileSync(filepath, content, 'utf-8');
  console.log(`Saved: ${filepath}`);
  return filepath;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  if (!API_KEY) throw new Error('DEEPSEEK_API_KEY not set');
  if (!SOURCE) throw new Error('SOURCE_URL not set');

  const langs = LANG === 'both' ? ['ru', 'en'] : [LANG];

  console.log(`Fetching source...`);
  const sourceText = await fetchSource(SOURCE);
  console.log(`Source length: ${sourceText.length} chars`);

  for (const lang of langs) {
    console.log(`\nGenerating ${lang} post...`);
    const mdx = await generatePost(sourceText, lang);
    console.log(`\n--- Generated ${lang} MDX ---`);
    console.log(mdx.slice(0, 300) + '...');
    savePost(mdx, lang);
  }

  console.log('\nDone!');
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
