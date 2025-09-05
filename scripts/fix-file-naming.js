#!/usr/bin/env node

/**
 * Script para corrigir automaticamente problemas de nomenclatura
 * Renomeia arquivos e pastas para seguir as regras estabelecidas
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

// Função para converter string para PascalCase
function toPascalCase(str) {
  return str
    .replace(/(?:^|[-_])(\w)/g, (_, c) => c.toUpperCase())
    .replace(/[-_]/g, '');
}

// Função para converter string para camelCase
function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

// Função para converter string para kebab-case
function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

// Função para verificar se nome é válido
function isValidName(name, type) {
  if (type === 'component') {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  } else if (type === 'page') {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  } else if (type === 'util') {
    return /^[a-z][a-zA-Z0-9]*$/.test(name);
  } else if (type === 'style') {
    return /^[A-Z][a-zA-Z0-9]*$/.test(name);
  } else if (type === 'hook') {
    return /^use[A-Z][a-zA-Z0-9]*$/.test(name);
  } else if (type === 'context') {
    return /^[A-Z][a-zA-Z0-9]*Context$/.test(name);
  }
  return false;
}

// Função para sugerir nome correto
function suggestCorrectName(name, type) {
  if (type === 'component') {
    return toPascalCase(name);
  } else if (type === 'page') {
    return toCamelCase(name);
  } else if (type === 'util') {
    return toCamelCase(name);
  } else if (type === 'style') {
    return toPascalCase(name);
  } else if (type === 'hook') {
    const camel = toCamelCase(name);
    return camel.startsWith('use') ? camel : `use${toPascalCase(name)}`;
  } else if (type === 'context') {
    const pascal = toPascalCase(name);
    return pascal.endsWith('Context') ? pascal : `${pascal}Context`;
  }
  return name;
}

// Função para corrigir nome de arquivo
function fixFileName(filePath) {
  const dirName = path.dirname(filePath);
  const fileName = path.basename(filePath);
  const ext = path.extname(fileName);
  const name = path.basename(fileName, ext);

  let newName = name;
  let type = 'file';

  // Determinar tipo baseado no caminho
  if (filePath.includes('/components/')) {
    type = 'component';
    newName = suggestCorrectName(name, 'component');
  } else if (filePath.includes('/pages/')) {
    type = 'page';
    newName = suggestCorrectName(name, 'page');
  } else if (filePath.includes('/utils/')) {
    type = 'util';
    newName = suggestCorrectName(name, 'util');
  } else if (filePath.includes('/styles/')) {
    type = 'style';
    newName = suggestCorrectName(name, 'style');
  } else if (filePath.includes('/hooks/')) {
    type = 'hook';
    newName = suggestCorrectName(name, 'hook');
  } else if (filePath.includes('/contexts/')) {
    type = 'context';
    newName = suggestCorrectName(name, 'context');
  }

  // Verificar se precisa renomear
  if (newName !== name) {
    const newFileName = `${newName}${ext}`;
    const newFilePath = path.join(dirName, newFileName);

    try {
      fs.renameSync(filePath, newFilePath);
      log('green', `✅ ${filePath} → ${newFilePath}`);
      return { success: true, oldPath: filePath, newPath: newFilePath };
    } catch (error) {
      log('red', `❌ Erro ao renomear ${filePath}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  return { success: true, noChange: true };
}

// Função para corrigir nome de pasta
function fixFolderName(folderPath) {
  const parentDir = path.dirname(folderPath);
  const folderName = path.basename(folderPath);

  let newName = folderName;
  let type = 'folder';

  // Determinar tipo baseado no caminho
  if (folderPath.includes('/components/')) {
    type = 'component';
    newName = suggestCorrectName(folderName, 'component');
  }

  // Verificar se precisa renomear
  if (newName !== folderName) {
    const newFolderPath = path.join(parentDir, newName);

    try {
      fs.renameSync(folderPath, newFolderPath);
      log('green', `✅ ${folderPath} → ${newFolderPath}`);
      return { success: true, oldPath: folderPath, newPath: newFolderPath };
    } catch (error) {
      log('red', `❌ Erro ao renomear ${folderPath}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  return { success: true, noChange: true };
}

// Função para percorrer arquivos e pastas
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
      // Processar pasta
      callback(filePath, 'folder');
      // Continuar recursivamente
      walkDirectory(filePath, callback);
    } else if (
      stat.isFile() &&
      (file.endsWith('.tsx') || file.endsWith('.ts'))
    ) {
      // Processar arquivo
      callback(filePath, 'file');
    }
  });
}

// Função principal de correção
function fixFileNaming() {
  log('blue', '🔧 Iniciando correção de nomenclatura...\n');

  let totalItems = 0;
  let fixedItems = 0;
  let failedItems = 0;
  let noChangeItems = 0;

  walkDirectory('src', (itemPath, type) => {
    totalItems++;

    if (type === 'file') {
      const result = fixFileName(itemPath);
      if (result.success) {
        if (result.noChange) {
          noChangeItems++;
        } else {
          fixedItems++;
        }
      } else {
        failedItems++;
      }
    } else if (type === 'folder') {
      const result = fixFolderName(itemPath);
      if (result.success) {
        if (result.noChange) {
          noChangeItems++;
        } else {
          fixedItems++;
        }
      } else {
        failedItems++;
      }
    }
  });

  // Resultado final
  log('blue', '\n' + '='.repeat(50));
  log('blue', '📊 RESULTADO DA CORREÇÃO DE NOMENCLATURA:');
  log('blue', '='.repeat(50));

  log('blue', `Total de itens processados: ${totalItems}`);
  log('green', `Itens corrigidos: ${fixedItems}`);
  log('yellow', `Itens sem alteração: ${noChangeItems}`);
  log('red', `Itens com erro: ${failedItems}`);

  if (failedItems === 0) {
    log('green', '\n🎉 CORREÇÃO CONCLUÍDA!');
    log('green', '✅ Todos os problemas de nomenclatura foram corrigidos!');
    log(
      'yellow',
      '\n💡 Execute "npm run validate:naming" para verificar se tudo está OK.'
    );
  } else {
    log('red', '\n⚠️ CORREÇÃO PARCIAL!');
    log(
      'red',
      '❌ Alguns problemas não puderam ser corrigidos automaticamente.'
    );
    log('yellow', '\n💡 Corrija manualmente os problemas restantes.');
  }
}

// Executa correção
if (require.main === module) {
  fixFileNaming();
}

module.exports = { fixFileNaming };
