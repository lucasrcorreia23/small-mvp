'use client';

import { usePathname } from 'next/navigation';
import { DiamondWrapper } from './diamond-wrapper';

export function LayoutBackground() {
  const pathname = usePathname();
  if (pathname === '/') return null;
  return (
    <div className="absolute inset-0 z-0">
      <DiamondWrapper />
    </div>
  );
}
