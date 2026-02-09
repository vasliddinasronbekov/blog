import Link from 'next/link';
import Image from 'next/image';

export default function PostCard({ post }: { post: any }){
  return (
    <article className="group card overflow-hidden rounded-xl">
      {post.featured_image && (
        <div className="relative w-full hero">
          <Image src={post.featured_image} alt={post.title} fill className="object-cover transition-transform group-hover:scale-105" unoptimized />
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-1 rounded">{post.category_name || 'Umumiy'}</span>
        </div>
        <h3 className="text-lg font-bold mb-2"><Link href={`/posts/${post.slug}`}>{post.title}</Link></h3>
        <p className="text-sm muted line-clamp-3">{post.content}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">{post.author?.[0] || 'U'}</div>
            <span className="text-sm">{post.author || 'Muallif'}</span>
          </div>
          <time className="text-xs muted">{new Date(post.created_at).toLocaleDateString()}</time>
        </div>
      </div>
    </article>
  );
}
