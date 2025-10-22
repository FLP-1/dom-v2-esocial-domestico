import prisma from '@/lib/prisma';

export type ConfigType = 'string' | 'number' | 'boolean' | 'json';
export type ConfigCategory = 'documento' | 'usuario' | 'sistema' | 'empresa';

interface ConfigValue {
  string: string;
  number: number;
  boolean: boolean;
  json: any;
}

/**
 * Serviço para gerenciar configurações dinâmicas do sistema
 * Substitui hardcoded por valores configuráveis
 */
export class DynamicConfigService {
  private cache = new Map<string, any>();
  private cacheExpiry = new Map<string, number>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtém uma configuração do banco de dados
   */
  async getConfig<T extends ConfigType>(
    key: string, 
    type: T,
    defaultValue?: ConfigValue[T]
  ): Promise<ConfigValue[T]> {
    // Verificar cache primeiro
    const cached = this.getFromCache(key);
    if (cached !== null) {
      return this.castValue(cached, type);
    }

    try {
      const config = await prisma.configuracaoSistema.findUnique({
        where: { 
          chave: key
        }
      });

      if (!config) {
        if (defaultValue !== undefined) {
          return defaultValue;
        }
        throw new Error(`Configuração '${key}' não encontrada e sem valor padrão`);
      }

      const value = this.parseValue(config.valor, type);
      
      // Armazenar no cache
      this.setCache(key, value);
      
      return value;
    } catch (error) {
      console.error(`Erro ao buscar configuração '${key}':`, error);
      if (defaultValue !== undefined) {
        return defaultValue;
      }
      throw error;
    }
  }

  /**
   * Define uma configuração no banco de dados
   */
  async setConfig(
    key: string,
    value: any,
    category: ConfigCategory = 'sistema',
    description?: string
  ): Promise<void> {
    try {
      const configValue = typeof value === 'string' ? value : JSON.stringify(value);
      const configType = typeof value === 'object' ? 'json' : typeof value as ConfigType;

      await prisma.configuracaoSistema.upsert({
        where: { chave: key },
        update: {
          valor: configValue,
          tipo: configType,
          categoria: category,
          descricao: description,
          atualizadoEm: new Date()
        },
        create: {
          chave: key,
          valor: configValue,
          tipo: configType,
          categoria: category,
          descricao: description
        }
      });

      // Limpar cache
      this.clearCache(key);
      
    } catch (error) {
      console.error(`Erro ao definir configuração '${key}':`, error);
      throw error;
    }
  }

  /**
   * Obtém todas as configurações de uma categoria
   */
  async getConfigsByCategory(category: ConfigCategory): Promise<Record<string, any>> {
    try {
      const configs = await prisma.configuracaoSistema.findMany({
        where: { 
          categoria: category
        }
      });

      const result: Record<string, any> = {};
      for (const config of configs) {
        result[config.chave] = this.parseValue(config.valor, config.tipo as ConfigType);
      }

      return result;
    } catch (error) {
      console.error(`Erro ao buscar configurações da categoria '${category}':`, error);
      return {};
    }
  }

  /**
   * Limpa todo o cache
   */
  clearAllCache(): void {
    this.cache.clear();
    this.cacheExpiry.clear();
  }

  private getFromCache(key: string): any | null {
    const expiry = this.cacheExpiry.get(key);
    if (!expiry || Date.now() > expiry) {
      this.cache.delete(key);
      this.cacheExpiry.delete(key);
      return null;
    }
    return this.cache.get(key) || null;
  }

  private setCache(key: string, value: any): void {
    this.cache.set(key, value);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_TTL);
  }

  private clearCache(key: string): void {
    this.cache.delete(key);
    this.cacheExpiry.delete(key);
  }

  private parseValue(value: string, type: ConfigType): any {
    switch (type) {
      case 'number':
        const num = parseFloat(value);
        if (isNaN(num)) throw new Error(`Valor '${value}' não é um número válido`);
        return num;
      case 'boolean':
        return value.toLowerCase() === 'true';
      case 'json':
        try {
          return JSON.parse(value);
        } catch {
          throw new Error(`Valor '${value}' não é um JSON válido`);
        }
      case 'string':
      default:
        return value;
    }
  }

  private castValue(value: any, type: ConfigType): ConfigValue[ConfigType] {
    return this.parseValue(typeof value === 'string' ? value : JSON.stringify(value), type);
  }
}

// Instância singleton
export const dynamicConfig = new DynamicConfigService();
