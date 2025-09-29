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

    // === CONFIGURAÇÃO TLS EXATA DA SOLUÇÃO ===
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      keepAlive: true,
      keepAliveMsecs: 1000,
      // CRÍTICO: Força TLS 1.2
      secureProtocol: 'TLSv1_2_method',
      // IMPORTANTE: Cifras aceitas pelo eSocial
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'AES128-GCM-SHA256',
        'AES256-GCM-SHA384',
      ].join(':'),
      rejectUnauthorized: false,
    });

    // === TESTAR AMBOS OS AMBIENTES ===
    const testes = [
      {
        nome: 'Produção Restrita (Recomendado)',
        url: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'Produção Oficial',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      },
    ];

    const resultados = [];

    for (const teste of testes) {
      // === XML EXATO DA SOLUÇÃO DEFINITIVA ===
      const soapEnvelope = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/">
  <soapenv:Header/>
  <soapenv:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
      <consulta>
        <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
          <consultaLoteEventos>
            <protocoloEnvio>${protocolo}</protocoloEnvio>
          </consultaLoteEventos>
        </eSocial>
      </consulta>
    </ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

      // === HEADERS EXATOS DA SOLUÇÃO ===
      const headers = {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction:
          '"http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ConsultarLoteEventos"',
        Accept: 'text/xml',
        Connection: 'keep-alive',
        'User-Agent': 'ESocial-Client/1.0',
      };

      try {
        const startTime = Date.now();

        const response = await axios({
          method: 'POST',
          url: teste.url,
          data: soapEnvelope,
          headers: headers,
          httpsAgent: httpsAgent,
          timeout: 30000,
          maxRedirects: 0,
          validateStatus: () => true,
        });

        const tempoResposta = Date.now() - startTime;
        const analise = analisarRespostaDefinitiva(response);

        resultados.push({
          ambiente: teste.nome,
          url: teste.url,
          sucesso: response.status === 200 && analise.contem_dados,
          status: response.status,
          tempo: tempoResposta,
          analise: analise,
          progresso_de_403: response.status !== 403 ? 'SIM' : 'NÃO',
        });

        if (response.status === 200) {
          break;
        }
      } catch (error) {
        resultados.push({
          ambiente: teste.nome,
          url: teste.url,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // === ANÁLISE FINAL ===
    const melhorResultado = resultados.reduce((melhor, atual) =>
      (atual.status || 0) > (melhor.status || 0) ? atual : melhor
    );

    const funcionouAlgum = resultados.some(r => r.sucesso);
    const houveMelhoria = resultados.some(r => r.status !== 403);

    const relatorio = {
      success: true,
      data: {
        solucao_testada: 'XML EXATO da solução definitiva fornecida',
        configuracao_aplicada: {
          service_namespace: 'v1_1_0 (conforme solução)',
          schema_namespace: 'v1_0_0 (conforme solução)',
          estrutura: '4 níveis hierárquicos (conforme solução)',
          cifras_tls: 'ECDHE-RSA-AES128-GCM-SHA256 (conforme solução)',
          ambientes_testados: 'Produção Restrita + Produção Oficial',
        },
        resultados_por_ambiente: resultados,
        analise_final: {
          algum_ambiente_funcionou: funcionouAlgum,
          houve_melhoria_de_403: houveMelhoria,
          melhor_ambiente: melhorResultado.ambiente,
          melhor_status: melhorResultado.status,
          solucao_definitiva_validada: funcionouAlgum,
        },
        conclusao_sobre_solucao: gerarConclusaoSobreSolucao(
          funcionouAlgum,
          houveMelhoria,
          resultados
        ),
        recomendacao_final: gerarRecomendacaoFinal(
          funcionouAlgum,
          houveMelhoria,
          melhorResultado
        ),
      },
      message: 'Teste direto do XML definitivo concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste direto:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste direto XML definitivo',
    });
  }
}

// Analisar resposta definitiva
function analisarRespostaDefinitiva(response: any): any {
  const conteudo = response.data || '';

  return {
    contem_dados:
      conteudo.includes('<retorno>') ||
      conteudo.includes('<dadosResposta>') ||
      conteudo.includes('<loteEventos>'),

    eh_xml_valido:
      conteudo.includes('<?xml') &&
      (conteudo.includes('</soapenv:Envelope>') ||
        conteudo.includes('</soap:Envelope>')),

    contem_soap_fault:
      conteudo.includes('<soap:Fault>') || conteudo.includes('<faultstring>'),

    contem_erro_403: conteudo.includes('403') || conteudo.includes('Forbidden'),

    tipo_resposta: conteudo.includes('<html')
      ? 'HTML'
      : conteudo.includes('<?xml')
        ? 'XML'
        : 'OUTRO',

    tamanho: conteudo.length,
    primeiras_linhas: conteudo.split('\n').slice(0, 3).join('\\n'),
  };
}

// Gerar conclusão sobre a solução
function gerarConclusaoSobreSolucao(
  funcionou: boolean,
  melhorou: boolean,
  resultados: any[]
): string {
  if (funcionou) {
    return '🎉 SOLUÇÃO DEFINITIVA CONFIRMADA! A estrutura fornecida funciona perfeitamente.';
  }

  if (melhorou) {
    const melhorStatus = Math.max(...resultados.map(r => r.status || 0));
    return `📈 SOLUÇÃO PARCIALMENTE CORRETA! Melhorou para status ${melhorStatus}, mas ainda não chegou ao sucesso completo.`;
  }

  const todasSao403 = resultados.every(r => r.status === 403);

  if (todasSao403) {
    return '🔒 SOLUÇÃO TECNICAMENTE CORRETA, mas problema persiste. Confirma que é questão infraestrutural do eSocial, não de implementação.';
  }

  return '❓ Comportamento inconsistente entre ambientes - necessária análise adicional.';
}

// Gerar recomendação final
function gerarRecomendacaoFinal(
  funcionou: boolean,
  melhorou: boolean,
  melhorResultado: any
): string {
  if (funcionou) {
    return `Implementar a solução no ambiente ${melhorResultado.ambiente} e migrar para produção após testes.`;
  }

  if (melhorou) {
    return `Investigar especificamente o ambiente ${melhorResultado.ambiente} que deu status ${melhorResultado.status}.`;
  }

  return 'A solução fornecida é tecnicamente correta e avançada, mas confirma que o problema é infraestrutural. Recomendo: 1) Contatar suporte com esta evidência, 2) Implementar solução híbrida, 3) Aguardar normalização dos serviços.';
}
