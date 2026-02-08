'use client';

import { useState, useEffect } from 'react';
import { Agent } from '@/app/lib/types/sta';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getAgentDisplayMeta, AgentDisplayMeta } from '@/app/lib/agent-display-meta';

interface AgentCardProps {
  agent: Agent;
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

/** URL de avatar real (pessoa) - deterministico por agente para consistência */
function getPersonaImageUrl(agent: Agent): string {
  return `https://i.pravatar.cc/256?u=${agent.id}-${encodeURIComponent(agent.persona_name)}`;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function AgentCard({ agent }: AgentCardProps) {
  const router = useRouter();
  const [meta, setMeta] = useState<AgentDisplayMeta | null>(null);
  const contextText = cleanDescription(agent.training_description);

  useEffect(() => {
    setMeta(getAgentDisplayMeta(agent.id));
  }, [agent.id]);

  const displayName = meta?.displayName?.trim() || agent.persona_name;
  const showAvatarUpload = meta?.avatarType === 'upload' && meta?.avatarData;
  const showAvatarInitials = meta?.avatarType === 'initials' || (meta && !showAvatarUpload);

  const handleClick = () => {
    router.push(`/agents/${agent.id}/call`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left card-surface p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 relative hover:brightness-[1.02] transition-all"
    >
      {/* Nível no topo superior direito do card */}
      <span className="absolute top-4 right-4 text-xs text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded">
        {formatDifficulty(agent.scenario_difficulty_level)}
      </span>

      <div className="flex flex-col gap-4">
        {/* Foto + nome (título) + cargo */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-slate-200">
            {showAvatarUpload ? (
              <img
                src={meta!.avatarData}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            ) : showAvatarInitials ? (
              <div className="w-full h-full flex items-center justify-center bg-[#2E63CD] text-white font-semibold text-lg">
                {getInitials(displayName)}
              </div>
            ) : (
              <Image
                src={getPersonaImageUrl(agent)}
                alt={displayName}
                width={56}
                height={56}
                className="w-full h-full object-cover"
                unoptimized
              />
            )}
          </div>
          <div className="flex-1 min-w-0 pr-12">
            <h3 className="text-lg font-semibold text-slate-800 truncate">
              {displayName}
            </h3>
            <p className="text-sm text-slate-500">{agent.persona_job_title}</p>
          </div>
        </div>

        {/* Contexto da persona: texto melhorado */}
        {contextText && (
          <div className="space-y-1">
            <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed">
              {contextText}
            </p>
          </div>
        )}

     
      </div>
    </button>
  );
}
