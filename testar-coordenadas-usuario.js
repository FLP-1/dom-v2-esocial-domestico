const fetch = require('node-fetch');

async function testarCoordenadasUsuario() {
  console.log('🧪 Testando coordenadas do usuário...');
  console.log('Coordenadas: -23.614194, -46.633441');
  
  try {
    const response = await fetch('http://localhost:3000/api/geocoding/reverse?lat=-23.614194&lon=-46.633441&zoom=19');
    const data = await response.json();
    
    console.log('\n📊 RESULTADO:');
    console.log('=============');
    console.log('✅ Sucesso:', data.success);
    console.log('📍 Endereço:', data.address);
    console.log('🏠 Número:', data.components?.number || data.components?.house_number || 'N/A');
    console.log('🛣️ Rua:', data.components?.street || data.components?.road || 'N/A');
    console.log('🌐 Fonte:', data.source);
    
    if (data.components?.number || data.components?.house_number) {
      console.log('\n✅ NÚMERO DO ENDEREÇO ENCONTRADO!');
    } else {
      console.log('\n❌ NÚMERO DO ENDEREÇO NÃO ENCONTRADO');
    }
    
    if (data.components?.street || data.components?.road) {
      console.log('✅ NOME DA RUA ENCONTRADO!');
    } else {
      console.log('❌ NOME DA RUA NÃO ENCONTRADO');
    }
    
  } catch (error) {
    console.log('❌ Erro ao testar:', error.message);
  }
}

testarCoordenadasUsuario();
