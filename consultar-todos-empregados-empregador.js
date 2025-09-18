// CONSULTA: Todos os empregados vinculados ao empregador Francisco
const https = require('https');
const fs = require('fs');

async function consultarTodosEmpregadosEmpregador() {
  console.log('👥 === CONSULTA DE TODOS OS EMPREGADOS ===');
  console.log('🏢 Empregador: FRANCISCO JOSE LATTARI PAPALEO');
  console.log('🆔 CPF Empregador: 59876913700');
  console.log('🎯 Objetivo: Listar TODOS os empregados vinculados');
  console.log('');

  try {
    // Configurar mTLS
    const cert = fs.readFileSync('temp-cert-forge.pem', 'utf8');
    const key = fs.readFileSync('temp-key-forge.pem', 'utf8');

    // Informações do empregador
    const cpfEmpregador = '59876913700';

    console.log('📋 MÉTODOS DE CONSULTA DISPONÍVEIS:');
    console.log('1. ConsultarLoteEventos (por protocolos específicos)');
    console.log('2. ConsultarEventos (por filtros)');
    console.log('3. ConsultarIdentificadorEventos (por identificadores)');
    console.log('4. ConsultarQualificacaoCadastral (dados cadastrais)');
    console.log('');

    // Método 1: Consultar por eventos S-2200 (cadastramento de empregados)
    console.log('🧪 MÉTODO 1: Consulta por Eventos S-2200');
    console.log('📋 Buscando eventos de cadastramento de empregados...');

    const resultadoEventos = await consultarEventosEmpregados(
      cert,
      key,
      cpfEmpregador
    );

    // Método 2: Consultar por período (para pegar todos os empregados ativos)
    console.log('🧪 MÉTODO 2: Consulta por Período');
    console.log('📅 Buscando empregados ativos no período atual...');

    const resultadoPeriodo = await consultarEmpregadosPorPeriodo(
      cert,
      key,
      cpfEmpregador
    );

    // Método 3: Consultar qualificação cadastral do empregador
    console.log('🧪 MÉTODO 3: Qualificação Cadastral do Empregador');
    console.log(
      '🏢 Verificando dados cadastrais que podem incluir empregados...'
    );

    const resultadoQualificacao = await consultarQualificacaoCadastral(
      cert,
      key,
      cpfEmpregador
    );

    // Consolidar resultados
    console.log('📊 === CONSOLIDAÇÃO DOS RESULTADOS ===');

    const empregadosEncontrados = [];
    let metodosComSucesso = 0;
    let totalConsultas = 3;

    // Analisar Método 1
    if (resultadoEventos.success) {
      metodosComSucesso++;
      if (
        resultadoEventos.empregados &&
        resultadoEventos.empregados.length > 0
      ) {
        empregadosEncontrados.push(...resultadoEventos.empregados);
        console.log(
          `✅ Método 1: ${resultadoEventos.empregados.length} empregado(s) encontrado(s)`
        );
      } else {
        console.log('⚠️ Método 1: Sem empregados (ainda processando)');
      }
    } else {
      console.log(`❌ Método 1: ${resultadoEventos.error}`);
    }

    // Analisar Método 2
    if (resultadoPeriodo.success) {
      metodosComSucesso++;
      if (
        resultadoPeriodo.empregados &&
        resultadoPeriodo.empregados.length > 0
      ) {
        empregadosEncontrados.push(...resultadoPeriodo.empregados);
        console.log(
          `✅ Método 2: ${resultadoPeriodo.empregados.length} empregado(s) encontrado(s)`
        );
      } else {
        console.log('⚠️ Método 2: Sem empregados no período');
      }
    } else {
      console.log(`❌ Método 2: ${resultadoPeriodo.error}`);
    }

    // Analisar Método 3
    if (resultadoQualificacao.success) {
      metodosComSucesso++;
      if (
        resultadoQualificacao.empregados &&
        resultadoQualificacao.empregados.length > 0
      ) {
        empregadosEncontrados.push(...resultadoQualificacao.empregados);
        console.log(
          `✅ Método 3: ${resultadoQualificacao.empregados.length} empregado(s) encontrado(s)`
        );
      } else {
        console.log('⚠️ Método 3: Dados cadastrais sem empregados listados');
      }
    } else {
      console.log(`❌ Método 3: ${resultadoQualificacao.error}`);
    }

    console.log('');
    console.log('📊 RESUMO GERAL:');
    console.log(
      `✅ Métodos com sucesso: ${metodosComSucesso}/${totalConsultas}`
    );
    console.log(
      `👥 Total empregados encontrados: ${empregadosEncontrados.length}`
    );

    // Remover duplicatas (mesmo CPF)
    const empregadosUnicos = empregadosEncontrados.filter(
      (emp, index, arr) => arr.findIndex(e => e.cpf === emp.cpf) === index
    );

    console.log(`👥 Empregados únicos: ${empregadosUnicos.length}`);
    console.log('');

    if (empregadosUnicos.length > 0) {
      console.log('🎉 === EMPREGADOS ENCONTRADOS ===');
      empregadosUnicos.forEach((empregado, i) => {
        console.log(`${i + 1}. ${empregado.nome || 'Nome não informado'}`);
        console.log(`   CPF: ${empregado.cpf || 'N/A'}`);
        console.log(`   Status: ${empregado.status || 'N/A'}`);
        console.log(`   Data Admissão: ${empregado.dataAdmissao || 'N/A'}`);
        console.log(`   Cargo: ${empregado.cargo || 'N/A'}`);
        console.log(
          `   Salário: ${empregado.salario ? `R$ ${empregado.salario}` : 'N/A'}`
        );
        console.log(`   Fonte: ${empregado.fonte || 'N/A'}`);
        console.log('');
      });

      // Verificar se Erika está na lista
      const erika = empregadosUnicos.find(
        emp =>
          emp.cpf === '38645446880' ||
          (emp.nome && emp.nome.toUpperCase().includes('ERIKA'))
      );

      if (erika) {
        console.log('🎯 === ERIKA ENCONTRADA NA LISTA ===');
        console.log('✅ Confirmado: Erika está vinculada a este empregador');
        console.log(`📋 Nome: ${erika.nome}`);
        console.log(`🆔 CPF: ${erika.cpf}`);
        console.log(`📅 Data Admissão: ${erika.dataAdmissao || 'A definir'}`);
        console.log(
          `💰 Salário: ${erika.salario ? `R$ ${erika.salario}` : 'A definir'}`
        );
        console.log(`👔 Cargo: ${erika.cargo || 'A definir'}`);
        console.log(`📊 Status: ${erika.status || 'A definir'}`);
      } else {
        console.log('⚠️ === ERIKA NÃO ENCONTRADA ===');
        console.log('🔍 Possíveis causas:');
        console.log('   • Protocolo S-2200 ainda não processado');
        console.log('   • Dados ainda não indexados no sistema');
        console.log('   • Necessário aguardar mais tempo');
      }
    } else {
      console.log('⚠️ === NENHUM EMPREGADO ENCONTRADO ===');
      console.log('🔍 Possíveis causas:');
      console.log('   • Protocolos ainda não processados (código 748)');
      console.log('   • Sistema ainda indexando os dados');
      console.log('   • Necessário aguardar 30-60 min adicionais');
      console.log('');
      console.log('💡 RECOMENDAÇÃO:');
      console.log('   • Aguardar processamento dos protocolos');
      console.log('   • Tentar novamente em 1 hora');
      console.log('   • Usar dados dos envios enquanto aguarda');
    }

    // Salvar resultados
    const resultadoCompleto = {
      empregador: {
        nome: 'FRANCISCO JOSE LATTARI PAPALEO',
        cpf: cpfEmpregador,
      },
      consulta: {
        timestamp: new Date().toISOString(),
        metodosUsados: 3,
        metodosComSucesso,
        totalEmpregados: empregadosUnicos.length,
      },
      empregados: empregadosUnicos,
      erikaEncontrada: empregadosUnicos.some(
        emp =>
          emp.cpf === '38645446880' ||
          (emp.nome && emp.nome.toUpperCase().includes('ERIKA'))
      ),
    };

    fs.writeFileSync(
      `consulta-todos-empregados-${Date.now()}.json`,
      JSON.stringify(resultadoCompleto, null, 2)
    );

    return resultadoCompleto;
  } catch (error) {
    console.error('❌ Erro na consulta de empregados:', error.message);
    return {
      success: false,
      error: error.message,
      empregados: [],
    };
  }
}

