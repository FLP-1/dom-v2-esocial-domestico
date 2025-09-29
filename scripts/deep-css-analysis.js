const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Análise profunda de estilos inline...');

// Padrões que o Webhint pode detectar
const patterns = [
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  /style\s*=\s*\{\{[^}]*\}\}/g,
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g
];

let totalFound = 0;
patterns.forEach((pattern, index) => {
  const matches = content.match(pattern);
  if (matches) {
    console.log(`📋 Padrão ${index + 1}: ${matches.length} ocorrências`);
    matches.forEach((match, i) => {
      console.log(`  ${i + 1}: ${match}`);
    });
    totalFound += matches.length;
  }
});

console.log(`🔍 Total encontrado: ${totalFound}`);

if (totalFound === 0) {
  console.log('✅ Nenhum estilo inline encontrado');
} else {
  console.log('⚠️ Estilos inline encontrados - removendo...');
  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Estilos inline removidos');
}
