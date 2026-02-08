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
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => {
        const isActive = step.key === currentStep;
        const isCompleted = index < currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.key} className="flex items-center">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  isActive
                    ? 'bg-[#2E63CD] border-[#2E63CD] text-white'
                    : isCompleted
                    ? 'bg-[#2E63CD] border-[#2E63CD] text-white'
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
              <span
                className={`mt-2 text-xs font-medium ${
                  isActive
                    ? 'text-[#2E63CD]'
                    : isCompleted
                    ? 'text-[#2E63CD]'
                    : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>

            {/* Connector Line */}
            {!isLast && (
              <div
                className={`w-16 h-0.5 mx-2 ${
                  isCompleted ? 'bg-[#2E63CD]' : 'bg-slate-300'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
