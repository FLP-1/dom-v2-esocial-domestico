// Configurações do eSocial Doméstico
export const ESOCIAL_CONFIG = {
  // Ambiente: 'producao' | 'homologacao'
  environment: 'producao' as 'producao' | 'homologacao', // CONFIGURADO PARA PRODUÇÃO REAL

  // Dados do empregador
  empregador: {
    cpf: process.env.EMPRESA_CPF || '',
    nome: process.env.EMPRESA_NOME || 'Empresa',
  },

  // Certificado digital
  certificate: {
    path: './certificados/eCPF A1 24940271 (senha 456587).pfx',
    password: '456587',
    type: 'A1' as const,
  },

  // URLs dos WebServices OFICIAIS (produção real)
  urls: {
    // eSocial Geral - URLs oficiais de produção
    producao: 'https://webservices.envio.esocial.gov.br',
    homologacao: 'https://webservices.producaorestrita.esocial.gov.br',
    // eSocial Doméstico (SOAP) - URLs VERSÃO S-1.3
    domestico: {
      producao: {
        // ENVIO - URLs corretas que funcionam
        wsdl: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
        endpoint:
          'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',

        // CONSULTAS - URLs REAIS QUE EXISTEM (403 = precisa certificado correto)
        consultaEmpregador:
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        consultaTrabalhador:
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarqualificacaocadastral/WsConsultarQualificacaoCadastral.svc',

        // CONSULTAS ADICIONAIS - URLs QUE EXISTEM
        consultaEventos:
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc',
        consultaIdentificador:
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadoreventos/WsConsultarIdentificadorEventos.svc',
      },
      homologacao: {
        wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
        endpoint:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        consultaEmpregador:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/WsConsultarIdentificadorCadastro.svc',
        consultaTrabalhador:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      },
    },
  },

  // Versão da API - ATUALIZADA PARA S-1.3
  apiVersion: 'S-1.3',

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
    cnpj: process.env.EMPRESA_CPF || '', // Usando CPF como CNPJ para pessoa física
    nome: process.env.EMPRESA_NOME || 'Empresa',
    contato: process.env.EMPRESA_NOME || 'Empresa',
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
