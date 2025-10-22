/**
 * 🧪 Teste de Qualidade: Google Maps vs Nominatim
 * 
 * Este script testa a qualidade dos endereços retornados
 * pelas duas APIs para coordenadas conhecidas.
 */

const testCoordinates = [
  {
    name: "São Paulo - Centro",
    lat: -23.5505,
    lng: -46.6333,
    expected: "Centro de São Paulo"
  },
  {
    name: "Rio de Janeiro - Copacabana", 
    lat: -22.9711,
    lng: -43.1822,
    expected: "Copacabana, Rio de Janeiro"
  },
  {
    name: "Brasília - Esplanada",
    lat: -15.7801,
    lng: -47.9292,
    expected: "Esplanada dos Ministérios, Brasília"
  }
];

async function testNominatim(lat, lng) {
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
      components: data.address
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testGoogleMaps(lat, lng, apiKey) {
  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}&language=pt-BR&region=BR`;
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Maps API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Maps API error: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'Nenhum endereço encontrado'
      };
    }

    const result = data.results[0];
    return {
      success: true,
      address: result.formatted_address,
      components: result.address_components
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function runComparison() {
  console.log('🧪 TESTE DE QUALIDADE: Google Maps vs Nominatim\n');
  
  const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  if (!googleApiKey) {
    console.log('⚠️ Google Maps API key não configurada');
    console.log('   Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY no .env.local\n');
  }

  for (const coord of testCoordinates) {
    console.log(`📍 Testando: ${coord.name}`);
    console.log(`   Coordenadas: ${coord.lat}, ${coord.lng}`);
    console.log(`   Esperado: ${coord.expected}\n`);

    // Teste Nominatim
    console.log('🌐 NOMINATIM:');
    const nominatimResult = await testNominatim(coord.lat, coord.lng);
    if (nominatimResult.success) {
      console.log(`   ✅ Endereço: ${nominatimResult.address}`);
      console.log(`   📍 Cidade: ${nominatimResult.components?.city || 'N/A'}`);
      console.log(`   🏘️ Bairro: ${nominatimResult.components?.suburb || nominatimResult.components?.neighbourhood || 'N/A'}`);
    } else {
      console.log(`   ❌ Erro: ${nominatimResult.error}`);
    }

    // Teste Google Maps (se disponível)
    if (googleApiKey) {
      console.log('\n🗺️ GOOGLE MAPS:');
      const googleResult = await testGoogleMaps(coord.lat, coord.lng, googleApiKey);
      if (googleResult.success) {
        console.log(`   ✅ Endereço: ${googleResult.address}`);
        
        // Extrair componentes
        const components = {};
        googleResult.components.forEach(comp => {
          if (comp.types.includes('locality')) components.city = comp.long_name;
          if (comp.types.includes('sublocality')) components.neighborhood = comp.long_name;
          if (comp.types.includes('administrative_area_level_1')) components.state = comp.long_name;
        });
        
        console.log(`   📍 Cidade: ${components.city || 'N/A'}`);
        console.log(`   🏘️ Bairro: ${components.neighborhood || 'N/A'}`);
        console.log(`   🏛️ Estado: ${components.state || 'N/A'}`);
      } else {
        console.log(`   ❌ Erro: ${googleResult.error}`);
      }
    } else {
      console.log('\n🗺️ GOOGLE MAPS: ⚠️ API key não configurada');
    }

    console.log('\n' + '='.repeat(80) + '\n');
    
    // Pausa entre requisições para não sobrecarregar APIs
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 RESUMO:');
  console.log('   - Nominatim: Gratuito, dados limitados, qualidade variável');
  console.log('   - Google Maps: Pago, dados massivos, qualidade superior');
  console.log('   - Recomendação: Use Google Maps em produção, Nominatim como fallback');
}

// Executar teste
runComparison().catch(console.error);
