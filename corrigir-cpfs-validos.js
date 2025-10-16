const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Função para gerar CPF válido
function gerarCPFValido() {
  // Gera 9 dígitos aleatórios
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  cpf += digito1;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  cpf += digito2;
  
  return cpf;
}

async function corrigirCPFs() {
  try {
    console.log('🔧 Corrigindo CPFs inválidos...');

    // 1. Buscar empregador com CPF inválido
    const empregador = await prisma.empregador.findFirst({
      where: { cpfCnpj: '11122233344' }
    });

    if (empregador) {
      const novoCPF = gerarCPFValido();
      console.log(`🏢 Empregador encontrado: ${empregador.nome}`);
      console.log(`📝 CPF antigo: ${empregador.cpfCnpj}`);
      console.log(`✅ CPF novo: ${novoCPF}`);

      await prisma.empregador.update({
        where: { id: empregador.id },
        data: { cpfCnpj: novoCPF }
      });
      console.log('✅ Empregador atualizado!');
    }

    // 2. Buscar funcionário com CPF inválido
    const funcionario = await prisma.usuario.findFirst({
      where: { cpf: '12345678902' }
    });

    if (funcionario) {
      const novoCPF = gerarCPFValido();
      console.log(`👤 Funcionário encontrado: ${funcionario.nomeCompleto}`);
      console.log(`📝 CPF antigo: ${funcionario.cpf}`);
      console.log(`✅ CPF novo: ${novoCPF}`);

      await prisma.usuario.update({
        where: { id: funcionario.id },
        data: { cpf: novoCPF }
      });
      console.log('✅ Funcionário atualizado!');
    }

    console.log('\n🎉 CPFs corrigidos com sucesso!');
    console.log('🔑 Agora os CPFs têm dígitos verificadores válidos');

  } catch (error) {
    console.error('❌ Erro ao corrigir CPFs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirCPFs()
    .then(() => {
      console.log('\n✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no processo:', error);
      process.exit(1);
    });
}

module.exports = { corrigirCPFs };
