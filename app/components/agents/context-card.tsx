'use client';

import { Context } from '@/app/lib/types/sta';

interface ContextCardProps {
  context: Context;
  onClick: () => void;
}

export function ContextCard({ context, onClick }: ContextCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card-surface p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 hover:brightness-[1.02] transition-all"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-800 truncate">
          {context.name}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {context.target_description}
        </p>
      </div>
    </button>
  );
}
