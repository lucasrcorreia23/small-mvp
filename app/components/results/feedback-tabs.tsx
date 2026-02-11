'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CallResult, Agent, RoleplayDetail, RubricResult } from '@/app/lib/types/sta';
import { RubricChecklist } from './rubric-checklist';
import { SpinMetricsDisplay } from './spin-metrics';

function formatCommunicationStyle(slug: string): string {
  const map: Record<string, string> = {
    formal: 'Formal',
    casual: 'Casual',
    assertive: 'Assertivo',
    consultative: 'Consultivo',
    other: 'Outro',
  };
  return map[slug] || slug;
}

function formatResultDate(createdAt: string): string {
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

type TabId = 'feedback' | 'analytics' | 'ranking' | 'objections';

interface FeedbackTabsProps {
  agent: Agent;
  callResult: CallResult;
  roleplayDetail: RoleplayDetail | null;
  userName: string | null;
  onVoltarAoInicio: () => void;
  onTentarNovamente: () => void;
}

export function FeedbackTabs({
  agent,
  callResult,
  roleplayDetail,
  userName,
  onVoltarAoInicio,
  onTentarNovamente,
}: FeedbackTabsProps) {
  const [activeTab, setActiveTab] = useState<TabId>('feedback');

  const communicationStyle = roleplayDetail?.persona_profile?.communication_style_slug
    ? formatCommunicationStyle(roleplayDetail.persona_profile.communication_style_slug)
    : '—';
  const rubricResults: RubricResult[] =
    callResult.rubric_results?.length
      ? callResult.rubric_results
      : (roleplayDetail?.salesperson_success_criteria?.map((c) => ({
          criterion: c,
          met: false,
        })) ?? []);

  const tabs: { id: TabId; label: string }[] = [
    { id: 'feedback', label: 'Feedback' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'ranking', label: 'Ranking' },
    { id: 'objections', label: 'Objeções' },
  ];

  const score = callResult.spin_metrics.overallScore;
  const scoreColorClass =
    score < 40 ? 'text-red-600' : score <= 70 ? 'text-amber-600' : 'text-emerald-600';

  return (
    <div className="flex flex-col bg-white">
      {/* Header: info + CTAs na mesma linha */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          {userName && <span>Rep: {userName}</span>}
          <span>|</span>
          <span>Persona: {agent.persona_name}</span>
          <span>|</span>
          <span>Estilo: {communicationStyle}</span>
          <span>|</span>
          <span>{formatResultDate(callResult.created_at)}</span>
          <span>|</span>
          <span className="font-semibold text-slate-800">
            Score {score}/100
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onVoltarAoInicio}
            className="btn-secondary h-9 px-4 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
          >
            Voltar ao Início
          </button>
          <button
            type="button"
            onClick={onTentarNovamente}
            className="btn-primary h-9 px-4 text-sm text-white font-medium"
          >
            Tentar Novamente
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 mt-2 flex-shrink-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-[#2E63CD] text-[#2E63CD]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto pt-6">
        {activeTab === 'feedback' && (
          <div className="space-y-6">
            {/* Score + descrição na horizontal */}
            <div className="flex flex-wrap items-center gap-6 p-6 bg-slate-50 rounded-sm border border-slate-200/80">
              <div className={`text-4xl font-bold ${scoreColorClass}`}>
                {score}
              </div>
              {callResult.spin_metrics.feedback && (
                <p className="text-sm text-slate-700 flex-1 min-w-[200px]">
                  {callResult.spin_metrics.feedback}
                </p>
              )}
            </div>
            <RubricChecklist items={rubricResults} />
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Métricas da chamada</h3>
            <SpinMetricsDisplay metrics={callResult.spin_metrics} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
              <div className="card-surface p-4">
                <p className="text-sm text-slate-500">Tempo de fala vs escuta</p>
                <p className="text-2xl font-semibold text-slate-700 mt-1">—</p>
                <p className="text-xs text-slate-400 mt-1">Em breve</p>
              </div>
              <div className="card-surface p-4">
                <p className="text-sm text-slate-500">Análise de sentimento</p>
                <p className="text-2xl font-semibold text-slate-700 mt-1">—</p>
                <p className="text-xs text-slate-400 mt-1">Em breve</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ranking' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Ranking</h3>
            <div className="card-surface p-6 text-center">
              <p className="text-slate-500">Comparação com outros usuários</p>
              <p className="text-slate-400 text-sm mt-2">Em breve</p>
            </div>
          </div>
        )}

        {activeTab === 'objections' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-800">Objeções</h3>
            {callResult.spin_metrics.detailedFeedback?.improvements?.length ? (
              <ul className="space-y-2">
                {callResult.spin_metrics.detailedFeedback.improvements.map((item, i) => (
                  <li key={i} className="bg-slate-50 border border-slate-200/80 rounded-sm p-3 text-sm text-slate-700">
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="card-surface p-6 text-center">
                <p className="text-slate-500">Lista de objeções encontradas na chamada</p>
                <p className="text-slate-400 text-sm mt-2">Nenhuma objeção registrada para esta chamada.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
