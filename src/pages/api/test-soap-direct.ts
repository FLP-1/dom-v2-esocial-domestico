// Teste direto de cliente SOAP
import * as https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import * as soap from 'soap';

// Configuração global para contornar problemas de SSL
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      steps: [] as any[],
      success: false,
      error: null as string | null,
    };

    // Passo 1: Configurar HTTPS Agent
    try {
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method',
        checkServerIdentity: () => undefined,
        keepAlive: true,
        timeout: 30000,
      });

      results.steps.push({
        step: 1,
        name: 'Configurar HTTPS Agent',
        status: 'OK',
        details: { agentCreated: true },
      });
    } catch (error) {
      results.steps.push({
        step: 1,
        name: 'Configurar HTTPS Agent',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao configurar HTTPS Agent';
      return res.status(200).json(results);
    }

    // Passo 2: Testar conectividade básica
    try {
      const testUrl = 'https://webservices.producaorestrita.esocial.gov.br';
      await new Promise((resolve, reject) => {
        const req = https.request(
          testUrl,
          {
            method: 'HEAD',
            agent: new https.Agent({ rejectUnauthorized: false }),
          },
          res => {
            resolve({ status: res.statusCode });
          }
        );
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
      });

      results.steps.push({
        step: 2,
        name: 'Testar conectividade básica',
        status: 'OK',
        details: { connected: true },
      });
    } catch (error) {
      results.steps.push({
        step: 2,
        name: 'Testar conectividade básica',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro de conectividade';
      return res.status(200).json(results);
    }

    // Passo 3: Criar cliente SOAP
    try {
      const wsdlUrl =
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl';

      const client = await soap.createClientAsync(wsdlUrl, {
        wsdl_options: {
          agent: new https.Agent({ rejectUnauthorized: false }),
          timeout: 30000,
        },
        forceSoap12Headers: false,
      });

      results.steps.push({
        step: 3,
        name: 'Criar cliente SOAP',
        status: 'OK',
        details: {
          methods: Object.keys(client).filter(
            key => typeof client[key] === 'function'
          ).length,
          clientCreated: true,
        },
      });

      results.success = true;
    } catch (error) {
      results.steps.push({
        step: 3,
        name: 'Criar cliente SOAP',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao criar cliente SOAP';
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}
