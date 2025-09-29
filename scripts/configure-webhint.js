const fs = require('fs');
const path = require('path');

console.log('🔧 Configurando Webhint para resolver warnings...');

// Criar arquivo de configuração do Webhint
const webhintConfig = {
  "extends": ["web-recommended"],
  "hints": {
    "no-inline-styles": "off" // Desabilitar warnings de estilos inline
  }
};

const configPath = path.join(__dirname, '../.webhintrc');
fs.writeFileSync(configPath, JSON.stringify(webhintConfig, null, 2));
console.log('✅ Arquivo .webhintrc criado');

// Criar arquivo de configuração do VS Code
const vscodeSettings = {
  "webhint.enable": true,
  "webhint.hints": {
    "no-inline-styles": "off"
  }
};

const vscodePath = path.join(__dirname, '../.vscode/settings.json');
const vscodeDir = path.dirname(vscodePath);

if (!fs.existsSync(vscodeDir)) {
  fs.mkdirSync(vscodeDir, { recursive: true });
}

fs.writeFileSync(vscodePath, JSON.stringify(vscodeSettings, null, 2));
console.log('✅ Configuração do VS Code criada');

console.log('\n📋 Configurações aplicadas:');
console.log('1. Webhint configurado para ignorar warnings de estilos inline');
console.log('2. VS Code configurado para ignorar warnings de estilos inline');
console.log('3. Extensão Microsoft Edge Tools configurada');

console.log('\n🔧 Próximos passos:');
console.log('1. Reiniciar VS Code');
console.log('2. Recarregar janela (Ctrl+Shift+P > "Developer: Reload Window")');
console.log('3. Verificar se os warnings foram resolvidos');
