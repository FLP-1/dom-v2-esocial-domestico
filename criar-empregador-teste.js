const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function criarEmpregadorTeste() {
  try {
    console.log('🚀 Iniciando criação do empregador de teste...');

    // 1. Criar novo grupo para teste
    console.log('📁 Criando novo grupo...');
    const novoGrupo = await prisma.grupo.create({
      data: {
        nome: 'Empresa Teste Modal',
        descricao: 'Grupo para testar modais de grupo e perfil',
        cor: '#FF6B6B',
        icone: '🏢',
        tipo: 'EMPRESA',
        privado: false,
        ativo: true
      }
    });
    console.log('✅ Grupo criado:', novoGrupo.nome);

    // 2. Criar empregador com CNPJ específico
    console.log('🏢 Criando empregador...');
    const empregador = await prisma.empregador.create({
      data: {
        cpfCnpj: '11122233344',
        tipoInscricao: 'CPF',
        nome: 'Empresa Teste Modal LTDA',
        razaoSocial: 'Empresa Teste Modal LTDA',
        email: 'contato@empresatestemodal.com.br',
        telefone: '11999887766',
        logradouro: 'Rua Teste Modal',
        numero: '123',
        complemento: 'Sala 456',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
        ambienteESocial: 'HOMOLOGACAO',
        ativo: true
      }
    });
    console.log('✅ Empregador criado:', empregador.nome);

    // 3. Criar funcionário vinculado
    console.log('👤 Criando funcionário...');
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash('123456', salt);
    
    const funcionario = await prisma.usuario.create({
      data: {
        cpf: '12345678902',
        nomeCompleto: 'João Silva Teste',
        apelido: 'João',
        dataNascimento: new Date('1990-01-15'),
        email: 'joao.silva.teste@empresatestemodal.com.br',
        telefone: '11999887755',
        logradouro: 'Rua Funcionário',
        numero: '456',
        bairro: 'Vila Teste',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234568',
        senhaHash: senhaHash,
        salt: salt,
        ativo: true,
        termosAceitos: true,
        consentimentoLGPD: true,
        dataConsentimento: new Date()
      }
    });
    console.log('✅ Funcionário criado:', funcionario.nomeCompleto);

    // 4. Vincular funcionário ao grupo
    console.log('🔗 Vinculando funcionário ao grupo...');
    await prisma.usuarioGrupo.create({
      data: {
        usuarioId: funcionario.id,
        grupoId: novoGrupo.id,
        papel: 'FUNCIONARIO',
        ativo: true
      }
    });
    console.log('✅ Funcionário vinculado ao grupo');

    // 5. Criar perfil para o funcionário
    console.log('👔 Criando perfil do funcionário...');
    const perfilFuncionario = await prisma.perfil.create({
      data: {
        codigo: 'FUNCIONARIO',
        nome: 'Funcionário',
        descricao: 'Perfil padrão para funcionários',
        cor: '#4ECDC4',
        icone: '👤',
        ativo: true
      }
    });

    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: funcionario.id,
        perfilId: perfilFuncionario.id,
        ativo: true
      }
    });
    console.log('✅ Perfil criado e vinculado');

    // 6. Verificar dados criados
    console.log('\n📊 DADOS CRIADOS:');
    console.log('🏢 Empregador:', {
      id: empregador.id,
      cnpj: empregador.cpfCnpj,
      nome: empregador.nome,
      email: empregador.email
    });

    console.log('👤 Funcionário:', {
      id: funcionario.id,
      cpf: funcionario.cpf,
      nome: funcionario.nomeCompleto,
      email: funcionario.email
    });

    console.log('📁 Grupo:', {
      id: novoGrupo.id,
      nome: novoGrupo.nome,
      tipo: novoGrupo.tipo
    });

    console.log('\n🎯 TESTE DOS MODAIS:');
    console.log('1. Modal de Grupo: Deve mostrar o grupo "Empresa Teste Modal"');
    console.log('2. Modal de Perfil: Deve mostrar o perfil "Funcionário"');
    console.log('3. Login do funcionário: joao.silva@empresatestemodal.com.br / 123456');

    console.log('\n✅ Empregador de teste criado com sucesso!');
    console.log('🔑 Use as credenciais acima para testar os modais');

  } catch (error) {
    console.error('❌ Erro ao criar empregador de teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarEmpregadorTeste()
    .then(() => {
      console.log('\n🎉 Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no processo:', error);
      process.exit(1);
    });
}

module.exports = { criarEmpregadorTeste };
