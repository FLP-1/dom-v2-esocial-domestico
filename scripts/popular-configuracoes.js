// 🎯 SCRIPT PARA POPULAR CONFIGURAÇÕES DINÂMICAS
// Este script popula o banco com configurações padrão
// eliminando a necessidade de hardcoded

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function popularConfiguracoes() {
  try {
    console.log('🚀 Iniciando população de configurações...');

    // ========================================
    // CONFIGURAÇÕES DE SISTEMA
    // ========================================

    const configuracoesSistema = [
      // Cores
      {
        chave: 'colors_primary',
        categoria: 'colors',
        valor: JSON.stringify({ primary: '#29ABE2' }),
        descricao: 'Cor primária do sistema',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_secondary',
        categoria: 'colors',
        valor: JSON.stringify({ secondary: '#90EE90' }),
        descricao: 'Cor secundária do sistema',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_success',
        categoria: 'colors',
        valor: JSON.stringify({ success: '#10B981' }),
        descricao: 'Cor de sucesso',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_warning',
        categoria: 'colors',
        valor: JSON.stringify({ warning: '#F59E0B' }),
        descricao: 'Cor de aviso',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_error',
        categoria: 'colors',
        valor: JSON.stringify({ error: '#EF4444' }),
        descricao: 'Cor de erro',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'colors_info',
        categoria: 'colors',
        valor: JSON.stringify({ info: '#3B82F6' }),
        descricao: 'Cor de informação',
        tipo: 'string',
        editavel: true,
      },

      // Geolocalização
      {
        chave: 'geolocation_max_distance',
        categoria: 'geolocation',
        valor: JSON.stringify({ maxDistance: 200 }),
        descricao: 'Distância máxima para validação de geolocalização (metros)',
        tipo: 'number',
        editavel: true,
      },
      {
        chave: 'geolocation_accuracy_threshold',
        categoria: 'geolocation',
        valor: JSON.stringify({ accuracyThreshold: 100 }),
        descricao: 'Limite de precisão para geolocalização (metros)',
        tipo: 'number',
        editavel: true,
      },
      {
        chave: 'geolocation_timeout',
        categoria: 'geolocation',
        valor: JSON.stringify({ timeout: 10000 }),
        descricao: 'Timeout para geolocalização (milissegundos)',
        tipo: 'number',
        editavel: true,
      },

      // Antifraude
      {
        chave: 'antifraud_max_attempts',
        categoria: 'antifraud',
        valor: JSON.stringify({ maxAttempts: 3 }),
        descricao: 'Número máximo de tentativas de antifraude',
        tipo: 'number',
        editavel: true,
      },
      {
        chave: 'antifraud_lockout_duration',
        categoria: 'antifraud',
        valor: JSON.stringify({ lockoutDuration: 300000 }),
        descricao: 'Duração do bloqueio por antifraude (milissegundos)',
        tipo: 'number',
        editavel: true,
      },
      {
        chave: 'antifraud_risk_threshold',
        categoria: 'antifraud',
        valor: JSON.stringify({ riskThreshold: 0.7 }),
        descricao: 'Limite de risco para antifraude',
        tipo: 'number',
        editavel: true,
      },

      // URLs
      {
        chave: 'urls_api',
        categoria: 'urls',
        valor: JSON.stringify({ api: 'http://localhost:3000/api' }),
        descricao: 'URL base da API',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'urls_esocial_homologacao',
        categoria: 'urls',
        valor: JSON.stringify({ esocial: { homologacao: 'https://webservices.producaorestrita.esocial.gov.br' } }),
        descricao: 'URL do eSocial homologação',
        tipo: 'string',
        editavel: true,
      },
      {
        chave: 'urls_esocial_producao',
        categoria: 'urls',
        valor: JSON.stringify({ esocial: { producao: 'https://webservices.envio.esocial.gov.br' } }),
        descricao: 'URL do eSocial produção',
        tipo: 'string',
        editavel: true,
      },
    ];

    // Inserir configurações do sistema
    for (const config of configuracoesSistema) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: config,
        create: config,
      });
      console.log(`✅ Configuração ${config.chave} inserida/atualizada`);
    }

    // ========================================
    // CONFIGURAÇÕES POR PERFIL
    // ========================================

    // Buscar perfis existentes
    const perfis = await prisma.perfil.findMany({
      where: { ativo: true }
    });

    const configuracoesPerfil = [
      {
        codigo: 'EMPREGADO',
        colors: {
          primary: '#29ABE2',
          secondary: '#90EE90',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      {
        codigo: 'EMPREGADOR',
        colors: {
          primary: '#E74C3C',
          secondary: '#F39C12',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      {
        codigo: 'FAMILIA',
        colors: {
          primary: '#9B59B6',
          secondary: '#E91E63',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
      {
        codigo: 'ADMIN',
        colors: {
          primary: '#34495E',
          secondary: '#2ECC71',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6',
        }
      },
    ];

    // Inserir configurações por perfil
    for (const configPerfil of configuracoesPerfil) {
      const perfil = perfis.find(p => p.codigo === configPerfil.codigo);
      
      if (perfil) {
        await prisma.configuracaoPerfil.upsert({
          where: {
            perfilId_chave: {
              perfilId: perfil.id,
              chave: 'colors'
            }
          },
          update: {
            categoria: 'colors',
            valor: JSON.stringify(configPerfil.colors),
            descricao: `Cores do perfil ${configPerfil.codigo}`,
            ativo: true,
            prioridade: 1,
          },
          create: {
            perfilId: perfil.id,
            chave: 'colors',
            categoria: 'colors',
            valor: JSON.stringify(configPerfil.colors),
            descricao: `Cores do perfil ${configPerfil.codigo}`,
            ativo: true,
            prioridade: 1,
          },
        });
        console.log(`✅ Configuração de cores para perfil ${configPerfil.codigo} inserida/atualizada`);
      }
    }

    // ========================================
    // CONFIGURAÇÕES DE GEOLOCALIZAÇÃO PARA USUÁRIO
    // ========================================

    // Buscar usuário Francisco (CPF: 59876913700)
    const usuario = await prisma.usuario.findUnique({
      where: { cpf: '59876913700' }
    });

    if (usuario) {
      const geolocationConfig = {
        maxDistance: 200,
        accuracyThreshold: 100,
        timeout: 10000,
      };

      // Verificar se já existe
      const existingConfig = await prisma.configuracaoGeolocalizacao.findFirst({
        where: {
          usuarioId: usuario.id,
          chave: 'geolocation_config'
        }
      });

      if (existingConfig) {
        await prisma.configuracaoGeolocalizacao.update({
          where: { id: existingConfig.id },
          data: {
            valor: JSON.stringify(geolocationConfig),
            descricao: 'Configuração de geolocalização do usuário',
            ativo: true,
          }
        });
      } else {
        await prisma.configuracaoGeolocalizacao.create({
          data: {
            usuarioId: usuario.id,
            chave: 'geolocation_config',
            valor: JSON.stringify(geolocationConfig),
            descricao: 'Configuração de geolocalização do usuário',
            ativo: true,
          }
        });
      }
      console.log(`✅ Configuração de geolocalização para usuário ${usuario.nomeCompleto} inserida/atualizada`);
    }

    console.log('🎉 Configurações populadas com sucesso!');
    console.log('📊 Resumo:');
    console.log(`   - ${configuracoesSistema.length} configurações de sistema`);
    console.log(`   - ${configuracoesPerfil.length} configurações de perfil`);
    console.log(`   - 1 configuração de geolocalização para usuário`);

  } catch (error) {
    console.error('❌ Erro ao popular configurações:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  popularConfiguracoes()
    .then(() => {
      console.log('✅ Script executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na execução:', error);
      process.exit(1);
    });
}

module.exports = { popularConfiguracoes };
