'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthGuard } from '@/app/components/auth-guard';
import { LoadingView } from '@/app/components/loading-view';
import { SpinMetricsDisplay } from '@/app/components/results/spin-metrics';
import { CallResult, Agent } from '@/app/lib/types/sta';
import { getAgent, getCallResult } from '@/app/lib/sta-service';

function getPersonaImageUrl(agent: Agent): string {
  return `https://i.pravatar.cc/256?u=${agent.id}-${encodeURIComponent(agent.persona_name)}`;
}

function ResultsPageContent() {
  const params = useParams();
  const router = useRouter();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [callResult, setCallResult] = useState<CallResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agentId) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [agentData, resultData] = await Promise.all([
          getAgent(agentId),
          getCallResult(agentId),
        ]);
        setAgent(agentData);
        setCallResult(resultData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [agentId]);

  const handleShare = async () => {
    if (!callResult) return;
    const shareData = {
      title: 'Meu resultado de treinamento SPIN',
      text: `Alcancei ${callResult.spin_metrics.overallScore}% no treinamento de vendas SPIN Selling!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.text}\n${shareData.url}`);
        alert('Link copiado para a area de transferencia!');
      }
    } catch (err) {
      console.log('Erro ao compartilhar:', err);
    }
  };

  const handleBack = () => {
    router.push('/agents');
  };

  const handleTryAgain = () => {
    router.push('/agents');
  };

  if (isLoading) {
    return <LoadingView message="Carregando resultados..." />;
  }

  return (
    <main className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-3 py-5 bg-white/30 backdrop-blur-sm border-b border-white/20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <span className="text-lg font-semibold text-slate-900 tracking-tight font-sans">
            Perfecting
          </span>
          <button
            onClick={handleBack}
            className="text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
          >
            Voltar
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-xl mx-auto">
          {/* Box único: dados do agente + pontuação + análise SPIN */}
          <div className="card-surface p-8">
            {/* Dados do agente: avatar à esquerda, título e cargo à direita */}
            {agent && (
              <div className="flex flex-col justify-center mx-auto items-center gap-4 mb-8 max-w-sm pb-6 border-b border-slate-200">
                <div className="flex justify-center items-center gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 ring-2 ring-slate-200">
                    <Image
                      src={getPersonaImageUrl(agent)}
                      alt={agent.persona_name}
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 max-w-xs">
                    <h1 className="text-xl font-semibold text-slate-800">
                      {agent.persona_name}
                    </h1>
                    <p className="text-slate-500 text-sm">{agent.persona_job_title}</p>
                    
                  </div>
                </div>
                  <p className="text-sm text-center text-slate-600 mt-2">
                      {agent.training_description}
                  </p>
              </div>
            )}

            {error ? (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
                {error}
              </div>
            ) : callResult ? (
              <SpinMetricsDisplay metrics={callResult.spin_metrics} />
            ) : null}

            {/* Actions: Compartilhar (primário), Praticar (secundário), Voltar */}
            <div className="mt-8 pt-6 border-t border-slate-200 space-y-3">
              <button
                onClick={handleShare}
                className="btn-primary w-full h-12 px-6 text-white font-medium transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z" clipRule="evenodd" />
                </svg>
                Compartilhar Resultado
              </button>

              <button
                onClick={handleTryAgain}
                className="btn-secondary w-full h-12 px-6 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.755 10.059a7.5 7.5 0 0112.548-3.364l1.903 1.903h-3.183a.75.75 0 100 1.5h4.992a.75.75 0 00.75-.75V4.356a.75.75 0 00-1.5 0v3.18l-1.9-1.9A9 9 0 003.306 9.67a.75.75 0 101.45.388zm15.408 3.352a.75.75 0 00-.919.53 7.5 7.5 0 01-12.548 3.364l-1.902-1.903h3.183a.75.75 0 000-1.5H2.984a.75.75 0 00-.75.75v4.992a.75.75 0 001.5 0v-3.18l1.9 1.9a9 9 0 0015.059-4.035.75.75 0 00-.53-.918z" clipRule="evenodd" />
                </svg>
                Praticar Novamente
              </button>

              <button
                onClick={handleBack}
                className="w-full text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors py-2"
              >
                Voltar para Seleção de Agentes
              </button>
            </div>
          </div>
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
