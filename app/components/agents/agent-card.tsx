'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/app/lib/types/sta';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getPersonaAvatarUrl } from '@/app/lib/persona-avatar';
import {
  DEFAULT_COMMUNICATION_STYLES,
  formatCommunicationStyleById,
  listCommunicationStyles,
  type SimpleDataObjectItem,
} from '@/app/lib/data-objects-service';
import { CardActionsMenu } from './card-actions-menu';

interface AgentCardProps {
  agent: Agent;
  onEdit?: () => void;
  onDelete?: () => void;
}

/** Remove "simulação" e formata o contexto da persona para exibição no card */
function cleanDescription(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/\bsimula[cç][ãa]o\b/gi, '')
    .replace(/\bsimulacao\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

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

export function AgentCard({ agent, onEdit, onDelete }: AgentCardProps) {
  const router = useRouter();
  const [communicationStyles, setCommunicationStyles] = useState<SimpleDataObjectItem[]>(DEFAULT_COMMUNICATION_STYLES);
  const contextText = cleanDescription(agent.training_description);
  const difficultyStyles = getDifficultyStyles(agent.scenario_difficulty_level);
  const communicationStyleLabel = formatCommunicationStyleById(
    agent.communication_style_id,
    communicationStyles
  );

  useEffect(() => {
    let active = true;
    listCommunicationStyles().then((styles) => {
      if (active) setCommunicationStyles(styles);
    });
    return () => {
      active = false;
    };
  }, []);

  // Sempre prioriza o nome real da persona para manter consistência com o cargo.
  const displayName = agent.persona_name?.trim() || 'Persona';

  const handleClick = () => {
    router.push(`/agents/${agent.id}/details`);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      className="w-full text-left card-surface p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 hover:brightness-[1.02] transition-all relative flex flex-col min-h-[220px]"
    >
      {/* Menu de ações */}
      <div className="absolute top-3 right-3">
        <CardActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Foto + nome (título) + cargo */}
        <div className="flex items-start gap-3 pr-12">
          <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
            <Image
              src={getPersonaAvatarUrl(agent.id, displayName)}
              alt={displayName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              unoptimized
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-slate-800 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-slate-500">{agent.persona_job_title}</p>
            {/* Dificuldade + Cenário (sempre horizontal) */}
            <div className="flex flex-nowrap items-center gap-1.5 mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded shrink-0 ${difficultyStyles.bg} ${difficultyStyles.text}`}>
                {formatDifficulty(agent.scenario_difficulty_level)}
              </span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded truncate min-w-0">
                {communicationStyleLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Contexto da persona */}
        <div className="mt-3 flex-1 min-h-0">
          {contextText && (
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {contextText}
            </p>
          )}
        </div>

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 -mx-5 px-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
            className="w-full btn-primary h-10 text-white font-medium flex items-center justify-center"
          >
            Praticar
          </button>
        </div>
      </div>
    </div>
  );
}
