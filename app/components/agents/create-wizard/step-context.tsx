'use client';

import { useState, useEffect } from 'react';
import { LoadingView } from '@/app/components/loading-view';
import { ContextCreateRequest, ContextGenerateResponse } from '@/app/lib/types/sta';
import { generateContext, createContext } from '@/app/lib/sta-service';

interface StepContextProps {
  offerId: number;
  initialData: Partial<ContextCreateRequest> & { id?: number };
  onComplete: (data: ContextCreateRequest & { id: number }) => void;
  onBack: () => void;
}

export function StepContext({ offerId, initialData, onComplete, onBack }: StepContextProps) {
  // Visible fields
  const [name, setName] = useState(initialData.name || '');
  const [targetDescription, setTargetDescription] = useState(initialData.target_description || '');
  const [quantifiablePainPoints, setQuantifiablePainPoints] = useState(initialData.quantifiable_pain_points || '');
  const [desiredFutureState, setDesiredFutureState] = useState(initialData.desired_future_state || '');
  const [personaObjections, setPersonaObjections] = useState(initialData.persona_objections_and_concerns || '');
  const [riskAversionLevel, setRiskAversionLevel] = useState(initialData.risk_aversion_level || '');

  // Hidden fields (stored, passed on create)
  const [compellingEvents, setCompellingEvents] = useState(initialData.compelling_events || '');
  const [strategicPriorities, setStrategicPriorities] = useState(initialData.strategic_priorities || '');
  const [primaryValueDrivers, setPrimaryValueDrivers] = useState(initialData.primary_value_drivers || '');
  const [decisionMakingProcess, setDecisionMakingProcess] = useState(initialData.typical_decision_making_process || '');
  const [awarenessProblem, setAwarenessProblem] = useState(initialData.persona_awareness_of_the_problem || '');
  const [awarenessSolutions, setAwarenessSolutions] = useState(initialData.persona_awareness_of_the_solutions || '');
  const [existingSolutions, setExistingSolutions] = useState(initialData.persona_existing_solutions || '');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate on mount
  useEffect(() => {
    if (!hasGenerated && !initialData.id) {
      handleGenerate();
    }
  }, []);

  const handleGenerate = async () => {
    const validOfferId = Number(offerId);
    if (Number.isNaN(validOfferId) || validOfferId < 1) {
      setError('ID da oferta inválido. Volte à etapa 1 e salve a oferta novamente.');
      return;
    }
    setIsGenerating(true);
    setError(null);

    try {
      const generated: ContextGenerateResponse = await generateContext({
        offer_id: validOfferId,
        aditional_instructions: '',
      });

      setName(generated.name || '');
      setTargetDescription(generated.target_description || '');
      setQuantifiablePainPoints(generated.quantifiable_pain_points || '');
      setDesiredFutureState(generated.desired_future_state || '');
      setPersonaObjections(generated.persona_objections_and_concerns || '');
      setRiskAversionLevel(generated.risk_aversion_level || '');
      setCompellingEvents(generated.compelling_events || '');
      setStrategicPriorities(generated.strategic_priorities || '');
      setPrimaryValueDrivers(generated.primary_value_drivers || '');
      setDecisionMakingProcess(generated.typical_decision_making_process || '');
      setAwarenessProblem(generated.persona_awareness_of_the_problem || '');
      setAwarenessSolutions(generated.persona_awareness_of_the_solutions || '');
      setExistingSolutions(generated.persona_existing_solutions || '');
      setHasGenerated(true);
    } catch (err) {
      console.error('Erro ao gerar contexto:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao gerar contexto';
      const isUnauthorized =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('não autorizado') ||
          (msg.toLowerCase().includes('organization') && msg.toLowerCase().includes('does not have access')) ||
          (msg.includes('organização') && (msg.includes('não tem acesso') || msg.includes('sem acesso'))));
      const isRateLimit =
        typeof msg === 'string' &&
        (msg.toLowerCase().includes('rate limit') ||
          msg.toLowerCase().includes('429') ||
          msg.toLowerCase().includes('limite de requisições'));
      const friendlyMessage = isUnauthorized
        ? 'Sua conta ou organização ainda não tem acesso a este recurso. Faça logout e login novamente. Se o problema continuar, verifique com o suporte se sua organização tem permissão para acessar os agentes.'
        : isRateLimit
          ? 'Limite de requisições excedido. Aguarde alguns minutos e tente gerar o contexto novamente.'
          : msg;
      setError(friendlyMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !targetDescription.trim()) {
      setError('Preencha o nome e a descricao do perfil');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData: ContextCreateRequest = {
        offer_id: offerId,
        name: name.trim(),
        target_description: targetDescription.trim(),
        compelling_events: compellingEvents.trim() || '',
        strategic_priorities: strategicPriorities.trim() || '',
        quantifiable_pain_points: quantifiablePainPoints.trim() || '',
        desired_future_state: desiredFutureState.trim() || '',
        primary_value_drivers: primaryValueDrivers.trim() || '',
        typical_decision_making_process: decisionMakingProcess.trim() || '',
        risk_aversion_level: riskAversionLevel.trim() || '',
        persona_objections_and_concerns: personaObjections.trim() || '',
        persona_awareness_of_the_problem: awarenessProblem.trim() || '',
        persona_awareness_of_the_solutions: awarenessSolutions.trim() || '',
        persona_existing_solutions: existingSolutions.trim() || '',
      };

      const created = await createContext(requestData);

      onComplete({
        ...requestData,
        id: created.id,
      });
    } catch (err) {
      console.error('Erro ao salvar contexto:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar contexto');
    } finally {
      setIsSaving(false);
    }
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Gerando perfil do comprador..." fullPage={false}>
          <p className="text-sm text-slate-500 mt-2">Isso pode levar alguns segundos</p>
        </LoadingView>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Etapa 2: Perfil do Comprador
        </h2>
        <p className="text-sm text-slate-500">
          Defina quem e seu cliente ideal e seus desafios
        </p>
      </div>

      <div className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nome do Contexto *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Gerente Comercial - Empresa de Tecnologia"
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
          />
        </div>

        {/* Target Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Descricao do Comprador *
          </label>
          <textarea
            value={targetDescription}
            onChange={(e) => setTargetDescription(e.target.value)}
            placeholder="Descreva o perfil do comprador ideal..."
            rows={3}
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
          />
        </div>

        {/* Quantifiable Pain Points */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Dores e Problemas Quantificaveis
          </label>
          <textarea
            value={quantifiablePainPoints}
            onChange={(e) => setQuantifiablePainPoints(e.target.value)}
            placeholder="Quais sao as dores concretas e quantificaveis do comprador..."
            rows={3}
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
          />
        </div>

        {/* Desired Future State */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Estado Futuro Desejado
          </label>
          <textarea
            value={desiredFutureState}
            onChange={(e) => setDesiredFutureState(e.target.value)}
            placeholder="Como o comprador imagina o cenario ideal apos resolver os problemas..."
            rows={2}
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
          />
        </div>

        {/* Objections */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Objecoes e Preocupacoes
          </label>
          <textarea
            value={personaObjections}
            onChange={(e) => setPersonaObjections(e.target.value)}
            placeholder="Quais objecoes e preocupacoes o comprador pode levantar..."
            rows={2}
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
          />
        </div>

        {/* Risk Aversion Level */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Nivel de Aversao a Risco
          </label>
          <input
            type="text"
            value={riskAversionLevel}
            onChange={(e) => setRiskAversionLevel(e.target.value)}
            placeholder="Ex: Medio - aberto a novas solucoes com evidencias"
            className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
          />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-none p-3">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        <button
          onClick={onBack}
          disabled={isSaving}
          className="flex-1 h-12 px-6 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-medium rounded-none transition-all duration-200"
        >
          Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !targetDescription.trim()}
          className="flex-1 h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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

      {/* Regenerate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-10 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-medium rounded-none transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
        </svg>
        Gerar Novamente
      </button>
    </div>
  );
}
