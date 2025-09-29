const fs = require('fs');
const path = require('path');

const files = [
  'src/components/EmployeeModal.tsx',
  'src/components/EmployerModal.tsx',
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remover todos os estilos inline
    content = content.replace(/\s*style=\{\{[^}]*\}\}/g, '');

    // Salvar o arquivo
    fs.writeFileSync(fullPath, content, 'utf8');

    console.log(`✅ Estilos inline removidos de ${filePath}`);
  } else {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
  }
});

console.log('✅ Todos os estilos inline foram removidos');
