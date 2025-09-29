// 1) Como saber que já foi processado + 2) Buscar todas as informações cadastrais
const https = require('https');
const fs = require('fs');

async function verificarProcessamentoEBuscarDados() {
  console.log('🎯 === VERIFICAÇÃO DE PROCESSAMENTO + DADOS COMPLETOS ===');
  console.log('');
  console.log('📋 QUESTÕES A RESPONDER:');
  console.log('1️⃣ Como saber que já foi processado?');
  console.log(
    '2️⃣ Como buscar informações cadastrais completas do funcionário?'
  );
  console.log('');

  try {
    // Configurar mTLS
    const cert = fs.readFileSync('temp-cert-forge.pem', 'utf8');
    const key = fs.readFileSync('temp-key-forge.pem', 'utf8');

    const cpfEmpregador = '59876913700';
    const protocolos = [
      {
        protocolo: '1.2.20250918.68606',
        tipo: 'S-1000',
        descricao: 'Empregador',
      },
      { protocolo: '1.2.20250918.58742', tipo: 'S-2200', descricao: 'Erika' },
    ];

    console.log('🔍 === PARTE 1: VERIFICAR SE JÁ FOI PROCESSADO ===');
    console.log('');

    const statusProcessamento = [];

    for (const item of protocolos) {
      console.log(
        `🧪 Verificando processamento: ${item.descricao} (${item.tipo})`
      );
      console.log(`📋 Protocolo: ${item.protocolo}`);

      const status = await verificarStatusProcessamento(
        cert,
        key,
        item.protocolo
      );
      statusProcessamento.push({ ...item, ...status });

      console.log(`📊 Status: ${status.status}`);
      console.log(`📋 Código: ${status.codigoESocial}`);
      console.log(`📝 Descrição: ${status.descricao}`);
      console.log(`✅ Processado: ${status.processado ? 'SIM' : 'NÃO'}`);

      if (status.processado) {
        console.log('🎉 PROTOCOLO PROCESSADO! Dados disponíveis para consulta');
      } else {
        console.log('⏰ Aguardando processamento...');
      }
      console.log('');
    }

    console.log('📊 === RESUMO DO PROCESSAMENTO ===');
    const protocolosProcessados = statusProcessamento.filter(p => p.processado);
    const protocolosPendentes = statusProcessamento.filter(p => !p.processado);

    console.log(
      `✅ Processados: ${protocolosProcessados.length}/${statusProcessamento.length}`
    );
    console.log(
      `⏰ Pendentes: ${protocolosPendentes.length}/${statusProcessamento.length}`
    );
    console.log('');

    if (protocolosProcessados.length > 0) {
      console.log('🔍 === PARTE 2: BUSCAR DADOS CADASTRAIS COMPLETOS ===');
      console.log('');

      for (const protocolo of protocolosProcessados) {
        console.log(`📊 Extraindo dados completos: ${protocolo.descricao}`);

        const dadosCompletos = await buscarDadosCompletosDoProtocolo(
          cert,
          key,
          protocolo.protocolo,
          protocolo.tipo,
          protocolo.dadosResposta
        );

        if (dadosCompletos.success) {
          console.log('✅ DADOS COMPLETOS EXTRAÍDOS:');
          console.log('');

          if (protocolo.tipo === 'S-1000') {
            exibirDadosEmpregador(dadosCompletos.dados);
          } else if (protocolo.tipo === 'S-2200') {
            exibirDadosEmpregado(dadosCompletos.dados);
          }
        } else {
          console.log(`❌ Erro ao extrair dados: ${dadosCompletos.error}`);
        }
        console.log('');
      }

      // Se temos dados do empregado processados, buscar informações adicionais
      const empregadoProcessado = protocolosProcessados.find(
        p => p.tipo === 'S-2200'
      );
      if (empregadoProcessado) {
        console.log('🔍 === DADOS CADASTRAIS ADICIONAIS DO EMPREGADO ===');
        console.log('');

        const dadosAdicionais = await buscarDadosAdicionaisEmpregado(
          cert,
          key,
          cpfEmpregador,
          '38645446880' // CPF da Erika
        );

        if (dadosAdicionais.success) {
          console.log('✅ INFORMAÇÕES ADICIONAIS ENCONTRADAS:');
          exibirDadosAdicionais(dadosAdicionais.dados);
        } else {
          console.log(`⚠️ Dados adicionais: ${dadosAdicionais.error}`);
        }
      }
    } else {
      console.log('⏰ === NENHUM PROTOCOLO PROCESSADO AINDA ===');
      console.log('');
      console.log('💡 INDICADORES DE PROCESSAMENTO:');
      console.log('✅ Status 201: Lote processado com sucesso');
      console.log('✅ Status 202: Lote processado com advertências');
      console.log('✅ Status 203: Lote processado com erros não impeditivos');
      console.log('❌ Status 501 + Código 748: Ainda não processado');
      console.log('❌ Status 502: Schema inválido');
      console.log('');
      console.log('⏰ TEMPO ESTIMADO DE PROCESSAMENTO:');
      console.log('• Produção Restrita: 5-30 minutos');
      console.log('• Produção: 10-60 minutos');
      console.log('• Horário de pico: até 2 horas');
    }

    // Salvar relatório completo
    const relatorio = {
      timestamp: new Date().toISOString(),
      empregador: {
        cpf: cpfEmpregador,
        nome: 'FRANCISCO JOSE LATTARI PAPALEO',
      },
      protocolos: statusProcessamento,
      protocolosProcessados: protocolosProcessados.length,
      protocolosPendentes: protocolosPendentes.length,
      dadosDisponiveis: protocolosProcessados.length > 0,
    };

    fs.writeFileSync(
      `relatorio-processamento-${Date.now()}.json`,
      JSON.stringify(relatorio, null, 2)
    );

    return relatorio;
  } catch (error) {
    console.error('❌ Erro na verificação:', error.message);
    return { success: false, error: error.message };
  }
}

