'use client';

import { useRouter } from 'next/navigation';

interface CreateRoleplayCardProps {
  /** Quando true (já tem outros roleplays), vai para ofertas em cards; senão vai direto para o wizard de criação */
  hasOtherAgents?: boolean;
  /** Quando 'create', sempre vai para /agents/create (usado nas listas de ofertas e perfis). */
  destination?: 'offers' | 'create';
  /** Usado com destination='create' na página de perfis: /agents/create?offer_id=X&step=context */
  offerId?: number;
}

export function CreateRoleplayCard({ hasOtherAgents = false, destination, offerId }: CreateRoleplayCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (destination === 'create') {
      if (offerId != null) {
        router.push(`/agents/create?offer_id=${offerId}&step=context`);
      } else {
        router.push('/agents/create');
      }
      return;
    }
    if (hasOtherAgents) {
      router.push('/agents/offers');
    } else {
      router.push('/agents/create');
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="w-full text-left card-surface p-6 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 relative hover:brightness-[1.02] transition-all border-2 border-dashed border-slate-300 hover:border-[#2E63CD]/50 flex flex-col items-center justify-center min-h-[200px] gap-3"
    >
      <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6 text-[#2E63CD]"
        >
          <path
            fillRule="evenodd"
            d="M12 3.75a.75.75 0 01.75.75v6.75h6.75a.75.75 0 010 1.5h-6.75v6.75a.75.75 0 01-1.5 0v-6.75H4.5a.75.75 0 010-1.5h6.75V4.5a.75.75 0 01.75-.75z"
            clipRule="evenodd"
          />
        </svg>
      </div>
      <span className="text-sm font-medium text-slate-600">Criar Roleplay</span>
    </button>
  );
}
