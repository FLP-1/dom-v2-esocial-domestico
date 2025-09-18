// API para acesso real ao eSocial com diferentes métodos de autenticação
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { method, cpfCnpj, environment = 'homologacao' } = req.body;

    if (!method || !cpfCnpj) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: method, cpfCnpj',
        methods: ['A1_PFX', 'A3_TOKEN', 'GOV_BR_ACCOUNT'],
      });
    }

    const results = {
      timestamp: new Date().toISOString(),
      method,
      cpfCnpj,
      environment,
      steps: [] as any[],
      success: false,
      data: null as any,
      error: null as string | null,
    };

    switch (method) {
      case 'A1_PFX':
        results.data = await testA1PFX(cpfCnpj, environment, results.steps);
        break;
      case 'A3_TOKEN':
        results.data = await testA3Token(cpfCnpj, environment, results.steps);
        break;
      case 'GOV_BR_ACCOUNT':
        results.data = await testGovBrAccount(
          cpfCnpj,
          environment,
          results.steps
        );
        break;
      default:
        return res.status(400).json({
          error: 'Método não suportado',
          supportedMethods: ['A1_PFX', 'A3_TOKEN', 'GOV_BR_ACCOUNT'],
        });
    }

    results.success = results.data !== null;
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}

// Método 1: Certificado A1 PFX (atual)
async function testA1PFX(cpfCnpj: string, environment: string, steps: any[]) {
  try {
    steps.push({
      step: 1,
      name: 'Carregar certificado A1 PFX',
      status: 'OK',
      details: { method: 'A1_PFX' },
    });

    const certPath = path.join(
      process.cwd(),
      'certificados',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      steps.push({
        step: 2,
        name: 'Verificar certificado',
        status: 'ERRO',
        details: { error: 'Certificado não encontrado' },
      });
      return null;
    }

    const pfx = fs.readFileSync(certPath);
    steps.push({
      step: 2,
      name: 'Verificar certificado',
      status: 'OK',
      details: { size: pfx.length },
    });

    // Tentar diferentes URLs do eSocial
    const urls = [
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      'https://webservices.envio.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      'https://www.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
    ];

    for (const url of urls) {
      try {
        steps.push({
          step: 3,
          name: `Testar URL: ${url.split('/')[2]}`,
          status: 'TENTANDO',
          details: { url },
        });

        const httpsAgent = new https.Agent({
          pfx,
          passphrase: '456587',
          rejectUnauthorized: false,
          secureProtocol: 'TLSv1_2_method',
          checkServerIdentity: () => undefined,
        });

        const client = await soap.createClientAsync(url, {
          wsdl_options: {
            agent: httpsAgent,
            timeout: 30000,
          },
          forceSoap12Headers: false,
        });

        steps.push({
          step: 3,
          name: `Testar URL: ${url.split('/')[2]}`,
          status: 'OK',
          details: {
            url,
            methods: Object.keys(client).filter(
              k => typeof client[k] === 'function'
            ).length,
          },
        });

        return {
          method: 'A1_PFX',
          url,
          success: true,
          message: 'Conexão SOAP estabelecida com sucesso!',
        };
      } catch (error) {
        steps.push({
          step: 3,
          name: `Testar URL: ${url.split('/')[2]}`,
          status: 'ERRO',
          details: {
            url,
            error:
              error instanceof Error
                ? error.message.substring(0, 100)
                : 'Erro desconhecido',
          },
        });
      }
    }

    return null;
  } catch (error) {
    steps.push({
      step: 'ERRO',
      name: 'Erro geral A1 PFX',
      status: 'ERRO',
      details: {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      },
    });
    return null;
  }
}

// Método 2: Certificado A3 (Token)
async function testA3Token(cpfCnpj: string, environment: string, steps: any[]) {
  steps.push({
    step: 1,
    name: 'Verificar certificado A3',
    status: 'INFO',
    details: {
      method: 'A3_TOKEN',
      message: 'Certificado A3 requer token físico conectado ao computador',
      requirements: [
        'Token A3 conectado via USB',
        'Driver do token instalado',
        'Biblioteca de acesso ao token (ex: pkcs11)',
        'Configuração específica do token',
      ],
    },
  });

  return {
    method: 'A3_TOKEN',
    success: false,
    message: 'Certificado A3 requer configuração específica do token físico',
    requirements: [
      'Token A3 conectado via USB',
      'Driver do token instalado',
      'Biblioteca pkcs11 configurada',
      'Certificado carregado no token',
    ],
  };
}

// Método 3: Conta gov.br
async function testGovBrAccount(
  cpfCnpj: string,
  environment: string,
  steps: any[]
) {
  steps.push({
    step: 1,
    name: 'Verificar conta gov.br',
    status: 'INFO',
    details: {
      method: 'GOV_BR_ACCOUNT',
      message: 'Acesso via gov.br requer autenticação OAuth2',
      requirements: [
        'Conta gov.br nível ouro ou prata',
        'Aplicação registrada no gov.br',
        'Client ID e Client Secret',
        'Fluxo OAuth2 implementado',
      ],
    },
  });

  return {
    method: 'GOV_BR_ACCOUNT',
    success: false,
    message: 'Acesso via gov.br requer implementação OAuth2',
    requirements: [
      'Conta gov.br nível ouro ou prata',
      'Aplicação registrada no gov.br',
      'Client ID e Client Secret configurados',
      'Fluxo OAuth2 implementado',
    ],
  };
}
