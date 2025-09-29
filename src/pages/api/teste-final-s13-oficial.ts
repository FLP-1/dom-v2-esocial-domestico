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

    // === ESTRUTURAS XML OFICIAIS S-1.3 ===
    const estruturasOficiais = [
      {
        nome: 'Estrutura Padrão S-1.3 (Manual)',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
      },
      {
        nome: 'Estrutura Alternativa S-1.3',
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
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
      },
      {
        nome: 'Estrutura Mínima S-1.3',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <protocoloEnvio>${protocolo}</protocoloEnvio>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
      },
    ];

    const url =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';
    const resultados = [];

    // Configuração SSL otimizada
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    for (const estrutura of estruturasOficiais) {
      try {
        const response = await axios({
          method: 'POST',
          url: url,
          data: estrutura.xml,
          headers: {
            'Content-Type': 'text/xml; charset=utf-8',
            SOAPAction: estrutura.soapAction,
            Accept: 'text/xml',
            'User-Agent': 'eSocial-S13-Client/1.0',
            'Cache-Control': 'no-cache',
          },
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const analise = analisarRespostaDetalhada(response);

        resultados.push({
          nome: estrutura.nome,
          sucesso: response.status === 200 && !analise.contem_erro,
          status: response.status,
          analise: analise,
          xml_usado: estrutura.xml,
        });

        if (response.status === 200) {
          break; // Parar no primeiro sucesso
        }
      } catch (error) {
        resultados.push({
          nome: estrutura.nome,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // === COMPILAR RESULTADO FINAL ===
    const estruturaFuncional = resultados.find(r => r.sucesso);
    const todasFalham = resultados.every(r => !r.sucesso);

    const relatorio = {
      success: true,
      data: {
        protocolo_testado: protocolo,
        url_testada: url,
        certificado: {
          cpf: '59876913700',
          valido: true,
          emissor: 'AC Certisign RFB G5',
        },
        estruturas_testadas: resultados,
        resultado_final: {
          alguma_funcionou: !todasFalham,
          estrutura_funcional: estruturaFuncional?.nome || 'Nenhuma',
          xml_funcional: estruturaFuncional?.xml_usado || null,
          status_predominante: obterStatusPredominante(resultados),
          conclusao: gerarConclusaoFinal(resultados, estruturaFuncional),
        },
        proximos_passos: gerarProximosPassos(resultados, estruturaFuncional),
      },
      message: 'Teste final S-1.3 oficial concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste final:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste final S-1.3',
    });
  }
}

// Analisar resposta detalhadamente
function analisarRespostaDetalhada(response: any): any {
  const conteudo = response.data || '';

  return {
    eh_xml: conteudo.includes('<?xml') || conteudo.includes('<soap:'),
    eh_html: conteudo.includes('<html') || conteudo.includes('<!DOCTYPE'),
    contem_soap_fault:
      conteudo.includes('<soap:Fault>') || conteudo.includes('<faultstring>'),
    contem_erro:
      conteudo.includes('<erro>') ||
      conteudo.includes('error') ||
      conteudo.includes('fault'),
    contem_dados_validos:
      conteudo.includes('<dados>') ||
      conteudo.includes('<evento>') ||
      conteudo.includes('<retorno>'),
    tamanho: conteudo.length,
    primeiras_linhas: conteudo.split('\n').slice(0, 3).join('\\n'),
    erro_especifico: extrairErroEspecifico(conteudo),
  };
}

// Extrair erro específico
function extrairErroEspecifico(conteudo: string): string | null {
  const patterns = [
    /<faultstring>(.*?)<\/faultstring>/,
    /<title>(.*?)<\/title>/,
    /<erro>(.*?)<\/erro>/,
    /<message>(.*?)<\/message>/,
  ];

  for (const pattern of patterns) {
    const match = conteudo.match(pattern);
    if (match) return match[1];
  }

  return null;
}

// Obter status predominante
function obterStatusPredominante(resultados: any[]): number | null {
  const status = resultados.map(r => r.status).filter(Boolean);
  if (status.length === 0) return null;

  return status.reduce((a, b) =>
    status.filter(v => v === a).length >= status.filter(v => v === b).length
      ? a
      : b
  );
}

// Gerar conclusão final
function gerarConclusaoFinal(
  resultados: any[],
  estruturaFuncional: any
): string {
  if (estruturaFuncional) {
    return `✅ SOLUÇÃO ENCONTRADA! A estrutura "${estruturaFuncional.nome}" funciona para consultas S-1.3.`;
  }

  const statusPredominante = obterStatusPredominante(resultados);

  if (statusPredominante === 403) {
    return '🔒 Todas as estruturas retornam 403 - problema de autorização específico para consultas, mesmo com certificado válido.';
  }

  if (statusPredominante === 404) {
    return '❌ Todas as estruturas retornam 404 - endpoint pode estar incorreto ou descontinuado.';
  }

  if (statusPredominante === 500) {
    return '💥 Todas as estruturas retornam 500 - problema no servidor ou estrutura XML ainda incorreta.';
  }

  return '❓ Comportamento inconsistente - necessária investigação adicional.';
}

// Gerar próximos passos
function gerarProximosPassos(
  resultados: any[],
  estruturaFuncional: any
): string[] {
  if (estruturaFuncional) {
    return [
      'Implementar a estrutura XML funcional no código principal',
      'Testar com outros protocolos para confirmar funcionamento',
      'Documentar a estrutura correta para uso futuro',
    ];
  }

  const todasSao403 = resultados.every(r => r.status === 403);

  if (todasSao403) {
    return [
      'Contatar suporte eSocial sobre permissões para consultas',
      'Verificar se há configuração adicional necessária no portal',
      'Considerar usar método alternativo (portal web) temporariamente',
      'Investigar se consultas requerem habilitação específica',
    ];
  }

  return [
    'Buscar documentação técnica S-1.3 mais específica',
    'Testar em ambiente de produção restrita primeiro',
    'Considerar método alternativo se SOAP não funcionar',
  ];
}
