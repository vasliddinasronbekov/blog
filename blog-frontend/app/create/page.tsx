"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { createPost, getCategories } from './../lib/api'; // Pathga e'tibor bering
import Editor from './../components/Editor';
import Card from '../components/ui/Card';

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<any[]>([]);
  const [featuredImage, setFeaturedImage] = useState<File | null>(null);
  const [featuredPreview, setFeaturedPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Kategoriyalarni yuklash
  useEffect(() => {
    getCategories().then(setCategories).catch(console.error);
  }, []);

  useEffect(() => {
    if (!featuredImage) { setFeaturedPreview(null); return; }
    const url = URL.createObjectURL(featuredImage);
    setFeaturedPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [featuredImage]);

  // Login qilmagan bo'lsa haydash
  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin');
  }, [status, router]);

  if (status === 'loading') return <div className="text-center py-20">Yuklanmoqda...</div>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!title || !content) {
      setLoading(false);
      return setError('Sarlavha va maqola matni majburiy!');
    }

    try {
      // accessToken o'rniga session.user.accessToken (NextAuth sozlamasiga bog'liq)
      const token = (session as any)?.accessToken; 
      
      await createPost({ 
        title, 
        content, 
        category_id: categoryId ? parseInt(categoryId) : undefined,
        featured_image: featuredImage ?? undefined 
      }, token);

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Post yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <Card className="shadow-2xl rounded-2xl">
        <h1 className="text-4xl font-extrabold mb-4">Yangi maqola yaratish</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sarlavha */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Maqola sarlavhasi</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="Sarlavhani kiriting..."
            />
          </div>

          {/* Kategoriya */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Boʻlim (Kategoriya)</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="">Boʻlimni tanlang</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Maqola matni (Markdown)</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <Editor content={content} onUpdate={setContent} />
            </div>
          </div>

          {/* Rasm yuklash */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Asosiy rasm (Featured Image)</label>
            <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="col-span-2">
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl hover:border-accent transition">
                  <div className="space-y-1 text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs muted mt-2">PNG, JPG, GIF up to 5MB</p>
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                {featuredPreview ? (
                  <div className="w-full h-36 bg-gray-50 rounded-lg overflow-hidden">
                    <img src={featuredPreview} alt="preview" className="object-cover w-full h-full" />
                  </div>
                ) : (
                  <div className="w-full h-36 bg-gray-50 rounded-lg flex items-center justify-center muted">Preview</div>
                )}
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Nashr qilinmoqda...' : 'Maqolani nashr etish'}
          </button>
        </form>
      </Card>
    </main>
  );
}
