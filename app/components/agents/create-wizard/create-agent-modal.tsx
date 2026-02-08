'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface CreateAgentModalProps {
  open: boolean;
  onClose: () => void;
  defaultAgentName: string;
  personaName: string;
  onSubmit: (payload: { displayName: string; avatarType: 'initials' | 'upload'; avatarData?: string }) => Promise<void>;
  loading: boolean;
  error: string | null;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CreateAgentModal({
  open,
  onClose,
  defaultAgentName,
  personaName,
  onSubmit,
  loading,
  error,
}: CreateAgentModalProps) {
  const [displayName, setDisplayName] = useState(defaultAgentName || personaName || '');
  const [avatarType, setAvatarType] = useState<'initials' | 'upload'>('initials');
  const [avatarData, setAvatarData] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setDisplayName(defaultAgentName || personaName || '');
      setAvatarType('initials');
      setAvatarData(undefined);
    }
  }, [open, defaultAgentName, personaName]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => setAvatarData(reader.result as string);
    reader.readAsDataURL(file);
    setAvatarType('upload');
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const name = displayName.trim() || personaName || 'Agente';
      await onSubmit({
        displayName: name,
        avatarType,
        avatarData: avatarType === 'upload' ? avatarData : undefined,
      });
    },
    [displayName, personaName, avatarType, avatarData, onSubmit]
  );

  if (!open) return null;

  const initials = getInitials(displayName || personaName || 'Agente');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60"
        aria-hidden
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-agent-modal-title"
        className="relative w-full max-w-md rounded-lg bg-white shadow-xl border border-slate-200"
      >
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h2 id="create-agent-modal-title" className="text-xl font-semibold text-slate-800">
            Criar agente
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="create-agent-name" className="text-sm font-medium text-slate-700">
              Nome do agente
            </label>
            <input
              id="create-agent-name"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder={personaName || 'Ex: Agente de Vendas'}
              disabled={loading}
              className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30 disabled:bg-slate-50"
            />
          </div>

          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-700">Foto do agente</span>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="avatar-type"
                  checked={avatarType === 'initials'}
                  onChange={() => setAvatarType('initials')}
                  disabled={loading}
                  className="h-4 w-4 border-slate-300 text-[#2E63CD] focus:ring-[#2E63CD]/30"
                />
                <span className="text-sm text-slate-700">Usar iniciais do agente</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="avatar-type"
                  checked={avatarType === 'upload'}
                  onChange={() => {
                    setAvatarType('upload');
                    fileInputRef.current?.click();
                  }}
                  disabled={loading}
                  className="h-4 w-4 border-slate-300 text-[#2E63CD] focus:ring-[#2E63CD]/30"
                />
                <span className="text-sm text-slate-700">Enviar imagem do computador</span>
              </label>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {(avatarType === 'initials' || avatarData) && (
              <div className="flex items-center gap-4 mt-2">
                <div className="w-14 h-14 rounded-full overflow-hidden flex-shrink-0 bg-[#2E63CD] flex items-center justify-center text-white font-semibold text-lg">
                  {avatarType === 'upload' && avatarData ? (
                    <img src={avatarData} alt="" className="w-full h-full object-cover" />
                  ) : (
                    initials
                  )}
                </div>
                {avatarType === 'upload' && avatarData && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarData(undefined);
                      setAvatarType('initials');
                    }}
                    className="text-sm text-slate-500 hover:text-slate-700"
                  >
                    Remover imagem
                  </button>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 h-12 px-4 rounded-sm border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 px-4 rounded-sm bg-[#2E63CD] text-white font-medium hover:bg-[#2557b0] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Criando agente...
                </>
              ) : (
                'Criar agente'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
