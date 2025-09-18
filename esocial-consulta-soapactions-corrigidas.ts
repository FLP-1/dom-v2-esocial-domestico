import * as fs from 'fs';
import { IncomingHttpHeaders } from 'http';
import * as https from 'https';

// Configurações de Consulta eSocial
interface ESocialConsultaConfig {
  cpfEmpregador: string;
  protocolos: string[];
  usarCertificado: boolean;
  certPath?: string;
  keyPath?: string;
}

// Classe para Consulta eSocial com SOAPActions Corrigidas
class ESocialConsultaSOAPActionsCorrigidas {
  private config: ESocialConsultaConfig;

  constructor(config: ESocialConsultaConfig) {
    this.config = config;
  }

  // Gerar XML de Consulta com estruturas alternativas
  private gerarXmlConsulta(
    protocolo: string,
    versao: 'v1_3_0' | 'v1_1_0' = 'v1_3_0'
  ): string {
    if (versao === 'v1_3_0') {
      return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:es="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_3_0">
  <soapenv:Header/>
  <soapenv:Body>
    <es:eSocial>
      <es:consultaLoteEventos>
        <protocoloEnvio>${protocolo}</protocoloEnvio>
      </es:consultaLoteEventos>
    </es:eSocial>
  </soapenv:Body>
</soapenv:Envelope>`;
    } else {
      return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:es="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <es:ConsultarLoteEventos>
      <es:consulta>
        <es:eSocial xmlns="http://www.esocial.gov.br/schema/consulta/lote/eventos/v1_0_0">
          <consultaLoteEventos>
            <protocoloEnvio>${protocolo}</protocoloEnvio>
          </consultaLoteEventos>
        </es:eSocial>
      </es:consulta>
    </es:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;
    }
  }

  // Configurações de SOAP para consulta com mTLS
  private obterOpcoesConsulta(
    xml: string,
    host: string,
    path: string,
    soapAction: string
  ): https.RequestOptions {
    const baseOptions: https.RequestOptions = {
      host,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `"${soapAction}"`,
        'Content-Length': Buffer.byteLength(xml),
        'User-Agent': 'eSocial-Consulta-SOAPAction-Fix/1.0',
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      timeout: 30000,
    };

    if (
      this.config.usarCertificado &&
      this.config.certPath &&
      this.config.keyPath
    ) {
      console.log('🔐 Configurando mTLS com certificados PEM...');

      try {
        const cert = fs.readFileSync(this.config.certPath, 'utf8');
        const key = fs.readFileSync(this.config.keyPath, 'utf8');

        console.log(`📄 Certificado carregado: ${cert.length} bytes`);
        console.log(`🔑 Chave privada carregada: ${key.length} bytes`);

        return {
          ...baseOptions,
          cert: cert,
          key: key,
          rejectUnauthorized: false, // Temporário para teste
          secureProtocol: 'TLSv1_2_method',
          // Ciphers específicos baseados em testes anteriores
          ciphers: [
            'ECDHE-RSA-AES128-GCM-SHA256',
            'ECDHE-RSA-AES256-GCM-SHA384',
            'AES128-GCM-SHA256',
            'AES256-GCM-SHA384',
          ].join(':'),
          servername: host, // SNI explícito
          checkServerIdentity: () => undefined, // Desabilitar verificação temporariamente
        };
      } catch (error) {
        console.log(`⚠️ Erro ao carregar certificados: ${error.message}`);
        console.log('🔄 Continuando sem mTLS para diagnóstico');
      }
    }

    // Sem certificado - apenas para diagnóstico
    console.log('⚠️ Executando sem certificado (diagnóstico)');
    return {
      ...baseOptions,
      rejectUnauthorized: false,
    };
  }

  // Testar múltiplas variações de SOAPAction
  async testarVariacoesSOAPAction(): Promise<ConsultaResultado[]> {
    const variacoesSOAPAction = [
      // Variações baseadas no SOAP Fault recebido
      {
        nome: 'SOAPAction Simples (sem namespace)',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction: 'ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
      {
        nome: 'SOAPAction Sem Versão',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
      {
        nome: 'SOAPAction v1_0_0 (baseado no schema)',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0/ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
      {
        nome: 'SOAPAction Original v1_1_0',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
      // Variações S-1.3
      {
        nome: 'S-1.3 SOAPAction Simples',
        host: 'webservices.consulta.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
        soapAction: 'consultaLoteEventos',
        versao: 'v1_3_0' as const,
      },
      {
        nome: 'S-1.3 SOAPAction Sem Versão',
        host: 'webservices.consulta.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/consultaLoteEventos',
        versao: 'v1_3_0' as const,
      },
      {
        nome: 'S-1.3 SOAPAction Original',
        host: 'webservices.consulta.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/consultaLoteEventos',
        versao: 'v1_3_0' as const,
      },
      // Variações alternativas baseadas em WSDLs
      {
        nome: 'WSDL-Based Action',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction: 'urn:ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
    ];

    const resultados: ConsultaResultado[] = [];

    // Testar apenas o primeiro protocolo para economizar tempo
    const protocolo = this.config.protocolos[0];

    for (const variacao of variacoesSOAPAction) {
      console.log(`\n🧪 Testando: ${variacao.nome}`);
      console.log(`📋 SOAPAction: ${variacao.soapAction}`);
      console.log(`📋 Protocolo: ${protocolo}`);

      const xmlConsulta = this.gerarXmlConsulta(protocolo, variacao.versao);
      const options = this.obterOpcoesConsulta(
        xmlConsulta,
        variacao.host,
        variacao.path,
        variacao.soapAction
      );

      const resultado = await this.executarConsulta(
        protocolo,
        xmlConsulta,
        options,
        variacao.nome
      );
      resultados.push(resultado);

      // Pequena pausa entre requisições
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return resultados;
  }

  // Executar uma consulta individual
  private executarConsulta(
    protocolo: string,
    xml: string,
    options: https.RequestOptions,
    configuracao: string
  ): Promise<ConsultaResultado> {
    return new Promise(resolve => {
      const startTime = Date.now();

      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          const responseTime = Date.now() - startTime;

          resolve({
            protocolo,
            configuracao,
            statusCode: res.statusCode || 0,
            headers: res.headers,
            body: data,
            responseTime,
            xmlEnviado: xml,
          });
        });
      });

      req.on('error', error => {
        const responseTime = Date.now() - startTime;

        resolve({
          protocolo,
          configuracao,
          statusCode: 0,
          erro: error.message,
          errorCode: (error as any).code,
          responseTime,
          xmlEnviado: xml,
        });
      });

      req.write(xml);
      req.end();
    });
  }
}

// Interface para resultado de consulta
interface ConsultaResultado {
  protocolo: string;
  configuracao: string;
  statusCode: number;
  headers?: IncomingHttpHeaders;
  body?: string;
  erro?: string;
  errorCode?: string;
  responseTime: number;
  xmlEnviado: string;
}

// Função de análise de resultados com foco em SOAPAction
function analisarResultadosSOAPAction(resultados: ConsultaResultado[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ANÁLISE DETALHADA - TESTE DE SOAPActions CORRIGIDAS:');
  console.log('='.repeat(70));

  let melhorResultado: ConsultaResultado | null = null;
  let melhorScore = -1;

  resultados.forEach((resultado, index) => {
    console.log(`\n🔍 Resultado ${index + 1}: ${resultado.configuracao}`);
    console.log(`📋 Protocolo: ${resultado.protocolo}`);
    console.log(`⏱️ Tempo de resposta: ${resultado.responseTime}ms`);

    // Calcular score do resultado
    let score = 0;

    if (resultado.erro) {
      console.log(`❌ Erro: ${resultado.erro}`);
      if (resultado.errorCode) {
        console.log(`🔍 Código do erro: ${resultado.errorCode}`);
      }
      score = 0; // Erro de conexão = pior score
    } else {
      const status = resultado.statusCode;
      const ok = status < 400 ? '✅' : '❌';
      console.log(`${ok} Status HTTP: ${status}`);

      if (resultado.body) {
        const isXML = resultado.body.includes('<?xml');
        const isSoapFault =
          resultado.body.includes('<soap:Fault>') ||
          resultado.body.includes('<faultstring>');
        const hasRetorno =
          resultado.body.includes('<retorno>') ||
          resultado.body.includes('<dadosResposta>');
        const hasLoteEventos = resultado.body.includes('<loteEventos>');

        console.log(`📄 Tipo de resposta: ${isXML ? 'XML' : 'HTML/OUTRO'}`);
        console.log(`⚠️ SOAP Fault: ${isSoapFault ? 'SIM' : 'NÃO'}`);
        console.log(`📊 Dados de retorno: ${hasRetorno ? 'SIM' : 'NÃO'}`);

        // Calcular score baseado no resultado
        if (status === 200 && hasRetorno) {
          score = 100; // Perfeito!
          console.log('🎉 SUCESSO TOTAL! Consulta funcionou perfeitamente!');
        } else if (status === 200 && isXML && !isSoapFault) {
          score = 90; // Muito bom
          console.log('✅ Status 200 XML - Resposta válida!');
        } else if (status === 200 && isXML) {
          score = 70; // Bom, mas com SOAP fault
          console.log('⚠️ Status 200 mas com SOAP Fault');
        } else if (status === 500 && isSoapFault) {
          score = 50; // Médio - pelo menos chegou ao servidor
          console.log('⚠️ SOAP Fault - XML chegou ao servidor');
        } else if (status === 404) {
          score = 20; // Baixo - endpoint não encontrado
          console.log('❌ Endpoint não encontrado');
        } else if (status === 403) {
          score = 10; // Muito baixo - problema de autorização
          console.log('🔒 Problema de autorização');
        }

        if (isSoapFault) {
          const faultMatch = resultado.body.match(
            /<faultstring>(.*?)<\/faultstring>/s
          );
          if (faultMatch) {
            console.log(`🔍 FaultString: ${faultMatch[1].trim()}`);

            // Análise específica do SOAP Fault
            const faultString = faultMatch[1].trim();
            if (faultString.includes('ActionNotSupported')) {
              console.log('🎯 Análise: SOAPAction ainda não é a correta');
              score -= 10; // Penalizar ActionNotSupported
            } else if (faultString.includes('ContractFilter')) {
              console.log('🎯 Análise: Problema de contrato - progresso!');
              score += 5; // Pequeno bônus por não ser ActionNotSupported
            } else {
              console.log('🎯 Análise: Novo tipo de erro - possível progresso');
              score += 10; // Bônus por erro diferente
            }
          }
        }

        // Salvar resposta
        const baseFileName = `soapaction-test-${resultado.configuracao.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`;
        fs.writeFileSync(`${baseFileName}-request.xml`, resultado.xmlEnviado);
        fs.writeFileSync(`${baseFileName}-response.xml`, resultado.body);

        console.log(`💾 Request salvo: ${baseFileName}-request.xml`);
        console.log(`💾 Response salvo: ${baseFileName}-response.xml`);

        // Mostrar primeiras linhas da resposta
        const primeirasLinhas = resultado.body
          .split('\n')
          .slice(0, 3)
          .join('\n');
        console.log('📄 Resposta (início):');
        console.log(primeirasLinhas);
      }
    }

    console.log(`📊 Score: ${score}/100`);

    // Atualizar melhor resultado
    if (score > melhorScore) {
      melhorScore = score;
      melhorResultado = resultado;
    }
  });

  // Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('📈 RESUMO FINAL - TESTE DE SOAPActions:');

  const sucessosCompletos = resultados.filter(
    r => r.statusCode === 200 && r.body?.includes('<retorno>')
  );
  const sucessosXML = resultados.filter(
    r => r.statusCode === 200 && r.body?.includes('<?xml')
  );
  const soapFaults = resultados.filter(r => r.body?.includes('<faultstring>'));
  const actionNotSupported = resultados.filter(r =>
    r.body?.includes('ActionNotSupported')
  );

  console.log(
    `🎉 Sucessos completos: ${sucessosCompletos.length}/${resultados.length}`
  );
  console.log(
    `✅ Sucessos XML (200): ${sucessosXML.length}/${resultados.length}`
  );
  console.log(`⚠️ SOAP Faults: ${soapFaults.length}/${resultados.length}`);
  console.log(
    `❌ ActionNotSupported: ${actionNotSupported.length}/${resultados.length}`
  );

  if (melhorResultado) {
    console.log(`\n🏆 MELHOR RESULTADO (Score: ${melhorScore}/100):`);
    console.log(`📋 Configuração: ${melhorResultado.configuracao}`);
    console.log(`📊 Status: ${melhorResultado.statusCode}`);

    if (melhorScore >= 90) {
      console.log('🎉 EXCELENTE! Esta SOAPAction funcionou!');
    } else if (melhorScore >= 70) {
      console.log('✅ BOM! Esta SOAPAction teve o melhor resultado');
    } else if (melhorScore >= 50) {
      console.log('⚠️ PROGRESSO! Esta SOAPAction chegou mais longe');
    } else {
      console.log('🔍 Esta foi a menos pior das opções testadas');
    }
  }

  console.log('='.repeat(70));
}

// Configuração para testar SOAPActions corrigidas
const configSOAPActionTest: ESocialConsultaConfig = {
  cpfEmpregador: '59876913700',
  protocolos: [
    '1.2.20250917.46410', // Usar apenas um protocolo para teste rápido
  ],
  usarCertificado: true,
  certPath: 'temp-cert-forge.pem',
  keyPath: 'temp-key-forge.pem',
};

// Função principal para testar SOAPActions corrigidas
async function testarSOAPActionsCorrigidas() {
  console.log('🚀 === TESTE DE SOAPActions CORRIGIDAS ===');
  console.log('🎯 Baseado no SOAP Fault: ActionNotSupported');
  console.log('🔧 Testando múltiplas variações de SOAPAction');
  console.log('');

  // Verificar se certificados existem
  const certExists = fs.existsSync(configSOAPActionTest.certPath!);
  const keyExists = fs.existsSync(configSOAPActionTest.keyPath!);

  console.log('📋 Verificação de certificados:');
  console.log(
    `📄 Certificado: ${certExists ? '✅ Encontrado' : '❌ Não encontrado'}`
  );
  console.log(
    `🔑 Chave privada: ${keyExists ? '✅ Encontrada' : '❌ Não encontrada'}`
  );

  if (!certExists || !keyExists) {
    console.log(
      '❌ Certificados não encontrados. Execute primeiro: node converter-pfx-node-forge.js'
    );
    return;
  }

  const consulta = new ESocialConsultaSOAPActionsCorrigidas(
    configSOAPActionTest
  );

  try {
    console.log('\n🔍 Iniciando teste de SOAPActions...');
    console.log(`📋 Protocolo: ${configSOAPActionTest.protocolos[0]}`);
    console.log(`🔑 CPF Empregador: ${configSOAPActionTest.cpfEmpregador}`);
    console.log(`🔐 Certificado mTLS: HABILITADO`);

    const resultados = await consulta.testarVariacoesSOAPAction();
    analisarResultadosSOAPAction(resultados);
  } catch (error) {
    console.error('❌ Erro geral no teste de SOAPActions:', error);
  }
}

// Executar teste de SOAPActions corrigidas
testarSOAPActionsCorrigidas();
