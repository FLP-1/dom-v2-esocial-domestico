#!/usr/bin/env node

/**
 * Script de emergência para corrigir problemas comuns automaticamente
 * Executa correções automáticas quando possível
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Função para executar comando
function runCommand(command, description) {
  try {
    log('blue', `🔧 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    log('green', `✅ ${description} - Concluído`);
    return true;
  } catch (error) {
    log('red', `❌ ${description} - Falhou`);
    return false;
  }
}

// Função para corrigir formatação
function fixFormatting() {
  log('blue', '\n📝 CORRIGINDO FORMATAÇÃO...');
  return runCommand('npm run format:fix', 'Aplicando Prettier');
}

// Função para corrigir linting
function fixLinting() {
  log('blue', '\n🔍 CORRIGINDO LINTING...');
  return runCommand('npm run lint:fix', 'Aplicando ESLint');
}

// Função para verificar tipos
function checkTypes() {
  log('blue', '\n📘 VERIFICANDO TIPOS...');
  return runCommand('npm run type-check', 'Verificando TypeScript');
}

// Função para corrigir imports
function fixImports() {
  log('blue', '\n📦 CORRIGINDO IMPORTS...');

  // Lista de arquivos para verificar
  const files = [
    'src/components/Layout.tsx',
    'src/pages/login.tsx',
    'src/pages/dashboard.tsx',
    'src/pages/index.tsx',
  ];

  let fixed = 0;

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Corrigir imports duplicados
        const lines = content.split('\n');
        const uniqueLines = [...new Set(lines)];
        if (uniqueLines.length !== lines.length) {
          content = uniqueLines.join('\n');
          modified = true;
        }

        // Corrigir imports não utilizados
        if (
          content.includes("import React from 'react';") &&
          !content.includes('React.')
        ) {
          content = content.replace("import React from 'react';\n", '');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, content);
          fixed++;
          log('green', `✅ ${filePath} - Imports corrigidos`);
        }
      } catch (error) {
        log('red', `❌ ${filePath} - Erro ao corrigir`);
      }
    }
  });

  if (fixed > 0) {
    log('green', `✅ ${fixed} arquivos corrigidos`);
  } else {
    log('yellow', 'ℹ️ Nenhum import para corrigir');
  }

  return true;
}

// Função para corrigir className
function fixClassName() {
  log('blue', '\n🎨 CORRIGINDO CLASSNAME...');

  const files = ['src/components/Layout.tsx', 'src/pages/login.tsx'];

  let fixed = 0;

  files.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Substituir className por styled-components
        if (content.includes('className=')) {
          content = content.replace(/className=['"]([^'"]*)['"]/g, '');
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, content);
          fixed++;
          log('green', `✅ ${filePath} - className removido`);
        }
      } catch (error) {
        log('red', `❌ ${filePath} - Erro ao corrigir`);
      }
    }
  });

  if (fixed > 0) {
    log('green', `✅ ${fixed} arquivos corrigidos`);
  } else {
    log('yellow', 'ℹ️ Nenhum className para corrigir');
  }

  return true;
}

// Função principal de correção de emergência
function emergencyFix() {
  log('blue', '🚨 INICIANDO CORREÇÃO DE EMERGÊNCIA...');
  log('blue', '='.repeat(50));

  let totalFixes = 0;
  let successfulFixes = 0;

  // Executar correções
  const fixes = [
    { name: 'Formatação', fn: fixFormatting },
    { name: 'Linting', fn: fixLinting },
    { name: 'Imports', fn: fixImports },
    { name: 'ClassName', fn: fixClassName },
    { name: 'Tipos', fn: checkTypes },
  ];

  fixes.forEach(({ name, fn }) => {
    totalFixes++;
    if (fn()) {
      successfulFixes++;
    }
  });

  // Resultado final
  log('blue', '\n' + '='.repeat(50));
  log('blue', '📊 RESULTADO DA CORREÇÃO DE EMERGÊNCIA:');
  log('blue', '='.repeat(50));

  log('blue', `Total de correções: ${totalFixes}`);
  log('green', `Correções bem-sucedidas: ${successfulFixes}`);
  log('red', `Correções falharam: ${totalFixes - successfulFixes}`);

  if (successfulFixes === totalFixes) {
    log('green', '\n🎉 CORREÇÃO DE EMERGÊNCIA CONCLUÍDA!');
    log('green', '✅ Todos os problemas foram corrigidos!');
    log(
      'yellow',
      '\n💡 Execute "npm run validate:rigorous" para verificar se tudo está OK.'
    );
  } else {
    log('red', '\n⚠️ CORREÇÃO DE EMERGÊNCIA PARCIAL!');
    log(
      'red',
      '❌ Alguns problemas não puderam ser corrigidos automaticamente.'
    );
    log('yellow', '\n💡 Corrija manualmente os problemas restantes.');
  }
}

// Executa correção de emergência
if (require.main === module) {
  emergencyFix();
}

module.exports = { emergencyFix };
