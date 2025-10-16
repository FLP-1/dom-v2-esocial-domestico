/**
 * 🔧 Configurações Centralizadas do Sistema
 * 
 * Este arquivo centraliza todas as configurações do sistema,
 * eliminando dados hardcoded e permitindo fácil manutenção.
 */

export const SYSTEM_CONFIG = {
  // Informações do Sistema
  SYSTEM_NAME: 'Sistema DOM',
  SYSTEM_VERSION: '2.2.1',
  SYSTEM_DESCRIPTION: 'Sistema de Gestão Doméstica Completa',
  
  // Configurações de Geolocalização
  GEOLOCATION: {
    MAX_ACCURACY: 100, // metros
    MAX_AGE_SECONDS: 300, // 5 minutos
    TIMEOUT: 10000, // 10 segundos
    ENABLE_HIGH_ACCURACY: true
  },
  
  // APIs de Geocodificação
  GEOCODING: {
    PRIMARY: 'free_apis', // Sistema de APIs gratuitas
    FALLBACK: 'nominatim',
    ALTERNATIVE: 'google_maps', // Se tiver budget
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3
  },
  
  // Configurações de Antifraude
  ANTIFRAUDE: {
    ENABLED: true,
    RISK_THRESHOLD: 50,
    CONFIDENCE_THRESHOLD: 80,
    MAX_ANOMALIES: 3
  },
  
  // Configurações de Notificações
  NOTIFICATIONS: {
    ENABLED: true,
    EMAIL_ENABLED: true,
    SMS_ENABLED: true,
    PUSH_ENABLED: true
  },
  
  // Configurações de Sessão
  SESSION: {
    TIMEOUT_MINUTES: 30,
    MAX_CONCURRENT_SESSIONS: 3,
    ENABLE_REMEMBER_ME: true
  },
  
  // Configurações de Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
    MAX_FILES_PER_UPLOAD: 5
  },
  
  // Configurações de Backup
  BACKUP: {
    ENABLED: true,
    INTERVAL_HOURS: 24,
    RETENTION_DAYS: 30,
    COMPRESS: true
  }
};

// Configurações específicas por ambiente
export const ENV_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL,
    DEBUG: true,
    LOG_LEVEL: 'debug'
  },
  production: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.dom.com',
    DATABASE_URL: process.env.DATABASE_URL,
    DEBUG: false,
    LOG_LEVEL: 'error'
  },
  test: {
    API_BASE_URL: 'http://localhost:3000',
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    DEBUG: true,
    LOG_LEVEL: 'debug'
  }
};

// Configurações de APIs Externas
export const EXTERNAL_APIS = {
  // APIs PAGAS (se tiver budget)
  GOOGLE_MAPS: {
    BASE_URL: 'https://maps.googleapis.com/maps/api/geocode',
    API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    TIMEOUT: 10000,
    LANGUAGE: 'pt-BR',
    REGION: 'BR'
  },
  
  // APIs GRATUITAS (sem budget)
  OPENCAGE: {
    BASE_URL: 'https://api.opencagedata.com/geocode/v1/json',
    API_KEY: process.env.NEXT_PUBLIC_OPENCAGE_API_KEY,
    TIMEOUT: 10000,
    LIMIT: '2.500 req/dia grátis'
  },
  BIGDATACLOUD: {
    BASE_URL: 'https://api.bigdatacloud.net/data/reverse-geocode-client',
    TIMEOUT: 10000,
    LIMIT: 'Ilimitado e gratuito'
  },
  POSITIONSTACK: {
    BASE_URL: 'http://api.positionstack.com/v1/reverse',
    API_KEY: process.env.NEXT_PUBLIC_POSITIONSTACK_API_KEY,
    TIMEOUT: 10000,
    LIMIT: '10.000 req/dia grátis'
  },
  NOMINATIM: {
    BASE_URL: 'https://nominatim.openstreetmap.org',
    USER_AGENT: 'DOM-System/1.0',
    TIMEOUT: 10000,
    LIMIT: 'Ilimitado e gratuito'
  }
};

// Mensagens do Sistema
export const SYSTEM_MESSAGES = {
  SUCCESS: {
    REGISTRO_CRIADO: 'Registro criado com sucesso!',
    USUARIO_CRIADO: 'Usuário criado com sucesso!',
    DADOS_SALVOS: 'Dados salvos com sucesso!'
  },
  ERROR: {
    USUARIO_NAO_AUTENTICADO: 'Usuário não autenticado',
    DADOS_INVALIDOS: 'Dados inválidos',
    ERRO_INTERNO: 'Erro interno do servidor',
    GEOLOCALIZACAO_NAO_DISPONIVEL: 'Geolocalização não disponível'
  },
  WARNING: {
    PRECISAO_BAIXA: 'Precisão da localização baixa',
    CONEXAO_LENTA: 'Conexão lenta detectada',
    DADOS_ANTIGOS: 'Dados podem estar desatualizados'
  }
};

// Configurações de Validação
export const VALIDATION_RULES = {
  CPF: {
    LENGTH: 11,
    PATTERN: /^\d{11}$/,
    REQUIRED: true
  },
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    REQUIRED: true
  },
  PHONE: {
    PATTERN: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
    REQUIRED: true
  },
  PASSWORD: {
    MIN_LENGTH: 8,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: false
  }
};

export default SYSTEM_CONFIG;