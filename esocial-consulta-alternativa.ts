import * as fs from 'fs';
import { IncomingHttpHeaders } from 'http';
import * as https from 'https';

// Configurações de Consulta eSocial
interface ESocialConsultaConfig {
  cpfEmpregador: string;
  protocolos: string[];
  usarCertificado: boolean;
}

// Classe para Consulta eSocial
class ESocialConsulta {
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

  // Configurações de SOAP para consulta
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
        'User-Agent': 'eSocial-Consulta-Definitiva/1.0',
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      timeout: 30000,
    };

    if (this.config.usarCertificado) {
      // Tentar carregar certificado se disponível
      try {
        const pfxPath =
          'public/certificates/eCPF A1 24940271 (senha 456587).pfx';
        if (fs.existsSync(pfxPath)) {
          console.log('🔐 Tentando usar certificado PFX...');
          return {
            ...baseOptions,
            pfx: fs.readFileSync(pfxPath),
            passphrase: '456587',
            rejectUnauthorized: false, // Para teste
            minVersion: 'TLSv1.2',
          };
        }
      } catch (error) {
        console.log('⚠️ Erro ao carregar certificado, continuando sem mTLS');
      }
    }

    // Sem certificado - apenas para diagnóstico
    return {
      ...baseOptions,
      rejectUnauthorized: false,
    };
  }

  // Testar múltiplas configurações
  async consultarComVariacoes(): Promise<ConsultaResultado[]> {
    const configuracoes = [
      {
        nome: 'S-1.3 Produção',
        host: 'webservices.consulta.esocial.gov.br',
        path: '/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
        soapAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/consultaLoteEventos',
        versao: 'v1_3_0' as const,
      },
      {
        nome: 'S-1.1 Produção Restrita',
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

// Função de análise de resultados
function analisarResultados(resultados: ConsultaResultado[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ANÁLISE DETALHADA DOS RESULTADOS:');
  console.log('='.repeat(70));

  resultados.forEach((resultado, index) => {
    console.log(`\n🔍 Resultado ${index + 1}: ${resultado.configuracao}`);
    console.log(`📋 Protocolo: ${resultado.protocolo}`);
    console.log(`⏱️ Tempo de resposta: ${resultado.responseTime}ms`);

    if (resultado.erro) {
      console.log(`❌ Erro: ${resultado.erro}`);
      if (resultado.errorCode) {
        console.log(`🔍 Código do erro: ${resultado.errorCode}`);

        // Diagnóstico específico por tipo de erro
        switch (resultado.errorCode) {
          case 'ENOTFOUND':
            console.log('🌐 DNS não resolvido - URL pode estar incorreta');
            break;
          case 'ECONNREFUSED':
            console.log('🚫 Conexão recusada - Serviço pode estar offline');
            break;
          case 'CERT_HAS_EXPIRED':
            console.log('📅 Certificado expirado');
            break;
          case 'ERR_CRYPTO_UNSUPPORTED_OPERATION':
            console.log('🔒 Formato de certificado não suportado pelo Node.js');
            break;
          case 'ETIMEDOUT':
            console.log('⏰ Timeout na conexão');
            break;
        }
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
          console.log('🎉 SUCESSO! Consulta retornou dados');
        } else if (status === 403) {
          console.log(
            '🔒 Erro 403 - Provável necessidade de certificado válido'
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
        }

        // Salvar XML enviado e resposta
        const baseFileName = `consulta-${resultado.configuracao.replace(/[^a-zA-Z0-9]/g, '-')}-${resultado.protocolo}-${Date.now()}`;
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
  });

  // Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('📈 RESUMO GERAL:');

  const sucessos = resultados.filter(
    r => r.statusCode === 200 && r.body?.includes('<retorno>')
  );
  const falhas403 = resultados.filter(r => r.statusCode === 403);
  const falhas500 = resultados.filter(r => r.statusCode === 500);
  const errosConexao = resultados.filter(r => r.erro);

  console.log(`✅ Sucessos completos: ${sucessos.length}/${resultados.length}`);
  console.log(
    `🔒 Erros 403 (sem certificado): ${falhas403.length}/${resultados.length}`
  );
  console.log(
    `⚠️ Erros 500 (servidor): ${falhas500.length}/${resultados.length}`
  );
  console.log(
    `❌ Erros de conexão: ${errosConexao.length}/${resultados.length}`
  );

  if (sucessos.length > 0) {
    console.log('\n🎉 PARABÉNS! Pelo menos uma consulta funcionou!');
  } else if (falhas403.length > 0) {
    console.log('\n🔒 Endpoints existem mas precisam de certificado válido');
  } else if (falhas500.length > 0) {
    console.log(
      '\n⚠️ Endpoints existem mas há problema na estrutura XML ou servidor'
    );
  } else {
    console.log('\n❌ Problemas de conectividade ou URLs incorretas');
  }

  console.log('='.repeat(70));
}

// Configuração para executar consultas
const configConsulta: ESocialConsultaConfig = {
  cpfEmpregador: '59876913700',
  protocolos: [
    '1.2.20250917.46410', // Protocolo mais recente
    '1.2.20250917.43762', // Protocolo alternativo
  ],
  usarCertificado: false, // Primeiro teste diagnóstico sem certificado
};

// Função principal para execução
async function executarConsultaESocial() {
  console.log('🚀 === CONSULTA eSocial DEFINITIVA (VERSÃO ALTERNATIVA) ===');
  console.log('🎯 Testando múltiplas configurações e versões');
  console.log('📋 Diagnóstico completo com e sem certificado');
  console.log('');

  const consulta = new ESocialConsulta(configConsulta);

  try {
    console.log('🔍 Iniciando consultas com variações...');
    console.log(`📋 Protocolos: ${configConsulta.protocolos.join(', ')}`);
    console.log(`🔑 CPF Empregador: ${configConsulta.cpfEmpregador}`);
    console.log(
      `🔐 Usar certificado: ${configConsulta.usarCertificado ? 'SIM' : 'NÃO'}`
    );

    const resultados = await consulta.consultarComVariacoes();
    analisarResultados(resultados);
  } catch (error) {
    console.error('❌ Erro geral na consulta:', error);
  }
}

// Executar consulta
executarConsultaESocial();
