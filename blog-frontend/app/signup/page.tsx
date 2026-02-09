'use client';

import { useState } from 'react';
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Card from '../components/ui/Card';

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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto px-4 py-12 max-w-md">
      <Card className="rounded-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">Hisob yaratish</h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              required
              type="text"
              className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              required
              type="email"
              className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parol</label>
            <input
              required
              type="password"
              className="mt-1 w-full p-3 border rounded-md focus:ring-2 focus:ring-green-500 outline-none"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button
            disabled={loading}
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-md transition duration-200"
          >
            {loading ? 'Yuborilmoqda...' : 'Roʻyxatdan oʻtish'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm muted">
          Akkountingiz bormi? <Link href="/signin" className="text-green-600 font-semibold hover:underline">Kirish</Link>
        </p>
      </Card>
    </main>
  );
}
