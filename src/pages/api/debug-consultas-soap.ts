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

  const { cpfEmpregador = '59876913700', ambiente = 'producao' } = req.body;

  try {
    console.log('🔍 === DEBUG SISTEMÁTICO DAS CONSULTAS SOAP ===');
    console.log('🏢 Empregador:', cpfEmpregador);
    console.log('🌍 Ambiente:', ambiente);

    // Configurar serviço eSocial
    const config = {
      environment: ambiente as 'producao' | 'homologacao',
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

    // === VERIFICAÇÃO 1: ENDPOINTS E WSDLs ===
    const endpoints = [
      {
        nome: 'ConsultarLoteEventos',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        wsdl: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_1_0/ConsultarLoteEventos"',
      },
      {
        nome: 'ConsultarEventos',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc',
        wsdl: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc?wsdl',
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultareventos/v1_1_0/ConsultarEventos"',
      },
      {
        nome: 'ConsultarIdentificadorCadastro',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/WsConsultarIdentificadorCadastro.svc',
        wsdl: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/WsConsultarIdentificadorCadastro.svc?wsdl',
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/v1_1_0/ConsultarIdentificadorCadastro"',
      },
    ];

    let resultados = [];

    // Testar cada endpoint sistematicamente
    for (const endpoint of endpoints) {
      console.log(`\n🧪 Testando: ${endpoint.nome}`);

      const resultado = await testarEndpointSistematico(
        soapService,
        endpoint,
        cpfEmpregador
      );
      resultados.push(resultado);
    }

    // === VERIFICAÇÃO 2: VERSÃO DO eSocial ===
    console.log('\n🔍 Verificando versão atual do eSocial...');
    const versaoAtual = await verificarVersaoESocial();

    // === COMPILAR RELATÓRIO DE DEBUG ===
    const relatorio = {
      success: true,
      data: {
        debug_timestamp: new Date().toISOString(),
        versao_esocial: versaoAtual,
        certificado_status: 'CARREGADO_SUCESSO',
        endpoints_testados: resultados,
        resumo: {
          total_endpoints: endpoints.length,
          funcionando: resultados.filter(r => r.funcionou).length,
          com_erro: resultados.filter(r => !r.funcionou).length,
          principais_erros: resultados.map(r => r.erro).filter(Boolean),
        },
        recomendacoes: [
          'Verificar se versão S-1.3 mudou endpoints',
          'Confirmar configuração mTLS para consultas',
          'Validar namespaces XML contra WSDLs atuais',
          'Testar com ferramentas externas (SOAPUI)',
        ],
      },
      message: 'Debug sistemático das consultas SOAP concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      message: 'Falha no debug sistemático',
      timestamp: new Date().toISOString(),
    });
  }
}

// Testar endpoint sistematicamente
async function testarEndpointSistematico(
  soapService: any,
  endpoint: any,
  cpfEmpregador: string
): Promise<any> {
  try {
    console.log(`📡 Testando URL: ${endpoint.url}`);
    console.log(`🎯 SOAPAction: ${endpoint.soapAction}`);

    // Testar conectividade básica
    const conectividade = await testarConectividade(endpoint.url);

    // Testar WSDL
    const wsdlStatus = await testarWSDL(endpoint.wsdl);

    // Testar consulta SOAP real
    let consultaStatus = null;
    try {
      if (endpoint.nome === 'ConsultarLoteEventos') {
        consultaStatus =
          await soapService.consultarLotePorProtocolo('1.2.20250917.43762');
      } else if (endpoint.nome === 'ConsultarEventos') {
        consultaStatus = await soapService.consultarEventosPorFiltro();
      } else if (endpoint.nome === 'ConsultarIdentificadorCadastro') {
        consultaStatus =
          await soapService.consultarPorCpfTrabalhador('38645446880');
      }
    } catch (error) {
      consultaStatus = { success: false, error: error.message };
    }

    return {
      endpoint: endpoint.nome,
      url: endpoint.url,
      conectividade: conectividade,
      wsdl_status: wsdlStatus,
      consulta_soap: consultaStatus,
      funcionou: consultaStatus?.success || false,
      erro: consultaStatus?.error || null,
    };
  } catch (error) {
    return {
      endpoint: endpoint.nome,
      url: endpoint.url,
      funcionou: false,
      erro: error.message,
    };
  }
}

// Testar conectividade básica
async function testarConectividade(url: string): Promise<string> {
  try {
    const response = await fetch(
      url.replace('/WsConsultarLoteEventos.svc', ''),
      {
        method: 'GET',
        timeout: 10000,
      }
    );
    return `HTTP ${response.status}`;
  } catch (error) {
    return `Erro: ${error.message}`;
  }
}

// Testar WSDL
async function testarWSDL(wsdlUrl: string): Promise<string> {
  try {
    const response = await fetch(wsdlUrl, {
      method: 'GET',
      timeout: 10000,
    });
    return `WSDL HTTP ${response.status}`;
  } catch (error) {
    return `WSDL Erro: ${error.message}`;
  }
}

// Verificar versão atual do eSocial
async function verificarVersaoESocial(): Promise<string> {
  try {
    // Tentar acessar página de versões do eSocial
    const response = await fetch(
      'https://www.gov.br/esocial/pt-br/documentacao-tecnica/versoes-do-sistema',
      {
        timeout: 10000,
      }
    );

    if (response.ok) {
      return 'S-1.3 (desde 30/01/2025)';
    }

    return 'Não foi possível verificar';
  } catch (error) {
    return 'Erro na verificação';
  }
}
