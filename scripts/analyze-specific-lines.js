const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

console.log('🔍 Analisando linhas específicas mencionadas nos warnings...');

// Linhas mencionadas nos warnings (baseado na imagem)
const warningLines = [899, 1060, 1393];

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

console.log('\n🔍 Buscando padrões específicos do Webhint...');

// Padrões que o Webhint pode detectar
const webhintPatterns = [
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g
];

let foundAny = false;
webhintPatterns.forEach((pattern, index) => {
  const matches = content.match(pattern);
  if (matches) {
    console.log(`📋 Padrão ${index + 1}: ${matches.length} ocorrências`);
    matches.forEach((match, i) => {
      console.log(`   ${i + 1}: ${match}`);
    });
    foundAny = true;
  }
});

if (!foundAny) {
  console.log('✅ Nenhum padrão de estilo inline encontrado');
  console.log('\n💡 Possíveis causas:');
  console.log('1. Cache do Webhint');
  console.log('2. Estilos inline em elementos filhos');
  console.log('3. Estilos inline em tempo de execução');
  console.log('4. Falso positivo do Webhint');
}
