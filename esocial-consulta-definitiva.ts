import * as fs from 'fs';
import { IncomingHttpHeaders } from 'http';
import * as https from 'https';

// Configurações de Consulta eSocial
interface ESocialConsultaConfig {
  pfxPath: string;
  passphrase: string;
  cpfEmpregador: string;
  protocolos: string[];
}

// Classe para Consulta eSocial
class ESocialConsulta {
  private config: ESocialConsultaConfig;

  constructor(config: ESocialConsultaConfig) {
    this.config = config;
  }

  // Gerar XML de Consulta
  private gerarXmlConsulta(
    protocolo: string,
    tipoConsulta: 'protocolo' | 'tipoEvento' = 'protocolo'
  ): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <consulta>
        <cpfCnpj>${this.config.cpfEmpregador}</cpfCnpj>
        ${
          tipoConsulta === 'protocolo'
            ? `<protocoloEnvio>${protocolo}</protocoloEnvio>`
            : `<tipoEvento>S-1000</tipoEvento>`
        }
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;
  }

  // Configurações de SOAP para consulta
  private obterOpcoesConsulta(
    xml: string,
    host: string,
    path: string
  ): https.RequestOptions {
    return {
      host,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction:
          'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos',
        'Content-Length': Buffer.byteLength(xml),
      },
      pfx: fs.readFileSync(this.config.pfxPath),
      passphrase: this.config.passphrase,
      minVersion: 'TLSv1.2',
      rejectUnauthorized: true,
    };
  }

  // Método principal de consulta
  consultarProtocolos(): Promise<ConsultaResultado[]> {
    const resultados: ConsultaResultado[] = [];

    const consultaPromises = this.config.protocolos.map(protocolo => {
      return new Promise<ConsultaResultado>((resolve, reject) => {
        const xmlConsulta = this.gerarXmlConsulta(protocolo);
        const options = this.obterOpcoesConsulta(
          xmlConsulta,
          'webservices.consulta.esocial.gov.br',
          '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc'
        );

        const req = https.request(options, res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              protocolo,
              statusCode: res.statusCode,
              headers: res.headers,
              body: data.substring(0, 2000),
            });
          });
        });

        req.on('error', error => {
          resolve({
            protocolo,
            statusCode: 0,
            erro: error.message,
          });
        });

        req.write(xmlConsulta);
        req.end();
      });
    });

    return Promise.all(consultaPromises);
  }

  // Consulta por Tipo de Evento (experimental)
  consultarTiposEvento(): Promise<ConsultaResultado[]> {
    const resultados: ConsultaResultado[] = [];

    const consultaPromises = this.config.protocolos.map(protocolo => {
      return new Promise<ConsultaResultado>((resolve, reject) => {
        const xmlConsulta = this.gerarXmlConsulta(protocolo, 'tipoEvento');
        const options = this.obterOpcoesConsulta(
          xmlConsulta,
          'webservices.consulta.esocial.gov.br',
          '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc'
        );

        const req = https.request(options, res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            resolve({
              protocolo,
              statusCode: res.statusCode,
              headers: res.headers,
              body: data.substring(0, 2000),
            });
          });
        });

        req.on('error', error => {
          resolve({
            protocolo,
            statusCode: 0,
            erro: error.message,
          });
        });

        req.write(xmlConsulta);
        req.end();
      });
    });

    return Promise.all(consultaPromises);
  }
}

// Interface para resultado de consulta
interface ConsultaResultado {
  protocolo: string;
  statusCode: number;
  headers?: IncomingHttpHeaders;
  body?: string;
  erro?: string;
}

// Configuração para executar consultas
const configConsulta: ESocialConsultaConfig = {
  pfxPath: 'public/certificates/eCPF A1 24940271 (senha 456587).pfx',
  passphrase: '456587',
  cpfEmpregador: '59876913700',
  protocolos: [
    '1.2.20250917.46410', // Protocolo específico
    '1.2.20250917.43762', // Outro protocolo para testar
  ],
};

// Função principal para execução
async function executarConsultaESocial() {
  console.log('🚀 === CONSULTA eSocial DEFINITIVA ===');
  console.log('🎯 Usando HTTPS nativo com certificado PFX');
  console.log('');

  const consulta = new ESocialConsulta(configConsulta);

  try {
    console.log('🔍 Consultando Protocolos...');
    console.log(`📋 Protocolos: ${configConsulta.protocolos.join(', ')}`);
    console.log(`🔑 CPF Empregador: ${configConsulta.cpfEmpregador}`);
    console.log('');

    const resultadosProtocolos = await consulta.consultarProtocolos();

    console.log('📊 RESULTADOS CONSULTA POR PROTOCOLO:');
    console.log('='.repeat(60));

    resultadosProtocolos.forEach((resultado, index) => {
      console.log(`\n🧪 Teste ${index + 1}: Protocolo ${resultado.protocolo}`);

      if (resultado.erro) {
        console.log(`❌ Erro: ${resultado.erro}`);
      } else {
        const status = resultado.statusCode || 0;
        const ok = status < 400 ? '✅' : '❌';
        console.log(`${ok} Status: ${status}`);

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

          console.log(`📄 Tipo: ${isXML ? 'XML' : 'HTML/OUTRO'}`);
          console.log(`⚠️ SOAP Fault: ${isSoapFault ? 'SIM' : 'NÃO'}`);
          console.log(`📊 Dados de retorno: ${hasRetorno ? 'SIM' : 'NÃO'}`);

          if (isSoapFault) {
            const faultMatch = resultado.body.match(
              /<faultstring>(.*?)<\/faultstring>/s
            );
            if (faultMatch) {
              console.log(`🔍 FaultString: ${faultMatch[1].trim()}`);
            }
          }

          console.log('📄 Resposta (primeiras linhas):');
          const primeirasLinhas = resultado.body
            .split('\n')
            .slice(0, 3)
            .join('\n');
          console.log(primeirasLinhas);

          // Salvar resposta completa
          const fileName = `consulta-definitiva-${resultado.protocolo}-${Date.now()}.xml`;
          fs.writeFileSync(fileName, resultado.body);
          console.log(`💾 Resposta salva: ${fileName}`);
        }
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log('🔍 Consultando Tipos de Evento...');

    const resultadosTiposEvento = await consulta.consultarTiposEvento();

    console.log('\n📊 RESULTADOS CONSULTA POR TIPO DE EVENTO:');
    console.log('='.repeat(60));

    resultadosTiposEvento.forEach((resultado, index) => {
      console.log(
        `\n🧪 Teste ${index + 1}: S-1000 para ${resultado.protocolo}`
      );

      if (resultado.erro) {
        console.log(`❌ Erro: ${resultado.erro}`);
      } else {
        const status = resultado.statusCode || 0;
        const ok = status < 400 ? '✅' : '❌';
        console.log(`${ok} Status: ${status}`);

        if (resultado.body) {
          const fileName = `consulta-tipo-evento-${resultado.protocolo}-${Date.now()}.xml`;
          fs.writeFileSync(fileName, resultado.body);
          console.log(`💾 Resposta salva: ${fileName}`);
        }
      }
    });
  } catch (error) {
    console.error('❌ Erro na consulta:', error);
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO FINAL:');
  console.log('✅ Script executado com sucesso');
  console.log('📄 Respostas salvas em arquivos XML');
  console.log('🔍 Analisar arquivos para detalhes completos');
  console.log('='.repeat(60));
}

// Executar consulta
executarConsultaESocial();
