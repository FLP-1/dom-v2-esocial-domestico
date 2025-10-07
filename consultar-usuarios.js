const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUsers() {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        cpf: true,
        nomeCompleto: true,
        apelido: true,
        email: true,
        telefone: true,
        cidade: true,
        uf: true,
        criadoEm: true,
        senhaHash: true
      }
    });
    
    console.log('=== USUÁRIOS NO BANCO DE DADOS ===');
    console.log('Total:', users.length);
    console.log('');
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   CPF: ${user.cpf}`);
      console.log(`   Nome: ${user.nomeCompleto || 'N/A'}`);
      console.log(`   Apelido: ${user.apelido || 'N/A'}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Telefone: ${user.telefone || 'N/A'}`);
      console.log(`   Cidade: ${user.cidade || 'N/A'}, ${user.uf || 'N/A'}`);
      console.log(`   Criado: ${user.criadoEm}`);
      console.log(`   Senha Hash: ${user.senhaHash ? 'TEM' : 'NÃO TEM'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  } finally {
    await prisma.$disconnect();
  }
}

getUsers();
