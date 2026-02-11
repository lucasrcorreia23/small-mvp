'use client';

import { LoadingView } from '@/app/components/loading-view';
import { Agent } from '@/app/lib/types/sta';
import { AgentCard } from './agent-card';
import { CreateRoleplayCard } from './create-roleplay-card';

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
}

export function AgentList({ agents, isLoading, error }: AgentListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Carregando roleplays..." fullPage={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
        {error}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Meus Roleplays
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Crie seu primeiro roleplay de treinamento para comecar a praticar vendas
          </p>
        </div>
        <div className="flex justify-center py-8">
          <div className="w-full max-w-sm">
            <CreateRoleplayCard hasOtherAgents={false} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Meus Roleplays
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Pratique suas habilidades de vendas com cenarios de IA personalizados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
        <CreateRoleplayCard hasOtherAgents={agents.length > 0} />
      </div>
    </div>
  );
}
