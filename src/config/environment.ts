// Configuração de Ambiente para o Sistema DOM
// Gerencia variáveis de ambiente e configurações de produção

export interface EnvironmentConfig {
  // Configurações da API
  api: {
    baseUrl: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };

  // Configurações do eSocial
  esocial: {
    ambiente: 'producao' | 'teste';
    versao: string;
    timeout: number;
    maxRetries: number;
  };

  // Configurações de segurança
  security: {
    encryptionKey: string;
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
  };

  // Configurações de backup
  backup: {
    enabled: boolean;
    frequency: 'diario' | 'semanal' | 'mensal';
    retention: number;
    compression: boolean;
    encryption: boolean;
  };

  // Configurações de notificações
  notifications: {
    email: {
      enabled: boolean;
      smtp: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        password: string;
      };
    };
    push: {
      enabled: boolean;
      vapidKey: string;
    };
  };

  // Configurações de monitoramento
  monitoring: {
    enabled: boolean;
    metricsInterval: number;
    alertThresholds: {
      cpu: number;
      memory: number;
      disk: number;
      responseTime: number;
    };
  };

  // Configurações de logs
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    maxFiles: number;
    maxSize: string;
    retention: number;
  };
}

class EnvironmentManager {
  private config: EnvironmentConfig;
  private isProduction: boolean;

  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.config = this.loadConfiguration();
  }

  // Carregar configuração baseada no ambiente
  private loadConfiguration(): EnvironmentConfig {
    const baseConfig: EnvironmentConfig = {
      api: {
        baseUrl: this.getEnvVar(
          'API_BASE_URL',
          process.env.NODE_ENV === 'production' 
            ? 'https://api.dom-esocial.com.br/v1' 
            : 'http://localhost:3000/api'
        ),
        timeout: parseInt(this.getEnvVar('API_TIMEOUT', '30000')),
        retryAttempts: parseInt(this.getEnvVar('API_RETRY_ATTEMPTS', '3')),
        retryDelay: parseInt(this.getEnvVar('API_RETRY_DELAY', '5000')),
      },

      esocial: {
        ambiente: this.getEnvVar('ESOCIAL_AMBIENTE', 'teste') as
          | 'producao'
          | 'teste',
        versao: this.getEnvVar('ESOCIAL_VERSAO', '2.5.0'),
        timeout: parseInt(this.getEnvVar('ESOCIAL_TIMEOUT', '60000')),
        maxRetries: parseInt(this.getEnvVar('ESOCIAL_MAX_RETRIES', '3')),
      },

      security: {
        encryptionKey: this.getEnvVar(
          'ENCRYPTION_KEY',
          this.generateDefaultKey()
        ),
        sessionTimeout: parseInt(this.getEnvVar('SESSION_TIMEOUT', '3600000')),
        maxLoginAttempts: parseInt(this.getEnvVar('MAX_LOGIN_ATTEMPTS', '5')),
        lockoutDuration: parseInt(this.getEnvVar('LOCKOUT_DURATION', '900000')),
      },

      backup: {
        enabled: this.getEnvVar('BACKUP_ENABLED', 'true') === 'true',
        frequency: this.getEnvVar('BACKUP_FREQUENCY', 'diario') as
          | 'diario'
          | 'semanal'
          | 'mensal',
        retention: parseInt(this.getEnvVar('BACKUP_RETENTION', '30')),
        compression: this.getEnvVar('BACKUP_COMPRESSION', 'true') === 'true',
        encryption: this.getEnvVar('BACKUP_ENCRYPTION', 'true') === 'true',
      },

      notifications: {
        email: {
          enabled: this.getEnvVar('EMAIL_ENABLED', 'true') === 'true',
          smtp: {
            host: this.getEnvVar('SMTP_HOST', process.env.SMTP_HOST || ''),
            port: parseInt(this.getEnvVar('SMTP_PORT', '587')),
            secure: this.getEnvVar('SMTP_SECURE', 'false') === 'true',
            user: this.getEnvVar('SMTP_USER', process.env.SMTP_USER || ''),
            password: this.getEnvVar('SMTP_PASSWORD', process.env.SMTP_PASSWORD || ''),
          },
        },
        push: {
          enabled: this.getEnvVar('PUSH_ENABLED', 'true') === 'true',
          vapidKey: this.getEnvVar('VAPID_KEY', ''),
        },
      },

      monitoring: {
        enabled: this.getEnvVar('MONITORING_ENABLED', 'true') === 'true',
        metricsInterval: parseInt(this.getEnvVar('METRICS_INTERVAL', '60000')),
        alertThresholds: {
          cpu: parseFloat(this.getEnvVar('CPU_THRESHOLD', '80')),
          memory: parseFloat(this.getEnvVar('MEMORY_THRESHOLD', '85')),
          disk: parseFloat(this.getEnvVar('DISK_THRESHOLD', '90')),
          responseTime: parseFloat(
            this.getEnvVar('RESPONSE_TIME_THRESHOLD', '5000')
          ),
        },
      },

      logging: {
        level: this.getEnvVar('LOG_LEVEL', 'info') as
          | 'debug'
          | 'info'
          | 'warn'
          | 'error',
        maxFiles: parseInt(this.getEnvVar('LOG_MAX_FILES', '10')),
        maxSize: this.getEnvVar('LOG_MAX_SIZE', '10MB'),
        retention: parseInt(this.getEnvVar('LOG_RETENTION', '30')),
      },
    };

    return baseConfig;
  }

  // Obter variável de ambiente com valor padrão
  private getEnvVar(key: string, defaultValue: string): string {
    if (typeof window !== 'undefined') {
      // No cliente, usar localStorage ou valores padrão
      return localStorage.getItem(`env_${key}`) || defaultValue;
    }

    // No servidor, usar process.env
    return process.env[key] || defaultValue;
  }

  // Gerar chave de criptografia padrão (apenas para desenvolvimento)
  private generateDefaultKey(): string {
    if (this.isProduction) {
      throw new Error('ENCRYPTION_KEY deve ser definida em produção');
    }
    return 'default-dev-key-not-for-production';
  }

  // Obter configuração completa
  getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  // Obter configuração específica
  getConfigSection<T extends keyof EnvironmentConfig>(
    section: T
  ): EnvironmentConfig[T] {
    return this.config[section];
  }

  // Verificar se está em produção
  isProductionEnvironment(): boolean {
    return this.isProduction;
  }

  // Verificar se está em desenvolvimento
  isDevelopmentEnvironment(): boolean {
    return !this.isProduction;
  }

  // Validar configuração
  validateConfiguration(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar configurações críticas para produção
    if (this.isProduction) {
      if (
        this.config.security.encryptionKey ===
        'default-dev-key-not-for-production'
      ) {
        errors.push('ENCRYPTION_KEY deve ser definida em produção');
      }

      if (this.config.esocial.ambiente === 'teste') {
        errors.push('ESOCIAL_AMBIENTE deve ser "producao" em produção');
      }

      if (
        !this.config.notifications.email.smtp.user ||
        !this.config.notifications.email.smtp.password
      ) {
        errors.push('Configurações de SMTP devem ser definidas em produção');
      }

      if (!this.config.notifications.push.vapidKey) {
        errors.push(
          'VAPID_KEY deve ser definida para notificações push em produção'
        );
      }
    }

    // Validar configurações gerais
    if (this.config.api.timeout < 1000) {
      errors.push('API timeout deve ser pelo menos 1000ms');
    }

    if (this.config.security.sessionTimeout < 300000) {
      errors.push('Session timeout deve ser pelo menos 5 minutos');
    }

    if (this.config.backup.retention < 7) {
      errors.push('Backup retention deve ser pelo menos 7 dias');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  // Atualizar configuração
  updateConfiguration(updates: Partial<EnvironmentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.saveConfiguration();
  }

  // Salvar configuração no localStorage (cliente)
  private saveConfiguration(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'dom_environment_config',
        JSON.stringify(this.config)
      );
    }
  }

  // Carregar configuração do localStorage (cliente)
  loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dom_environment_config');
      if (stored) {
        try {
          const parsedConfig = JSON.parse(stored);
          this.config = { ...this.config, ...parsedConfig };
        } catch (error) {
          // console.warn('Erro ao carregar configuração do localStorage:', error);
        }
      }
    }
  }

  // Resetar para configuração padrão
  resetToDefault(): void {
    this.config = this.loadConfiguration();
    this.saveConfiguration();
  }

  // Obter informações do ambiente
  getEnvironmentInfo(): {
    nodeEnv: string;
    isProduction: boolean;
    timestamp: string;
    userAgent: string;
    version: string;
  } {
    return {
      nodeEnv: process.env.NODE_ENV || 'development',
      isProduction: this.isProduction,
      timestamp: new Date().toISOString(),
      userAgent:
        typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
      version: process.env['npm_package_version'] || '1.0.0',
    };
  }
}

// Instância singleton
let environmentManagerInstance: EnvironmentManager | null = null;

export const getEnvironmentManager = (): EnvironmentManager => {
  if (!environmentManagerInstance) {
    environmentManagerInstance = new EnvironmentManager();
  }
  return environmentManagerInstance;
};

export default EnvironmentManager;
