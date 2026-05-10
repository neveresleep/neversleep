import Image from 'next/image';
import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

import type { Post } from '@/lib/types';
import { getRelatedPosts } from '@/lib/posts';
import { mdxComponents } from '@/components/post/MDXComponents';
import { TypeBadge, TaskBadge, RelatedPosts } from '@/components/post/PostBadges';

interface Props {
  post: Post;
  locale: string;
}

export default function PostView({ post, locale }: Props) {
  const related = getRelatedPosts(post, locale, 3);

  const formattedDate = post.date.toLocaleDateString(
    locale === 'ru' ? 'ru-RU' : 'en-US',
    { day: 'numeric', month: 'long', year: 'numeric' }
  );

  // For video posts, the MDX content embeds <video> with the cover as poster.
  // Showing the cover as a separate Image above would duplicate the poster.
  const showCoverImage = Boolean(post.cover) && post.media !== 'video';

  return (
    <>
      <article className="max-w-2xl mx-auto">
        <div className="mb-5 flex flex-wrap gap-2">
          <TypeBadge type={post.type} />
          <TaskBadge task={post.task} />
        </div>

        <h1 className="mb-4 text-[clamp(28px,5vw,40px)] font-extrabold leading-tight tracking-tight text-gray-900">
          {post.title}
        </h1>

        <div className="mb-8 flex items-center gap-3 text-[14px] text-gray-400">
          <time dateTime={post.date.toISOString()}>{formattedDate}</time>
          <span aria-hidden="true">·</span>
          <span>
            {post.readingTime} {locale === 'ru' ? 'мин' : 'min'}
          </span>
        </div>

        {showCoverImage && (
          <div className="mb-10 overflow-hidden rounded-2xl">
            <Image
              src={post.cover!}
              alt={post.title}
              width={800}
              height={450}
              className="w-full object-cover"
              priority
            />
          </div>
        )}

        <div className="prose-reset">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeHighlight],
              },
            }}
          />
        </div>
      </article>

      <div className="max-w-2xl mx-auto">
        <RelatedPosts posts={related} locale={locale} />
      </div>
    </>
  );
}
