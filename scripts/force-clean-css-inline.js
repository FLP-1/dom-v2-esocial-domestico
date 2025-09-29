const fs = require('fs');
const path = require('path');

const files = [
  'src/components/EmployeeModal.tsx',
  'src/components/EmployerModal.tsx',
  'src/components/EmployerModalMultiStep.tsx',
];

files.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);

  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');

    // Remover todos os estilos inline de diferentes formatos
    content = content.replace(/\s*style=\{\{[^}]*\}\}/g, '');
    content = content.replace(/\s*style=\{[^}]*\}/g, '');
    content = content.replace(/\s*style="[^"]*"/g, '');
    content = content.replace(/\s*style='[^']*'/g, '');

    // Remover linhas vazias excessivas
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Salvar o arquivo
    fs.writeFileSync(fullPath, content, 'utf8');

    console.log(`✅ Limpeza forçada de estilos inline em ${filePath}`);
  } else {
    console.log(`❌ Arquivo não encontrado: ${filePath}`);
  }
});

console.log('✅ Limpeza forçada de todos os estilos inline concluída');
