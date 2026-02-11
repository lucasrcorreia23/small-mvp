'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';
import { LoadingView } from '@/app/components/loading-view';
import { ContextCard } from '@/app/components/agents/context-card';
import { CreateRoleplayCard } from '@/app/components/agents/create-roleplay-card';
import { WizardSteps } from '@/app/components/agents/create-wizard/wizard-steps';
import { Context, Offer } from '@/app/lib/types/sta';
import { listContexts, listOffers } from '@/app/lib/sta-service';

function ContextsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const offerIdParam = searchParams.get('offer_id');
  const offerId = offerIdParam ? Number(offerIdParam) : null;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [contexts, setContexts] = useState<Context[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!offerId || Number.isNaN(offerId) || offerId < 1) {
      router.replace('/agents/offers');
      return;
    }
    loadData();
  }, [offerId]);

  const loadData = async () => {
    if (!offerId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [offersList, contextsList] = await Promise.all([
        listOffers(),
        listContexts(offerId),
      ]);
      const foundOffer = offersList.find((o) => o.id === offerId);
      setOffer(foundOffer ?? null);
      setContexts(contextsList);
    } catch (err) {
      console.error('Erro ao carregar perfis:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar perfis de compradores');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/agents/offers');
  };

  const handleContextClick = (context: Context) => {
    router.push(`/agents/create?offer_id=${offerId}&context_id=${context.id}&step=case-setup`);
  };

  const handleNewProfile = () => {
    router.push(`/agents/create?offer_id=${offerId}&step=context`);
  };

  if (!offerId || Number.isNaN(offerId) || offerId < 1) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen relative">
        <AppHeader />
        <div className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto flex justify-center py-12">
            <LoadingView message="Carregando perfis de compradores..." fullPage={false} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <AppHeader />

      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-4 order-2 sm:order-1">
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
                aria-label="Voltar para ofertas"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                  <path fillRule="evenodd" d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z" clipRule="evenodd" />
                </svg>
                Voltar
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-slate-800">
                  Perfis de compradores
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                  {offer ? `Oferta: ${offer.offer_name}` : 'Selecione um perfil para criar o cenário'}
                </p>
              </div>
            </div>
            <div className="order-1 sm:order-2 flex-shrink-0 px-4 py-3 rounded-sm bg-slate-700">
              <WizardSteps currentStep="context" lightLines />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
              {error}
            </div>
          )}

          {!error && contexts.length === 0 && (
            <div className="card-surface p-8 text-center">
              <p className="text-slate-600 mb-6">
                Nenhum perfil de comprador ainda. Crie um novo perfil para esta oferta.
              </p>
              <button
                type="button"
                onClick={handleNewProfile}
                className="btn-primary h-10 px-6 text-white font-medium"
              >
                Novo perfil
              </button>
            </div>
          )}

          {!error && contexts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contexts.map((ctx) => (
                <ContextCard
                  key={ctx.id}
                  context={ctx}
                  onClick={() => handleContextClick(ctx)}
                />
              ))}
              <CreateRoleplayCard destination="create" offerId={offerId ?? undefined} />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function ContextsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <ContextsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
