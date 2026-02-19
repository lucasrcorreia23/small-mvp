'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { CaseSetupGenerateResponse } from '@/app/lib/types/sta';
import { getPersonaAvatarUrl } from '@/app/lib/persona-avatar';
import { formatCommunicationStyleById, DEFAULT_COMMUNICATION_STYLES } from '@/app/lib/data-objects-service';

function formatDifficulty(level: string): string {
  if (level === 'easy') return 'Fácil';
  if (level === 'medium') return 'Médio';
  if (level === 'hard') return 'Difícil';
  return level;
}

function getDifficultyStyles(level: string): { bg: string; text: string } {
  if (level === 'easy') return { bg: 'bg-emerald-50', text: 'text-emerald-700' };
  if (level === 'medium') return { bg: 'bg-amber-50', text: 'text-amber-700' };
  if (level === 'hard') return { bg: 'bg-red-50', text: 'text-red-700' };
  return { bg: 'bg-slate-100', text: 'text-slate-600' };
}

function cleanDescription(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\bsimula[cç][ãa]o\b/gi, '')
    .replace(/\bsimulacao\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Confetti simplificado */
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

interface StepSuccessProps {
  agentId: number;
  generatedData: CaseSetupGenerateResponse;
}

export function StepSuccess({ agentId, generatedData }: StepSuccessProps) {
  const router = useRouter();
  const [showConfetti, setShowConfetti] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  const persona = generatedData.persona_profile;
  const contextText = cleanDescription(generatedData.training_description);
  const difficultyStyles = getDifficultyStyles(generatedData.scenario_difficulty_level);
  const communicationStyleLabel = formatCommunicationStyleById(
    generatedData.persona_profile.communication_style_id,
    DEFAULT_COMMUNICATION_STYLES
  );

  return (
    <div className="relative min-h-[60vh] flex flex-col items-center justify-center overflow-hidden">
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <ConfettiPiece key={i} index={i} />
          ))}
        </div>
      )}

      <div className="relative z-20 w-full max-w-md mx-auto space-y-6">
        {/* Ícone de sucesso */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center ring-4 ring-emerald-50">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-10 h-10 text-emerald-600"
            >
              <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

        {/* Mensagem */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-semibold text-slate-800">Roleplay criado com sucesso!</h2>
          <p className="text-slate-500 text-sm">Seu treinamento está pronto para ser praticado.</p>
        </div>

        {/* Card: layout exato do AgentCard */}
        <div className="card-surface p-5 flex flex-col min-h-[220px]">
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
                <Image
                  src={getPersonaAvatarUrl(agentId, persona.name)}
                  alt={persona.name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-slate-800 truncate">
                  {persona.name}
                </h3>
                <p className="text-sm text-slate-500">{persona.job_title}</p>
                <div className="flex flex-nowrap items-center gap-1.5 mt-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${difficultyStyles.bg} ${difficultyStyles.text}`}>
                    {formatDifficulty(generatedData.scenario_difficulty_level)}
                  </span>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate min-w-0">
                    {communicationStyleLabel}
                  </span>
                </div>
              </div>
            </div>

            {contextText && (
              <div className="mt-3 flex-1 min-h-0">
                <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {contextText}
                </p>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 -mx-5 px-5">
              <button
                type="button"
                onClick={() => router.push(`/agents/${agentId}/details`)}
                className="w-full btn-primary h-10 text-white font-medium flex items-center justify-center"
              >
                Praticar
              </button>
            </div>
          </div>
        </div>

        {/* Ações: Voltar ao início (terciário) | Compartilhar (secundário) */}
        <div className="flex flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.push('/agents')}
            className="btn-tertiary text-sm font-medium"
          >
            Voltar ao início
          </button>
          <button
            type="button"
            onClick={async () => {
              const url = `${typeof window !== 'undefined' ? window.location.origin : ''}/agents/${agentId}/details`;
              await navigator.clipboard.writeText(url);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="btn-secondary h-10 px-6 text-slate-700 font-medium transition-all duration-200 active:scale-[0.98]"
          >
            {copied ? 'Copiado!' : 'Compartilhar'}
          </button>
        </div>
      </div>
    </div>
  );
}
