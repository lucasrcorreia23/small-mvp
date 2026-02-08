'use client';

import { Offer } from '@/app/lib/types/sta';

interface OfferCardProps {
  offer: Offer;
  onClick: () => void;
}

export function OfferCard({ offer, onClick }: OfferCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left card-surface p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 hover:brightness-[1.02] transition-all"
    >
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold text-slate-800 truncate">
          {offer.offer_name}
        </h3>
        <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
          {offer.general_description}
        </p>
      </div>
    </button>
  );
}
