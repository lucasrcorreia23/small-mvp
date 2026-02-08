'use client';

import { useState, useEffect } from 'react';
import {
  CaseSetupCreateRequest,
  CaseSetupGenerateResponse,
  CallContextValue,
  PersonaOutput,
  EmployerCompanyOutput,
  AgentInstructionsOutput,
  DialogOutput,
} from '@/app/lib/types/sta';
import { LoadingView } from '@/app/components/loading-view';
import { generateCaseSetup, createCaseSetup, getCallContextValues } from '@/app/lib/sta-service';

interface StepCaseSetupProps {
  contextId: number;
  initialData: Partial<CaseSetupCreateRequest> & { id?: number };
  onComplete: (data: CaseSetupCreateRequest & { id: number }) => void;
  onBack: () => void;
}

const difficultyLevels = [
  { value: 'easy', label: 'Facil', description: 'Cliente receptivo e interessado' },
  { value: 'medium', label: 'Medio', description: 'Cliente com algumas objecoes' },
  { value: 'hard', label: 'Dificil', description: 'Cliente resistente e critico' },
];

export function StepCaseSetup({ contextId, initialData, onComplete, onBack }: StepCaseSetupProps) {
  // Training fields (editable)
  const [trainingName, setTrainingName] = useState(initialData.training_name || '');
  const [trainingDescription, setTrainingDescription] = useState(initialData.training_description || '');
  const [trainingObjective, setTrainingObjective] = useState(initialData.training_objective || '');
  const [callContextSlug, setCallContextSlug] = useState(initialData.call_context_type_slug || '');
  const [difficultyLevel, setDifficultyLevel] = useState(initialData.scenario_difficulty_level || 'medium');

  // Generated data (read-only after generation)
  const [personaProfile, setPersonaProfile] = useState<PersonaOutput | null>(initialData.persona_profile || null);
  const [companyProfile, setCompanyProfile] = useState<EmployerCompanyOutput | null>(initialData.company_profile || null);
  const [buyerInstructions, setBuyerInstructions] = useState<AgentInstructionsOutput[]>(
    Array.isArray(initialData.buyer_agent_instructions) ? initialData.buyer_agent_instructions : []
  );
  const [initialTone, setInitialTone] = useState(initialData.buyer_agent_initial_tone_and_mood || '');
  const [successCriteria, setSuccessCriteria] = useState<string[]>(initialData.salesperson_success_criteria || []);
  const [targetedSkills, setTargetedSkills] = useState<string[]>(initialData.training_targeted_sales_skills || []);
  const [successDialog, setSuccessDialog] = useState<DialogOutput[]>(initialData.successful_sale_dialogues_examples || []);
  const [unsuccessDialog, setUnsuccessDialog] = useState<DialogOutput[]>(initialData.unsuccessful_sale_dialogues_examples || []);

  const [callContextValues, setCallContextValues] = useState<CallContextValue[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load call context values on mount
  useEffect(() => {
    loadCallContextValues();
  }, []);

  const loadCallContextValues = async () => {
    try {
      const values = await getCallContextValues();
      setCallContextValues(values);
      if (values.length > 0 && !callContextSlug) {
        setCallContextSlug(values[0].slug);
      }
    } catch (err) {
      console.error('Erro ao carregar valores de contexto:', err);
      setCallContextValues([
        { slug: 'cold_call', label: 'Cold Call' },
        { slug: 'qualification_discovery', label: 'Qualificacao / Discovery' },
        { slug: 'presentation_demo', label: 'Apresentacao / Demo' },
        { slug: 'negotiation', label: 'Negociacao' },
      ]);
    } finally {
      setIsLoadingValues(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const generated: CaseSetupGenerateResponse = await generateCaseSetup({
        context_id: contextId,
        call_context_type_slug: callContextSlug || undefined,
        scenario_difficulty_level: difficultyLevel || undefined,
      });

      setTrainingName(generated.training_name || '');
      setTrainingDescription(generated.training_description || '');
      setTrainingObjective(generated.training_objective || '');
      setCallContextSlug(generated.call_context_type_slug || callContextSlug);
      setDifficultyLevel(generated.scenario_difficulty_level || 'medium');
      setPersonaProfile(generated.persona_profile);
      setCompanyProfile(generated.company_profile);
      setBuyerInstructions(generated.buyer_agent_instructions);
      setInitialTone(generated.buyer_agent_initial_tone_and_mood || '');
      setSuccessCriteria(generated.salesperson_success_criteria || []);
      setTargetedSkills(generated.training_targeted_sales_skills || []);
      setSuccessDialog(generated.successful_sale_dialogues_examples || []);
      setUnsuccessDialog(generated.unsuccessful_sale_dialogues_examples || []);
      setHasGenerated(true);
    } catch (err) {
      console.error('Erro ao gerar cenario:', err);
      setError(err instanceof Error ? err.message : 'Erro ao gerar cenario');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!trainingName.trim() || !trainingDescription.trim() || !personaProfile || !companyProfile || buyerInstructions.length === 0) {
      setError('Gere o cenario primeiro e preencha os campos obrigatorios');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData: CaseSetupCreateRequest = {
        context_id: contextId,
        call_context_type_slug: callContextSlug || '',
        training_name: trainingName.trim(),
        training_description: trainingDescription.trim(),
        training_keywords: initialData.training_keywords ?? '',
        training_objective: trainingObjective.trim(),
        training_targeted_sales_skills: targetedSkills,
        scenario_difficulty_level: difficultyLevel,
        buyer_agent_instructions: buyerInstructions,
        buyer_prior_knowledge: initialData.buyer_prior_knowledge ?? [],
        buyer_agent_initial_tone_and_mood: initialTone,
        buyer_agent_first_messages: initialData.buyer_agent_first_messages ?? [],
        buyer_agent_success_criteria: initialData.buyer_agent_success_criteria ?? [],
        salesperson_instructions: initialData.salesperson_instructions ?? [],
        salesperson_desired_tone_and_mood: initialData.salesperson_desired_tone_and_mood ?? '',
        salesperson_desired_behaviors: initialData.salesperson_desired_behaviors ?? [],
        salesperson_undesired_behaviors: initialData.salesperson_undesired_behaviors ?? [],
        salesperson_success_criteria: successCriteria,
        salesperson_evaluation_rubric_criteria: initialData.salesperson_evaluation_rubric_criteria ?? [],
        company_profile: companyProfile,
        persona_profile: personaProfile,
        persona_voice_slug: initialData.persona_voice_slug ?? '',
        persona_voice_model_id: initialData.persona_voice_model_id ?? null,
        successful_sale_dialogues_examples: successDialog,
        unsuccessful_sale_dialogues_examples: unsuccessDialog,
      };

      const created = await createCaseSetup(requestData);

      onComplete({
        ...requestData,
        id: created.id,
      });
    } catch (err) {
      console.error('Erro ao salvar cenario:', err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar cenario');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingValues) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Carregando opcoes..." fullPage={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-slate-800 mb-2">
          Etapa 3: Configure o Cenario
        </h2>
        <p className="text-sm text-slate-500">
          Defina como sera o treinamento de vendas
        </p>
      </div>

      {/* Pre-generation: context type and difficulty selection */}
      {!hasGenerated && !initialData.id && (
        <div className="space-y-4">
          {/* Call Context */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Contexto da Chamada
            </label>
            <select
              value={callContextSlug}
              onChange={(e) => setCallContextSlug(e.target.value)}
              className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
            >
              {callContextValues.map((ctx) => (
                <option key={ctx.slug} value={ctx.slug}>
                  {ctx.label}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Nivel de Dificuldade
            </label>
            <div className="grid grid-cols-3 gap-2">
              {difficultyLevels.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setDifficultyLevel(level.value)}
                  className={`p-3 border rounded-none text-center transition-colors ${
                    difficultyLevel === level.value
                      ? 'bg-[#2E63CD] border-[#2E63CD] text-white'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="font-medium text-sm">{level.label}</div>
                  <div className={`text-xs mt-1 ${
                    difficultyLevel === level.value ? 'text-blue-100' : 'text-slate-500'
                  }`}>
                    {level.description}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Gerando cenario...
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" clipRule="evenodd" />
                </svg>
                Gerar Cenario com IA
              </>
            )}
          </button>
        </div>
      )}

      {/* Post-generation: editable + read-only sections */}
      {(hasGenerated || initialData.id) && (
        <div className="space-y-6">
          {/* Section: Treinamento (editable) */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Treinamento</h3>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nome do Treinamento *</label>
              <input
                type="text"
                value={trainingName}
                onChange={(e) => setTrainingName(e.target.value)}
                placeholder="Ex: Qualificacao com Gerente de TI"
                className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Descricao *</label>
              <textarea
                value={trainingDescription}
                onChange={(e) => setTrainingDescription(e.target.value)}
                placeholder="Descreva o cenario de treinamento..."
                rows={3}
                className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Objetivo</label>
              <input
                type="text"
                value={trainingObjective}
                onChange={(e) => setTrainingObjective(e.target.value)}
                placeholder="Ex: Qualificar prospect e agendar demonstracao"
                className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              />
            </div>

            {/* Call Context */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Contexto da Chamada</label>
              <select
                value={callContextSlug}
                onChange={(e) => setCallContextSlug(e.target.value)}
                className="w-full px-4 py-3 rounded-none border border-slate-200 bg-white/70 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
              >
                {callContextValues.map((ctx) => (
                  <option key={ctx.slug} value={ctx.slug}>
                    {ctx.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Nivel de Dificuldade</label>
              <div className="grid grid-cols-3 gap-2">
                {difficultyLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setDifficultyLevel(level.value)}
                    className={`p-3 border rounded-none text-center transition-colors ${
                      difficultyLevel === level.value
                        ? 'bg-[#2E63CD] border-[#2E63CD] text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-medium text-sm">{level.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section: Persona do Comprador (read-only card) */}
          {personaProfile && companyProfile && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Persona do Comprador</h3>
              <div className="bg-slate-50 border border-slate-200 rounded-none p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#2E63CD] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {personaProfile.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{personaProfile.name}</div>
                    <div className="text-sm text-slate-500">{personaProfile.job_title}, {personaProfile.age} anos</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-slate-500">Empresa:</span>{' '}
                    <span className="text-slate-700 font-medium">{companyProfile.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Industria:</span>{' '}
                    <span className="text-slate-700">{companyProfile.industry_slug}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Funcionarios:</span>{' '}
                    <span className="text-slate-700">{companyProfile.number_of_employees}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Tom inicial:</span>{' '}
                    <span className="text-slate-700">{initialTone || 'Neutro'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Criterios de Avaliacao (read-only) */}
          {(successCriteria.length > 0 || targetedSkills.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Criterios de Avaliacao</h3>

              {successCriteria.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">Criterios de Sucesso</label>
                  <ul className="space-y-1">
                    {successCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-[#2E63CD] mt-0.5">&#x2713;</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {targetedSkills.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">Habilidades Avaliadas</label>
                  <div className="flex flex-wrap gap-2">
                    {targetedSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-[#2E63CD]/10 text-[#2E63CD] border border-[#2E63CD]/20 rounded-none"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
          disabled={isSaving || !trainingName.trim() || !trainingDescription.trim() || !personaProfile || buyerInstructions.length === 0}
          className="flex-1 h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Criando Agente...
            </>
          ) : (
            'Criar Agente'
          )}
        </button>
      </div>

      {/* Regenerate Button */}
      {hasGenerated && (
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
      )}
    </div>
  );
}
