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
    console.log('🔴 === TESTANDO SOLUÇÃO DEFINITIVA ===');
    console.log(
      '🎯 Baseada na descoberta: XML e URL COMPLETAMENTE DIFERENTES!'
    );

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

    // === SOLUÇÃO DEFINITIVA: URL E XML CORRETOS ===

    // 1. URL COMPLETA (não abreviada) - CORREÇÃO CRÍTICA
    const urlCorreta =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/WsConsultarLoteEventos.svc';

    // 2. NAMESPACE COMPLETO S-1.3 - CORREÇÃO CRÍTICA
    const namespaceCompleto =
      'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_3_0';

    // 3. XML CORRETO S-1.3 - ESTRUTURA SIMPLIFICADA
    const xmlCorreto = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="${namespaceCompleto}">
      <consulta>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;

    // 4. HEADERS CORRETOS - CONFORME SOLUÇÃO
    const headersCorretos = {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"${namespaceCompleto}/ConsultarLoteEventos"`,
      Accept: 'text/xml',
      'Accept-Encoding': 'gzip, deflate',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'User-Agent': 'eSocial-S13-Community-Solution/1.0',
    };

    // 5. CONFIGURAÇÃO HTTPS ROBUSTA
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      keepAlive: true,
      keepAliveMsecs: 1000,
      rejectUnauthorized: false, // Em produção, mude para true
      secureProtocol: 'TLSv1_2_method',
      timeout: 30000,
    });

    console.log('📋 CONFIGURAÇÃO CORRETA:');
    console.log('URL:', urlCorreta);
    console.log('Namespace:', namespaceCompleto);
    console.log('SOAPAction:', headersCorretos.SOAPAction);

    // === TESTE 1: VERIFICAR CONECTIVIDADE DA URL CORRETA ===
    console.log('\n🔍 Teste 1: Verificando conectividade da URL correta...');

    try {
      const testeConectividade = await axios({
        method: 'HEAD',
        url: urlCorreta,
        httpsAgent: httpsAgent,
        timeout: 15000,
        validateStatus: () => true,
      });

      console.log(`Conectividade URL correta: ${testeConectividade.status}`);
    } catch (error) {
      console.log(`Erro conectividade: ${error.message}`);
    }

    // === TESTE 2: CONSULTA SOAP COM SOLUÇÃO DEFINITIVA ===
    console.log('\n🚀 Teste 2: Consulta SOAP com solução definitiva...');

    const startTime = Date.now();

    try {
      const response = await axios({
        method: 'POST',
        url: urlCorreta,
        data: xmlCorreto,
        headers: headersCorretos,
        httpsAgent: httpsAgent,
        timeout: 30000,
        maxRedirects: 0,
        validateStatus: () => true,
      });

      const tempoResposta = Date.now() - startTime;

      console.log(
        `📥 Resposta recebida: Status ${response.status} (${tempoResposta}ms)`
      );

      const analise = analisarRespostaSolucaoDefinitiva(response);

      // === COMPILAR RESULTADO ===
      const resultado = {
        success: true,
        data: {
          solucao_aplicada: 'Solução Definitiva da Comunidade',
          correcoes_implementadas: [
            'URL COMPLETA com /lote/eventos/envio/consulta/retornoProcessamento/',
            'Namespace COMPLETO v1_3_0',
            'XML estrutura SIMPLIFICADA (só protocoloEnvio)',
            'Headers CORRETOS com SOAPAction completo',
            'HTTPS Agent ROBUSTO com keepAlive',
          ],
          configuracao: {
            url_usada: urlCorreta,
            namespace_usado: namespaceCompleto,
            xml_usado: xmlCorreto,
            headers_usados: headersCorretos,
          },
          resultado_teste: {
            sucesso: response.status === 200 && analise.funcionou,
            status: response.status,
            tempo_resposta: tempoResposta,
            analise: analise,
          },
          comparacao: {
            antes: 'URLs curtas + namespaces simples = 403',
            depois: `URLs completas + namespaces completos = ${response.status}`,
            melhoria: response.status !== 403 ? 'SIM!' : 'Ainda investigando',
          },
          conclusao: gerarConclusaoDefinitiva(response.status, analise),
        },
        message: 'Teste da solução definitiva concluído',
      };

      if (response.status === 200 && analise.funcionou) {
        console.log('🎉 SOLUÇÃO DEFINITIVA FUNCIONOU!');
        await salvarSolucaoDefinitiva(
          urlCorreta,
          namespaceCompleto,
          xmlCorreto,
          headersCorretos,
          response
        );
      }

      return res.status(200).json(resultado);
    } catch (error) {
      console.error('❌ Erro na solução definitiva:', error.message);

      return res.status(200).json({
        success: false,
        data: {
          solucao_aplicada: 'Solução Definitiva da Comunidade',
          erro: error.message,
          codigo_erro: error.code,
          configuracao_usada: {
            url: urlCorreta,
            namespace: namespaceCompleto,
          },
          conclusao:
            'Erro na comunicação - verificar se URL/namespace estão realmente corretos',
        },
        message: 'Erro no teste da solução definitiva',
      });
    }
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste da solução definitiva',
    });
  }
}

// Analisar resposta da solução definitiva
function analisarRespostaSolucaoDefinitiva(response: any): any {
  const conteudo = response.data || '';

  return {
    funcionou:
      response.status === 200 &&
      !conteudo.includes('<soap:Fault>') &&
      !conteudo.includes('403'),
    eh_xml_valido:
      conteudo.includes('<?xml') && conteudo.includes('</soap:Envelope>'),
    contem_dados_consulta:
      conteudo.includes('<retorno>') ||
      conteudo.includes('<loteEventos>') ||
      conteudo.includes('<evento>'),
    contem_protocolo:
      conteudo.includes('<protocolo>') || conteudo.includes('protocolo'),
    contem_erro_403: conteudo.includes('403') || conteudo.includes('Forbidden'),
    contem_soap_fault:
      conteudo.includes('<soap:Fault>') || conteudo.includes('<faultstring>'),
    tamanho_resposta: conteudo.length,
    tipo_resposta: determinarTipoResposta(conteudo),
    erro_especifico: extrairErroEspecifico(conteudo),
    dados_extraidos: extrairDadosConsulta(conteudo),
  };
}

// Determinar tipo de resposta
function determinarTipoResposta(conteudo: string): string {
  if (conteudo.includes('<html') || conteudo.includes('<!DOCTYPE'))
    return 'HTML';
  if (conteudo.includes('<?xml') && conteudo.includes('<soap:'))
    return 'SOAP XML';
  if (conteudo.includes('<?xml')) return 'XML';
  if (conteudo.includes('{') && conteudo.includes('}')) return 'JSON';
  return 'TEXTO';
}

// Extrair erro específico
function extrairErroEspecifico(conteudo: string): string | null {
  const patterns = [
    { regex: /<faultstring>(.*?)<\/faultstring>/, tipo: 'SOAP Fault' },
    { regex: /<title>(.*?)<\/title>/, tipo: 'HTML Error' },
    { regex: /<erro>(.*?)<\/erro>/, tipo: 'eSocial Error' },
    { regex: /<message>(.*?)<\/message>/, tipo: 'Message Error' },
  ];

  for (const pattern of patterns) {
    const match = conteudo.match(pattern.regex);
    if (match) return `${pattern.tipo}: ${match[1]}`;
  }

  return null;
}

// Extrair dados da consulta (se funcionou)
function extrairDadosConsulta(conteudo: string): any {
  if (!conteudo.includes('<retorno>') && !conteudo.includes('<loteEventos>')) {
    return null;
  }

  return {
    encontrou_dados: true,
    tipo_dados: conteudo.includes('<loteEventos>')
      ? 'Lote de Eventos'
      : 'Retorno Genérico',
    tamanho_dados: conteudo.length,
  };
}

// Gerar conclusão definitiva
function gerarConclusaoDefinitiva(status: number, analise: any): string {
  if (status === 200 && analise.funcionou) {
    return '🎉 SOLUÇÃO DEFINITIVA CONFIRMADA! A estrutura XML e URL corretas da comunidade funcionaram!';
  }

  if (status === 200 && !analise.funcionou) {
    return '⚠️ Conectou (200) mas resposta indica problema - verificar estrutura XML ou dados';
  }

  if (status !== 403) {
    return `📈 PROGRESSO SIGNIFICATIVO! Mudou de 403 para ${status} - URL/namespace corretos, ajustar detalhes`;
  }

  if (status === 403) {
    return '🔒 Ainda 403 mesmo com URL e namespace corretos - problema pode ser mais profundo';
  }

  return `❓ Status ${status} - comportamento inesperado`;
}

// Salvar solução definitiva que funcionou
async function salvarSolucaoDefinitiva(
  url: string,
  namespace: string,
  xml: string,
  headers: any,
  response: any
): Promise<void> {
  try {
    const solucaoDefinitiva = {
      timestamp: new Date().toISOString(),
      status: 'SOLUÇÃO DEFINITIVA FUNCIONANDO',
      url_correta: url,
      namespace_correto: namespace,
      xml_correto: xml,
      headers_corretos: headers,
      resposta_sucesso: {
        status: response.status,
        tamanho: response.data?.length || 0,
        dados: response.data,
      },
      implementacao_typescript: {
        funcao_pronta: 'consultarLoteEventosS13',
        arquivo_config: 'Atualizar src/config/esocial.ts',
        arquivo_service: 'Atualizar src/services/esocialSoapReal.ts',
      },
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'SOLUCAO-DEFINITIVA-FUNCIONANDO.json'),
      JSON.stringify(solucaoDefinitiva, null, 2)
    );

    console.log(
      '🎉 SOLUÇÃO DEFINITIVA SALVA EM: SOLUCAO-DEFINITIVA-FUNCIONANDO.json'
    );
  } catch (error) {
    console.log('⚠️ Erro ao salvar solução definitiva:', error.message);
  }
}
