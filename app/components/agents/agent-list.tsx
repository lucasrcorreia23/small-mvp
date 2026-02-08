'use client';

import { LoadingView } from '@/app/components/loading-view';
import { Agent } from '@/app/lib/types/sta';
import { AgentCard } from './agent-card';
import { useRouter } from 'next/navigation';

interface AgentListProps {
  agents: Agent[];
  isLoading: boolean;
  error: string | null;
}

export function AgentList({ agents, isLoading, error }: AgentListProps) {
  const router = useRouter();

  const handleCreateAgent = () => {
    router.push('/agents/create');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingView message="Carregando agentes..." fullPage={false} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-none p-4">
        {error}
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-none p-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-8 h-8 text-slate-400"
            >
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Nenhum agente encontrado
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Crie seu primeiro agente de treinamento para comecar a praticar vendas
            </p>
          </div>
          <button
            onClick={handleCreateAgent}
            className="h-10 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
                clipRule="evenodd"
              />
            </svg>
            Criar Agente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">
            Agentes de treinamento
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Pratique suas habilidades de vendas com agentes de IA personalizados
          </p>
        </div>
        <button
          onClick={handleCreateAgent}
          className="h-10 px-4 bg-[#2E63CD] hover:bg-[#3A71DB] text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98] flex items-center gap-2 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path
              fillRule="evenodd"
              d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
          </svg>
          Criar Agente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}
