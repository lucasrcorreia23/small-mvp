'use client';

import { ObjectionsSummary } from '@/app/lib/types/sta';

interface ObjectionsDetailProps {
  objections: ObjectionsSummary | null | undefined;
}

export function ObjectionsDetail({ objections }: ObjectionsDetailProps) {
  if (!objections) {
    return (
      <div className="card-surface p-6 text-center">
        <p className="text-slate-500">Objeções da chamada</p>
        <p className="text-slate-400 text-sm mt-2">Nenhuma objeção registrada para esta chamada.</p>
      </div>
    );
  }

  const { totalCount, treatmentRate, quality, treatedCount, untreatedCount, details } = objections;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">Objeções Identificadas</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{totalCount}</p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">Taxa de Tratamento</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{treatmentRate}%</p>
          <p className="text-xs text-slate-400 mt-1">
            {treatedCount} tratada{treatedCount !== 1 ? 's' : ''} · {untreatedCount} não tratada{untreatedCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="card-surface p-4">
          <p className="text-sm text-slate-500">Qualidade Geral</p>
          <p className="text-2xl font-semibold text-slate-800 mt-1">{quality}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-slate-800 mb-4">Objeções Detalhadas</h3>
        <div className="space-y-4">
          {details.map((d, i) => (
            <div key={i} className="card-surface p-5 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-700">
                  {d.type}
                </span>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    d.treated ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}
                >
                  {d.treated ? 'Tratada' : 'Não tratada'}
                </span>
                {d.techniqueUsed && (
                  <span className="text-xs text-slate-500">{d.techniqueUsed}</span>
                )}
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Objeção do cliente</p>
                <p className="text-sm text-slate-700 mt-0.5">{d.clientObjection}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Sua resposta</p>
                <p className="text-sm text-slate-700 mt-0.5">{d.yourResponse}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">Feedback da plataforma</p>
                <p className="text-sm text-slate-700 mt-0.5">{d.platformFeedback}</p>
              </div>
          
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
