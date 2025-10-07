const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function atualizarConfiguracoes() {
  try {
    console.log('⚙️ ATUALIZANDO CONFIGURAÇÕES...');
    
    // Atualizar CPF principal da empresa
    await prisma.configuracaoSistema.upsert({
      where: { chave: 'empresa_cpf_principal' },
      update: { valor: '38017963378' },
      create: {
        chave: 'empresa_cpf_principal',
        valor: '38017963378',
        descricao: 'CPF principal da empresa para login',
        categoria: 'empresa',
        tipo: 'string',
        obrigatorio: true,
        visivel: true,
        editavel: true
      }
    });
    
    console.log('✅ Configurações atualizadas');
    console.log('🏢 CPF principal da empresa: 38017963378');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar configurações:', error);
  } finally {
    await prisma.$disconnect();
  }
}

atualizarConfiguracoes();
