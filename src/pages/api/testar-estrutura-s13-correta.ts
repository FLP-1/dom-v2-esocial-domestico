import axios from 'axios';
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

  const { protocolo = '1.2.20250917.46410' } = req.body;

  try {
    console.log('🔧 === TESTE ESTRUTURA XML S-1.3 CORRETA ===');

    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
    };

    const soapService = new ESocialSoapReal(config);
    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    const cert = (soapService as any).cert;
    const key = (soapService as any).key;

    // Configuração SSL que funcionou nos testes anteriores
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    // === ESTRUTURA XML S-1.3 CORRETA (baseada na informação) ===
    const xmlS13Correto = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <consulta>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;

    console.log('📋 XML S-1.3 CORRETO:');
    console.log(xmlS13Correto);

    const url =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';

    // Headers corretos para S-1.3
    const headers = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction:
        '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
      Accept: 'text/xml',
      'User-Agent': 'DOM-System-S13/1.0',
    };

    console.log('📤 Enviando requisição S-1.3...');
    console.log('URL:', url);
    console.log('Headers:', headers);

    try {
      const response = await axios({
        method: 'POST',
        url: url,
        data: xmlS13Correto,
        headers: headers,
        httpsAgent: httpsAgent,
        timeout: 30000,
        validateStatus: () => true, // Aceitar qualquer status
      });

      console.log('📥 Resposta recebida:');
      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Tamanho:', response.data?.length || 0);

      // Analisar resposta detalhadamente
      const analise = analisarRespostaS13(response);

      const relatorio = {
        success: true,
        data: {
          protocolo_testado: protocolo,
          xml_s13_usado: xmlS13Correto,
          resposta: {
            status: response.status,
            headers: response.headers,
            tamanho: response.data?.length || 0,
            conteudo: response.data,
          },
          analise: analise,
          conclusao: gerarConclusao(response.status, analise),
        },
        message: 'Teste estrutura XML S-1.3 correta concluído',
      };

      return res.status(200).json(relatorio);
    } catch (error) {
      console.error('❌ Erro na requisição:', error.message);

      return res.status(200).json({
        success: false,
        data: {
          protocolo_testado: protocolo,
          xml_s13_usado: xmlS13Correto,
          erro: error.message,
          tipo_erro: error.code || 'UNKNOWN',
          conclusao:
            'Erro na comunicação - verificar conectividade ou certificado',
        },
        message: 'Erro no teste S-1.3',
      });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste estrutura S-1.3',
    });
  }
}

// Analisar resposta S-1.3
function analisarRespostaS13(response: any): any {
  const conteudo = response.data || '';

  return {
    eh_xml: conteudo.includes('<?xml') || conteudo.includes('<soap:'),
    eh_html: conteudo.includes('<html') || conteudo.includes('<!DOCTYPE'),
    contem_soap_fault:
      conteudo.includes('<soap:Fault>') || conteudo.includes('<faultstring>'),
    contem_sucesso:
      conteudo.includes('sucesso') || conteudo.includes('success'),
    contem_dados: conteudo.includes('<dados>') || conteudo.includes('<evento>'),
    contem_erro_especifico: extrairErroEspecifico(conteudo),
    primeiras_linhas: conteudo.split('\n').slice(0, 5).join('\n'),
    tamanho_resposta: conteudo.length,
  };
}

// Extrair erro específico da resposta
function extrairErroEspecifico(conteudo: string): string | null {
  // SOAP Fault
  const faultMatch = conteudo.match(/<faultstring>(.*?)<\/faultstring>/);
  if (faultMatch) return `SOAP Fault: ${faultMatch[1]}`;

  // Erro HTML
  const titleMatch = conteudo.match(/<title>(.*?)<\/title>/);
  if (titleMatch) return `HTML Error: ${titleMatch[1]}`;

  // Erro específico eSocial
  const esocialErrorMatch = conteudo.match(/<erro>(.*?)<\/erro>/);
  if (esocialErrorMatch) return `eSocial Error: ${esocialErrorMatch[1]}`;

  return null;
}

// Gerar conclusão baseada na resposta
function gerarConclusao(status: number, analise: any): string {
  if (status === 200) {
    if (analise.contem_dados) {
      return '✅ SUCESSO! Consulta S-1.3 funcionou e retornou dados';
    } else if (analise.contem_soap_fault) {
      return '⚠️ Conectou mas retornou SOAP Fault - verificar estrutura ou permissões';
    } else {
      return '⚠️ Conectou mas resposta inesperada - analisar conteúdo';
    }
  }

  if (status === 403) {
    return '🔒 HTTP 403 - Problema de autenticação/autorização mesmo com S-1.3';
  }

  if (status === 404) {
    return '❌ HTTP 404 - Endpoint não encontrado (URL pode estar incorreta)';
  }

  if (status === 500) {
    return '💥 HTTP 500 - Erro interno do servidor (XML pode estar malformado)';
  }

  return `❓ Status ${status} - Resposta inesperada`;
}
