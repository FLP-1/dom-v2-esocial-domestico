const fs = require('fs');
const path = require('path');

// Função para converter estilos inline em styled-components
function convertInlineStyles(content) {
  // Padrão para encontrar estilos inline
  const inlineStyleRegex = /style=\{\{([^}]+)\}\}/g;

  let convertedContent = content;
  let styledComponentCounter = 1;

  // Encontrar todos os estilos inline
  const matches = [...content.matchAll(inlineStyleRegex)];

  if (matches.length === 0) {
    return { content: convertedContent, hasChanges: false };
  }

  // Criar styled components para cada estilo encontrado
  const styledComponents = [];
  const replacements = [];

  matches.forEach((match, index) => {
    const fullMatch = match[0];
    const styleContent = match[1];

    // Limpar e processar o conteúdo do estilo
    const cleanStyle = styleContent
      .replace(/['"]/g, '')
      .replace(/,/g, ';')
      .trim();

    // Criar nome do styled component
    const componentName = `StyledComponent${styledComponentCounter}`;
    styledComponentCounter++;

    // Criar o styled component
    const styledComponent = `const ${componentName} = styled.div\`
  ${cleanStyle}
\`;`;

    styledComponents.push(styledComponent);
    replacements.push({
      original: fullMatch,
      replacement: `as={${componentName}}`,
    });
  });

  // Aplicar as substituições
  replacements.forEach(({ original, replacement }) => {
    convertedContent = convertedContent.replace(original, replacement);
  });

  // Adicionar os styled components no topo do arquivo (após imports)
  if (styledComponents.length > 0) {
    const importEndIndex = convertedContent.lastIndexOf('import');
    const nextLineAfterImports =
      convertedContent.indexOf('\n', importEndIndex) + 1;

    const styledComponentsCode = '\n' + styledComponents.join('\n\n') + '\n\n';
    convertedContent =
      convertedContent.slice(0, nextLineAfterImports) +
      styledComponentsCode +
      convertedContent.slice(nextLineAfterImports);
  }

  return { content: convertedContent, hasChanges: true };
}

// Função para processar um arquivo
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const result = convertInlineStyles(content);

    if (result.hasChanges) {
      // Criar backup
      const backupPath = `${filePath}.backup-${Date.now()}`;
      fs.writeFileSync(backupPath, content);
      console.log(`✅ Backup criado: ${backupPath}`);

      // Salvar arquivo modificado
      fs.writeFileSync(filePath, result.content);
      console.log(`✅ Estilos inline convertidos em: ${filePath}`);
      return true;
    } else {
      console.log(`ℹ️  Nenhum estilo inline encontrado em: ${filePath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    return false;
  }
}

// Função para encontrar arquivos .tsx e .jsx
function findReactFiles(dir) {
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
        (item.endsWith('.tsx') || item.endsWith('.jsx'))
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
  console.log('🔧 Iniciando correção de estilos inline...\n');

  const srcDir = path.join(__dirname, '..', 'src');
  const reactFiles = findReactFiles(srcDir);

  console.log(
    `📁 Encontrados ${reactFiles.length} arquivos React para verificar\n`
  );

  let processedCount = 0;
  let changedCount = 0;

  for (const filePath of reactFiles) {
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
    console.log(`\n✅ Correção de estilos inline concluída!`);
    console.log(
      `💡 Recomendação: Execute 'npm run build' para verificar se não há erros.`
    );
  } else {
    console.log(`\n✅ Nenhum estilo inline encontrado para corrigir.`);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  main();
}

module.exports = { convertInlineStyles, processFile, findReactFiles };
