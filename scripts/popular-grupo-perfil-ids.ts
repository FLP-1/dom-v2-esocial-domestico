import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para popular grupoId e usuarioPerfilId nos registros existentes
 * Relaciona registros de ponto e solicitações de HE com seus respectivos grupos e perfis
 */

async function main() {
  console.log('🔄 Iniciando população de grupoId e usuarioPerfilId...\n');

  // 1. Buscar todos os usuários com seus perfis e grupos
  const usuarios = await prisma.usuario.findMany({
    include: {
      perfis: {
        include: {
          perfil: true
        }
      },
      gruposUsuario: {
        include: {
          grupo: true
        }
      }
    }
  });

  console.log(`📊 Encontrados ${usuarios.length} usuários\n`);

  let registrosPontoAtualizados = 0;
  let solicitacoesHEAtualizadas = 0;

  for (const usuario of usuarios) {
    console.log(`\n👤 Processando: ${usuario.nomeCompleto} (${usuario.cpf})`);
    
    // Pegar o primeiro grupo do usuário (se houver)
    const primeiroGrupo = usuario.gruposUsuario[0]?.grupo;
    const grupoId = primeiroGrupo?.id || null;
    
    // Pegar o primeiro perfil do usuário (se houver)
    const primeiroPerfil = usuario.perfis[0];
    const usuarioPerfilId = primeiroPerfil?.id || null;

    console.log(`  📋 Grupo: ${primeiroGrupo?.nome || 'N/A'}`);
    console.log(`  🎭 Perfil: ${primeiroPerfil?.perfil.nome || 'N/A'}`);

    // Atualizar registros de ponto
    const resultPonto = await prisma.registroPonto.updateMany({
      where: {
        usuarioId: usuario.id,
        grupoId: null,
        usuarioPerfilId: null
      },
      data: {
        grupoId,
        usuarioPerfilId
      }
    });

    registrosPontoAtualizados += resultPonto.count;
    console.log(`  ✅ ${resultPonto.count} registros de ponto atualizados`);

    // Atualizar solicitações de hora extra
    const resultHE = await prisma.solicitacaoHoraExtra.updateMany({
      where: {
        usuarioId: usuario.id,
        grupoId: null,
        usuarioPerfilId: null
      },
      data: {
        grupoId,
        usuarioPerfilId
      }
    });

    solicitacoesHEAtualizadas += resultHE.count;
    console.log(`  ✅ ${resultHE.count} solicitações de HE atualizadas`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMO DA ATUALIZAÇÃO:');
  console.log('═'.repeat(60));
  console.log(`  📍 Registros de Ponto atualizados: ${registrosPontoAtualizados}`);
  console.log(`  ⏱️  Solicitações de HE atualizadas: ${solicitacoesHEAtualizadas}`);
  console.log('═'.repeat(60));
  console.log('✅ População de grupoId e usuarioPerfilId concluída!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

