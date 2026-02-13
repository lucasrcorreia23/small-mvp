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
import { setAgentDisplayMeta } from '@/app/lib/agent-display-meta';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface StepCaseSetupProps {
  contextId: number;
  initialData: Partial<CaseSetupCreateRequest> & { id?: number };
  onComplete: (data: CaseSetupCreateRequest & { id: number }) => void;
  onBack: () => void;
  setFooterContent?: (node: React.ReactNode) => void;
}

const difficultyLevels = [
  { value: 'easy', label: 'Facil', description: 'Cliente receptivo e interessado' },
  { value: 'medium', label: 'Medio', description: 'Cliente com algumas objecoes' },
  { value: 'hard', label: 'Dificil', description: 'Cliente resistente e critico' },
];

const CASE_SETUP_GENERATE_TIMEOUT_MS = 70_000;

function timeoutErrorMessage(ms: number): string {
  const seconds = Math.round(ms / 1000);
  return `A geração do cenário está demorando mais do que o esperado (${seconds}s). Tente novamente em instantes.`;
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(timeoutErrorMessage(ms))), ms);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function StepCaseSetup({ contextId, initialData, onComplete, onBack, setFooterContent }: StepCaseSetupProps) {
  // Training fields (editable)
  const [trainingName, setTrainingName] = useState(initialData.training_name || '');
  const [trainingDescription, setTrainingDescription] = useState(initialData.training_description || '');
  const [trainingObjective, setTrainingObjective] = useState(initialData.training_objective || '');
  const [callContextSlug, setCallContextSlug] = useState(initialData.call_context_type_slug || '');
  const [difficultyLevel, setDifficultyLevel] = useState(initialData.scenario_difficulty_level || 'medium');
  const [targetedSkillsInput, setTargetedSkillsInput] = useState(
    Array.isArray(initialData.training_targeted_sales_skills)
      ? initialData.training_targeted_sales_skills.join(', ')
      : ''
  );
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [infer, setInfer] = useState(false);

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
  const [personaAvatarImage, setPersonaAvatarImage] = useState<string | null>(null);

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
      const generated: CaseSetupGenerateResponse = await withTimeout(generateCaseSetup({
        context_id: contextId,
        call_context_type_slug: callContextSlug || undefined,
        scenario_difficulty_level: difficultyLevel || undefined,
        training_objective: trainingObjective.trim() || undefined,
        training_targeted_sales_skills: targetedSkillsInput.trim() || undefined,
        aditional_instructions: additionalInstructions.trim() || undefined,
        infer,
      }), CASE_SETUP_GENERATE_TIMEOUT_MS);

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
      setTargetedSkillsInput(
        Array.isArray(generated.training_targeted_sales_skills)
          ? generated.training_targeted_sales_skills.join(', ')
          : ''
      );
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

  const buildRequestData = (): CaseSetupCreateRequest => ({
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
    company_profile: companyProfile!,
    persona_profile: personaProfile!,
    persona_voice_slug: initialData.persona_voice_slug ?? '',
    persona_voice_model_id: initialData.persona_voice_model_id ?? null,
    successful_sale_dialogues_examples: successDialog,
    unsuccessful_sale_dialogues_examples: unsuccessDialog,
  });

  const handleCreateAgent = async () => {
    if (!trainingName.trim() || !trainingDescription.trim() || !personaProfile || !companyProfile || buyerInstructions.length === 0) {
      setError('Gere o cenario primeiro e preencha os campos obrigatorios');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const requestData = buildRequestData();
      const created = await createCaseSetup(requestData);

      const displayName = trainingName.trim() || personaProfile?.name || 'Agente';
      setAgentDisplayMeta(created.id, {
        displayName: displayName || undefined,
        avatarType: 'initials',
      });

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

  useEffect(() => {
    if (!setFooterContent) return;
    if (isLoadingValues) {
      setFooterContent(null);
      return () => setFooterContent(null);
    }
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
          onClick={handleCreateAgent}
          disabled={isSaving || !trainingName.trim() || !trainingDescription.trim() || !personaProfile || buyerInstructions.length === 0}
          className="btn-primary w-fit h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Criando agente...
            </>
          ) : (
            'Finalizar Criação'
          )}
        </button>
      </>
    );
    return () => setFooterContent(null);
  }, [setFooterContent, isLoadingValues, onBack, isSaving, trainingName, trainingDescription, personaProfile, buyerInstructions.length]);

  if (isLoadingValues) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Carregando opcoes..." fullPage={false} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-0">
        {/* Left Column: label + text + textarea + infer toggle + generate (same pattern as Oferta) */}
        <div className="w-full lg:w-[40%] lg:flex-shrink-0 lg:pr-8 space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-slate-700">Descrição para a IA</label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="Descreva o tipo de treinamento e o cenário desejado..."
              rows={8}
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="case-setup-infer"
                checked={infer}
                onChange={(e) => setInfer(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 focus:ring-2 focus:ring-[#2E63CD]/30 focus:ring-offset-0 accent-[#2E63CD]"
              />
              <label htmlFor="case-setup-infer" className="text-sm font-medium text-slate-700">
                Preenchimento criativo
              </label>
            </div>
            <p className="text-xs text-slate-500">
              Quando ativado, a IA pode sugerir conteúdo mais criativo e variado para preencher os campos.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn-primary w-full h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
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
                {hasGenerated ? 'Gerar Novamente' : 'Gerar Cenario com IA'}
              </>
            )}
          </button>
        </div>

        {/* Divider between columns */}
        <div className="hidden lg:block w-px bg-slate-200 flex-shrink-0 self-stretch min-h-[200px]" aria-hidden />

        {/* Right Column: Contexto da Chamada + Nível de Dificuldade + Treinamento + Persona + Critérios */}
        <div className="w-full lg:w-[60%] lg:pl-8">
          <div className="space-y-6">
           

            {/* Section: Treinamento (editable) */}
            <div className="space-y-4">
               {/* Contexto da Chamada + Nível de Dificuldade (moved from left) */}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Contexto da Chamada</label>
                <Select value={callContextSlug || undefined} onValueChange={setCallContextSlug}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o contexto" />
                  </SelectTrigger>
                  <SelectContent>
                    {callContextValues.map((ctx) => (
                      <SelectItem key={ctx.slug} value={ctx.slug}>
                        {ctx.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Nivel de Dificuldade</label>
                <div className="grid grid-cols-3 gap-2">
                  {difficultyLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setDifficultyLevel(level.value)}
                      className={`p-3 border rounded-sm text-center transition-colors ${
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
            </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Nome do Treinamento *</label>
                <input
                  type="text"
                  value={trainingName}
                  onChange={(e) => setTrainingName(e.target.value)}
                  placeholder="Ex: Qualificacao com Gerente de TI"
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Descricao *</label>
                <textarea
                  value={trainingDescription}
                  onChange={(e) => setTrainingDescription(e.target.value)}
                  placeholder="Descreva o cenario de treinamento..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-slate-700">Objetivo</label>
                <input
                  type="text"
                  value={trainingObjective}
                  onChange={(e) => setTrainingObjective(e.target.value)}
                  placeholder="Ex: Qualificar prospect e agendar demonstracao"
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
            </div>

            {/* Section: Persona do Comprador (filled after generate) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Persona do Comprador</h3>
              {personaProfile && companyProfile ? (
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg"
                      className="hidden"
                      id="persona-avatar-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = () => setPersonaAvatarImage(reader.result as string);
                        reader.readAsDataURL(file);
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="persona-avatar-input"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer overflow-hidden bg-[#2E63CD] hover:ring-2 hover:ring-[#2E63CD]/50 focus-within:ring-2 focus-within:ring-[#2E63CD]/50 shrink-0"
                      title="Clique para adicionar imagem (PNG ou JPG)"
                    >
                      {personaAvatarImage ? (
                        <img src={personaAvatarImage} alt="" className="w-full h-full object-cover" />
                      ) : (
                        personaProfile.name.charAt(0)
                      )}
                    </label>
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
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-sm text-slate-500">
                  Preencha os campos à esquerda e clique em &quot;Gerar Cenário com IA&quot; para preencher persona e empresa.
                </div>
              )}
            </div>

            {/* Section: Criterios de Avaliacao (filled after generate) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Criterios de Avaliacao</h3>
              {successCriteria.length > 0 || targetedSkills.length > 0 ? (
                <div className="space-y-4">
                  {successCriteria.length > 0 && (
                    <div className="space-y-4">
                    
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
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-medium text-slate-500">Habilidades Avaliadas</label>
                      <div className="flex flex-wrap gap-4">
                        {targetedSkills.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs bg-[#2E63CD]/10 text-[#2E63CD] border border-[#2E63CD]/20 rounded-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-sm p-4 text-sm text-slate-500">
                  Criterios e habilidades serao preenchidos apos gerar o cenario.
                </div>
              )}
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
