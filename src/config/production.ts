// Configurações de Produção do eSocial Doméstico
export const PRODUCTION_CONFIG = {
  // Ambiente de Produção
  environment: 'producao' as const,

  // Dados do Empregador em Produção
  empregador: {
    cpf: process.env.EMPRESA_CPF || '',
    nome: process.env.EMPRESA_NOME || 'Empresa',
    razaoSocial: process.env.EMPRESA_RAZAO_SOCIAL || 'Empresa',
    endereco: {
      logradouro: 'Rua das Flores, 123',
      numero: '123',
      complemento: 'Sala 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234-567',
    },
    contato: {
      telefone: '11999999999',
      email: 'contato@flpbusiness.com',
    },
  },

  // Certificado Digital de Produção
  certificate: {
    path: './certificados/eCPF A1 24940271 (senha 456587).pfx',
    password: '456587',
    type: 'A1' as const,
    subject: 'FRANCISCO JOSE LATTARI PAPALEO:59876913700',
    issuer: 'AC Certisign RFB G5',
    validFrom: new Date('2025-05-15T03:48:44.000Z'),
    validTo: new Date('2026-05-15T03:48:44.000Z'),
    serialNumber: '7ce5210136d6da0aa6193de2e9f7faf6',
  },

  // URLs de Produção Real
  urls: {
    producao: 'https://webservices.esocial.gov.br',
    consultacadastro:
      'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
    recepcaoevento:
      'https://webservices.esocial.gov.br/recepcaoevento/RecepcaoEvento.svc',
    consultalote:
      'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
    consrecibo:
      'https://webservices.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc',
    consstatus:
      'https://webservices.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
  },

  // Configurações de Segurança
  security: {
    // Em produção, sempre validar certificados SSL
    rejectUnauthorized: true,
    // Timeout para requisições
    timeout: 30000,
    // Retry em caso de falha
    retryAttempts: 3,
    retryDelay: 1000,
  },

  // Configurações de Log
  logging: {
    level: 'info',
    enableConsole: true,
    enableFile: true,
    logFile: './logs/esocial-production.log',
  },

  // Configurações de Monitoramento
  monitoring: {
    enableMetrics: true,
    enableAlerts: true,
    alertEmail: 'alerts@flpbusiness.com',
    healthCheckInterval: 300000, // 5 minutos
  },

  // Configurações de Backup
  backup: {
    enableAutoBackup: true,
    backupInterval: 86400000, // 24 horas
    backupRetention: 30, // 30 dias
    backupPath: './backups/esocial/',
  },
};

// Validação de Configuração de Produção
export const validateProductionConfig = () => {
  const errors: string[] = [];

  // Validar certificado
  if (!PRODUCTION_CONFIG.certificate.path) {
    errors.push('Caminho do certificado não configurado');
  }

  if (!PRODUCTION_CONFIG.certificate.password) {
    errors.push('Senha do certificado não configurada');
  }

  // Validar datas do certificado
  const now = new Date();
  if (now < PRODUCTION_CONFIG.certificate.validFrom) {
    errors.push('Certificado ainda não é válido');
  }

  if (now > PRODUCTION_CONFIG.certificate.validTo) {
    errors.push('Certificado expirado');
  }

  // Validar URLs
  if (!PRODUCTION_CONFIG.urls.producao) {
    errors.push('URL de produção não configurada');
  }

  // Validar dados do empregador
  if (!PRODUCTION_CONFIG.empregador.cpf) {
    errors.push('CPF do empregador não configurado');
  }

  if (!PRODUCTION_CONFIG.empregador.nome) {
    errors.push('Nome do empregador não configurado');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Função para obter configuração baseada no ambiente
export const getConfigByEnvironment = (
  environment: 'producao' | 'homologacao'
) => {
  if (environment === 'producao') {
    return PRODUCTION_CONFIG;
  }

  // Retornar configuração de homologação
  return {
    environment: 'homologacao' as const,
    empregador: PRODUCTION_CONFIG.empregador,
    certificate: PRODUCTION_CONFIG.certificate,
    urls: {
      homologacao: 'https://pre-esocial.serpro.gov.br',
      consultacadastro:
        'https://pre-esocial.serpro.gov.br/consultacadastro/ConsultaCadastro.svc',
      recepcaoevento:
        'https://pre-esocial.serpro.gov.br/recepcaoevento/RecepcaoEvento.svc',
      consultalote:
        'https://pre-esocial.serpro.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
      consrecibo:
        'https://pre-esocial.serpro.gov.br/consrecibo/ConsRecebimentoEventos.svc',
      consstatus:
        'https://pre-esocial.serpro.gov.br/consstatuseventos/ConsStatusEventos.svc',
    },
    security: {
      rejectUnauthorized: false, // Em homologação, pode ser false
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
    },
  };
};
