'use client';

import { useRouter } from 'next/navigation';
import { CallResult } from '@/app/lib/types/sta';

function formatDate(createdAt: string): string {
  try {
    const d = new Date(createdAt);
    return d.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return createdAt;
  }
}

function getBehaviorLabel(score: number): string {
  if (score >= 70) return 'Bom';
  if (score >= 40) return 'Regular';
  return 'Atenção';
}

function getBehaviorColor(score: number): string {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700';
  if (score >= 40) return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

interface SessionsListProps {
  agentId: number;
  sessions: CallResult[];
}

export function SessionsList({ agentId, sessions }: SessionsListProps) {
  const router = useRouter();

  if (!sessions.length) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-slate-500">Sessões do treinamento</p>
        <p className="text-slate-400 text-sm mt-2">Nenhuma sessão encontrada.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        const score = session.spin_metrics.overallScore;
        const name = session.user_name ?? `Sessão ${session.id}`;
        const behavior = getBehaviorLabel(score);
        const behaviorColor = getBehaviorColor(score);

        return (
          <button
            key={session.id}
            type="button"
            onClick={() => router.push(`/agents/${agentId}/results?session=${session.id}`)}
            className="card-surface p-5 text-left hover:border-[#2E63CD]/50 transition-colors"
          >
            <p className="text-xs text-slate-500">{formatDate(session.created_at)}</p>
            <p className="font-medium text-slate-800 mt-1">{name}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${behaviorColor}`}>
                {behavior}
              </span>
              <span className="text-sm font-semibold text-slate-700">{score}/100</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
