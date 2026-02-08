'use client';

import { SpinMetrics, TranscriptHighlight } from '@/app/lib/types/sta';

interface SpinMetricsDisplayProps {
  metrics: SpinMetrics;
}

interface MetricBarProps {
  label: string;
  fullLabel: string;
  value: number;
  barColor: string;
  barBg?: string;
  labelBg: string;
  labelText: string;
}

const BAR_BG_UNFILLED = 'bg-slate-100';

function MetricBar({ label, fullLabel, value, barColor, labelBg, labelText }: Omit<MetricBarProps, 'barBg'>) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
      
          <span className="text-sm font-medium text-slate-700">{fullLabel}</span>
        </div>
        <span className="text-sm font-semibold text-slate-800">{value}%</span>
      </div>
      <div className={`h-3 rounded-none overflow-hidden ${BAR_BG_UNFILLED}`}>
        <div
          className={`h-full ${barColor} transition-all duration-500 ease-out`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: TranscriptHighlight }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-none p-4">
      <div className="text-sm italic text-slate-700 mb-2">
        &ldquo;{highlight.quote}&rdquo;
      </div>
      <div className="text-xs text-slate-600">
        {highlight.comment}
      </div>
    </div>
  );
}

export function SpinMetricsDisplay({ metrics }: SpinMetricsDisplayProps) {
  const { detailedFeedback } = metrics;

  return (
    <div className="space-y-6">
      {/* Pontuação Geral: score + feedback centralizado dentro do box */}
      <div className="text-center p-6 bg-slate-50 rounded-none border border-slate-200">
        <div className="text-sm text-slate-500 mb-2">Pontuacao Geral</div>
        <div className="text-5xl font-bold mb-2 text-slate-700">
          {metrics.overallScore}%
        </div>
        {metrics.feedback && (
          <p className="text-sm text-slate-700 max-w-md mx-auto">
            {metrics.feedback}
          </p>
        )}
      </div>

      {/* SPIN Breakdown - parte não preenchida da barra: cinza claro igual para todos */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-800">Analise SPIN</h3>

        <MetricBar
          label="S"
          fullLabel="Situacao"
          value={metrics.situation}
          barColor="bg-blue-500"
          labelBg="bg-blue-100"
          labelText="text-blue-700"
        />
        <MetricBar
          label="P"
          fullLabel="Problema"
          value={metrics.problem}
          barColor="bg-violet-500"
          labelBg="bg-violet-100"
          labelText="text-violet-700"
        />
        <MetricBar
          label="I"
          fullLabel="Implicacao"
          value={metrics.implication}
          barColor="bg-amber-500"
          labelBg="bg-amber-100"
          labelText="text-amber-700"
        />
        <MetricBar
          label="N"
          fullLabel="Necessidade-Recompensa"
          value={metrics.needPayoff}
          barColor="bg-emerald-500"
          labelBg="bg-emerald-100"
          labelText="text-emerald-700"
        />
      </div>

      {/* Detailed Feedback Sections */}
      {detailedFeedback && (
        <>
          {/* Pontos Fortes - sem ícone, cores neutras */}
          {detailedFeedback.strengths.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800">Pontos Fortes</h3>
              <div className="space-y-2">
                {detailedFeedback.strengths.map((strength, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-none p-3">
                    <span className="text-sm text-slate-700">{strength}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Oportunidades de melhoria - sem ícone, cores neutras */}
          {detailedFeedback.improvements.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800">Oportunidades de melhoria</h3>
              <div className="space-y-2">
                {detailedFeedback.improvements.map((improvement, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-200 rounded-none p-3">
                    <span className="text-sm text-slate-700">{improvement}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Highlights */}
          {detailedFeedback.transcript_highlights.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-800">Destaques da Conversa</h3>
              <div className="space-y-3">
                {detailedFeedback.transcript_highlights.map((highlight, i) => (
                  <HighlightCard key={i} highlight={highlight} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