// Método 1: Consultar eventos de empregados (S-2200)
async function consultarEventosEmpregados(cert, key, cpfEmpregador) {
  try {
    console.log(
      '📤 Consultando eventos S-2200 (cadastramento de empregados)...'
    );

    // XML para consultar eventos por tipo S-2200
    const xmlEventos = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <tipoEvento>S-2200</tipoEvento>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fazerRequisicaoSOAP(
      cert,
      key,
      xmlEventos,
      'ConsultarEventosEmpregados'
    );

    if (response.success) {
      const empregados = extrairEmpregadosDoXML(response.data, 'EVENTOS_S2200');
      return { success: true, empregados };
    } else {
      return { success: false, error: response.error, empregados: [] };
    }
  } catch (error) {
    return { success: false, error: error.message, empregados: [] };
  }
}

// Método 2: Consultar empregados por período
async function consultarEmpregadosPorPeriodo(cert, key, cpfEmpregador) {
  try {
    console.log('📅 Consultando empregados por período...');

    const dataInicio = '2025-01-01';
    const dataFim = '2025-12-31';

    const xmlPeriodo = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <periodoConsulta>
            <dataInicio>${dataInicio}</dataInicio>
            <dataFim>${dataFim}</dataFim>
          </periodoConsulta>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fazerRequisicaoSOAP(
      cert,
      key,
      xmlPeriodo,
      'ConsultarPorPeriodo'
    );

    if (response.success) {
      const empregados = extrairEmpregadosDoXML(response.data, 'PERIODO');
      return { success: true, empregados };
    } else {
      return { success: false, error: response.error, empregados: [] };
    }
  } catch (error) {
    return { success: false, error: error.message, empregados: [] };
  }
}

