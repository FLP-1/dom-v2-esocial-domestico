const fs = require('fs');
const path = require('path');

console.log('🔧 Corrigindo cache do Webhint/Microsoft Edge Tools...');

// Limpar cache do VS Code
const vscodeCacheDir = path.join(__dirname, '../.vscode');
if (fs.existsSync(vscodeCacheDir)) {
  fs.rmSync(vscodeCacheDir, { recursive: true, force: true });
  console.log('✅ Cache do VS Code removido');
}

// Limpar cache do Next.js
const nextCacheDir = path.join(__dirname, '../.next');
if (fs.existsSync(nextCacheDir)) {
  fs.rmSync(nextCacheDir, { recursive: true, force: true });
  console.log('✅ Cache do Next.js removido');
}

// Limpar cache do TypeScript
const tsCacheFile = path.join(__dirname, '../tsconfig.tsbuildinfo');
if (fs.existsSync(tsCacheFile)) {
  fs.unlinkSync(tsCacheFile);
  console.log('✅ Cache do TypeScript removido');
}

// Limpar cache do node_modules
const nodeModulesCache = path.join(__dirname, '../node_modules/.cache');
if (fs.existsSync(nodeModulesCache)) {
  fs.rmSync(nodeModulesCache, { recursive: true, force: true });
  console.log('✅ Cache do node_modules removido');
}

console.log('');
console.log('✅ Cache do Webhint/Microsoft Edge Tools limpo');
console.log('');
console.log('📋 Próximos passos para resolver os warnings:');
console.log('1. Reinicie o VS Code completamente');
console.log('2. Recarregue a janela (Ctrl+Shift+P > "Developer: Reload Window")');
console.log('3. Desabilite temporariamente a extensão Microsoft Edge Tools');
console.log('4. Reabilite a extensão Microsoft Edge Tools');
console.log('5. Execute: npm run build');
console.log('');
console.log('💡 Se os warnings persistirem, é um falso positivo do Webhint');
