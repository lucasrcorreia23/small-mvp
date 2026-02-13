'use client';

import { SpinMetrics } from '@/app/lib/types/sta';

interface KpiItem {
  key: keyof SpinMetrics;
  label: string;
  value: number | undefined;
  unit: string;
  ideal: string;
  idealRange?: [number, number]; // min, max for "in range"
  recommended: string;
}

function formatDate(d: string): string {
  try {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch {
    return d;
  }
}

function KpiCard({
  label,
  value,
  unit,
  ideal,
  recommended,
  idealRange,
}: {
  label: string;
  value: number | undefined;
  unit: string;
  ideal: string;
  recommended: string;
  idealRange?: [number, number];
}) {
  const status = idealRange && value != null
    ? value >= idealRange[0] && value <= idealRange[1]
      ? 'ok'
      : 'attention'
    : 'neutral';
  const statusLabel = status === 'ok' ? 'Dentro do ideal' : status === 'attention' ? 'Atenção' : '—';

  return (
    <div className="p-4 border border-slate-200/80 rounded-sm bg-slate-50/50">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-800 mt-1">
        {value != null ? `${value}${unit}` : '—'}
      </p>
      <p
        className={`text-xs font-medium mt-2 ${
          status === 'ok' ? 'text-emerald-600' : status === 'attention' ? 'text-amber-600' : 'text-slate-500'
        }`}
      >
        {statusLabel}
      </p>
      <p className="text-xs text-slate-400 mt-1">Ideal: {ideal}</p>
      <p className="text-xs text-slate-400">Recomendado: {recommended}</p>
    </div>
  );
}

export function AnalyticsDashboard({ metrics }: { metrics: SpinMetrics }) {
  const kpis: KpiItem[] = [
    {
      key: 'talkListenRatio',
      label: 'Talk/Listen Ratio',
      value: metrics.talkListenRatio,
      unit: '%',
      ideal: '50–60%',
      idealRange: [50, 60],
      recommended: 'Equilibrar tempo de fala e escuta',
    },
    {
      key: 'fillerWords',
      label: 'Filler Words',
      value: metrics.fillerWords,
      unit: ' wpm',
      ideal: '< 5 wpm',
      idealRange: [0, 5],
      recommended: 'Reduzir "uh", "é", "hum"',
    },
    {
      key: 'talkSpeed',
      label: 'Talk Speed',
      value: metrics.talkSpeed,
      unit: ' wpm',
      ideal: '120–150 wpm',
      idealRange: [120, 150],
      recommended: 'Ritmo moderado e claro',
    },
    {
      key: 'longestMonologue',
      label: 'Longest Monologue',
      value: metrics.longestMonologue,
      unit: 's',
      ideal: '< 30s',
      idealRange: [0, 30],
      recommended: 'Segmentos curtos, mais perguntas',
    },
  ];

  const history = metrics.callHistory ?? [];
  const maxScore = history.length ? Math.max(...history.map((h) => h.score), 100) : 100;
  const minScore = history.length ? Math.min(...history.map((h) => h.score), 0) : 0;
  const range = Math.max(maxScore - minScore, 1);
  const step = history.length > 1 ? history.length - 1 : 1;

  return (
    <div className="card-surface p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <KpiCard
            key={k.key}
            label={k.label}
            value={k.value}
            unit={k.unit}
            ideal={k.ideal}
            recommended={k.recommended}
            idealRange={k.idealRange}
          />
        ))}
      </div>

      {history.length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-200/80">
          <h3 className="text-base font-semibold text-slate-800 mb-4">Suas últimas 4 chamadas</h3>
          <div className="h-40 w-full max-w-md mx-auto" style={{ aspectRatio: '400/120' }}>
            <svg viewBox="0 0 400 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
              <polyline
                fill="none"
                stroke="#2E63CD"
                strokeWidth="2"
                points={history
                  .map((item, i) => {
                    const x = (i / step) * 380 + 10;
                    const y = 110 - ((item.score - minScore) / range) * 90;
                    return `${x},${y}`;
                  })
                  .join(' ')}
              />
              {history.map((item, i) => {
                const x = (i / step) * 380 + 10;
                const y = 110 - ((item.score - minScore) / range) * 90;
                return (
                  <circle key={i} cx={x} cy={y} r="4" fill="#2E63CD" />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-xs text-slate-500 max-w-md mx-auto">
            {history.map((item, i) => (
              <span key={i}>{formatDate(item.date)} ({item.score})</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
