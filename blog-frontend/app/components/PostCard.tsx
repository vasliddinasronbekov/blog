import Link from 'next/link';
import Image from 'next/image';
import { Post } from '../lib/api';

export default function PostCard({ post, featured = false }: { post: Post; featured?: boolean }) {
  const cardClass = featured ? 'bento-item-featured' : '';

  return (
    <article className={`glass-card overflow-hidden group layer-2 transition-all duration-300 cursor-pointer ${cardClass}`}>
      {/* Image Container */}
      {post.featured_image && (
        <div className="relative w-full h-48 overflow-hidden">
          <Image 
            src={post.featured_image} 
            alt={post.title} 
            fill 
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            unoptimized 
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
      )}

      {/* Content Container */}
      <div className="p-6 flex flex-col h-full">
        {/* Category Tag */}
        <div className="mb-3">
          {post.category_name && post.category_slug ? (
            <Link
              href={`/categories/${post.category_slug}`}
              className="tag"
              style={{
                background: `var(--accent)20`,
                color: 'var(--accent)',
                borderColor: `var(--accent)40`,
              }}
            >
              {post.category_name}
            </Link>
          ) : (
            <span
              className="tag"
              style={{
                background: `var(--accent)20`,
                color: 'var(--accent)',
                borderColor: `var(--accent)40`,
              }}
            >
              Featured
            </span>
          )}
        </div>

        {(post.tag_details?.length || 0) > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {post.tag_details?.slice(0, 3).map((tag) => (
              <Link key={tag.id} href={`/tags/${tag.slug}`} className="tag">
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-lg font-bold mb-3 line-clamp-2 group-hover:text-accent transition-colors">
          <Link href={`/posts/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-sm muted line-clamp-2 mb-auto">
          {post.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t" style={{ borderColor: 'var(--glass-border-light)' }}>
          {/* Author */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
              {post.author?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-xs font-medium line-clamp-1">{post.author || 'Author'}</span>
          </div>

          {/* Date */}
          <time className="text-xs muted">
            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </time>
        </div>
      </div>
    </article>
  );
}
