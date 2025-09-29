import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

console.log('🗑️ Removendo código legado...');

interface LegacyComponent {
  name: string;
  path: string;
  reason: string;
  dependencies: string[];
}

// Componentes legados identificados
const legacyComponents: LegacyComponent[] = [
  {
    name: 'ActionButton',
    path: 'src/components/ActionButton',
    reason: 'Substituído por UnifiedButton',
    dependencies: [
      'src/components/ActionButton/index.tsx',
      'src/components/ActionButton/ActionButton.tsx',
    ],
  },
  {
    name: 'Modal',
    path: 'src/components/Modal',
    reason: 'Substituído por UnifiedModal',
    dependencies: ['src/components/Modal/index.tsx'],
  },
  {
    name: 'SimpleModal',
    path: 'src/components/SimpleModal.tsx',
    reason: 'Substituído por UnifiedModal',
    dependencies: ['src/components/SimpleModal.tsx'],
  },
];

// Função para verificar se um arquivo está sendo usado
function isFileInUse(filePath: string): boolean {
  try {
    const result = execSync(
      `grep -r "${path.basename(filePath, path.extname(filePath))}" src/ --include="*.tsx" --include="*.ts"`,
      {
        encoding: 'utf8',
        stdio: 'pipe',
      }
    );
    return result.trim().length > 0;
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

// Função para remover arquivo
function removeFile(filePath: string): void {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`🗑️ Removido: ${filePath}`);
  }
}

// Função para remover diretório
function removeDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
    console.log(`🗑️ Removido diretório: ${dirPath}`);
  }
}

// Função para limpar imports não utilizados
function cleanUnusedImports(): void {
  console.log('🧹 Limpando imports não utilizados...');

  try {
    execSync('npx eslint src/ --fix --ext .ts,.tsx', { stdio: 'inherit' });
    console.log('✅ ESLint fix aplicado');
  } catch (error) {
    console.log('⚠️ Erro ao executar ESLint fix:', error);
  }
}

// Função para verificar dependências não utilizadas
function checkUnusedDependencies(): void {
  console.log('🔍 Verificando dependências não utilizadas...');

  try {
    execSync('npx depcheck', { stdio: 'inherit' });
  } catch (error) {
    console.log('⚠️ Erro ao verificar dependências:', error);
  }
}

// Função para validar build
function validateBuild(): void {
  console.log('🔨 Validando build...');

  try {
    execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Build válido');
  } catch (error) {
    console.log('❌ Erro no build:', error);
  }
}

// Função principal
function removeLegacyCode(): void {
  console.log('📋 Componentes legados identificados:');
  legacyComponents.forEach(comp => {
    console.log(`  - ${comp.name}: ${comp.reason}`);
  });

  console.log('\n🔍 Verificando uso dos componentes...');

  legacyComponents.forEach(component => {
    console.log(`\n📦 Processando: ${component.name}`);

    // Verificar se está sendo usado
    const isUsed = component.dependencies.some(dep => isFileInUse(dep));

    if (isUsed) {
      console.log(
        `⚠️ ${component.name} ainda está sendo usado. Pulando remoção.`
      );
      return;
    }

    console.log(`✅ ${component.name} não está sendo usado. Removendo...`);

    // Criar backups
    component.dependencies.forEach(dep => {
      if (fs.existsSync(dep)) {
        const backupPath = createBackup(dep);
        console.log(`💾 Backup criado: ${backupPath}`);
      }
    });

    // Remover arquivos
    component.dependencies.forEach(dep => {
      if (fs.existsSync(dep)) {
        removeFile(dep);
      }
    });

    // Remover diretório se vazio
    if (fs.existsSync(component.path)) {
      const files = fs.readdirSync(component.path);
      if (files.length === 0) {
        removeDirectory(component.path);
      }
    }
  });

  console.log('\n🧹 Limpeza pós-remoção...');
  cleanUnusedImports();
  checkUnusedDependencies();

  console.log('\n🔨 Validação final...');
  validateBuild();

  console.log('\n🎉 Remoção de código legado finalizada!');
}

// Executar remoção
removeLegacyCode();
