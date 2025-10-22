/**
 * Hook customizado para Antifraude
 * Gerencia fingerprinting, análise comportamental e validação de risco
 */

import { useEffect, useRef, useState } from 'react';
import { gerarFingerprint, type FingerprintData } from '@/lib/antifraude/fingerprint';
import { obterTracker, limparTracker } from '@/lib/antifraude/behavior-tracker';

export interface ResultadoAntifraude {
  success: boolean;
  risco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  score: number;
  bloqueado: boolean;
  acao: string;
  sinaisAlerta: string[];
  detalhes: {
    dispositivoNovo: boolean;
    ipNovo: boolean;
    localizacaoNova: boolean;
    vpnDetectado: boolean;
    botDetectado: boolean;
  };
}

export function useAntifraude() {
  const [fingerprint, setFingerprint] = useState<FingerprintData | null>(null);
  const [carregando, setCarregando] = useState(true);
  const trackerRef = useRef(obterTracker());

  /**
   * Gera fingerprint ao montar componente
   */
  useEffect(() => {
    async function inicializar() {
      try {
        const fp = await gerarFingerprint();
        setFingerprint(fp);
      } catch (error) {
        console.error('Erro ao gerar fingerprint:', error);
      } finally {
        setCarregando(false);
      }
    }

    inicializar();

    // Cleanup
    return () => {
      limparTracker();
    };
  }, []);

  /**
   * Valida tentativa de login/ação
   */
  const validarAcao = async (
    tipoEvento: string,
    usuarioId?: string,
    geolocalizacao?: {
      latitude: number;
      longitude: number;
      precisao?: number;
    }
  ): Promise<ResultadoAntifraude | null> => {
    if (!fingerprint) {
      console.warn('Fingerprint ainda não foi gerado');
      return null;
    }

    try {
      // Obter dados comportamentais
      const comportamento = trackerRef.current?.gerarRelatorio();

      // Enviar para API de validação
      const response = await fetch('/api/antifraude/validar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          fingerprintHash: fingerprint.fingerprintHash,
          fingerprintData: fingerprint,
          geolocalizacao,
          comportamento,
          tipoEvento
        })
      });

      if (!response.ok) {
        throw new Error('Falha na validação antifraude');
      }

      const resultado: ResultadoAntifraude = await response.json();
      return resultado;
    } catch (error) {
      console.error('Erro ao validar ação:', error);
      return null;
    }
  };

  /**
   * Valida login especificamente
   */
  const validarLogin = async (
    usuarioId?: string,
    geolocalizacao?: {
      latitude: number;
      longitude: number;
      precisao?: number;
    }
  ): Promise<ResultadoAntifraude | null> => {
    return validarAcao('login', usuarioId, geolocalizacao);
  };

  /**
   * Registra página visitada (para comportamento)
   */
  const registrarPagina = (url: string) => {
    trackerRef.current?.registrarPaginaVisitada(url);
  };

  /**
   * Obtém relatório de comportamento atual
   */
  const obterComportamento = () => {
    return trackerRef.current?.gerarRelatorio();
  };

  return {
    fingerprint,
    carregando,
    validarAcao,
    validarLogin,
    registrarPagina,
    obterComportamento
  };
}

