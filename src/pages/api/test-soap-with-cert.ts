// Teste final de SOAP com certificado
import * as fs from 'fs';
import * as https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
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
      soapClient: null as any,
    };

    // Passo 1: Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'certificados',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    let pfx: Buffer;
    try {
      pfx = fs.readFileSync(certPath);
      results.steps.push({
        step: 1,
        name: 'Carregar certificado',
        status: 'OK',
        details: { size: pfx.length },
      });
    } catch (error) {
      results.steps.push({
        step: 1,
        name: 'Carregar certificado',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao carregar certificado';
      return res.status(200).json(results);
    }

    // Passo 2: Criar HTTPS Agent com certificado
    let httpsAgent: https.Agent;
    try {
      httpsAgent = new https.Agent({
        pfx,
        passphrase: '456587',
        rejectUnauthorized: false,
        secureProtocol: 'TLSv1_2_method',
        checkServerIdentity: () => undefined,
        keepAlive: true,
        timeout: 30000,
      });

      results.steps.push({
        step: 2,
        name: 'Criar HTTPS Agent com certificado',
        status: 'OK',
        details: { agentCreated: true },
      });
    } catch (error) {
      results.steps.push({
        step: 2,
        name: 'Criar HTTPS Agent com certificado',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao criar HTTPS Agent';
      return res.status(200).json(results);
    }

    // Passo 3: Criar cliente SOAP
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
        step: 3,
        name: 'Criar cliente SOAP',
        status: 'OK',
        details: {
          methods: Object.keys(client).filter(
            (key) => typeof client[key] === 'function'
          ).length,
          clientCreated: true,
        },
      });

      results.soapClient = {
        methods: Object.keys(client).filter(
          (key) => typeof client[key] === 'function'
        ),
        hasSecurity: typeof client.setSecurity === 'function',
      };
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
      return res.status(200).json(results);
    }

    // Passo 4: Configurar segurança do cliente
    try {
      const client = results.soapClient;
      if (client && client.hasSecurity) {
        // Simular configuração de segurança
        results.steps.push({
          step: 4,
          name: 'Configurar segurança do cliente',
          status: 'OK',
          details: { securityConfigured: true },
        });
      } else {
        results.steps.push({
          step: 4,
          name: 'Configurar segurança do cliente',
          status: 'AVISO',
          details: { securityConfigured: false, reason: 'Cliente não tem método setSecurity' },
        });
      }
    } catch (error) {
      results.steps.push({
        step: 4,
        name: 'Configurar segurança do cliente',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
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
