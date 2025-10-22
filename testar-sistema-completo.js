/**
 * 🧪 TESTE COMPLETO DO SISTEMA
 * 
 * Este script testa todas as funcionalidades corrigidas:
 * 1. Geolocalização com validação de distância
 * 2. Detecção de WiFi
 * 3. Sistema de modal de aprovação
 * 4. Coordenadas de referência
 */

console.log('🧪 TESTE COMPLETO DO SISTEMA DOM\n');

// Coordenadas de referência
const REFERENCE_COORDINATES = {
  latitude: -23.61404415420112,
  longitude: -46.633503722316775,
  maxDistance: 50 // Máximo 50 metros
};

// Função para calcular distância
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

// Teste 1: Geolocalização
async function testGeolocation() {
  console.log('📍 TESTE 1: GEOLOCALIZAÇÃO');
  console.log('   Coordenadas de referência:', REFERENCE_COORDINATES.latitude, REFERENCE_COORDINATES.longitude);
  console.log('   Distância máxima permitida:', REFERENCE_COORDINATES.maxDistance, 'metros\n');
  
  if (!navigator.geolocation) {
    console.log('❌ Geolocalização não suportada');
    return;
  }

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });
    });

    const distance = calculateDistance(
      position.coords.latitude,
      position.coords.longitude,
      REFERENCE_COORDINATES.latitude,
      REFERENCE_COORDINATES.longitude
    );

    console.log('   📍 Coordenadas capturadas:', position.coords.latitude.toFixed(8), position.coords.longitude.toFixed(8));
    console.log('   🎯 Precisão:', Math.round(position.coords.accuracy), 'metros');
    console.log('   📏 Distância do ponto de referência:', Math.round(distance), 'metros');
    
    if (distance <= REFERENCE_COORDINATES.maxDistance) {
      console.log('   ✅ Coordenadas VÁLIDAS - dentro do limite permitido');
    } else {
      console.log('   ❌ Coordenadas INVÁLIDAS - muito distantes do ponto de referência');
      console.log('   🚫 Sistema deve rejeitar e ativar modal de aprovação');
    }

  } catch (error) {
    console.log('   ❌ Erro na geolocalização:', error.message);
  }
}

// Teste 2: Detecção de WiFi
async function testWiFiDetection() {
  console.log('\n📶 TESTE 2: DETECÇÃO DE WIFI');
  
  try {
    const response = await fetch('/api/wifi/ssid');
    const data = await response.json();
    
    console.log('   📡 Status da API:', response.status);
    console.log('   📶 Dados do WiFi:', JSON.stringify(data, null, 2));
    
    if (data.wifiName && data.wifiName !== 'WiFi não detectado') {
      console.log('   ✅ WiFi detectado:', data.wifiName);
    } else {
      console.log('   ⚠️ WiFi não detectado ou nome não disponível');
    }
    
  } catch (error) {
    console.log('   ❌ Erro ao testar WiFi:', error.message);
  }
}

// Teste 3: API de Geocoding
async function testGeocoding() {
  console.log('\n🌐 TESTE 3: API DE GEOCODING');
  
  // Testar com coordenadas de referência
  try {
    const response = await fetch(
      `/api/geocoding/reverse?lat=${REFERENCE_COORDINATES.latitude}&lon=${REFERENCE_COORDINATES.longitude}&zoom=19`
    );
    const data = await response.json();
    
    console.log('   📍 Testando com coordenadas de referência...');
    console.log('   📡 Status da API:', response.status);
    
    if (data.success) {
      console.log('   ✅ Geocoding funcionando');
      console.log('   🏠 Endereço:', data.formattedAddress || data.address);
      if (data.components) {
        console.log('   🏠 Número:', data.components.number || data.components.house_number || 'N/A');
        console.log('   🛣️ Rua:', data.components.street || data.components.road || 'N/A');
      }
    } else {
      console.log('   ❌ Erro no geocoding:', data.error);
    }
    
  } catch (error) {
    console.log('   ❌ Erro ao testar geocoding:', error.message);
  }
}

// Teste 4: Sistema de Validação
async function testValidationSystem() {
  console.log('\n🔍 TESTE 4: SISTEMA DE VALIDAÇÃO');
  
  // Simular coordenadas incorretas (distantes)
  const wrongCoordinates = {
    latitude: -23.619174, // Coordenadas incorretas
    longitude: -46.641971
  };
  
  const distance = calculateDistance(
    wrongCoordinates.latitude,
    wrongCoordinates.longitude,
    REFERENCE_COORDINATES.latitude,
    REFERENCE_COORDINATES.longitude
  );
  
  console.log('   📍 Coordenadas incorretas:', wrongCoordinates.latitude, wrongCoordinates.longitude);
  console.log('   📏 Distância calculada:', Math.round(distance), 'metros');
  console.log('   🎯 Limite permitido:', REFERENCE_COORDINATES.maxDistance, 'metros');
  
  if (distance > REFERENCE_COORDINATES.maxDistance) {
    console.log('   ❌ Coordenadas REJEITADAS - muito distantes');
    console.log('   🚫 Sistema deve ativar modal de aprovação');
  } else {
    console.log('   ✅ Coordenadas ACEITAS - dentro do limite');
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('🚀 Iniciando testes do sistema DOM...\n');
  
  await testGeolocation();
  await testWiFiDetection();
  await testGeocoding();
  await testValidationSystem();
  
  console.log('\n✅ TESTES CONCLUÍDOS');
  console.log('\n📋 RESUMO DOS TESTES:');
  console.log('   1. Geolocalização - Verificar se coordenadas estão sendo validadas');
  console.log('   2. WiFi - Verificar se nome do WiFi aparece');
  console.log('   3. Geocoding - Verificar se endereço está sendo obtido');
  console.log('   4. Validação - Verificar se sistema rejeita coordenadas distantes');
  console.log('\n🎯 PRÓXIMOS PASSOS:');
  console.log('   - Verificar se modal de aprovação aparece para coordenadas incorretas');
  console.log('   - Verificar se WiFi aparece no WelcomeSection');
  console.log('   - Verificar se coordenadas corretas são aceitas');
}

// Executar testes
runAllTests().catch(console.error);