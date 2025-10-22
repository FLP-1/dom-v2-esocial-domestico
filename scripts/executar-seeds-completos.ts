#!/usr/bin/env ts-node

/**
 * SCRIPT PARA EXECUTAR TODOS OS SEEDS
 * 
 * Este script executa todos os seeds necessários para eliminar
 * dados hardcoded do sistema
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function executarSeedsCompletos() {
  console.log('🚀 Iniciando execução completa de seeds...\n');

  try {
    // 1. Verificar conexão com banco
    console.log('📡 Verificando conexão com banco de dados...');
    await prisma.$connect();
    console.log('✅ Conexão estabelecida\n');

    // 2. Executar seed de configurações obrigatórias
    console.log('⚙️  Executando seed de configurações obrigatórias...');
    const { default: seedConfiguracoes } = await import('../prisma/seeds/seed-configuracoes-obrigatorias');
    await seedConfiguracoes();
    console.log('✅ Configurações obrigatórias criadas\n');

    // 3. Executar seed de termos e políticas
    console.log('📋 Executando seed de termos e políticas...');
    const { default: seedTermos } = await import('../prisma/seeds/seed-termos-politicas');
    await seedTermos();
    console.log('✅ Termos e políticas criados\n');

    // 4. Verificar se tudo foi criado corretamente
    console.log('🔍 Verificando dados criados...');
    
    const configCount = await prisma.configuracaoSistema.count();
    const termosCount = await prisma.termo.count();
    
    console.log(`📊 Configurações criadas: ${configCount}`);
    console.log(`📊 Termos criados: ${termosCount}`);

    if (configCount === 0) {
      throw new Error('❌ Nenhuma configuração foi criada');
    }

    if (termosCount === 0) {
      throw new Error('❌ Nenhum termo foi criado');
    }

    console.log('\n🎉 SEED COMPLETO EXECUTADO COM SUCESSO!');
    console.log('✅ Todos os dados hardcoded foram substituídos por dados dinâmicos');
    console.log('✅ Sistema agora está totalmente configurado');
    console.log('\n📝 Próximos passos:');
    console.log('   1. Reiniciar o servidor de desenvolvimento');
    console.log('   2. Testar o modal de termos');
    console.log('   3. Verificar se as configurações estão funcionando');

  } catch (error) {
    console.error('\n❌ ERRO NA EXECUÇÃO DOS SEEDS:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarSeedsCompletos();
}

export default executarSeedsCompletos;
