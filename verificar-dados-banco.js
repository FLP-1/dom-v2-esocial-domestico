const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarDados() {
  try {
    console.log('🔍 Verificando dados no banco...\n');
    
    // Verificar configurações
    const configs = await prisma.configuracaoSistema.count();
    console.log(`📊 Configurações existentes: ${configs}`);
    
    if (configs > 0) {
      const configsList = await prisma.configuracaoSistema.findMany({
        select: { chave: true, valor: true, categoria: true }
      });
      console.log('📋 Configurações encontradas:');
      configsList.forEach(c => {
        console.log(`   - ${c.chave}: ${c.valor} (${c.categoria})`);
      });
    }
    
    // Verificar termos
    const termos = await prisma.termo.count();
    console.log(`\n📊 Termos existentes: ${termos}`);
    
    if (termos > 0) {
      const termosList = await prisma.termo.findMany({
        select: { tipo: true, versao: true, titulo: true, ativo: true }
      });
      console.log('📋 Termos encontrados:');
      termosList.forEach(t => {
        console.log(`   - ${t.tipo}: ${t.versao} - ${t.titulo} (${t.ativo ? 'Ativo' : 'Inativo'})`);
      });
    }
    
    console.log('\n✅ Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro ao verificar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarDados();
