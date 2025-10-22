import { useEffect, useState } from 'react';
import { loadSystemConfig } from '../config/centralized-config';

export interface SystemConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  geolocation: {
    maxDistance: number;
    accuracyThreshold: number;
    timeout: number;
  };
  antifraud: {
    maxAttempts: number;
    lockoutDuration: number;
    riskThreshold: number;
  };
  urls: {
    api: string;
    esocialHomologacao: string;
    esocialProducao: string;
  };
}

// Configurações padrão que sempre estarão disponíveis
const DEFAULT_CONFIG: SystemConfig = {
  colors: {
    primary: '#29ABE2',
    secondary: '#90EE90',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  geolocation: {
    maxDistance: 200,
    accuracyThreshold: 100,
    timeout: 10000,
  },
  antifraud: {
    maxAttempts: 3,
    lockoutDuration: 3600,
    riskThreshold: 0.7,
  },
  urls: {
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    esocialHomologacao: 'https://webservices.producaorestrita.esocial.gov.br',
    esocialProducao: 'https://webservices.envio.esocial.gov.br',
  },
};

export const useSystemConfig = () => {
  const [config, setConfig] = useState<SystemConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Só tenta carregar do banco se estiver no servidor
    if (typeof window === 'undefined') {
      const loadConfig = async () => {
        try {
          setLoading(true);
          const systemConfig = await loadSystemConfig();
          setConfig(systemConfig);
          setError(null);
        } catch (err) {
          console.error('Erro ao carregar configurações do sistema:', err);
          setError('Erro ao carregar configurações');
          // Mantém as configurações padrão
        } finally {
          setLoading(false);
        }
      };

      loadConfig();
    }
  }, []);

  return { config, loading, error };
};
