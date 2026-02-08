'use client';

interface LoadingViewProps {
  /** Mensagem exibida abaixo do spinner. */
  message?: string;
  /** Se true (padrão), usa layout full-page. Se false, só spinner + texto (para uso inline). */
  fullPage?: boolean;
  /** Conteúdo opcional abaixo da mensagem (ex.: progress dots). */
  children?: React.ReactNode;
}

const SPINNER_CLASS = 'w-10 h-10 border-2 border-[#2E63CD] border-t-transparent rounded-full animate-spin';

export function LoadingView({ message = 'Carregando...', fullPage = true, children }: LoadingViewProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <div className={SPINNER_CLASS} />
      <p className="text-slate-500 text-center">{message}</p>
      {children}
    </div>
  );

  if (!fullPage) {
    return content;
  }

  return (
    <main className="min-h-screen relative">
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        {content}
      </div>
    </main>
  );
}
