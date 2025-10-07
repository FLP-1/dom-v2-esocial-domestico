const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function corrigirSenha() {
  try {
    const senhaHash = await bcrypt.hash('senha123', 10);
    
    // Atualizar a senha do Francisco
    const usuario = await prisma.usuario.update({
      where: { cpf: '59876913700' },
      data: { senhaHash: senhaHash }
    });
    
    console.log('✅ Senha do Francisco corrigida!');
    console.log('   CPF: 598.769.137-00');
    console.log('   Senha: senha123');
    console.log('   Nome:', usuario.nomeCompleto);
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirSenha();
