'use client';

import { AuthGuard, useLogout } from '@/app/components/auth-guard';
import { DiamondBackground } from '@/app/components/diamond-background';
import { WizardContainer } from '@/app/components/agents/create-wizard/wizard-container';

function CreateAgentPageContent() {
  const logout = useLogout();

  return (
    <main className="min-h-screen relative">
      <DiamondBackground />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-20 px-6 py-5 bg-white/30 backdrop-blur-sm border-b border-white/20">
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
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold text-slate-800 mb-2">
              Criar Novo Agente
            </h1>
            <p className="text-slate-500">
              Configure seu agente de treinamento em 3 etapas simples
            </p>
          </div>

          <WizardContainer />
        </div>
      </div>
    </main>
  );
}

export default function CreateAgentPage() {
  return (
    <AuthGuard>
      <CreateAgentPageContent />
    </AuthGuard>
  );
}
