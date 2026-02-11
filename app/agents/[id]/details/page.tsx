'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AuthGuard } from '@/app/components/auth-guard';
import { AppHeader } from '@/app/components/app-header';
import { LoadingView } from '@/app/components/loading-view';
import { RoleplayDetail } from '@/app/lib/types/sta';
import { getRoleplayDetail } from '@/app/lib/sta-service';

function formatDifficulty(level: string): string {
  if (level === 'easy') return 'Facil';
  if (level === 'medium') return 'Medio';
  if (level === 'hard') return 'Dificil';
  return level;
}

function getCallContextLabel(slug: string): string {
  const map: Record<string, string> = {
    cold_call: 'Cold Call',
    warm_outreach: 'Abordagem Morna',
    qualification_discovery: 'Qualificacao / Discovery',
    needs_analysis: 'Analise de Necessidades',
    presentation_demo: 'Apresentacao / Demo',
    proposal_review: 'Revisao de Proposta',
    negotiation: 'Negociacao',
    objection_handling: 'Tratamento de Objecoes',
    closing: 'Fechamento',
    follow_up: 'Follow Up',
  };
  return map[slug] || slug;
}

function DetailsPageContent() {
  const params = useParams();
  const router = useRouter();
  const [roleplay, setRoleplay] = useState<RoleplayDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const id = Number(params.id);

  useEffect(() => {
    if (!id || Number.isNaN(id)) {
      setError('ID invalido');
      setIsLoading(false);
      return;
    }
    loadRoleplay(id);
  }, [id]);

  const loadRoleplay = async (roleplayId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getRoleplayDetail(roleplayId);
      setRoleplay(data);
    } catch (err) {
      console.error('Erro ao carregar roleplay:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar roleplay');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen relative">
        <AppHeader />
        <div className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <LoadingView message="Carregando roleplay..." fullPage={false} />
          </div>
        </div>
      </main>
    );
  }

  if (error || !roleplay) {
    return (
      <main className="min-h-screen relative">
        <AppHeader />
        <div className="relative z-10 pt-24 pb-12 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-4">
              {error || 'Roleplay nao encontrado'}
            </div>
            <button
              onClick={() => router.push('/agents')}
              className="mt-4 btn-secondary h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
            >
              Voltar
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <AppHeader />

      <div className="relative z-10 pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => router.push('/agents')}
            className="mb-6 text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
            </svg>
            Voltar aos Roleplays
          </button>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Column (60%) */}
            <div className="w-full lg:w-[60%] space-y-6">
              <div className="card-surface p-8">
                <h1 className="text-2xl font-semibold text-slate-800 mb-2">
                  {roleplay.training_name}
                </h1>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  {roleplay.training_description}
                </p>
                {roleplay.training_objective && (
                  <p className="text-slate-600 text-sm mb-6">
                    <span className="font-medium">Objetivo:</span> {roleplay.training_objective}
                  </p>
                )}
                <button
                  onClick={() => router.push(`/agents/${roleplay.id}/call?auto_start=1`)}
                  className="btn-primary h-14 px-10 text-white font-medium text-lg transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                    <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                  </svg>
                  Iniciar Chamada
                </button>
              </div>
            </div>

            {/* Right Column (40%) */}
            <div className="w-full lg:w-[40%] space-y-4">
              {/* Persona */}
              <div className="card-surface p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Persona</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2E63CD] flex items-center justify-center text-white font-semibold text-sm shrink-0">
                    {roleplay.persona_profile.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800">{roleplay.persona_profile.name}</div>
                    <div className="text-sm text-slate-500">{roleplay.persona_profile.job_title}</div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  <span className="text-slate-500">Empresa:</span> {roleplay.company_profile.name}
                </div>
              </div>

              {/* Context */}
              <div className="card-surface p-5 space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Contexto</h3>
                <div className="text-sm text-slate-600">
                  <span className="text-slate-500">Tipo:</span> {getCallContextLabel(roleplay.call_context_type_slug)}
                </div>
                <div className="text-sm text-slate-600">
                  <span className="text-slate-500">Dificuldade:</span> {formatDifficulty(roleplay.scenario_difficulty_level)}
                </div>
              </div>

              {/* Criteria */}
              {roleplay.salesperson_success_criteria.length > 0 && (
                <div className="card-surface p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Criterios de Avaliacao</h3>
                  <ul className="space-y-1">
                    {roleplay.salesperson_success_criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="text-[#2E63CD] mt-0.5">&#x2713;</span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Skills */}
              {roleplay.training_targeted_sales_skills.length > 0 && (
                <div className="card-surface p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Habilidades</h3>
                  <div className="flex flex-wrap gap-2">
                    {roleplay.training_targeted_sales_skills.map((skill, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs bg-[#2E63CD]/10 text-[#2E63CD] border border-[#2E63CD]/20 rounded-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function DetailsPage() {
  return (
    <AuthGuard>
      <Suspense fallback={null}>
        <DetailsPageContent />
      </Suspense>
    </AuthGuard>
  );
}
