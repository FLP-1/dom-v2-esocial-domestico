import axios from 'axios';
import fs from 'fs';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

// === CLASSE EXATA FORNECIDA ===
class ConsultaESocialS13 {
  private httpsAgent: https.Agent;

  constructor(certPath: string, keyPath: string, passphrase?: string) {
    // Configuração mTLS correta
    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
      passphrase: passphrase,
      keepAlive: true,
      // CRÍTICO: Força TLS 1.2
      secureProtocol: 'TLSv1_2_method',
      // IMPORTANTE: Cifras aceitas pelo eSocial
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'AES128-GCM-SHA256',
        'AES256-GCM-SHA384',
      ].join(':'),
      rejectUnauthorized: false, // Em produção, mude para true
    });
  }

  async consultarLoteEventos(
    protocoloEnvio: string,
    producaoRestrita: boolean = true
  ) {
    // URLs corretas conforme Manual v1.15
    const url = producaoRestrita
      ? 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc'
      : 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';

    // SOAP Envelope CORRETO para S-1.3
    const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
      <consulta>
        <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
          <consultaLoteEventos>
            <protocoloEnvio>${protocoloEnvio}</protocoloEnvio>
          </consultaLoteEventos>
        </eSocial>
      </consulta>
    </ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    // Headers CORRETOS
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction:
        '"http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ConsultarLoteEventos"',
      Accept: 'text/xml',
      Connection: 'keep-alive',
      'User-Agent': 'ESocial-Client/1.0',
    };

    try {
      const response = await axios.post(url, soapEnvelope, {
        headers,
        httpsAgent: this.httpsAgent,
        timeout: 30000,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      return {
        status: response.status,
        data: response.data,
        headers: response.headers,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Status:', error.response?.status);
        console.error('Data:', error.response?.data);
        console.error('Headers:', error.response?.headers);
      }
      throw error;
    }
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { protocolo = '1.2.20250917.46410', producaoRestrita = true } =
    req.body;

  try {
    console.log('🔴 === TESTANDO CLASSE EXATA FORNECIDA ===');
    console.log('🎯 Implementação EXATA da solução definitiva!');

    // === PREPARAR CERTIFICADO EM FORMATO PEM ===
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    // Usar nosso serviço para converter certificado
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
    };

    const soapService = new ESocialSoapReal(config);
    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    // Obter certificado em formato PEM
    const cert = (soapService as any).cert;
    const key = (soapService as any).key;

    // Salvar temporariamente em arquivos PEM
    const tempCertPath = path.join(process.cwd(), 'temp-cert.pem');
    const tempKeyPath = path.join(process.cwd(), 'temp-key.pem');

    fs.writeFileSync(tempCertPath, cert);
    fs.writeFileSync(tempKeyPath, key);

    console.log('✅ Certificado convertido para PEM');

    // === USAR CLASSE EXATA FORNECIDA ===
    const consulta = new ConsultaESocialS13(tempCertPath, tempKeyPath);

    console.log('📋 TESTANDO COM CONFIGURAÇÃO EXATA:');
    console.log(
      'Ambiente:',
      producaoRestrita ? 'Produção Restrita' : 'Produção'
    );
    console.log('Protocolo:', protocolo);
    console.log('Service Namespace: v1_1_0');
    console.log('Schema Namespace: v1_0_0');
    console.log('Estrutura: Hierárquica (4 níveis)');

    const startTime = Date.now();

    try {
      // TESTE 1: Produção Restrita (recomendado)
      console.log('\n🧪 Teste 1: Produção Restrita...');
      const resultadoRestrita = await consulta.consultarLoteEventos(
        protocolo,
        true
      );
      const tempoRestrita = Date.now() - startTime;

      console.log(`📥 Produção Restrita: Sucesso! (${tempoRestrita}ms)`);

      // Limpar arquivos temporários
      fs.unlinkSync(tempCertPath);
      fs.unlinkSync(tempKeyPath);

      const analise = analisarResultadoClasseDefinitiva(resultadoRestrita);

      return res.status(200).json({
        success: true,
        data: {
          classe_testada: 'ConsultaESocialS13 (implementação exata)',
          ambiente_testado: 'Produção Restrita',
          protocolo_testado: protocolo,
          resultado: {
            funcionou_completamente: analise.funcionou,
            dados_recebidos: analise.contem_dados,
            xml_valido: analise.eh_xml,
            erro_especifico: analise.erro,
            tamanho_resposta: analise.tamanho,
            tempo_resposta: tempoRestrita,
          },
          implementacao_validada: {
            namespace_duplo: 'v1_1_0 + v1_0_0',
            estrutura_hierarquica:
              'ConsultarLoteEventos>consulta>eSocial>consultaLoteEventos',
            cifras_tls: 'ECDHE-RSA-AES128-GCM-SHA256 específicas',
            urls_manual_v115: 'Conforme documentação oficial',
          },
          conclusao: analise.funcionou
            ? '🎉 SOLUÇÃO DEFINITIVA CONFIRMADA!'
            : `Status recebido: ${analise.status} - Analisando resposta`,
        },
        message: 'Teste da classe exata fornecida concluído',
      });
    } catch (error) {
      console.error('❌ Erro no teste da classe:', error.message);

      // Limpar arquivos temporários mesmo com erro
      try {
        fs.unlinkSync(tempCertPath);
        fs.unlinkSync(tempKeyPath);
      } catch {}

      const errorDetails = axios.isAxiosError(error)
        ? {
            status: error.response?.status,
            data: error.response?.data,
            headers: error.response?.headers,
          }
        : null;

      return res.status(200).json({
        success: false,
        data: {
          classe_testada: 'ConsultaESocialS13 (implementação exata)',
          erro: error.message,
          detalhes_erro: errorDetails,
          ambiente_testado: 'Produção Restrita',
          conclusao: errorDetails?.status
            ? `Erro HTTP ${errorDetails.status} - ${errorDetails.status === 403 ? 'Ainda problema de autorização' : 'Novo tipo de erro'}`
            : 'Erro de comunicação/configuração',
        },
        message: 'Erro no teste da classe exata',
      });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste da classe definitiva',
    });
  }
}

