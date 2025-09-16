// Configurações do eSocial Doméstico
export const ESOCIAL_CONFIG = {
  // Ambiente: 'producao' | 'homologacao'
  environment: 'producao' as 'producao' | 'homologacao', // CONFIGURADO PARA PRODUÇÃO REAL

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

  // URLs dos WebServices (baseadas na documentação oficial)
  urls: {
    // eSocial Geral
    producao: 'https://webservices.envio.esocial.gov.br',
    homologacao: 'https://webservices.producaorestrita.esocial.gov.br',
    // eSocial Doméstico (SOAP)
    domestico: {
      producao: {
        wsdl: 'https://www.esocial.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl',
        endpoint:
          'https://www.esocial.gov.br/empregador/ConsultaCadastroEmpregador.svc',
      },
      homologacao: {
        wsdl: 'https://hom-esocialgovbrdomestico.saude.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl',
        endpoint:
          'https://hom-esocialgovbrdomestico.saude.gov.br/empregador/ConsultaCadastroEmpregador.svc',
      },
    },
  },

  // Versão da API
  apiVersion: '1.5.0',

  // Endpoints
  endpoints: {
    enviarLote:
      '/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    consultarLote:
      '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
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

  // Configurações SSL/TLS
  ssl: {
    // Para desenvolvimento - permite certificados auto-assinados
    rejectUnauthorized: process.env.NODE_ENV === 'development' ? false : true,
    // Cadeia de certificação ICP-Brasil
    caCertificates: [
      'http://acraiz.icpbrasil.gov.br/credenciadas/RAIZ/ICP-Brasilv2.crt',
      'http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/p/AC_Secretaria_da_Receita_Federal_do_Brasil_v3.crt',
      'http://acraiz.icpbrasil.gov.br/credenciadas/RFB/v2/Autoridade_Certificadora_do_SERPRO_RFB_SSL.crt',
    ],
  },
};

// Função para obter URL base baseada no ambiente
export const getBaseUrl = (): string => {
  return ESOCIAL_CONFIG.environment === 'homologacao'
    ? ESOCIAL_CONFIG.urls.homologacao
    : ESOCIAL_CONFIG.urls.producao;
};

// Função para obter endpoint completo
export const getEndpoint = (
  endpoint: keyof typeof ESOCIAL_CONFIG.endpoints
): string => {
  return `${getBaseUrl()}${ESOCIAL_CONFIG.endpoints[endpoint]}`;
};
