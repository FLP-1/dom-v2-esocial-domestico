/**
 * 🔧 Serviço de Configuração Dinâmica
 * 
 * Este serviço substitui todos os hardcoded por configurações dinâmicas do banco
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ConfigValue {
  valor: string;
  tipo: string;
  obrigatorio: boolean;
}

interface ConfiguracaoEmpresa {
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  razaoSocial?: string;
  cnpj?: string;
}

class ConfigService {
  private static instance: ConfigService;
  private cache: Map<string, ConfigValue> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutos
  private lastCacheUpdate: number = 0;

  private constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  /**
   * Obtém uma configuração do sistema
   */
  public async getConfig(chave: string, empresaId?: string): Promise<string> {
    await this.updateCacheIfNeeded();

    const cacheKey = empresaId ? `${chave}_${empresaId}` : chave;
    const cached = this.cache.get(cacheKey);
    
    if (cached) {
      return this.convertValue(cached.valor, cached.tipo);
    }

    // Buscar no banco se não estiver no cache
    const config = await prisma.configuracaoSistema.findFirst({
      where: {
        chave,
        ...(empresaId && { empresaId })
      }
    });

    if (!config) {
      throw new Error(`Configuração '${chave}' não encontrada`);
    }

    // Adicionar ao cache
    this.cache.set(cacheKey, {
      valor: config.valor,
      tipo: config.tipo,
      obrigatorio: config.obrigatorio
    });

    return this.convertValue(config.valor, config.tipo);
  }

  /**
   * Obtém configurações da empresa
   */
  public async getEmpresaConfig(): Promise<ConfiguracaoEmpresa> {
    const cpf = await this.getConfig('empresa_cpf_principal');
    const nome = await this.getConfig('empresa_nome');
    const email = await this.getConfig('empresa_email');
    const telefone = await this.getConfig('empresa_telefone');

    return {
      cpf,
      nome,
      email,
      telefone
    };
  }

  /**
   * Obtém URL base do sistema
   */
  public async getBaseUrl(): Promise<string> {
    return await this.getConfig('sistema_url_base');
  }

  /**
   * Obtém configuração de geolocalização
   */
  public async getGeocodingPrecision(): Promise<number> {
    const precision = await this.getConfig('geocoding_precisao_casas');
    return parseInt(precision);
  }

  /**
   * Obtém tempo de sessão
   */
  public async getSessionTimeout(): Promise<number> {
    const timeout = await this.getConfig('autenticacao_tempo_sessao');
    return parseInt(timeout);
  }

  /**
   * Obtém ambiente do eSocial
   */
  public async getESocialEnvironment(): Promise<'homologacao' | 'producao'> {
    const env = await this.getConfig('esocial_ambiente_padrao');
    return env as 'homologacao' | 'producao';
  }

  /**
   * Obtém senha padrão do sistema
   */
  public async getDefaultPassword(): Promise<string> {
    try {
      return await this.getConfig('sistema_senha_padrao');
    } catch (error) {
      // Fallback para senha padrão se não configurada
      return 'senha123';
    }
  }

  /**
   * Obtém razão social da empresa
   */
  public async getRazaoSocial(): Promise<string> {
    try {
      return await this.getConfig('empresa_razao_social');
    } catch (error) {
      return 'Empresa';
    }
  }

  /**
   * Obtém CNPJ da empresa
   */
  public async getCnpj(): Promise<string> {
    try {
      return await this.getConfig('empresa_cnpj');
    } catch (error) {
      return '';
    }
  }

  /**
   * Obtém precisão máxima aceitável para geolocalização
   */
  public async getGeolocationMaxAccuracy(): Promise<number> {
    try {
      return parseInt(await this.getConfig('geolocalizacao_precisao_maxima'));
    } catch (error) {
      return 20; // Fallback para 20 metros
    }
  }

  /**
   * Obtém timeout para geolocalização
   */
  public async getGeolocationTimeout(): Promise<number> {
    try {
      return parseInt(await this.getConfig('geolocalizacao_timeout'));
    } catch (error) {
      return 30000; // Fallback para 30 segundos
    }
  }

  /**
   * Define uma configuração
   */
  public async setConfig(
    chave: string, 
    valor: string, 
    categoria: string = 'sistema',
    tipo: string = 'string',
    empresaId?: string
  ): Promise<void> {
    await prisma.configuracaoSistema.upsert({
      where: { chave },
      update: { valor, categoria, tipo, empresaId },
      create: {
        chave,
        valor,
        categoria,
        tipo,
        empresaId,
        descricao: `Configuração ${categoria}`,
        obrigatorio: false,
        visivel: true,
        editavel: true
      }
    });

    // Limpar cache
    this.clearCache();
  }

  /**
   * Obtém usuário atual do contexto de autenticação
   */
  public async getCurrentUserId(): Promise<string> {
    // Obter CPF da empresa das configurações
    const empresaCpf = await this.getConfig('empresa_cpf_principal');
    
    const usuario = await prisma.usuario.findFirst({
      where: { cpf: empresaCpf }
    });

    if (!usuario) {
      throw new Error(`Usuário com CPF ${empresaCpf} não encontrado`);
    }

    return usuario.id;
  }

  /**
   * Verifica se um usuário existe e está ativo
   */
  public async validateUser(userId: string): Promise<boolean> {
    const usuario = await prisma.usuario.findFirst({
      where: {
        id: userId,
        ativo: true
      }
    });

    return !!usuario;
  }

  /**
   * Obtém dados de um usuário por CPF
   */
  public async getUserByCpf(cpf: string) {
    return await prisma.usuario.findUnique({
      where: { cpf },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        }
      }
    });
  }

  /**
   * Converte valor baseado no tipo
   */
  private convertValue(valor: string, tipo: string): string {
    switch (tipo) {
      case 'number':
        return valor;
      case 'boolean':
        return valor.toLowerCase() === 'true' ? 'true' : 'false';
      case 'json':
        try {
          JSON.parse(valor);
          return valor;
        } catch {
          return '{}';
        }
      default:
        return valor;
    }
  }

  /**
   * Atualiza cache se necessário
   */
  private async updateCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    if (now - this.lastCacheUpdate > this.cacheExpiry) {
      this.clearCache();
      this.lastCacheUpdate = now;
    }
  }

  /**
   * Limpa o cache
   */
  private clearCache(): void {
    this.cache.clear();
  }

  /**
   * Força atualização do cache
   */
  public async refreshCache(): Promise<void> {
    this.clearCache();
    this.lastCacheUpdate = 0;
    await this.updateCacheIfNeeded();
  }
}

// Instância singleton
export const configService = ConfigService.getInstance();

// Funções de conveniência
export const getConfig = (chave: string, empresaId?: string) => 
  configService.getConfig(chave, empresaId);

export const getEmpresaConfig = () => 
  configService.getEmpresaConfig();

export const getBaseUrl = () => 
  configService.getBaseUrl();

export const getCurrentUserId = () => 
  configService.getCurrentUserId();

export const getUserByCpf = (cpf: string) => 
  configService.getUserByCpf(cpf);

export const validateUser = (userId: string) => 
  configService.validateUser(userId);

export const getDefaultPassword = () => 
  configService.getDefaultPassword();

export const getRazaoSocial = () => 
  configService.getRazaoSocial();

export const getCnpj = () => 
  configService.getCnpj();

export const getGeolocationMaxAccuracy = () => 
  configService.getGeolocationMaxAccuracy();

export const getGeolocationTimeout = () => 
  configService.getGeolocationTimeout();

export default configService;
