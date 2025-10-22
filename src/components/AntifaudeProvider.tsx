/**
 * Provider de Antifraude
 * Inicializa rastreamento comportamental em toda aplicação
 */

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { obterTracker } from '@/lib/antifraude/behavior-tracker';

interface AntifaudeProviderProps {
  children: React.ReactNode;
}

export function AntifaudeProvider({ children }: AntifaudeProviderProps) {
  const router = useRouter();

  useEffect(() => {
    // Inicializar tracker global
    const tracker = obterTracker();

    // Registrar mudanças de rota
    const handleRouteChange = (url: string) => {
      tracker.registrarPaginaVisitada(url);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Registrar página inicial
    tracker.registrarPaginaVisitada(router.pathname);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  return <>{children}</>;
}

