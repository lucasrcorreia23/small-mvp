'use client';

import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  WizardStep,
  WizardState,
  OfferCreateRequest,
  ContextCreateRequest,
  CaseSetupGenerateResponse,
  ScenarioFormData,
  Offer,
  Context,
} from '@/app/lib/types/sta';
import { listOffers, listContexts, generateCaseSetup, createCaseSetup } from '@/app/lib/sta-service';
import { setAgentDisplayMeta } from '@/app/lib/agent-display-meta';
import { LoadingView } from '@/app/components/loading-view';
import { LoadingOverlay } from '@/app/components/loading-overlay';
import { LOADING_PHRASES_GENERATION, LOADING_PHRASES_CREATION } from '@/app/lib/mock-data';
import { WizardSteps } from './wizard-steps';
import { StepOffer } from './step-offer';
import { StepContext } from './step-context';
import { StepScenario } from './step-scenario';
import { StepReview } from './step-review';
import { StepSuccess } from './step-success';

function formatCallContextLabel(slug: string): string {
  const map: Record<string, string> = {
    cold_call: 'Cold Call',
    warm_outreach: 'Abordagem Morna',
    qualification_discovery: 'Qualificacao / Discovery',
    needs_analysis: 'Analise de Necessidades',
    presentation_demo: 'Apresentacao / Demo',
    proposal_review: 'Revisao de Proposta',
    negotiation: 'Negociacao',
    objection_handling: 'Tratamento de Objecoes',
    closing: 'Fechamento',
    follow_up: 'Follow Up',
  };
  return map[slug] || slug;
}

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

  // New states for 4-step flow
  const [showGenerationLoading, setShowGenerationLoading] = useState(false);
  const [showCreationLoading, setShowCreationLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [scenarioFormData, setScenarioFormData] = useState<ScenarioFormData | null>(null);
  const [generatedData, setGeneratedData] = useState<CaseSetupGenerateResponse | null>(null);
  const [createdAgentId, setCreatedAgentId] = useState<number | null>(null);

  // Read query params for pre-selection
  useEffect(() => {
    const offerIdParam = searchParams.get('offer_id');
    const contextIdParam = searchParams.get('context_id');
    const stepParam = searchParams.get('step');

    const offerId = offerIdParam ? Number(offerIdParam) : null;
    const contextId = contextIdParam ? Number(contextIdParam) : null;

    if (offerId && !Number.isNaN(offerId) && offerId > 0 && contextId && !Number.isNaN(contextId) && contextId > 0 && stepParam === 'case-setup') {
      loadPreselectedContext(offerId, contextId);
      return;
    }
    if (offerId && !Number.isNaN(offerId) && offerId > 0 && stepParam === 'context') {
      loadPreselectedOffer(offerId);
    }
  }, [searchParams]);

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

  const loadPreselectedContext = async (offerId: number, contextId: number) => {
    setIsLoadingPreselectedOffer(true);
    try {
      const [offers, contexts] = await Promise.all([listOffers(), listContexts(offerId)]);
      const foundOffer = offers.find((o: Offer) => o.id === offerId);
      const foundContext = contexts.find((c: Context) => c.id === contextId);
      if (foundOffer && foundContext) {
        setState((prev) => ({
          ...prev,
          offer: {
            id: foundOffer.id,
            offer_name: foundOffer.offer_name,
            general_description: foundOffer.general_description,
          },
          context: {
            id: foundContext.id,
            offer_id: foundContext.offer_id,
            name: foundContext.name,
            target_description: foundContext.target_description,
            compelling_events: foundContext.compelling_events,
            strategic_priorities: foundContext.strategic_priorities,
            quantifiable_pain_points: foundContext.quantifiable_pain_points,
            desired_future_state: foundContext.desired_future_state,
            primary_value_drivers: foundContext.primary_value_drivers,
            typical_decision_making_process: foundContext.typical_decision_making_process,
            risk_aversion_level: foundContext.risk_aversion_level,
            persona_objections_and_concerns: foundContext.persona_objections_and_concerns,
            persona_awareness_of_the_problem: foundContext.persona_awareness_of_the_problem,
            persona_awareness_of_the_solutions: foundContext.persona_awareness_of_the_solutions,
            persona_existing_solutions: foundContext.persona_existing_solutions,
          },
          caseSetup: { ...prev.caseSetup, context_id: foundContext.id },
          currentStep: 'case-setup',
        }));
      }
    } catch (err) {
      console.error('Erro ao carregar oferta/contexto pre-selecionado:', err);
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

  const handleScenarioComplete = async (data: ScenarioFormData) => {
    setScenarioFormData(data);
    setShowGenerationLoading(true);

    try {
      const contextId = state.context.id;
      if (!contextId) throw new Error('Context ID not found');

      const [, generated] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 10000)),
        generateCaseSetup({
          context_id: contextId,
          call_context_type_slug: data.call_context_type_slug || undefined,
          scenario_difficulty_level: data.scenario_difficulty_level || undefined,
          training_targeted_sales_skills: data.training_targeted_sales_skill || undefined,
          aditional_instructions: data.additional_instructions || undefined,
        }),
      ]);

      setGeneratedData(generated);
      setState((prev) => ({ ...prev, currentStep: 'review' }));
    } catch (err) {
      console.error('Erro ao gerar cenario:', err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erro ao gerar cenario',
      }));
    } finally {
      setShowGenerationLoading(false);
    }
  };

  const handleReviewComplete = async (finalData: CaseSetupGenerateResponse) => {
    setShowCreationLoading(true);

    try {
      const contextId = state.context.id;
      if (!contextId) throw new Error('Context ID not found');

      const [, created] = await Promise.all([
        new Promise((resolve) => setTimeout(resolve, 10000)),
        createCaseSetup({
          context_id: contextId,
          call_context_type_slug: finalData.call_context_type_slug,
          training_name: finalData.training_name,
          training_description: finalData.training_description,
          training_objective: finalData.training_objective,
          training_targeted_sales_skills: finalData.training_targeted_sales_skills,
          scenario_difficulty_level: finalData.scenario_difficulty_level,
          buyer_agent_instructions: finalData.buyer_agent_instructions,
          buyer_agent_initial_tone_and_mood: finalData.buyer_agent_initial_tone_and_mood,
          salesperson_success_criteria: finalData.salesperson_success_criteria,
          company_profile: finalData.company_profile,
          persona_profile: finalData.persona_profile,
          successful_sale_dialogues_examples: finalData.successful_sale_dialogues_examples,
          unsuccessful_sale_dialogues_examples: finalData.unsuccessful_sale_dialogues_examples,
        }),
      ]);

      setAgentDisplayMeta(created.id, {
        displayName: finalData.training_name || finalData.persona_profile.name || 'Roleplay',
        avatarType: 'initials',
      });

      setCreatedAgentId(created.id);
      setGeneratedData(finalData);
      setShowSuccess(true);
    } catch (err) {
      console.error('Erro ao criar treinamento:', err);
      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Erro ao criar treinamento',
      }));
    } finally {
      setShowCreationLoading(false);
    }
  };

  const handleBackToOffer = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: 'offer' }));
  }, []);

  const handleBackToContext = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: 'context' }));
  }, []);

  const handleBackToScenario = useCallback(() => {
    setState((prev) => ({ ...prev, currentStep: 'case-setup' }));
  }, []);

  const handleCancel = useCallback(() => {
    router.push('/agents');
  }, [router]);

  const stepTitles: Record<WizardStep, { title: string; subtitle: string }> = {
    offer: {
      title: 'Etapa 1 de 4: Oferta',
      subtitle: 'Explique sobre o produto ou servico que voce quer treinar a vender',
    },
    context: {
      title: 'Etapa 2 de 4: Perfil do Comprador',
      subtitle: 'Defina quem e seu cliente ideal e seus desafios',
    },
    'case-setup': {
      title: 'Etapa 3 de 4: Cenario',
      subtitle: 'Configure o tipo de chamada e dificuldade do treinamento',
    },
    review: {
      title: 'Etapa 4 de 4: Revisao',
      subtitle: 'Revise e ajuste os detalhes do seu treinamento antes de criar',
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

  // Success screen replaces everything
  if (showSuccess && createdAgentId && generatedData) {
    const scenarioLabel = formatCallContextLabel(generatedData.call_context_type_slug);
    return (
      <div className="w-full max-w-6xl mx-auto">
        <div className="card-surface p-8">
          <StepSuccess
            agentId={createdAgentId}
            generatedData={generatedData}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Loading overlays */}
      {showGenerationLoading && (
        <LoadingOverlay
          phrases={LOADING_PHRASES_GENERATION}
          durationMs={10000}
          onComplete={() => {}}
        />
      )}
      {showCreationLoading && (
        <LoadingOverlay
          phrases={LOADING_PHRASES_CREATION}
          durationMs={10000}
          onComplete={() => {}}
        />
      )}

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

          {/* Error */}
          {state.error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3 mb-6">
              {state.error}
            </div>
          )}

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
            <StepScenario
              onComplete={handleScenarioComplete}
              onBack={handleBackToContext}
              setFooterContent={setFooterContent}
            />
          )}

          {state.currentStep === 'review' && generatedData && (
            <StepReview
              generatedData={generatedData}
              onComplete={handleReviewComplete}
              onBack={handleBackToScenario}
              setFooterContent={setFooterContent}
            />
          )}
        </div>
      </div>

      {/* Fixed footer bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-20 border-t border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 py-4 px-4">
          {footerContent}
        </div>
      </footer>
    </>
  );
}
