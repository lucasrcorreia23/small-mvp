'use client';

import { useState, useEffect } from 'react';
import { ContextCreateRequest, ContextGenerateResponse } from '@/app/lib/types/sta';
import { generateContext, createContext } from '@/app/lib/sta-service';

interface StepContextProps {
  offerId: number;
  initialData: Partial<ContextCreateRequest> & { id?: number };
  onComplete: (data: ContextCreateRequest & { id: number }) => void;
  onBack: () => void;
  setFooterContent?: (node: React.ReactNode) => void;
  offerSummary?: { offer_name: string; general_description: string };
}

export function StepContext({ offerId, initialData, onComplete, onBack, setFooterContent, offerSummary }: StepContextProps) {
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

  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        aditional_instructions: additionalInstructions.trim() || '',
        infer: false,
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

  useEffect(() => {
    if (!setFooterContent) return;
    setFooterContent(
      <>
        <button
          onClick={onBack}
          disabled={isSaving}
          className="btn-secondary w-fit h-12 px-6 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 font-medium transition-all duration-200"
        >
          Voltar
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || !targetDescription.trim()}
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
  }, [setFooterContent, onBack, isSaving, name, targetDescription]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-0">
        {/* Left Column: textarea + generate */}
        <div className="w-full lg:w-[40%] lg:flex-shrink-0 lg:pr-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Descrição para a IA</label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="Ex: Diretor de TI de empresa de logistica, frustrado com sistemas legados, precisa modernizar operacao"
              rows={8}
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
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
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                </svg>
                {hasGenerated ? 'Gerar Novamente' : 'Gerar Contexto'}
              </>
            )}
          </button>
        </div>

        {/* Divider between columns */}
        <div className="hidden lg:block w-px bg-slate-200 flex-shrink-0 self-stretch min-h-[200px]" aria-hidden />

        {/* Right Column: all context fields (always visible) */}
        <div className="w-full lg:w-[60%] lg:pl-8 relative">
          {isGenerating && (
            <div className="absolute top-0 right-0 z-10 flex items-center gap-2 text-sm text-slate-500">
              <div className="w-4 h-4 border-2 border-[#2E63CD] border-t-transparent rounded-full animate-spin" />
              Gerando perfil...
            </div>
          )}
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Nome do perfil</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Diretor de TI - Empresa de Logistica"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Descrição do perfil</label>
              <textarea
                value={targetDescription}
                onChange={(e) => setTargetDescription(e.target.value)}
                placeholder="Ex: Carlos, 45 anos, diretor de TI, frustrado com sistemas legados e perda de eficiencia operacional"
                rows={3}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Eventos catalisadores</label>
              <textarea
                value={compellingEvents}
                onChange={(e) => setCompellingEvents(e.target.value)}
                placeholder="Ex: Empresa perdeu 2 clientes grandes no ultimo semestre por falta de rastreamento"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Prioridades estratégicas</label>
              <textarea
                value={strategicPriorities}
                onChange={(e) => setStrategicPriorities(e.target.value)}
                placeholder="Ex: Reduzir custos operacionais em 20%, modernizar sistemas ate o fim do ano"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Dores quantificáveis</label>
              <textarea
                value={quantifiablePainPoints}
                onChange={(e) => setQuantifiablePainPoints(e.target.value)}
                placeholder="Ex: Processos manuais custam 40% mais, lead time 3x maior que concorrentes digitalizados"
                rows={3}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Estado futuro desejado</label>
              <textarea
                value={desiredFutureState}
                onChange={(e) => setDesiredFutureState(e.target.value)}
                placeholder="Ex: Operacao integrada com pedidos online e rastreamento em tempo real para clientes"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Principais drivers de valor</label>
              <textarea
                value={primaryValueDrivers}
                onChange={(e) => setPrimaryValueDrivers(e.target.value)}
                placeholder="Ex: ROI comprovado em 90 dias, facilidade de uso, suporte dedicado na transicao"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Processo de decisão</label>
              <textarea
                value={decisionMakingProcess}
                onChange={(e) => setDecisionMakingProcess(e.target.value)}
                placeholder="Ex: Consulta diretoria, avalia 2-3 fornecedores, piloto de 30 dias, decisao colegiada"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Nível de aversão ao risco</label>
              <input
                type="text"
                value={riskAversionLevel}
                onChange={(e) => setRiskAversionLevel(e.target.value)}
                placeholder="Ex: Alto - cauteloso com mudancas que afetem a operacao atual"
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Objeções e preocupações</label>
              <textarea
                value={personaObjections}
                onChange={(e) => setPersonaObjections(e.target.value)}
                placeholder="Ex: Nao quero trocar tudo de uma vez, investimento alto para o momento, funcionarios vao resistir"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Consciência do problema</label>
              <textarea
                value={awarenessProblem}
                onChange={(e) => setAwarenessProblem(e.target.value)}
                placeholder="Ex: Alta - sente a pressao do mercado diariamente mas nao sabe por onde comecar"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Consciência das soluções</label>
              <textarea
                value={awarenessSolutions}
                onChange={(e) => setAwarenessSolutions(e.target.value)}
                placeholder="Ex: Baixa - sabe que precisa digitalizar mas nao entende as opcoes disponiveis"
                rows={2}
                className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-slate-700">Soluções atuais</label>
              <textarea
                value={existingSolutions}
                onChange={(e) => setExistingSolutions(e.target.value)}
                placeholder="Ex: ERP basico legado, planilhas Excel, comunicacao por telefone e WhatsApp"
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
