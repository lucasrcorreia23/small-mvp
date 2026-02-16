'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BarVisualizer,
  type AgentState,
} from './ui/bar-visualizer';
import { useLogout } from './auth-guard';
import { getToken, logout as authLogout } from '@/app/lib/auth-service';

const AGENT_NAME = 'Agente Especialista Keune';

function mapFrequencyDataToBands(
  data: Uint8Array,
  barCount: number,
  volume = 0,
  time = 0,
) {
  if (!data.length) {
    const base = Math.min(1, Math.max(0, volume) * 1.6);
    return Array.from({ length: barCount }, (_, i) => {
      const wave = Math.sin(time * 7 + i * 0.55) * 0.1;
      return Math.min(1, Math.max(0, base + wave));
    });
  }

  const bands = Array.from({ length: barCount }, () => 0);
  for (let i = 0; i < barCount; i += 1) {
    const start = Math.floor(Math.pow(i / barCount, 1.35) * data.length);
    const end = Math.max(
      start + 1,
      Math.floor(Math.pow((i + 1) / barCount, 1.35) * data.length),
    );
    let sum = 0;
    for (let j = start; j < end; j += 1) {
      sum += data[j];
    }
    const avg = sum / Math.max(1, end - start);
    const normalized = Math.pow(avg / 255, 1.35);
    const boost = 0.6 + volume * 1.1;
    bands[i] = Math.min(1, normalized * boost);
  }
  return bands;
}

