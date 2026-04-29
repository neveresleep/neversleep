import { MetadataRoute } from 'next';
import { getAllPostsAllLocales, getToolsWithPosts } from '@/lib/posts';
import { TASK_GROUPS } from '@/lib/groups';

const BASE_URL = 'https://neversleep.chat';

function localePrefix(locale: string): string {
  return locale === 'ru' ? '' : `/${locale}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const allPosts = getAllPostsAllLocales();
  const entries: MetadataRoute.Sitemap = [];

  // Static root pages
  const staticPages = ['', '/about', '/search'];
  for (const page of staticPages) {
    entries.push({
      url: `${BASE_URL}${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1.0 : 0.7,
    });
    // English variants
    entries.push({
      url: `${BASE_URL}/en${page}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: page === '' ? 1.0 : 0.7,
    });
  }

  // Posts — ru without prefix, other locales with prefix
  for (const [locale, posts] of Object.entries(allPosts)) {
    const prefix = localePrefix(locale);
    for (const post of posts) {
      entries.push({
        url: `${BASE_URL}${prefix}/p/${post.slug}`,
        lastModified: post.date,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }
  }

  // Tool pages — based on ru locale tools
  const ruTools = getToolsWithPosts('ru');
  for (const toolPage of ruTools) {
    entries.push({
      url: `${BASE_URL}/tools/${toolPage.slug}`,
      lastModified: toolPage.firstSeen,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
    entries.push({
      url: `${BASE_URL}/en/tools/${toolPage.slug}`,
      lastModified: toolPage.firstSeen,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
  }

  // Group pages
  for (const groupKey of Object.keys(TASK_GROUPS)) {
    entries.push({
      url: `${BASE_URL}/group/${groupKey}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
    entries.push({
      url: `${BASE_URL}/en/group/${groupKey}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    });
  }

  return entries;
}
