/**
 * 🎯 Obter Coordenadas Exatas: Rua Dias de Toledo
 * 
 * Busca as coordenadas exatas da Rua Dias de Toledo, 402/432
 * para usar como referência nos testes
 */

async function searchAddress(address) {
  try {
    console.log(`🔍 Buscando: ${address}`);
    
    // Usar Nominatim para buscar o endereço
    const searchUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=5&countrycodes=br&addressdetails=1`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Address Search)',
      },
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || data.length === 0) {
      console.log('   ❌ Endereço não encontrado');
      return null;
    }

    // Mostrar todos os resultados encontrados
    console.log(`   ✅ Encontrados ${data.length} resultados:`);
    
    data.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.display_name}`);
      console.log(`      📍 Coordenadas: ${result.lat}, ${result.lon}`);
      console.log(`      🏘️ Bairro: ${result.address?.suburb || result.address?.neighbourhood || 'N/A'}`);
      console.log(`      🏙️ Cidade: ${result.address?.city || result.address?.town || 'N/A'}`);
      console.log(`      🏛️ Estado: ${result.address?.state || 'N/A'}`);
      console.log('');
    });

    return data;
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return null;
  }
}

async function testReverseGeocoding(lat, lng, expectedAddress) {
  try {
    console.log(`🔄 Testando geocodificação reversa: ${lat}, ${lng}`);
    console.log(`   Esperado: ${expectedAddress}`);
    
    const reverseUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(reverseUrl, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Reverse Geocoding)',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`   ✅ Retornou: ${data.display_name}`);
    
    // Verificar se contém "Dias de Toledo"
    const containsExpected = data.display_name.toLowerCase().includes('dias de toledo');
    console.log(`   🎯 Contém "Dias de Toledo": ${containsExpected ? '✅ SIM' : '❌ NÃO'}`);
    
    return {
      success: true,
      address: data.display_name,
      containsExpected,
      components: data.address
    };
  } catch (error) {
    console.log(`   ❌ Erro: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function runSearch() {
  console.log('🎯 BUSCA POR COORDENADAS: Rua Dias de Toledo\n');
  
  const addresses = [
    'Rua Dias de Toledo, 402, São Paulo, SP',
    'Rua Dias de Toledo, 432, São Paulo, SP',
    'Rua Dias de Toledo, São Paulo, SP',
    'Dias de Toledo, São Paulo'
  ];

  let bestResult = null;
  let bestScore = 0;

  for (const address of addresses) {
    console.log(`\n${'='.repeat(60)}`);
    const results = await searchAddress(address);
    
    if (results && results.length > 0) {
      // Testar cada resultado com geocodificação reversa
      for (const result of results) {
        const reverseResult = await testReverseGeocoding(
          result.lat, 
          result.lon, 
          'Dias de Toledo'
        );
        
        if (reverseResult.success && reverseResult.containsExpected) {
          const score = 1; // Pontuação por conter "Dias de Toledo"
          if (score > bestScore) {
            bestScore = score;
            bestResult = {
              address: result.display_name,
              lat: parseFloat(result.lat),
              lng: parseFloat(result.lon),
              components: result.address
            };
          }
        }
        
        // Pausa entre requisições
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Pausa entre buscas
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log('🏆 MELHOR RESULTADO ENCONTRADO:');
  
  if (bestResult) {
    console.log(`   📍 Endereço: ${bestResult.address}`);
    console.log(`   🎯 Coordenadas: ${bestResult.lat}, ${bestResult.lng}`);
    console.log(`   🏘️ Bairro: ${bestResult.components?.suburb || bestResult.components?.neighbourhood || 'N/A'}`);
    console.log(`   🏙️ Cidade: ${bestResult.components?.city || bestResult.components?.town || 'N/A'}`);
    console.log(`   🏛️ Estado: ${bestResult.components?.state || 'N/A'}`);
    
    console.log('\n💡 COMO USAR:');
    console.log(`   - Use estas coordenadas nos testes: ${bestResult.lat}, ${bestResult.lng}`);
    console.log(`   - Esperado: Endereço deve conter "Dias de Toledo"`);
    console.log(`   - Teste com: node testar-endereco-dias-toledo.js`);
  } else {
    console.log('   ❌ Nenhum resultado satisfatório encontrado');
    console.log('   💡 Tente buscar manualmente no Google Maps e usar as coordenadas');
  }
}

// Executar busca
runSearch().catch(console.error);
