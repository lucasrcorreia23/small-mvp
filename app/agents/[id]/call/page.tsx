'use client';

import { useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { AuthGuard } from '@/app/components/auth-guard';
import { DiamondBackground } from '@/app/components/diamond-background';
import { LoadingView } from '@/app/components/loading-view';
import { BarVisualizer, type AgentState } from '@/app/components/ui/bar-visualizer';
import { Agent } from '@/app/lib/types/sta';
import { getAgent } from '@/app/lib/sta-service';
import { getToken, logout as authLogout } from '@/app/lib/auth-service';
import { MOCK_CONVERSATION_SCRIPT } from '@/app/lib/mock-data';

const MOCK_CALL = process.env.NEXT_PUBLIC_USE_MOCK_AGENT_LINK === 'true';

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
    for (let j = start; j < end; j += 1) sum += data[j];
    const avg = sum / Math.max(1, end - start);
    const normalized = Math.pow(avg / 255, 1.35);
    const boost = 0.6 + volume * 1.1;
    bands[i] = Math.min(1, normalized * boost);
  }
  return bands;
}

function getPersonaImageUrl(agent: Agent): string {
  return `https://i.pravatar.cc/256?u=${agent.id}-${encodeURIComponent(agent.persona_name)}`;
}

function formatContextSlug(slug: string): string {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDifficulty(level: string): string {
  if (level === 'easy') return 'Fácil';
  if (level === 'medium') return 'Médio';
  if (level === 'hard') return 'Difícil';
  return level;
}

interface TranscriptEntry {
  role: 'buyer' | 'seller';
  content: string;
}

function CallPageContent() {
  const params = useParams();
  const router = useRouter();
  const agentId = Number(params.id);

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoadingAgent, setIsLoadingAgent] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [outputBands, setOutputBands] = useState<number[]>([]);

  // Mock call state
  const [mockState, setMockState] = useState<'idle' | 'connecting' | 'playing' | 'waiting' | 'ended'>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const mockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mockIndexRef = useRef(0);

  const rafRef = useRef<number | null>(null);
  const timeRef = useRef(0);
  const outputSamplerRef = useRef<(() => Uint8Array | undefined) | null>(null);
  const outputVolumeRef = useRef<(() => number) | null>(null);

  const conversation = useConversation({
    onConnect: () => setError(null),
    onDisconnect: () => setHasStarted(false),
    onError: (err) => {
      console.error('Conversation error:', err);
      setError('Ocorreu um erro na conexão. Tente novamente.');
    },
  });

  const getSignedUrl = useCallback(async (): Promise<string> => {
    const savedLink = localStorage.getItem('perfecting_agent_link');
    if (savedLink) return savedLink;
    const token = getToken();
    if (!token) throw new Error('Token não encontrado. Faça login novamente.');
    const now = new Date();
    const userTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const url = `/api/get-agent-link?user_time=${encodeURIComponent(userTime)}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 401) {
        authLogout();
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Falha ao obter URL: ${response.statusText}`);
    }
    const data = await response.json();
    const signedUrl = data.signed_url || data.link || data.agent_link || data;
    if (signedUrl && typeof signedUrl === 'string') {
      localStorage.setItem('perfecting_agent_link', signedUrl);
    }
    if (!signedUrl || typeof signedUrl !== 'string') {
      throw new Error('Resposta da API sem URL do agente.');
    }
    return signedUrl;
  }, []);

  const startRealCall = useCallback(async () => {
    setError(null);
    try {
      const signedUrl = await getSignedUrl();
      await conversation.startSession({ signedUrl, connectionType: 'websocket' });
      setHasStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao iniciar chamada.');
    }
  }, [getSignedUrl, conversation]);

  const stopRealCall = useCallback(() => {
    conversation.endSession().catch(console.warn);
    router.push(`/agents/${agentId}/results`);
  }, [conversation, agentId, router]);

  // Load agent data
  useEffect(() => {
    if (!agentId) return;

    const loadAgent = async () => {
      setIsLoadingAgent(true);
      setError(null);

      try {
        const agentData = await getAgent(agentId);
        setAgent(agentData);
      } catch (err) {
        console.error('Erro ao carregar agente:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar agente');
      } finally {
        setIsLoadingAgent(false);
      }
    };

    loadAgent();
  }, [agentId]);

  useEffect(() => {
    outputSamplerRef.current = conversation.getOutputByteFrequencyData?.bind(conversation) ?? null;
  }, [conversation.getOutputByteFrequencyData]);

  useEffect(() => {
    outputVolumeRef.current = conversation.getOutputVolume?.bind(conversation) ?? null;
  }, [conversation.getOutputVolume]);

  // Mock visualizer animation (only when MOCK_CALL)
  useEffect(() => {
    if (!hasStarted) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setOutputBands([]);
      return;
    }
    if (!MOCK_CALL) return;

    const update = () => {
      timeRef.current = performance.now() / 1000;
      const isSpeaking = mockState === 'playing' && currentSpeaker === 'buyer';
      const baseAmplitude = isSpeaking ? 0.6 : 0.15;
      const bands = Array.from({ length: 20 }, (_, i) => {
        const wave = Math.sin(timeRef.current * (isSpeaking ? 8 : 3) + i * 0.5) * 0.2;
        const noise = Math.random() * 0.1;
        return Math.min(1, Math.max(0, baseAmplitude + wave + noise));
      });
      setOutputBands(bands);
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hasStarted, MOCK_CALL, mockState, currentSpeaker]);

  // Real-call visualizer (ElevenLabs output) when !MOCK_CALL
  useEffect(() => {
    if (!hasStarted || MOCK_CALL || conversation.status !== 'connected') {
      if (!MOCK_CALL && outputBands.length) setOutputBands([]);
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
        return prev.map((value, i) => value * 0.55 + nextBands[i] * 0.45);
      });
      rafRef.current = requestAnimationFrame(update);
    };

    update();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
  }, [hasStarted, MOCK_CALL, conversation.status, outputBands.length]);

  // Mock conversation playback
  const playNextMessage = useCallback(() => {
    const idx = mockIndexRef.current;
    if (idx >= MOCK_CONVERSATION_SCRIPT.length) {
      setMockState('ended');
      setCurrentSpeaker(null);
      mockTimerRef.current = setTimeout(() => {
        router.push(`/agents/${agentId}/results`);
      }, 1500);
      return;
    }

    const message = MOCK_CONVERSATION_SCRIPT[idx];

    if (message.role === 'buyer') {
      setCurrentSpeaker('buyer');
      setMockState('playing');
      // Show buyer message after a short delay (simulating speech)
      mockTimerRef.current = setTimeout(() => {
        setTranscript((prev) => [...prev, { role: 'buyer', content: message.content }]);
        mockIndexRef.current = idx + 1;
        // Brief pause, then next
        mockTimerRef.current = setTimeout(() => {
          playNextMessage();
        }, 1000);
      }, message.delay);
    } else {
      // Seller turn: show "Sua vez de responder..." then auto-advance
      setCurrentSpeaker('seller');
      setMockState('waiting');
      mockTimerRef.current = setTimeout(() => {
        setTranscript((prev) => [...prev, { role: 'seller', content: message.content }]);
        mockIndexRef.current = idx + 1;
        mockTimerRef.current = setTimeout(() => {
          playNextMessage();
        }, 1000);
      }, message.delay);
    }
  }, [agentId, router]);

  const startMockCall = useCallback(() => {
    setHasStarted(true);
    setMockState('connecting');
    setTranscript([]);
    mockIndexRef.current = 0;

    // Connecting phase
    mockTimerRef.current = setTimeout(() => {
      setMockState('playing');
      playNextMessage();
    }, 1500);
  }, [playNextMessage]);

  const stopMockCall = useCallback(() => {
    if (mockTimerRef.current) {
      clearTimeout(mockTimerRef.current);
    }
    setHasStarted(false);
    setMockState('idle');
    setCurrentSpeaker(null);
    router.push(`/agents/${agentId}/results`);
  }, [agentId, router]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mockTimerRef.current) clearTimeout(mockTimerRef.current);
    };
  }, []);

  const agentState: AgentState = useMemo(() => {
    if (!MOCK_CALL) {
      if (conversation.status === 'connecting') return 'connecting';
      if (conversation.status === 'connected' && conversation.isSpeaking) return 'speaking';
      if (conversation.status === 'connected') return 'listening';
      if (hasStarted) return 'initializing';
      return 'connecting';
    }
    if (mockState === 'connecting') return 'connecting';
    if (mockState === 'playing' && currentSpeaker === 'buyer') return 'speaking';
    if (mockState === 'waiting') return 'listening';
    if (hasStarted) return 'initializing';
    return 'connecting';
  }, [MOCK_CALL, conversation.status, conversation.isSpeaking, hasStarted, mockState, currentSpeaker]);

  const handleBack = () => {
    router.push('/agents');
  };

  if (isLoadingAgent) {
    return <LoadingView message="Carregando agente..." />;
  }

  if (error && !agent) {
    return (
      <main className="min-h-screen relative">
        <DiamondBackground />
        <div className="fixed inset-0 z-[1] backdrop-blur-md bg-white/25 pointer-events-none" aria-hidden />
        <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
          <div className="bg-white/70 backdrop-blur-xl border border-white/60 rounded-none p-8 max-w-md w-full text-center">
            <div className="text-red-600 bg-red-50 border border-red-200 rounded-none p-4 mb-6">
              {error}
            </div>
            <button
              onClick={handleBack}
              className="h-10 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] text-white font-medium rounded-none transition-all"
            >
              Voltar para Agentes
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen relative">
      <DiamondBackground />
      <div className="fixed inset-0 z-[1] backdrop-blur-md bg-white/25 pointer-events-none" aria-hidden />

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-none px-8 py-8 shadow-[0_20px_60px_rgba(15,23,42,0.12)]">
            {/* Dados do agente: avatar, nome e cargo centralizados (igual feedback) */}
            {agent && (
              <div className="flex flex-col items-center text-center mb-8">
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-slate-200 ring-2 ring-slate-200">
                  <Image
                    src={getPersonaImageUrl(agent)}
                    alt={agent.persona_name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                </div>
                <h1 className="text-xl font-semibold text-slate-900 mt-3">
                  {agent.persona_name}
                </h1>
                <p className="text-sm text-slate-500">{agent.persona_job_title}</p>
              </div>
            )}

            {/* Call Controls */}
            {!hasStarted ? (
              <div className="space-y-4">
                <button
                  onClick={MOCK_CALL ? startMockCall : startRealCall}
                  className="w-full h-12 px-6 bg-[#2E63CD] hover:bg-[#3A71DB] text-white font-medium rounded-none transition-all duration-200 active:scale-[0.98]"
                >
                  Iniciar Chamada
                </button>
                <button
                  onClick={handleBack}
                  className="w-full text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
                >
                  Voltar
                </button>
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Status indicator */}
                {MOCK_CALL && mockState === 'connecting' && (
                  <div className="text-center text-sm text-slate-500">
                    Conectando...
                  </div>
                )}
                {!MOCK_CALL && conversation.status === 'connecting' && (
                  <div className="text-center text-sm text-slate-500">
                    Conectando...
                  </div>
                )}
                {MOCK_CALL && mockState === 'waiting' && (
                  <div className="text-center text-sm text-[#2E63CD] font-medium animate-pulse">
                    Sua vez de responder...
                  </div>
                )}
                {!MOCK_CALL && conversation.status === 'connected' && !conversation.isSpeaking && (
                  <div className="text-center text-sm text-[#2E63CD] font-medium animate-pulse">
                    Sua vez de responder...
                  </div>
                )}
                {MOCK_CALL && mockState === 'playing' && currentSpeaker === 'buyer' && (
                  <div className="text-center text-sm text-slate-500">
                    Comprador falando...
                  </div>
                )}
                {!MOCK_CALL && conversation.status === 'connected' && conversation.isSpeaking && (
                  <div className="text-center text-sm text-slate-500">
                    Agente falando...
                  </div>
                )}

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
                  onClick={MOCK_CALL ? stopMockCall : stopRealCall}
                  className="w-full h-12 px-6 bg-red-600 hover:bg-red-700 text-white font-medium rounded-none transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                    <path d="M4.5 10.5C6.5 9.17 9.13 8.5 12 8.5c2.87 0 5.5.67 7.5 2 1.06.7 1.5 2.03 1.08 3.25l-.55 1.6a1.5 1.5 0 0 1-1.83.95l-2.4-.6a1.5 1.5 0 0 1-1.1-1.13l-.24-1.2a13.8 13.8 0 0 0-4.92 0l-.24 1.2a1.5 1.5 0 0 1-1.1 1.13l-2.4.6a1.5 1.5 0 0 1-1.83-.95l-.55-1.6A2.99 2.99 0 0 1 4.5 10.5Z" />
                  </svg>
                  Encerrar Chamada
                </button>
                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </div>
            )}

            {/* Contexto, dificuldade e empresa (sem título; contexto sem label); só antes da chamada */}
            {!hasStarted && agent && (
              <div className="mt-6 pt-6 border-t border-slate-200 space-y-2 text-sm text-slate-600">
                <p>{formatContextSlug(agent.call_context_type_slug)}</p>
                <p>
                  <span className="font-medium">Dificuldade:</span>{' '}
                  {formatDifficulty(agent.scenario_difficulty_level)}
                </p>
                <p>
                  <span className="font-medium">Empresa:</span> {agent.company_name}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function CallPage() {
  return (
    <AuthGuard>
      <CallPageContent />
    </AuthGuard>
  );
}
