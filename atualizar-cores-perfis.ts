// Script simples para atualizar cores dos perfis
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function atualizarCoresPerfis() {
  console.log('🎨 Atualizando cores dos perfis...');

  try {
    // Atualizar cores dos perfis existentes
    const perfis = [
      { codigo: 'EMPREGADO', cor: '#29ABE2' },
      { codigo: 'EMPREGADOR', cor: '#2E8B57' },
      { codigo: 'FAMILIA', cor: '#9B59B6' },
      { codigo: 'ADMIN', cor: '#6B7280' },
      { codigo: 'FUNCIONARIO', cor: '#4682B4' },
      { codigo: 'FINANCEIRO', cor: '#FF6347' },
      { codigo: 'ADMINISTRADOR', cor: '#8B008B' },
    ];

    for (const perfil of perfis) {
      const resultado = await prisma.perfil.updateMany({
        where: { codigo: perfil.codigo },
        data: { cor: perfil.cor },
      });
      
      console.log(`✅ ${perfil.codigo}: ${perfil.cor} (${resultado.count} registros atualizados)`);
    }

    // Verificar resultado final
    const perfisAtualizados = await prisma.perfil.findMany({
      select: { codigo: true, nome: true, cor: true },
      orderBy: { codigo: 'asc' }
    });

    console.log('\n📊 PERFIS ATUALIZADOS:');
    perfisAtualizados.forEach(perfil => {
      console.log(`   ${perfil.codigo.padEnd(12)} | ${perfil.cor} | ${perfil.nome}`);
    });

    console.log('\n🎉 Atualização concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro na atualização:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar atualização
if (require.main === module) {
  atualizarCoresPerfis()
    .then(() => {
      console.log('✅ Atualização finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na atualização:', error);
      process.exit(1);
    });
}

export default atualizarCoresPerfis;
