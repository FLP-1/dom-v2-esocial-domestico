// file: test-esocial-endpoints.ts
// -----------------------------------------------------------------------------
// Teste de conectividade real para os Web Services eSocial (S-1.3)
// • HEAD → resposta rápida (sem corpo). Se falhar, tenta GET.
// • Opcional: HTTPS mTLS (pfx ou cert/key) via variáveis de ambiente.
//
// Instalação rápida:
//   npm install --save-dev typescript ts-node @types/node
//   npm install axios
//
// Execução:
//   # sem certificado
//   npx ts-node test-esocial-endpoints.ts
//
//   # com certificado pfx + senha
//   ESOCIAL_PFX=/caminho/certificado.pfx ESOCIAL_PFX_PWD=senha npx ts-node test-esocial-endpoints.ts
//
//   # com cert + key separados
//   ESOCIAL_CERT=/caminho/cert.pem ESOCIAL_KEY=/caminho/key.pem ESOCIAL_KEY_PWD=senha npx ts-node test-esocial-endpoints.ts
// -----------------------------------------------------------------------------

import axios, { AxiosRequestConfig } from 'axios';
import fs from 'fs';
import https from 'https';

type Endpoint = { name: string; url: string };
type SoapTest = {
  name: string;
  url: string;
  soapAction: string;
  xmlTemplate: string;
};

const ENDPOINTS: Endpoint[] = [
  {
    name: 'Envio (prod)',
    url: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
  },
  {
    name: 'Consulta (prod) – provável 403',
    url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
  },
  {
    name: 'Consulta v1_3_0 (prod)',
    url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
  },
  {
    name: 'Portal esocial.gov.br',
    url: 'https://esocial.gov.br',
  },
];

// Testes SOAP específicos
const SOAP_TESTS: SoapTest[] = [
  {
    name: 'ConsultaLoteEventos S-1.3',
    url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc',
    soapAction:
      '"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/consultaLoteEventos"',
    xmlTemplate: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                     xmlns:es="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_3_0">
  <soapenv:Header/>
  <soapenv:Body>
    <es:eSocial>
      <es:consultaLoteEventos>
        <protocoloEnvio>{PROTOCOLO}</protocoloEnvio>
      </es:consultaLoteEventos>
    </es:eSocial>
  </soapenv:Body>
</soapenv:Envelope>`,
  },
  {
    name: 'ConsultaLoteEventos Prod Restrita',
    url: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    soapAction:
      '"http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ConsultarLoteEventos"',
    xmlTemplate: `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                     xmlns:es="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <es:ConsultarLoteEventos>
      <es:consulta>
        <es:eSocial xmlns="http://www.esocial.gov.br/schema/consulta/lote/eventos/v1_0_0">
          <consultaLoteEventos>
            <protocoloEnvio>{PROTOCOLO}</protocoloEnvio>
          </consultaLoteEventos>
        </es:eSocial>
      </es:consulta>
    </es:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`,
  },
];

// ----------------------------------------------------------------------------
// Helper: cria agente HTTPS (com ou sem mTLS)
// ----------------------------------------------------------------------------
function createHttpsAgent(): https.Agent {
  const pfxPath = process.env.ESOCIAL_PFX;
  const certPath = process.env.ESOCIAL_CERT;
  const keyPath = process.env.ESOCIAL_KEY;

  if (pfxPath && fs.existsSync(pfxPath)) {
    return new https.Agent({
      pfx: fs.readFileSync(pfxPath),
      passphrase: process.env.ESOCIAL_PFX_PWD,
      rejectUnauthorized: true,
    });
  }

  if (
    certPath &&
    keyPath &&
    fs.existsSync(certPath) &&
    fs.existsSync(keyPath)
  ) {
    return new https.Agent({
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath),
      passphrase: process.env.ESOCIAL_KEY_PWD,
      rejectUnauthorized: true,
    });
  }

  // Sem certificado – apenas TLS padrão
  return new https.Agent({ rejectUnauthorized: true });
}

// ----------------------------------------------------------------------------
// Teste único (HEAD → fallback GET)
// ----------------------------------------------------------------------------
async function testEndpoint(ep: Endpoint, agent: https.Agent): Promise<void> {
  const baseConfig: AxiosRequestConfig = {
    url: ep.url,
    httpsAgent: agent,
    timeout: 10_000,
    validateStatus: () => true, // não lançar por status >= 400
    headers: { 'User-Agent': 'eSocial-ConnTest/1.0' },
  };

  try {
    // 1) HEAD
    let resp = await axios.request({ ...baseConfig, method: 'HEAD' });
    if (resp.status >= 400) {
      // 2) Fallback GET
      resp = await axios.request({ ...baseConfig, method: 'GET' });
    }

    const ok = resp.status < 400 ? '✅' : '❌';
    const server = resp.headers['server'] ?? 'n/d';
    console.log(`${ok} [${resp.status}] ${ep.name.padEnd(28)} → ${server}`);
  } catch (err: any) {
    console.error(`❌ [ERR ] ${ep.name.padEnd(28)} → ${err.message}`);
  }
}

// ----------------------------------------------------------------------------
// Teste SOAP POST (função principal para consultas reais)
// ----------------------------------------------------------------------------
async function postSoap(
  soapTest: SoapTest,
  agent: https.Agent,
  protocolo: string = '1.2.20250917.46410'
): Promise<void> {
  try {
    // Gerar XML com protocolo real
    const xmlBody = soapTest.xmlTemplate.replace('{PROTOCOLO}', protocolo);

    console.log(`\n🧪 Testando SOAP POST: ${soapTest.name}`);
    console.log(`📡 URL: ${soapTest.url}`);
    console.log(`📋 SOAPAction: ${soapTest.soapAction}`);
    console.log(`🔑 Protocolo: ${protocolo}`);

    const resp = await axios.post(soapTest.url, xmlBody, {
      httpsAgent: agent,
      timeout: 15_000,
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: soapTest.soapAction,
        'User-Agent': 'eSocial-ConnTest/1.1',
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      validateStatus: () => true,
    });

    const ok = resp.status < 400 ? '✅' : '❌';
    const server = resp.headers['server'] ?? 'n/d';
    const contentType = resp.headers['content-type'] ?? 'n/d';

    console.log(`${ok} [${resp.status}] SOAP POST → ${server}`);
    console.log(`📋 Content-Type: ${contentType}`);

    // Analisar resposta
    const respData = resp.data || '';
    const isXML = respData.includes('<?xml');
    const isSoapFault =
      respData.includes('<soap:Fault>') || respData.includes('<faultstring>');
    const hasRetorno =
      respData.includes('<retorno>') || respData.includes('<dadosResposta>');

    console.log(`📄 Tipo resposta: ${isXML ? 'XML' : 'HTML/OUTRO'}`);

    if (isSoapFault) {
      console.log('⚠️ SOAP Fault detectado');
      // Extrair faultstring
      const faultMatch = respData.match(/<faultstring>(.*?)<\/faultstring>/s);
      if (faultMatch) {
        console.log(`🔍 FaultString: ${faultMatch[1].trim()}`);
      }
    } else if (hasRetorno) {
      console.log('🎉 Resposta com dados de retorno!');
    } else if (resp.status === 200 && isXML) {
      console.log('✅ Resposta XML 200 - analisando...');
    }

    // Mostrar primeiras linhas da resposta
    const primeirasLinhas = respData.split('\n').slice(0, 5).join('\n');
    console.log('📊 Resposta (primeiras linhas):');
    console.log(primeirasLinhas);

    // Salvar resposta completa para análise
    const fileName = `soap-response-${soapTest.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.xml`;
    fs.writeFileSync(fileName, respData);
    console.log(`💾 Resposta completa salva em: ${fileName}`);
  } catch (err: any) {
    console.error(`❌ [ERR ] SOAP POST → ${soapTest.url} → ${err.message}`);

    // Se for erro Axios, capturar detalhes
    if (err.response) {
      console.log(`📊 Status: ${err.response.status}`);
      console.log(`📋 Headers:`, err.response.headers);
      if (err.response.data) {
        const errorFileName = `soap-error-${soapTest.name.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.xml`;
        fs.writeFileSync(errorFileName, err.response.data);
        console.log(`💾 Erro salvo em: ${errorFileName}`);
      }
    }
  }
}

// ----------------------------------------------------------------------------
// Main
// ----------------------------------------------------------------------------
(async () => {
  console.log('\n🔍 Teste de Conectividade COMPLETO – eSocial S-1.3');
  console.log('='.repeat(70));

  const agent = createHttpsAgent();

  // Obter protocolo de variáveis de ambiente ou usar padrão
  const protocoloEnvio = process.env.ESOCIAL_PROTOCOLO || '1.2.20250917.46410';

  console.log('🔐 Configuração:');
  console.log(`📋 Protocolo: ${protocoloEnvio}`);
  console.log(
    `🔑 Certificado: ${process.env.ESOCIAL_PFX ? 'PFX configurado' : process.env.ESOCIAL_CERT ? 'PEM configurado' : 'Sem certificado'}`
  );

  // === FASE 1: TESTE DE CONECTIVIDADE BÁSICA ===
  console.log('\n📡 FASE 1: Teste de Conectividade Básica (HEAD/GET)');
  console.log('-'.repeat(70));

  for (const ep of ENDPOINTS) {
    await testEndpoint(ep, agent);
  }

  // === FASE 2: TESTE SOAP REAL ===
  console.log('\n🧪 FASE 2: Teste SOAP POST (Consultas Reais)');
  console.log('-'.repeat(70));

  for (const soapTest of SOAP_TESTS) {
    await postSoap(soapTest, agent, protocoloEnvio);
  }

  // === RELATÓRIO FINAL ===
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO FINAL:');
  console.log('✅ Conectividade básica: Testada com HEAD/GET');
  console.log('🧪 Consultas SOAP: Testadas com POST + mTLS');
  console.log('💾 Respostas salvas em arquivos XML para análise detalhada');
  console.log('');
  console.log('🎯 PRÓXIMOS PASSOS:');
  console.log('1. Analisar arquivos XML gerados');
  console.log('2. Verificar se alguma consulta retornou 200 + dados');
  console.log('3. Capturar faultstring para chamados de suporte');
  console.log('4. Testar com protocolo de envio mais recente se disponível');
  console.log('='.repeat(70));
})();
