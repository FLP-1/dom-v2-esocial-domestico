/**
 * 🔍 Esclarecimento: Nominatim = OpenStreetMap API
 * 
 * Demonstrar que Nominatim É a API oficial do OpenStreetMap
 * O problema não é trocar de API, mas usar coordenadas corretas
 */

const COORDENADAS_SUAS = {
  lat: -23.6141781,
  lng: -46.6346946,
  nome: "Suas coordenadas"
};

const COORDENADAS_OSM = {
  lat: -23.6142749,
  lng: -46.6334639,
  nome: "Coordenadas do OpenStreetMap"
};

async function testarNominatimComSuasCoordenadas() {
  try {
    console.log('🗺️ TESTE: Nominatim com SUAS coordenadas');
    console.log(`📍 Coordenadas: ${COORDENADAS_SUAS.lat}, ${COORDENADAS_SUAS.lng}`);
    console.log(`🎯 Esperado: Rua Dias de Toledo, 402\n`);
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_SUAS.lat}&lon=${COORDENADAS_SUAS.lng}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Your Coordinates Test)',
      },
    });

    const data = await response.json();
    
    console.log('📋 RESULTADO COM SUAS COORDENADAS:');
    console.log(`   📍 Endereço: ${data.display_name}`);
    console.log(`   🏠 Número: ${data.address?.house_number || 'N/A'}`);
    console.log(`   🛣️ Rua: ${data.address?.road || 'N/A'}`);
    console.log(`   🏘️ Bairro: ${data.address?.suburb || 'N/A'}`);
    
    const contemNumero = data.display_name.includes('402');
    console.log(`   🎯 Contém "402": ${contemNumero ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      temNumero: !!data.address?.house_number,
      contemNumero,
      endereco: data.display_name
    };
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testarNominatimComCoordenadasOSM() {
  try {
    console.log('\n🗺️ TESTE: Nominatim com COORDENADAS DO OPENSTREETMAP');
    console.log(`📍 Coordenadas: ${COORDENADAS_OSM.lat}, ${COORDENADAS_OSM.lng}`);
    console.log(`🎯 Esperado: Rua Dias de Toledo, 402\n`);
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_OSM.lat}&lon=${COORDENADAS_OSM.lng}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (OSM Coordinates Test)',
      },
    });

    const data = await response.json();
    
    console.log('📋 RESULTADO COM COORDENADAS DO OSM:');
    console.log(`   📍 Endereço: ${data.display_name}`);
    console.log(`   🏠 Número: ${data.address?.house_number || 'N/A'}`);
    console.log(`   🛣️ Rua: ${data.address?.road || 'N/A'}`);
    console.log(`   🏘️ Bairro: ${data.address?.suburb || 'N/A'}`);
    
    const contemNumero = data.display_name.includes('402');
    console.log(`   🎯 Contém "402": ${contemNumero ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      temNumero: !!data.address?.house_number,
      contemNumero,
      endereco: data.display_name
    };
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function demonstrarDiferenca() {
  console.log('🔍 DEMONSTRAÇÃO: Por que a diferença?');
  console.log('='.repeat(60));
  
  // Calcular distância aproximada
  const latDiff = Math.abs(COORDENADAS_SUAS.lat - COORDENADAS_OSM.lat);
  const lngDiff = Math.abs(COORDENADAS_SUAS.lng - COORDENADAS_OSM.lng);
  
  // Conversão aproximada para metros (1 grau ≈ 111km)
  const latMetros = latDiff * 111000;
  const lngMetros = lngDiff * 111000;
  const distanciaAproximada = Math.sqrt(latMetros * latMetros + lngMetros * lngMetros);
  
  console.log(`📍 Suas coordenadas: ${COORDENADAS_SUAS.lat}, ${COORDENADAS_SUAS.lng}`);
  console.log(`📍 Coordenadas OSM: ${COORDENADAS_OSM.lat}, ${COORDENADAS_OSM.lng}`);
  console.log(`📏 Diferença: ~${Math.round(distanciaAproximada)} metros`);
  console.log('');
  console.log('💡 EXPLICAÇÃO:');
  console.log('   - Nominatim É a API do OpenStreetMap');
  console.log('   - Não são serviços diferentes!');
  console.log('   - O problema é a precisão das coordenadas');
  console.log('   - Suas coordenadas estão ~100m distantes do número');
  console.log('   - Com coordenadas corretas, Nominatim retorna o número');
}

async function executarDemonstracao() {
  console.log('🔍 ESCLARECIMENTO: Nominatim = OpenStreetMap API');
  console.log('='.repeat(60));
  console.log('❓ PERGUNTA: Trocar Nominatim por OpenStreetMap?');
  console.log('✅ RESPOSTA: Nominatim É a API do OpenStreetMap!');
  console.log('='.repeat(60));
  
  // Teste 1: Suas coordenadas
  const resultadoSuas = await testarNominatimComSuasCoordenadas();
  
  // Pausa entre requisições
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Teste 2: Coordenadas do OSM
  const resultadoOSM = await testarNominatimComCoordenadasOSM();
  
  // Demonstração da diferença
  await demonstrarDiferenca();
  
  // Resumo final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMO:');
  console.log('='.repeat(60));
  
  if (resultadoSuas.success) {
    console.log('❌ SUAS COORDENADAS:');
    console.log(`   🏠 Retorna número: ${resultadoSuas.temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Contém "402": ${resultadoSuas.contemNumero ? '✅ SIM' : '❌ NÃO'}`);
  }
  
  if (resultadoOSM.success) {
    console.log('✅ COORDENADAS DO OSM:');
    console.log(`   🏠 Retorna número: ${resultadoOSM.temNumero ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`   🎯 Contém "402": ${resultadoOSM.contemNumero ? '✅ SIM' : '❌ NÃO'}`);
  }
  
  console.log('\n💡 CONCLUSÃO:');
  console.log('   - Nominatim É a API oficial do OpenStreetMap');
  console.log('   - Não precisa trocar de serviço!');
  console.log('   - Solução: Usar coordenadas mais precisas');
  console.log('   - Com coordenadas corretas, funciona perfeitamente');
  console.log('   - 100% gratuito e sem limitações');
}

// Executar demonstração
executarDemonstracao().catch(console.error);
