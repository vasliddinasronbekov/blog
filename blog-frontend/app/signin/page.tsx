'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../components/ui/Card';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError('Username yoki parol xato!');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh(); // refresh session-aware data
    } catch (err) {
      setError('Tizimda xatolik yuz berdi');
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Background blur effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl -z-10" />
        
        <div className="glass-card p-8 md:p-10 layer-3">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-2 bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
              👋 Welcome Back
            </h1>
            <p className="text-muted text-sm">Sign in to your account</p>
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
                className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Password</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 glass-card outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ background: 'var(--glass-light)', border: '1px solid var(--glass-border-light)' }}
              />
            </div>
            <button
              disabled={loading}
              type="submit"
              className="w-full btn-primary text-lg font-bold py-3 mt-6 layer-2 disabled:opacity-50"
            >
              {loading ? '⏳ Signing in...' : '🔓 Sign In'}
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
            Don't have an account?{' '}
            <Link href="/signup" className="font-bold" style={{ color: 'var(--accent)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
