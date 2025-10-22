/**
 * 🧪 Teste de Geolocalização Melhorada
 * 
 * Este script testa as melhorias implementadas no sistema de geolocalização:
 * - Precisão aumentada para 20 metros
 * - Mais tentativas de captura (5 tentativas)
 * - Validação de distância do ponto de referência
 * - Timeout aumentado para 15 segundos
 */

console.log('🧪 TESTE DE GEOLOCALIZAÇÃO MELHORADA\n');

// Coordenadas de referência
const REFERENCE_COORDINATES = {
  latitude: -23.61404415420112,
  longitude: -46.633503722316775,
  maxDistance: 100 // Máximo 100 metros
};

// Função para calcular distância entre duas coordenadas (em metros)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distância em metros
}

// Função para testar geolocalização
async function testGeolocation() {
  console.log('📍 Testando geolocalização com melhorias implementadas...\n');
  
  if (!navigator.geolocation) {
    console.log('❌ Geolocalização não suportada pelo navegador');
    return;
  }

  const maxAttempts = 5;
  let bestPosition = null;
  let bestAccuracy = Infinity;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    attempts++;
    console.log(`🔄 Tentativa ${attempt}/${maxAttempts} de captura...`);
    
    try {
      const position = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout na captura de geolocalização'));
        }, 15000); // 15 segundos por tentativa

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 0 // Forçar nova captura sempre
          }
        );
      });

      console.log(`   📍 Coordenadas: ${position.coords.latitude.toFixed(8)}, ${position.coords.longitude.toFixed(8)}`);
      console.log(`   🎯 Precisão: ${Math.round(position.coords.accuracy)}m`);

      // Verificar se esta é a melhor posição até agora
      if (position.coords.accuracy < bestAccuracy) {
        bestPosition = position;
        bestAccuracy = position.coords.accuracy;
        console.log(`   ✅ Nova melhor posição: ${Math.round(position.coords.accuracy)}m`);
      }

      // Se já temos precisão suficiente, parar
      if (position.coords.accuracy <= 20) {
        console.log(`   🎯 Precisão ideal alcançada: ${Math.round(position.coords.accuracy)}m`);
        break;
      }

      // Aguardar um pouco antes da próxima tentativa
      if (attempt < maxAttempts) {
        console.log(`   ⏳ Aguardando 2 segundos antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

    } catch (error) {
      console.log(`   ❌ Erro na tentativa ${attempt}:`, error.message);
    }
  }

  if (!bestPosition) {
    console.log('❌ Falha em todas as tentativas de captura');
    return;
  }

  console.log('\n📊 RESULTADOS FINAIS:');
  console.log(`   📍 Coordenadas finais: ${bestPosition.coords.latitude.toFixed(8)}, ${bestPosition.coords.longitude.toFixed(8)}`);
  console.log(`   🎯 Precisão final: ${Math.round(bestPosition.coords.accuracy)}m`);
  console.log(`   🔄 Tentativas realizadas: ${attempts}`);

  // Calcular distância do ponto de referência
  const distance = calculateDistance(
    bestPosition.coords.latitude,
    bestPosition.coords.longitude,
    REFERENCE_COORDINATES.latitude,
    REFERENCE_COORDINATES.longitude
  );

  console.log(`   📏 Distância do ponto de referência: ${Math.round(distance)}m`);
  
  if (distance <= REFERENCE_COORDINATES.maxDistance) {
    console.log(`   ✅ Coordenadas validadas: ${Math.round(distance)}m do ponto de referência (máximo: ${REFERENCE_COORDINATES.maxDistance}m)`);
  } else {
    console.log(`   ⚠️ Coordenadas muito distantes: ${Math.round(distance)}m do ponto de referência (máximo: ${REFERENCE_COORDINATES.maxDistance}m)`);
  }

  // Testar geocoding
  console.log('\n🌐 Testando geocoding...');
  try {
    const response = await fetch(
      `/api/geocoding/reverse?lat=${bestPosition.coords.latitude}&lon=${bestPosition.coords.longitude}&zoom=19`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        console.log(`   📍 Endereço: ${data.formattedAddress || data.address}`);
        if (data.components) {
          console.log(`   🏠 Número: ${data.components.number || data.components.house_number || 'N/A'}`);
          console.log(`   🛣️ Rua: ${data.components.street || data.components.road || 'N/A'}`);
        }
      } else {
        console.log(`   ❌ Erro no geocoding: ${data.error}`);
      }
    } else {
      console.log(`   ❌ Erro na API de geocoding: ${response.status}`);
    }
  } catch (error) {
    console.log(`   ❌ Erro ao testar geocoding:`, error.message);
  }
}

// Executar teste
testGeolocation().catch(console.error);
