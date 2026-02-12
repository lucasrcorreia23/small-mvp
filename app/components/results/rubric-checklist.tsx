'use client';

import { RubricResult } from '@/app/lib/types/sta';

interface RubricChecklistProps {
  items: RubricResult[];
}

export function RubricChecklist({ items }: RubricChecklistProps) {
  if (!items.length) return null;

  const metCount = items.filter((r) => r.met).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Critérios</h3>
        <span className="text-sm text-slate-500">
          {metCount}/{items.length} criterios atendidos
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0"
          >
            {item.met ? (
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-emerald-600" aria-label="Atendido">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                </svg>
              </span>
            ) : (
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center text-red-500" aria-label="Nao atendido">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                </svg>
              </span>
            )}
            <span className="text-sm text-slate-700 flex-1">{item.criterion}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
