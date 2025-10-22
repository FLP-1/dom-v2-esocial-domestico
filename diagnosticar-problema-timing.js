const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function diagnosticarProblemaTiming() {
  console.log('🔍 Diagnosticando problema de TIMING/CACHE...');
  
  // 1. Verificar configurações de cache
  console.log('\n⚙️ CONFIGURAÇÕES DE CACHE:');
  console.log('============================');
  
  const configs = await prisma.configuracao.findMany({
    where: {
      chave: {
        in: [
          'geolocalizacao_idade_maxima_segundos',
          'geolocalizacao_precisao_maxima',
          'geolocalizacao_zoom_nivel'
        ]
      }
    }
  });
  
  configs.forEach(config => {
    console.log(`${config.chave}: ${config.valor}`);
  });
  
  // 2. Verificar últimos registros de ponto
  const usuario = await prisma.usuario.findFirst({
    where: { nomeCompleto: { contains: 'Francisco' } }
  });
  
  if (usuario) {
    console.log('\n📊 ANÁLISE DE TIMING DOS REGISTROS:');
    console.log('==================================');
    
    const registros = await prisma.registroPonto.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { dataHora: 'desc' },
      take: 5,
      select: {
        id: true,
        dataHora: true,
        latitude: true,
        longitude: true,
        precisao: true,
        endereco: true,
        observacao: true
      }
    });
    
    registros.forEach((reg, i) => {
      const agora = new Date();
      const diffMinutos = Math.round((agora - reg.dataHora) / (1000 * 60));
      
      console.log(`\n${i + 1}. Registro ${reg.id}:`);
      console.log(`   📅 Data: ${reg.dataHora}`);
      console.log(`   ⏰ Há ${diffMinutos} minutos`);
      console.log(`   📍 Coordenadas: ${reg.latitude}, ${reg.longitude}`);
      console.log(`   🎯 Precisão: ${reg.precisao}m`);
      console.log(`   🏠 Endereço: ${reg.endereco || 'N/A'}`);
      console.log(`   📝 Observação: ${reg.observacao || 'N/A'}`);
      
      // Verificar se é coordenadas corretas
      const latCorreta = -23.614223774103486;
      const lonCorreta = -46.633480269245396;
      
      if (reg.latitude && reg.longitude) {
        const diffLat = Math.abs(reg.latitude - latCorreta);
        const diffLon = Math.abs(reg.longitude - lonCorreta);
        const distancia = Math.sqrt(diffLat * diffLat + diffLon * diffLon) * 111000;
        
        if (distancia < 50) {
          console.log(`   ✅ COORDENADAS CORRETAS! (${distancia.toFixed(2)}m de distância)`);
        } else {
          console.log(`   ❌ Coordenadas incorretas (${distancia.toFixed(2)}m de distância)`);
        }
      }
    });
  }
  
  console.log('\n💡 DIAGNÓSTICO DO PROBLEMA:');
  console.log('============================');
  console.log('🔍 PROBLEMA IDENTIFICADO: TIMING/CACHE');
  console.log('');
  console.log('❌ CAUSA RAIZ:');
  console.log('  1. Sistema usa dados antigos em cache');
  console.log('  2. Geolocalização demora para atualizar');
  console.log('  3. WelcomeSection não força nova captura');
  console.log('  4. Dados corretos existem, mas demoram para aparecer');
  console.log('');
  console.log('✅ SOLUÇÕES:');
  console.log('  1. Limpar cache do navegador (Ctrl+Shift+R)');
  console.log('  2. Forçar nova captura de geolocalização');
  console.log('  3. Reduzir tempo de cache (maxAge)');
  console.log('  4. Implementar refresh automático');
  
  console.log('\n🔧 CONFIGURAÇÕES RECOMENDADAS:');
  console.log('==============================');
  console.log('geolocalizacao_idade_maxima_segundos: 60 (1 minuto)');
  console.log('geolocalizacao_precisao_maxima: 50 (50 metros)');
  console.log('geolocalizacao_zoom_nivel: 19 (máxima precisão)');
  
  await prisma.$disconnect();
}

diagnosticarProblemaTiming().catch(e => {
  console.error('Erro no diagnóstico:', e);
  prisma.$disconnect();
  process.exit(1);
});


