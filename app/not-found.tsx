"use client";

import { useEffect } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

export default function NotFound() {
  // Force dark theme for this page only
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    if (!hadDark) root.classList.add('dark');
    return () => {
      if (!hadDark) root.classList.remove('dark');
    };
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
      <div className="w-full max-w-lg rounded-lg border border-white/10 bg-black/20 p-8 text-center shadow-xl backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/15">
          <Search className="text-white/80" size={22} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-sm text-white hover:bg-black/40 transition-colors"
          >
            Go back home
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/15"
          >
            Start a new chat
          </Link>
        </div>
      </div>
    </main>
  );
}
