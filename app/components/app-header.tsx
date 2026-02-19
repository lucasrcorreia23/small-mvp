'use client';

import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-6 py-3 bg-white/30 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-6xl mx-auto flex items-center justify-start">
        <Link href="/agents" className="text-lg font-semibold text-[#2E63CD] tracking-tight font-sans cursor-pointer">
          Perfecting
        </Link>
      </div>
    </header>
  );
}
