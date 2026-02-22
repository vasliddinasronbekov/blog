import { notFound } from 'next/navigation';
import { getPosts, getTagBySlug } from '../../lib/api';
import PostArchive from '../../components/PostArchive';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) {
    return { title: 'Tag not found' };
  }

  return {
    title: `#${tag.name} posts`,
    description: `Articles tagged with #${tag.name}`,
  };
}

export default async function TagPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

  if (!tag) {
    notFound();
  }

  const posts = await getPosts({ tags: tag.id });

  return (
    <PostArchive
      title={`#${tag.name}`}
      subtitle={`Explore all posts tagged with #${tag.name}.`}
      posts={posts}
      emptyLabel={`No posts found for #${tag.name}.`}
    />
  );
}
