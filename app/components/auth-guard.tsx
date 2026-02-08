'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingView } from '@/app/components/loading-view';
import { getToken, logout as authLogout } from '@/app/lib/auth-service';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const token = getToken();
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
      router.replace('/');
    }
  }, [router]);

  if (isAuthenticated === null) {
    return <LoadingView message="Carregando..." />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

export function useLogout() {
  const router = useRouter();

  const logout = useCallback(() => {
    authLogout();
    router.replace('/');
  }, [router]);

  return logout;
}
