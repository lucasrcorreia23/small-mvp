'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { WizardStep, WizardState, OfferCreateRequest, ContextCreateRequest, CaseSetupCreateRequest } from '@/app/lib/types/sta';
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
  const [state, setState] = useState<WizardState>(initialState);

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

  const handleBackToOffer = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 'offer',
    }));
  };

  const handleBackToContext = () => {
    setState((prev) => ({
      ...prev,
      currentStep: 'context',
    }));
  };

  const handleCancel = () => {
    router.push('/agents');
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-none p-8">
        {/* Steps Indicator */}
        <WizardSteps currentStep={state.currentStep} />

        {/* Step Content */}
        {state.currentStep === 'offer' && (
          <StepOffer
            initialData={state.offer}
            onComplete={handleOfferComplete}
          />
        )}

        {state.currentStep === 'context' && state.offer.id && (
          <StepContext
            offerId={state.offer.id}
            initialData={state.context}
            onComplete={handleContextComplete}
            onBack={handleBackToOffer}
          />
        )}

        {state.currentStep === 'case-setup' && state.context.id && (
          <StepCaseSetup
            contextId={state.context.id}
            initialData={state.caseSetup}
            onComplete={handleCaseSetupComplete}
            onBack={handleBackToContext}
          />
        )}

        {/* Cancel Button */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={handleCancel}
            className="w-full text-sm text-slate-500 hover:text-slate-700 transition-colors"
          >
            Cancelar e voltar
          </button>
        </div>
      </div>
    </div>
  );
}
