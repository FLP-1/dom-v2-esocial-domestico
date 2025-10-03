// Hook para acessar configurações centralizadas do banco de dados
// Substitui todos os dados hardcoded por dados dinâmicos

import { useState, useEffect, useMemo } from 'react';
import { PrismaClient } from '@prisma/client';

// Tipos das configurações
interface ConfiguracaoPerfil {
  id: string;
  nome: string;
  descricao: string;
  corPrimaria: string;
  corSecundaria: string;
  corAccent: string;
  corBackground: string;
  corSurface: string;
  corText: string;
  corTextSecondary: string;
  corBorder: string;
  corShadow: string;
  icone: string;
  avatar: string;
  ativo: boolean;
}

interface ConfiguracaoStatus {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  corPrimaria: string;
  corBackground: string;
  corTexto: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

interface ConfiguracaoPrioridade {
  id: string;
  nome: string;
  descricao: string;
  corPrimaria: string;
  corBackground: string;
  corTexto: string;
  corBorder: string;
  icone: string;
  ordem: number;
  ativo: boolean;
}

interface ConfiguracaoSistema {
  id: string;
  chave: string;
  valor: string;
  descricao: string;
  categoria: string;
  ativo: boolean;
}

interface ConfiguracaoComponente {
  id: string;
  nome: string;
  descricao: string;
  borderRadius: string;
  padding: string;
  margin: string;
  fontSize: string;
  fontWeight: string;
  shadow: string;
  transition: string;
  hoverEffect: string;
  ativo: boolean;
}

interface ConfiguracaoLayout {
  id: string;
  nome: string;
  descricao: string;
  largura: string;
  altura: string;
  minHeight: string;
  maxWidth: string;
  position: string;
  top: string;
  left: string;
  right: string;
  bottom: string;
  padding: string;
  margin: string;
  gap: string;
  background: string;
  border: string;
  borderRadius: string;
  shadow: string;
  mobileLargura: string;
  tabletLargura: string;
  desktopLargura: string;
  ativo: boolean;
}

// Cache para otimizar performance
const configCache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const useConfiguracoes = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================
  // CONFIGURAÇÕES DE PERFIL
  // ========================================
  const usePerfis = () => {
    const [perfis, setPerfis] = useState<ConfiguracaoPerfil[]>([]);

    useEffect(() => {
      const fetchPerfis = async () => {
        try {
          const cacheKey = 'perfis';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setPerfis(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/perfis');
          if (!response.ok) throw new Error('Erro ao carregar perfis');
          
          const data = await response.json();
          setPerfis(data);
          
          // Cache
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar perfis:', err);
          setError('Erro ao carregar configurações de perfil');
        }
      };

      fetchPerfis();
    }, []);

    const getPerfilPorNome = (nome: string) => {
      return perfis.find(p => p.nome === nome);
    };

    const getTemaPorPerfil = (nomePerfil: string) => {
      const perfil = getPerfilPorNome(nomePerfil);
      if (!perfil) return null;

      return {
        id: perfil.nome,
        name: perfil.descricao,
        colors: {
          primary: perfil.corPrimaria,
          secondary: perfil.corSecundaria,
          accent: perfil.corAccent,
          background: perfil.corBackground,
          surface: perfil.corSurface,
          text: perfil.corText,
          textSecondary: perfil.corTextSecondary,
          border: perfil.corBorder,
          shadow: perfil.corShadow,
        },
      };
    };

    return { perfis, getPerfilPorNome, getTemaPorPerfil };
  };

  // ========================================
  // CONFIGURAÇÕES DE STATUS
  // ========================================
  const useStatus = () => {
    const [status, setStatus] = useState<ConfiguracaoStatus[]>([]);

    useEffect(() => {
      const fetchStatus = async () => {
        try {
          const cacheKey = 'status';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setStatus(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/status');
          if (!response.ok) throw new Error('Erro ao carregar status');
          
          const data = await response.json();
          setStatus(data);
          
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar status:', err);
          setError('Erro ao carregar configurações de status');
        }
      };

      fetchStatus();
    }, []);

    const getStatusPorNome = (nome: string) => {
      return status.find(s => s.nome === nome);
    };

    const getStatusPorCategoria = (categoria: string) => {
      return status.filter(s => s.categoria === categoria);
    };

    const getCoresStatus = (nomeStatus: string) => {
      const statusItem = getStatusPorNome(nomeStatus);
      if (!statusItem) return null;

      return {
        primary: statusItem.corPrimaria,
        background: statusItem.corBackground,
        text: statusItem.corTexto,
        icon: statusItem.icone,
      };
    };

    return { status, getStatusPorNome, getStatusPorCategoria, getCoresStatus };
  };

  // ========================================
  // CONFIGURAÇÕES DE PRIORIDADE
  // ========================================
  const usePrioridades = () => {
    const [prioridades, setPrioridades] = useState<ConfiguracaoPrioridade[]>([]);

    useEffect(() => {
      const fetchPrioridades = async () => {
        try {
          const cacheKey = 'prioridades';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setPrioridades(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/prioridades');
          if (!response.ok) throw new Error('Erro ao carregar prioridades');
          
          const data = await response.json();
          setPrioridades(data);
          
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar prioridades:', err);
          setError('Erro ao carregar configurações de prioridade');
        }
      };

      fetchPrioridades();
    }, []);

    const getPrioridadePorNome = (nome: string) => {
      return prioridades.find(p => p.nome === nome);
    };

    const getCoresPrioridade = (nomePrioridade: string) => {
      const prioridade = getPrioridadePorNome(nomePrioridade);
      if (!prioridade) return null;

      return {
        primary: prioridade.corPrimaria,
        background: prioridade.corBackground,
        text: prioridade.corTexto,
        border: prioridade.corBorder,
        icon: prioridade.icone,
      };
    };

    return { prioridades, getPrioridadePorNome, getCoresPrioridade };
  };

  // ========================================
  // CONFIGURAÇÕES DE SISTEMA
  // ========================================
  const useConfiguracoesSistema = () => {
    const [configuracoes, setConfiguracoes] = useState<ConfiguracaoSistema[]>([]);

    useEffect(() => {
      const fetchConfiguracoes = async () => {
        try {
          const cacheKey = 'configuracoes-sistema';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setConfiguracoes(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/sistema');
          if (!response.ok) throw new Error('Erro ao carregar configurações');
          
          const data = await response.json();
          setConfiguracoes(data);
          
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar configurações:', err);
          setError('Erro ao carregar configurações do sistema');
        }
      };

      fetchConfiguracoes();
    }, []);

    const getConfiguracaoPorChave = (chave: string) => {
      return configuracoes.find(c => c.chave === chave)?.valor;
    };

    const getConfiguracoesPorCategoria = (categoria: string) => {
      return configuracoes.filter(c => c.categoria === categoria);
    };

    return { configuracoes, getConfiguracaoPorChave, getConfiguracoesPorCategoria };
  };

  // ========================================
  // CONFIGURAÇÕES DE COMPONENTES
  // ========================================
  const useComponentes = () => {
    const [componentes, setComponentes] = useState<ConfiguracaoComponente[]>([]);

    useEffect(() => {
      const fetchComponentes = async () => {
        try {
          const cacheKey = 'componentes';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setComponentes(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/componentes');
          if (!response.ok) throw new Error('Erro ao carregar componentes');
          
          const data = await response.json();
          setComponentes(data);
          
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar componentes:', err);
          setError('Erro ao carregar configurações de componentes');
        }
      };

      fetchComponentes();
    }, []);

    const getComponentePorNome = (nome: string) => {
      return componentes.find(c => c.nome === nome);
    };

    const getEstilosComponente = (nomeComponente: string) => {
      const componente = getComponentePorNome(nomeComponente);
      if (!componente) return null;

      return {
        borderRadius: componente.borderRadius,
        padding: componente.padding,
        margin: componente.margin,
        fontSize: componente.fontSize,
        fontWeight: componente.fontWeight,
        shadow: componente.shadow,
        transition: componente.transition,
        hoverEffect: componente.hoverEffect,
      };
    };

    return { componentes, getComponentePorNome, getEstilosComponente };
  };

  // ========================================
  // CONFIGURAÇÕES DE LAYOUT
  // ========================================
  const useLayouts = () => {
    const [layouts, setLayouts] = useState<ConfiguracaoLayout[]>([]);

    useEffect(() => {
      const fetchLayouts = async () => {
        try {
          const cacheKey = 'layouts';
          const cached = configCache.get(cacheKey);
          
          if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
            setLayouts(cached.data);
            return;
          }

          const response = await fetch('/api/configuracoes/layouts');
          if (!response.ok) throw new Error('Erro ao carregar layouts');
          
          const data = await response.json();
          setLayouts(data);
          
          configCache.set(cacheKey, {
            data,
            timestamp: Date.now()
          });
        } catch (err) {
          console.error('Erro ao carregar layouts:', err);
          setError('Erro ao carregar configurações de layout');
        }
      };

      fetchLayouts();
    }, []);

    const getLayoutPorNome = (nome: string) => {
      return layouts.find(l => l.nome === nome);
    };

    const getEstilosLayout = (nomeLayout: string) => {
      const layout = getLayoutPorNome(nomeLayout);
      if (!layout) return null;

      return {
        width: layout.largura,
        height: layout.altura,
        minHeight: layout.minHeight,
        maxWidth: layout.maxWidth,
        position: layout.position,
        top: layout.top,
        left: layout.left,
        right: layout.right,
        bottom: layout.bottom,
        padding: layout.padding,
        margin: layout.margin,
        gap: layout.gap,
        background: layout.background,
        border: layout.border,
        borderRadius: layout.borderRadius,
        boxShadow: layout.shadow,
      };
    };

    return { layouts, getLayoutPorNome, getEstilosLayout };
  };

  // Hook principal que retorna todos os hooks
  return {
    loading,
    error,
    usePerfis,
    useStatus,
    usePrioridades,
    useConfiguracoesSistema,
    useComponentes,
    useLayouts,
  };
};

export default useConfiguracoes;
