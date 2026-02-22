"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { createPost, getCategories, Category } from './../lib/api';
import Editor from './../components/Editor';
import Image from 'next/image';

export default function CreatePostPage() {
  const { data: session, status } = useSession();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
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
      const token = (session as any)?.accessToken; 
      
      await createPost({ 
        title, 
        content, 
        category_id: categoryId ? parseInt(categoryId) : undefined,
        featured_image: featuredImage ?? undefined 
      }, token);

      router.push('/');
      router.refresh();
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || 'Post yaratishda xatolik yuz berdi');
      } else {
        setError('Post yaratishda xatolik yuz berdi');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="glass-card p-8 md:p-12 layer-3">
        <h1 className="text-4xl md:text-5xl font-black mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
          ✍️ Share Your Story
        </h1>
        <p className="text-muted mb-8">Create and publish your next great post</p>
        
        {error && (
          <div className="glass-card p-4 mb-6 layer-2 border-red-400/20" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
            <p style={{ color: 'var(--accent)' }} className="font-semibold text-sm">⚠️ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Title */}
          <div>
            <label className="block text-sm font-bold mb-3">Post Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-6 py-3 glass-card outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Enter a compelling title..."
              style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-3">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-6 py-3 glass-card outline-none focus:ring-2 focus:ring-blue-500 transition"
              style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)', color: 'var(--fg-primary)' }}
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Editor */}
          <div>
            <label className="block text-sm font-bold mb-3">Content</label>
            <div className="glass-card overflow-hidden layer-2" style={{ borderRadius: '20px' }}>
              <Editor content={content} onUpdate={setContent} />
            </div>
          </div>

          {/* Featured Image */}
          <div>
            <label className="block text-sm font-bold mb-3">Featured Image</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="col-span-2">
                <div className="glass-card p-8 text-center border-dashed layer-1 cursor-pointer hover:layer-2 transition" style={{ borderWidth: '2px', borderColor: 'var(--glass-border-light)' }}>
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setFeaturedImage(e.target.files?.[0] || null)}
                      className="hidden"
                      id="image-upload"
                    />
                    <label htmlFor="image-upload" className="cursor-pointer block">
                      <p className="text-2xl mb-2">📸</p>
                      <p className="font-semibold text-sm">Click or drag to upload</p>
                      <p className="text-xs muted mt-1">PNG, JPG, GIF up to 5MB</p>
                    </label>
                  </div>
                </div>
              </div>
              <div className="col-span-1">
                {featuredPreview ? (
                  <div className="w-full h-40 glass-card rounded-xl overflow-hidden layer-2">
                    <Image src={featuredPreview} alt="preview" layout="fill" objectFit="cover" />
                  </div>
                ) : (
                  <div className="w-full h-40 glass-card rounded-xl flex items-center justify-center muted text-center">
                    <p className="text-sm">Image preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button 
            disabled={loading}
            type="submit" 
            className="w-full btn-primary text-lg font-bold py-4 layer-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Publishing...' : '🚀 Publish Post'}
          </button>
        </form>
      </div>
    </main>
  );
}
