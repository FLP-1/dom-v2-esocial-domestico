// Configurações do eSocial Doméstico
export const ESOCIAL_CONFIG = {
  // Ambiente: 'production' | 'test'
  environment: 'production' as const,

  // Dados do empregador
  empregador: {
    cpf: '59876913700',
    nome: 'FLP Business Strategy',
  },

  // Certificado digital
  certificate: {
    path: './certificados/eCPF A1 24940271 (senha 456587).pfx',
    password: '456587',
    type: 'A1' as const,
  },

  // URLs dos WebServices
  urls: {
    production: 'https://webservices.esocial.gov.br',
    test: 'https://webservices.producaorestrita.esocial.gov.br',
  },

  // Versão da API
  apiVersion: '1.5.0',

  // Endpoints
  endpoints: {
    enviarLote: '/servicos/empregador/enviarlote/1.5.0',
    consultarLote: '/servicos/empregador/consultarlote/1.5.0',
    consultarEvento: '/servicos/empregador/consultarevento/1.5.0',
  },

  // Software House
  softwareHouse: {
    cnpj: '59876913700', // Usando CPF como CNPJ para pessoa física
    nome: 'FLP Business Strategy',
    contato: 'FLP Business Strategy',
    telefone: '11999999999',
    email: 'contato@flpbusiness.com',
  },
};

// Função para obter URL base baseada no ambiente
export const getBaseUrl = (): string => {
  return ESOCIAL_CONFIG.environment === 'production'
    ? ESOCIAL_CONFIG.urls.production
    : ESOCIAL_CONFIG.urls.test;
};

// Função para obter endpoint completo
export const getEndpoint = (
  endpoint: keyof typeof ESOCIAL_CONFIG.endpoints
): string => {
  return `${getBaseUrl()}${ESOCIAL_CONFIG.endpoints[endpoint]}`;
};
