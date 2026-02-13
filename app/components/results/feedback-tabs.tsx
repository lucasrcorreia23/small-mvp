'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CallResult, Agent, RoleplayDetail, RubricResult } from '@/app/lib/types/sta';
import { RubricChecklist } from './rubric-checklist';
import { AnalyticsDashboard } from './analytics-dashboard';
import { ObjectionsDetail } from './objections-detail';
import { SessionsList } from './sessions-list';

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
  sessions: CallResult[];
  onVoltarAoInicio: () => void;
  onTentarNovamente: () => void;
}

export function FeedbackTabs({
  agent,
  callResult,
  roleplayDetail,
  userName,
  sessions,
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
    { id: 'analytics', label: 'Métricas' },
    { id: 'ranking', label: 'Sessões' },
    { id: 'objections', label: 'Objeções' },
  ];

  const score = callResult.spin_metrics.overallScore;
  const scoreColorClass =
    score < 40 ? 'text-red-600' : score <= 70 ? 'text-amber-600' : 'text-emerald-600';

  return (
    <>
      {/* Header: fora do container (info + CTAs) */}
      <div className="flex-shrink-0 flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          {userName && (
            <span className="flex items-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
                <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
              </svg>
              Rep: {userName}
            </span>
          )}
         
          <span className="ml-2 flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
              <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
            </svg>
            Persona: {agent.persona_name}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
              <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 003 3.5v13A1.5 1.5 0 004.5 18h11a1.5 1.5 0 001.5-1.5V7.621a1.5 1.5 0 00-.44-1.06l-4.12-4.122A1.5 1.5 0 0011.378 2H4.5zM10 8a.75.75 0 01.75.75v1.5h1.5a.75.75 0 010 1.5h-1.5v1.5a.75.75 0 01-1.5 0v-1.5h-1.5a.75.75 0 010-1.5h1.5v-1.5A.75.75 0 0110 8z" clipRule="evenodd" />
            </svg>
            Estilo: {communicationStyle}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-slate-400">
              <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
            </svg>
            {formatResultDate(callResult.created_at)}
          </span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1.5 font-semibold text-slate-800">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
            </svg>
            Pontuação {score}/100
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

      {/* Container: tabs + conteúdo */}
      <div className="card-surface px-6 pb-6 pt-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] flex flex-col">
      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200 flex-shrink-0">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Esquerda: score + feedback */}
            <div className="card-surface p-16 flex flex-col gap-4 justify-center
            items-center mx-auto
            text-center">
              <div className={`text-7xl font-bold ${scoreColorClass}`}>{score}</div>
              {callResult.spin_metrics.feedback && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {callResult.spin_metrics.feedback}
                </p>
              )}
            </div>
            {/* Direita: critérios */}
            <div>
              <RubricChecklist items={rubricResults} />
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsDashboard metrics={callResult.spin_metrics} />
        )}

        {activeTab === 'ranking' && (
          <SessionsList agentId={agent.id} sessions={sessions} />
        )}

        {activeTab === 'objections' && (
          <ObjectionsDetail objections={callResult.objections} />
        )}
      </div>
      </div>
    </>
  );
}
