'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignUp() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // 1. Django Backendda ro'yxatdan o'tish
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/register/`, {
        method: 'POST',
        body: JSON.stringify(formData),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok) {
        // Backenddan kelgan aniq xatolikni ko'rsatish (masalan: "Bu username band")
        throw new Error(data.username || data.email || data.password || 'Roʻyxatdan oʻtishda xatolik!');
      }

      // 2. Avtomatik Login qilish
      const signInRes = await signIn('credentials', {
        username: formData.username,
        password: formData.password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push('/signin'); // Avto-login o'xshamasa signinga yuboramiz
      } else {
        router.push('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Roʻyxatdan oʻtishda xatolik!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10 blur-3xl -z-10" />
        
        <div className="glass-card p-8 md:p-10 layer-3">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              ✨ Join Us
            </h1>
            <p className="text-muted text-sm">Create your account and start sharing</p>
          </div>
          
          {error && (
            <div className="glass-card p-4 mb-6 layer-2 border-red-400/20" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
              <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>⚠️ {error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold mb-2">Username</label>
              <input
                required
                type="text"
                className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Email</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-green-500 transition"
                placeholder="Create a strong password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full btn-primary text-lg font-bold py-3 mt-6 layer-2 disabled:opacity-50"
            >
              {loading ? '⏳ Creating account...' : '🚀 Sign Up'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'var(--glass-border-light)' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 muted" style={{ background: 'var(--bg-primary)' }}>or</span>
            </div>
          </div>

          <p className="text-center text-muted text-sm">
            Already have an account?{' '}
            <Link href="/signin" className="font-bold" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
