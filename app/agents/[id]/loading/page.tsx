'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';

const PHRASES = [
  'Analisando sua conversa...',
  'Gerando métricas de desempenho...',
  'Processando feedback...',
];

function LoadingPageContent() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id as string;
  const [phraseIndex, setPhraseIndex] = useState(0);

  const handleTentarNovamente = () => router.push(`/agents/${agentId}/call`);
  const handleVoltarAoInicio = () => router.push('/agents');

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setPhraseIndex((i) => (i + 1) % PHRASES.length);
    }, 2000);
    return () => clearInterval(phraseInterval);
  }, []);

  useEffect(() => {
    router.push(`/agents/${agentId}/results`);
  }, [agentId, router]);

  return (
    <main className="min-h-screen relative">
      <AppHeader />
      <div className="relative z-10 pt-24 min-h-screen flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-8 max-w-sm w-full">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-2 border-[#2E63CD] border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-600 text-sm font-medium text-center min-h-[20px]">
              {PHRASES[phraseIndex]}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              type="button"
              onClick={handleTentarNovamente}
              className="btn-primary flex-1 h-11 px-6 text-white font-medium flex items-center justify-center gap-2"
            >
              Tentar novamente
            </button>
            <button
              type="button"
              onClick={handleVoltarAoInicio}
              className="btn-secondary flex-1 h-11 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium flex items-center justify-center gap-2"
            >
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoadingPage() {
  return (
    <AuthGuard>
      <LoadingPageContent />
    </AuthGuard>
  );
}
