// 🎯 SERVIÇO DE CONFIGURAÇÃO CENTRALIZADA
// Este serviço elimina hardcoded das APIs e componentes

import { PrismaClient } from '@prisma/client';
import { loadSystemConfig, getSystemConfig } from '../config/centralized-config';

const prisma = new PrismaClient();

// ========================================
// CONFIGURAÇÕES DE SISTEMA
// ========================================

export interface SystemConfigService {
  // Cores
  getColors(): Promise<{
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  }>;
  
  // Tipografia
  getTypography(): Promise<{
    fontFamily: string;
    fontSize: Record<string, string>;
    fontWeight: Record<string, number>;
  }>;
  
  // URLs
  getUrls(): Promise<{
    api: string;
    esocial: {
      homologacao: string;
      producao: string;
    };
    geocoding: {
      nominatim: string;
      opencage: string;
      bigdatacloud: string;
      positionstack: string;
    };
  }>;
  
  // Geolocalização
  getGeolocationConfig(): Promise<{
    maxDistance: number;
    accuracyThreshold: number;
    timeout: number;
  }>;
  
  // Antifraude
  getAntifraudConfig(): Promise<{
    maxAttempts: number;
    lockoutDuration: number;
    riskThreshold: number;
  }>;
}

// ========================================
// IMPLEMENTAÇÃO DO SERVIÇO
// ========================================

class ConfigService implements SystemConfigService {
  
  async getColors() {
    const config = await loadSystemConfig();
    return config.colors;
  }
  
  async getTypography() {
    const config = await loadSystemConfig();
    return config.typography;
  }
  
  async getUrls() {
    const config = await loadSystemConfig();
    return config.urls;
  }
  
  async getGeolocationConfig() {
    const config = await loadSystemConfig();
    return config.geolocation;
  }
  
  async getAntifraudConfig() {
    const config = await loadSystemConfig();
    return config.antifraud;
  }
}

// ========================================
// FUNÇÕES UTILITÁRIAS
// ========================================

/**
 * Obtém configuração específica por chave
 */
export async function getConfigValue(chave: string): Promise<any> {
  try {
    const config = await getSystemConfig(chave);
    return config;
  } catch (error) {
    console.error(`Erro ao obter configuração ${chave}:`, error);
    return null;
  }
}

/**
 * Obtém configuração de geolocalização para usuário específico
 */
export async function getGeolocationConfigForUser(usuarioId: string): Promise<{
  maxDistance: number;
  accuracyThreshold: number;
  timeout: number;
}> {
  try {
    // Buscar configuração específica do usuário
    const userConfig = await prisma.configuracaoGeolocalizacao.findFirst({
      where: {
        usuarioId,
        chave: 'geolocation_config',
        ativo: true
      }
    });

    if (userConfig) {
      return JSON.parse(userConfig.valor);
    }

    // Buscar configuração do grupo do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { gruposUsuario: { include: { grupo: true } } }
    });

    if (usuario && usuario.gruposUsuario.length > 0) {
      const grupoId = usuario.gruposUsuario[0].grupoId;
      
      const groupConfig = await prisma.configuracaoGeolocalizacao.findFirst({
        where: {
          grupoId,
          chave: 'geolocation_config',
          ativo: true
        }
      });

      if (groupConfig) {
        return JSON.parse(groupConfig.valor);
      }
    }

    // Retornar configuração padrão do sistema
    const systemConfig = await loadSystemConfig();
    return systemConfig.geolocation;
  } catch (error) {
    console.error('Erro ao obter configuração de geolocalização:', error);
    return {
      maxDistance: 200,
      accuracyThreshold: 100,
      timeout: 10000
    };
  }
}

/**
 * Obtém configuração de antifraude para usuário específico
 */
export async function getAntifraudConfigForUser(usuarioId: string): Promise<{
  maxAttempts: number;
  lockoutDuration: number;
  riskThreshold: number;
}> {
  try {
    // Buscar configuração específica do usuário
    const userConfig = await prisma.configuracaoAntifraude.findFirst({
      where: {
        usuarioId,
        chave: 'antifraud_config',
        ativo: true
      }
    });

    if (userConfig) {
      return JSON.parse(userConfig.valor);
    }

    // Buscar configuração do grupo do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { gruposUsuario: { include: { grupo: true } } }
    });

    if (usuario && usuario.gruposUsuario.length > 0) {
      const grupoId = usuario.gruposUsuario[0].grupoId;
      
      const groupConfig = await prisma.configuracaoAntifraude.findFirst({
        where: {
          grupoId,
          chave: 'antifraud_config',
          ativo: true
        }
      });

      if (groupConfig) {
        return JSON.parse(groupConfig.valor);
      }
    }

    // Retornar configuração padrão do sistema
    const systemConfig = await loadSystemConfig();
    return systemConfig.antifraud;
  } catch (error) {
    console.error('Erro ao obter configuração de antifraude:', error);
    return {
      maxAttempts: 3,
      lockoutDuration: 300000,
      riskThreshold: 0.7
    };
  }
}

/**
 * Obtém configuração de cores por perfil
 */
export async function getColorsForProfile(perfilCodigo: string): Promise<{
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}> {
  try {
    // Buscar configuração específica do perfil
    const perfil = await prisma.perfil.findUnique({
      where: { codigo: perfilCodigo.toUpperCase() }
    });

    if (perfil) {
      const profileConfig = await prisma.configuracaoPerfil.findFirst({
        where: {
          perfilId: perfil.id,
          chave: 'colors',
          ativo: true
        }
      });

      if (profileConfig) {
        return JSON.parse(profileConfig.valor);
      }
    }

    // Retornar configuração padrão do sistema
    const systemConfig = await loadSystemConfig();
    return systemConfig.colors;
  } catch (error) {
    console.error('Erro ao obter configuração de cores:', error);
    return {
      primary: '#29ABE2',
      secondary: '#90EE90',
      success: '#10B981',
      warning: '#F59E0B',
      error: '#EF4444',
      info: '#3B82F6'
    };
  }
}

/**
 * Obtém ID do usuário atual (substitui mockUserId)
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    // TODO: Implementar autenticação adequada
    // Por enquanto, retorna o ID do usuário do seed
    const usuario = await prisma.usuario.findFirst({
      where: { cpf: '59876913700' }
    });

    return usuario?.id || null;
  } catch (error) {
    console.error('Erro ao obter ID do usuário atual:', error);
    return null;
  }
}

/**
 * Obtém configuração de URLs de geocoding
 */
export async function getGeocodingUrls(): Promise<{
  nominatim: string;
  opencage: string;
  bigdatacloud: string;
  positionstack: string;
}> {
  try {
    const config = await loadSystemConfig();
    return config.urls.geocoding;
  } catch (error) {
    console.error('Erro ao obter URLs de geocoding:', error);
    return {
      nominatim: 'https://nominatim.openstreetmap.org/reverse',
      opencage: 'https://api.opencagedata.com/geocode/v1/json',
      bigdatacloud: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
      positionstack: 'https://api.positionstack.com/v1/reverse'
    };
  }
}

// ========================================
// EXPORTAR SERVIÇO
// ========================================

export const configService = new ConfigService();
export default configService;