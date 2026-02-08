'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AuthGuard, useLogout } from '@/app/components/auth-guard';
import { AgentList } from '@/app/components/agents/agent-list';
import { Agent } from '@/app/lib/types/sta';
import { listAgents } from '@/app/lib/sta-service';

function AgentsPageContent() {
  const searchParams = useSearchParams();
  const permissionsPending = searchParams.get('permissions_pending') === '1';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const logout = useLogout();

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const agentsList = await listAgents();
      setAgents(agentsList);
    } catch (err) {
      console.error('Erro ao carregar agentes:', err);
      const msg = err instanceof Error ? err.message : 'Erro ao carregar agentes';
      const isOrgAccessOrUnauthorized =
        typeof msg === 'string' &&
        ((msg.toLowerCase().includes('organization') &&
          (msg.toLowerCase().includes('does not have access') || msg.toLowerCase().includes('not have an organization assigned'))) ||
          msg.toLowerCase().includes('unauthorized') ||
          msg.toLowerCase().includes('não autorizado') ||
          (msg.includes('organização') && (msg.includes('não tem acesso') || msg.includes('sem acesso'))));
      const friendlyMessage = isOrgAccessOrUnauthorized
        ? permissionsPending
          ? 'Você acabou de criar sua conta. As permissões podem levar alguns minutos para ativar. Aguarde um minuto e atualize a página (F5), ou faça logout e login novamente.'
          : 'Sua conta ou organização ainda não tem acesso a este recurso. Se você acabou de criar sua empresa, faça logout e login novamente. Caso contrário, verifique com o suporte se sua organização tem permissão para acessar os agentes.'
        : msg;
      setError(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-3 bg-white/30 backdrop-blur-sm h-16 border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900 tracking-tight font-sans">
            Perfecting
          </span>
          <button
            onClick={logout}
            className="text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <AgentList agents={agents} isLoading={isLoading} error={error} />
        </div>
      </div>
    </main>
  );
}

export default function AgentsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <AgentsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
