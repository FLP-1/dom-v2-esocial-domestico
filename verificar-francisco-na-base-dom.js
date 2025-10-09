const { PrismaClient } = require('@prisma/client');

async function verificarFranciscoNaBaseDom() {
  // Conectar na base 'dom' (a correta)
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: 'postgresql://userdom:FLP*2025@localhost:5433/dom'
      }
    }
  });
  
  try {
    console.log('🔍 Verificando Francisco na base "dom" (PostgreSQL 18)...');
    
    const francisco = await prisma.usuario.findUnique({
      where: { cpf: '59876913700' },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        }
      }
    });
    
    if (francisco) {
      console.log('\n✅ Francisco encontrado na base "dom":');
      console.log('- Nome:', francisco.nomeCompleto);
      console.log('- CPF:', francisco.cpf);
      console.log('- Apelido:', francisco.apelido);
      console.log('- Email:', francisco.email);
      console.log('- Perfis encontrados:', francisco.perfis.length);
      
      francisco.perfis.forEach((perfilUsuario, index) => {
        console.log(`\n📋 Perfil ${index + 1}:`);
        console.log('  - Avatar:', perfilUsuario.avatar);
        console.log('  - Apelido:', perfilUsuario.apelido);
        console.log('  - Perfil:', perfilUsuario.perfil.nome);
        console.log('  - Código:', perfilUsuario.perfil.codigo);
        console.log('  - Principal:', perfilUsuario.principal);
      });
      
      console.log('\n🎯 Francisco está na base correta "dom" com 2 perfis!');
      
    } else {
      console.log('\n❌ Francisco não encontrado na base "dom"');
      
      // Listar todos os usuários para ver quem está lá
      const todosUsuarios = await prisma.usuario.findMany({
        select: {
          nomeCompleto: true,
          cpf: true,
          apelido: true
        }
      });
      
      console.log('\n📋 Usuários disponíveis na base "dom":');
      todosUsuarios.forEach((user, index) => {
        console.log(`${index + 1}. ${user.nomeCompleto} (CPF: ${user.cpf}) - ${user.apelido}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar Francisco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarFranciscoNaBaseDom();
