import fs from 'fs';
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

  const { protocolo = '1.2.20250917.46410', cpfEmpregador = '59876913700' } =
    req.body;

  try {
    console.log('🔍 === DEBUG SOAP COMPLETO (RECOMENDAÇÕES) ===');

    // Configurar serviço eSocial
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: cpfEmpregador,
    };

    const soapService = new ESocialSoapReal(config);

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

    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    console.log('🔐 Certificado carregado com sucesso');

    // === TESTE 1: CAPTURAR XML ENVIADO ===
    console.log('\n📤 === XML ENVIADO ===');

    // Acessar método privado para obter XML
    const xmlEnviado = (soapService as any).generateConsultarLoteProtocoloXML(
      protocolo
    );
    console.log('📋 XML que será enviado:');
    console.log(xmlEnviado);

    // === TESTE 2: CONSULTA COM LOG DETALHADO ===
    console.log('\n🔍 === EXECUTANDO CONSULTA COM LOG DETALHADO ===');

    let resultado;
    let xmlResposta = '';
    let statusHttp = 0;
    let headersResposta = {};

    try {
      // Interceptar resposta HTTP
      const originalMakeSoapRequest = (soapService as any)
        .makeSoapRequestConsulta;

      (soapService as any).makeSoapRequestConsulta = async function (
        xml: string,
        url: string,
        soapAction: string
      ) {
        console.log('📡 URL:', url);
        console.log('🎯 SOAPAction:', soapAction);
        console.log('📤 XML enviado:', xml);

        try {
          const response = await originalMakeSoapRequest.call(
            this,
            xml,
            url,
            soapAction
          );

          statusHttp = response.status || 0;
          xmlResposta = response.data || '';
          headersResposta = response.headers || {};

          console.log('📥 Status HTTP:', statusHttp);
          console.log('📥 Headers:', JSON.stringify(headersResposta, null, 2));
          console.log('📥 Resposta completa:', xmlResposta);

          return response;
        } catch (error) {
          console.log('❌ Erro na requisição:', error.message);
          throw error;
        }
      };

      resultado = await soapService.consultarLotePorProtocolo(protocolo);
    } catch (error) {
      console.log('❌ Erro na consulta:', error.message);
      resultado = { success: false, error: error.message };
    }

    // === ANÁLISE DO SOAP FAULT ===
    let soapFaultAnalise = null;
    if (xmlResposta && !resultado.success) {
      soapFaultAnalise = analisarSoapFault(xmlResposta);
    }

    // === VERIFICAR ESTRUTURA XML ===
    const analiseXML = analisarEstruturaXML(xmlEnviado);

    // === COMPILAR RELATÓRIO DETALHADO ===
    const relatorio = {
      success: true,
      data: {
        configuracao: {
          protocolo: protocolo,
          cpfEmpregador: cpfEmpregador,
          ambiente: 'producao',
          certificado: 'eCPF A1 - Carregado',
        },
        xml_enviado: {
          conteudo: xmlEnviado,
          analise: analiseXML,
        },
        resposta_http: {
          status: statusHttp,
          headers: headersResposta,
          conteudo: xmlResposta,
          tamanho: xmlResposta.length,
        },
        soap_fault: soapFaultAnalise,
        resultado_consulta: {
          sucesso: resultado.success,
          erro: resultado.error || null,
          dados: resultado.data || null,
        },
        recomendacoes: gerarRecomendacoes(statusHttp, xmlResposta, analiseXML),
      },
      message: 'Debug SOAP completo realizado conforme recomendações',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no debug SOAP completo',
    });
  }
}

// Analisar SOAP Fault detalhadamente
function analisarSoapFault(xmlResposta: string): any {
  if (!xmlResposta) return null;

  const soapFault = {
    encontrado: false,
    faultCode: null,
    faultString: null,
    detail: null,
    conteudoCompleto: null,
  };

  // Buscar SOAP Fault
  const faultMatch = xmlResposta.match(/<soap:Fault>(.*?)<\/soap:Fault>/s);
  if (faultMatch) {
    soapFault.encontrado = true;
    soapFault.conteudoCompleto = faultMatch[1];

    // Extrair faultcode
    const faultCodeMatch = faultMatch[1].match(/<faultcode>(.*?)<\/faultcode>/);
    if (faultCodeMatch) soapFault.faultCode = faultCodeMatch[1];

    // Extrair faultstring
    const faultStringMatch = faultMatch[1].match(
      /<faultstring>(.*?)<\/faultstring>/
    );
    if (faultStringMatch) soapFault.faultString = faultStringMatch[1];

    // Extrair detail
    const detailMatch = faultMatch[1].match(/<detail>(.*?)<\/detail>/s);
    if (detailMatch) soapFault.detail = detailMatch[1];
  }

  return soapFault;
}

// Analisar estrutura XML
function analisarEstruturaXML(xml: string): any {
  return {
    tem_declaracao_xml: xml.includes('<?xml'),
    envelope_soap: xml.includes(
      'xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"'
    )
      ? 'SOAP 1.1'
      : xml.includes('xmlns:soap="http://www.w3.org/2003/05/soap-envelope"')
        ? 'SOAP 1.2'
        : 'Desconhecido',
    namespace_consulta:
      xml.match(/xmlns:cons="([^"]*)"/)?.[1] || 'Não encontrado',
    elementos_principais: [
      xml.includes('<cons:ConsultarLoteEventos>')
        ? 'ConsultarLoteEventos'
        : null,
      xml.includes('<cons:ideEmpregador>') ? 'ideEmpregador' : null,
      xml.includes('<cons:protocolo>') ? 'protocolo' : null,
      xml.includes('<cons:consulta>') ? 'consulta' : null,
    ].filter(Boolean),
    tamanho_xml: xml.length,
    bem_formado: xml.includes('</soap:Envelope>'),
  };
}

// Gerar recomendações baseadas na análise
function gerarRecomendacoes(
  status: number,
  resposta: string,
  analiseXML: any
): string[] {
  const recomendacoes = [];

  if (status === 404) {
    recomendacoes.push(
      'Erro 404: Verificar se a URL do endpoint está correta para S-1.3'
    );
    recomendacoes.push('Testar com cURL para isolar problema do Node.js');
  }

  if (status === 500) {
    recomendacoes.push('Erro 500: Verificar estrutura XML e namespaces');
    recomendacoes.push('Analisar SOAP Fault para detalhes específicos do erro');
  }

  if (status === 403) {
    recomendacoes.push('Erro 403: Verificar configuração mTLS e certificado');
    recomendacoes.push('Testar com rejectUnauthorized: true');
  }

  if (analiseXML.envelope_soap === 'SOAP 1.2') {
    recomendacoes.push(
      'Considerar mudar para SOAP 1.1 se problemas persistirem'
    );
  }

  if (!resposta || resposta.length === 0) {
    recomendacoes.push('Resposta vazia: Verificar conectividade e timeouts');
  }

  if (recomendacoes.length === 0) {
    recomendacoes.push(
      'Estrutura parece correta - investigar comunicados oficiais do eSocial'
    );
  }

  return recomendacoes;
}
