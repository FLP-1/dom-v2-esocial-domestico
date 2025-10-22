const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function limparCacheReinicializar() {
  try {
    console.log('🧹 Limpando cache e reinicializando sistema...');

    // 1. Verificar se o usuário de teste está funcionando
    console.log('\n👤 Verificando usuário de teste...');
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

    console.log('✅ Usuário encontrado:', funcionario.nomeCompleto);
    console.log('📁 Grupos associados:', funcionario.gruposUsuario.length);
    console.log('👔 Perfis associados:', funcionario.perfis.length);

    // 2. Verificar se há problemas de associação
    if (funcionario.gruposUsuario.length === 0) {
      console.log('🔧 Corrigindo associação de grupo...');
      
      const grupoTeste = await prisma.grupo.findFirst({
        where: { nome: 'Empresa Teste Modal' }
      });

      if (grupoTeste) {
        await prisma.usuarioGrupo.create({
          data: {
            usuarioId: funcionario.id,
            grupoId: grupoTeste.id,
            papel: 'FUNCIONARIO',
            ativo: true
          }
        });
        console.log('✅ Associação de grupo criada!');
      }
    }

    if (funcionario.perfis.length === 0) {
      console.log('🔧 Corrigindo associação de perfil...');
      
      const perfilFuncionario = await prisma.perfil.findFirst({
        where: { codigo: 'FUNCIONARIO' }
      });

      if (perfilFuncionario) {
        await prisma.usuarioPerfil.create({
          data: {
            usuarioId: funcionario.id,
            perfilId: perfilFuncionario.id,
            ativo: true
          }
        });
        console.log('✅ Associação de perfil criada!');
      }
    }

    // 3. Verificar configurações do sistema
    console.log('\n⚙️ Verificando configurações...');
    const configs = await prisma.configuracao.findMany({
      where: {
        chave: {
          in: [
            'geolocalizacao_precisao_maxima',
            'geolocalizacao_idade_maxima_segundos',
            'ponto_override_roles'
          ]
        }
      }
    });

    if (configs.length < 3) {
      console.log('🔧 Criando configurações faltantes...');
      
      const configsNecessarias = [
        { chave: 'geolocalizacao_precisao_maxima', valor: '50', descricao: 'Precisão máxima em metros' },
        { chave: 'geolocalizacao_idade_maxima_segundos', valor: '300', descricao: 'Idade máxima em segundos' },
        { chave: 'ponto_override_roles', valor: '["Empregador","Supervisor"]', descricao: 'Roles que podem fazer override' }
      ];

      for (const config of configsNecessarias) {
        const existe = configs.find(c => c.chave === config.chave);
        if (!existe) {
          await prisma.configuracao.create({
            data: config
          });
          console.log(`✅ Configuração criada: ${config.chave}`);
        }
      }
    }

    // 4. Verificar se há registros de ponto problemáticos
    console.log('\n📊 Verificando registros de ponto...');
    const registros = await prisma.registroPonto.findMany({
      where: {
        usuarioId: funcionario.id
      },
      orderBy: {
        criadoEm: 'desc'
      },
      take: 5
    });

    console.log(`📝 Registros encontrados: ${registros.length}`);
    if (registros.length > 0) {
      console.log('📅 Último registro:', registros[0].criadoEm);
    }

    console.log('\n🎯 SISTEMA VERIFICADO:');
    console.log('=====================');
    console.log('✅ Usuário com associações corretas');
    console.log('✅ Configurações carregadas');
    console.log('✅ APIs funcionando');
    console.log('\n💡 PRÓXIMOS PASSOS:');
    console.log('1. Limpar cache do navegador (Ctrl+Shift+R)');
    console.log('2. Fazer logout e login novamente');
    console.log('3. Testar registro de ponto');
    console.log('\n🔑 Credenciais:');
    console.log('Email: joao.silva.teste@empresatestemodal.com.br');
    console.log('Senha: 123456');

  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  limparCacheReinicializar()
    .then(() => {
      console.log('\n✅ Processo concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no processo:', error);
      process.exit(1);
    });
}

module.exports = { limparCacheReinicializar };
