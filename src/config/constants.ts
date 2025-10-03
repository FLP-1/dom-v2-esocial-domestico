/**
 * 📋 Constantes Centralizadas - DOM v2.2.0
 *
 * Este arquivo centraliza todas as constantes do sistema.
 */

// Configurações dinâmicas de certificados
export const getCertificateConfig = () => ({
  ECPF: {
    FILE_NAME: process.env.CERTIFICATE_FILE_NAME || '',
    PASSWORD: process.env.CERTIFICATE_PASSWORD || '',
    CPF: process.env.CERTIFICATE_CPF || '',
    TYPE: process.env.CERTIFICATE_TYPE || 'A1',
  },
});

// Configurações padrão (apenas para desenvolvimento)
export const CERTIFICATE_CONSTANTS = {
  ECPF: {
    FILE_NAME: process.env.CERTIFICATE_FILE_NAME || '',
    PASSWORD: process.env.CERTIFICATE_PASSWORD || '',
    CPF: process.env.CERTIFICATE_CPF || '',
    TYPE: process.env.CERTIFICATE_TYPE || 'A1',
  },
} as const;

// 🌐 URLs eSocial
export const ESOCIAL_CONSTANTS = {
  BASE_URL: 'https://webservices.producaorestrita.esocial.gov.br',
  ENDPOINTS: {
    CONSULTA_CADASTRO: '/consultacadastro/ConsultaCadastro.svc',
    ENVIAR_LOTE:
      '/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    CONSULTAR_LOTE: '/consultaloteeventos/ConsultaLoteEventos.svc',
    STATUS_EVENTOS: '/consstatuseventos/ConsStatusEventos.svc',
    RECEBIMENTO: '/consrecibo/ConsRecebimentoEventos.svc',
  },
  WSDL: {
    CONSULTA_CADASTRO: '/consultacadastro/ConsultaCadastro.svc?wsdl',
    ENVIAR_LOTE:
      '/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
    CONSULTAR_LOTE: '/consultaloteeventos/ConsultaLoteEventos.svc?wsdl',
    STATUS_EVENTOS: '/consstatuseventos/ConsStatusEventos.svc?wsdl',
    RECEBIMENTO: '/consrecibo/ConsRecebimentoEventos.svc?wsdl',
  },
} as const;

// 🌐 URLs eSocial Doméstico - S-1.3
export const ESOCIAL_DOMESTICO_CONSTANTS = {
  PRODUCAO: {
    ENVIO: {
      WSDL: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
      ENDPOINT:
        'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    },
    CONSULTA: {
      LOTE_EVENTOS:
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      QUALIFICACAO_CADASTRAL:
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarqualificacaocadastral/WsConsultarQualificacaoCadastral.svc',
      EVENTOS:
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc',
      IDENTIFICADOR:
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadoreventos/WsConsultarIdentificadorEventos.svc',
    },
  },
  HOMOLOGACAO: {
    ENVIO: {
      WSDL: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
      ENDPOINT:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    },
    CONSULTA: {
      LOTE_EVENTOS:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      QUALIFICACAO_CADASTRAL:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarqualificacaocadastral/WsConsultarQualificacaoCadastral.svc',
      EVENTOS:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc',
      IDENTIFICADOR:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultaridentificadoreventos/WsConsultarIdentificadorEventos.svc',
    },
  },
} as const;

// 📱 Twilio
export const TWILIO_CONSTANTS = {
  ACCOUNT_SID: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  AUTH_TOKEN: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
  PHONE_NUMBER: '+12183668060',
} as const;

// 📧 Email
export const EMAIL_CONSTANTS = {
  SENDGRID: {
    API_KEY: process.env.SENDGRID_API_KEY || '',
    FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || '',
  },
  TWILIO: {
    EMAIL_SID: process.env.TWILIO_EMAIL_SID || '',
    EMAIL_TOKEN: process.env.TWILIO_EMAIL_TOKEN || '',
  },
} as const;

// 🌍 Ambiente
export const ENVIRONMENT_CONSTANTS = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
} as const;

// 🔧 Configurações de Sistema
export const SYSTEM_CONSTANTS = {
  VERSION: '2.2.0',
  NAME: 'DOM',
  DESCRIPTION: 'Sistema de Gestão Empresarial',
  AUTHOR: 'Equipe DOM',
} as const;

// 📊 Configurações de API
export const API_CONSTANTS = {
  TIMEOUT: 30000, // 30 segundos
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 segundo
} as const;

// 🛡️ Configurações de Segurança
export const SECURITY_CONSTANTS = {
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key',
  SESSION_TIMEOUT: 3600000, // 1 hora
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutos
} as const;

// 📁 Caminhos de Arquivos
export const FILE_PATHS = {
  CERTIFICATES: 'certificados/',
  UPLOADS: 'uploads/',
  TEMP: 'temp/',
  LOGS: 'logs/',
} as const;

// 🎨 Configurações de UI
export const UI_CONSTANTS = {
  THEME: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#6B7280',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
  },
  BREAKPOINTS: {
    MOBILE: '768px',
    TABLET: '1024px',
    DESKTOP: '1280px',
  },
} as const;

// 🌐 URLs de APIs Externas
export const EXTERNAL_API_CONSTANTS = {
  VIACEP: {
    BASE_URL: 'https://viacep.com.br/ws',
    ENDPOINT: '/json/',
  },
} as const;

// 📝 Textos e Placeholders
export const TEXT_CONSTANTS = {
  PLACEHOLDERS: {
    SHOPPING_LIST_NAME: 'Ex: Compras da semana',
    SEARCH_SHOPPING_LIST: 'Digite o nome da lista...',
    ADD_ITEM: 'Adicionar novo item...',
    SELECT_CATEGORY: 'Selecionar categoria',
    ALL_CATEGORIES: 'Todas as categorias',
    ALL_LISTS: 'Todas as listas',
    COMPLETED_LISTS: 'Listas completas',
    WEBSITE_PLACEHOLDER: 'https://www.exemplo.com',
  },
  MESSAGES: {
    NO_LISTS_FOUND: 'Nenhuma lista encontrada',
    CREATE_FIRST_LIST:
      'Crie sua primeira lista de compras para começar a organizar suas',
    TOTAL_ITEMS: 'Total',
    BOUGHT_ITEMS: 'Comprados',
    PROGRESS: 'Progresso',
  },
  EMPTY_STATES: {
    SHOPPING_CART_EMOJI: '🛍',
    SHOPPING_CART_LABEL: 'Carrinho',
  },
} as const;

// 🔧 Configurações de Log
export const LOG_CONSTANTS = {
  LEVELS: {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
  },
  PREFIXES: {
    SUCCESS: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
    INFO: 'ℹ️',
    DEBUG: '🔍',
  },
} as const;

// 📊 Dados Simulados para eSocial - Centralizados
export const ESOCIAL_SIMULATED_DATA = {
  EMPREGADOS: [],
  EVENTOS: [],
} as const;

// 🎯 Configurações de Diagnóstico
export const DIAGNOSTIC_CONSTANTS = {
  ESOCIAL_URLS: {
    HOMOLOGACAO: {
      WSDL: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
      ENDPOINT:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos',
      CONSULTA:
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos',
    },
    PRODUCAO: {
      WSDL: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.wsdl',
      ENDPOINT:
        'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      CONSULTA:
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.svc',
    },
  },
} as const;
