


'use client';



import { useSession, signOut } from "next-auth/react";

import Link from 'next/link';

import { useEffect, useState, useRef } from 'react';



type Theme = 'light' | 'dark' | 'system';



function getInitialTheme(): Theme {

  if (typeof window === 'undefined') return 'system';

  const stored = localStorage.getItem('theme');

  if (stored === 'light' || stored === 'dark' || stored === 'system') {

    return stored;

  }

  return 'system';

}



export default function Navbar() {

  const { data: session } = useSession();

  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  const [mobileOpen, setMobileOpen] = useState(false);

  const mobilePanelRef = useRef<HTMLDivElement | null>(null);



  function applyMode(mode: Theme) {

    if (typeof window === 'undefined') return;

    if (mode === 'system') {

      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');

      localStorage.setItem('theme', 'system');

    } else {

      document.documentElement.setAttribute('data-theme', mode);

      localStorage.setItem('theme', mode);

    }

    setTheme(mode);

  }



  useEffect(() => {

    applyMode(theme);

  }, [theme]);



  function toggleTheme() {

    const next: Theme = theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system';

    applyMode(next);

  }



  useEffect(() => {

    if (!mobileOpen) return;

    function onKey(e: KeyboardEvent) {

      if (e.key === 'Escape') setMobileOpen(false);

    }

    function onClickOutside(e: MouseEvent) {

      if (mobilePanelRef.current && !mobilePanelRef.current.contains(e.target as Node)) {

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

    if (mobileOpen && mobilePanelRef.current) {

      const focusable = mobilePanelRef.current.querySelector<HTMLElement>('a,button');

      focusable?.focus();

    }

  }, [mobileOpen]);



  return (

    <nav className="sticky top-0 z-50 glass-card m-4 md:m-6" style={{ background: 'var(--glass-light)', backdropFilter: 'blur(20px)', borderRadius: '20px' }}>

      <div className="container mx-auto px-6 py-4 flex items-center justify-between">

        {/* Logo/Brand */}

        <div className="flex items-center gap-2">

          <Link href="/" className="text-xl font-black tracking-tight" style={{ color: 'var(--accent)' }}>

            ✨ Blog

          </Link>

        </div>



        {/* Desktop Menu */}

        <div className="hidden md:flex items-center gap-6">

          <Link href="/" className="text-sm font-medium hover:text-accent transition">Home</Link>

          

          {session ? (

            <>

              <Link href="/create" className="btn-primary">✍️ Create Post</Link>

              <button

                onClick={toggleTheme}

                className="btn-secondary"

                aria-label="Toggle theme"

              >

                {theme === 'system' ? 'Default⚙️' : theme === 'dark' ? '🌙' : '☀️'}

              </button>

              <button

                onClick={() => signOut()}

                className="btn-secondary"

              >

                Sign Out

              </button>

            </>

          ) : (

            <>

              <Link href="/signin" className="btn-secondary">Sign In</Link>

              <Link href="/signup" className="btn-primary">Sign Up</Link>

              <button

                onClick={toggleTheme}

                className="btn-secondary"

                aria-label="Toggle theme"

              >

                {theme === 'system' ? 'Default🌙' : theme === 'dark' ? '🌙' : '☀️'}

              </button>

            </>

          )}

        </div>



        {/* Mobile Menu Button */}

        <div className="md:hidden flex items-center gap-2">

          <button

            onClick={toggleTheme}

            className="btn-secondary"

            aria-label="Toggle theme"

          >

            {theme === 'system' ? 'Default🌙' : theme === 'dark' ? '🌙' : '☀️'}

          </button>

          <button

            onClick={() => setMobileOpen(!mobileOpen)}

            className="btn-secondary"

            aria-label="Toggle menu"

          >

            {mobileOpen ? '✕' : '☰'}

          </button>

        </div>

      </div>



      {/* Mobile Menu */}

      {mobileOpen && (

        <div ref={mobilePanelRef} className="md:hidden mobile-nav m-4 p-4 space-y-3 border-t" style={{ borderColor: 'var(--glass-border-light)' }}>

          <Link href="/" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Home</Link>

          

          {session ? (

            <>

              <Link href="/create" className="block w-full btn-primary text-center" onClick={() => setMobileOpen(false)}>Create Post</Link>

              <button

                onClick={() => { signOut(); setMobileOpen(false); }}

                className="block w-full btn-secondary"

              >

                Sign Out

              </button>

            </>

          ) : (

            <>

              <Link href="/signin" className="block py-2 text-sm font-medium" onClick={() => setMobileOpen(false)}>Sign In</Link>

              <Link href="/signup" className="block w-full btn-primary text-center" onClick={() => setMobileOpen(false)}>Sign Up</Link>

            </>

          )}

        </div>

      )}

    </nav>

  );

}
