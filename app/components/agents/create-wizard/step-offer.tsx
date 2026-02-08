'use client';

import { useState } from 'react';
import { OfferCreateRequest, OfferGenerateResponse } from '@/app/lib/types/sta';
import { generateOffer, createOffer } from '@/app/lib/sta-service';

interface StepOfferProps {
  initialData: Partial<OfferCreateRequest> & { id?: number };
  onComplete: (data: OfferCreateRequest & { id: number }) => void;
}

export function StepOffer({ initialData, onComplete }: StepOfferProps) {
  // User input fields
  const [offerName, setOfferName] = useState(initialData.offer_name || '');
  const [generalDescription, setGeneralDescription] = useState(initialData.general_description || '');

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

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!offerName.trim() || !generalDescription.trim()) {
      setError('Preencha o nome e a descricao da oferta');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const generated: OfferGenerateResponse = await generateOffer({
        offer_name: offerName.trim(),
        general_description: generalDescription.trim(),
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
    if (!offerName.trim() || !generalDescription.trim()) {
      setError('Preencha o nome e a descricao da oferta');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData: OfferCreateRequest = {
        offer_name: offerName.trim(),
        general_description: generalDescription.trim(),
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

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Etapa 1: Defina sua Oferta
        </h2>
        <p className="text-sm text-slate-500">
          Descreva o produto ou servico que voce quer treinar a vender
        </p>
      </div>

      {/* Basic Fields */}
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nome da Oferta *
          </label>
          <input
            type="text"
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            placeholder="Ex: Software de Gestao Empresarial"
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Descricao Geral *
          </label>
          <textarea
            value={generalDescription}
            onChange={(e) => setGeneralDescription(e.target.value)}
            placeholder="Descreva brevemente o que e sua oferta e seus principais beneficios..."
            rows={3}
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
          />
        </div>

        {/* Generate Button */}
        {!hasGenerated && (
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !offerName.trim() || !generalDescription.trim()}
            className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
                Gerar com IA
              </>
            )}
          </button>
        )}
      </div>

      {/* Generated Fields */}
      {hasGenerated && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Publico-alvo
            </label>
            <input
              type="text"
              value={targetAudienceDescription}
              onChange={(e) => setTargetAudienceDescription(e.target.value)}
              placeholder="Quem e o publico-alvo da oferta"
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Proposta de Valor
            </label>
            <textarea
              value={coreValueProposition}
              onChange={(e) => setCoreValueProposition(e.target.value)}
              placeholder="Qual a proposta de valor principal"
              rows={2}
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Problema Principal Resolvido
            </label>
            <input
              type="text"
              value={primaryProblemSolved}
              onChange={(e) => setPrimaryProblemSolved(e.target.value)}
              placeholder="Qual problema principal a oferta resolve"
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Principais Caracteristicas e Beneficios
            </label>
            <textarea
              value={keyFeaturesAndBenefits}
              onChange={(e) => setKeyFeaturesAndBenefits(e.target.value)}
              placeholder="Liste as principais caracteristicas e beneficios"
              rows={3}
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Diferenciais Unicos
            </label>
            <textarea
              value={uniqueSellingPoints}
              onChange={(e) => setUniqueSellingPoints(e.target.value)}
              placeholder="O que torna sua oferta unica no mercado"
              rows={2}
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-none p-3">
          {error}
        </div>
      )}
    </div>
  );
}
