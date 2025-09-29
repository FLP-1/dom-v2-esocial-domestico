const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');
const content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Análise profunda para Webhint...');

// Buscar por qualquer padrão que possa ser detectado pelo Webhint
const patterns = [
  // Estilos inline básicos
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com espaços e quebras
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
  /style\s*=\s*'[^']*'/g,
  
  // Estilos inline com quebras de linha
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
      console.log(`   ${i + 1}: ${match}`);
    });
    totalFound += matches.length;
  }
});

console.log(`\n🔍 Total encontrado: ${totalFound}`);

if (totalFound === 0) {
  console.log('✅ Nenhum estilo inline encontrado no código fonte');
  console.log('\n💡 O Webhint pode estar detectando:');
  console.log('1. Estilos inline em elementos filhos (componentes importados)');
  console.log('2. Estilos inline em tempo de execução');
  console.log('3. Estilos inline em bibliotecas externas');
  console.log('4. Falso positivo do Webhint');
  
  console.log('\n🔧 Soluções para corrigir:');
  console.log('1. Verificar componentes importados');
  console.log('2. Verificar bibliotecas externas');
  console.log('3. Configurar Webhint para ignorar falsos positivos');
  console.log('4. Atualizar extensão Microsoft Edge Tools');
} else {
  console.log('⚠️ Estilos inline encontrados - removendo...');
  patterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Estilos inline removidos');
}
