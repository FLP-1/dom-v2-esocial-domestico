const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('🔍 Analisando linhas específicas dos warnings...');

// Linhas mencionadas nos warnings
const warningLines = [899, 916, 938, 946, 957, 1011, 1030, 1052, 1060, 1071, 1099, 1110, 1138, 1151, 1216, 1359, 1362, 1371, 1390, 1393];

warningLines.forEach(lineNum => {
  if (lineNum <= lines.length) {
    const line = lines[lineNum - 1];
    console.log(`\n📋 Linha ${lineNum}:`);
    console.log(`   ${line}`);
    
    // Verificar se há estilos inline nesta linha
    if (line.includes('style=')) {
      console.log(`   ⚠️  ESTILO INLINE DETECTADO!`);
    } else {
      console.log(`   ✅ Sem estilo inline`);
    }
  }
});

console.log('\n🔍 Buscando padrões específicos que o Webhint pode detectar...');

// Padrões mais específicos que o Webhint pode detectar
const webhintPatterns = [
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g
];

let totalFound = 0;
webhintPatterns.forEach((pattern, index) => {
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
