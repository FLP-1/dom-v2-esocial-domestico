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
    console.log('🧪 === TESTE XML ALTERNATIVO ===');

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

    // === ESTRUTURAS XML ALTERNATIVAS ===
    const estruturasXML = [
      {
        nome: 'XML Atual (que usamos)',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <cons:ConsultarLoteEventos xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <cons:ideEmpregador>
        <cons:tpInsc>2</cons:tpInsc>
        <cons:nrInsc>59876913700</cons:nrInsc>
      </cons:ideEmpregador>
      <cons:protocolo>${protocolo}</cons:protocolo>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
      },
      {
        nome: 'XML Simplificado (só protocolo)',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <cons:ConsultarLoteEventos xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <cons:consulta>
        <cons:protocolo>${protocolo}</cons:protocolo>
      </cons:consulta>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
      },
      {
        nome: 'XML com namespace v1_1_0 (versão anterior)',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <cons:ConsultarLoteEventos xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_1_0">
      <cons:ideEmpregador>
        <cons:tpInsc>2</cons:tpInsc>
        <cons:nrInsc>59876913700</cons:nrInsc>
      </cons:ideEmpregador>
      <cons:protocolo>${protocolo}</cons:protocolo>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
      },
      {
        nome: 'XML com estrutura mínima',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <protocolo>${protocolo}</protocolo>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
      },
    ];

    const resultados = [];

    // Configuração SSL que funcionou
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    const url =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';

    for (const estrutura of estruturasXML) {
      console.log(`\n🧪 Testando: ${estrutura.nome}`);

      try {
        const resultado = await testarEstruturalXML(
          url,
          estrutura.xml,
          httpsAgent
        );

        resultados.push({
          nome: estrutura.nome,
          sucesso: resultado.status === 200,
          status: resultado.status,
          tamanho_resposta: resultado.data?.length || 0,
          contem_soap_fault: resultado.data?.includes('<soap:Fault>') || false,
          contem_sucesso:
            resultado.data?.includes('sucesso') ||
            resultado.data?.includes('success') ||
            false,
          erro: resultado.status !== 200 ? `HTTP ${resultado.status}` : null,
          primeiras_linhas:
            resultado.data?.split('\n').slice(0, 3).join('\\n') || '',
        });

        if (resultado.status === 200) {
          console.log(`✅ XML funcionou! Status: ${resultado.status}`);
        } else {
          console.log(`❌ XML falhou. Status: ${resultado.status}`);
        }
      } catch (error) {
        resultados.push({
          nome: estrutura.nome,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // Análise dos resultados
    const melhorEstrutura = resultados.find(r => r.sucesso);
    const analise = analisarResultados(resultados);

    const relatorio = {
      success: true,
      data: {
        protocolo_testado: protocolo,
        estruturas_testadas: resultados,
        melhor_estrutura: melhorEstrutura?.nome || 'Nenhuma funcionou',
        analise: analise,
        descobertas: {
          alguma_estrutura_funciona: resultados.some(r => r.sucesso),
          todas_retornam_403: resultados.every(r => r.status === 403),
          problema_identificado: identificarProblema(resultados),
        },
      },
      message: 'Teste de estruturas XML alternativas concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste XML alternativo',
    });
  }
}

// Testar estrutura XML específica
async function testarEstruturalXML(
  url: string,
  xml: string,
  agent: https.Agent
): Promise<any> {
  try {
    const response = await axios({
      method: 'POST',
      url: url,
      data: xml,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
        Accept: 'text/xml',
      },
      httpsAgent: agent,
      timeout: 30000,
      validateStatus: () => true, // Aceitar qualquer status
    });

    return {
      status: response.status,
      data: response.data,
      headers: response.headers,
    };
  } catch (error) {
    throw new Error(`Erro na requisição: ${error.message}`);
  }
}

// Analisar resultados dos testes
function analisarResultados(resultados: any[]): any {
  const status = resultados.map(r => r.status).filter(Boolean);
  const erros = resultados.map(r => r.erro).filter(Boolean);

  return {
    status_mais_comum:
      status.length > 0
        ? status.reduce((a, b) =>
            status.filter(v => v === a).length >=
            status.filter(v => v === b).length
              ? a
              : b
          )
        : null,
    erros_unicos: [...new Set(erros)],
    todas_estruturas_falham: resultados.every(r => !r.sucesso),
    alguma_tem_resposta: resultados.some(r => r.tamanho_resposta > 0),
  };
}

// Identificar problema principal
function identificarProblema(resultados: any[]): string {
  if (resultados.every(r => r.status === 403)) {
    return 'Todas retornam 403 - problema de autenticação/autorização';
  }

  if (resultados.every(r => r.status === 404)) {
    return 'Todas retornam 404 - endpoint não encontrado';
  }

  if (resultados.every(r => r.status === 500)) {
    return 'Todas retornam 500 - problema no servidor ou XML malformado';
  }

  if (resultados.some(r => r.sucesso)) {
    return 'Alguma estrutura XML funciona - usar a que deu certo';
  }

  return 'Problema não identificado - pode ser infraestrutural';
}
