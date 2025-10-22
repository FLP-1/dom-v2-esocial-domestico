/**
 * 🔍 Verificação Específica: Número do Endereço
 * 
 * Analisa se as APIs estão retornando o número "402" da Rua Dias de Toledo
 * Este é um dado CRÍTICO para anti-fraude
 */

const COORDENADAS_EXATAS = {
  lat: -23.6141781,
  lng: -46.6346946,
  endereco: "Rua Dias de Toledo, 402",
  numeroEsperado: "402",
  ruaEsperada: "Rua Dias de Toledo"
};

async function verificarNominatimNumero() {
  try {
    console.log('🗺️ VERIFICAÇÃO NOMINATIM - NÚMERO DO ENDEREÇO');
    console.log(`📍 Coordenadas: ${COORDENADAS_EXATAS.lat}, ${COORDENADAS_EXATAS.lng}`);
    console.log(`🎯 Número esperado: ${COORDENADAS_EXATAS.numeroEsperado}`);
    console.log(`🎯 Rua esperada: ${COORDENADAS_EXATAS.ruaEsperada}\n`);
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Number Verification)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📋 ANÁLISE DETALHADA:');
    console.log(`   📍 Endereço completo: ${data.display_name}`);
    console.log(`   🏠 Número da casa: ${data.address?.house_number || 'N/A'}`);
    console.log(`   🛣️ Nome da rua: ${data.address?.road || 'N/A'}`);
    console.log(`   🏘️ Bairro: ${data.address?.suburb || data.address?.neighbourhood || 'N/A'}`);
    console.log(`   🏙️ Cidade: ${data.address?.city || data.address?.town || 'N/A'}`);
    console.log(`   📮 CEP: ${data.address?.postcode || 'N/A'}`);
    
    // Verificações específicas
    const temNumero = data.address?.house_number;
    const numeroCorreto = temNumero === COORDENADAS_EXATAS.numeroEsperado;
    const temRua = data.address?.road;
    const ruaCorreta = temRua && temRua.toLowerCase().includes('dias de toledo');
    
    console.log('\n🎯 VERIFICAÇÕES CRÍTICAS:');
    console.log(`   🏠 Tem número: ${temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Número correto (${COORDENADAS_EXATAS.numeroEsperado}): ${numeroCorreto ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🛣️ Tem rua: ${temRua ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Rua correta (Dias de Toledo): ${ruaCorreta ? '✅ SIM' : '❌ NÃO'}`);
    
    // Verificar se endereço completo contém o número
    const enderecoCompleto = data.display_name.toLowerCase();
    const contemNumeroNoEndereco = enderecoCompleto.includes(COORDENADAS_EXATAS.numeroEsperado);
    console.log(`   📍 Endereço completo contém número: ${contemNumeroNoEndereco ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      temNumero: !!temNumero,
      numeroCorreto,
      temRua: !!temRua,
      ruaCorreta,
      contemNumeroNoEndereco,
      components: data.address
    };
    
  } catch (error) {
    console.log(`❌ Erro Nominatim: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verificarBigDataCloudNumero() {
  try {
    console.log('\n☁️ VERIFICAÇÃO BIGDATACLOUD - NÚMERO DO ENDEREÇO');
    
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${COORDENADAS_EXATAS.lat}&longitude=${COORDENADAS_EXATAS.lng}&localityLanguage=pt`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Number Verification)',
      },
    });

    if (!response.ok) {
      throw new Error(`BigDataCloud API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📋 ANÁLISE BIGDATACLOUD:');
    console.log(`   📍 Dados disponíveis: ${JSON.stringify(data.localityInfo, null, 2)}`);
    
    // BigDataCloud tem estrutura diferente
    const temDados = data.localityInfo && Object.keys(data.localityInfo).length > 0;
    console.log(`   📊 Tem dados: ${temDados ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      temDados,
      data: data.localityInfo
    };
    
  } catch (error) {
    console.log(`❌ Erro BigDataCloud: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function verificarNossaAPINumero() {
  try {
    console.log('\n🔧 VERIFICAÇÃO NOSSA API - NÚMERO DO ENDEREÇO');
    
    const url = `http://localhost:3000/api/geocoding/reverse?lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Nossa API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('📋 ANÁLISE NOSSA API:');
    console.log(`   📍 Endereço: ${data.address || 'N/A'}`);
    console.log(`   🏠 Número: ${data.components?.number || 'N/A'}`);
    console.log(`   🛣️ Rua: ${data.components?.street || 'N/A'}`);
    console.log(`   🏘️ Bairro: ${data.components?.neighborhood || 'N/A'}`);
    console.log(`   🏙️ Cidade: ${data.components?.city || 'N/A'}`);
    console.log(`   📮 CEP: ${data.cep || 'N/A'}`);
    console.log(`   🔄 Fonte: ${data.source || 'N/A'}`);
    
    const temNumero = data.components?.number;
    const numeroCorreto = temNumero === COORDENADAS_EXATAS.numeroEsperado;
    const temRua = data.components?.street;
    const ruaCorreta = temRua && temRua.toLowerCase().includes('dias de toledo');
    
    console.log('\n🎯 VERIFICAÇÕES NOSSA API:');
    console.log(`   🏠 Tem número: ${temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Número correto (${COORDENADAS_EXATAS.numeroEsperado}): ${numeroCorreto ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🛣️ Tem rua: ${temRua ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Rua correta (Dias de Toledo): ${ruaCorreta ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      temNumero: !!temNumero,
      numeroCorreto,
      temRua: !!temRua,
      ruaCorreta,
      data: data
    };
    
  } catch (error) {
    console.log(`❌ Erro Nossa API: ${error.message}`);
    console.log('   💡 Certifique-se de que o servidor está rodando (npm run dev)');
    return { success: false, error: error.message };
  }
}

async function executarVerificacaoCompleta() {
  console.log('🔍 VERIFICAÇÃO ESPECÍFICA: NÚMERO DO ENDEREÇO');
  console.log('='.repeat(60));
  console.log(`📍 Coordenadas: ${COORDENADAS_EXATAS.lat}, ${COORDENADAS_EXATAS.lng}`);
  console.log(`🎯 Endereço esperado: ${COORDENADAS_EXATAS.endereco}`);
  console.log(`🏠 Número esperado: ${COORDENADAS_EXATAS.numeroEsperado}`);
  console.log(`🛣️ Rua esperada: ${COORDENADAS_EXATAS.ruaEsperada}`);
  console.log('='.repeat(60));
  
  // Verificação 1: Nominatim
  const resultadoNominatim = await verificarNominatimNumero();
  
  // Verificação 2: BigDataCloud
  const resultadoBigDataCloud = await verificarBigDataCloudNumero();
  
  // Verificação 3: Nossa API
  const resultadoNossaAPI = await verificarNossaAPINumero();
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO - NÚMERO DO ENDEREÇO:');
  console.log('='.repeat(60));
  
  if (resultadoNominatim.success) {
    console.log('✅ NOMINATIM:');
    console.log(`   🏠 Retorna número: ${resultadoNominatim.temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Número correto: ${resultadoNominatim.numeroCorreto ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🛣️ Rua correta: ${resultadoNominatim.ruaCorreta ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   📍 Contém número no endereço: ${resultadoNominatim.contemNumeroNoEndereco ? '✅ SIM' : '❌ NÃO'}`);
  }
  
  if (resultadoBigDataCloud.success) {
    console.log('✅ BIGDATACLOUD:');
    console.log(`   📊 Tem dados: ${resultadoBigDataCloud.temDados ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🏠 Retorna número: ❌ NÃO (estrutura limitada)`);
  }
  
  if (resultadoNossaAPI.success) {
    console.log('✅ NOSSA API:');
    console.log(`   🏠 Retorna número: ${resultadoNossaAPI.temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Número correto: ${resultadoNossaAPI.numeroCorreto ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🛣️ Rua correta: ${resultadoNossaAPI.ruaCorreta ? '✅ SIM' : '❌ NÃO'}`);
  } else {
    console.log('❌ NOSSA API: Falhou (servidor não está rodando)');
  }
  
  console.log('\n💡 CONCLUSÃO:');
  console.log('   - Número do endereço é CRÍTICO para anti-fraude');
  console.log('   - Verificar se APIs retornam este dado essencial');
  console.log('   - Nominatim parece ser a melhor opção para números');
  console.log('   - Testar com servidor rodando para validação completa');
}

// Executar verificação
executarVerificacaoCompleta().catch(console.error);
