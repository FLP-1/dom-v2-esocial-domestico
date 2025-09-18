// Teste detalhado de inicialização SOAP
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
    const results = {
      timestamp: new Date().toISOString(),
      steps: [] as any[],
      success: false,
      error: null as string | null,
    };

    // Passo 1: Verificar certificado
    const certPath = path.join(
      process.cwd(),
      'certificados',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    results.steps.push({
      step: 1,
      name: 'Verificar certificado',
      status: fs.existsSync(certPath) ? 'OK' : 'ERRO',
      details: { path: certPath, exists: fs.existsSync(certPath) },
    });

    if (!fs.existsSync(certPath)) {
      results.error = 'Certificado não encontrado';
      return res.status(200).json(results);
    }

    // Passo 2: Carregar certificado
    let pfx: Buffer;
    try {
      pfx = fs.readFileSync(certPath);
      results.steps.push({
        step: 2,
        name: 'Carregar certificado',
        status: 'OK',
        details: { size: pfx.length },
      });
    } catch (error) {
      results.steps.push({
        step: 2,
        name: 'Carregar certificado',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao carregar certificado';
      return res.status(200).json(results);
    }

    // Passo 3: Criar HTTPS Agent
    let httpsAgent: https.Agent;
    try {
      httpsAgent = new https.Agent({
        pfx,
        passphrase: '456587',
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method',
        checkServerIdentity: () => undefined,
        requestCert: true,
        agent: false,
      });
      results.steps.push({
        step: 3,
        name: 'Criar HTTPS Agent',
        status: 'OK',
        details: { agentCreated: true },
      });
    } catch (error) {
      results.steps.push({
        step: 3,
        name: 'Criar HTTPS Agent',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao criar HTTPS Agent';
      return res.status(200).json(results);
    }

    // Passo 4: Testar conectividade
    try {
      const testUrl = 'https://webservices.producaorestrita.esocial.gov.br';
      await new Promise((resolve, reject) => {
        const req = https.request(
          testUrl,
          {
            method: 'HEAD',
            agent: httpsAgent,
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
        step: 4,
        name: 'Testar conectividade',
        status: 'OK',
        details: { connected: true },
      });
    } catch (error) {
      results.steps.push({
        step: 4,
        name: 'Testar conectividade',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro de conectividade';
      return res.status(200).json(results);
    }

    // Passo 5: Criar cliente SOAP
    try {
      const wsdlUrl =
        'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl';
      const client = await soap.createClientAsync(wsdlUrl, {
        wsdl_options: {
          agent: httpsAgent,
          timeout: 30000,
        },
        forceSoap12Headers: false,
      });
      results.steps.push({
        step: 5,
        name: 'Criar cliente SOAP',
        status: 'OK',
        details: {
          methods: Object.keys(client).filter(
            key => typeof client[key] === 'function'
          ).length,
          clientCreated: true,
        },
      });
    } catch (error) {
      results.steps.push({
        step: 5,
        name: 'Criar cliente SOAP',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao criar cliente SOAP';
      return res.status(200).json(results);
    }

    results.success = true;
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}
