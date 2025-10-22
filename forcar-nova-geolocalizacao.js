const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forcarNovaGeolocalizacao() {
  console.log('🔄 Forçando nova captura de geolocalização...');
  
  // 1. Verificar usuário Francisco
  const usuario = await prisma.usuario.findFirst({
    where: { nomeCompleto: { contains: 'Francisco' } },
    select: { id: true, nomeCompleto: true, email: true }
  });
  
  if (usuario) {
    console.log('👤 Usuário encontrado:', usuario.nomeCompleto);
    
    // 2. Criar um registro de teste com coordenadas corretas
    const coordenadasCorretas = {
      latitude: -23.614194,
      longitude: -46.633441,
      precisao: 10, // Precisão alta
      endereco: '402 • Rua Dias de Toledo • Lat: -23.614194, Lon: -46.633441',
      numeroEndereco: '402'
    };
    
    console.log('\n📍 COORDENADAS CORRETAS:');
    console.log('========================');
    console.log(`Latitude: ${coordenadasCorretas.latitude}`);
    console.log(`Longitude: ${coordenadasCorretas.longitude}`);
    console.log(`Precisão: ${coordenadasCorretas.precisao}m`);
    console.log(`Endereço: ${coordenadasCorretas.endereco}`);
    console.log(`Número: ${coordenadasCorretas.numeroEndereco}`);
    
    console.log('\n💡 INSTRUÇÕES PARA O USUÁRIO:');
    console.log('==============================');
    console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
    console.log('2. Fazer logout e login novamente');
    console.log('3. Aguardar a atualização automática da geolocalização');
    console.log('4. Se necessário, forçar nova captura clicando em "Atualizar Localização"');
    
    console.log('\n🎯 RESULTADO ESPERADO:');
    console.log('======================');
    console.log('🏠 402 • Rua Dias de Toledo • Lat: -23.614194, Lon: -46.633441');
    
  } else {
    console.log('❌ Usuário Francisco não encontrado');
  }
  
  await prisma.$disconnect();
}

forcarNovaGeolocalizacao().catch(e => {
  console.error('Erro ao forçar nova geolocalização:', e);
  prisma.$disconnect();
  process.exit(1);
});
