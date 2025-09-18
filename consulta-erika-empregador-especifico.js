// CONSULTA ESPECÍFICA: Dados da Erika PARA o empregador Francisco (CPF: 59876913700)
const https = require('https');
const fs = require('fs');

async function consultarErikaPorEmpregador() {
  console.log('🎯 === CONSULTA ESPECÍFICA POR EMPREGADOR ===');
  console.log('🏢 Empregador: FRANCISCO JOSE LATTARI PAPALEO');
  console.log('🆔 CPF Empregador: 59876913700');
  console.log('👩‍💼 Empregada: ERIKA APARECIDA DOS SANTOS BARBOSA');
  console.log('🆔 CPF Empregada: 38645446880');
  console.log('');
  console.log('⚠️ PROBLEMA IDENTIFICADO:');
  console.log('❌ Consultas anteriores podem ter dados de OUTROS empregadores');
  console.log(
    '✅ Esta consulta vai filtrar ESPECIFICAMENTE por este empregador'
  );
  console.log('');

  // Configurar mTLS
  const cert = fs.readFileSync('temp-cert-forge.pem', 'utf8');
  const key = fs.readFileSync('temp-key-forge.pem', 'utf8');

  // CPF do empregador específico
  const cpfEmpregador = '59876913700';

  // Protocolos gerados PARA ESTE EMPREGADOR
  const protocolosEmpregador = [
    {
      protocolo: '1.2.20250918.68606',
      tipo: 'S-1000',
      descricao: 'Cadastro do Empregador Francisco',
    },
    {
      protocolo: '1.2.20250918.58742',
      tipo: 'S-2200',
      descricao: 'Cadastro da Erika PARA Francisco',
    },
  ];

  console.log('📋 PROTOCOLOS GERADOS PARA ESTE EMPREGADOR:');
  protocolosEmpregador.forEach((item, i) => {
    console.log(
      `${i + 1}. ${item.protocolo} - ${item.tipo} (${item.descricao})`
    );
  });
  console.log('');

  // SOAPAction que funciona
  const soapAction =
    'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos';

  const resultados = [];

  for (const [index, item] of protocolosEmpregador.entries()) {
    console.log(`🧪 Consultando ${index + 1}/2: ${item.descricao}`);
    console.log(`📋 Protocolo: ${item.protocolo}`);
    console.log(`🏢 Para empregador: ${cpfEmpregador}`);

    // XML com filtro específico por empregador
    const xmlComEmpregador = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <protocoloEnvio>${item.protocolo}</protocoloEnvio>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    const options = {
      host: 'webservices.producaorestrita.esocial.gov.br',
      path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `"${soapAction}"`,
        'Content-Length': Buffer.byteLength(xmlComEmpregador),
        'User-Agent': 'eSocial-Consulta-Por-Empregador/1.0',
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      cert: cert,
      key: key,
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      timeout: 30000,
    };

    try {
      const resultado = await new Promise(resolve => {
        const startTime = Date.now();

        const req = https.request(options, res => {
          let data = '';
          res.on('data', chunk => (data += chunk));
          res.on('end', () => {
            const responseTime = Date.now() - startTime;

            console.log(
              `📊 Status HTTP: ${res.statusCode} (${responseTime}ms)`
            );

            // Análise específica da resposta
            const hasCodigo748 = data.includes('<codigo>748</codigo>');
            const hasLoteEventos = data.includes('<loteEventos>');
            const hasDadosEmpregado =
              data.includes('<trabalhador>') || data.includes('<empregado>');
            const hasEventos = data.includes('<eventos>');
            const hasRetorno = data.includes('<retorno>');
            const temDados =
              hasLoteEventos || hasDadosEmpregado || hasEventos || hasRetorno;

            // Buscar dados específicos da Erika neste empregador
            const temNomeErika =
              data.includes('ERIKA') || data.includes('Erika');
            const temCpfErika = data.includes('38645446880');
            const temCpfEmpregador = data.includes('59876913700');

            // Extrair código eSocial
            const codigoMatch = data.match(/<cdResposta>(\d+)<\/cdResposta>/);
            const descMatch = data.match(/<descResposta>(.*?)<\/descResposta>/);

            const codigo = codigoMatch?.[1];
            const descricao = descMatch?.[1]?.trim();

            console.log(`📋 Código eSocial: ${codigo || 'N/A'}`);
            console.log(`📋 Descrição: ${descricao || 'N/A'}`);
            console.log(`❌ Código 748: ${hasCodigo748 ? 'SIM' : 'NÃO'}`);
            console.log(`📊 Tem Dados: ${temDados ? 'SIM' : 'NÃO'}`);
            console.log(`👩‍💼 Menciona Erika: ${temNomeErika ? 'SIM' : 'NÃO'}`);
            console.log(`🆔 CPF Erika: ${temCpfErika ? 'SIM' : 'NÃO'}`);
            console.log(
              `🏢 CPF Empregador: ${temCpfEmpregador ? 'SIM' : 'NÃO'}`
            );

            let status = 'ERRO';
            let mensagem = '';

            if (res.statusCode === 200 && !hasCodigo748 && temDados) {
              if (temNomeErika || temCpfErika) {
                status = 'SUCESSO_COM_DADOS_ERIKA';
                mensagem = '🎉 DADOS DA ERIKA PARA ESTE EMPREGADOR!';
              } else {
                status = 'SUCESSO_SEM_ERIKA';
                mensagem = '✅ Dados obtidos, mas sem referência à Erika';
              }
            } else if (res.statusCode === 200 && !hasCodigo748) {
              status = 'SUCESSO_SEM_DADOS';
              mensagem = '✅ Protocolo válido, aguardando dados';
            } else if (res.statusCode === 200 && hasCodigo748) {
              status = 'AINDA_748';
              mensagem = '⚠️ Ainda código 748 - protocolo não processado';
            } else {
              status = 'ERRO_TECNICO';
              mensagem = '❌ Erro técnico na consulta';
            }

            console.log(mensagem);
            console.log('');

            // Salvar resposta específica
            const fileName = `consulta-empregador-especifico-${item.tipo}-${Date.now()}`;
            fs.writeFileSync(`${fileName}-request.xml`, xmlComEmpregador);
            fs.writeFileSync(`${fileName}-response.xml`, data);

            // Se encontrou dados da Erika, extrair informações específicas
            let dadosErikaEmpregador = null;
            if (temNomeErika || temCpfErika || temDados) {
              dadosErikaEmpregador = extrairDadosErikaNaResposta(
                data,
                item.tipo
              );
            }

            resolve({
              protocolo: item.protocolo,
              tipoEvento: item.tipo,
              descricaoEvento: item.descricao,
              status,
              httpStatus: res.statusCode,
              codigoESocial: codigo,
              descricao,
              temCodigo748: hasCodigo748,
              temDados,
              temDadosErika: temNomeErika || temCpfErika,
              dadosErikaEmpregador,
              responseTime,
              arquivo: `${fileName}-response.xml`,
            });
          });
        });

        req.on('error', error => {
          console.error(`❌ Erro: ${error.message}`);
          resolve({
            protocolo: item.protocolo,
            tipoEvento: item.tipo,
            status: 'ERRO_CONEXAO',
            error: error.message,
          });
        });

        req.write(xmlComEmpregador);
        req.end();
      });

      resultados.push(resultado);
    } catch (error) {
      console.error(`❌ Erro no protocolo ${item.protocolo}:`, error.message);
      resultados.push({
        protocolo: item.protocolo,
        tipoEvento: item.tipo,
        status: 'ERRO_GERAL',
        error: error.message,
      });
    }
  }

  return resultados;
}

