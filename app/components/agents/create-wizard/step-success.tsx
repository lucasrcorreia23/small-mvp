'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

function formatCommunicationStyle(slug: string): string {
  const map: Record<string, string> = {
    formal: 'Formal',
    casual: 'Casual',
    assertive: 'Assertivo',
    consultative: 'Consultivo',
    other: 'Outro',
  };
  return map[slug] || slug;
}

interface StepSuccessProps {
  agentId: number;
  trainingName: string;
  personaName: string;
  communicationStyle?: string;
  scenarioLabel?: string;
}

/** Confetti simplificado: menos peças, só animação de queda, sem shake infinito */
function ConfettiPiece({ index }: { index: number }) {
  const colors = ['#2E63CD', '#3A71DB', '#60A5FA', '#93C5FD'];
  const color = colors[index % colors.length];
  const left = 10 + (index * 12) % 80;
  const delay = (index * 0.15) % 2;
  const size = 8;

  return (
    <div
      className="absolute animate-confetti-fall-simple"
      style={{
        left: `${left}%`,
        animationDelay: `${delay}s`,
        width: size,
        height: size,
        backgroundColor: color,
        borderRadius: index % 2 === 0 ? '50%' : '2px',
      }}
    />
  );
}

/** Ícone de diamante em outline (estilo bonitinho) */
function DiamondOutlineIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 56 56"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M28 4L52 22L28 52L4 22L28 4Z" />
    </svg>
  );
}

export function StepSuccess({
  agentId,
  trainingName,
  personaName,
  communicationStyle = 'formal',
  scenarioLabel = '',
}: StepSuccessProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const styleLabel = formatCommunicationStyle(communicationStyle);
  const scenarioText = scenarioLabel ? `${scenarioLabel} · ${styleLabel}` : styleLabel;

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Confetti: contido e com menos peças para evitar bug */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <div className="relative z-20 text-center space-y-8 max-w-md mx-auto">
        {/* Ícone: diamante em outline (substitui o check verde) */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-[#2E63CD]/10 flex items-center justify-center border-2 border-[#2E63CD]/30">
            <DiamondOutlineIcon className="w-10 h-10 text-[#2E63CD]" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-slate-800">Roleplay criado com sucesso!</h2>
          <p className="text-slate-500">Seu treinamento esta pronto para ser praticado.</p>
        </div>

        {/* Card: nome principal, cenário com estilo de comunicação, avatar/rosto com comportamento */}
        <div className="card-surface p-5 text-left space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#2E63CD] flex items-center justify-center text-white font-semibold text-lg shrink-0">
              {personaName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-800 truncate">{trainingName}</h3>
              <p className="text-sm text-slate-500">Cenario: {scenarioText}</p>
              <p className="text-xs text-slate-400 mt-0.5">Estilo: {styleLabel}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">Persona: {personaName}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push(`/agents/${agentId}/details`)}
            className="btn-primary h-12 px-8 text-white font-medium transition-all duration-200 active:scale-[0.98]"
          >
            Praticar Agora
          </button>
          <button
            onClick={() => router.push('/agents')}
            className="btn-secondary h-12 px-8 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-all duration-200"
          >
            Voltar ao Inicio
          </button>
        </div>
      </div>
    </div>
  );
}
