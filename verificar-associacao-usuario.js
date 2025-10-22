const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function verificarAssociacaoUsuario() {
  try {
    console.log('🔍 Verificando associações do usuário de teste...');

    // 1. Buscar usuário de teste
    const funcionario = await prisma.usuario.findFirst({
      where: { 
        email: 'joao.silva.teste@empresatestemodal.com.br' 
      },
      include: {
        gruposUsuario: {
          include: {
            grupo: true
          }
        },
        perfis: {
          include: {
            perfil: true
          }
        }
      }
    });

    if (!funcionario) {
      console.log('❌ Usuário de teste não encontrado!');
      return;
    }

    console.log('👤 Usuário encontrado:', {
      id: funcionario.id,
      nome: funcionario.nomeCompleto,
      email: funcionario.email,
      cpf: funcionario.cpf
    });

    console.log('\n📁 Grupos associados:');
    if (funcionario.gruposUsuario.length === 0) {
      console.log('❌ NENHUM GRUPO ASSOCIADO!');
    } else {
      funcionario.gruposUsuario.forEach((assoc, index) => {
        console.log(`${index + 1}. ${assoc.grupo.nome} (${assoc.papel}) - Ativo: ${assoc.ativo}`);
      });
    }

    console.log('\n👔 Perfis associados:');
    if (funcionario.perfis.length === 0) {
      console.log('❌ NENHUM PERFIL ASSOCIADO!');
    } else {
      funcionario.perfis.forEach((assoc, index) => {
        console.log(`${index + 1}. ${assoc.perfil.nome} - Ativo: ${assoc.ativo}`);
      });
    }

    // 2. Verificar se existe o grupo "Empresa Teste Modal"
    const grupoTeste = await prisma.grupo.findFirst({
      where: { nome: 'Empresa Teste Modal' }
    });

    if (grupoTeste) {
      console.log('\n🏢 Grupo de teste encontrado:', {
        id: grupoTeste.id,
        nome: grupoTeste.nome,
        tipo: grupoTeste.tipo
      });

      // 3. Verificar se a associação existe
      const associacao = await prisma.usuarioGrupo.findFirst({
        where: {
          usuarioId: funcionario.id,
          grupoId: grupoTeste.id
        }
      });

      if (associacao) {
        console.log('✅ Associação usuário-grupo existe:', {
          id: associacao.id,
          papel: associacao.papel,
          ativo: associacao.ativo
        });
      } else {
        console.log('❌ Associação usuário-grupo NÃO existe!');
        console.log('🔧 Criando associação...');
        
        await prisma.usuarioGrupo.create({
          data: {
            usuarioId: funcionario.id,
            grupoId: grupoTeste.id,
            papel: 'FUNCIONARIO',
            ativo: true
          }
        });
        console.log('✅ Associação criada!');
      }
    } else {
      console.log('❌ Grupo de teste não encontrado!');
    }

    // 4. Verificar perfil
    const perfilFuncionario = await prisma.perfil.findFirst({
      where: { codigo: 'FUNCIONARIO' }
    });

    if (perfilFuncionario) {
      console.log('\n👔 Perfil funcionário encontrado:', {
        id: perfilFuncionario.id,
        nome: perfilFuncionario.nome
      });

      const perfilAssociacao = await prisma.usuarioPerfil.findFirst({
        where: {
          usuarioId: funcionario.id,
          perfilId: perfilFuncionario.id
        }
      });

      if (perfilAssociacao) {
        console.log('✅ Associação usuário-perfil existe:', {
          id: perfilAssociacao.id,
          ativo: perfilAssociacao.ativo
        });
      } else {
        console.log('❌ Associação usuário-perfil NÃO existe!');
        console.log('🔧 Criando associação...');
        
        await prisma.usuarioPerfil.create({
          data: {
            usuarioId: funcionario.id,
            perfilId: perfilFuncionario.id,
            ativo: true
          }
        });
        console.log('✅ Associação criada!');
      }
    } else {
      console.log('❌ Perfil funcionário não encontrado!');
    }

    console.log('\n🎯 RESUMO:');
    console.log('==========');
    console.log('✅ Verificação e correção concluída!');
    console.log('🔑 Credenciais: joao.silva.teste@empresatestemodal.com.br / 123456');

  } catch (error) {
    console.error('❌ Erro ao verificar associações:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarAssociacaoUsuario()
    .then(() => {
      console.log('\n✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no processo:', error);
      process.exit(1);
    });
}

module.exports = { verificarAssociacaoUsuario };
