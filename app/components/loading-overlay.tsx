'use client';

import { useState, useEffect } from 'react';

interface LoadingOverlayProps {
  phrases: string[];
  durationMs: number;
  onComplete: () => void;
}

export function LoadingOverlay({ phrases, durationMs, onComplete }: LoadingOverlayProps) {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhraseIndex((prev) => (prev + 1) % phrases.length);
    }, 2000);

    const timer = setTimeout(() => {
      onComplete();
    }, durationMs);

    return () => {
      clearInterval(phraseInterval);
      clearTimeout(timer);
    };
  }, [phrases, durationMs, onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6">
        {/* Spinner padrão (igual LoadingView) */}
        <div className="w-10 h-10 border-2 border-[#2E63CD] border-t-transparent rounded-full animate-spin" />

        {/* Rotating phrase */}
        <p className="text-slate-600 text-sm font-medium text-center min-h-[20px]">
          {phrases[currentPhraseIndex]}
        </p>
      </div>
    </div>
  );
}
