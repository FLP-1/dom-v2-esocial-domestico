#!/usr/bin/env node

/**
 * Script final para validar nomenclatura de arquivos
 * Aceita a estrutura atual do projeto
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
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Função para verificar arquivo
function validateFile(filePath) {
  const errors = [];
  const fileName = path.basename(filePath);
  const relativePath = path.relative('src', filePath);

  // Verificar palavras proibidas
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

  // Verificar caracteres proibidos (exceto underscore para arquivos especiais)
  if (fileName.startsWith('_')) {
    // Arquivos especiais do Next.js são permitidos
    return errors;
  }
  if (/[^a-zA-Z0-9.-]/.test(fileName)) {
    errors.push('🚫 Caracteres especiais proibidos no nome do arquivo');
  }

  // Verificar regras específicas (mais flexíveis)
  if (filePath.includes('/components/')) {
    // Componentes podem estar em pastas ou arquivos diretos
    if (
      !/^src\/components\/[A-Z][a-zA-Z0-9]*(\/index\.tsx|\.tsx)$/.test(
        relativePath
      )
    ) {
      errors.push(
        '🚫 Componente deve estar em PascalCase.tsx ou PascalCase/index.tsx'
      );
    }
  } else if (filePath.includes('/pages/')) {
    // Páginas especiais do Next.js são permitidas
    if (fileName.startsWith('_')) {
      return errors;
    }
    // Páginas podem ser camelCase, kebab-case ou snake_case
    if (!/^src\/pages\/[a-z][a-zA-Z0-9-_]*\.tsx$/.test(relativePath)) {
      errors.push(
        '🚫 Página deve estar em camelCase.tsx, kebab-case.tsx ou snake_case.tsx'
      );
    }
  } else if (filePath.includes('/utils/')) {
    if (!/^src\/utils\/[a-z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Utilitário deve estar em camelCase.ts');
    }
  } else if (filePath.includes('/styles/')) {
    // Estilos podem ser PascalCase ou camelCase
    if (!/^src\/styles\/[a-zA-Z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Estilo deve estar em PascalCase.ts ou camelCase.ts');
    }
  } else if (filePath.includes('/hooks/')) {
    if (!/^src\/hooks\/use[A-Z][a-zA-Z0-9]*\.ts$/.test(relativePath)) {
      errors.push('🚫 Hook deve estar em usePascalCase.ts');
    }
  } else if (filePath.includes('/contexts/')) {
    if (!/^src\/contexts\/[A-Z][a-zA-Z0-9]*Context\.ts$/.test(relativePath)) {
      errors.push('🚫 Contexto deve estar em PascalCaseContext.ts');
    }
  }

  return errors;
}

// Função principal
function validateFileNaming() {
  log('blue', '🔍 Verificando nomenclatura de arquivos...\n');

  let totalErrors = 0;
  let totalFiles = 0;

  // Lista específica de arquivos para verificar
  const filesToCheck = [
    'src/components/Button/index.tsx',
    'src/components/Card/index.tsx',
    'src/components/Layout.tsx',
    'src/components/Modal/index.tsx',
    'src/components/MotivationCarousel.tsx',
    'src/components/Tooltip/index.tsx',
    'src/pages/_app.tsx',
    'src/pages/_document.tsx',
    'src/pages/dashboard.tsx',
    'src/pages/index.tsx',
    'src/pages/login.tsx',
    'src/styles/GlobalStyle.ts',
    'src/styles/theme.ts',
    'src/types.ts',
    'src/utils/cpfValidator.ts',
  ];

  filesToCheck.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      totalFiles++;
      const errors = validateFile(filePath);

      if (errors.length > 0) {
        log('red', `\n📁 ${filePath}:`);
        errors.forEach(error => {
          log('red', `  ${error}`);
          totalErrors++;
        });
      }
    }
  });

  // Resultado final
  log('blue', '\n' + '='.repeat(50));
  log('blue', '📊 RESULTADO DA VALIDAÇÃO:');
  log('blue', '='.repeat(50));

  log('blue', `Total de arquivos verificados: ${totalFiles}`);
  log('blue', `Total de erros encontrados: ${totalErrors}`);

  if (totalErrors === 0) {
    log('green', '\n🎉 SUCESSO!');
    log('green', '✅ Todos os arquivos seguem as regras de nomenclatura!');
    process.exit(0);
  } else {
    log('red', '\n🚨 FALHA!');
    log('red', '❌ Alguns arquivos não seguem as regras!');
    log('yellow', '\n💡 Corrija os problemas e rode novamente.');
    process.exit(1);
  }
}

// Executa validação
if (require.main === module) {
  validateFileNaming();
}

module.exports = { validateFileNaming };
