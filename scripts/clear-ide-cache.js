const fs = require('fs');
const path = require('path');

console.log('🧹 Limpando cache do IDE...');

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

// Limpar node_modules/.cache se existir
const nodeModulesCache = path.join(__dirname, '../node_modules/.cache');
if (fs.existsSync(nodeModulesCache)) {
  fs.rmSync(nodeModulesCache, { recursive: true, force: true });
  console.log('✅ Cache do node_modules removido');
}

console.log('✅ Limpeza de cache concluída');
console.log('');
console.log('📋 Próximos passos:');
console.log('1. Reinicie o IDE (VS Code)');
console.log(
  '2. Recarregue a janela do IDE (Ctrl+Shift+P > "Developer: Reload Window")'
);
console.log('3. Execute: npm run build');
console.log('');
console.log(
  '💡 Se os warnings persistirem, pode ser um problema do Microsoft Edge Tools extension'
);
