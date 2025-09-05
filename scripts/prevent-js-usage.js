#!/usr/bin/env node

/**
 * Script para prevenir uso de JavaScript puro
 * Bloqueia criação de arquivos .js e força uso de TypeScript
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

// Verifica se arquivo contém JavaScript puro
function checkJavaScriptUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Padrões de JavaScript puro que devem ser evitados
    const jsPatterns = [
      // Declarações de variáveis sem tipo
      {
        pattern: /(?:^|\s)(var|let|const)\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*[=:]/gm,
        message: 'Variável sem tipagem TypeScript',
      },

      // Funções sem tipagem
      {
        pattern: /function\s+[a-zA-Z_$][a-zA-Z0-9_$]*\s*\([^)]*\)\s*{/g,
        message: 'Função sem tipagem TypeScript',
      },

      // Arrow functions sem tipagem
      {
        pattern: /\([^)]*\)\s*=>\s*{/g,
        message: 'Arrow function sem tipagem TypeScript',
      },

      // Uso de any
      {
        pattern: /:\s*any\b/g,
        message: 'Uso de "any" - use tipagem específica',
      },

      // Uso de @ts-ignore
      {
        pattern: /@ts-ignore/g,
        message: 'Uso de @ts-ignore - corrija o erro de tipo',
      },

      // Uso de console.log em produção
      {
        pattern: /console\.(log|warn|error|info)/g,
        message: 'console.log encontrado - use toast ou logger',
      },
    ];

    jsPatterns.forEach(({ pattern, message }) => {
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

// Verifica se arquivo tem extensão .js
function checkFileExtension(filePath) {
  const errors = [];

  if (filePath.endsWith('.js') && !filePath.includes('node_modules')) {
    errors.push('🚫 Arquivo .js encontrado - use .ts ou .tsx');
  }

  return errors;
}

// Verifica se arquivo tem imports de JavaScript
function checkJavaScriptImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Verifica imports de arquivos .js
    const jsImportPattern = /import.*from\s+['"][^'"]*\.js['"]/g;
    const matches = content.match(jsImportPattern);

    if (matches) {
      matches.forEach(() => {
        errors.push('🚫 Import de arquivo .js encontrado - use .ts ou .tsx');
      });
    }

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
      (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js'))
    ) {
      callback(filePath);
    }
  });
}

// Função principal
function preventJavaScriptUsage() {
  log('blue', '🔍 Verificando uso de JavaScript puro...\n');

  let totalErrors = 0;
  let totalFiles = 0;

  walkDirectory('src', filePath => {
    totalFiles++;
    const errors = [];

    // Verifica extensão do arquivo
    errors.push(...checkFileExtension(filePath));

    // Verifica uso de JavaScript
    errors.push(...checkJavaScriptUsage(filePath));

    // Verifica imports de JavaScript
    errors.push(...checkJavaScriptImports(filePath));

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
      `✅ SUCESSO: ${totalFiles} arquivos verificados sem uso de JavaScript!`
    );
    log('green', '🎉 Projeto está usando apenas TypeScript!');
    process.exit(0);
  } else {
    log(
      'red',
      `❌ FALHA: ${totalErrors} usos de JavaScript encontrados em ${totalFiles} arquivos`
    );
    log('red', '🚨 Projeto contém JavaScript puro!');
    log('yellow', '\n💡 Converta para TypeScript e rode novamente.');
    process.exit(1);
  }
}

// Executa verificação
if (require.main === module) {
  preventJavaScriptUsage();
}

module.exports = { preventJavaScriptUsage };
