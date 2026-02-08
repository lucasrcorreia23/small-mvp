'use client';

import { useLogout } from '@/app/components/auth-guard';

export function AppHeader() {
  const logout = useLogout();

  return (
    <header className="fixed top-0 left-0 right-0 z-20 px-6 py-3 bg-white/30 backdrop-blur-sm border-b border-white/20">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900 tracking-tight font-sans">
          Perfecting
        </span>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-600 transition-colors"
          type="button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-slate-500" aria-hidden>
            <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5A1.5 1.5 0 007.5 20h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}
