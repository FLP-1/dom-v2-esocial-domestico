import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Script para criar grupos e associar usuários
 */

async function main() {
  console.log('🏢 Criando grupos e associando usuários...\n');

  // 1. Criar grupos básicos
  const grupoEmpresarial = await prisma.grupo.upsert({
    where: { id: 'grupo-empresarial-001' },
    update: {},
    create: {
      id: 'grupo-empresarial-001',
      nome: 'Empresa Principal',
      descricao: 'Grupo principal da empresa',
      cor: '#3498db',
      icone: 'building',
      tipo: 'empresa',
      privado: false,
      ativo: true
    }
  });

  const grupoRH = await prisma.grupo.upsert({
    where: { id: 'grupo-rh-001' },
    update: {},
    create: {
      id: 'grupo-rh-001',
      nome: 'Recursos Humanos',
      descricao: 'Departamento de RH',
      cor: '#27ae60',
      icone: 'users',
      tipo: 'departamento',
      privado: false,
      ativo: true
    }
  });

  console.log('✅ Grupos criados:');
  console.log(`  - ${grupoEmpresarial.nome}`);
  console.log(`  - ${grupoRH.nome}\n`);

  // 2. Buscar todos os usuários
  const usuarios = await prisma.usuario.findMany({
    include: {
      perfis: {
        include: {
          perfil: true
        }
      }
    }
  });

  console.log(`👥 Associando ${usuarios.length} usuários aos grupos...\n`);

  for (const usuario of usuarios) {
    const perfil = usuario.perfis[0]?.perfil;
    
    // Decidir qual grupo baseado no perfil
    const grupoId = perfil?.codigo === 'EMPREGADOR' ? grupoRH.id : grupoEmpresarial.id;
    const papel = perfil?.codigo === 'EMPREGADOR' ? 'admin' : 'membro';

    // Criar associação usuário-grupo (idempotente)
    await prisma.usuarioGrupo.upsert({
      where: {
        usuarioId_grupoId: {
          usuarioId: usuario.id,
          grupoId: grupoId
        }
      },
      update: {
        papel,
        ativo: true
      },
      create: {
        usuarioId: usuario.id,
        grupoId: grupoId,
        papel,
        ativo: true
      }
    });

    console.log(`  ✅ ${usuario.nomeCompleto} → ${grupoId === grupoRH.id ? 'RH' : 'Empresa Principal'} (${papel})`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Associações criadas com sucesso!\n');

  // 3. Agora atualizar os registros com os grupos corretos
  console.log('🔄 Atualizando registros de ponto e HE com grupoId...\n');

  let pontosAtualizados = 0;
  let heAtualizadas = 0;

  for (const usuario of usuarios) {
    const perfil = usuario.perfis[0]?.perfil;
    const grupoId = perfil?.codigo === 'EMPREGADOR' ? grupoRH.id : grupoEmpresarial.id;
    const usuarioPerfilId = usuario.perfis[0]?.id;

    // Atualizar registros de ponto
    const resultPonto = await prisma.registroPonto.updateMany({
      where: {
        usuarioId: usuario.id
      },
      data: {
        grupoId,
        usuarioPerfilId
      }
    });

    pontosAtualizados += resultPonto.count;

    // Atualizar solicitações de HE
    const resultHE = await prisma.solicitacaoHoraExtra.updateMany({
      where: {
        usuarioId: usuario.id
      },
      data: {
        grupoId,
        usuarioPerfilId
      }
    });

    heAtualizadas += resultHE.count;

    if (resultPonto.count > 0 || resultHE.count > 0) {
      console.log(`  ✅ ${usuario.nomeCompleto}: ${resultPonto.count} pontos, ${resultHE.count} HE`);
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📊 RESUMO FINAL:');
  console.log('═'.repeat(60));
  console.log(`  🏢 Grupos criados: 2`);
  console.log(`  👥 Usuários associados: ${usuarios.length}`);
  console.log(`  📍 Registros de ponto atualizados: ${pontosAtualizados}`);
  console.log(`  ⏱️  Solicitações de HE atualizadas: ${heAtualizadas}`);
  console.log('═'.repeat(60));
  console.log('✅ Processo completo!\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

