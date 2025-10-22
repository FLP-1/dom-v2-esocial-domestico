const fetch = require('node-fetch');

async function testarCoordenadasCorretasUsuario() {
  console.log('🧪 Testando coordenadas CORRETAS do usuário...');
  console.log('Coordenadas corretas: -23.614223774103486, -46.633480269245396');
  
  try {
    const response = await fetch('http://localhost:3000/api/geocoding/reverse?lat=-23.614223774103486&lon=-46.633480269245396&zoom=19');
    const data = await response.json();
    
    console.log('\n📊 RESULTADO COM COORDENADAS CORRETAS:');
    console.log('=====================================');
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
    
    console.log('\n🎯 COMPARAÇÃO:');
    console.log('==============');
    console.log('Coordenadas do usuário: -23.614223774103486, -46.633480269245396');
    console.log('Coordenadas mostradas:  -23.614193, -46.633396');
    console.log('Diferença lat: ' + Math.abs(-23.614223774103486 - (-23.614193)) + ' graus');
    console.log('Diferença lon: ' + Math.abs(-46.633480269245396 - (-46.633396)) + ' graus');
    
  } catch (error) {
    console.log('❌ Erro ao testar:', error.message);
  }
}

testarCoordenadasCorretasUsuario();