// Função para verificar status de processamento
async function verificarStatusProcessamento(cert, key, protocolo) {
  try {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <protocoloEnvio>${protocolo}</protocoloEnvio>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;

    const response = await fazerRequisicaoSOAP(
      cert,
      key,
      xml,
      'VerificarStatus'
    );

    if (response.success) {
      // Analisar resposta para determinar se foi processado
      const codigoMatch = response.data.match(
        /<cdResposta>(\d+)<\/cdResposta>/
      );
      const descMatch = response.data.match(
        /<descResposta>(.*?)<\/descResposta>/
      );

      const codigo = codigoMatch?.[1];
      const descricao = descMatch?.[1]?.trim();

      // Determinar se foi processado baseado no código
      let processado = false;
      let status = 'PENDENTE';

      if (codigo === '201') {
        processado = true;
        status = 'PROCESSADO_COM_SUCESSO';
      } else if (codigo === '202') {
        processado = true;
        status = 'PROCESSADO_COM_ADVERTENCIAS';
      } else if (codigo === '203') {
        processado = true;
        status = 'PROCESSADO_COM_ERROS_NAO_IMPEDITIVOS';
      } else if (
        codigo === '501' &&
        response.data.includes('<codigo>748</codigo>')
      ) {
        processado = false;
        status = 'AGUARDANDO_PROCESSAMENTO';
      } else if (codigo === '502') {
        processado = false;
        status = 'SCHEMA_INVALIDO';
      }

      return {
        processado,
        status,
        codigoESocial: codigo,
        descricao,
        dadosResposta: response.data,
        temDados:
          !response.data.includes('<codigo>748</codigo>') &&
          (response.data.includes('<loteEventos>') ||
            response.data.includes('<eventos>') ||
            response.data.includes('<retorno>')),
      };
    } else {
      return {
        processado: false,
        status: 'ERRO_CONSULTA',
        codigoESocial: null,
        descricao: response.error,
        dadosResposta: null,
        temDados: false,
      };
    }
  } catch (error) {
    return {
      processado: false,
      status: 'ERRO',
      codigoESocial: null,
      descricao: error.message,
      dadosResposta: null,
      temDados: false,
    };
  }
}

