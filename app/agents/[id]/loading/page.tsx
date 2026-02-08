'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/app/components/auth-guard';
import { LoadingView } from '@/app/components/loading-view';

function LoadingPageContent() {
  const params = useParams();
  const router = useRouter();
  const agentId = params.id;

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(`/agents/${agentId}/results`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [agentId, router]);

  return (
    <LoadingView message="Analisando sua conversa e gerando métricas de desempenho...">
      <div className="flex items-center justify-center gap-2 mt-2">
        <div className="w-2 h-2 bg-[#2E63CD] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-[#2E63CD] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-[#2E63CD] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </LoadingView>
  );
}

export default function LoadingPage() {
  return (
    <AuthGuard>
      <LoadingPageContent />
    </AuthGuard>
  );
}
