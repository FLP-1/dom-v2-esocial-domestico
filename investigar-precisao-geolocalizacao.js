const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function investigarPrecisaoGeolocalizacao() {
  console.log('🔍 Investigando precisão da geolocalização...');
  
  // 1. Verificar configurações de geolocalização
  console.log('\n⚙️ CONFIGURAÇÕES DE GEOLOCALIZAÇÃO:');
  console.log('==================================');
  
  const configs = await prisma.configuracao.findMany({
    where: {
      chave: {
        in: [
          'geolocalizacao_precisao_maxima',
          'geolocalizacao_idade_maxima_segundos',
          'geolocalizacao_zoom_nivel'
        ]
      }
    }
  });
  
  configs.forEach(config => {
    console.log(`${config.chave}: ${config.valor}`);
  });
  
  // 2. Verificar últimos registros de ponto do Francisco
  const usuario = await prisma.usuario.findFirst({
    where: { nomeCompleto: { contains: 'Francisco' } }
  });
  
  if (usuario) {
    console.log('\n📊 ÚLTIMOS REGISTROS DE PONTO:');
    console.log('==============================');
    
    const registros = await prisma.registroPonto.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { dataHora: 'desc' },
      take: 3,
      select: {
        id: true,
        dataHora: true,
        latitude: true,
        longitude: true,
        precisao: true,
        endereco: true
      }
    });
    
    registros.forEach((reg, i) => {
      console.log(`\n${i + 1}. Registro ${reg.id}:`);
      console.log(`   📅 Data: ${reg.dataHora}`);
      console.log(`   📍 Coordenadas: ${reg.latitude}, ${reg.longitude}`);
      console.log(`   🎯 Precisão: ${reg.precisao}m`);
      console.log(`   🏠 Endereço: ${reg.endereco || 'N/A'}`);
      
      // Calcular diferença das coordenadas corretas
      const latCorreta = -23.614223774103486;
      const lonCorreta = -46.633480269245396;
      
      if (reg.latitude && reg.longitude) {
        const diffLat = Math.abs(reg.latitude - latCorreta);
        const diffLon = Math.abs(reg.longitude - lonCorreta);
        const distancia = Math.sqrt(diffLat * diffLat + diffLon * diffLon) * 111000; // Aproximadamente metros
        
        console.log(`   📏 Distância das coordenadas corretas: ${distancia.toFixed(2)}m`);
        
        if (distancia > 100) {
          console.log(`   ⚠️  COORDENADAS IMPRECISAS! (${distancia.toFixed(2)}m de distância)`);
        } else {
          console.log(`   ✅ Coordenadas precisas (${distancia.toFixed(2)}m de distância)`);
        }
      }
    });
  }
  
  console.log('\n💡 DIAGNÓSTICO:');
  console.log('===============');
  console.log('1. ✅ Associações do usuário corrigidas');
  console.log('2. 🔍 Verificar se geolocalização está capturando coordenadas precisas');
  console.log('3. 📍 Coordenadas corretas: -23.614223774103486, -46.633480269245396');
  console.log('4. 🎯 Sistema deve capturar com precisão de pelo menos 6 casas decimais');
  
  console.log('\n🔧 SOLUÇÕES:');
  console.log('============');
  console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
  console.log('2. Aguardar captura automática de geolocalização');
  console.log('3. Se necessário, forçar nova captura');
  console.log('4. Verificar se GPS está ativo e com boa precisão');
  
  await prisma.$disconnect();
}

investigarPrecisaoGeolocalizacao().catch(e => {
  console.error('Erro na investigação:', e);
  prisma.$disconnect();
  process.exit(1);
});



