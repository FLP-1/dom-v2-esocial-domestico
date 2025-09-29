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

    // === VARIAÇÕES DE NAMESPACE ENCONTRADAS NA COMUNIDADE ===
    const variacoesNamespace = [
      {
        nome: 'C# .NET - v1_3_0 (Stack Overflow)',
        namespace:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos',
        versao: 'v1_3_0',
        fonte: 'C# .NET Community',
      },
      {
        nome: 'PHP nfephp - v_S_01_03_00',
        namespace:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v_S_01_03_00',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v_S_01_03_00/ConsultarLoteEventos',
        versao: 'S_01_03_00',
        fonte: 'PHP nfephp Community',
      },
      {
        nome: 'Delphi ACBr - ve2402 equivalente',
        namespace:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v2_4_02',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v2_4_02/ConsultarLoteEventos',
        versao: 've2402',
        fonte: 'Delphi ACBr Community',
      },
      {
        nome: 'Variação Schema evt (nfephp)',
        namespace:
          'http://www.esocial.gov.br/schema/evt/evtTransmissao/v_S_01_03_00',
        soapAction:
          'http://www.esocial.gov.br/schema/evt/evtTransmissao/v_S_01_03_00/ConsultarLoteEventos',
        versao: 'schema_S_01_03_00',
        fonte: 'nfephp Schema Community',
      },
      {
        nome: 'Variação Lote Eventos',
        namespace:
          'http://www.esocial.gov.br/schema/lote/eventos/consulta/v1_3_0',
        soapAction:
          'http://www.esocial.gov.br/schema/lote/eventos/consulta/v1_3_0/ConsultarLoteEventos',
        versao: 'lote_v1_3_0',
        fonte: 'Community Experimental',
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

    for (const variacao of variacoesNamespace) {
      try {
        // === TRADUÇÃO PARA TYPESCRIPT ===

        // XML baseado na estrutura C#/.NET
        const xmlCSharp = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="${variacao.namespace}">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;

        // Headers baseados em C# .NET
        const headers = {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: `"${variacao.soapAction}"`,
          Accept: 'text/xml',
          'User-Agent': `TypeScript-${variacao.fonte}/1.0`,
          'X-eSocial-Version': variacao.versao,
          'Cache-Control': 'no-cache',
        };

        const response = await axios({
          method: 'POST',
          url: url,
          data: xmlCSharp,
          headers: headers,
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const analise = analisarRespostaNamespace(response, variacao);

        resultados.push({
          nome: variacao.nome,
          fonte: variacao.fonte,
          namespace: variacao.namespace,
          versao: variacao.versao,
          sucesso: response.status === 200 && analise.funcionou,
          status: response.status,
          analise: analise,
          xml_usado: xmlCSharp,
          headers_usados: headers,
        });

        if (response.status === 200 && analise.funcionou) {
          // Salvar solução funcional
          await salvarSolucaoFuncional(variacao, xmlCSharp, headers);
          break;
        } else if (response.status !== 403) {
        }
      } catch (error) {
        resultados.push({
          nome: variacao.nome,
          fonte: variacao.fonte,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // === ANÁLISE DOS RESULTADOS ===
    const solucaoFuncional = resultados.find(r => r.sucesso);
    const melhorStatus = Math.max(...resultados.map(r => r.status || 0));
    const statusDiferentes = [...new Set(resultados.map(r => r.status))];

    const relatorio = {
      success: true,
      data: {
        traducoes_testadas: resultados.length,
        protocolo_testado: protocolo,
        variações_namespace: resultados,
        resultado_final: {
          alguma_funcionou: !!solucaoFuncional,
          namespace_funcional:
            solucaoFuncional?.namespace || 'Nenhum funcionou',
          versao_funcional: solucaoFuncional?.versao || 'Nenhuma',
          fonte_solucao: solucaoFuncional?.fonte || 'N/A',
          melhor_status: melhorStatus,
          status_diferentes: statusDiferentes,
        },
        descobertas: {
          namespace_faz_diferenca: statusDiferentes.length > 1,
          algum_namespace_melhora: melhorStatus > 403,
          problema_persiste: !solucaoFuncional,
          traducao_typescript: solucaoFuncional ? 'Sucesso' : 'Todas falharam',
        },
        proximos_passos: gerarProximosPassosNamespace(
          resultados,
          solucaoFuncional
        ),
      },
      message: 'Teste de namespaces da comunidade concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste de namespaces',
    });
  }
}

// Analisar resposta específica por namespace
function analisarRespostaNamespace(response: any, variacao: any): any {
  const conteudo = response.data || '';

  return {
    funcionou: response.status === 200 && !conteudo.includes('<soap:Fault>'),
    status_melhorou: response.status !== 403,
    eh_xml: conteudo.includes('<?xml'),
    contem_dados:
      conteudo.includes('<dados>') ||
      conteudo.includes('<evento>') ||
      conteudo.includes('<retorno>'),
    erro_namespace:
      conteudo.includes('namespace') && conteudo.includes('não reconhecido'),
    erro_versao:
      conteudo.includes('versão') && conteudo.includes('não suportada'),
    tamanho_resposta: conteudo.length,
    namespace_testado: variacao.namespace,
    versao_testada: variacao.versao,
  };
}

// Salvar solução funcional para uso futuro
async function salvarSolucaoFuncional(
  variacao: any,
  xml: string,
  headers: any
): Promise<void> {
  try {
    const solucao = {
      timestamp: new Date().toISOString(),
      fonte: variacao.fonte,
      namespace_funcional: variacao.namespace,
      versao_funcional: variacao.versao,
      xml_funcional: xml,
      headers_funcionais: headers,
      status: 'SOLUÇÃO ENCONTRADA',
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'solucao-namespace-funcional.json'),
      JSON.stringify(solucao, null, 2)
    );
  } catch (error) {}
}

// Gerar próximos passos baseados nos namespaces
function gerarProximosPassosNamespace(
  resultados: any[],
  solucaoFuncional: any
): string[] {
  if (solucaoFuncional) {
    return [
      `Implementar namespace ${solucaoFuncional.versao} no código principal`,
      `Atualizar todos os métodos para usar ${solucaoFuncional.namespace}`,
      'Testar outros tipos de consulta com namespace funcional',
      'Documentar namespace correto para comunidade TypeScript',
      'Compartilhar solução nos fóruns brasileiros',
    ];
  }

  const statusMelhorou = resultados.some(r => r.status !== 403);
  const statusDiferentes = [...new Set(resultados.map(r => r.status))];

  if (statusMelhorou) {
    return [
      'Algum namespace melhorou o status - investigar variações específicas',
      'Testar combinações de namespaces que deram status diferente',
      'Buscar documentação específica sobre namespace que funcionou parcialmente',
    ];
  }

  if (statusDiferentes.length === 1 && statusDiferentes[0] === 403) {
    return [
      'Todos os namespaces retornam 403 - problema não é namespace',
      'Investigar se consultas requerem habilitação específica no portal',
      'Contatar suporte eSocial com evidência de que problema não é técnico',
      'Implementar solução híbrida (SOAP envios + Portal consultas)',
    ];
  }

  return [
    'Continuar testando variações de namespace baseadas na comunidade',
    'Buscar soluções mais recentes nos fóruns ACBr e nfephp',
    'Considerar que problema pode ser temporário pós-migração S-1.3',
  ];
}
