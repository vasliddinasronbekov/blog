import Link from 'next/link';
import { getPosts } from './lib/api';
import PostCard from './components/PostCard';
import AdSenseAd from './components/AdSenseAd';

export const revalidate = 60; 

export default async function Home() {
  let posts: any[] = [];
  let error = null;

  try {
    // Backenddan ma'lumot olish
    const data = await getPosts();
    // Django DRF pagination ishlatsa, natija data.results ichida bo'ladi
    posts = data.results || data; 
  } catch (err) {
    error = (err as Error).message;
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-extrabold text-white-900">Soʻnggi maqolalar</h1>
        <Link 
          href="/create" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium transition"
        >
          Post yaratish +
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8">
          Xatolik yuz berdi: {error}
        </div>
      )}

      {posts.length === 0 && !error ? (
        <div className="text-center py-20 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">Hozircha maqolalar yoʻq.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post: any, index: number) => (
              <div key={post.id}>
                <PostCard post={post} />
                
                {/* Show ad every 3rd post */}
                {(index + 1) % 3 === 0 && (
                  <div className="md:col-span-2 lg:col-span-3 py-6">
                    <AdSenseAd placement="homepage" className="w-full" />
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Ad at the end */}
          <div className="py-8 mt-8">
            <AdSenseAd placement="homepage" className="w-full" />
          </div>
        </>
      )}
    </main>
  );
}
