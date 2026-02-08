'use client';

import { WizardStep } from '@/app/lib/types/sta';

interface WizardStepsProps {
  currentStep: WizardStep;
}

const steps: { key: WizardStep; label: string; number: number }[] = [
  { key: 'offer', label: 'Oferta', number: 1 },
  { key: 'context', label: 'Contexto', number: 2 },
  { key: 'case-setup', label: 'Cenario', number: 3 },
];

export function WizardSteps({ currentStep }: WizardStepsProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle - horizontal, 4px rounded */}
            <div className="flex flex-row items-center gap-2">
              <div
                className={`w-10 h-10 flex items-center justify-center rounded-[4px] text-sm font-semibold border-2 transition-colors flex-shrink-0 ${
                  isActive
                    ? 'bg-slate-600 border-slate-600 text-white'
                    : isCompleted
                    ? 'bg-slate-600 border-slate-600 text-white'
                    : 'bg-white border-slate-300 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  step.number
                )}
              </div>
             
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={`w-12 h-0.5 mx-1 flex-shrink-0 ${
                  isCompleted ? 'bg-slate-600' : 'bg-slate-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
