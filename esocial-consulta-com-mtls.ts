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

// Classe para Consulta eSocial com mTLS
class ESocialConsultaComMTLS {
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
        'User-Agent': 'eSocial-Consulta-mTLS/1.0',
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

  // Testar múltiplas configurações com mTLS
  async consultarComMTLS(): Promise<ConsultaResultado[]> {
    const configuracoes = [
      {
        nome: 'S-1.3 Produção (mTLS)',
        host: 'webservices.consulta.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/consultaLoteEventos',
        versao: 'v1_3_0' as const,
      },
      {
        nome: 'S-1.1 Produção Restrita (mTLS)',
        host: 'webservices.producaorestrita.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ConsultarLoteEventos',
        versao: 'v1_1_0' as const,
      },
    ];

    const resultados: ConsultaResultado[] = [];

    for (const config of configuracoes) {
      for (const protocolo of this.config.protocolos) {
        console.log(`\n🧪 Testando: ${config.nome} - Protocolo: ${protocolo}`);

        const xmlConsulta = this.gerarXmlConsulta(protocolo, config.versao);
        const options = this.obterOpcoesConsulta(
          xmlConsulta,
          config.host,
          config.path,
          config.soapAction
        );

        const resultado = await this.executarConsulta(
          protocolo,
          xmlConsulta,
          options,
          config.nome
        );
        resultados.push(resultado);

        // Pequena pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
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

// Função de análise de resultados com mTLS
function analisarResultadosComMTLS(resultados: ConsultaResultado[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ANÁLISE DETALHADA DOS RESULTADOS COM mTLS:');
  console.log('='.repeat(70));

  resultados.forEach((resultado, index) => {
    console.log(`\n🔍 Resultado ${index + 1}: ${resultado.configuracao}`);
    console.log(`📋 Protocolo: ${resultado.protocolo}`);
    console.log(`⏱️ Tempo de resposta: ${resultado.responseTime}ms`);

    if (resultado.erro) {
      console.log(`❌ Erro: ${resultado.erro}`);
      if (resultado.errorCode) {
        console.log(`🔍 Código do erro: ${resultado.errorCode}`);
      }
    } else {
      const status = resultado.statusCode;
      const ok = status < 400 ? '✅' : '❌';
      console.log(`${ok} Status HTTP: ${status}`);

      if (resultado.headers) {
        const server = resultado.headers.server || 'n/d';
        const contentType = resultado.headers['content-type'] || 'n/d';
        console.log(`📋 Server: ${server}`);
        console.log(`📋 Content-Type: ${contentType}`);
      }

      if (resultado.body) {
        const isXML = resultado.body.includes('<?xml');
        const isSoapFault =
          resultado.body.includes('<soap:Fault>') ||
          resultado.body.includes('<faultstring>');
        const hasRetorno =
          resultado.body.includes('<retorno>') ||
          resultado.body.includes('<dadosResposta>');
        const isHTML =
          resultado.body.includes('<html') ||
          resultado.body.includes('<!DOCTYPE');

        console.log(
          `📄 Tipo de resposta: ${isXML ? 'XML' : isHTML ? 'HTML' : 'OUTRO'}`
        );
        console.log(`⚠️ SOAP Fault: ${isSoapFault ? 'SIM' : 'NÃO'}`);
        console.log(`📊 Dados de retorno: ${hasRetorno ? 'SIM' : 'NÃO'}`);

        if (status === 200 && hasRetorno) {
          console.log('🎉 SUCESSO! Consulta retornou dados com mTLS!');
        } else if (status === 200 && isXML && !isSoapFault) {
          console.log('✅ Status 200 XML - Resposta válida do eSocial!');
        } else if (status === 403) {
          console.log(
            '🔒 Erro 403 - Possível problema no certificado ou autorização'
          );
        } else if (status === 500) {
          console.log('⚠️ Erro 500 - Problema no servidor ou estrutura XML');
        }

        if (isSoapFault) {
          const faultMatch = resultado.body.match(
            /<faultstring>(.*?)<\/faultstring>/s
          );
          if (faultMatch) {
            console.log(`🔍 FaultString: ${faultMatch[1].trim()}`);
          }

          const faultCodeMatch = resultado.body.match(
            /<faultcode>(.*?)<\/faultcode>/s
          );
          if (faultCodeMatch) {
            console.log(`🔍 FaultCode: ${faultCodeMatch[1].trim()}`);
          }
        }

        // Salvar XML enviado e resposta
        const baseFileName = `consulta-mtls-${resultado.configuracao.replace(/[^a-zA-Z0-9]/g, '-')}-${resultado.protocolo}-${Date.now()}`;
        fs.writeFileSync(`${baseFileName}-request.xml`, resultado.xmlEnviado);
        fs.writeFileSync(`${baseFileName}-response.xml`, resultado.body);

        console.log(`💾 Request salvo: ${baseFileName}-request.xml`);
        console.log(`💾 Response salvo: ${baseFileName}-response.xml`);

        // Mostrar primeiras linhas da resposta
        const primeirasLinhas = resultado.body
          .split('\n')
          .slice(0, 5)
          .join('\n');
        console.log('📄 Resposta (início):');
        console.log(primeirasLinhas);
      }
    }
  });

  // Resumo final com mTLS
  console.log('\n' + '='.repeat(70));
  console.log('📈 RESUMO GERAL COM mTLS:');

  const sucessos = resultados.filter(
    r => r.statusCode === 200 && r.body?.includes('<retorno>')
  );
  const sucessosXML = resultados.filter(
    r => r.statusCode === 200 && r.body?.includes('<?xml')
  );
  const falhas403 = resultados.filter(r => r.statusCode === 403);
  const falhas500 = resultados.filter(r => r.statusCode === 500);
  const errosConexao = resultados.filter(r => r.erro);

  console.log(`🎉 Sucessos com dados: ${sucessos.length}/${resultados.length}`);
  console.log(
    `✅ Sucessos XML (200): ${sucessosXML.length}/${resultados.length}`
  );
  console.log(`🔒 Erros 403: ${falhas403.length}/${resultados.length}`);
  console.log(`⚠️ Erros 500: ${falhas500.length}/${resultados.length}`);
  console.log(
    `❌ Erros de conexão: ${errosConexao.length}/${resultados.length}`
  );

  if (sucessos.length > 0) {
    console.log('\n🎉 PARABÉNS! Consultas funcionaram com mTLS!');
    console.log('🎯 O certificado está funcionando corretamente!');
  } else if (sucessosXML.length > 0) {
    console.log('\n✅ Progresso! Status 200 XML obtido com mTLS!');
    console.log('🔍 Analisar respostas XML para entender estrutura');
  } else if (falhas403.length > 0) {
    console.log('\n🔒 Ainda 403 com mTLS - possível problema no certificado');
  } else if (falhas500.length > 0) {
    console.log('\n⚠️ Erro 500 com mTLS - estrutura XML ou problema servidor');
  } else {
    console.log('\n❌ Problemas de conectividade mesmo com mTLS');
  }

  console.log('='.repeat(70));
}

// Configuração para executar consultas com mTLS
const configConsultaMTLS: ESocialConsultaConfig = {
  cpfEmpregador: '59876913700',
  protocolos: [
    '1.2.20250917.46410', // Protocolo mais recente
    '1.2.20250917.43762', // Protocolo alternativo
  ],
  usarCertificado: true, // HABILITADO para usar mTLS
  certPath: 'temp-cert-forge.pem', // Certificado convertido
  keyPath: 'temp-key-forge.pem', // Chave privada convertida
};

// Função principal para execução com mTLS
async function executarConsultaComMTLS() {
  console.log('🚀 === CONSULTA eSocial COM mTLS (CERTIFICADO PEM) ===');
  console.log('🎯 Testando consultas com certificado digital');
  console.log('🔐 Usando certificados convertidos de PFX para PEM');
  console.log('');

  // Verificar se certificados existem
  const certExists = fs.existsSync(configConsultaMTLS.certPath!);
  const keyExists = fs.existsSync(configConsultaMTLS.keyPath!);

  console.log('📋 Verificação de certificados:');
  console.log(
    `📄 Certificado (${configConsultaMTLS.certPath}): ${certExists ? '✅ Encontrado' : '❌ Não encontrado'}`
  );
  console.log(
    `🔑 Chave privada (${configConsultaMTLS.keyPath}): ${keyExists ? '✅ Encontrada' : '❌ Não encontrada'}`
  );

  if (!certExists || !keyExists) {
    console.log(
      '❌ Certificados não encontrados. Execute primeiro: node converter-pfx-node-forge.js'
    );
    return;
  }

  const consulta = new ESocialConsultaComMTLS(configConsultaMTLS);

  try {
    console.log('\n🔍 Iniciando consultas com mTLS...');
    console.log(`📋 Protocolos: ${configConsultaMTLS.protocolos.join(', ')}`);
    console.log(`🔑 CPF Empregador: ${configConsultaMTLS.cpfEmpregador}`);
    console.log(`🔐 Certificado mTLS: HABILITADO`);

    const resultados = await consulta.consultarComMTLS();
    analisarResultadosComMTLS(resultados);
  } catch (error) {
    console.error('❌ Erro geral na consulta com mTLS:', error);
  }
}

// Executar consulta com mTLS
executarConsultaComMTLS();
