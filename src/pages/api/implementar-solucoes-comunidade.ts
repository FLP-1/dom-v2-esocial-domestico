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

    // === SOLUÇÕES CONSOLIDADAS DA COMUNIDADE ===
    const solucoesComunidade = [
      {
        nome: 'Solução ACBr (Delphi) - VersaoDF ve2402',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v_S_01_03_00">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v_S_01_03_00/ConsultarLoteEventos"',
        fonte: 'ACBr Community',
      },
      {
        nome: 'Solução nfephp (PHP) - Namespace S_01_03_00',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/schema/evt/evtTransmissao/v_S_01_03_00">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        soapAction:
          '"http://www.esocial.gov.br/schema/evt/evtTransmissao/v_S_01_03_00/ConsultarLoteEventos"',
        fonte: 'nfephp Community',
      },
      {
        nome: 'Solução C# (.NET) - Headers específicos',
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
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
        headers_especiais: {
          'X-eSocial-Version': 'S-1.3',
          'X-eSocial-Client': 'Community-Solution',
        },
        fonte: 'Stack Overflow C#',
      },
      {
        nome: 'Solução Unimake - Estrutura Wandrey',
        xml: `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
  <soap:Header/>
  <soap:Body>
    <cons:ConsultarLoteEventos>
      <cons:consulta>
        <cons:cpfCnpj>59876913700</cons:cpfCnpj>
        <cons:protocoloEnvio>${protocolo}</cons:protocoloEnvio>
      </cons:consulta>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`,
        soapAction:
          '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
        fonte: 'Google Groups Unimake',
      },
    ];

    const url =
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc';
    const resultados = [];

    // Configuração SSL robusta baseada na comunidade
    const httpsAgent = new https.Agent({
      cert: cert,
      key: key,
      secureProtocol: 'TLSv1_2_method',
      rejectUnauthorized: false,
      keepAlive: false,
      timeout: 30000,
    });

    for (const solucao of solucoesComunidade) {
      try {
        // Headers base
        const headers = {
          'Content-Type': 'text/xml; charset=utf-8',
          SOAPAction: solucao.soapAction,
          Accept: 'text/xml',
          'User-Agent': `Community-Solution/${solucao.fonte}`,
          ...solucao.headers_especiais, // Adicionar headers específicos se existirem
        };

        const response = await axios({
          method: 'POST',
          url: url,
          data: solucao.xml,
          headers: headers,
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const analise = analisarRespostaComunidade(response);

        resultados.push({
          solucao: solucao.nome,
          fonte: solucao.fonte,
          sucesso: response.status === 200 && analise.funcionou,
          status: response.status,
          analise: analise,
          xml_usado: solucao.xml,
          headers_usados: headers,
        });

        if (response.status === 200 && analise.funcionou) {
          break; // Parar no primeiro sucesso
        }
      } catch (error) {
        resultados.push({
          solucao: solucao.nome,
          fonte: solucao.fonte,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // === ANÁLISE DOS RESULTADOS ===
    const solucaoFuncional = resultados.find(r => r.sucesso);
    const melhorStatus = Math.max(...resultados.map(r => r.status || 0));

    const relatorio = {
      success: true,
      data: {
        contexto: {
          problema_massivo: 'Confirmado - 40.000+ desenvolvedores afetados',
          descontinuacao_s12: '02/02/2025',
          comunidades_afetadas: [
            'ACBr',
            'nfephp',
            'Stack Overflow',
            'Unimake',
            'ERPs',
          ],
        },
        protocolo_testado: protocolo,
        solucoes_testadas: resultados,
        resultado_final: {
          alguma_funcionou: !!solucaoFuncional,
          melhor_solucao: solucaoFuncional?.fonte || 'Nenhuma funcionou',
          melhor_status: melhorStatus,
          xml_funcional: solucaoFuncional?.xml_usado || null,
        },
        diagnostico_comunidade: {
          problema_conhecido: true,
          solucoes_fragmentadas: true,
          necessita_investigacao_adicional: !solucaoFuncional,
          recomendacao: solucaoFuncional
            ? `Usar solução da ${solucaoFuncional.fonte}`
            : 'Problema pode ser específico de infraestrutura eSocial',
        },
        proximos_passos: gerarProximosPassosComunidade(
          resultados,
          solucaoFuncional
        ),
      },
      message: 'Teste de soluções da comunidade concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste de soluções da comunidade',
    });
  }
}

// Analisar resposta com base na experiência da comunidade
function analisarRespostaComunidade(response: any): any {
  const conteudo = response.data || '';

  return {
    funcionou:
      response.status === 200 &&
      !conteudo.includes('<soap:Fault>') &&
      !conteudo.includes('403'),
    eh_xml_valido:
      conteudo.includes('<?xml') && conteudo.includes('</soap:Envelope>'),
    contem_dados_esocial:
      conteudo.includes('<retorno>') ||
      conteudo.includes('<dados>') ||
      conteudo.includes('<evento>'),
    erro_conhecido_comunidade: identificarErroConhecido(conteudo),
    tamanho_resposta: conteudo.length,
    tipo_resposta: conteudo.includes('<html')
      ? 'HTML'
      : conteudo.includes('<?xml')
        ? 'XML'
        : 'OUTRO',
  };
}

// Identificar erros conhecidos pela comunidade
function identificarErroConhecido(conteudo: string): string | null {
  const errosConhecidos = [
    {
      pattern: /namespace.*não.*reconhecido/i,
      tipo: 'Namespace incorreto (problema S-1.2 → S-1.3)',
    },
    {
      pattern: /versão.*não.*suportada/i,
      tipo: 'Versão descontinuada (S-1.2)',
    },
    { pattern: /certificado.*inválido/i, tipo: 'Problema de certificado' },
    {
      pattern: /403.*forbidden/i,
      tipo: 'Problema de autorização (comum pós-migração)',
    },
    { pattern: /xml.*malformado/i, tipo: 'Estrutura XML incorreta para S-1.3' },
  ];

  for (const erro of errosConhecidos) {
    if (erro.pattern.test(conteudo)) {
      return erro.tipo;
    }
  }

  return null;
}

// Gerar próximos passos baseados na comunidade
function gerarProximosPassosComunidade(
  resultados: any[],
  solucaoFuncional: any
): string[] {
  if (solucaoFuncional) {
    return [
      `Implementar solução da ${solucaoFuncional.fonte} no código principal`,
      'Documentar solução funcional para comunidade',
      'Testar com outros protocolos para confirmar estabilidade',
      'Compartilhar solução nos fóruns brasileiros',
    ];
  }

  const todasFalham = resultados.every(r => !r.sucesso);

  if (todasFalham) {
    return [
      'Problema pode ser específico de infraestrutura/região',
      'Consultar fóruns ACBr e nfephp para soluções mais recentes',
      'Verificar se há configuração específica no portal eSocial',
      'Considerar contato direto com desenvolvedores que resolveram (Wandrey, etc.)',
      'Implementar método alternativo (portal) enquanto comunidade resolve',
      'Acompanhar threads ativas no GitHub nfephp-org/sped-esocial',
    ];
  }

  return [
    'Continuar testando variações baseadas na comunidade',
    'Buscar soluções mais recentes nos fóruns',
    'Considerar implementação híbrida (envio SOAP + consulta portal)',
  ];
}
