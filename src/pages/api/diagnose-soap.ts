// API de diagnóstico para SOAP eSocial
import * as fs from 'fs';
import * as https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import * as soap from 'soap';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      tests: [] as any[],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
      },
    };

    // Teste 1: Verificar se certificado existe
    const certPath = path.join(
      process.cwd(),
      'certificados',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    diagnostics.tests.push({
      name: 'Certificado existe',
      status: fs.existsSync(certPath) ? 'PASS' : 'FAIL',
      details: {
        path: certPath,
        exists: fs.existsSync(certPath),
      },
    });

    // Teste 2: Verificar se biblioteca SOAP está disponível
    diagnostics.tests.push({
      name: 'Biblioteca SOAP disponível',
      status: typeof soap === 'object' ? 'PASS' : 'FAIL',
      details: {
        soapVersion: soap?.version || 'N/A',
      },
    });

    // Teste 3: Testar conectividade HTTPS básica
    try {
      const testUrl = 'https://webservices.producaorestrita.esocial.gov.br';
      const testResult = await new Promise((resolve, reject) => {
        const req = https.request(testUrl, { method: 'HEAD' }, res => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
          });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => reject(new Error('Timeout')));
        req.end();
      });

      diagnostics.tests.push({
        name: 'Conectividade HTTPS básica',
        status: 'PASS',
        details: testResult,
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'Conectividade HTTPS básica',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
    }

    // Teste 4: Testar WSDL
    try {
      const wsdlUrl =
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl';
      const wsdlResult = await new Promise((resolve, reject) => {
        const req = https.request(wsdlUrl, { method: 'GET' }, res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              status: res.statusCode,
              contentType: res.headers['content-type'],
              size: data.length,
              hasWsdl: data.includes('wsdl:definitions'),
            });
          });
        });
        req.on('error', reject);
        req.setTimeout(15000, () => reject(new Error('Timeout')));
        req.end();
      });

      diagnostics.tests.push({
        name: 'WSDL acessível',
        status: 'PASS',
        details: wsdlResult,
      });
    } catch (error) {
      diagnostics.tests.push({
        name: 'WSDL acessível',
        status: 'FAIL',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
    }

    // Teste 5: Testar criação de cliente SOAP
    if (fs.existsSync(certPath)) {
      try {
        const pfx = fs.readFileSync(certPath);
        const httpsAgent = new https.Agent({
          pfx,
          passphrase: '456587',
          rejectUnauthorized: false,
        });

        const wsdlUrl =
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl';
        const client = await soap.createClientAsync(wsdlUrl, {
          wsdl_options: {
            agent: httpsAgent,
            timeout: 30000,
          },
        });

        diagnostics.tests.push({
          name: 'Cliente SOAP criado',
          status: 'PASS',
          details: {
            methods: Object.keys(client).filter(
              key => typeof client[key] === 'function'
            ),
          },
        });
      } catch (error) {
        diagnostics.tests.push({
          name: 'Cliente SOAP criado',
          status: 'FAIL',
          details: {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          },
        });
      }
    }

    // Calcular resumo
    diagnostics.summary.total = diagnostics.tests.length;
    diagnostics.summary.passed = diagnostics.tests.filter(
      t => t.status === 'PASS'
    ).length;
    diagnostics.summary.failed = diagnostics.tests.filter(
      t => t.status === 'FAIL'
    ).length;

    return res.status(200).json(diagnostics);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}
