const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarAssociacoesFrancisco() {
  console.log('🔍 Verificando associações do usuário Francisco...');
  
  // 1. Encontrar usuário Francisco
  const usuario = await prisma.usuario.findFirst({
    where: { 
      OR: [
        { nomeCompleto: { contains: 'Francisco' } },
        { nomeCompleto: { contains: 'Lattari' } }
      ]
    },
    include: {
      gruposUsuario: {
        include: { grupo: true }
      },
      perfis: {
        include: { perfil: true }
      }
    }
  });
  
  if (!usuario) {
    console.log('❌ Usuário Francisco não encontrado');
    await prisma.$disconnect();
    return;
  }
  
  console.log('👤 Usuário encontrado:', {
    id: usuario.id,
    nome: usuario.nomeCompleto,
    email: usuario.email,
    cpf: usuario.cpf
  });
  
  console.log('\n📁 GRUPOS ASSOCIADOS:');
  console.log('====================');
  if (usuario.gruposUsuario.length > 0) {
    usuario.gruposUsuario.forEach(ug => {
      console.log(`✅ ${ug.grupo.nome} (${ug.papel}) - Ativo: ${ug.ativo}`);
    });
  } else {
    console.log('❌ NENHUM GRUPO ASSOCIADO!');
    console.log('🔧 Criando associação...');
    
    // Encontrar um grupo disponível
    const grupoDisponivel = await prisma.grupo.findFirst({
      where: { ativo: true }
    });
    
    if (grupoDisponivel) {
      await prisma.usuarioGrupo.create({
        data: {
          usuarioId: usuario.id,
          grupoId: grupoDisponivel.id,
          papel: 'FUNCIONARIO',
          ativo: true
        }
      });
      console.log(`✅ Associação criada com grupo: ${grupoDisponivel.nome}`);
    } else {
      console.log('❌ Nenhum grupo disponível para associar');
    }
  }
  
  console.log('\n👔 PERFIS ASSOCIADOS:');
  console.log('====================');
  if (usuario.perfis.length > 0) {
    usuario.perfis.forEach(up => {
      console.log(`✅ ${up.perfil.nome} - Ativo: ${up.ativo}`);
    });
  } else {
    console.log('❌ NENHUM PERFIL ASSOCIADO!');
    console.log('🔧 Criando associação...');
    
    // Encontrar perfil de funcionário
    const perfilFuncionario = await prisma.perfil.findFirst({
      where: { nome: 'Funcionário' }
    });
    
    if (perfilFuncionario) {
      await prisma.usuarioPerfil.create({
        data: {
          usuarioId: usuario.id,
          perfilId: perfilFuncionario.id,
          ativo: true
        }
      });
      console.log(`✅ Associação criada com perfil: ${perfilFuncionario.nome}`);
    } else {
      console.log('❌ Perfil de funcionário não encontrado');
    }
  }
  
  console.log('\n🎯 RESUMO:');
  console.log('==========');
  console.log('✅ Verificação e correção concluída!');
  console.log('🔑 Usuário:', usuario.nomeCompleto);
  console.log('📧 Email:', usuario.email);
  
  await prisma.$disconnect();
}

verificarAssociacoesFrancisco().catch(e => {
  console.error('Erro na verificação:', e);
  prisma.$disconnect();
  process.exit(1);
});



