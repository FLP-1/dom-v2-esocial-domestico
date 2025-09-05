#!/usr/bin/env node

/**
 * Script de validação rigorosa das regras do projeto DOM v2
 * Executa verificações que garantem conformidade com as regras estabelecidas
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

// Regras estritas
const STRICT_RULES = {
  // Bibliotecas proibidas
  forbiddenLibraries: [
    '@mui/material',
    '@mui/icons-material',
    'antd',
    'react-bootstrap',
    'bootstrap',
    'tailwindcss',
    'emotion',
    'jss',
  ],

  // Extensões proibidas
  forbiddenExtensions: ['.css', '.scss', '.sass', '.less'],

  // Padrões obrigatórios
  requiredPatterns: {
    components: /^src\/components\/[A-Z][a-zA-Z0-9]*\/index\.tsx$/,
    pages: /^src\/pages\/[a-z][a-zA-Z0-9]*\.tsx$/,
    utils: /^src\/utils\/[a-z][a-zA-Z0-9]*\.ts$/,
  },

  // Imports obrigatórios para componentes
  requiredImports: {
    styled: 'styled-components',
    react: 'react',
  },
};

// Função para log colorido
function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para verificar se arquivo contém biblioteca proibida
function checkForbiddenLibraries(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    STRICT_RULES.forbiddenLibraries.forEach(lib => {
      if (content.includes(lib)) {
        errors.push(`🚫 Biblioteca proibida encontrada: ${lib}`);
      }
    });

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Função para verificar se arquivo usa CSS puro
function checkCSSUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Verifica se usa className
    if (content.includes('className=')) {
      errors.push('🚫 className encontrado - use styled-components');
    }

    // Verifica se importa CSS
    if (content.includes("import '") && content.includes('.css')) {
      errors.push('🚫 Import de CSS encontrado - use styled-components');
    }

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Função para verificar estrutura de componentes
function checkComponentStructure(filePath) {
  const errors = [];

  // Verifica se está na pasta correta
  if (filePath.includes('/components/')) {
    const fileName = path.basename(filePath);
    const dirName = path.basename(path.dirname(filePath));

    if (fileName !== 'index.tsx') {
      errors.push('🚫 Componente deve estar em pasta/index.tsx');
    }

    if (!/^[A-Z]/.test(dirName)) {
      errors.push('🚫 Nome da pasta do componente deve começar com maiúscula');
    }
  }

  return errors;
}

// Função para verificar se usa TypeScript corretamente
function checkTypeScriptUsage(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    // Verifica se usa any
    if (content.includes(': any') || content.includes('<any>')) {
      errors.push('🚫 Uso de "any" encontrado - use tipagem específica');
    }

    // Verifica se tem interface para props
    if (content.includes('interface') && !content.includes('Props')) {
      errors.push('🚫 Interface sem sufixo "Props" encontrada');
    }

    return errors;
  } catch (error) {
    return [`❌ Erro ao ler arquivo: ${error.message}`];
  }
}

// Função para percorrer arquivos recursivamente
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

// Função principal de validação
function validateProject() {
  log('blue', '🔍 Iniciando validação rigorosa das regras...\n');

  let totalErrors = 0;
  let totalFiles = 0;

  // Percorre todos os arquivos TypeScript/TSX
  walkDirectory('src', filePath => {
    totalFiles++;
    const errors = [];

    // Verifica bibliotecas proibidas
    errors.push(...checkForbiddenLibraries(filePath));

    // Verifica uso de CSS
    errors.push(...checkCSSUsage(filePath));

    // Verifica estrutura de componentes
    errors.push(...checkComponentStructure(filePath));

    // Verifica uso de TypeScript
    errors.push(...checkTypeScriptUsage(filePath));

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
  log('blue', '📊 RESULTADO DA VALIDAÇÃO:');
  log('blue', '='.repeat(50));

  if (totalErrors === 0) {
    log('green', `✅ SUCESSO: ${totalFiles} arquivos validados sem erros!`);
    log('green', '🎉 Projeto está em conformidade com todas as regras!');
    process.exit(0);
  } else {
    log(
      'red',
      `❌ FALHA: ${totalErrors} erros encontrados em ${totalFiles} arquivos`
    );
    log('red', '🚨 Projeto NÃO está em conformidade com as regras!');
    log('yellow', '\n💡 Execute as correções necessárias e rode novamente.');
    process.exit(1);
  }
}

// Executa validação
if (require.main === module) {
  validateProject();
}

module.exports = { validateProject };
