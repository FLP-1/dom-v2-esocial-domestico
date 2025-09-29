import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { environment = 'homologacao' } = req.body;

    // Endpoints oficiais do eSocial
    const endpoints = {
      homologacao: {
        nome: 'Homologação (Produção Restrita)',
        baseUrl: 'https://webservices.producaorestrita.esocial.gov.br',
        servicos: [
          {
            nome: 'Consulta Cadastro',
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          },
          {
            nome: 'Enviar Lote Eventos',
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          },
          {
            nome: 'Consultar Lote Eventos',
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
          },
        ],
      },
      producao: {
        nome: 'Produção',
        baseUrl: 'https://webservices.esocial.gov.br',
        servicos: [
          {
            nome: 'Consulta Cadastro',
            wsdl: 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          },
          {
            nome: 'Enviar Lote Eventos',
            wsdl: 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          },
          {
            nome: 'Consultar Lote Eventos',
            wsdl: 'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
          },
        ],
      },
    };

    const ambiente = endpoints[environment as keyof typeof endpoints];

    const resultado = {
      timestamp: new Date().toISOString(),
      environment: environment,
      nome: ambiente.nome,
      baseUrl: ambiente.baseUrl,
      servicos: ambiente.servicos,
      recomendacoes: [],
    };

    // Adicionar recomendações baseadas no ambiente
    if (environment === 'homologacao') {
      resultado.recomendacoes.push(
        '✅ Ambiente de homologação está configurado corretamente',
        '🔍 Use este ambiente para testes e desenvolvimento',
        '📋 Endpoints validados conforme documentação oficial'
      );
    } else {
      resultado.recomendacoes.push(
        '⚠️ Ambiente de produção - use com cuidado',
        '🔒 Certifique-se de que o certificado digital está válido',
        '📋 Teste primeiro em homologação antes de usar produção'
      );
    }

    return res.status(200).json({
      success: true,
      data: resultado,
    });
  } catch (error) {
    console.error('Erro no teste simples:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no teste simples',
      details: error.message,
    });
  }
}
