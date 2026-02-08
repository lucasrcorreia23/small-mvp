'use client';

import { Suspense, useEffect, useState } from 'react';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';
import { OfferList } from '@/app/components/agents/offer-list';
import { Offer } from '@/app/lib/types/sta';
import { listOffers } from '@/app/lib/sta-service';

function OffersPageContent() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <AppHeader />

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
