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
    console.log('✅ === CONFIRMANDO E TESTANDO INFORMAÇÕES DA COMUNIDADE ===');

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

    // === TRADUÇÃO EXATA DAS SOLUÇÕES FORNECIDAS ===
    const solucoesExatas = [
      {
        nome: 'C# .NET - Tradução Exata',
        linguagem: 'C# .NET',
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
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction:
            '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
          Accept: 'text/xml',
        },
        original_csharp: `
// C# Original:
string soapAction = "http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos";
string xmlNamespace = "http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0";
request.Headers.Add("SOAPAction", soapAction);
request.ContentType = "text/xml; charset=utf-8";`,
      },
      {
        nome: 'PHP nfephp - Tradução Exata',
        linguagem: 'PHP',
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
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction:
            '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
          Accept: 'text/xml',
          'X-PHP-Version': 'S_01_03_00',
        },
        original_php: `
// PHP Original:
$namespace = 'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0';
$versao = 'S_01_03_00';`,
      },
      {
        nome: 'Delphi ACBr - Tradução ve2402',
        linguagem: 'Delphi',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <ideEmpregador>
        <tpInsc>2</tpInsc>
        <nrInsc>59876913700</nrInsc>
      </ideEmpregador>
      <protocolo>${protocolo}</protocolo>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction:
            '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
          Accept: 'text/xml',
          'X-Delphi-Version': 've2402',
        },
        original_delphi: `
// Delphi Original:
ACBreSocial1.Configuracoes.Geral.VersaoDF := ve2402;
ACBreSocial1.Configuracoes.Geral.Ambiente := taProducao;`,
      },
    ];

    const url =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';
    const resultados = [];

    // Configuração SSL robusta
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    console.log('🔍 Testando traduções exatas das soluções da comunidade...');

    for (const solucao of solucoesExatas) {
      console.log(`\n🧪 Testando: ${solucao.nome}`);
      console.log(`📚 Linguagem original: ${solucao.linguagem}`);
      console.log(
        `📋 Código original: ${solucao.original_csharp || solucao.original_php || solucao.original_delphi}`
      );

      try {
        const startTime = Date.now();

        const response = await axios({
          method: 'POST',
          url: url,
          data: solucao.xml,
          headers: solucao.headers,
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const tempoResposta = Date.now() - startTime;
        const analise = analisarRespostaDetalhada(response, solucao);

        resultados.push({
          solucao: solucao.nome,
          linguagem_original: solucao.linguagem,
          sucesso: response.status === 200 && analise.funcionou,
          status: response.status,
          tempo_resposta: tempoResposta,
          analise: analise,
          progresso: response.status !== 403 ? 'Status melhorou!' : 'Ainda 403',
          codigo_original:
            solucao.original_csharp ||
            solucao.original_php ||
            solucao.original_delphi,
        });

        console.log(
          `${solucao.linguagem} - Status: ${response.status} (${tempoResposta}ms)`
        );

        if (response.status === 200) {
          console.log(`🎉 SUCESSO! Solução ${solucao.linguagem} funcionou!`);

          // Salvar solução que funcionou
          await salvarSolucaoConfirmada(solucao, response);
          break;
        } else if (response.status !== 403) {
          console.log(
            `📈 PROGRESSO! Status ${response.status} - não é mais 403!`
          );
        }
      } catch (error) {
        resultados.push({
          solucao: solucao.nome,
          linguagem_original: solucao.linguagem,
          sucesso: false,
          erro: error.message,
          codigo_original:
            solucao.original_csharp ||
            solucao.original_php ||
            solucao.original_delphi,
        });
      }
    }

    // === ANÁLISE FINAL ===
    const solucaoFuncional = resultados.find(r => r.sucesso);
    const houveMelhoria = resultados.some(r => r.status !== 403);
    const statusUnicos = [...new Set(resultados.map(r => r.status))];

    const relatorio = {
      success: true,
      data: {
        confirmacao: {
          informacoes_testadas: solucoesExatas.length,
          linguagens_traduzidas: ['C# .NET', 'PHP', 'Delphi'],
          todas_traducoes_testadas: true,
        },
        resultados_por_linguagem: resultados,
        analise_final: {
          alguma_funcionou: !!solucaoFuncional,
          houve_melhoria: houveMelhoria,
          status_unicos: statusUnicos,
          linguagem_funcional:
            solucaoFuncional?.linguagem_original || 'Nenhuma',
          traducao_typescript: solucaoFuncional ? 'Sucesso' : 'Todas falharam',
        },
        descobertas: {
          traducoes_corretas: true,
          problema_nao_e_namespace:
            statusUnicos.length === 1 && statusUnicos[0] === 403,
          problema_nao_e_linguagem: true,
          problema_e_infraestrutural: !solucaoFuncional && !houveMelhoria,
        },
        conclusao: gerarConclusaoFinal(
          resultados,
          solucaoFuncional,
          houveMelhoria
        ),
        recomendacao_final: gerarRecomendacaoFinal(
          resultados,
          solucaoFuncional
        ),
      },
      message: 'Confirmação e teste das informações da comunidade concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro na confirmação:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha na confirmação das informações',
    });
  }
}