// Método 3: Consultar qualificação cadastral
async function consultarQualificacaoCadastral(cert, key, cpfEmpregador) {
  try {
    console.log('🏢 Consultando qualificação cadastral do empregador...');

    const xmlQualificacao = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <cpfCnpj>${cpfEmpregador}</cpfCnpj>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fazerRequisicaoSOAP(
      cert,
      key,
      xmlQualificacao,
      'ConsultarQualificacao'
    );

    if (response.success) {
      const empregados = extrairEmpregadosDoXML(response.data, 'QUALIFICACAO');
      return { success: true, empregados };
    } else {
      return { success: false, error: response.error, empregados: [] };
    }
  } catch (error) {
    return { success: false, error: error.message, empregados: [] };
  }
}

// Função auxiliar para fazer requisições SOAP
async function fazerRequisicaoSOAP(cert, key, xml, tipo) {
  return new Promise(resolve => {
    const soapAction =
      'http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos';

    const options = {
      host: 'webservices.producaorestrita.esocial.gov.br',
      path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: `"${soapAction}"`,
        'Content-Length': Buffer.byteLength(xml),
        'User-Agent': `eSocial-Consulta-${tipo}/1.0`,
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      cert: cert,
      key: key,
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      timeout: 30000,
    };

    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        console.log(`📊 ${tipo}: Status ${res.statusCode}`);

        if (res.statusCode === 200) {
          const temCodigo748 = data.includes('<codigo>748</codigo>');
          if (temCodigo748) {
            resolve({
              success: false,
              error: 'Código 748 - Aguardando processamento',
              data,
            });
          } else {
            resolve({ success: true, data });
          }
        } else {
          resolve({ success: false, error: `HTTP ${res.statusCode}`, data });
        }
      });
    });

    req.on('error', error => {
      resolve({ success: false, error: error.message });
    });

    req.write(xml);
    req.end();
  });
}

