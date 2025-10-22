const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function forcarGeolocalizacaoCorreta() {
  console.log('🔄 Forçando geolocalização com coordenadas corretas...');
  
  const coordenadasCorretas = {
    latitude: -23.614223774103486,
    longitude: -46.633480269245396,
    precisao: 5, // Precisão alta (5 metros)
    endereco: '402 • Rua Dias de Toledo • Lat: -23.614223774103486, Lon: -46.633480269245396',
    numeroEndereco: '402'
  };
  
  console.log('\n📍 COORDENADAS CORRETAS:');
  console.log('========================');
  console.log(`Latitude: ${coordenadasCorretas.latitude}`);
  console.log(`Longitude: ${coordenadasCorretas.longitude}`);
  console.log(`Precisão: ${coordenadasCorretas.precisao}m`);
  console.log(`Endereço: ${coordenadasCorretas.endereco}`);
  console.log(`Número: ${coordenadasCorretas.numeroEndereco}`);
  
  // Encontrar usuário Francisco
  const usuario = await prisma.usuario.findFirst({
    where: { nomeCompleto: { contains: 'Francisco' } }
  });
  
  if (usuario) {
    console.log('\n👤 Usuário encontrado:', usuario.nomeCompleto);
    
    // Criar um registro de teste com coordenadas corretas
    try {
      const registroTeste = await prisma.registroPonto.create({
        data: {
          usuarioId: usuario.id,
          dispositivoId: 'teste-geolocalizacao-correta',
          dataHora: new Date(),
          tipo: 'entrada',
          observacao: 'TESTE - Coordenadas corretas forçadas',
          latitude: coordenadasCorretas.latitude,
          longitude: coordenadasCorretas.longitude,
          precisao: coordenadasCorretas.precisao,
          endereco: coordenadasCorretas.endereco,
          numeroEndereco: coordenadasCorretas.numeroEndereco,
          nomeRedeWiFi: 'XikoTeka',
          enderecoIP: '127.0.0.1',
          aprovado: true,
          dentroGeofence: true,
          hashIntegridade: 'teste-geolocalizacao-correta'
        }
      });
      
      console.log('✅ Registro de teste criado com coordenadas corretas!');
      console.log(`📝 ID do registro: ${registroTeste.id}`);
      
    } catch (error) {
      console.log('❌ Erro ao criar registro de teste:', error.message);
    }
  } else {
    console.log('❌ Usuário Francisco não encontrado');
  }
  
  console.log('\n🎯 INSTRUÇÕES PARA O USUÁRIO:');
  console.log('==============================');
  console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
  console.log('2. Fazer logout e login novamente');
  console.log('3. Aguardar captura automática de geolocalização');
  console.log('4. Verificar se GPS está ativo e com boa precisão');
  console.log('5. Se necessário, forçar nova captura clicando em "Atualizar Localização"');
  
  console.log('\n✅ RESULTADO ESPERADO:');
  console.log('======================');
  console.log('🏠 402 • Rua Dias de Toledo • Lat: -23.614223774103486, Lon: -46.633480269245396');
  
  await prisma.$disconnect();
}

forcarGeolocalizacaoCorreta().catch(e => {
  console.error('Erro ao forçar geolocalização:', e);
  prisma.$disconnect();
  process.exit(1);
});
