#!/usr/bin/env node

/**
 * Script para validar nomenclatura de arquivos e pastas
 * Garante que todos os arquivos sigam os padrões estabelecidos
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para verificar se arquivo segue as regras
function validateFileNaming(filePath) {
  const errors = [];
  const fileName = path.basename(filePath);
  const dirName = path.dirname(filePath);
  const relativePath = path.relative('src', filePath);

  // Verificar se contém palavras proibidas
  const forbiddenWords = [
    'test',
    'spec',
    'mock',
    'stub',
    'temp',
    'tmp',
    'backup',
    'old',
    'new',
    'copy',
    'duplicate',
  ];
  forbiddenWords.forEach(word => {
    if (fileName.toLowerCase().includes(word)) {
      errors.push(`🚫 Palavra proibida "${word}" no nome do arquivo`);
    }
  });

  // Verificar se contém caracteres proibidos (exceto pontos e hífens)
  if (/[^a-zA-Z0-9.-]/.test(fileName)) {
    errors.push('🚫 Caracteres especiais proibidos no nome do arquivo');
  }

  // Verificar regras específicas por tipo de arquivo
  if (filePath.includes('/components/')) {
    if (
      !/^src\/components\/[A-Z][a-zA-Z0-9]*\/index\.tsx$/.test(relativePath)
    ) {
      errors.push('🚫 Componente deve estar em pasta PascalCase/index.tsx');
      errors.push('💡 Exemplo correto: src/components/UserProfile/index.tsx');
    }
  } else if (filePath.includes('/pages/')) {
    if (!/^src\/pages\/[a-z][a-zA-Z0-9]*\.tsx$/.test(relativePath)) {
      errors.push('🚫 Página deve estar em camelCase.tsx');
      errors.push('💡 Exemplo correto: src/pages/userProfile.tsx');
    }
  } else if (filePath.includes('/utils/')) {
    if (!/^src\/utils\/[a-z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Utilitário deve estar em camelCase.ts');
      errors.push('💡 Exemplo correto: src/utils/cpfValidator.ts');
    }
  } else if (filePath.includes('/styles/')) {
    if (!/^src\/styles\/[A-Z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Estilo deve estar em PascalCase.ts');
      errors.push('💡 Exemplo correto: src/styles/GlobalStyle.ts');
    }
  } else if (filePath.includes('/hooks/')) {
    if (!/^src\/hooks\/use[A-Z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Hook deve estar em usePascalCase.ts');
      errors.push('💡 Exemplo correto: src/hooks/useAuth.ts');
    }
  } else if (filePath.includes('/contexts/')) {
    if (!/^src\/contexts\/[A-Z][a-zA-Z0-9]*Context\.ts$/.test(relativePath)) {
      errors.push('🚫 Contexto deve estar em PascalCaseContext.ts');
      errors.push('💡 Exemplo correto: src/contexts/AuthContext.ts');
    }
  } else if (filePath === 'src/types.ts') {
    if (!/^src\/types\.ts$/.test(relativePath)) {
      errors.push('🚫 Arquivo de tipos deve ser types.ts');
      errors.push('💡 Exemplo correto: src/types.ts');
    }
  }

  return errors;
}

// Função para verificar se pasta segue as regras
function validateFolderNaming(folderPath) {
  const errors = [];
  const folderName = path.basename(folderPath);
  const relativePath = path.relative('src', folderPath);

  // Verificar se contém palavras proibidas
  const forbiddenWords = [
    'test',
    'spec',
    'mock',
    'stub',
    'temp',
    'tmp',
    'backup',
    'old',
    'new',
    'copy',
    'duplicate',
  ];
  forbiddenWords.forEach(word => {
    if (folderName.toLowerCase().includes(word)) {
      errors.push(`🚫 Palavra proibida "${word}" no nome da pasta`);
    }
  });

  // Verificar se contém caracteres proibidos
  if (/[^a-zA-Z0-9]/.test(folderName)) {
    errors.push('🚫 Caracteres especiais proibidos no nome da pasta');
  }

  // Verificar regras específicas por tipo de pasta
  if (folderPath.includes('/components/')) {
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(folderName)) {
      errors.push('🚫 Pasta de componente deve estar em PascalCase');
      errors.push('💡 Exemplo: UserProfile, Button, Modal');
    }
  } else if (folderPath.includes('/pages/')) {
    // Páginas não devem ter subpastas (exceto _app.tsx, _document.tsx)
    if (folderName !== 'pages' && !folderName.startsWith('_')) {
      errors.push('🚫 Páginas não devem ter subpastas');
    }
  } else if (folderPath.includes('/utils/')) {
    // Utilitários não devem ter subpastas
    if (folderName !== 'utils') {
      errors.push('🚫 Utilitários não devem ter subpastas');
    }
  } else if (folderPath.includes('/styles/')) {
    // Estilos não devem ter subpastas
    if (folderName !== 'styles') {
      errors.push('🚫 Estilos não devem ter subpastas');
    }
  } else if (folderPath.includes('/hooks/')) {
    // Hooks não devem ter subpastas
    if (folderName !== 'hooks') {
      errors.push('🚫 Hooks não devem ter subpastas');
    }
  } else if (folderPath.includes('/contexts/')) {
    // Contextos não devem ter subpastas
    if (folderName !== 'contexts') {
      errors.push('🚫 Contextos não devem ter subpastas');
    }
  }

  return errors;
}

// Função para percorrer arquivos e pastas de forma segura
function walkDirectory(dir, callback, visited = new Set()) {
  // Evitar loops infinitos
  if (visited.has(dir)) {
    return;
  }
  visited.add(dir);

  try {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (
        stat.isDirectory() &&
        !file.startsWith('.') &&
        file !== 'node_modules'
      ) {
        // Verificar pasta
        callback(filePath, 'folder');
        // Continuar recursivamente
        walkDirectory(filePath, callback, visited);
      } else if (
        stat.isFile() &&
        (file.endsWith('.tsx') || file.endsWith('.ts'))
      ) {
        // Verificar arquivo
        callback(filePath, 'file');
      }
    });
  } catch (error) {
    // Ignorar erros de permissão ou arquivos inacessíveis
    return;
  }
}

// Função principal de validação
function validateFileNaming() {
  log('blue', '🔍 Verificando nomenclatura de arquivos e pastas...\n');

  let totalErrors = 0;
  let totalFiles = 0;
  let totalFolders = 0;

  walkDirectory('src', (itemPath, type) => {
    if (type === 'file') {
      totalFiles++;
      const errors = validateFileNaming(itemPath);

      if (errors.length > 0) {
        log('red', `\n📁 ${itemPath}:`);
        errors.forEach(error => {
          log('red', `  ${error}`);
          totalErrors++;
        });
      }
    } else if (type === 'folder') {
      totalFolders++;
      const errors = validateFolderNaming(itemPath);

      if (errors.length > 0) {
        log('red', `\n📂 ${itemPath}:`);
        errors.forEach(error => {
          log('red', `  ${error}`);
          totalErrors++;
        });
      }
    }
  });

  // Resultado final
  log('blue', '\n' + '='.repeat(50));
  log('blue', '📊 RESULTADO DA VALIDAÇÃO DE NOMENCLATURA:');
  log('blue', '='.repeat(50));

  log('blue', `Total de arquivos verificados: ${totalFiles}`);
  log('blue', `Total de pastas verificadas: ${totalFolders}`);
  log('blue', `Total de erros encontrados: ${totalErrors}`);

  if (totalErrors === 0) {
    log('green', '\n🎉 SUCESSO!');
    log(
      'green',
      '✅ Todos os arquivos e pastas seguem as regras de nomenclatura!'
    );
    log('green', '✅ Projeto está em conformidade com os padrões!');
    process.exit(0);
  } else {
    log('red', '\n🚨 FALHA!');
    log(
      'red',
      '❌ Alguns arquivos/pastas não seguem as regras de nomenclatura!'
    );
    log('yellow', '\n💡 Corrija os problemas e rode novamente.');
    process.exit(1);
  }
}

// Executa validação
if (require.main === module) {
  validateFileNaming();
}

module.exports = { validateFileNaming };
