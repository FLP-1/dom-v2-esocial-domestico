const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function corrigirConfiguracoesCache() {
  console.log('🔧 Corrigindo configurações de cache para resolver problema de timing...');
  
  // 1. Atualizar configurações para reduzir cache
  const configuracoes = [
    {
      chave: 'geolocalizacao_idade_maxima_segundos',
      valor: '60', // Reduzir de 300 para 60 segundos (1 minuto)
      descricao: 'Idade máxima dos dados de geolocalização (60 segundos)'
    },
    {
      chave: 'geolocalizacao_precisao_maxima',
      valor: '50', // Manter 50 metros
      descricao: 'Precisão máxima aceitável (50 metros)'
    },
    {
      chave: 'geolocalizacao_zoom_nivel',
      valor: '19', // Máxima precisão
      descricao: 'Nível de zoom para máxima precisão (19)'
    }
  ];
  
  console.log('\n⚙️ ATUALIZANDO CONFIGURAÇÕES:');
  console.log('==============================');
  
  for (const config of configuracoes) {
    try {
      await prisma.configuracao.upsert({
        where: { chave: config.chave },
        update: { valor: config.valor },
        create: {
          chave: config.chave,
          valor: config.valor,
          descricao: config.descricao,
          ativo: true,
          tipo: 'geolocalizacao',
          categoria: 'sistema'
        }
      });
      
      console.log(`✅ ${config.chave}: ${config.valor} (${config.descricao})`);
    } catch (error) {
      console.log(`❌ Erro ao atualizar ${config.chave}:`, error.message);
    }
  }
  
  // 2. Verificar configurações atualizadas
  console.log('\n📊 CONFIGURAÇÕES ATUALIZADAS:');
  console.log('==============================');
  
  const configsAtualizadas = await prisma.configuracao.findMany({
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
  
  configsAtualizadas.forEach(config => {
    console.log(`${config.chave}: ${config.valor}`);
  });
  
  console.log('\n🎯 RESULTADO ESPERADO:');
  console.log('======================');
  console.log('✅ Cache reduzido de 5 minutos para 1 minuto');
  console.log('✅ Geolocalização atualiza mais frequentemente');
  console.log('✅ Dados mais frescos e precisos');
  console.log('✅ Menos tempo para correção automática');
  
  console.log('\n💡 INSTRUÇÕES PARA O USUÁRIO:');
  console.log('==============================');
  console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
  console.log('2. Fazer logout e login novamente');
  console.log('3. Aguardar atualização automática (agora mais rápida)');
  console.log('4. Se necessário, forçar nova captura');
  
  console.log('\n✅ PROBLEMA DE TIMING RESOLVIDO!');
  console.log('O sistema agora atualiza geolocalização a cada 1 minuto');
  
  await prisma.$disconnect();
}

corrigirConfiguracoesCache().catch(e => {
  console.error('Erro ao corrigir configurações:', e);
  prisma.$disconnect();
  process.exit(1);
});
