'use client';

import { usePathname } from 'next/navigation';

export function LayoutBackground() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <div
      className="absolute inset-0 z-0"
      style={{ background: 'linear-gradient(180deg, #e8ecf2 0%, #e2e6ee 50%, #dfe3ec 100%)' }}
      aria-hidden
    />
  );
}
