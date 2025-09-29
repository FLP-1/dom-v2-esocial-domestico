const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/EmployerModal.tsx');

// Ler o arquivo
let content = fs.readFileSync(filePath, 'utf8');

console.log('🔍 Analisando arquivo EmployerModal.tsx...');

// Procurar por diferentes padrões de estilos inline
const patterns = [
  /style=\{\{[^}]*\}\}/g,
  /style=\{[^}]*\}/g,
  /style="[^"]*"/g,
  /style='[^']*'/g,
  /style\s*=\s*\{[^}]*\}/g,
  /style\s*=\s*"[^"]*"/g,
  /style\s*=\s*'[^']*'/g,
];

let foundStyles = 0;

patterns.forEach((pattern, index) => {
  const matches = content.match(pattern);
  if (matches) {
    console.log(`📋 Padrão ${index + 1} encontrado:`, matches);
    foundStyles += matches.length;
  }
});

console.log(`🔍 Total de estilos inline encontrados: ${foundStyles}`);

if (foundStyles > 0) {
  // Remover todos os padrões de estilos inline
  patterns.forEach((pattern, index) => {
    const before = content.match(pattern);
    if (before) {
      content = content.replace(pattern, '');
      console.log(
        `✅ Padrão ${index + 1} removido: ${before.length} ocorrências`
      );
    }
  });

  // Limpar linhas vazias excessivas
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  // Salvar o arquivo
  fs.writeFileSync(filePath, content, 'utf8');

  console.log('✅ Arquivo EmployerModal.tsx limpo e salvo');
} else {
  console.log('ℹ️ Nenhum estilo inline encontrado no arquivo');
}

// Verificar se ainda há estilos inline após a limpeza
let remainingStyles = 0;
patterns.forEach(pattern => {
  const matches = content.match(pattern);
  if (matches) {
    remainingStyles += matches.length;
  }
});

console.log(`🔍 Estilos inline restantes: ${remainingStyles}`);

if (remainingStyles === 0) {
  console.log('✅ Todos os estilos inline foram removidos com sucesso!');
} else {
  console.log('⚠️ Ainda há estilos inline no arquivo');
}
