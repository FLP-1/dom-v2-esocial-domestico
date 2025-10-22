// Script para analisar integridade dos dados
// Verifica as regras: CPF único, 1 empregador por grupo, CPF único por grupo

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function analyzeDataIntegrity() {
  console.log('🔍 ANALISANDO INTEGRIDADE DOS DADOS...\n');

  // 1. Verificar CPFs duplicados no sistema
  console.log('1️⃣ VERIFICANDO CPFs DUPLICADOS...');
  const cpfDuplicates = await prisma.$queryRaw`
    SELECT cpf, COUNT(*) as count
    FROM usuarios 
    GROUP BY cpf 
    HAVING COUNT(*) > 1
  `;
  
  if (cpfDuplicates.length > 0) {
    console.log('❌ CPFs DUPLICADOS ENCONTRADOS:');
    cpfDuplicates.forEach(dup => {
      console.log(`   CPF: ${dup.cpf} - ${dup.count} ocorrências`);
    });
  } else {
    console.log('✅ Nenhum CPF duplicado encontrado');
  }

  // 2. Verificar múltiplos empregadores por grupo
  console.log('\n2️⃣ VERIFICANDO MÚLTIPLOS EMPREGADORES POR GRUPO...');
  const multipleEmployers = await prisma.$queryRaw`
    SELECT ug."grupoId", g.nome as "grupoNome", COUNT(*) as "empregadoresCount"
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
    multipleEmployers.forEach(group => {
      console.log(`   Grupo: ${group.grupoNome} (${group.grupoId}) - ${group.empregadoresCount} empregadores`);
    });
  } else {
    console.log('✅ Todos os grupos têm apenas 1 empregador');
  }

  // 3. Verificar CPFs duplicados dentro do mesmo grupo
  console.log('\n3️⃣ VERIFICANDO CPFs DUPLICADOS DENTRO DO MESMO GRUPO...');
  const cpfGroupDuplicates = await prisma.$queryRaw`
    SELECT u.cpf, ug."grupoId", g.nome as "grupoNome", COUNT(*) as count
    FROM usuarios u
    JOIN usuarios_grupos ug ON u.id = ug."usuarioId"
    JOIN grupos g ON ug."grupoId" = g.id
    WHERE ug.ativo = true
    GROUP BY u.cpf, ug."grupoId", g.nome
    HAVING COUNT(*) > 1
  `;

  if (cpfGroupDuplicates.length > 0) {
    console.log('❌ CPFs DUPLICADOS DENTRO DO MESMO GRUPO:');
    cpfGroupDuplicates.forEach(dup => {
      console.log(`   CPF: ${dup.cpf} no grupo ${dup.grupoNome} - ${dup.count} ocorrências`);
    });
  } else {
    console.log('✅ Nenhum CPF duplicado dentro do mesmo grupo');
  }

  // 4. Verificar usuários sem perfil
  console.log('\n4️⃣ VERIFICANDO USUÁRIOS SEM PERFIL...');
  const usersWithoutProfile = await prisma.usuario.findMany({
    where: {
      perfis: {
        none: {}
      }
    },
    select: {
      id: true,
      cpf: true,
      nomeCompleto: true
    }
  });

  if (usersWithoutProfile.length > 0) {
    console.log('❌ USUÁRIOS SEM PERFIL:');
    usersWithoutProfile.forEach(user => {
      console.log(`   ${user.cpf} - ${user.nomeCompleto}`);
    });
  } else {
    console.log('✅ Todos os usuários têm pelo menos 1 perfil');
  }

  // 5. Verificar usuários sem grupo
  console.log('\n5️⃣ VERIFICANDO USUÁRIOS SEM GRUPO...');
  const usersWithoutGroup = await prisma.usuario.findMany({
    where: {
      gruposUsuario: {
        none: {}
      }
    },
    select: {
      id: true,
      cpf: true,
      nomeCompleto: true
    }
  });

  if (usersWithoutGroup.length > 0) {
    console.log('❌ USUÁRIOS SEM GRUPO:');
    usersWithoutGroup.forEach(user => {
      console.log(`   ${user.cpf} - ${user.nomeCompleto}`);
    });
  } else {
    console.log('✅ Todos os usuários estão em pelo menos 1 grupo');
  }

  // 6. Estatísticas gerais
  console.log('\n📊 ESTATÍSTICAS GERAIS:');
  const stats = await prisma.$queryRaw`
    SELECT 
      (SELECT COUNT(*) FROM usuarios) as totalUsuarios,
      (SELECT COUNT(*) FROM grupos) as totalGrupos,
      (SELECT COUNT(*) FROM usuarios_grupos WHERE ativo = true) as totalVinculosAtivos,
      (SELECT COUNT(*) FROM usuarios_perfis WHERE ativo = true) as totalPerfisAtivos
  `;
  
  console.log(`   Total de usuários: ${stats[0].totalUsuarios}`);
  console.log(`   Total de grupos: ${stats[0].totalGrupos}`);
  console.log(`   Vínculos ativos usuário-grupo: ${stats[0].totalVinculosAtivos}`);
  console.log(`   Perfis ativos: ${stats[0].totalPerfisAtivos}`);

  console.log('\n✅ ANÁLISE CONCLUÍDA!');
}

// Executar análise
analyzeDataIntegrity()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
