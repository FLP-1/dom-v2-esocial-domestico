#!/usr/bin/env node

/**
 * Sistema de validação rigorosa que impede desvios
 * Executa todas as verificações e bloqueia se houver problemas
 */

const { execSync } = require('child_process');
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

// Função para executar comando e capturar output
function runCommand(command, description) {
  try {
    log('blue', `🔍 ${description}...`);
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log('green', `✅ ${description} - OK`);
    return { success: true, output };
  } catch (error) {
    log('red', `❌ ${description} - FALHOU`);
    log('red', error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

// Função para verificar se arquivo existe
function checkFileExists(filePath, description) {
  if (fs.existsSync(filePath)) {
    log('green', `✅ ${description} - Existe`);
    return true;
  } else {
    log('red', `❌ ${description} - Não encontrado`);
    return false;
  }
}

// Função para verificar se arquivo tem conteúdo
function checkFileContent(filePath, description, requiredContent) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes(requiredContent)) {
      log('green', `✅ ${description} - OK`);
      return true;
    } else {
      log('red', `❌ ${description} - Conteúdo ausente`);
      return false;
    }
  } catch (error) {
    log('red', `❌ ${description} - Erro ao ler arquivo`);
    return false;
  }
}

// Função principal de validação rigorosa
function strictValidation() {
  log('blue', '🚨 INICIANDO VALIDAÇÃO RIGOROSA DO PROJETO DOM v2');
  log('blue', '='.repeat(60));

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;

  // 1. Verificações de arquivos obrigatórios
  log('blue', '\n📁 VERIFICANDO ARQUIVOS OBRIGATÓRIOS:');
  const requiredFiles = [
    { path: 'DEVELOPMENT_RULES.md', desc: 'Regras de desenvolvimento' },
    { path: 'STRICT_RULES.md', desc: 'Regras estritas' },
    { path: 'VALIDATION_CONFIG.md', desc: 'Configuração de validação' },
    { path: '.eslintrc.json', desc: 'Configuração ESLint' },
    { path: '.prettierrc', desc: 'Configuração Prettier' },
    { path: 'tsconfig.json', desc: 'Configuração TypeScript' },
    { path: 'package.json', desc: 'Configuração do projeto' },
  ];

  requiredFiles.forEach(({ path: filePath, desc }) => {
    totalChecks++;
    if (checkFileExists(filePath, desc)) {
      passedChecks++;
    } else {
      failedChecks++;
    }
  });

  // 2. Verificações de configuração
  log('blue', '\n⚙️ VERIFICANDO CONFIGURAÇÕES:');

  // Verifica se TypeScript está em modo strict
  totalChecks++;
  if (
    checkFileContent(
      'tsconfig.json',
      'TypeScript strict mode',
      '"strict": true'
    )
  ) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // Verifica se ESLint está configurado
  totalChecks++;
  if (checkFileContent('.eslintrc.json', 'ESLint configurado', '"extends"')) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // Verifica se Prettier está configurado
  totalChecks++;
  if (checkFileContent('.prettierrc', 'Prettier configurado', '"semi"')) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 3. Verificações de código
  log('blue', '\n💻 VERIFICANDO CÓDIGO:');

  // Verifica TypeScript
  const tsCheck = runCommand('npm run type-check', 'Verificação TypeScript');
  totalChecks++;
  if (tsCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // Verifica ESLint
  const lintCheck = runCommand('npm run lint:check', 'Verificação ESLint');
  totalChecks++;
  if (lintCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // Verifica Prettier
  const formatCheck = runCommand(
    'npm run format:check',
    'Verificação Prettier'
  );
  totalChecks++;
  if (formatCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 4. Verificações de build
  log('blue', '\n🏗️ VERIFICANDO BUILD:');

  const buildCheck = runCommand('npm run build', 'Build do projeto');
  totalChecks++;
  if (buildCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 5. Verificações de regras
  log('blue', '\n📋 VERIFICANDO REGRAS:');

  const rulesCheck = runCommand(
    'npm run validate:strict',
    'Validação de regras'
  );
  totalChecks++;
  if (rulesCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 6. Verificações de JavaScript
  log('blue', '\n🚫 VERIFICANDO USO DE JAVASCRIPT:');

  const jsCheck = runCommand(
    'node scripts/prevent-js-usage.js',
    'Prevenção de JavaScript'
  );
  totalChecks++;
  if (jsCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 7. Verificações de sintaxe
  log('blue', '\n🔍 VERIFICANDO ERROS DE SINTAXE:');

  const syntaxCheck = runCommand(
    'node scripts/prevent-syntax-errors.js',
    'Prevenção de erros de sintaxe'
  );
  totalChecks++;
  if (syntaxCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // 8. Verificações de nomenclatura
  log('blue', '\n📁 VERIFICANDO NOMENCLATURA:');

  const namingCheck = runCommand(
    'node scripts/validate-file-naming.js',
    'Validação de nomenclatura'
  );
  totalChecks++;
  if (namingCheck.success) {
    passedChecks++;
  } else {
    failedChecks++;
  }

  // Resultado final
  log('blue', '\n' + '='.repeat(60));
  log('blue', '📊 RESULTADO FINAL DA VALIDAÇÃO RIGOROSA:');
  log('blue', '='.repeat(60));

  log('blue', `Total de verificações: ${totalChecks}`);
  log('green', `Verificações aprovadas: ${passedChecks}`);
  log('red', `Verificações falharam: ${failedChecks}`);

  if (failedChecks === 0) {
    log('green', '\n🎉 SUCESSO TOTAL!');
    log('green', '✅ Projeto está 100% em conformidade com todas as regras!');
    log('green', '✅ Nenhum desvio detectado!');
    log('green', '✅ Pronto para desenvolvimento seguro!');
    process.exit(0);
  } else {
    log('red', '\n🚨 FALHA CRÍTICA!');
    log('red', '❌ Projeto NÃO está em conformidade com as regras!');
    log('red', '❌ Desvios detectados que devem ser corrigidos!');
    log('yellow', '\n💡 Corrija todos os problemas e rode novamente.');
    process.exit(1);
  }
}

// Executa validação rigorosa
if (require.main === module) {
  strictValidation();
}

module.exports = { strictValidation };
