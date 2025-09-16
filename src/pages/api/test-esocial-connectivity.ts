import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      tests: [],
    };

    // Teste 1: Homologação
    try {
      const startTime = Date.now();
      const response = await axios.get(
        'https://webservices.producaorestrita.esocial.gov.br',
        {
          timeout: 10000,
          validateStatus: () => true, // Aceitar qualquer status
        }
      );
      const endTime = Date.now();

      results.tests.push({
        environment: 'homologacao',
        url: 'https://webservices.producaorestrita.esocial.gov.br',
        status: 'SUCCESS',
        responseTime: `${endTime - startTime}ms`,
        statusCode: response.status,
        accessible: true,
      });
    } catch (error) {
      results.tests.push({
        environment: 'homologacao',
        url: 'https://webservices.producaorestrita.esocial.gov.br',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        accessible: false,
      });
    }

    // Teste 2: Produção
    try {
      const startTime = Date.now();
      const response = await axios.get('https://webservices.esocial.gov.br', {
        timeout: 10000,
        validateStatus: () => true, // Aceitar qualquer status
      });
      const endTime = Date.now();

      results.tests.push({
        environment: 'producao',
        url: 'https://webservices.esocial.gov.br',
        status: 'SUCCESS',
        responseTime: `${endTime - startTime}ms`,
        statusCode: response.status,
        accessible: true,
      });
    } catch (error) {
      results.tests.push({
        environment: 'producao',
        url: 'https://webservices.esocial.gov.br',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        accessible: false,
      });
    }

    // Teste 3: WSDL Homologação
    try {
      const startTime = Date.now();
      const response = await axios.get(
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        {
          timeout: 10000,
          validateStatus: () => true,
        }
      );
      const endTime = Date.now();

      results.tests.push({
        environment: 'homologacao_wsdl',
        url: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        status: 'SUCCESS',
        responseTime: `${endTime - startTime}ms`,
        statusCode: response.status,
        accessible: true,
        hasWsdl: response.data.includes('wsdl:definitions'),
      });
    } catch (error) {
      results.tests.push({
        environment: 'homologacao_wsdl',
        url: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        accessible: false,
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
