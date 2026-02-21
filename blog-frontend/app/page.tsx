import Link from 'next/link';
import { getPosts } from './lib/api';
import PostCard from './components/PostCard';
import AdSenseAd from './components/AdSenseAd';

export const revalidate = 60; 

export default async function Home() {
  let posts: any[] = [];
  let error = null;

  try {
    const data = await getPosts();
    posts = data.results || data; 
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Hero Section */}
      <section className="mb-16 glass-card p-8 md:p-12 text-center layer-3" style={{ background: 'var(--glass-light)', backdropFilter: 'blur(20px)' }}>
        <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          Explore Stories
        </h1>
        <p className="text-lg muted mb-8 max-w-2xl mx-auto">
          Discover insightful articles, tips, and perspectives on topics you care about.
        </p>
        <Link href="/create" className="btn-primary inline-block">
          ✍️ Share Your Story
        </Link>
      </section>

      {/* Error State */}
      {error && (
        <div className="glass-card p-6 mb-8 layer-2 border-red-400/20" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
          <p style={{ color: 'var(--accent)' }} className="font-semibold">⚠️ Error loading posts</p>
          <p className="text-sm muted">{error}</p>
        </div>
      )}

      {/* Empty State */}
      {posts.length === 0 && !error && (
        <div className="glass-card p-16 text-center layer-2">
          <p className="text-xl muted mb-4">No stories yet</p>
          <p className="text-sm muted mb-6">Be the first to share your thoughts</p>
          <Link href="/create" className="btn-primary inline-block">
            Start Writing
          </Link>
        </div>
      )}

      {/* Bento Grid */}
      {posts.length > 0 && (
        <>
          <div className="bento-grid mb-12">
            {posts.map((post: any, index: number) => (
              <div key={post.id} className={index === 0 ? 'bento-item-featured' : ''}>
                <PostCard post={post} featured={index === 0} />
              </div>
            ))}
          </div>

          {/* Ad after grid */}
          <div className="my-12">
            <AdSenseAd placement="homepage" className="w-full" />
          </div>
        </>
      )}
    </main>
  );
}
