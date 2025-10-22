/**
 * 🧪 Teste Específico: Rua Dias de Toledo
 * 
 * Testa a qualidade das APIs gratuitas com o endereço de referência:
 * "Rua Dias de Toledo, 402 ou Rua Dias de Toledo, 432"
 */

// Coordenadas EXATAS fornecidas pelo usuário (máxima precisão)
const testCoordinates = [
  {
    name: "Rua Dias de Toledo, 402",
    lat: -23.6141781, // Coordenadas EXATAS fornecidas pelo usuário
    lng: -46.6346946,
    expected: "Rua Dias de Toledo",
    bairro: "Vila da Saúde",
    cidade: "São Paulo",
    precisao: "7 casas decimais - máxima precisão"
  }
];

async function testOurAPI(lat, lng) {
  try {
    const url = `http://localhost:3000/api/geocoding/reverse?lat=${lat}&lon=${lng}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testOpenCageDirect(lat, lng, apiKey) {
  try {
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}&language=pt&countrycode=br`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Test Script)',
      },
    });

    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { success: false, error: 'Nenhum endereço encontrado' };
    }

    const result = data.results[0];
    return {
      success: true,
      address: result.formatted,
      components: result.components,
      source: 'opencage_direct'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testBigDataCloudDirect(lat, lng) {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Test Script)',
      },
    });

    if (!response.ok) {
      throw new Error(`BigDataCloud API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.localityInfo) {
      return { success: false, error: 'Nenhum endereço encontrado' };
    }

    return {
      success: true,
      address: data.localityInfo?.administrative?.[0]?.name || 'Endereço não encontrado',
      components: data.localityInfo,
      source: 'bigdatacloud_direct'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function testNominatimDirect(lat, lng) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Test Script)',
      },
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      address: data.display_name,
      components: data.address,
      source: 'nominatim_direct'
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runTest() {
  console.log('🧪 TESTE ESPECÍFICO: Rua Dias de Toledo\n');
  console.log('📍 Endereço de referência: Rua Dias de Toledo, 402 ou 432');
  console.log('🎯 Objetivo: Validar qualidade das APIs gratuitas\n');

  const openCageKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  
  if (!openCageKey) {
    console.log('⚠️ OpenCage API key não configurada');
    console.log('   Configure NEXT_PUBLIC_OPENCAGE_API_KEY no .env.local\n');
  }

  for (const coord of testCoordinates) {
    console.log(`📍 Testando: ${coord.name}`);
    console.log(`   Coordenadas: ${coord.lat}, ${coord.lng}`);
    console.log(`   Esperado: ${coord.expected}\n`);

    // Teste 1: Nossa API (sistema híbrido)
    console.log('🔧 NOSSA API (Sistema Híbrido):');
    const ourResult = await testOurAPI(coord.lat, coord.lng);
    if (ourResult.success) {
      console.log(`   ✅ Endereço: ${ourResult.address}`);
      console.log(`   📍 Fonte: ${ourResult.source}`);
      console.log(`   🏘️ Bairro: ${ourResult.components?.neighborhood || 'N/A'}`);
      console.log(`   🏙️ Cidade: ${ourResult.components?.city || 'N/A'}`);
    } else {
      console.log(`   ❌ Erro: ${ourResult.error}`);
    }

    // Teste 2: OpenCage direto (se disponível)
    if (openCageKey) {
      console.log('\n🌐 OPENCAGE DIRETO:');
      const openCageResult = await testOpenCageDirect(coord.lat, coord.lng, openCageKey);
      if (openCageResult.success) {
        console.log(`   ✅ Endereço: ${openCageResult.address}`);
        console.log(`   🏘️ Bairro: ${openCageResult.components?.suburb || 'N/A'}`);
        console.log(`   🏙️ Cidade: ${openCageResult.components?.city || 'N/A'}`);
      } else {
        console.log(`   ❌ Erro: ${openCageResult.error}`);
      }
    }

    // Teste 3: BigDataCloud direto
    console.log('\n☁️ BIGDATACLOUD DIRETO:');
    const bigDataResult = await testBigDataCloudDirect(coord.lat, coord.lng);
    if (bigDataResult.success) {
      console.log(`   ✅ Endereço: ${bigDataResult.address}`);
    } else {
      console.log(`   ❌ Erro: ${bigDataResult.error}`);
    }

    // Teste 4: Nominatim direto
    console.log('\n🗺️ NOMINATIM DIRETO:');
    const nominatimResult = await testNominatimDirect(coord.lat, coord.lng);
    if (nominatimResult.success) {
      console.log(`   ✅ Endereço: ${nominatimResult.address}`);
      console.log(`   🏘️ Bairro: ${nominatimResult.components?.suburb || 'N/A'}`);
      console.log(`   🏙️ Cidade: ${nominatimResult.components?.city || 'N/A'}`);
    } else {
      console.log(`   ❌ Erro: ${nominatimResult.error}`);
    }

    console.log('\n' + '='.repeat(80) + '\n');
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('📊 ANÁLISE DOS RESULTADOS:');
  console.log('   - Verifique se alguma API retornou "Rua Dias de Toledo"');
  console.log('   - Compare a qualidade dos endereços retornados');
  console.log('   - Identifique qual API tem melhor cobertura para São Paulo');
  console.log('\n💡 PRÓXIMOS PASSOS:');
  console.log('   1. Configure as APIs que retornaram melhores resultados');
  console.log('   2. Ajuste a ordem de fallback se necessário');
  console.log('   3. Teste com outros endereços conhecidos');
}

// Executar teste
runTest().catch(console.error);
