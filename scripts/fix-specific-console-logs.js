const fs = require('fs');
const path = require('path');

// Lista de arquivos específicos que sabemos que têm console.log
const filesToFix = [
  'src/components/EmployeeModal.tsx',
  'src/components/EmployerModal.tsx',
  'src/components/EmployerModalMultiStep.tsx',
  'src/pages/diagnostico-esocial.tsx',
  'src/pages/esocial-domestico-completo.tsx',
  'src/pages/esocial-integration.tsx',
];

// Função para remover console.log de forma mais específica
function removeConsoleLogsFromFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Padrões mais específicos para console.log
    let modifiedContent = content;
    let removedCount = 0;

    // Remover console.log simples
    const consoleLogPattern = /^\s*console\.log\([^)]*\);\s*$/gm;
    const matches = modifiedContent.match(consoleLogPattern);
    if (matches) {
      removedCount += matches.length;
      modifiedContent = modifiedContent.replace(consoleLogPattern, '');
    }

    // Remover console.error
    const consoleErrorPattern = /^\s*console\.error\([^)]*\);\s*$/gm;
    const errorMatches = modifiedContent.match(consoleErrorPattern);
    if (errorMatches) {
      removedCount += errorMatches.length;
      modifiedContent = modifiedContent.replace(consoleErrorPattern, '');
    }

    // Limpar linhas vazias extras
    modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (removedCount > 0) {
      // Criar backup
      const backupPath = `${filePath}.backup-console-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`✅ Backup criado: ${backupPath}`);

      // Salvar arquivo modificado
      fs.writeFileSync(filePath, modifiedContent);
      console.log(`✅ ${removedCount} console.log removidos de: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Nenhum console.log encontrado em: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função principal
function main() {
  console.log('🧹 Iniciando remoção ESPECÍFICA de console.log...\n');

  let processedCount = 0;
  let changedCount = 0;

  for (const filePath of filesToFix) {
    const fullPath = path.join(__dirname, '..', filePath);
    console.log(`🔍 Verificando: ${filePath}`);

    if (fs.existsSync(fullPath)) {
      if (removeConsoleLogsFromFile(fullPath)) {
        changedCount++;
      }
      processedCount++;
    } else {
      console.log(`⚠️  Arquivo não encontrado: ${filePath}`);
    }
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   • Arquivos verificados: ${processedCount}`);
  console.log(`   • Arquivos modificados: ${changedCount}`);
  console.log(`   • Arquivos sem alterações: ${processedCount - changedCount}`);

  if (changedCount > 0) {
    console.log(`\n✅ Remoção ESPECÍFICA de console.log concluída!`);
  } else {
    console.log(`\n✅ Nenhum console.log encontrado para remover.`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogsFromFile };
