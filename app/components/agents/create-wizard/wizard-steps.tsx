'use client';

import { WizardStep } from '@/app/lib/types/sta';

interface WizardStepsProps {
  currentStep: WizardStep;
  /** Quando true, linhas de conexão em branco para contraste em fundos escuros (ex.: ofertas, perfis) */
  lightLines?: boolean;
}

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'offer', label: 'Oferta', number: 1 },
  { key: 'context', label: 'Perfil', number: 2 },
  { key: 'case-setup', label: 'Cenario', number: 3 },
  { key: 'review', label: 'Revisao', number: 4 },
];

export function WizardSteps({ currentStep, lightLines = false }: WizardStepsProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            {/* Label à esquerda + círculo */}
            <div className="flex items-center gap-2">
              <span
                className={`text-sm font-medium transition-colors ${
                  lightLines
                    ? isActive
                      ? 'text-white'
                      : isCompleted
                      ? 'text-white/90'
                      : 'text-white/60'
                    : isActive
                    ? 'text-slate-800'
                    : isCompleted
                    ? 'text-slate-600'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
              <div
                className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-semibold border-2 transition-all flex-shrink-0 ${
                  isActive
                    ? 'bg-[#2E63CD] border-[#2E63CD] text-white ring-2 ring-[#2E63CD]/20'
                    : isCompleted
                    ? lightLines
                      ? 'bg-white border-white text-slate-700'
                      : 'bg-emerald-500 border-emerald-500 text-white'
                    : lightLines
                    ? 'bg-white/20 border-white/50 text-white'
                    : 'bg-white border-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
            </div>

            {/* Connector line entre as etapas - branca */}
            {!isLast && (
              <div className="w-8 sm:w-12 h-0.5 mx-1 flex-shrink-0 rounded-full bg-white border border-slate-200/80" />
            )}
          </div>
        );
      })}
    </div>
  );
}
