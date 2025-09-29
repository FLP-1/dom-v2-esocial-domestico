const fs = require('fs');
const path = require('path');

// Função para remover console.log de um arquivo
function removeConsoleLogs(content) {
  // Padrões para encontrar console.log
  const consoleLogPatterns = [
    // console.log simples
    /console\.log\([^)]*\);/g,
    // console.log com múltiplas linhas
    /console\.log\(\s*[^)]*\s*\);/g,
    // console.log com template literals
    /console\.log\(`[^`]*`\);/g,
    // console.log com strings
    /console\.log\("[^"]*"\);/g,
    /console\.log\('[^']*'\);/g,
  ];

  let modifiedContent = content;
  let removedCount = 0;

  // Remover cada padrão
  consoleLogPatterns.forEach(pattern => {
    const matches = modifiedContent.match(pattern);
    if (matches) {
      removedCount += matches.length;
    }
    modifiedContent = modifiedContent.replace(pattern, '');
  });

  // Limpar linhas vazias extras
  modifiedContent = modifiedContent.replace(/\n\s*\n\s*\n/g, '\n\n');

  return {
    content: modifiedContent,
    hasChanges: removedCount > 0,
    removedCount,
  };
}

// Função para processar um arquivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = removeConsoleLogs(content);

    if (result.hasChanges) {
      // Criar backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`✅ Backup criado: ${backupPath}`);

      // Salvar arquivo modificado
      fs.writeFileSync(filePath, result.content);
      console.log(
        `✅ ${result.removedCount} console.log removidos de: ${filePath}`
      );
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

// Função para encontrar arquivos .ts, .tsx, .js, .jsx
function findSourceFiles(dir) {
  const files = [];

  function traverse(currentDir) {
    const items = fs.readdirSync(currentDir);

    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);

      if (
        stat.isDirectory() &&
        !item.startsWith('.') &&
        item !== 'node_modules'
      ) {
        traverse(fullPath);
      } else if (
        stat.isFile() &&
        (item.endsWith('.ts') ||
          item.endsWith('.tsx') ||
          item.endsWith('.js') ||
          item.endsWith('.jsx'))
      ) {
        files.push(fullPath);
      }
    }
  }

  traverse(dir);
  return files;
}

// Função principal
function main() {
  console.log('🧹 Iniciando remoção de console.log...\n');

  const srcDir = path.join(__dirname, '..', 'src');
  const sourceFiles = findSourceFiles(srcDir);

  console.log(`📁 Encontrados ${sourceFiles.length} arquivos para verificar\n`);

  let processedCount = 0;
  let changedCount = 0;
  let totalRemoved = 0;

  for (const filePath of sourceFiles) {
    console.log(`🔍 Verificando: ${path.relative(process.cwd(), filePath)}`);

    if (processFile(filePath)) {
      changedCount++;
    }
    processedCount++;
  }

  console.log(`\n📊 Resumo:`);
  console.log(`   • Arquivos verificados: ${processedCount}`);
  console.log(`   • Arquivos modificados: ${changedCount}`);
  console.log(`   • Arquivos sem alterações: ${processedCount - changedCount}`);

  if (changedCount > 0) {
    console.log(`\n✅ Remoção de console.log concluída!`);
    console.log(
      `💡 Recomendação: Execute 'npm run build' para verificar se não há erros.`
    );
  } else {
    console.log(`\n✅ Nenhum console.log encontrado para remover.`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { removeConsoleLogs, processFile, findSourceFiles };
