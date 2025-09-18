// Script para buscar SOAPActions corretas dos WSDLs
const axios = require('axios');
const https = require('https');
const fs = require('fs');

async function buscarSOAPActionsCorretas() {
  console.log('🔍 === BUSCANDO SOAPActions CORRETAS DOS WSDLs ===');
  console.log('🎯 Analisando WSDLs para encontrar Actions suportadas');
  console.log('');

  // Configurar agente com certificado
  const cert = fs.readFileSync('temp-cert-forge.pem', 'utf8');
  const key = fs.readFileSync('temp-key-forge.pem', 'utf8');

  const agent = new https.Agent({
    cert: cert,
    key: key,
    rejectUnauthorized: false,
    timeout: 30000,
  });

  const wsdlUrls = [
    {
      nome: 'Consulta Produção Restrita',
      url: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
    },
    {
      nome: 'Consulta S-1.3',
      url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc?wsdl',
    },
    {
      nome: 'Envio (para comparação)',
      url: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
    },
  ];

  for (const wsdl of wsdlUrls) {
    console.log(`\n🧪 Analisando WSDL: ${wsdl.nome}`);
    console.log(`📡 URL: ${wsdl.url}`);

    try {
      const response = await axios.get(wsdl.url, {
        httpsAgent: agent,
        timeout: 30000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'eSocial-WSDL-Analyzer/1.0',
          Accept: 'text/xml, application/xml',
        },
      });

      console.log(`📊 Status: ${response.status}`);
      console.log(
        `📋 Content-Type: ${response.headers['content-type'] || 'n/d'}`
      );

      if (response.status === 200 && response.data) {
        const wsdlContent = response.data;
        console.log(`📄 WSDL recebido: ${wsdlContent.length} bytes`);

        // Salvar WSDL para análise
        const fileName = `wsdl-${wsdl.nome.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.xml`;
        fs.writeFileSync(fileName, wsdlContent);
        console.log(`💾 WSDL salvo: ${fileName}`);

        // Analisar WSDL para encontrar SOAPActions
        console.log('🔍 Analisando SOAPActions no WSDL...');

        // Procurar por soapAction nos bindings
        const soapActionMatches =
          wsdlContent.match(/soapAction="([^"]+)"/g) || [];
        const operationMatches =
          wsdlContent.match(/<operation[^>]*name="([^"]+)"/g) || [];
        const portTypeMatches =
          wsdlContent.match(/<portType[^>]*name="([^"]+)"/g) || [];

        console.log(`📋 SOAPActions encontradas: ${soapActionMatches.length}`);
        soapActionMatches.forEach((match, i) => {
          const action = match.match(/soapAction="([^"]+)"/)?.[1];
          console.log(`   ${i + 1}. ${action}`);
        });

        console.log(`📋 Operações encontradas: ${operationMatches.length}`);
        operationMatches.forEach((match, i) => {
          const operation = match.match(/name="([^"]+)"/)?.[1];
          console.log(`   ${i + 1}. ${operation}`);
        });

        console.log(`📋 PortTypes encontrados: ${portTypeMatches.length}`);
        portTypeMatches.forEach((match, i) => {
          const portType = match.match(/name="([^"]+)"/)?.[1];
          console.log(`   ${i + 1}. ${portType}`);
        });

        // Procurar por namespaces específicos
        const namespaceMatches =
          wsdlContent.match(/xmlns[^=]*="[^"]*esocial[^"]*"/g) || [];
        console.log(`📋 Namespaces eSocial: ${namespaceMatches.length}`);
        namespaceMatches.forEach((match, i) => {
          console.log(`   ${i + 1}. ${match}`);
        });

        // Procurar por endereços de serviço
        const addressMatches =
          wsdlContent.match(/<soap:address[^>]*location="([^"]+)"/g) || [];
        console.log(`📋 Endereços de serviço: ${addressMatches.length}`);
        addressMatches.forEach((match, i) => {
          const address = match.match(/location="([^"]+)"/)?.[1];
          console.log(`   ${i + 1}. ${address}`);
        });
      } else {
        console.log(`❌ Falha ao obter WSDL: Status ${response.status}`);

        if (response.status === 403) {
          console.log('🔒 Acesso negado - mesmo com certificado');
        } else if (response.status === 404) {
          console.log('❓ WSDL não encontrado neste endpoint');
        }
      }
    } catch (error) {
      console.error(`❌ Erro ao acessar WSDL: ${error.message}`);

      if (error.code === 'ENOTFOUND') {
        console.log('🌐 DNS não resolvido');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🚫 Conexão recusada');
      }
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DA ANÁLISE DE WSDLs:');
  console.log('✅ Se algum WSDL foi obtido: Analisar SOAPActions encontradas');
  console.log('❌ Se todos falharam: Problema pode ser mais profundo');
  console.log('🔍 Próximo passo: Usar SOAPActions encontradas nos WSDLs');
  console.log('='.repeat(70));
}

// Executar
buscarSOAPActionsCorretas();
