const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function criarUsuarioValido() {
  try {
    const senhaHash = await bcrypt.hash('senha123', 10);
    
    const usuario = await prisma.usuario.upsert({
      where: { cpf: '11144477735' },
      update: {},
      create: {
        cpf: '11144477735',
        nomeCompleto: 'Usuário Teste',
        apelido: 'Teste',
        email: 'teste@email.com',
        senhaHash: senhaHash,
        telefone: '11999999999',
        dataNascimento: new Date('1990-01-01'),
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
        consentimentoLGPD: true,
        salt: 'salt123'
      }
    });
    
    console.log('✅ Usuário criado com sucesso!');
    console.log('   CPF: 111.444.777-35');
    console.log('   Senha: senha123');
    console.log('   Email: teste@email.com');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

criarUsuarioValido();
