import { getPostBySlug } from './../../lib/api'; // Pathni tekshiring
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import AdSenseAd from '../../components/AdSenseAd';

// Metadata qo'shish (SEO uchun juda muhim)
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return { title: 'Post topilmadi' };
  }

  const plainText = post.content ? post.content.replace(/<[^>]+>/g, '') : '';

  return {
    title: post.seo_title || post.title,
    description: post.seo_description || plainText.slice(0, 155),
    openGraph: {
      title: post.seo_title || post.title,
      description: post.seo_description || plainText.slice(0, 200),
      type: 'article',
      images: post.featured_image ? [{ url: post.featured_image }] : [],
    },
  };
}

export default async function PostPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const related: any[] = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <article className="lg:col-span-2">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Article',
                headline: post.seo_title || post.title,
                description: post.seo_description,
                image: post.featured_image,
                author: { '@type': 'Person', name: post.author },
                datePublished: post.created_at,
                dateModified: post.updated_at || post.created_at,
                mainEntityOfPage: { '@type': 'WebPage', '@id': `${siteUrl}/posts/${post.slug}` },
              }),
            }}
          />

          <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8">
            {post.featured_image ? (
              <div className="w-full hero relative">
                <Image src={post.featured_image} alt={post.title} fill className="object-cover" unoptimized />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="inline-block bg-blue-600/90 text-xs uppercase px-3 py-1 rounded-full mb-3">{post.category_name || 'Maqola'}</span>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight">{post.title}</h1>
                  <div className="mt-3 flex items-center gap-3 text-sm opacity-90">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center font-semibold">{post.author?.[0]?.toUpperCase() || 'U'}</div>
                    <div>
                      <div className="font-medium">{post.author || 'Muallif'}</div>
                      <time className="text-xs block">{new Date(post.created_at).toLocaleDateString('uz-UZ')}</time>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-card rounded-lg mb-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold">{post.title}</h1>
              </div>
            )}
          </div>

          <div className="relative">
            <aside className="hidden lg:block sticky top-28 float-left mr-6">
              <div className="flex flex-col items-start gap-3 text-sm">
                <a className="text-muted hover:text-accent" href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(siteUrl + '/posts/' + post.slug)}`} aria-label="Share on Facebook">Share</a>
                <a className="text-muted hover:text-accent" href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(siteUrl + '/posts/' + post.slug)}&text=${encodeURIComponent(post.title)}`} aria-label="Share on Twitter">Tweet</a>
              </div>
            </aside>

            <div className="prose prose-blue prose-lg max-w-none text-current">
              <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />
            </div>
          </div>

          {post.comments && post.comments.length > 0 && (
            <section className="mt-12 pt-10 border-t border-border">
              <h3 className="text-2xl font-bold mb-6">Izohlar ({post.comments.length})</h3>
              <div className="space-y-4">
                {post.comments.map((comment: any) => (
                  <div key={comment.id} className="bg-card p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{comment.author?.username || comment.author || 'Anon'}</span>
                      <time className="text-xs text-muted">{new Date(comment.created_at).toLocaleDateString()}</time>
                    </div>
                    <p className="text-sm leading-relaxed">{comment.text}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </article>

        <aside className="lg:col-span-1">
          <div className="card p-4 mb-6">
            <h4 className="font-semibold mb-2">About the author</h4>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">{post.author?.[0]?.toUpperCase() || 'U'}</div>
              <div>
                <div className="font-medium">{post.author || 'Muallif'}</div>
                <div className="text-sm muted">Contributor</div>
              </div>
            </div>
          </div>

          <div className="card p-4">
            <h4 className="font-semibold mb-2">Related</h4>
            {related.length === 0 ? (
              <p className="text-sm muted">No related posts yet.</p>
            ) : (
              <ul className="space-y-2">
                {related.map(r => (
                  <li key={r.id}><Link href={`/posts/${r.slug}`} className="text-sm hover:underline">{r.title}</Link></li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}
