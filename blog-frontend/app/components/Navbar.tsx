
// /media/gradientvvv/Linux/blog-app/blog-frontend/app/components/Navbar.tsx

 'use client';

import { useSession, signOut } from "next-auth/react";
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

export default function Navbar() {
  const { data: session } = useSession();
  const [theme, setTheme] = useState<'light'|'dark'|'system'>('system');
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try{
      const stored = localStorage.getItem('theme');
      setTheme(stored === 'light' || stored === 'dark' || stored === 'system' ? (stored as any) : 'system');
    }catch(e){
      setTheme('system');
    }
  }, []);

  function applyMode(mode: 'light'|'dark'|'system'){
    try{
      if(mode === 'system'){
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        localStorage.setItem('theme', 'system');
      } else {
        document.documentElement.setAttribute('data-theme', mode);
        localStorage.setItem('theme', mode);
      }
      setTheme(mode);
    }catch(e){}
  }

  function toggleTheme(){
    const next = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';
    applyMode(next);
  }

  useEffect(() => {
    if (!mobileOpen) return;
    function onKey(e: KeyboardEvent){
      if(e.key === 'Escape') setMobileOpen(false);
    }
    function onClickOutside(e: MouseEvent){
      if(mobilePanelRef.current && !mobilePanelRef.current.contains(e.target as Node)){
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClickOutside);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClickOutside);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if(mobileOpen && mobilePanelRef.current){
      const focusable = mobilePanelRef.current.querySelector<HTMLElement>('a,button');
      focusable?.focus();
    }
  }, [mobileOpen]);

  return (
    <nav style={{ background: 'var(--nav-bg)', color: 'var(--nav-fg)' }} className="p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">Blog Home</Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden md:flex items-center gap-4">
          <button aria-label="Toggle theme (cycle system/light/dark)" onClick={toggleTheme} className="px-3 py-1 rounded-md" style={{background:'transparent', color:'var(--nav-fg)'}}>
            {theme === 'system' ? '🖥️' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
          {session ? (
            <>
              <span className="muted">Hi, {session.user?.name}</span>
              <Link href="/create">Create Post</Link>
              <button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
            </>
          ) : (
            <>
              <Link href="/signin">Sign In</Link>
              <Link href="/signup">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile: menu button */}
        <div className="md:hidden flex items-center gap-2">
          <button aria-label="Toggle theme" onClick={toggleTheme} className="px-2 py-1 rounded-md" style={{background:'transparent', color:'var(--nav-fg)'}}>
            {theme === 'system' ? '🖥️' : theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <button aria-label="Toggle menu" onClick={() => setMobileOpen(!mobileOpen)} className="px-2 py-1 rounded-md" style={{background:'transparent', color:'var(--nav-fg)'}}>
            {mobileOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="md:hidden mt-2 mobile-nav card p-4">
          <div className="flex flex-col gap-3">
            {session ? (
              <>
                <span className="muted">Hi, {session.user?.name}</span>
                <Link href="/create">Create Post</Link>
                <button onClick={() => signOut({ callbackUrl: '/' })}>Sign Out</button>
              </>
            ) : (
              <>
                <Link href="/signin">Sign In</Link>
                <Link href="/signup">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}