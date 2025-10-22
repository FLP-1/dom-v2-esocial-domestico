/**
 * 🔍 Investigação: Por que o número não está sendo retornado?
 * 
 * Vamos testar diferentes abordagens para obter o número "402"
 */

const COORDENADAS_EXATAS = {
  lat: -23.6141781,
  lng: -46.6346946,
  numeroEsperado: "402"
};

async function testarNominatimDiferentesParametros() {
  console.log('🔍 INVESTIGAÇÃO: Diferentes parâmetros do Nominatim\n');
  
  const testes = [
    {
      nome: "Padrão",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&addressdetails=1&accept-language=pt-BR`
    },
    {
      nome: "Com zoom=18",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&zoom=18&addressdetails=1&accept-language=pt-BR`
    },
    {
      nome: "Com extratags=1",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&addressdetails=1&extratags=1&accept-language=pt-BR`
    },
    {
      nome: "Com namedetails=1",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&addressdetails=1&namedetails=1&accept-language=pt-BR`
    },
    {
      nome: "Com zoom=19",
      url: `https://nominatim.openstreetmap.org/reverse?format=json&lat=${COORDENADAS_EXATAS.lat}&lon=${COORDENADAS_EXATAS.lng}&zoom=19&addressdetails=1&accept-language=pt-BR`
    }
  ];

  for (const teste of testes) {
    try {
      console.log(`🧪 Teste: ${teste.nome}`);
      
      const response = await fetch(teste.url, {
        headers: {
          'User-Agent': 'DOM-System/1.0 (Number Investigation)',
        },
      });

      if (!response.ok) {
        console.log(`   ❌ Erro HTTP: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      console.log(`   📍 Endereço: ${data.display_name}`);
      console.log(`   🏠 Número: ${data.address?.house_number || 'N/A'}`);
      console.log(`   🛣️ Rua: ${data.address?.road || 'N/A'}`);
      console.log(`   🏘️ Bairro: ${data.address?.suburb || data.address?.neighbourhood || 'N/A'}`);
      
      // Verificar se contém o número no endereço
      const contemNumero = data.display_name.includes(COORDENADAS_EXATAS.numeroEsperado);
      console.log(`   🎯 Contém "${COORDENADAS_EXATAS.numeroEsperado}": ${contemNumero ? '✅ SIM' : '❌ NÃO'}`);
      
      // Verificar extratags se disponível
      if (data.extratags) {
        console.log(`   🏷️ Extratags: ${JSON.stringify(data.extratags)}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testarCoordenadasProximas() {
  console.log('🔍 INVESTIGAÇÃO: Coordenadas próximas\n');
  
  // Testar coordenadas ligeiramente diferentes
  const variacoes = [
    { lat: -23.6141781, lng: -46.6346946, nome: "Original" },
    { lat: -23.6141780, lng: -46.6346945, nome: "Variação 1" },
    { lat: -23.6141782, lng: -46.6346947, nome: "Variação 2" },
    { lat: -23.6141781, lng: -46.6346945, nome: "Variação 3" },
    { lat: -23.6141780, lng: -46.6346946, nome: "Variação 4" }
  ];

  for (const coord of variacoes) {
    try {
      console.log(`🧪 Teste: ${coord.nome} (${coord.lat}, ${coord.lng})`);
      
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coord.lat}&lon=${coord.lng}&zoom=18&addressdetails=1&accept-language=pt-BR`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DOM-System/1.0 (Coordinate Variation)',
        },
      });

      if (!response.ok) {
        console.log(`   ❌ Erro HTTP: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      console.log(`   📍 Endereço: ${data.display_name}`);
      console.log(`   🏠 Número: ${data.address?.house_number || 'N/A'}`);
      
      const contemNumero = data.display_name.includes(COORDENADAS_EXATAS.numeroEsperado);
      console.log(`   🎯 Contém "${COORDENADAS_EXATAS.numeroEsperado}": ${contemNumero ? '✅ SIM' : '❌ NÃO'}`);
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function testarBuscaDireta() {
  console.log('🔍 INVESTIGAÇÃO: Busca direta por endereço\n');
  
  const enderecos = [
    "Rua Dias de Toledo, 402, São Paulo",
    "Rua Dias de Toledo 402, São Paulo",
    "Dias de Toledo 402, São Paulo",
    "Rua Dias de Toledo, 402, Vila da Saúde, São Paulo"
  ];

  for (const endereco of enderecos) {
    try {
      console.log(`🧪 Busca: "${endereco}"`);
      
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(endereco)}&format=json&limit=3&countrycodes=br&addressdetails=1`;
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'DOM-System/1.0 (Direct Search)',
        },
      });

      if (!response.ok) {
        console.log(`   ❌ Erro HTTP: ${response.status}`);
        continue;
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        console.log(`   ✅ Encontrados ${data.length} resultados:`);
        
        data.forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.display_name}`);
          console.log(`      📍 Coordenadas: ${result.lat}, ${result.lon}`);
          console.log(`      🏠 Número: ${result.address?.house_number || 'N/A'}`);
          console.log(`      🛣️ Rua: ${result.address?.road || 'N/A'}`);
          
          const contemNumero = result.display_name.includes(COORDENADAS_EXATAS.numeroEsperado);
          console.log(`      🎯 Contém "${COORDENADAS_EXATAS.numeroEsperado}": ${contemNumero ? '✅ SIM' : '❌ NÃO'}`);
        });
      } else {
        console.log(`   ❌ Nenhum resultado encontrado`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`   ❌ Erro: ${error.message}\n`);
    }
    
    // Pausa entre requisições
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function executarInvestigacaoCompleta() {
  console.log('🔍 INVESTIGAÇÃO COMPLETA: Por que o número não aparece?');
  console.log('='.repeat(70));
  console.log(`📍 Coordenadas: ${COORDENADAS_EXATAS.lat}, ${COORDENADAS_EXATAS.lng}`);
  console.log(`🎯 Número esperado: ${COORDENADAS_EXATAS.numeroEsperado}`);
  console.log('='.repeat(70));
  
  // Teste 1: Diferentes parâmetros
  await testarNominatimDiferentesParametros();
  
  // Teste 2: Coordenadas próximas
  await testarCoordenadasProximas();
  
  // Teste 3: Busca direta
  await testarBuscaDireta();
  
  console.log('💡 CONCLUSÕES:');
  console.log('   - Investigar se o problema é com as coordenadas');
  console.log('   - Verificar se o número existe no OpenStreetMap');
  console.log('   - Testar diferentes APIs de geocodificação');
  console.log('   - Considerar se precisamos de APIs pagas para números');
}

// Executar investigação
executarInvestigacaoCompleta().catch(console.error);