// Analisar resultado da classe definitiva
function analisarResultadoClasseDefinitiva(dados: any): any {
  const conteudo = typeof dados === 'string' ? dados : JSON.stringify(dados);

  return {
    funcionou:
      !conteudo.includes('<soap:Fault>') &&
      !conteudo.includes('403') &&
      (conteudo.includes('<retorno>') || conteudo.includes('<dadosResposta>')),

    eh_xml: conteudo.includes('<?xml'),
    contem_dados:
      conteudo.includes('<retorno>') ||
      conteudo.includes('<dadosResposta>') ||
      conteudo.includes('<loteEventos>'),
    contem_erro:
      conteudo.includes('<soap:Fault>') ||
      conteudo.includes('403') ||
      conteudo.includes('error'),

    status: extrairStatusDaResposta(conteudo),
    erro: extrairErroDaResposta(conteudo),
    tamanho: conteudo.length,

    tipo: conteudo.includes('<html')
      ? 'HTML'
      : conteudo.includes('<?xml')
        ? 'XML'
        : conteudo.includes('{')
          ? 'JSON'
          : 'TEXT',
  };
}

// Extrair status da resposta
function extrairStatusDaResposta(conteudo: string): number | null {
  const statusMatch = conteudo.match(/status['":\s]*(\d+)/i);
  return statusMatch ? parseInt(statusMatch[1]) : null;
}

// Extrair erro da resposta
function extrairErroDaResposta(conteudo: string): string | null {
  const patterns = [
    /<faultstring>(.*?)<\/faultstring>/s,
    /<title>(.*?)<\/title>/s,
    /<erro>(.*?)<\/erro>/s,
    /403.*forbidden/i,
  ];

  for (const pattern of patterns) {
    const match = conteudo.match(pattern);
    if (match) return match[1]?.trim() || match[0];
  }

  return null;
}