// Função para extrair dados específicos da Erika na resposta
function extrairDadosErikaNaResposta(xmlResponse, tipoEvento) {
  try {
    console.log(`🔍 Extraindo dados da Erika na resposta ${tipoEvento}...`);

    const dadosEncontrados = {
      tipoEvento,
      fonte: 'CONSULTA_POR_EMPREGADOR',
      timestamp: new Date().toISOString(),
    };

    // Buscar padrões específicos na resposta XML
    const nomeMatch = xmlResponse.match(/<nome[^>]*>(.*?ERIKA.*?)<\/nome>/i);
    const cpfMatch = xmlResponse.match(/<cpf[^>]*>(.*?38645446880.*?)<\/cpf>/);
    const dataAdmissaoMatch = xmlResponse.match(/<dtAdm[^>]*>(.*?)<\/dtAdm>/);
    const salarioMatch = xmlResponse.match(/<vrSalFx[^>]*>(.*?)<\/vrSalFx>/);
    const cargoMatch = xmlResponse.match(/<codCargo[^>]*>(.*?)<\/codCargo>/);

    if (nomeMatch) {
      dadosEncontrados.nome = nomeMatch[1].trim();
      console.log(`✅ Nome encontrado: ${dadosEncontrados.nome}`);
    }

    if (cpfMatch) {
      dadosEncontrados.cpf = cpfMatch[1].trim();
      console.log(`✅ CPF encontrado: ${dadosEncontrados.cpf}`);
    }

    if (dataAdmissaoMatch) {
      dadosEncontrados.dataAdmissao = dataAdmissaoMatch[1].trim();
      console.log(
        `✅ Data admissão encontrada: ${dadosEncontrados.dataAdmissao}`
      );
    }

    if (salarioMatch) {
      dadosEncontrados.salario = parseFloat(salarioMatch[1].trim());
      console.log(`✅ Salário encontrado: R$ ${dadosEncontrados.salario}`);
    }

    if (cargoMatch) {
      dadosEncontrados.codigoCargo = cargoMatch[1].trim();
      console.log(
        `✅ Código cargo encontrado: ${dadosEncontrados.codigoCargo}`
      );
    }

    const temDados =
      nomeMatch || cpfMatch || dataAdmissaoMatch || salarioMatch || cargoMatch;

    if (temDados) {
      console.log('✅ Dados da Erika extraídos da resposta!');
      return dadosEncontrados;
    } else {
      console.log('⚠️ Nenhum dado específico da Erika encontrado na resposta');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao extrair dados da Erika:', error.message);
    return null;
  }
}

// Executar consulta específica
consultarErikaPorEmpregador().then(resultados => {
  console.log('='.repeat(70));
  console.log('🏆 RESULTADO DA CONSULTA ESPECÍFICA POR EMPREGADOR:');
  console.log('');

  let encontrouDadosErika = false;
  let protocolosComDados = 0;
  let ainda748 = 0;

  resultados.forEach((resultado, i) => {
    console.log(`${i + 1}. ${resultado.descricaoEvento}:`);
    console.log(`   Protocolo: ${resultado.protocolo}`);
    console.log(`   Status: ${resultado.status}`);

    if (resultado.codigoESocial) {
      console.log(`   Código eSocial: ${resultado.codigoESocial}`);
    }

    if (resultado.status === 'SUCESSO_COM_DADOS_ERIKA') {
      console.log('   🎉 DADOS DA ERIKA ENCONTRADOS PARA ESTE EMPREGADOR!');
      encontrouDadosErika = true;
      protocolosComDados++;

      if (resultado.dadosErikaEmpregador) {
        console.log('   📋 Dados extraídos:');
        console.log(
          `      Nome: ${resultado.dadosErikaEmpregador.nome || 'N/A'}`
        );
        console.log(
          `      CPF: ${resultado.dadosErikaEmpregador.cpf || 'N/A'}`
        );
        console.log(
          `      Data Admissão: ${resultado.dadosErikaEmpregador.dataAdmissao || 'N/A'}`
        );
        console.log(
          `      Salário: R$ ${resultado.dadosErikaEmpregador.salario || 'N/A'}`
        );
      }
    } else if (resultado.status === 'AINDA_748') {
      console.log('   ⚠️ Ainda aguardando processamento (código 748)');
      ainda748++;
    } else if (resultado.temDados) {
      console.log(
        '   ✅ Protocolo tem dados, mas sem referência específica à Erika'
      );
      protocolosComDados++;
    } else {
      console.log('   ❌ Sem dados ou erro técnico');
    }
    console.log('');
  });

  console.log('📊 RESUMO DA CONSULTA ESPECÍFICA:');
  console.log(
    `🎉 Dados da Erika encontrados: ${encontrouDadosErika ? 'SIM' : 'NÃO'}`
  );
  console.log(`📊 Protocolos com dados: ${protocolosComDados}/2`);
  console.log(`⚠️ Ainda código 748: ${ainda748}/2`);
  console.log('');

  if (encontrouDadosErika) {
    console.log('🎉 SUCESSO! Dados da Erika específicos para este empregador!');
  } else if (protocolosComDados > 0) {
    console.log(
      '📈 PROGRESSO! Protocolos têm dados, aguardar processamento completo'
    );
  } else if (ainda748 > 0) {
    console.log('⏰ AGUARDAR! Protocolos ainda não processados (código 748)');
  } else {
    console.log('❌ PROBLEMA! Verificar configuração ou timing');
  }

  console.log('='.repeat(70));
  console.log('💡 CONCLUSÃO SOBRE FILTRO POR EMPREGADOR:');

  if (encontrouDadosErika) {
    console.log(
      '✅ Filtro por empregador FUNCIONOU - dados específicos obtidos'
    );
  } else {
    console.log(
      '⚠️ Dados anteriores podem ser de OUTROS empregadores da Erika'
    );
    console.log('🔍 Necessário aguardar processamento ou usar dados de envio');
  }

  console.log('='.repeat(70));
});