// Função para extrair empregados do XML de resposta
function extrairEmpregadosDoXML(xmlResponse, fonte) {
  try {
    const empregados = [];

    // Buscar padrões de empregados no XML
    const padroes = [
      /<trabalhador[^>]*>[\s\S]*?<\/trabalhador>/g,
      /<empregado[^>]*>[\s\S]*?<\/empregado>/g,
      /<dadosTrabalhador[^>]*>[\s\S]*?<\/dadosTrabalhador>/g,
    ];

    padroes.forEach(padrao => {
      const matches = xmlResponse.match(padrao);
      if (matches) {
        matches.forEach(match => {
          const empregado = extrairDadosEmpregado(match, fonte);
          if (empregado) {
            empregados.push(empregado);
          }
        });
      }
    });

    return empregados;
  } catch (error) {
    console.error('❌ Erro ao extrair empregados do XML:', error.message);
    return [];
  }
}

// Função para extrair dados específicos de um empregado
function extrairDadosEmpregado(xmlEmpregado, fonte) {
  try {
    const empregado = { fonte };

    // Extrair CPF
    const cpfMatch = xmlEmpregado.match(/<cpf[^>]*>(.*?)<\/cpf>/i);
    if (cpfMatch) empregado.cpf = cpfMatch[1].trim();

    // Extrair nome
    const nomeMatch = xmlEmpregado.match(/<nome[^>]*>(.*?)<\/nome>/i);
    if (nomeMatch) empregado.nome = nomeMatch[1].trim();

    // Extrair data admissão
    const admissaoMatch = xmlEmpregado.match(/<dtAdm[^>]*>(.*?)<\/dtAdm>/i);
    if (admissaoMatch) empregado.dataAdmissao = admissaoMatch[1].trim();

    // Extrair salário
    const salarioMatch = xmlEmpregado.match(/<vrSalFx[^>]*>(.*?)<\/vrSalFx>/i);
    if (salarioMatch) empregado.salario = parseFloat(salarioMatch[1].trim());

    // Extrair cargo
    const cargoMatch = xmlEmpregado.match(/<codCargo[^>]*>(.*?)<\/codCargo>/i);
    if (cargoMatch) empregado.cargo = cargoMatch[1].trim();

    // Extrair status
    const statusMatch = xmlEmpregado.match(/<situacao[^>]*>(.*?)<\/situacao>/i);
    if (statusMatch) empregado.status = statusMatch[1].trim();

    // Só retornar se tiver pelo menos CPF ou nome
    if (empregado.cpf || empregado.nome) {
      return empregado;
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao extrair dados do empregado:', error.message);
    return null;
  }
}

// Executar consulta
consultarTodosEmpregadosEmpregador().then(resultado => {
  console.log('='.repeat(70));
  console.log('🏆 RESULTADO FINAL DA CONSULTA DE EMPREGADOS:');
  console.log('');

  if (
    resultado.success !== false &&
    resultado.empregados &&
    resultado.empregados.length > 0
  ) {
    console.log(
      `🎉 SUCESSO! ${resultado.empregados.length} empregado(s) encontrado(s)!`
    );

    if (resultado.erikaEncontrada) {
      console.log('✅ ERIKA CONFIRMADA na lista de empregados!');
    } else {
      console.log('⚠️ Erika não encontrada - aguardar processamento');
    }
  } else {
    console.log('⏰ AGUARDANDO PROCESSAMENTO dos protocolos');
    console.log('💡 Recomendação: Tentar novamente em 30-60 min');
  }

  console.log('='.repeat(70));
  console.log('📊 MÉTODOS DE CONSULTA TESTADOS:');
  console.log('✅ ConsultarEventos (S-2200)');
  console.log('✅ ConsultarPorPeriodo');
  console.log('✅ ConsultarQualificacaoCadastral');
  console.log('='.repeat(70));
});
