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
    console.log('🔧 === AJUSTANDO URL CORRETA ===');
    console.log('🎯 Progresso confirmado: 403 → 404 (caminho certo!)');

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

    // === VARIAÇÕES DA URL (baseado no progresso 403→404) ===
    const variacoesURL = [
      {
        nome: 'URL Original (que deu 404)',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'URL sem retornoProcessamento',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'URL sem envio',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/lote/eventos/consulta/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'URL simplificada',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'URL com v1_3_0 explícito',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
      },
    ];

    // Namespace que mostrou progresso
    const namespaceCorreto =
      'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_3_0';

    // XML que mostrou progresso
    const xmlCorreto = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="${namespaceCorreto}">
      <consulta>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;

    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      keepAlive: true,
      keepAliveMsecs: 1000,
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      timeout: 30000,
    });

    const resultados = [];

    for (const variacao of variacoesURL) {
      console.log(`\n🧪 Testando: ${variacao.nome}`);
      console.log(`📡 URL: ${variacao.url}`);

      try {
        const headers = {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: `"${namespaceCorreto}/ConsultarLoteEventos"`,
          Accept: 'text/xml',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        };

        const response = await axios({
          method: 'POST',
          url: variacao.url,
          data: xmlCorreto,
          headers: headers,
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const analise = analisarVariacaoURL(response, variacao);

        resultados.push({
          nome: variacao.nome,
          url: variacao.url,
          sucesso: response.status === 200 && analise.funcionou,
          status: response.status,
          progresso: calcularProgresso(response.status),
          analise: analise,
        });

        console.log(
          `Status: ${response.status} | Progresso: ${calcularProgresso(response.status)}`
        );

        if (response.status === 200) {
          console.log('🎉 SUCESSO! URL correta encontrada!');
          await salvarURLCorreta(variacao.url, response);
          break;
        }
      } catch (error) {
        resultados.push({
          nome: variacao.nome,
          url: variacao.url,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // Análise final
    const melhorResultado = resultados.reduce((melhor, atual) =>
      (atual.status || 0) > (melhor.status || 0) ? atual : melhor
    );

    const relatorio = {
      success: true,
      data: {
        progresso_confirmado: '403 → 404 (namespace correto)',
        variações_testadas: resultados,
        melhor_resultado: {
          url: melhorResultado.url,
          status: melhorResultado.status,
          nome: melhorResultado.nome,
        },
        descobertas: {
          namespace_correto: true,
          url_precisa_ajuste: true,
          direcao_certa: resultados.some(r => r.status !== 403),
          melhor_status: Math.max(...resultados.map(r => r.status || 0)),
        },
        proximos_passos: gerarProximosPassosURL(resultados, melhorResultado),
      },
      message: 'Ajuste de URL baseado no progresso 403→404 concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no ajuste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no ajuste da URL',
    });
  }
}

// Analisar variação de URL
function analisarVariacaoURL(response: any, variacao: any): any {
  const conteudo = response.data || '';

  return {
    funcionou: response.status === 200 && !conteudo.includes('<soap:Fault>'),
    melhorou_status: response.status !== 403,
    eh_xml: conteudo.includes('<?xml'),
    contem_dados:
      conteudo.includes('<retorno>') || conteudo.includes('<evento>'),
    tamanho: conteudo.length,
  };
}

// Calcular progresso baseado no status
function calcularProgresso(status: number): string {
  if (status === 200) return '🎉 SUCESSO!';
  if (status === 404) return '📈 Progresso (404 > 403)';
  if (status === 500) return '⚠️ Servidor (500 > 403)';
  if (status === 403) return '🔒 Ainda 403';
  return `❓ Status ${status}`;
}

// Salvar URL correta
async function salvarURLCorreta(url: string, response: any): Promise<void> {
  try {
    const urlCorreta = {
      timestamp: new Date().toISOString(),
      url_funcional: url,
      status_sucesso: response.status,
      dados_recebidos: response.data,
    };

    fs.writeFileSync(
      path.join(process.cwd(), 'URL-CORRETA-ENCONTRADA.json'),
      JSON.stringify(urlCorreta, null, 2)
    );

    console.log('💾 URL CORRETA SALVA EM: URL-CORRETA-ENCONTRADA.json');
  } catch (error) {
    console.log('⚠️ Erro ao salvar URL:', error.message);
  }
}

// Gerar próximos passos baseados nos resultados
function gerarProximosPassosURL(
  resultados: any[],
  melhorResultado: any
): string[] {
  const melhorStatus = melhorResultado.status || 0;

  if (melhorStatus === 200) {
    return [
      'Implementar URL funcional no código principal',
      'Testar outros tipos de consulta com URL correta',
      'Documentar URL correta para comunidade',
    ];
  }

  if (melhorStatus > 403) {
    return [
      `Investigar variações da URL que deu ${melhorStatus}`,
      'Testar pequenos ajustes na URL que melhorou',
      'Verificar documentação específica sobre path correto',
    ];
  }

  return [
    'Todas URLs ainda retornam 403 - problema pode ser mais profundo',
    'Contatar suporte com evidência de progresso (403→404)',
    'Considerar que consultas podem estar em manutenção',
  ];
}