// Função para buscar dados completos do protocolo
async function buscarDadosCompletosDoProtocolo(
  cert,
  key,
  protocolo,
  tipo,
  xmlResposta
) {
  try {
    console.log(`🔍 Extraindo dados completos do ${tipo}...`);

    const dados = {};

    if (tipo === 'S-1000') {
      // Extrair dados do empregador
      dados.tipo = 'EMPREGADOR';
      dados.cpf = extrairCampo(xmlResposta, /<nrInsc[^>]*>(.*?)<\/nrInsc>/);
      dados.nome = extrairCampo(xmlResposta, /<nmRazao[^>]*>(.*?)<\/nmRazao>/);
      dados.tipoInscricao = extrairCampo(
        xmlResposta,
        /<tpInsc[^>]*>(.*?)<\/tpInsc>/
      );
      dados.classificacaoTributaria = extrairCampo(
        xmlResposta,
        /<classTrib[^>]*>(.*?)<\/classTrib>/
      );

      // Endereço
      dados.endereco = {
        logradouro: extrairCampo(
          xmlResposta,
          /<dscLograd[^>]*>(.*?)<\/dscLograd>/
        ),
        numero: extrairCampo(xmlResposta, /<nrLograd[^>]*>(.*?)<\/nrLograd>/),
        bairro: extrairCampo(xmlResposta, /<bairro[^>]*>(.*?)<\/bairro>/),
        cidade: extrairCampo(xmlResposta, /<nmCid[^>]*>(.*?)<\/nmCid>/),
        uf: extrairCampo(xmlResposta, /<uf[^>]*>(.*?)<\/uf>/),
        cep: extrairCampo(xmlResposta, /<codCep[^>]*>(.*?)<\/codCep>/),
      };
    } else if (tipo === 'S-2200') {
      // Extrair dados do empregado
      dados.tipo = 'EMPREGADO';
      dados.cpf = extrairCampo(xmlResposta, /<cpfTrab[^>]*>(.*?)<\/cpfTrab>/);
      dados.nome = extrairCampo(xmlResposta, /<nmTrab[^>]*>(.*?)<\/nmTrab>/);
      dados.dataNascimento = extrairCampo(
        xmlResposta,
        /<dtNasc[^>]*>(.*?)<\/dtNasc>/
      );
      dados.dataAdmissao = extrairCampo(
        xmlResposta,
        /<dtAdm[^>]*>(.*?)<\/dtAdm>/
      );
      dados.cargo = extrairCampo(
        xmlResposta,
        /<codCargo[^>]*>(.*?)<\/codCargo>/
      );
      dados.salario = extrairCampoNumerico(
        xmlResposta,
        /<vrSalFx[^>]*>(.*?)<\/vrSalFx>/
      );

      // Dados do vínculo
      dados.vinculo = {
        tipo: extrairCampo(xmlResposta, /<tpRegTrab[^>]*>(.*?)<\/tpRegTrab>/),
        categoria: extrairCampo(
          xmlResposta,
          /<categOrig[^>]*>(.*?)<\/categOrig>/
        ),
        jornada: extrairCampo(
          xmlResposta,
          /<tpJornada[^>]*>(.*?)<\/tpJornada>/
        ),
      };

      // Endereço do trabalhador
      dados.endereco = {
        logradouro: extrairCampo(
          xmlResposta,
          /<dscLograd[^>]*>(.*?)<\/dscLograd>/
        ),
        numero: extrairCampo(xmlResposta, /<nrLograd[^>]*>(.*?)<\/nrLograd>/),
        bairro: extrairCampo(xmlResposta, /<bairro[^>]*>(.*?)<\/bairro>/),
        cidade: extrairCampo(xmlResposta, /<nmCid[^>]*>(.*?)<\/nmCid>/),
        uf: extrairCampo(xmlResposta, /<uf[^>]*>(.*?)<\/uf>/),
        cep: extrairCampo(xmlResposta, /<codCep[^>]*>(.*?)<\/codCep>/),
      };
    }

    dados.protocolo = protocolo;
    dados.fonte = `${tipo}_PROCESSADO`;
    dados.timestamp = new Date().toISOString();

    return { success: true, dados };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Função para buscar dados adicionais do empregado
async function buscarDadosAdicionaisEmpregado(
  cert,
  key,
  cpfEmpregador,
  cpfEmpregado
) {
  try {
    console.log('🔍 Buscando dados adicionais do empregado...');

    // Consultar histórico de remuneração (S-1200)
    const dadosRemuneracao = await consultarHistoricoRemuneracao(
      cert,
      key,
      cpfEmpregador,
      cpfEmpregado
    );

    // Consultar alterações contratuais (S-2206)
    const dadosAlteracoes = await consultarAlteracoesContratuais(
      cert,
      key,
      cpfEmpregador,
      cpfEmpregado
    );

    // Consultar afastamentos (S-2230)
    const dadosAfastamentos = await consultarAfastamentos(
      cert,
      key,
      cpfEmpregador,
      cpfEmpregado
    );

    return {
      success: true,
      dados: {
        remuneracao: dadosRemuneracao,
        alteracoes: dadosAlteracoes,
        afastamentos: dadosAfastamentos,
        fonte: 'CONSULTAS_ADICIONAIS',
      },
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Funções auxiliares
function extrairCampo(xml, regex) {
  const match = xml.match(regex);
  return match ? match[1].trim() : null;
}

function extrairCampoNumerico(xml, regex) {
  const valor = extrairCampo(xml, regex);
  return valor ? parseFloat(valor) : null;
}

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
        'User-Agent': `eSocial-${tipo}/1.0`,
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
        if (res.statusCode === 200) {
          resolve({ success: true, data });
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

// Funções de exibição
function exibirDadosEmpregador(dados) {
  console.log('🏢 DADOS COMPLETOS DO EMPREGADOR:');
  console.log(`📋 Nome: ${dados.nome || 'N/A'}`);
  console.log(`🆔 CPF: ${dados.cpf || 'N/A'}`);
  console.log(`📊 Tipo Inscrição: ${dados.tipoInscricao || 'N/A'}`);
  console.log(
    `🏛️ Classificação Tributária: ${dados.classificacaoTributaria || 'N/A'}`
  );
  console.log(
    `📍 Endereço: ${dados.endereco?.logradouro || 'N/A'}, ${dados.endereco?.numero || 'N/A'}`
  );
  console.log(
    `🏙️ Cidade: ${dados.endereco?.cidade || 'N/A'}/${dados.endereco?.uf || 'N/A'}`
  );
  console.log(`📮 CEP: ${dados.endereco?.cep || 'N/A'}`);
}

function exibirDadosEmpregado(dados) {
  console.log('👩‍💼 DADOS COMPLETOS DO EMPREGADO:');
  console.log(`📋 Nome: ${dados.nome || 'N/A'}`);
  console.log(`🆔 CPF: ${dados.cpf || 'N/A'}`);
  console.log(`🎂 Data Nascimento: ${dados.dataNascimento || 'N/A'}`);
  console.log(`📅 Data Admissão: ${dados.dataAdmissao || 'N/A'}`);
  console.log(`👔 Cargo: ${dados.cargo || 'N/A'}`);
  console.log(
    `💰 Salário: ${dados.salario ? `R$ ${dados.salario.toFixed(2)}` : 'N/A'}`
  );
  console.log(`🔗 Tipo Vínculo: ${dados.vinculo?.tipo || 'N/A'}`);
  console.log(`📊 Categoria: ${dados.vinculo?.categoria || 'N/A'}`);
  console.log(`⏰ Jornada: ${dados.vinculo?.jornada || 'N/A'}`);
  console.log(
    `📍 Endereço: ${dados.endereco?.logradouro || 'N/A'}, ${dados.endereco?.numero || 'N/A'}`
  );
  console.log(
    `🏙️ Cidade: ${dados.endereco?.cidade || 'N/A'}/${dados.endereco?.uf || 'N/A'}`
  );
}

function exibirDadosAdicionais(dados) {
  console.log('💰 HISTÓRICO DE REMUNERAÇÃO:');
  console.log(`📊 Status: ${dados.remuneracao?.status || 'Não disponível'}`);
  console.log('');
  console.log('📝 ALTERAÇÕES CONTRATUAIS:');
  console.log(`📊 Status: ${dados.alteracoes?.status || 'Não disponível'}`);
  console.log('');
  console.log('🏥 AFASTAMENTOS:');
  console.log(`📊 Status: ${dados.afastamentos?.status || 'Não disponível'}`);
}

// Funções de consulta adicionais (stubs)
async function consultarHistoricoRemuneracao(
  cert,
  key,
  cpfEmpregador,
  cpfEmpregado
) {
  return { status: 'Implementar consulta S-1200' };
}

async function consultarAlteracoesContratuais(
  cert,
  key,
  cpfEmpregador,
  cpfEmpregado
) {
  return { status: 'Implementar consulta S-2206' };
}

async function consultarAfastamentos(cert, key, cpfEmpregador, cpfEmpregado) {
  return { status: 'Implementar consulta S-2230' };
}

// Executar verificação
verificarProcessamentoEBuscarDados().then(resultado => {
  console.log('='.repeat(70));
  console.log('🏆 CONCLUSÕES FINAIS:');
  console.log('');
  console.log('1️⃣ COMO SABER QUE FOI PROCESSADO:');
  console.log('✅ Código 201/202/203 = Processado');
  console.log('❌ Código 501 + 748 = Ainda não processado');
  console.log('❌ Código 502 = Schema inválido');
  console.log('');
  console.log('2️⃣ BUSCAR DADOS COMPLETOS:');
  console.log('✅ Protocolo processado → Extrair dados do XML de resposta');
  console.log('✅ Dados básicos → Nome, CPF, endereço, salário, etc.');
  console.log('✅ Dados adicionais → Consultas S-1200, S-2206, S-2230');
  console.log('');
  console.log(
    `📊 Status atual: ${resultado.protocolosProcessados}/${resultado.protocolos?.length || 0} processados`
  );
  console.log('='.repeat(70));
});
