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

  try {
    console.log('🔍 === COMPARAÇÃO ENVIO vs CONSULTA ===');

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

    // Configuração SSL idêntica
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    const resultados = [];

    // === TESTE 1: URL DE ENVIO (que funciona) ===
    console.log('\n🧪 Testando URL de ENVIO...');
    try {
      const urlEnvio =
        'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc';

      const testeEnvio = await testarConectividade(
        urlEnvio,
        httpsAgent,
        'ENVIO'
      );
      resultados.push({
        tipo: 'ENVIO (que funciona)',
        url: urlEnvio,
        ...testeEnvio,
      });
    } catch (error) {
      resultados.push({
        tipo: 'ENVIO (que funciona)',
        sucesso: false,
        erro: error.message,
      });
    }

    // === TESTE 2: URL DE CONSULTA (que falha) ===
    console.log('\n🧪 Testando URL de CONSULTA...');
    try {
      const urlConsulta =
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';

      const testeConsulta = await testarConectividade(
        urlConsulta,
        httpsAgent,
        'CONSULTA'
      );
      resultados.push({
        tipo: 'CONSULTA (que falha)',
        url: urlConsulta,
        ...testeConsulta,
      });
    } catch (error) {
      resultados.push({
        tipo: 'CONSULTA (que falha)',
        sucesso: false,
        erro: error.message,
      });
    }

    // === TESTE 3: WSDL DE ENVIO ===
    console.log('\n🧪 Testando WSDL de ENVIO...');
    try {
      const wsdlEnvio =
        'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl';

      const testeWsdlEnvio = await testarWSDL(wsdlEnvio, httpsAgent);
      resultados.push({
        tipo: 'WSDL ENVIO',
        url: wsdlEnvio,
        ...testeWsdlEnvio,
      });
    } catch (error) {
      resultados.push({
        tipo: 'WSDL ENVIO',
        sucesso: false,
        erro: error.message,
      });
    }

    // === TESTE 4: WSDL DE CONSULTA ===
    console.log('\n🧪 Testando WSDL de CONSULTA...');
    try {
      const wsdlConsulta =
        'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl';

      const testeWsdlConsulta = await testarWSDL(wsdlConsulta, httpsAgent);
      resultados.push({
        tipo: 'WSDL CONSULTA',
        url: wsdlConsulta,
        ...testeWsdlConsulta,
      });
    } catch (error) {
      resultados.push({
        tipo: 'WSDL CONSULTA',
        sucesso: false,
        erro: error.message,
      });
    }

    // Análise comparativa
    const analise = analisarComparacao(resultados);

    const relatorio = {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        certificado_usado: 'eCPF A1 (mesmo para todos os testes)',
        configuracao_ssl: 'Idêntica para todos os testes',
        resultados_comparativos: resultados,
        analise_comparativa: analise,
        conclusao: gerarConclusaoComparativa(analise),
      },
      message: 'Comparação ENVIO vs CONSULTA concluída',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro na comparação:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha na comparação ENVIO vs CONSULTA',
    });
  }
}

// Testar conectividade básica
async function testarConectividade(
  url: string,
  agent: https.Agent,
  tipo: string
): Promise<any> {
  try {
    console.log(`📡 Testando ${tipo}: ${url}`);

    const response = await axios({
      method: 'HEAD',
      url: url,
      httpsAgent: agent,
      timeout: 15000,
      validateStatus: () => true,
    });

    const resultado = {
      sucesso: response.status < 400,
      status: response.status,
      headers_recebidos: Object.keys(response.headers),
      server: response.headers.server || 'N/A',
      content_type: response.headers['content-type'] || 'N/A',
    };

    console.log(`${tipo} - Status: ${response.status}`);
    return resultado;
  } catch (error) {
    console.log(`${tipo} - Erro: ${error.message}`);
    return {
      sucesso: false,
      erro: error.message,
      codigo_erro: error.code,
    };
  }
}

// Testar WSDL
async function testarWSDL(url: string, agent: https.Agent): Promise<any> {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      httpsAgent: agent,
      timeout: 15000,
      validateStatus: () => true,
    });

    return {
      sucesso: response.status === 200,
      status: response.status,
      tamanho: response.data?.length || 0,
      eh_xml: response.data?.includes('<?xml') || false,
      contem_wsdl:
        response.data?.includes('<wsdl:') ||
        response.data?.includes('<definitions') ||
        false,
      contem_placeholder:
        response.data?.includes('{endereco_ambiente_acessar_}') || false,
    };
  } catch (error) {
    return {
      sucesso: false,
      erro: error.message,
    };
  }
}

// Analisar comparação
function analisarComparacao(resultados: any[]): any {
  const envio = resultados.find(r => r.tipo.includes('ENVIO'));
  const consulta = resultados.find(r => r.tipo.includes('CONSULTA'));
  const wsdlEnvio = resultados.find(r => r.tipo === 'WSDL ENVIO');
  const wsdlConsulta = resultados.find(r => r.tipo === 'WSDL CONSULTA');

  return {
    envio_funciona: envio?.sucesso || false,
    consulta_funciona: consulta?.sucesso || false,
    wsdl_envio_acessivel: wsdlEnvio?.sucesso || false,
    wsdl_consulta_acessivel: wsdlConsulta?.sucesso || false,

    status_envio: envio?.status,
    status_consulta: consulta?.status,

    diferenca_status: envio?.status !== consulta?.status,
    diferenca_servidor: envio?.server !== consulta?.server,

    problema_identificado: identificarProblemaComparativo(
      envio,
      consulta,
      wsdlEnvio,
      wsdlConsulta
    ),
  };
}

// Identificar problema comparativo
function identificarProblemaComparativo(
  envio: any,
  consulta: any,
  wsdlEnvio: any,
  wsdlConsulta: any
): string {
  if (envio?.sucesso && !consulta?.sucesso) {
    if (consulta?.status === 403) {
      return 'ENVIO funciona mas CONSULTA retorna 403 - problema de permissão específica para consultas';
    }
    return 'ENVIO funciona mas CONSULTA falha - serviços têm configurações diferentes';
  }

  if (wsdlEnvio?.sucesso && !wsdlConsulta?.sucesso) {
    return 'WSDL de envio acessível mas WSDL de consulta não - serviços de consulta podem estar restritos';
  }

  if (!envio?.sucesso && !consulta?.sucesso) {
    return 'Ambos falham - problema geral de certificado ou conectividade';
  }

  return 'Comportamento inesperado - analisar detalhes específicos';
}

// Gerar conclusão comparativa
function gerarConclusaoComparativa(analise: any): string {
  if (analise.envio_funciona && !analise.consulta_funciona) {
    return `🎯 CONCLUSÃO: Certificado funciona para ENVIO mas não para CONSULTA (${analise.status_consulta}). Isso indica que consultas podem ter restrições específicas de permissão ou ter sido parcialmente descontinuadas.`;
  }

  if (analise.wsdl_envio_acessivel && !analise.wsdl_consulta_acessivel) {
    return '🎯 CONCLUSÃO: WSDLs de consulta não acessíveis - serviços de consulta podem estar restritos ou descontinuados.';
  }

  if (!analise.envio_funciona && !analise.consulta_funciona) {
    return '🎯 CONCLUSÃO: Problema geral de certificado ou configuração SSL.';
  }

  return '🎯 CONCLUSÃO: Comportamento inesperado - necessária análise mais detalhada.';
}
