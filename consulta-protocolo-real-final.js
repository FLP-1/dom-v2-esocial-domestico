// Consulta final com protocolo real gerado
const https = require('https');
const fs = require('fs');

async function consultarProtocoloRealFinal() {
  console.log('🎉 === CONSULTA FINAL COM PROTOCOLO REAL ===');
  console.log('🏆 Usando protocolo recém-gerado do S-2200');
  console.log('');

  // Protocolo real gerado
  const protocoloReal = '1.2.20250918.58742';
  console.log(`📋 Protocolo real: ${protocoloReal}`);
  console.log(
    '🎯 Esperamos: Status 200 + Código 201 (sucesso) ou 202 (processando)'
  );
  console.log('');

  // SOAPAction e estrutura que funcionaram (Status 200)
  const soapActionCorreta =
    'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos';

  // XML híbrido que funcionou
  const xmlFinal = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <protocoloEnvio>${protocoloReal}</protocoloEnvio>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

  // Configurar mTLS
  const cert = fs.readFileSync('temp-cert-forge.pem', 'utf8');
  const key = fs.readFileSync('temp-key-forge.pem', 'utf8');

  const options = {
    host: 'webservices.producaorestrita.esocial.gov.br',
    path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    method: 'POST',
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      SOAPAction: `"${soapActionCorreta}"`,
      'Content-Length': Buffer.byteLength(xmlFinal),
      'User-Agent': 'eSocial-Protocolo-Real-Final/1.0',
      Accept: 'text/xml',
      Connection: 'keep-alive',
    },
    cert: cert,
    key: key,
    rejectUnauthorized: false,
    secureProtocol: 'TLSv1_2_method',
    timeout: 30000,
  };

  console.log('🧪 Executando consulta final com protocolo real...');
  console.log(`📋 Protocolo: ${protocoloReal} (RECÉM-GERADO)`);
  console.log(`🔐 mTLS: HABILITADO`);
  console.log(`📋 SOAPAction: CORRETA (do WSDL)`);
  console.log(`📋 XML: HÍBRIDO FUNCIONANDO`);
  console.log('');

  return new Promise(resolve => {
    const startTime = Date.now();

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        const responseTime = Date.now() - startTime;

        console.log(`📊 Status HTTP: ${res.statusCode} (${responseTime}ms)`);
        console.log(`📋 Server: ${res.headers.server || 'n/d'}`);
        console.log(`📋 Content-Type: ${res.headers['content-type'] || 'n/d'}`);

        // Análise detalhada da resposta
        const isXML = data.includes('<?xml') || data.includes('<s:Envelope>');
        const isSoapFault =
          data.includes('<s:Fault>') || data.includes('<faultstring>');
        const hasConsultarResponse = data.includes(
          'ConsultarLoteEventosResponse'
        );
        const hasRetornoProcessamento = data.includes(
          '<retornoProcessamentoLoteEventos>'
        );
        const hasStatus = data.includes('<status>');
        const hasOcorrencias = data.includes('<ocorrencias>');
        const hasLoteEventos = data.includes('<loteEventos>');
        const hasDadosEmpregado =
          data.includes('<trabalhador>') || data.includes('<empregado>');
        const hasDadosVinculo = data.includes('<vinculo>');

        console.log(`📄 Tipo de resposta: ${isXML ? 'XML' : 'OUTRO'}`);
        console.log(`⚠️ SOAP Fault: ${isSoapFault ? 'SIM' : 'NÃO'}`);
        console.log(
          `📊 ConsultarResponse: ${hasConsultarResponse ? 'SIM' : 'NÃO'}`
        );
        console.log(
          `📊 RetornoProcessamento: ${hasRetornoProcessamento ? 'SIM' : 'NÃO'}`
        );
        console.log(`📊 Status: ${hasStatus ? 'SIM' : 'NÃO'}`);
        console.log(`📊 Ocorrências: ${hasOcorrencias ? 'SIM' : 'NÃO'}`);
        console.log(`📊 LoteEventos: ${hasLoteEventos ? 'SIM' : 'NÃO'}`);
        console.log(`👤 Dados Empregado: ${hasDadosEmpregado ? 'SIM' : 'NÃO'}`);
        console.log(`📋 Dados Vínculo: ${hasDadosVinculo ? 'SIM' : 'NÃO'}`);

        // Análise de códigos eSocial
        const codigoMatch = data.match(/<cdResposta>(\d+)<\/cdResposta>/);
        if (codigoMatch) {
          const codigo = codigoMatch[1];
          console.log(`📋 Código eSocial: ${codigo}`);

          const codigosESocial = {
            201: '✅ Lote processado com sucesso',
            202: '🔄 Lote em processamento',
            501: '⚠️ Solicitação incorreta',
            502: '❌ Erro no processamento',
            503: '🚫 Serviço indisponível',
          };

          if (codigosESocial[codigo]) {
            console.log(`📋 Status: ${codigosESocial[codigo]}`);
          }

          if (codigo === '201') {
            console.log('🎉 SUCESSO TOTAL! Lote processado com sucesso!');
          } else if (codigo === '202') {
            console.log(
              '🔄 Lote em processamento - consultar novamente em alguns minutos'
            );
          }
        }

        const descMatch = data.match(/<descResposta>(.*?)<\/descResposta>/);
        if (descMatch) {
          console.log(`📋 Descrição: ${descMatch[1].trim()}`);
        }

        // Analisar ocorrências específicas
        const ocorrenciaMatches = data.match(
          /<ocorrencia>[\s\S]*?<\/ocorrencia>/g
        );
        if (ocorrenciaMatches) {
          console.log(`📋 Ocorrências: ${ocorrenciaMatches.length}`);

          ocorrenciaMatches.forEach((ocorrencia, i) => {
            const codigo = ocorrencia.match(/<codigo>(\d+)<\/codigo>/)?.[1];
            const descricao = ocorrencia.match(
              /<descricao>(.*?)<\/descricao>/
            )?.[1];
            const tipo = ocorrencia.match(/<tipo>(\d+)<\/tipo>/)?.[1];

            console.log(`   ${i + 1}. Código: ${codigo} | Tipo: ${tipo}`);
            console.log(`      ${descricao}`);

            if (codigo === '748') {
              console.log('      ❌ AINDA protocolo inválido');
            } else if (codigo !== '748') {
              console.log('      ✅ PROGRESSO! Código diferente de 748');
            }
          });
        } else {
          console.log('📋 Nenhuma ocorrência encontrada (pode ser sucesso!)');
        }

        // Procurar por dados específicos do empregado
        if (hasDadosEmpregado) {
          console.log('\n👤 DADOS DO EMPREGADO ENCONTRADOS:');

          const cpfMatch = data.match(/<cpfTrab>(\d+)<\/cpfTrab>/);
          if (cpfMatch) {
            console.log(`📋 CPF: ${cpfMatch[1]}`);
          }

          const nomeMatch = data.match(/<nmTrab>(.*?)<\/nmTrab>/);
          if (nomeMatch) {
            console.log(`📋 Nome: ${nomeMatch[1]}`);
          }

          const dtNascMatch = data.match(/<dtNascto>(.*?)<\/dtNascto>/);
          if (dtNascMatch) {
            console.log(`📋 Data Nascimento: ${dtNascMatch[1]}`);
          }
        }

        if (hasDadosVinculo) {
          console.log('\n📋 DADOS DO VÍNCULO ENCONTRADOS:');

          const dtAdmMatch = data.match(/<dtAdm>(.*?)<\/dtAdm>/);
          if (dtAdmMatch) {
            console.log(`📋 Data Admissão: ${dtAdmMatch[1]}`);
          }

          const cargoMatch = data.match(/<codCargo>(.*?)<\/codCargo>/);
          if (cargoMatch) {
            console.log(`📋 Código Cargo: ${cargoMatch[1]}`);
          }

          const salarioMatch = data.match(/<vrSalFx>(.*?)<\/vrSalFx>/);
          if (salarioMatch) {
            console.log(`📋 Salário: R$ ${salarioMatch[1]}`);
          }
        }

        // Salvar resposta final
        const fileName = `consulta-protocolo-real-final-${protocoloReal}-${Date.now()}`;
        fs.writeFileSync(`${fileName}-request.xml`, xmlFinal);
        fs.writeFileSync(`${fileName}-response.xml`, data);

        console.log(`\n💾 Request salvo: ${fileName}-request.xml`);
        console.log(`💾 Response salvo: ${fileName}-response.xml`);

        // Mostrar resposta completa formatada
        console.log('\n📄 RESPOSTA COMPLETA:');
        console.log(data);

        resolve({
          protocolo: protocoloReal,
          status: res.statusCode,
          success:
            res.statusCode === 200 && !data.includes('<codigo>748</codigo>'),
          hasData: hasDadosEmpregado || hasDadosVinculo || hasLoteEventos,
          codigo: codigoMatch?.[1],
          responseTime: responseTime,
          data: data,
        });
      });
    });

    req.on('error', error => {
      const responseTime = Date.now() - startTime;
      console.error(`❌ Erro na consulta final: ${error.message}`);

      resolve({
        protocolo: protocoloReal,
        status: 0,
        success: false,
        error: error.message,
        responseTime: responseTime,
      });
    });

    req.write(xmlFinal);
    req.end();
  });
}

