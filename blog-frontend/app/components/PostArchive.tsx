import Link from 'next/link';
import PostCard from './PostCard';
import { Post } from '../lib/api';

export default function PostArchive({
  title,
  subtitle,
  posts,
  emptyLabel,
}: {
  title: string;
  subtitle: string;
  posts: Post[];
  emptyLabel: string;
}) {
  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      <section
        className="mb-12 glass-card p-8 md:p-10 text-center layer-3"
        style={{ background: 'var(--glass-light)', backdropFilter: 'blur(20px)' }}
      >
        <h1 className="text-4xl md:text-5xl font-black mb-3 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          {title}
        </h1>
        <p className="text-base muted max-w-2xl mx-auto">{subtitle}</p>
      </section>

      {posts.length === 0 ? (
        <div className="glass-card p-12 text-center layer-2">
          <p className="text-lg muted mb-2">{emptyLabel}</p>
          <Link href="/" className="btn-secondary inline-block mt-4">
            Back to Home
          </Link>
        </div>
      ) : (
        <div className="bento-grid">
          {posts.map((post, index) => (
            <div key={post.id} className={index === 0 ? 'bento-item-featured' : ''}>
              <PostCard post={post} featured={index === 0} />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
