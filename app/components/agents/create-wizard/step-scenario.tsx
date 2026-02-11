'use client';

import { useState, useEffect } from 'react';
import { ScenarioFormData, CallContextValue } from '@/app/lib/types/sta';
import { getCallContextValues } from '@/app/lib/sta-service';
import { MOCK_SALES_SKILLS } from '@/app/lib/mock-data';
import { LoadingView } from '@/app/components/loading-view';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';

interface StepScenarioProps {
  onComplete: (data: ScenarioFormData) => void;
  onBack: () => void;
  setFooterContent?: (node: React.ReactNode) => void;
}

const difficultyLevels = [
  { value: 'easy', label: 'Facil' },
  { value: 'medium', label: 'Medio' },
  { value: 'hard', label: 'Dificil' },
];

export function StepScenario({ onComplete, onBack, setFooterContent }: StepScenarioProps) {
  const [callContextValues, setCallContextValues] = useState<CallContextValue[]>([]);
  const [isLoadingValues, setIsLoadingValues] = useState(true);

  const [callContextSlug, setCallContextSlug] = useState('');
  const [difficultyLevel, setDifficultyLevel] = useState('medium');
  const [salesSkill, setSalesSkill] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  useEffect(() => {
    loadCallContextValues();
  }, []);

  const loadCallContextValues = async () => {
    try {
      const values = await getCallContextValues();
      setCallContextValues(values);
      if (values.length > 0) {
        setCallContextSlug(values[0].slug);
      }
    } catch {
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

  const handleSubmit = () => {
    onComplete({
      call_context_type_slug: callContextSlug,
      scenario_difficulty_level: difficultyLevel,
      training_targeted_sales_skill: salesSkill,
      additional_instructions: additionalInstructions.trim(),
    });
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
          className="btn-secondary w-fit h-12 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200"
        >
          Voltar
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary w-fit h-12 px-6 text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          Gerar Cenario
        </button>
      </>
    );
    return () => setFooterContent(null);
  }, [setFooterContent, onBack, isLoadingValues, callContextSlug, difficultyLevel, salesSkill, additionalInstructions]);

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
        {/* Left Column (40%): Static content */}
        <div className="w-full lg:w-[40%] lg:flex-shrink-0 lg:pr-8 space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Orientacoes</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Configure o cenario de treinamento escolhendo o tipo de chamada, nivel de dificuldade
                e habilidade que deseja praticar. A IA criara uma persona e criterios de avaliacao com
                base nessas configuracoes.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Boas Praticas</h3>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>&#x2022; Comece com dificuldade media para calibrar</li>
                <li>&#x2022; Escolha uma habilidade por vez para foco</li>
                <li>&#x2022; Use instrucoes adicionais para cenarios especificos</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Dicas</h3>
              <ul className="text-sm text-slate-500 space-y-1">
                <li>&#x2022; Cold Call: ideal para treinar abertura e rapport</li>
                <li>&#x2022; Discovery: foco em perguntas SPIN e escuta ativa</li>
                <li>&#x2022; Negociacao: pratique contorno de objecoes</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Proximos Passos</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Apos configurar o cenario, a IA ira gerar automaticamente a persona do comprador,
                criterios de avaliacao e dialogo de exemplo. Voce podera revisar e editar tudo na
                proxima etapa.
              </p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden lg:block w-px bg-slate-200 flex-shrink-0 self-stretch min-h-[200px]" aria-hidden />

        {/* Right Column (60%): Form fields without labels */}
        <div className="w-full lg:w-[60%] lg:pl-8">
          <div className="space-y-5">
            <Select value={callContextSlug || undefined} onValueChange={setCallContextSlug}>
              <SelectTrigger>
                <SelectValue placeholder="Contexto da chamada" />
              </SelectTrigger>
              <SelectContent>
                {callContextValues.map((ctx) => (
                  <SelectItem key={ctx.slug} value={ctx.slug}>
                    {ctx.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel de dificuldade" />
              </SelectTrigger>
              <SelectContent>
                {difficultyLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={salesSkill || undefined} onValueChange={setSalesSkill}>
              <SelectTrigger>
                <SelectValue placeholder="Habilidade de venda para praticar" />
              </SelectTrigger>
              <SelectContent>
                {MOCK_SALES_SKILLS.map((skill) => (
                  <SelectItem key={skill.value} value={skill.value}>
                    {skill.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="Ex: Quero que o comprador seja resistente a mudancas e fale sobre orcamento limitado no inicio da conversa..."
              rows={8}
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white/70 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
