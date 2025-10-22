// Script de migração para garantir integridade dos dados
// Aplica as regras: CPF único, 1 empregador por grupo, CPF único por grupo

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateDataIntegrity() {
  console.log('🔄 INICIANDO MIGRAÇÃO DE INTEGRIDADE DOS DADOS...\n');

  try {
    // 1. Verificar e corrigir CPFs duplicados
    console.log('1️⃣ VERIFICANDO CPFs DUPLICADOS...');
    const cpfDuplicates = await prisma.$queryRaw`
      SELECT cpf, COUNT(*) as count, array_agg(id) as user_ids
      FROM usuarios 
      GROUP BY cpf 
      HAVING COUNT(*) > 1
    `;
    
    if (cpfDuplicates.length > 0) {
      console.log('❌ CPFs DUPLICADOS ENCONTRADOS:');
      for (const duplicate of cpfDuplicates) {
        console.log(`   CPF: ${duplicate.cpf} - ${duplicate.count} ocorrências`);
        
        // Manter apenas o primeiro usuário, marcar os outros como inativos
        const userIds = duplicate.user_ids;
        const [keepUserId, ...removeUserIds] = userIds;
        
        console.log(`   ✅ Mantendo usuário: ${keepUserId}`);
        console.log(`   ❌ Marcando como inativos: ${removeUserIds.join(', ')}`);
        
        await prisma.usuario.updateMany({
          where: {
            id: { in: removeUserIds }
          },
          data: {
            ativo: false,
            bloqueado: true,
            motivoBloqueio: 'CPF duplicado - removido por migração de integridade'
          }
        });
      }
    } else {
      console.log('✅ Nenhum CPF duplicado encontrado');
    }

    // 2. Verificar e corrigir múltiplos empregadores por grupo
    console.log('\n2️⃣ VERIFICANDO MÚLTIPLOS EMPREGADORES POR GRUPO...');
    const multipleEmployers = await prisma.$queryRaw`
      SELECT ug."grupoId", g.nome as "grupoNome", COUNT(*) as "empregadoresCount", array_agg(ug."usuarioId") as user_ids
      FROM usuarios_grupos ug
      JOIN grupos g ON ug."grupoId" = g.id
      JOIN usuarios_perfis up ON ug."usuarioId" = up."usuarioId"
      JOIN perfis p ON up."perfilId" = p.id
      WHERE p.codigo = 'EMPREGADOR' AND ug.ativo = true
      GROUP BY ug."grupoId", g.nome
      HAVING COUNT(*) > 1
    `;

    if (multipleEmployers.length > 0) {
      console.log('❌ GRUPOS COM MÚLTIPLOS EMPREGADORES:');
      for (const group of multipleEmployers) {
        console.log(`   Grupo: ${group.grupoNome} (${group.grupoId}) - ${group.empregadoresCount} empregadores`);
        
        // Manter apenas o primeiro empregador (mais antigo), remover os outros do grupo
        const userIds = group.user_ids;
        const [keepUserId, ...removeUserIds] = userIds;
        
        console.log(`   ✅ Mantendo empregador: ${keepUserId}`);
        console.log(`   ❌ Removendo do grupo: ${removeUserIds.join(', ')}`);
        
        await prisma.usuarioGrupo.updateMany({
          where: {
            "grupoId": group.grupoId,
            "usuarioId": { in: removeUserIds }
          },
          data: {
            ativo: false
          }
        });
      }
    } else {
      console.log('✅ Todos os grupos têm apenas 1 empregador');
    }

    // 3. Verificar e corrigir CPFs duplicados dentro do mesmo grupo
    console.log('\n3️⃣ VERIFICANDO CPFs DUPLICADOS DENTRO DO MESMO GRUPO...');
    const cpfGroupDuplicates = await prisma.$queryRaw`
      SELECT u.cpf, ug."grupoId", g.nome as "grupoNome", COUNT(*) as count, array_agg(u.id) as user_ids
      FROM usuarios u
      JOIN usuarios_grupos ug ON u.id = ug."usuarioId"
      JOIN grupos g ON ug."grupoId" = g.id
      WHERE ug.ativo = true
      GROUP BY u.cpf, ug."grupoId", g.nome
      HAVING COUNT(*) > 1
    `;

    if (cpfGroupDuplicates.length > 0) {
      console.log('❌ CPFs DUPLICADOS DENTRO DO MESMO GRUPO:');
      for (const duplicate of cpfGroupDuplicates) {
        console.log(`   CPF: ${duplicate.cpf} no grupo ${duplicate.grupoNome} - ${duplicate.count} ocorrências`);
        
        // Manter apenas o primeiro usuário no grupo, remover os outros
        const userIds = duplicate.user_ids;
        const [keepUserId, ...removeUserIds] = userIds;
        
        console.log(`   ✅ Mantendo no grupo: ${keepUserId}`);
        console.log(`   ❌ Removendo do grupo: ${removeUserIds.join(', ')}`);
        
        await prisma.usuarioGrupo.updateMany({
          where: {
            "grupoId": duplicate.grupoId,
            "usuarioId": { in: removeUserIds }
          },
          data: {
            ativo: false
          }
        });
      }
    } else {
      console.log('✅ Nenhum CPF duplicado dentro do mesmo grupo');
    }

    // 4. Verificar usuários sem perfil e criar perfil padrão
    console.log('\n4️⃣ VERIFICANDO USUÁRIOS SEM PERFIL...');
    const usersWithoutProfile = await prisma.usuario.findMany({
      where: {
        perfis: {
          none: {}
        },
        ativo: true
      },
      select: {
        id: true,
        cpf: true,
        nomeCompleto: true
      }
    });

    if (usersWithoutProfile.length > 0) {
      console.log('❌ USUÁRIOS SEM PERFIL:');
      
      // Buscar ou criar perfil padrão de funcionário
      let defaultProfile = await prisma.perfil.findFirst({
        where: { codigo: 'FUNCIONARIO' }
      });

      if (!defaultProfile) {
        defaultProfile = await prisma.perfil.create({
          data: {
            codigo: 'FUNCIONARIO',
            nome: 'Funcionário',
            descricao: 'Perfil padrão de funcionário',
            ativo: true
          }
        });
        console.log('   ✅ Criado perfil padrão FUNCIONARIO');
      }

      for (const user of usersWithoutProfile) {
        console.log(`   Adicionando perfil padrão para: ${user.cpf} - ${user.nomeCompleto}`);
        
        await prisma.usuarioPerfil.create({
          data: {
            usuarioId: user.id,
            perfilId: defaultProfile.id,
            ativo: true,
            principal: true
          }
        });
      }
    } else {
      console.log('✅ Todos os usuários têm pelo menos 1 perfil');
    }

    // 5. Verificar usuários sem grupo e criar grupo padrão
    console.log('\n5️⃣ VERIFICANDO USUÁRIOS SEM GRUPO...');
    const usersWithoutGroup = await prisma.usuario.findMany({
      where: {
        gruposUsuario: {
          none: {}
        },
        ativo: true
      },
      select: {
        id: true,
        cpf: true,
        nomeCompleto: true
      }
    });

    if (usersWithoutGroup.length > 0) {
      console.log('❌ USUÁRIOS SEM GRUPO:');
      
      // Buscar ou criar grupo padrão
      let defaultGroup = await prisma.grupo.findFirst({
        where: { nome: 'Grupo Padrão' }
      });

      if (!defaultGroup) {
        defaultGroup = await prisma.grupo.create({
          data: {
            nome: 'Grupo Padrão',
            descricao: 'Grupo padrão criado automaticamente',
            tipo: 'PADRAO',
            ativo: true
          }
        });
        console.log('   ✅ Criado grupo padrão');
      }

      for (const user of usersWithoutGroup) {
        console.log(`   Adicionando ao grupo padrão: ${user.cpf} - ${user.nomeCompleto}`);
        
        await prisma.usuarioGrupo.create({
          data: {
            usuarioId: user.id,
            grupoId: defaultGroup.id,
            papel: 'FUNCIONARIO',
            ativo: true
          }
        });
      }
    } else {
      console.log('✅ Todos os usuários estão em pelo menos 1 grupo');
    }

    // 6. Verificar se todos os grupos têm pelo menos 1 empregador
    console.log('\n6️⃣ VERIFICANDO GRUPOS SEM EMPREGADOR...');
    const groupsWithoutEmployer = await prisma.$queryRaw`
      SELECT g.id, g.nome
      FROM grupos g
      WHERE g.ativo = true
      AND NOT EXISTS (
        SELECT 1 
        FROM usuarios_grupos ug
        JOIN usuarios_perfis up ON ug."usuarioId" = up."usuarioId"
        JOIN perfis p ON up."perfilId" = p.id
        WHERE ug."grupoId" = g.id 
        AND ug.ativo = true 
        AND up.ativo = true 
        AND p.codigo = 'EMPREGADOR'
      )
    `;

    if (groupsWithoutEmployer.length > 0) {
      console.log('❌ GRUPOS SEM EMPREGADOR:');
      
      // Buscar ou criar perfil de empregador
      let employerProfile = await prisma.perfil.findFirst({
        where: { codigo: 'EMPREGADOR' }
      });

      if (!employerProfile) {
        employerProfile = await prisma.perfil.create({
          data: {
            codigo: 'EMPREGADOR',
            nome: 'Empregador',
            descricao: 'Perfil de empregador',
            ativo: true
          }
        });
        console.log('   ✅ Criado perfil EMPREGADOR');
      }

      for (const group of groupsWithoutEmployer) {
        console.log(`   Grupo sem empregador: ${group.nome}`);
        console.log(`   ⚠️  ATENÇÃO: Este grupo precisa de um empregador manualmente`);
      }
    } else {
      console.log('✅ Todos os grupos têm pelo menos 1 empregador');
    }

    console.log('\n✅ MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('\n📋 RESUMO DAS AÇÕES:');
    console.log('   - CPFs duplicados foram corrigidos');
    console.log('   - Múltiplos empregadores por grupo foram corrigidos');
    console.log('   - CPFs duplicados dentro do grupo foram corrigidos');
    console.log('   - Usuários sem perfil receberam perfil padrão');
    console.log('   - Usuários sem grupo foram adicionados ao grupo padrão');
    console.log('   - Grupos sem empregador foram identificados');

  } catch (error) {
    console.error('❌ ERRO DURANTE A MIGRAÇÃO:', error);
    throw error;
  }
}

// Executar migração
migrateDataIntegrity()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
