import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Otimizando componentes duplicados...');

interface ComponentMigration {
  from: string;
  to: string;
  type: 'modal' | 'button' | 'card';
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'migrated' | 'removed';
}

// Configuração de migração de componentes
const componentMigrations: ComponentMigration[] = [
  // MODAIS - Alta Prioridade
  {
    from: 'src/components/Modal/index.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/SimpleModal.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/EmployeeModal.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/EmployerModal.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/ReportModal.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/TaxGuideModalNew.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/EmployerModalMultiStep.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },
  {
    from: 'src/components/TermsAcceptanceModal.tsx',
    to: 'src/components/UnifiedModal/index.tsx',
    type: 'modal',
    priority: 'high',
    status: 'pending',
  },

  // BOTÕES - Média Prioridade
  {
    from: 'src/components/Button/index.tsx',
    to: 'src/components/UnifiedButton/index.tsx',
    type: 'button',
    priority: 'medium',
    status: 'pending',
  },
  {
    from: 'src/components/ActionButton/index.tsx',
    to: 'src/components/UnifiedButton/index.tsx',
    type: 'button',
    priority: 'medium',
    status: 'pending',
  },
  {
    from: 'src/components/ClockInButton/index.tsx',
    to: 'src/components/UnifiedButton/index.tsx',
    type: 'button',
    priority: 'medium',
    status: 'pending',
  },

  // CARDS - Média Prioridade
  {
    from: 'src/components/Card/index.tsx',
    to: 'src/components/UnifiedCard/index.tsx',
    type: 'card',
    priority: 'medium',
    status: 'pending',
  },
  {
    from: 'src/components/InfoCard/index.tsx',
    to: 'src/components/UnifiedCard/index.tsx',
    type: 'card',
    priority: 'medium',
    status: 'pending',
  },
  {
    from: 'src/components/StatusCard/index.tsx',
    to: 'src/components/UnifiedCard/index.tsx',
    type: 'card',
    priority: 'medium',
    status: 'pending',
  },
  {
    from: 'src/components/StatsCard/index.tsx',
    to: 'src/components/UnifiedCard/index.tsx',
    type: 'card',
    priority: 'medium',
    status: 'pending',
  },
];

// Função para analisar uso de componentes
function analyzeComponentUsage(componentPath: string): boolean {
  try {
    const content = fs.readFileSync(componentPath, 'utf8');
    const componentName = path.basename(
      componentPath,
      path.extname(componentPath)
    );

    // Buscar por imports do componente
    const importPattern = new RegExp(`import.*${componentName}.*from`, 'g');
    const usagePattern = new RegExp(`<${componentName}`, 'g');

    return importPattern.test(content) || usagePattern.test(content);
  } catch {
    return false;
  }
}

// Função para criar backup
function createBackup(filePath: string): string {
  const backupPath = filePath + '.backup-' + Date.now();
  fs.copyFileSync(filePath, backupPath);
  return backupPath;
}

// Função para migrar componente
function migrateComponent(migration: ComponentMigration): void {
  console.log(`\n📦 Migrando: ${migration.from}`);
  console.log(`   Tipo: ${migration.type}`);
  console.log(`   Prioridade: ${migration.priority}`);

  if (!fs.existsSync(migration.from)) {
    console.log(`   ⚠️ Arquivo não encontrado: ${migration.from}`);
    return;
  }

  // Verificar se está sendo usado
  const isUsed = analyzeComponentUsage(migration.from);
  if (isUsed) {
    console.log(`   ⚠️ Componente ainda está sendo usado. Criando wrapper...`);

    // Criar wrapper de compatibilidade
    const wrapperContent = `
import React from 'react';
import { ${migration.type === 'modal' ? 'UnifiedModal' : migration.type === 'button' ? 'UnifiedButton' : 'UnifiedCard'} } from './unified';

// Wrapper de compatibilidade - DEPRECATED
// Use ${migration.type === 'modal' ? 'UnifiedModal' : migration.type === 'button' ? 'UnifiedButton' : 'UnifiedCard'} diretamente
export const ${path.basename(migration.from, path.extname(migration.from))} = ${migration.type === 'modal' ? 'UnifiedModal' : migration.type === 'button' ? 'UnifiedButton' : 'UnifiedCard'};
export default ${path.basename(migration.from, path.extname(migration.from))};
`;

    const wrapperPath = migration.from.replace('.tsx', '.wrapper.tsx');
    fs.writeFileSync(wrapperPath, wrapperContent);
    console.log(`   ✅ Wrapper criado: ${wrapperPath}`);
  } else {
    console.log(
      `   ✅ Componente não está sendo usado. Marcando para remoção...`
    );
    migration.status = 'removed';
  }
}

// Função para remover componente
function removeComponent(migration: ComponentMigration): void {
  if (migration.status === 'removed' && fs.existsSync(migration.from)) {
    // Criar backup antes de remover
    const backupPath = createBackup(migration.from);
    console.log(`   💾 Backup criado: ${backupPath}`);

    // Remover arquivo
    fs.unlinkSync(migration.from);
    console.log(`   🗑️ Removido: ${migration.from}`);
  }
}

// Função para gerar relatório
function generateReport(): void {
  const report = {
    timestamp: new Date().toISOString(),
    totalComponents: componentMigrations.length,
    byType: {
      modal: componentMigrations.filter(m => m.type === 'modal').length,
      button: componentMigrations.filter(m => m.type === 'button').length,
      card: componentMigrations.filter(m => m.type === 'card').length,
    },
    byPriority: {
      high: componentMigrations.filter(m => m.priority === 'high').length,
      medium: componentMigrations.filter(m => m.priority === 'medium').length,
      low: componentMigrations.filter(m => m.priority === 'low').length,
    },
    byStatus: {
      pending: componentMigrations.filter(m => m.status === 'pending').length,
      migrated: componentMigrations.filter(m => m.status === 'migrated').length,
      removed: componentMigrations.filter(m => m.status === 'removed').length,
    },
    migrations: componentMigrations,
  };

  fs.writeFileSync(
    'component-optimization-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('\n📄 Relatório salvo em: component-optimization-report.json');
}

// Função principal
function optimizeComponents(): void {
  console.log('🔍 Analisando componentes duplicados...');

  // Agrupar por prioridade
  const highPriority = componentMigrations.filter(m => m.priority === 'high');
  const mediumPriority = componentMigrations.filter(
    m => m.priority === 'medium'
  );
  const lowPriority = componentMigrations.filter(m => m.priority === 'low');

  console.log(`\n📊 Componentes identificados:`);
  console.log(`   🔴 Alta prioridade: ${highPriority.length}`);
  console.log(`   🟡 Média prioridade: ${mediumPriority.length}`);
  console.log(`   🟢 Baixa prioridade: ${lowPriority.length}`);

  console.log('\n🚀 Iniciando migração...');

  // Migrar por prioridade
  [...highPriority, ...mediumPriority, ...lowPriority].forEach(
    migrateComponent
  );

  console.log('\n🗑️ Removendo componentes não utilizados...');
  componentMigrations.forEach(removeComponent);

  console.log('\n📊 Gerando relatório...');
  generateReport();

  console.log('\n🎉 Otimização de componentes finalizada!');
  console.log('\n📋 Próximos passos:');
  console.log('   1. Revisar wrappers criados');
  console.log('   2. Migrar usos para componentes unificados');
  console.log('   3. Remover wrappers após migração completa');
  console.log('   4. Testar funcionalidades');
}

// Executar otimização
optimizeComponents();
