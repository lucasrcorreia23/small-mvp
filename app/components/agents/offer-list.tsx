'use client';

import { LoadingView } from '@/app/components/loading-view';
import { Offer } from '@/app/lib/types/sta';
import { OfferCard } from './offer-card';
import { CreateRoleplayCard } from './create-roleplay-card';
import { WizardSteps } from './create-wizard/wizard-steps';
import { useRouter } from 'next/navigation';

interface OfferListProps {
  offers: Offer[];
  isLoading: boolean;
  error: string | null;
}

export function OfferList({ offers, isLoading, error }: OfferListProps) {
  const router = useRouter();

  const handleNewOffer = () => {
    router.push('/agents/create');
  };

  const handleOfferClick = (offer: Offer) => {
    router.push(`/agents/contexts?offer_id=${offer.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Carregando ofertas..." fullPage={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
        {error}
      </div>
    );
  }

  if (offers.length === 0) {
    return (
      <div className="card-surface p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-slate-400"
            >
              <path fillRule="evenodd" d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0016.5 9h-1.875a1.875 1.875 0 01-1.875-1.875V5.25A3.75 3.75 0 009 1.5H5.625z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Nenhuma oferta encontrada
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Crie sua primeira oferta para comecar a treinar vendas
            </p>
          </div>
          <button
            onClick={handleNewOffer}
            className="btn-primary h-10 px-6 text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
            Nova Oferta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-4 order-2 sm:order-1">
          <button
            onClick={() => router.push('/agents')}
            className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors"
            aria-label="Voltar para agentes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M7.28 7.72a.75.75 0 010 1.06l-2.47 2.47H21a.75.75 0 010 1.5H4.81l2.47 2.47a.75.75 0 11-1.06 1.06l-3.75-3.75a.75.75 0 010-1.06l3.75-3.75a.75.75 0 011.06 0z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">
              Suas Ofertas
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Selecione uma oferta para ver perfis de comprador ou crie um roleplay
            </p>
          </div>
        </div>
        <div className="order-1 sm:order-2 flex-shrink-0 px-4 py-3 rounded-sm bg-slate-700">
          <WizardSteps currentStep="offer" lightLines />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {offers.map((offer) => (
          <OfferCard
            key={offer.id}
            offer={offer}
            onClick={() => handleOfferClick(offer)}
          />
        ))}
        <CreateRoleplayCard destination="create" />
      </div>
    </div>
  );
}
