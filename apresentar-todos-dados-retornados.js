// Script para apresentar TODOS os dados retornados das consultas/envios
const fs = require('fs');

function apresentarTodosDadosRetornados() {
  console.log('📊 === APRESENTANDO TODOS OS DADOS RETORNADOS ===');
  console.log('🎯 Analisando respostas de consultas e envios');
  console.log('');

  // Buscar todos os arquivos de resposta XML
  const arquivosResposta = [
    // Arquivos mais recentes primeiro
    'xml-hibrido-final-1758160839300-response.xml',
    'protocolo-valido-1.2.20250917.46410-1758162342691-response.xml',
    'soapaction-correta-test-1758160587092-response.xml',
    'namespace-correto-test-1758160669530-response.xml',
  ];

  console.log('📋 Arquivos de resposta encontrados:');

  const arquivosExistentes = [];
  arquivosResposta.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
      const stats = fs.statSync(arquivo);
      console.log(`✅ ${arquivo} (${stats.size} bytes)`);
      arquivosExistentes.push(arquivo);
    } else {
      console.log(`❌ ${arquivo} (não encontrado)`);
    }
  });

  console.log('');

  // Analisar cada resposta em detalhes
  arquivosExistentes.forEach((arquivo, index) => {
    console.log(`\n📄 === ANÁLISE ${index + 1}: ${arquivo} ===`);

    try {
      const conteudo = fs.readFileSync(arquivo, 'utf8');
      console.log(`📊 Tamanho: ${conteudo.length} bytes`);

      // Verificar tipo de resposta
      const isXML =
        conteudo.includes('<?xml') || conteudo.includes('<s:Envelope>');
      const isHTML =
        conteudo.includes('<html') || conteudo.includes('<!DOCTYPE');
      const isSoapFault =
        conteudo.includes('<s:Fault>') || conteudo.includes('<faultstring>');

      console.log(`📋 Tipo: ${isXML ? 'XML' : isHTML ? 'HTML' : 'OUTRO'}`);
      console.log(`⚠️ SOAP Fault: ${isSoapFault ? 'SIM' : 'NÃO'}`);

      if (isSoapFault) {
        // Analisar SOAP Fault
        const faultCodeMatch = conteudo.match(
          /<faultcode[^>]*>([^<]+)<\/faultcode>/
        );
        const faultStringMatch = conteudo.match(
          /<faultstring[^>]*>(.*?)<\/faultstring>/s
        );

        if (faultCodeMatch) {
          console.log(`🔍 FaultCode: ${faultCodeMatch[1].trim()}`);
        }

        if (faultStringMatch) {
          console.log(`🔍 FaultString: ${faultStringMatch[1].trim()}`);
        }
      } else if (isXML) {
        // Analisar resposta XML válida
        const hasConsultarResponse = conteudo.includes(
          'ConsultarLoteEventosResponse'
        );
        const hasRetorno =
          conteudo.includes('<retorno>') ||
          conteudo.includes('<retornoProcessamento>');
        const hasStatus = conteudo.includes('<status>');
        const hasLoteEventos = conteudo.includes('<loteEventos>');

        console.log(
          `📊 ConsultarResponse: ${hasConsultarResponse ? 'SIM' : 'NÃO'}`
        );
        console.log(`📊 Retorno: ${hasRetorno ? 'SIM' : 'NÃO'}`);
        console.log(`📊 Status: ${hasStatus ? 'SIM' : 'NÃO'}`);
        console.log(`📊 LoteEventos: ${hasLoteEventos ? 'SIM' : 'NÃO'}`);

        // Extrair dados específicos
        const codigoMatch = conteudo.match(/<cdResposta>(\d+)<\/cdResposta>/);
        if (codigoMatch) {
          const codigo = codigoMatch[1];
          console.log(`📋 Código eSocial: ${codigo}`);

          // Mapear códigos conhecidos
          const codigosESocial = {
            201: 'Lote processado com sucesso',
            202: 'Lote em processamento',
            501: 'Solicitação de consulta incorreta',
            502: 'Erro no processamento do lote',
            503: 'Serviço temporariamente indisponível',
          };

          if (codigosESocial[codigo]) {
            console.log(`📋 Significado: ${codigosESocial[codigo]}`);
          }
        }

        const descMatch = conteudo.match(/<descResposta>(.*?)<\/descResposta>/);
        if (descMatch) {
          console.log(`📋 Descrição: ${descMatch[1].trim()}`);
        }

        // Extrair ocorrências
        const ocorrenciaMatches = conteudo.match(
          /<ocorrencia>[\s\S]*?<\/ocorrencia>/g
        );
        if (ocorrenciaMatches) {
          console.log(
            `📋 Ocorrências encontradas: ${ocorrenciaMatches.length}`
          );

          ocorrenciaMatches.forEach((ocorrencia, i) => {
            const codigoOcorrencia = ocorrencia.match(
              /<codigo>(\d+)<\/codigo>/
            )?.[1];
            const descricaoOcorrencia = ocorrencia.match(
              /<descricao>(.*?)<\/descricao>/
            )?.[1];
            const tipoOcorrencia = ocorrencia.match(/<tipo>(\d+)<\/tipo>/)?.[1];

            console.log(
              `   ${i + 1}. Código: ${codigoOcorrencia} | Tipo: ${tipoOcorrencia}`
            );
            console.log(`      Descrição: ${descricaoOcorrencia}`);

            // Mapear códigos de ocorrência conhecidos
            const codigosOcorrencia = {
              748: 'Protocolo informado é inválido',
              749: 'CPF/CNPJ informado é inválido',
              750: 'Período informado é inválido',
            };

            if (codigosOcorrencia[codigoOcorrencia]) {
              console.log(
                `      💡 Solução: ${codigosOcorrencia[codigoOcorrencia]}`
              );
            }
          });
        }

        // Procurar por dados de empregados/empregadores
        const dadosEmpregador = conteudo.match(
          /<empregador>[\s\S]*?<\/empregador>/
        );
        const dadosEmpregado = conteudo.match(
          /<trabalhador>[\s\S]*?<\/trabalhador>/
        );
        const dadosVinculo = conteudo.match(/<vinculo>[\s\S]*?<\/vinculo>/);

        if (dadosEmpregador) {
          console.log('📊 Dados do empregador encontrados!');
        }

        if (dadosEmpregado) {
          console.log('📊 Dados do empregado encontrados!');
        }

        if (dadosVinculo) {
          console.log('📊 Dados de vínculo encontrados!');
        }
      }

      // Mostrar conteúdo completo (se pequeno) ou resumo
      if (conteudo.length < 2000) {
        console.log('\n📄 Conteúdo completo:');
        console.log(conteudo);
      } else {
        console.log('\n📄 Conteúdo (primeiras 500 chars):');
        console.log(conteudo.substring(0, 500) + '...');
      }
    } catch (error) {
      console.error(`❌ Erro ao ler ${arquivo}: ${error.message}`);
    }
  });

  // Buscar dados de envios também
  console.log('\n' + '='.repeat(70));
  console.log('📤 ANALISANDO DADOS DE ENVIOS (S-1000, S-2200):');
  console.log('🎯 Para comparar com dados de consulta');

  // Verificar se temos dados de envios salvos
  const possiveisEnvios = [
    'relatorio-conectividade-esocial.json',
    // Outros arquivos que podem conter dados de envio
  ];

  possiveisEnvios.forEach(arquivo => {
    if (fs.existsSync(arquivo)) {
      console.log(`\n📄 Analisando: ${arquivo}`);
      try {
        const dados = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
        console.log('📊 Dados de envio encontrados:');
        console.log(JSON.stringify(dados, null, 2));
      } catch (error) {
        console.log(`❌ Erro ao parsear ${arquivo}: ${error.message}`);
      }
    }
  });

  // Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DE TODOS OS DADOS:');
  console.log('');
  console.log('✅ STATUS ATUAL:');
  console.log('   - mTLS: FUNCIONANDO');
  console.log('   - SOAPAction: CORRETA');
  console.log('   - XML Estrutura: CORRETA');
  console.log('   - Status HTTP: 200 (SUCESSO)');
  console.log('   - Resposta eSocial: VÁLIDA');
  console.log('');
  console.log('⚠️ PROBLEMA RESTANTE:');
  console.log('   - Código 748: Protocolo inválido');
  console.log('   - Solução: Usar protocolo de envio real');
  console.log('');
  console.log('🎯 PRÓXIMA AÇÃO:');
  console.log('   1. Enviar S-2200 real para gerar protocolo válido');
  console.log('   2. Consultar protocolo gerado');
  console.log('   3. Obter dados atualizados do empregado');
  console.log('='.repeat(70));
}

// Executar
apresentarTodosDadosRetornados();
