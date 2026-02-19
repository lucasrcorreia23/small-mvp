'use client';

import { useState, useEffect } from 'react';
import { OfferCreateRequest, OfferGenerateResponse } from '@/app/lib/types/sta';
import { generateOffer, createOffer } from '@/app/lib/sta-service';

interface StepOfferProps {
  initialData: Partial<OfferCreateRequest> & { id?: number };
  onComplete: (data: OfferCreateRequest & { id: number }) => void;
  onCancel?: () => void;
  setFooterContent?: (node: React.ReactNode) => void;
}

export function StepOffer({ initialData, onComplete, onCancel, setFooterContent }: StepOfferProps) {
  const [offerName, setOfferName] = useState(initialData.offer_name || '');
  const [offerDescriptionText, setOfferDescriptionText] = useState(initialData.general_description || '');
  const derivedName = offerName.trim();
  const derivedDescription = offerDescriptionText.trim();

  // Generated fields (visible after generation)
  const [targetAudienceDescription, setTargetAudienceDescription] = useState(initialData.target_audience_description || '');
  const [coreValueProposition, setCoreValueProposition] = useState(initialData.core_value_proposition || '');
  const [primaryProblemSolved, setPrimaryProblemSolved] = useState(initialData.primary_problem_solved || '');
  const [keyFeaturesAndBenefits, setKeyFeaturesAndBenefits] = useState(initialData.key_features_and_benefits || '');
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState(initialData.unique_selling_points || '');

  // Hidden fields (stored in state, passed on create)
  const [targetIndustries, setTargetIndustries] = useState(initialData.target_industries_or_domains || '');
  const [competitiveDiff, setCompetitiveDiff] = useState(initialData.competitive_differentiation || '');
  const [deliveryMethod, setDeliveryMethod] = useState(initialData.delivery_method || '');
  const [implementationProcess, setImplementationProcess] = useState(initialData.implementation_onboarding_process || '');
  const [customerSupport, setCustomerSupport] = useState(initialData.customer_support_model || '');
  const [pricingDetails, setPricingDetails] = useState(initialData.pricing_details_summary || '');

  const [infer, setInfer] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!derivedName.trim() || !derivedDescription.trim()) {
      setError('Descreva o produto ou serviço que você quer treinar a vender');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generated: OfferGenerateResponse = await generateOffer({
        offer_name: derivedName.trim(),
        general_description: derivedDescription.trim(),
        infer,
      });

      setTargetAudienceDescription(generated.target_audience_description || '');
      setCoreValueProposition(generated.core_value_proposition || '');
      setPrimaryProblemSolved(generated.primary_problem_solved || '');
      setKeyFeaturesAndBenefits(generated.key_features_and_benefits || '');
      setUniqueSellingPoints(generated.unique_selling_points || '');
      setTargetIndustries(generated.target_industries_or_domains || '');
      setCompetitiveDiff(generated.competitive_differentiation || '');
      setDeliveryMethod(generated.delivery_method || '');
      setImplementationProcess(generated.implementation_onboarding_process || '');
      setCustomerSupport(generated.customer_support_model || '');
      setPricingDetails(generated.pricing_details_summary || '');
      setHasGenerated(true);
    } catch (err) {
      console.error('Erro ao gerar oferta:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao gerar oferta';
      const isOrgOrUnauthorized =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('organization') && msg.toLowerCase().includes('not have an organization assigned') ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('não autorizado'));
      setError(
        isOrgOrUnauthorized
          ? 'Sua conta ainda não tem organização vinculada ou permissão para agentes. Conclua o cadastro da empresa (etapa 2) e faça logout e login novamente.'
          : msg
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!derivedName.trim() || !derivedDescription.trim()) {
      setError('Descreva o produto ou serviço que você quer treinar a vender');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData: OfferCreateRequest = {
        offer_name: derivedName.trim(),
        general_description: derivedDescription.trim(),
        target_audience_description: targetAudienceDescription.trim() || '',
        core_value_proposition: coreValueProposition.trim() || '',
        primary_problem_solved: primaryProblemSolved.trim() || '',
        key_features_and_benefits: keyFeaturesAndBenefits.trim() || '',
        unique_selling_points: uniqueSellingPoints.trim() || '',
        target_industries_or_domains: targetIndustries.trim() || '',
        competitive_differentiation: competitiveDiff.trim() || '',
        delivery_method: deliveryMethod.trim() || '',
        implementation_onboarding_process: implementationProcess.trim() || '',
        customer_support_model: customerSupport.trim() || '',
        pricing_details_summary: pricingDetails.trim() || '',
      };

      const created = await createOffer(requestData);
      const offerId = typeof created.id === 'number' && !Number.isNaN(created.id) ? created.id : undefined;
      if (offerId == null) {
        setError('ID da oferta não retornado pela API. Tente salvar novamente.');
        return;
      }
      onComplete({
        ...requestData,
        id: offerId,
      });
    } catch (err) {
      console.error('Erro ao salvar oferta:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar oferta');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (!setFooterContent) return;
    const canSave = derivedName.trim() && derivedDescription.trim();
    setFooterContent(
      <>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary w-fit h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200"
          >
            Cancelar
          </button>
        ) : (
          <div />
        )}
        <button
          onClick={handleSave}
          disabled={isSaving || !canSave}
          className="btn-primary w-fit h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar e Continuar'
          )}
        </button>
      </>
    );
    return () => setFooterContent(null);
  }, [setFooterContent, onCancel, isSaving, derivedName, derivedDescription]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-0">
        {/* Left Column: nome da oferta + descrição para IA + infer toggle + generate */}
        <div className="w-full lg:w-[40%] lg:flex-shrink-0 lg:pr-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Nome da oferta</label>
            <input
              type="text"
              value={offerName}
              onChange={(e) => setOfferName(e.target.value)}
              placeholder="Ex: Plataforma SaaS de gestao de vendas"
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Descrição para a IA</label>
            <textarea
              value={offerDescriptionText}
              onChange={(e) => setOfferDescriptionText(e.target.value)}
              placeholder="Ex: Software que ajuda equipes comerciais B2B a aumentar conversao com treinamento pratico e analise SPIN em tempo real"
              rows={8}
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="offer-infer"
                checked={infer}
                onChange={(e) => setInfer(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 focus:ring-2 focus:ring-[#2E63CD]/30 focus:ring-offset-0 accent-[#2E63CD]"
              />
              <label htmlFor="offer-infer" className="text-sm font-medium text-slate-700">
                Preenchimento criativo
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Quando ativado, a IA pode sugerir conteúdo mais criativo e variado para preencher os campos.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating || !derivedName.trim() || !derivedDescription.trim()}
            className="btn-primary w-full h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                </svg>
                {hasGenerated ? 'Gerar Novamente' : 'Gerar com IA'}
              </>
            )}
          </button>
        </div>

        {/* Divider between columns */}
        <div className="hidden lg:block w-px bg-slate-200 flex-shrink-0 self-stretch min-h-[200px]" aria-hidden />

        {/* Right Column: all offer fields (always visible) */}
        <div className="w-full lg:w-[60%] lg:pl-8">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Público-alvo</label>
              <input
                type="text"
                value={targetAudienceDescription}
                onChange={(e) => setTargetAudienceDescription(e.target.value)}
                placeholder="Ex: Gerentes comerciais de empresas B2B com 50-500 funcionarios"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Indústrias ou domínios-alvo</label>
              <input
                type="text"
                value={targetIndustries}
                onChange={(e) => setTargetIndustries(e.target.value)}
                placeholder="Ex: Tecnologia, SaaS, Servicos Financeiros, Consultoria"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Problema principal resolvido</label>
              <input
                type="text"
                value={primaryProblemSolved}
                onChange={(e) => setPrimaryProblemSolved(e.target.value)}
                placeholder="Ex: Equipes perdem 60% do tempo em tarefas manuais sem visibilidade de pipeline"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Proposta de valor</label>
              <textarea
                value={coreValueProposition}
                onChange={(e) => setCoreValueProposition(e.target.value)}
                placeholder="Ex: Aumente em 40% a taxa de conversao com treinamento pratico baseado em IA e metricas SPIN"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Principais características e benefícios</label>
              <textarea
                value={keyFeaturesAndBenefits}
                onChange={(e) => setKeyFeaturesAndBenefits(e.target.value)}
                placeholder="Ex: Simulacoes com IA; Analise SPIN automatizada; Dashboard de desempenho; Cenarios por industria"
                rows={3}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Diferenciais competitivos</label>
              <textarea
                value={uniqueSellingPoints}
                onChange={(e) => setUniqueSellingPoints(e.target.value)}
                placeholder="Ex: Unica plataforma que combina IA conversacional com metodologia SPIN Selling"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Diferenciação competitiva</label>
              <textarea
                value={competitiveDiff}
                onChange={(e) => setCompetitiveDiff(e.target.value)}
                placeholder="Ex: Pratica ilimitada com personas de IA realistas, sem depender de colegas ou gestores"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Método de entrega</label>
              <input
                type="text"
                value={deliveryMethod}
                onChange={(e) => setDeliveryMethod(e.target.value)}
                placeholder="Ex: Plataforma web via navegador com app mobile complementar"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Processo de implementação</label>
              <textarea
                value={implementationProcess}
                onChange={(e) => setImplementationProcess(e.target.value)}
                placeholder="Ex: Onboarding assistido em 48h, setup de cenarios em 5 dias uteis, treinamento incluso"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Suporte ao cliente</label>
              <input
                type="text"
                value={customerSupport}
                onChange={(e) => setCustomerSupport(e.target.value)}
                placeholder="Ex: Suporte via chat 24/7, gerente de sucesso dedicado para planos Enterprise"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Precificação</label>
              <textarea
                value={pricingDetails}
                onChange={(e) => setPricingDetails(e.target.value)}
                placeholder="Ex: A partir de R$ 89/usuario/mes, desconto progressivo, trial gratuito de 14 dias"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
          {error}
        </div>
      )}
    </div>
  );
}
