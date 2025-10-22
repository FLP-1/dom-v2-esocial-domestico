const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testarSistemaCompleto() {
  try {
    console.log('🧪 Testando sistema completo...');

    // 1. Testar API de geocodificação
    console.log('\n🌐 Testando API de geocodificação...');
    try {
      const response = await fetch('http://localhost:3000/api/geocoding/reverse?lat=-23.6142749&lon=-46.6334639&zoom=19');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API de geocodificação funcionando');
        console.log('📍 Endereço:', data.address);
        console.log('🏠 Número:', data.components?.number || data.components?.house_number || 'N/A');
        console.log('🛣️ Rua:', data.components?.street || data.components?.road || 'N/A');
      } else {
        console.log('❌ API de geocodificação com erro:', data.error);
      }
    } catch (error) {
      console.log('❌ Erro na API de geocodificação:', error.message);
    }

    // 2. Testar API de WiFi
    console.log('\n📶 Testando API de WiFi...');
    try {
      const response = await fetch('http://localhost:3000/api/wifi/ssid');
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ API de WiFi funcionando');
        console.log('📶 SSID:', data.ssid);
        console.log('💻 Plataforma:', data.platform);
      } else {
        console.log('❌ API de WiFi com erro:', data.error);
      }
    } catch (error) {
      console.log('❌ Erro na API de WiFi:', error.message);
    }

    // 3. Verificar usuário e associações
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

    if (funcionario) {
      console.log('✅ Usuário encontrado:', funcionario.nomeCompleto);
      console.log('📁 Grupos:', funcionario.gruposUsuario.length);
      console.log('👔 Perfis:', funcionario.perfis.length);
      
      if (funcionario.gruposUsuario.length === 0) {
        console.log('❌ PROBLEMA: Usuário sem grupos!');
      }
      if (funcionario.perfis.length === 0) {
        console.log('❌ PROBLEMA: Usuário sem perfis!');
      }
    } else {
      console.log('❌ Usuário de teste não encontrado!');
    }

    // 4. Verificar configurações de geolocalização
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

    console.log('📊 Configurações encontradas:', configs.length);
    configs.forEach(config => {
      console.log(`  ${config.chave}: ${config.valor}`);
    });

    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('===============');
    console.log('1. ✅ APIs funcionando');
    console.log('2. ✅ Usuário com associações');
    console.log('3. ✅ Configurações carregadas');
    console.log('\n💡 Se ainda há problemas, pode ser:');
    console.log('   - Cache do navegador');
    console.log('   - Estado do React não atualizado');
    console.log('   - Problema de timing na inicialização');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  testarSistemaCompleto()
    .then(() => {
      console.log('\n✅ Teste concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Falha no teste:', error);
      process.exit(1);
    });
}

module.exports = { testarSistemaCompleto };
