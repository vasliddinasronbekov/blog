import { notFound } from 'next/navigation';
import { getCategoryBySlug, getPosts, getAdSenseSettings } from '../../lib/api';
import PostArchive from '../../components/PostArchive';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) {
    return { title: 'Category not found' };
  }

  return {
    title: `${category.name} posts`,
    description: `Articles in ${category.name} category`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const [posts, adsenseConfig] = await Promise.all([
    getPosts({ category: category.id }),
    getAdSenseSettings(),
  ]);

  return (
    <PostArchive
      title={category.name}
      subtitle={`Browse all posts in ${category.name}.`}
      posts={posts}
      emptyLabel={`No posts found in ${category.name}.`}
      adsenseConfig={adsenseConfig}
    />
  );
}
