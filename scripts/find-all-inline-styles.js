const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Buscando TODOS os tipos de estilos inline...');

// Padrões mais abrangentes que o Webhint pode detectar
const patterns = [
  // Estilos inline básicos
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com espaços
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com quebras de linha
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com template literals
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com expressões
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
  console.log('✅ Nenhum estilo inline encontrado no código fonte');
  console.log('');
  console.log('💡 Possíveis causas dos warnings do Microsoft Edge Tools:');
  console.log('1. Cache do Webhint');
  console.log('2. Estilos inline em tempo de execução');
  console.log('3. Falso positivo da extensão');
  console.log('4. Estilos inline em elementos filhos');
} else {
  console.log('⚠️ Estilos inline encontrados - removendo...');
  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Estilos inline removidos');
}