export function Conversation() {
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [outputBands, setOutputBands] = useState<number[]>([]);
  const rafRef = useRef<number | null>(null);
  const outputSamplerRef = useRef<(() => Uint8Array | undefined) | null>(null);
  const outputVolumeRef = useRef<(() => number) | null>(null);
  const timeRef = useRef(0);
  const logout = useLogout();

  const conversation = useConversation({
    onConnect: () => {
      setError(null);
    },
    onDisconnect: () => {
      setHasStarted(false);
    },
    onError: (err) => {
      console.error('Error:', err);
      setError('Ocorreu um erro na conexao. Tente novamente.');
    },
  });

  const getSignedUrl = async (): Promise<string> => {
    const token = getToken();
    if (!token) {
      throw new Error('Token de autenticação não encontrado. Faça login novamente.');
    }

    const localCaseSetupId = Number(localStorage.getItem('active_case_setup_id'));
    const envCaseSetupId = Number(process.env.NEXT_PUBLIC_DEFAULT_CASE_SETUP_ID);
    const caseSetupId = Number.isInteger(localCaseSetupId) && localCaseSetupId > 0
      ? localCaseSetupId
      : envCaseSetupId;

    if (!Number.isInteger(caseSetupId) || caseSetupId <= 0) {
      throw new Error('Roleplay não selecionado para iniciar a chamada.');
    }

    const response = await fetch('/api/get-agent-link', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`, // Token no header Authorization
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ case_setup_id: caseSetupId, user_time: new Date().toISOString() }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const apiError =
        typeof errorData?.error === 'string' ? errorData.error : null;

      if (response.status === 401) {
        authLogout();
        throw new Error(apiError || 'Sessão expirada. Faça login novamente.');
      }

      // Tratar erro 403 (sem permissão / organização sem acesso): exibir mensagem da API
      if (response.status === 403) {
        throw new Error(
          apiError ||
            'Sua conta ainda não tem organização com acesso a este recurso. Crie uma organização no cadastro ou faça login com uma conta que já tenha organização.'
        );
      }

      throw new Error(apiError || `Falha ao obter URL: ${response.statusText}`);
    }

    const data = await response.json();
    const signedUrl = data.signed_url || data.link || data.agent_link || data;

    return signedUrl;
  };

  const startConversation = useCallback(async () => {
    try {
      setError(null);
      setHasStarted(true);

      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Sempre usar signed URL da API Perfecting
      const signedUrl = await getSignedUrl();
      await conversation.startSession({
        signedUrl,
        connectionType: 'websocket',
      });
    } catch (err) {
      console.error('Failed to start conversation:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Permissao do microfone negada. Por favor, permita o acesso ao microfone.');
        } else if (err.name === 'NotFoundError') {
          setError('Nenhum microfone encontrado. Conecte um microfone e tente novamente.');
        } else {
          setError('Falha ao iniciar conversa. Verifique sua conexao e tente novamente.');
        }
      }
      setHasStarted(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    try {
      await conversation.endSession();
    } catch (err) {
      console.warn('Failed to end session:', err);
    } finally {
      setHasStarted(false);
    }
  }, [conversation]);

  const agentState: AgentState = useMemo(() => {
    if (conversation.status === 'connecting') return 'connecting';
    if (conversation.status === 'connected' && conversation.isSpeaking) return 'speaking';
    if (conversation.status === 'connected') return 'listening';
    if (hasStarted) return 'initializing';
    return 'connecting';
  }, [conversation.isSpeaking, conversation.status, hasStarted]);

  useEffect(() => {
    outputSamplerRef.current = conversation.getOutputByteFrequencyData?.bind(conversation) ?? null;
  }, [conversation.getOutputByteFrequencyData]);

  useEffect(() => {
    outputVolumeRef.current = conversation.getOutputVolume?.bind(conversation) ?? null;
  }, [conversation.getOutputVolume]);

  useEffect(() => {
    if (!hasStarted || conversation.status !== 'connected') {
      if (outputBands.length) {
        setOutputBands([]);
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const update = () => {
      const data = outputSamplerRef.current?.();
      const volume = outputVolumeRef.current?.() ?? 0;
      timeRef.current = performance.now() / 1000;
      const nextBands = mapFrequencyDataToBands(
        data ?? new Uint8Array(),
        20,
        volume,
        timeRef.current,
      );
      setOutputBands((prev) => {
        if (!prev.length) return nextBands;
        return prev.map((value, index) => value * 0.55 + nextBands[index] * 0.45);
      });
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [conversation.status, hasStarted, outputBands.length]);

  return (
    <div className="relative z-10 w-full max-w-md mx-auto text-center mb-64 lg:mb-20">
      <div className="card-surface px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col items-center gap-4 mb-8">
          <img
            src="https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=facearea&w=256&h=256&q=80"
            alt="Especialista Keune"
            className="h-16 w-16 rounded-full border border-white/70 object-cover shadow-sm"
            loading="lazy"
          />
          <h1 className="text-xl font-semibold text-slate-900">
            {AGENT_NAME}
          </h1>
        </div>

        {!hasStarted ? (
          <div className="space-y-4">
            <button
              onClick={startConversation}
              className="btn-primary w-full h-12 px-6 text-white font-medium transition-all duration-200 active:scale-[0.98]"
            >
              Iniciar
            </button>
            <button
              type="button"
              onClick={logout}
              className="flex items-center justify-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0 text-slate-500" aria-hidden>
                <path fillRule="evenodd" d="M7.5 3.75A1.5 1.5 0 006 5.25v13.5A1.5 1.5 0 007.5 20h6a1.5 1.5 0 001.5-1.5V15a.75.75 0 011.5 0v3.75a3 3 0 01-3 3h-6a3 3 0 01-3-3V5.25a3 3 0 013-3h6a3 3 0 013 3V9A.75.75 0 0115 9V5.25a1.5 1.5 0 00-1.5-1.5h-6zm5.03 4.72a.75.75 0 010 1.06l-1.72 1.72h10.94a.75.75 0 010 1.5H10.81l1.72 1.72a.75.75 0 11-1.06 1.06l-3-3a.75.75 0 010-1.06l3-3a.75.75 0 011.06 0z" clipRule="evenodd" />
              </svg>
              Sair
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <BarVisualizer
              state={agentState}
              barCount={20}
              minHeight={18}
              maxHeight={90}
              className="h-40 max-w-full"
              centerAlign
              frequencyBands={outputBands}
              demo={!outputBands.length}
            />
            <button
              onClick={stopConversation}
              className="w-full h-12 px-6 rounded-sm border border-red-400/50 bg-red-600 hover:bg-red-700 text-white font-medium transition-all duration-200 flex items-center justify-center gap-2"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="currentColor"
              >
                <path d="M4.5 10.5C6.5 9.17 9.13 8.5 12 8.5c2.87 0 5.5.67 7.5 2 1.06.7 1.5 2.03 1.08 3.25l-.55 1.6a1.5 1.5 0 0 1-1.83.95l-2.4-.6a1.5 1.5 0 0 1-1.1-1.13l-.24-1.2a13.8 13.8 0 0 0-4.92 0l-.24 1.2a1.5 1.5 0 0 1-1.1 1.13l-2.4.6a1.5 1.5 0 0 1-1.83-.95l-.55-1.6A2.99 2.99 0 0 1 4.5 10.5Z" />
              </svg>
              Encerrar
            </button>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
