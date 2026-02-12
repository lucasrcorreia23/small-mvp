'use client';

import { Context } from '@/app/lib/types/sta';
import { CardActionsMenu } from './card-actions-menu';

interface ContextCardProps {
  context: Context;
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ContextCard({ context, onClick, onEdit, onDelete }: ContextCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      className="w-full text-left card-surface p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 hover:brightness-[1.02] transition-all relative flex flex-col min-h-[220px]"
    >
      {/* Menu de ações */}
      <div className="absolute top-3 right-3">
        <CardActionsMenu onEdit={onEdit} onDelete={onDelete} />
      </div>

      <div className="flex flex-col flex-1 min-w-0 justify-between">
        <div className="flex flex-col gap-2 pr-8">
          <h3 className="text-base font-semibold text-slate-800 truncate">
            {context.name}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-3 leading-relaxed flex-1">
            {context.target_description}
          </p>
        </div>

        {/* CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 -mx-5 px-5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="w-full btn-primary h-10 text-white font-medium flex items-center justify-center"
          >
            Selecionar Perfil de Comprador
          </button>
        </div>
      </div>
    </div>
  );
}