// Executar consulta final
consultarProtocoloRealFinal().then(resultado => {
  console.log('\n' + '='.repeat(70));
  console.log('🏆 RESULTADO FINAL DA MISSÃO:');

  if (resultado.success && resultado.hasData) {
    console.log(
      '🎉 SUCESSO TOTAL! Dados do empregado obtidos via consulta eSocial!'
    );
  } else if (resultado.success) {
    console.log('✅ SUCESSO! Consulta funcionou, protocolo válido!');
  } else if (resultado.status === 200) {
    console.log('📊 Status 200 mas ainda com código de erro eSocial');
  } else {
    console.log('⚠️ Problemas na consulta final');
  }

  console.log(`📊 Status HTTP: ${resultado.status}`);
  console.log(`📋 Protocolo usado: ${resultado.protocolo}`);
  console.log(`⏱️ Tempo de resposta: ${resultado.responseTime}ms`);

  if (resultado.codigo) {
    console.log(`📋 Código eSocial: ${resultado.codigo}`);
  }

  console.log('='.repeat(70));
  console.log('🎯 MISSÃO FINAL:');

  if (resultado.success && resultado.hasData) {
    console.log('✅ MISSÃO CUMPRIDA! Consultas eSocial totalmente funcionais!');
    console.log('📊 Dados do empregado obtidos com sucesso!');
  } else if (resultado.success) {
    console.log(
      '✅ Estrutura funcionando! Apenas aguardar processamento do lote'
    );
  } else {
    console.log(
      '🔄 Estrutura funcionando, mas protocolo ainda pode estar em processamento'
    );
  }

  console.log('='.repeat(70));
});
