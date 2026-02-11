'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';
import { LoadingView } from '@/app/components/loading-view';
import { FeedbackTabs } from '@/app/components/results/feedback-tabs';
import { CallResult, Agent, RoleplayDetail } from '@/app/lib/types/sta';
import { getAgent, getCallResult, getRoleplayDetail } from '@/app/lib/sta-service';
import { getCurrentUserName } from '@/app/lib/auth-service';

function ResultsPageContent() {
  const params = useParams();
  const router = useRouter();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [roleplayDetail, setRoleplayDetail] = useState<RoleplayDetail | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [agentData, resultData, roleplayData] = await Promise.all([
          getAgent(agentId),
          getCallResult(agentId),
          getRoleplayDetail(agentId),
        ]);
        setAgent(agentData);
        setCallResult(resultData);
        setRoleplayDetail(roleplayData);
        setUserName(getCurrentUserName());
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  const handleVoltarAoInicio = () => router.push('/agents');
  const handleTentarNovamente = () => router.push(`/agents/${agentId}/call`);

  if (isLoading) {
    return <LoadingView message="Carregando resultados..." />;
  }

  if (error || !agent || !callResult) {
    return (
      <main className="min-h-screen relative">
        <AppHeader />
        <div className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
              {error || 'Dados nao encontrados'}
            </div>
            <button
              onClick={handleVoltarAoInicio}
              className="mt-4 btn-secondary h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Voltar ao Início
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative flex flex-col">
      <AppHeader />

      <div className="relative z-10 pt-24 pb-12 px-6 flex justify-center bg-white">
        <div className="w-full max-w-6xl mx-auto bg-white">
          <FeedbackTabs
            agent={agent}
            callResult={callResult}
            roleplayDetail={roleplayDetail}
            userName={userName}
            onVoltarAoInicio={handleVoltarAoInicio}
            onTentarNovamente={handleTentarNovamente}
          />
        </div>
      </div>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <AuthGuard>
      <ResultsPageContent />
    </AuthGuard>
  );
}