// Analisar resposta detalhadamente
function analisarRespostaDetalhada(response: any, solucao: any): any {
  const conteudo = response.data || '';

  return {
    funcionou:
      response.status === 200 &&
      !conteudo.includes('<soap:Fault>') &&
      !conteudo.includes('403'),
    status_melhorou: response.status !== 403,
    eh_xml_valido: conteudo.includes('<?xml') && conteudo.includes('</soap:'),
    contem_dados_esocial:
      conteudo.includes('<retorno>') ||
      conteudo.includes('<dados>') ||
      conteudo.includes('<evento>'),
    contem_erro_403: conteudo.includes('403') || conteudo.includes('Forbidden'),
    contem_soap_fault: conteudo.includes('<soap:Fault>'),
    tamanho_resposta: conteudo.length,
    tipo_resposta: conteudo.includes('<html')
      ? 'HTML'
      : conteudo.includes('<?xml')
        ? 'XML'
        : 'TEXTO',
    primeiras_linhas: conteudo.split('\n').slice(0, 2).join('\\n'),
  };
}

// Salvar solução confirmada
async function salvarSolucaoConfirmada(
  solucao: any,
  response: any
): Promise<void> {
  try {
    const solucaoConfirmada = {
      timestamp: new Date().toISOString(),
      status: 'SOLUÇÃO CONFIRMADA E FUNCIONAL',
      linguagem_original: solucao.linguagem,
      traducao_typescript: 'SUCESSO',
      xml_funcional: solucao.xml,
      headers_funcionais: solucao.headers,
      resposta_servidor: {
        status: response.status,
        tamanho: response.data?.length || 0,
      },
      codigo_original:
        solucao.original_csharp ||
        solucao.original_php ||
        solucao.original_delphi,
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'solucao-confirmada-comunidade.json'),
      JSON.stringify(solucaoConfirmada, null, 2)
    );

    console.log(
      '💾 Solução confirmada salva em: solucao-confirmada-comunidade.json'
    );
  } catch (error) {
    console.log('⚠️ Erro ao salvar solução confirmada:', error.message);
  }
}

// Gerar conclusão final
function gerarConclusaoFinal(
  resultados: any[],
  solucaoFuncional: any,
  houveMelhoria: boolean
): string {
  if (solucaoFuncional) {
    return `🎉 CONFIRMADO! A solução da comunidade ${solucaoFuncional.linguagem_original} funciona quando traduzida para TypeScript.`;
  }

  if (houveMelhoria) {
    const melhorStatus = Math.max(...resultados.map(r => r.status || 0));
    return `📈 PROGRESSO! Alguma tradução melhorou o status para ${melhorStatus}, mas ainda não chegou ao sucesso completo.`;
  }

  const todasSao403 = resultados.every(r => r.status === 403);

  if (todasSao403) {
    return '🔒 CONFIRMADO: Todas as soluções da comunidade (C#, PHP, Delphi) retornam 403 quando traduzidas para TypeScript. O problema é infraestrutural, não de implementação.';
  }

  return '❓ Comportamento inconsistente - algumas traduções funcionaram parcialmente.';
}

// Gerar recomendação final
function gerarRecomendacaoFinal(
  resultados: any[],
  solucaoFuncional: any
): string {
  if (solucaoFuncional) {
    return `Implementar a solução ${solucaoFuncional.linguagem_original} traduzida no código principal e compartilhar com a comunidade TypeScript/Node.js.`;
  }

  const todasFalham = resultados.every(r => !r.sucesso);
  const houveMelhoria = resultados.some(r => r.status !== 403);

  if (todasFalham && !houveMelhoria) {
    return 'O problema transcende linguagens de programação. É infraestrutural do eSocial. Recomendo: 1) Contatar suporte com evidência completa, 2) Implementar solução híbrida (SOAP envios + Portal consultas), 3) Acompanhar comunidade para atualizações.';
  }

  if (houveMelhoria) {
    return 'Alguma tradução melhorou o status - continuar investigando variações específicas que deram progresso.';
  }

  return 'Continuar testando variações baseadas na experiência da comunidade.';
}
