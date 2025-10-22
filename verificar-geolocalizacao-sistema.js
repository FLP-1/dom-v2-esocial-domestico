const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarGeolocalizacaoSistema() {
  console.log('🔍 Verificando sistema de geolocalização...');
  
  // 1. Verificar usuário Francisco
  const usuario = await prisma.usuario.findFirst({
    where: { nomeCompleto: { contains: 'Francisco' } },
    select: { id: true, nomeCompleto: true, email: true }
  });
  
  if (usuario) {
    console.log('👤 Usuário encontrado:', usuario.nomeCompleto);
    
    // 2. Verificar últimos registros de ponto
    const ultimosRegistros = await prisma.registroPonto.findMany({
      where: { usuarioId: usuario.id },
      orderBy: { dataHora: 'desc' },
      take: 3,
      select: {
        id: true,
        dataHora: true,
        latitude: true,
        longitude: true,
        endereco: true,
        numeroEndereco: true,
        precisao: true
      }
    });
    
    console.log('\n📊 ÚLTIMOS REGISTROS:');
    console.log('====================');
    ultimosRegistros.forEach((reg, i) => {
      console.log(`\n${i + 1}. Registro ${reg.id}:`);
      console.log(`   📅 Data: ${reg.dataHora}`);
      console.log(`   📍 Coordenadas: ${reg.latitude}, ${reg.longitude}`);
      console.log(`   🏠 Endereço: ${reg.endereco || 'N/A'}`);
      console.log(`   🔢 Número: ${reg.numeroEndereco || 'N/A'}`);
      console.log(`   🎯 Precisão: ${reg.precisao}m`);
    });
    
    // 3. Verificar se há dados de geolocalização em cache
    console.log('\n💾 VERIFICAÇÃO DE CACHE:');
    console.log('========================');
    console.log('⚠️  Se o endereço está errado, pode ser:');
    console.log('   1. Dados antigos em cache do navegador');
    console.log('   2. Geolocalização não foi atualizada');
    console.log('   3. Sistema usando dados antigos');
    
    console.log('\n💡 SOLUÇÕES:');
    console.log('============');
    console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
    console.log('2. Fazer logout e login novamente');
    console.log('3. Aguardar atualização automática da geolocalização');
    console.log('4. Forçar nova captura de geolocalização');
    
  } else {
    console.log('❌ Usuário Francisco não encontrado');
  }
  
  await prisma.$disconnect();
}

verificarGeolocalizacaoSistema().catch(e => {
  console.error('Erro na verificação:', e);
  prisma.$disconnect();
  process.exit(1);
});
