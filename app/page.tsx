'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { signup, login, createOrganization, getToken } from './lib/auth-service';
import { listOffers } from './lib/sta-service';
import { DiamondLogin } from './components/diamond-background';
import { LoadingView } from './components/loading-view';

type FormMode = 'login' | 'signup';
type SignupStep = 1 | 2; // 1 = dados pessoais, 2 = empresa

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<FormMode>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [orgName, setOrgName] = useState('');
  const [orgCnpj, setOrgCnpj] = useState('');
  const [orgUrl, setOrgUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [waitingPermissions, setWaitingPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollStartedRef = useRef(false);

  const handleSignupStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError('Por favor, preencha o nome.');
      return;
    }
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await signup({ name: name.trim(), email: email.trim(), password });
      const tokenAfterSignup = getToken();
      if (!tokenAfterSignup) {
        setError('Conta criada, mas não foi possível iniciar sua sessão. Faça login para continuar.');
        setMode('login');
        setSignupStep(1);
        return;
      }
      setSignupStep(2);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignupStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cnpjDigits = orgCnpj.replace(/\D/g, '');
    if (!orgName.trim()) {
      setError('Por favor, preencha o nome da organização.');
      return;
    }
    if (cnpjDigits.length !== 14) {
      setError('CNPJ deve ter 14 dígitos.');
      return;
    }
    if (!orgUrl.trim()) {
      setError('Por favor, preencha a URL da organização.');
      return;
    }
    setLoading(true);
    try {
      await createOrganization({
        cnpj: Number(cnpjDigits),
        name: orgName.trim(),
        url: orgUrl.trim(),
      });
      const tokenAfterOrg = getToken();
      if (!tokenAfterOrg) {
        setError('Não foi possível atualizar sua sessão. Tente fazer login novamente.');
        setLoading(false);
        return;
      }
      // Novo login para obter token com permissões STA já associadas à organização (evita precisar sair e entrar de novo)
      try {
        await login(email.trim(), password);
      } catch (loginErr) {
        console.warn('[signup] Re-login após create_organization:', loginErr);
        // Continua com o token do create_organization; o polling pode ainda funcionar
      }
      setLoading(false);
      setWaitingPermissions(true);
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao criar organização. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Após criar a conta, aguarda as permissões STA estarem ativas (delay inicial + polling)
  useEffect(() => {
    if (!waitingPermissions || pollStartedRef.current) return;
    pollStartedRef.current = true;

    const INITIAL_DELAY_MS = 6000; // 6s para o backend propagar permissões antes do primeiro poll
    const POLL_INTERVAL_MS = 3000;
    const MAX_ATTEMPTS = 20; // após o delay: ~60s de polling

    let attempts = 0;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const tryPoll = async () => {
      if (attempts >= MAX_ATTEMPTS) {
        router.push('/agents?permissions_pending=1');
        return;
      }
      attempts += 1;
      try {
        await listOffers();
        router.push('/agents');
      } catch {
        timeoutId = setTimeout(tryPoll, POLL_INTERVAL_MS);
      }
    };

    timeoutId = setTimeout(tryPoll, INITIAL_DELAY_MS);

    return () => {
      if (timeoutId != null) clearTimeout(timeoutId);
    };
  }, [waitingPermissions, router]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha email e senha.');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push('/agents');
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Erro ao fazer login. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const switchToLogin = () => {
    setMode('login');
    setSignupStep(1);
    setError(null);
  };

  const switchToSignup = () => {
    setMode('signup');
    setSignupStep(1);
    setError(null);
  };

  const cancelWaitingPermissions = () => {
    pollStartedRef.current = false;
    setWaitingPermissions(false);
  };

  if (waitingPermissions) {
    return (
      <LoadingView
        fullPage
        message="Configurando sua conta e permissões..."
      >
        <p className="text-sm text-slate-400 mt-1">Aguardando ativação do acesso aos agentes. Pode levar até 1 minuto.</p>
        <button
          type="button"
          onClick={cancelWaitingPermissions}
          className="mt-4 text-sm text-[#2E63CD] hover:underline focus:outline-none focus:ring-2 focus:ring-[#2E63CD] rounded"
        >
          Voltar ao login
        </button>
      </LoadingView>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#f9f9f9] overflow-hidden">
      {/* Efeitos esfumaçados: reflexos dos lados do diamante (atrás de tudo) */}
      <div
        className="absolute inset-0 z-0 pointer-events-none lg:overflow-visible"
        aria-hidden
      >
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] max-w-[900px] h-[90%] lg:h-[110%] flex items-center justify-center">
          {/* Reflexo lateral esquerdo do diamante */}
          <div
            className="absolute left-[5%] top-[35%] w-[300px] h-[340px] rounded-full opacity-[0.58] blur-[75px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(165,191,245,0.85) 0%, rgba(184,212,240,0.5) 35%, rgba(207,227,255,0.25) 55%, transparent 75%)',
            }}
          />
          {/* Reflexo lateral direito do diamante */}
          <div
            className="absolute right-[5%] top-[38%] w-[280px] h-[320px] rounded-full opacity-[0.52] blur-[70px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(180,208,245,0.8) 0%, rgba(197,220,248,0.45) 40%, rgba(214,233,255,0.2) 58%, transparent 75%)',
            }}
          />
          {/* Reflexo superior (face do diamante) */}
          <div
            className="absolute left-1/2 top-[25%] -translate-x-1/2 w-[340px] h-[220px] rounded-full opacity-[0.48] blur-[65px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(197,220,248,0.75) 0%, rgba(180,208,245,0.4) 45%, rgba(220,232,248,0.2) 60%, transparent 75%)',
            }}
          />
          {/* Névoa central (base do diamante) */}
          <div
            className="absolute left-1/2 bottom-[20%] -translate-x-1/2 w-[420px] h-[240px] rounded-full opacity-[0.42] blur-[85px]"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(184,208,242,0.7) 0%, rgba(165,191,245,0.35) 40%, rgba(210,222,240,0.2) 60%, transparent 78%)',
            }}
          />
        </div>
      </div>

      {/* Camada do diamante (z-0) */}
      <div
        className="absolute -left-5 bottom-20 w-full h-full z-0 overflow-visible pointer-events-none"
        aria-hidden
      >
        <div className="h-full w-full lg:grid lg:grid-cols-2 flex flex-col justify-left items-center gap-4">
          <div className="h-8 shrink-0" aria-hidden />
          <div className="h-5 max-w-xs shrink-0" aria-hidden />
          <div className="w-full h-full blur-lg lg:blur-none flex-shrink-0 justify-center flex items-center overflow-visible">
            <DiamondLogin />
          </div>
        </div>
      </div>

      {/* Grid por cima (z-10): duas colunas */}
      <div className="relative z-10 min-h-screen flex flex-col lg:grid lg:grid-cols-2 lg:min-h-screen">
        {/* Left column: logo e slogan; espaço reservado para o diamante (mostrado pela camada de fundo) */}
        <div className="flex flex-col lg:items-center col-1 items-center justify-center gap-4 p-6 order-1">
          <span className="text-7xl font-bold text-[#3465C6] tracking-tight font-sans">
            Perfecting
          </span>
          <p className="text-sm text-slate-500 pl-1 font-regular text-center max-w-xs">
            IA para escalar coaching e aperfeiçoar times.
          </p>
          <div className="w-full h-[20px] lg:h-[440px] l flex-shrink-0" aria-hidden />
        </div>

        {/* Right column: transparente para o diamante aparecer atrás; só o card cobre */}
        <div className="flex flex-col items-center justify-center shrink-0 p-4 lg:p-8 order-2">
        <div className="w-full max-w-sm card-surface border border-slate-400 shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-2">
              {mode === 'login'
                ? 'Bem-vindo'
                : signupStep === 1
                  ? 'Criar Conta'
                  : 'Sua empresa'}
            </h2>
            <p className="text-slate-500 text-sm">
              {mode === 'login'
                ? 'Acesse para treinar suas habilidades de vendas'
                : signupStep === 1
                  ? 'Informe os dados solicitados'
                  : 'Vincule sua organização para acessar o sistema'}
            </p>
            {mode === 'signup' && (
              <div className="mt-3 flex justify-center gap-1" aria-hidden>
                <span
                  className={`h-1 w-8 rounded-sm transition-colors ${
                    signupStep === 1 ? 'bg-[#2E63CD]' : 'bg-slate-200'
                  }`}
                />
                <span
                  className={`h-1 w-8 rounded-sm transition-colors ${
                    signupStep === 2 ? 'bg-[#2E63CD]' : 'bg-slate-200'
                  }`}
                />
              </div>
            )}
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 mb-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="mt-2 w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? 'Carregando...' : 'Entrar'}
              </button>
            </form>
          ) : signupStep === 1 ? (
            <form onSubmit={handleSignupStep1} className="space-y-4 mb-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome completo"
                  required
                  className="mt-2 w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@exemplo.com"
                  required
                  className="mt-2 w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="********"
                  required
                  className="w-full mt-2 px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
                  {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98]"
              >
                {loading ? 'Carregando...' : 'Próximo'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignupStep2} className="space-y-4 mb-6">
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">Empresa</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="Ex: Minha Empresa Ltda"
                  required
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">CNPJ (14 dígitos)</label>
                <input
                  type="text"
                  value={orgCnpj}
                  onChange={(e) => setOrgCnpj(e.target.value.replace(/\D/g, '').slice(0, 14))}
                  placeholder="00000000000000"
                  maxLength={14}
                  required
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-slate-700">URL da organização</label>
                <input
                  type="url"
                  value={orgUrl}
                  onChange={(e) => setOrgUrl(e.target.value)}
                  placeholder="https://minhaempresa.com"
                  required
                  className="w-full px-4 py-3 rounded-sm border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2E63CD]/30"
                />
              </div>
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-sm p-3">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  disabled={loading}
                  className="btn-secondary flex-1 h-12 px-4 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 font-medium transition-colors"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 h-12 px-6 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-medium transition-all duration-200 active:scale-[0.98]"
                >
                  {loading ? 'Carregando...' : 'Criar conta'}
                </button>
              </div>
            </form>
          )}

          <div className="text-center">
            <button
              type="button"
              onClick={mode === 'signup' ? switchToLogin : switchToSignup}
              className="text-sm font-medium text-[#2E63CD] hover:text-slate-700 transition-colors"
            >
              {mode === 'signup'
                ? 'Já tem uma conta? Entrar'
                : 'Não tem uma conta? Criar conta'}
            </button>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}
