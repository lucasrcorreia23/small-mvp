'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const DiamondBackground = dynamic(
  () => import('./diamond-background').then((mod) => mod.DiamondBackground),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 bg-[#f6f7fb]" />
    )
  }
);

export function DiamondWrapper() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-[#f6f7fb]" />}>
      <DiamondBackground />
    </Suspense>
  );
}
