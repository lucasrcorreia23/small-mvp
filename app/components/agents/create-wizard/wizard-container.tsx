'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { WizardStep, WizardState, OfferCreateRequest, ContextCreateRequest, CaseSetupCreateRequest, Offer } from '@/app/lib/types/sta';
import { listOffers } from '@/app/lib/sta-service';
import { LoadingView } from '@/app/components/loading-view';
import { WizardSteps } from './wizard-steps';
import { StepOffer } from './step-offer';
import { StepContext } from './step-context';
import { StepCaseSetup } from './step-case-setup';

const initialState: WizardState = {
  currentStep: 'offer',
  offer: {},
  context: {},
  caseSetup: {},
  isGenerating: false,
  isSaving: false,
  error: null,
};

export function WizardContainer() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<WizardState>(initialState);
  const [isLoadingPreselectedOffer, setIsLoadingPreselectedOffer] = useState(false);

  // Read query params for pre-selection
  useEffect(() => {
    const offerIdParam = searchParams.get('offer_id');
    const stepParam = searchParams.get('step');

    if (offerIdParam && stepParam === 'context') {
      const offerId = Number(offerIdParam);
      if (!Number.isNaN(offerId) && offerId > 0) {
        loadPreselectedOffer(offerId);
      }
    }
  }, []);

  const loadPreselectedOffer = async (offerId: number) => {
    setIsLoadingPreselectedOffer(true);
    try {
      const offers = await listOffers();
      const found = offers.find((o: Offer) => o.id === offerId);
      if (found) {
        setState((prev) => ({
          ...prev,
          offer: {
            id: found.id,
            offer_name: found.offer_name,
            general_description: found.general_description,
          },
          context: { ...prev.context, offer_id: found.id },
          currentStep: 'context',
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar oferta pre-selecionada:', err);
    } finally {
      setIsLoadingPreselectedOffer(false);
    }
  };

  const handleOfferComplete = (offer: OfferCreateRequest & { id: number }) => {
    setState((prev) => ({
      ...prev,
      offer,
      context: { ...prev.context, offer_id: offer.id },
      currentStep: 'context',
    }));
  };

  const handleContextComplete = (context: ContextCreateRequest & { id: number }) => {
    setState((prev) => ({
      ...prev,
      context,
      caseSetup: { ...prev.caseSetup, context_id: context.id },
      currentStep: 'case-setup',
    }));
  };

  const handleCaseSetupComplete = (caseSetup: CaseSetupCreateRequest & { id: number }) => {
    setState((prev) => ({
      ...prev,
      caseSetup,
    }));
    router.push('/agents');
  };

  const handleBackToOffer = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'offer',
    }));
  }, []);

  const handleBackToContext = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: 'context',
    }));
  }, []);

  const handleCancel = useCallback(() => {
    router.push('/agents');
  }, [router]);

  const stepTitles: Record<WizardStep, { title: string; subtitle: string }> = {
    offer: {
      title: 'Etapa 1: Oferta',
      subtitle: 'Explique sobre o produto ou serviço que você quer treinar a vender',
    },
    context: {
      title: 'Etapa 2: Perfil do Comprador',
      subtitle: 'Defina quem é seu cliente ideal e seus desafios',
    },
    'case-setup': {
      title: 'Etapa 3: Cenário',
      subtitle: 'Defina como será o treinamento de vendas',
    },
  };

  const currentStepMeta = stepTitles[state.currentStep];
  const [footerContent, setFooterContent] = useState<ReactNode>(null);

  if (isLoadingPreselectedOffer) {
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="card-surface p-8">
          <div className="flex flex-col items-center justify-center py-12">
            <LoadingView message="Carregando oferta..." fullPage={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto">
        <div className="card-surface p-8 pb-24">
          {/* Step title (left) + Steps indicator (right) */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            {currentStepMeta && (
              <div className="text-center sm:text-left order-2 sm:order-1">
                <h2 className="text-xl font-semibold text-slate-800">{currentStepMeta.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{currentStepMeta.subtitle}</p>
              </div>
            )}
            <div className="order-1 sm:order-2">
              <WizardSteps currentStep={state.currentStep} />
            </div>
          </div>

          {/* Step Content */}
          {state.currentStep === 'offer' && (
            <StepOffer
              initialData={state.offer}
              onComplete={handleOfferComplete}
              onCancel={handleCancel}
              setFooterContent={setFooterContent}
            />
          )}

          {state.currentStep === 'context' && state.offer.id && (
            <StepContext
              offerId={state.offer.id}
              initialData={state.context}
              onComplete={handleContextComplete}
              onBack={handleBackToOffer}
              setFooterContent={setFooterContent}
              offerSummary={{
                offer_name: state.offer.offer_name || '',
                general_description: state.offer.general_description || '',
              }}
            />
          )}

          {state.currentStep === 'case-setup' && state.context.id && (
            <StepCaseSetup
              contextId={state.context.id}
              initialData={state.caseSetup}
              onComplete={handleCaseSetupComplete}
              onBack={handleBackToContext}
              setFooterContent={setFooterContent}
            />
          )}
        </div>
      </div>

      {/* Fixed footer bar: same width as form, actions with space-between */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 py-4 px-4">
          {footerContent}
        </div>
      </footer>
    </>
  );
}
