'use client';

import { Suspense, useEffect, useState } from 'react';
import { AuthGuard, useLogout } from '@/app/components/auth-guard';
import { OfferList } from '@/app/components/agents/offer-list';
import { Offer } from '@/app/lib/types/sta';
import { listOffers } from '@/app/lib/sta-service';

function OffersPageContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logout = useLogout();

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const offersList = await listOffers();
      setOffers(offersList);
    } catch (err) {
      console.error('Erro ao carregar ofertas:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar ofertas');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-3 bg-white/30 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900 tracking-tight font-sans">
            Perfecting
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <OfferList offers={offers} isLoading={isLoading} error={error} />
        </div>
      </div>
    </main>
  );
}

export default function OffersPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <OffersPageContent />
      </Suspense>
    </AuthGuard>
  );
}
