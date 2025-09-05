#!/usr/bin/env node

/**
 * Script para prevenir erros de sintaxe comuns
 * Detecta e bloqueia padrões problemáticos antes que causem erros
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

// Verifica erros de sintaxe comuns
function checkSyntaxErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Padrões de erro de sintaxe comuns
    const syntaxPatterns = [
      // Chaves não fechadas
      {
        pattern: /{/g,
        message: 'Chave aberta',
        check: content => {
          const openBraces = (content.match(/{/g) || []).length;
          const closeBraces = (content.match(/}/g) || []).length;
          return openBraces !== closeBraces ? 'Chaves não balanceadas' : null;
        },
      },

      // Parênteses não fechados
      {
        pattern: /\(/g,
        message: 'Parêntese aberto',
        check: content => {
          const openParens = (content.match(/\(/g) || []).length;
          const closeParens = (content.match(/\)/g) || []).length;
          return openParens !== closeParens
            ? 'Parênteses não balanceados'
            : null;
        },
      },

      // Colchetes não fechados
      {
        pattern: /\[/g,
        message: 'Colchete aberto',
        check: content => {
          const openBrackets = (content.match(/\[/g) || []).length;
          const closeBrackets = (content.match(/\]/g) || []).length;
          return openBrackets !== closeBrackets
            ? 'Colchetes não balanceados'
            : null;
        },
      },

      // Aspas não fechadas
      {
        pattern: /"/g,
        message: 'Aspa dupla',
        check: content => {
          const quotes = (content.match(/"/g) || []).length;
          return quotes % 2 !== 0 ? 'Aspas duplas não balanceadas' : null;
        },
      },

      // Aspas simples não fechadas
      {
        pattern: /'/g,
        message: 'Aspa simples',
        check: content => {
          const quotes = (content.match(/'/g) || []).length;
          return quotes % 2 !== 0 ? 'Aspas simples não balanceadas' : null;
        },
      },

      // Template literals não fechados
      {
        pattern: /`/g,
        message: 'Template literal',
        check: content => {
          const backticks = (content.match(/`/g) || []).length;
          return backticks % 2 !== 0
            ? 'Template literals não balanceados'
            : null;
        },
      },

      // Ponto e vírgula ausente em declarações
      {
        pattern: /(?:^|\n)\s*(?:const|let|var|import|export)\s+[^;]+$/gm,
        message: 'Ponto e vírgula ausente em declaração',
      },

      // Vírgula ausente em objetos
      { pattern: /{\s*[^}]*[^,]\s*}/g, message: 'Vírgula ausente em objeto' },

      // Vírgula ausente em arrays
      { pattern: /\[\s*[^\]]*[^,]\s*\]/g, message: 'Vírgula ausente em array' },
    ];

    syntaxPatterns.forEach(({ pattern, message, check }) => {
      if (check) {
        const error = check(content);
        if (error) {
          errors.push(`🚫 ${error}`);
        }
      } else {
        const matches = content.match(pattern);
        if (matches) {
          matches.forEach(() => {
            errors.push(`🚫 ${message}`);
          });
        }
      }
    });

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Verifica imports malformados
function checkImportErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Padrões de import problemáticos
    const importPatterns = [
      // Import sem from
      {
        pattern: /import\s+[^'"]*['"][^'"]*['"]\s*(?!from)/g,
        message: 'Import sem "from"',
      },

      // Import com caminho relativo incorreto
      {
        pattern: /import.*from\s+['"][^'"]*\.\.\/\.\.\/\.\./g,
        message: 'Import com muitos "../" - use alias',
      },

      // Import de arquivo inexistente
      {
        pattern: /import.*from\s+['"][^'"]*['"]/g,
        message: 'Verificar se arquivo importado existe',
      },
    ];

    importPatterns.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(() => {
          errors.push(`🚫 ${message}`);
        });
      }
    });

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Verifica exports malformados
function checkExportErrors(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Padrões de export problemáticos
    const exportPatterns = [
      // Export sem nome
      { pattern: /export\s+{\s*}/g, message: 'Export vazio' },

      // Export default sem valor
      {
        pattern: /export\s+default\s*;$/gm,
        message: 'Export default sem valor',
      },

      // Export duplicado
      {
        pattern: /export\s+default/g,
        message: 'Verificar se há apenas um export default',
      },
    ];

    exportPatterns.forEach(({ pattern, message }) => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(() => {
          errors.push(`🚫 ${message}`);
        });
      }
    });

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Função para percorrer arquivos
function walkDirectory(dir, callback) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (
      stat.isDirectory() &&
      !file.startsWith('.') &&
      file !== 'node_modules'
    ) {
      walkDirectory(filePath, callback);
    } else if (
      stat.isFile() &&
      (file.endsWith('.tsx') || file.endsWith('.ts'))
    ) {
      callback(filePath);
    }
  });
}

// Função principal
function preventSyntaxErrors() {
  log('blue', '🔍 Verificando erros de sintaxe...\n');

  let totalErrors = 0;
  let totalFiles = 0;

  walkDirectory('src', filePath => {
    totalFiles++;
    const errors = [];

    // Verifica erros de sintaxe
    errors.push(...checkSyntaxErrors(filePath));

    // Verifica erros de import
    errors.push(...checkImportErrors(filePath));

    // Verifica erros de export
    errors.push(...checkExportErrors(filePath));

    if (errors.length > 0) {
      log('red', `\n📁 ${filePath}:`);
      errors.forEach(error => {
        log('red', `  ${error}`);
        totalErrors++;
      });
    }
  });

  // Resultado final
  log('blue', '\n' + '='.repeat(50));
  log('blue', '📊 RESULTADO DA VERIFICAÇÃO:');
  log('blue', '='.repeat(50));

  if (totalErrors === 0) {
    log(
      'green',
      `✅ SUCESSO: ${totalFiles} arquivos verificados sem erros de sintaxe!`
    );
    log('green', '🎉 Projeto está livre de erros de sintaxe!');
    process.exit(0);
  } else {
    log(
      'red',
      `❌ FALHA: ${totalErrors} erros de sintaxe encontrados em ${totalFiles} arquivos`
    );
    log('red', '🚨 Projeto contém erros de sintaxe!');
    log('yellow', '\n💡 Corrija os erros e rode novamente.');
    process.exit(1);
  }
}

// Executa verificação
if (require.main === module) {
  preventSyntaxErrors();
}

module.exports = { preventSyntaxErrors };
