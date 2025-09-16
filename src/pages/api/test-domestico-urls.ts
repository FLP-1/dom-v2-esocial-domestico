// Teste de URLs específicas para eSocial Doméstico
import * as https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';

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
      urls: [] as any[],
      summary: {
        total: 0,
        accessible: 0,
        forbidden: 0,
        notFound: 0,
        error: 0,
      },
    };

    // URLs específicas para eSocial Doméstico
    const urls = [
      // URLs oficiais do eSocial
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      'https://webservices.envio.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',

      // URLs específicas para doméstico (possíveis)
      'https://www.esocial.gov.br/empregador-domestico/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      'https://webservices.producaorestrita.esocial.gov.br/empregador-domestico/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      'https://webservices.envio.esocial.gov.br/empregador-domestico/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',

      // URLs alternativas
      'https://hom-esocialgovbrdomestico.saude.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl',
      'https://www.esocial.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl',

      // URLs de consulta específicas
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc?wsdl',
      'https://webservices.envio.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc?wsdl',
    ];

    for (const url of urls) {
      try {
        const result = await testUrl(url);
        results.urls.push(result);
        results.summary.total++;

        switch (result.status) {
          case 'OK':
            results.summary.accessible++;
            break;
          case 'FORBIDDEN':
            results.summary.forbidden++;
            break;
          case 'NOT_FOUND':
            results.summary.notFound++;
            break;
          default:
            results.summary.error++;
        }
      } catch (error) {
        results.urls.push({
          url,
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
        results.summary.total++;
        results.summary.error++;
      }
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}

async function testUrl(url: string): Promise<any> {
  return new Promise(resolve => {
    const req = https.request(
      url,
      {
        method: 'HEAD',
        agent: new https.Agent({ rejectUnauthorized: false }),
      },
      res => {
        const result = {
          url,
          status: res.statusCode,
          statusText: res.statusMessage,
          headers: {
            'content-type': res.headers['content-type'],
            server: res.headers['server'],
            'www-authenticate': res.headers['www-authenticate'],
          },
        };

        if (res.statusCode === 200) {
          result.status = 'OK';
        } else if (res.statusCode === 403) {
          result.status = 'FORBIDDEN';
        } else if (res.statusCode === 404) {
          result.status = 'NOT_FOUND';
        } else {
          result.status = 'OTHER';
        }

        resolve(result);
      }
    );

    req.on('error', error => {
      resolve({
        url,
        status: 'ERROR',
        error: error.message,
      });
    });

    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        url,
        status: 'TIMEOUT',
        error: 'Timeout após 10 segundos',
      });
    });

    req.end();
  });
}
