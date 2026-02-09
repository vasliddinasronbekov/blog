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
    <main className="container mx-auto px-4 py-12 max-w-md">
      <Card className="rounded-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Xush kelibsiz</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              required
              type="text"
              className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parol</label>
            <input
              required
              type="password"
              className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-md transition duration-200"
          >
            {loading ? 'Kirilmoqda...' : 'Kirish'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm muted">
          Akkountingiz yoʻqmi? <Link href="/signup" className="text-blue-600 font-semibold hover:underline">Roʻyxatdan oʻtish</Link>
        </p>
      </Card>
    </main>
  );
}
