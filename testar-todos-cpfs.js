const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testarTodosCPFs() {
  try {
    // CPFs da imagem que você mostrou
    const cpfs = [
      '26922053320', // Maria Oliveira Santos
      '78420598020', // Ana Paula Costa
      '81259974154', // Maria Oliveira Santos
      '40991931289', // Maria Oliveira Santos
      '59876913700', // Francisco Jose Lattari Papaleo
      '60790494736'  // Ana Paula Costa
    ];

    console.log('=== TESTANDO TODOS OS CPFs DO BANCO ===\n');

    for (const cpf of cpfs) {
      console.log(`Testando CPF: ${cpf}`);
      
      const user = await prisma.usuario.findUnique({
        where: { cpf: cpf }
      });

      if (!user) {
        console.log('❌ Usuário não encontrado\n');
        continue;
      }

      console.log(`✅ Usuário encontrado: ${user.nomeCompleto}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Senha Hash: ${user.senhaHash ? 'TEM' : 'NÃO TEM'}`);

      // Testar senha
      const senhaTeste = 'senha123';
      const isValid = await bcrypt.compare(senhaTeste, user.senhaHash);
      
      console.log(`   Senha 'senha123': ${isValid ? '✅ VÁLIDA' : '❌ INVÁLIDA'}`);

      if (isValid) {
        console.log(`🎉 LOGIN FUNCIONARIA com CPF: ${cpf} e senha: senha123\n`);
        break;
      } else {
        console.log(`❌ Login não funcionaria\n`);
      }
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testarTodosCPFs();
