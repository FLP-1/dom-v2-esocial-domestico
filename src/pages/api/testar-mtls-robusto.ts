import fs from 'fs';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado digital não encontrado',
      });
    }

    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
    };

    const soapService = new ESocialSoapReal(config);
    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    // === CONFIGURAÇÃO mTLS ROBUSTA ===
    const cert = (soapService as any).cert;
    const key = (soapService as any).key;

    // Múltiplas configurações SSL para teste
    const configuracoes = [
      {
        nome: 'Configuração 1: TLS 1.2 + rejectUnauthorized false',
        agent: new https.Agent({
          cert: cert,
          key: key,
          secureProtocol: 'TLSv1_2_method',
          rejectUnauthorized: false,
          keepAlive: false,
          timeout: 30000,
        }),
      },
      {
        nome: 'Configuração 2: TLS 1.3 + keepAlive true',
        agent: new https.Agent({
          cert: cert,
          key: key,
          secureProtocol: 'TLS_method',
          rejectUnauthorized: false,
          keepAlive: true,
          timeout: 30000,
        }),
      },
      {
        nome: 'Configuração 3: SSL padrão + handshakeTimeout',
        agent: new https.Agent({
          cert: cert,
          key: key,
          rejectUnauthorized: false,
          keepAlive: false,
          timeout: 30000,
          handshakeTimeout: 10000,
        }),
      },
    ];

    const resultados = [];

    for (const config of configuracoes) {
      try {
        const resultado = await testarConexaoHTTPS(
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
          config.agent
        );

        resultados.push({
          configuracao: config.nome,
          sucesso: resultado.sucesso,
          status: resultado.status,
          erro: resultado.erro,
          tempoResposta: resultado.tempo,
          detalhes: resultado.detalhes,
        });
      } catch (error) {
        resultados.push({
          configuracao: config.nome,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // === TESTE SOAP COMPLETO COM MELHOR CONFIGURAÇÃO ===
    const melhorConfig = resultados.find(r => r.sucesso);
    let testeSOAP = null;

    if (melhorConfig) {
      try {
        // Usar a configuração que funcionou para teste SOAP
        testeSOAP = await testarSOAPComConfiguracaoRobusta(
          soapService,
          melhorConfig.configuracao
        );
      } catch (error) {
        testeSOAP = {
          sucesso: false,
          erro: error.message,
        };
      }
    }

    const relatorio = {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        configuracoes_testadas: resultados,
        melhor_configuracao: melhorConfig?.configuracao || 'Nenhuma funcionou',
        teste_soap: testeSOAP,
        recomendacoes: gerarRecomendacoes(resultados),
      },
      message: 'Teste mTLS robusto concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste mTLS robusto',
    });
  }
}

// Testar conexão HTTPS com configuração específica
function testarConexaoHTTPS(url: string, agent: https.Agent): Promise<any> {
  return new Promise(resolve => {
    const startTime = Date.now();

    const req = https.request(
      url,
      {
        method: 'HEAD',
        agent: agent,
        timeout: 15000,
      },
      res => {
        const tempo = Date.now() - startTime;

        resolve({
          sucesso: true,
          status: res.statusCode,
          tempo: tempo,
          detalhes: {
            headers: Object.keys(res.headers),
            tlsVersion: (res.socket as any)?.getProtocol?.() || 'unknown',
          },
        });
      }
    );

    req.on('error', error => {
      const tempo = Date.now() - startTime;
      resolve({
        sucesso: false,
        erro: error.message,
        tempo: tempo,
        detalhes: {
          code: error.code,
          errno: error.errno,
        },
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        sucesso: false,
        erro: 'Timeout na conexão',
        tempo: Date.now() - startTime,
      });
    });

    req.end();
  });
}

// Testar SOAP com configuração robusta
async function testarSOAPComConfiguracaoRobusta(
  soapService: any,
  configuracao: string
): Promise<any> {
  try {
    const resultado =
      await soapService.consultarLotePorProtocolo('1.2.20250917.46410');

    return {
      sucesso: resultado.success,
      dados: resultado.success ? 'Consulta funcionou!' : null,
      erro: resultado.error || null,
    };
  } catch (error) {
    return {
      sucesso: false,
      erro: error.message,
    };
  }
}

// Gerar recomendações baseadas nos resultados
function gerarRecomendacoes(resultados: any[]): string[] {
  const recomendacoes = [];

  const sucessos = resultados.filter(r => r.sucesso);
  const falhas = resultados.filter(r => !r.sucesso);

  if (sucessos.length > 0) {
    recomendacoes.push(`Usar configuração: ${sucessos[0].configuracao}`);
    recomendacoes.push(
      'Conexão SSL funciona - problema pode ser na estrutura SOAP'
    );
  }

  if (falhas.length === resultados.length) {
    recomendacoes.push('Todas as configurações SSL falharam');
    recomendacoes.push('Verificar se certificado tem permissão para consultas');
    recomendacoes.push(
      'Considerar que consultas SOAP podem estar descontinuadas'
    );
  }

  const errosComuns = falhas.map(f => f.erro).filter(Boolean);
  if (errosComuns.some(e => e.includes('CONTEXT_EXPIRED'))) {
    recomendacoes.push('Erro de contexto SSL - ajustar timeout ou versão TLS');
  }

  if (errosComuns.some(e => e.includes('ECONNRESET'))) {
    recomendacoes.push('Conexão rejeitada pelo servidor - possível bloqueio');
  }

  return recomendacoes;
}
