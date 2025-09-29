import * as fs from 'fs';

console.log('🧹 Limpando todos os StyledComponent malformados...');

// Arquivos com problemas identificados
const filesToClean: string[] = [
  'src/pages/privacy.tsx',
  'src/pages/login.tsx',
  'src/pages/esocial-domestico-completo.tsx',
];

filesToClean.forEach((filePath: string) => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Processando: ${filePath}`);

    let content: string = fs.readFileSync(filePath, 'utf8');
    const originalContent: string = content;

    // Remover todas as tags StyledComponent malformadas
    content = content.replace(/<StyledComponent\d+>/g, '');
    content = content.replace(/<\/StyledComponent\d+>/g, '');

    // Remover linhas que contêm apenas StyledComponent
    content = content.replace(/^\s*<StyledComponent\d+>\s*$/gm, '');
    content = content.replace(/^\s*<\/StyledComponent\d+>\s*$/gm, '');

    // Limpar linhas vazias excessivas
    content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

    if (content !== originalContent) {
      // Criar backup
      const backupPath: string = filePath + '.backup-' + Date.now();
      fs.writeFileSync(backupPath, originalContent);
      console.log(`💾 Backup criado: ${backupPath}`);

      // Salvar arquivo limpo
      fs.writeFileSync(filePath, content);
      console.log(`✅ Arquivo limpo: ${filePath}`);
    } else {
      console.log(`ℹ️ Nenhuma alteração necessária: ${filePath}`);
    }
  } else {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
  }
});

console.log('🎉 Limpeza finalizada!');
