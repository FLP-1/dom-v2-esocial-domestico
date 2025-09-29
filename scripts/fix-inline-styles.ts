import * as fs from 'fs';

console.log('🎨 Convertendo estilos inline para styled-components...');

interface StyleReplacement {
  inlineStyle: string;
  styledComponent: string;
}

// Mapeamento de estilos inline para styled-components
const styleMappings: StyleReplacement[] = [
  {
    inlineStyle:
      "style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}",
    styledComponent: '<StyledComponent1>',
  },
  {
    inlineStyle:
      "style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}",
    styledComponent: '<StyledComponent2>',
  },
  {
    inlineStyle:
      "style={{ padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}",
    styledComponent: '<StyledComponent3>',
  },
  {
    inlineStyle:
      "style={{ margin: '1rem 0', fontSize: '0.9rem', color: '#666' }}",
    styledComponent: '<StyledComponent4>',
  },
  {
    inlineStyle:
      "style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}",
    styledComponent: '<StyledComponent5>',
  },
];

// Função para processar um arquivo
function processFile(filePath: string): void {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️ Arquivo não encontrado: ${filePath}`);
    return;
  }

  console.log(`📝 Processando: ${filePath}`);

  let content: string = fs.readFileSync(filePath, 'utf8');
  const originalContent: string = content;

  // Aplicar todas as substituições de estilo
  styleMappings.forEach(({ inlineStyle, styledComponent }) => {
    content = content.replace(
      new RegExp(inlineStyle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      styledComponent
    );
  });

  if (content !== originalContent) {
    // Criar backup
    const backupPath: string = filePath + '.backup-' + Date.now();
    fs.writeFileSync(backupPath, originalContent);
    console.log(`💾 Backup criado: ${backupPath}`);

    // Salvar arquivo convertido
    fs.writeFileSync(filePath, content);
    console.log(`✅ Arquivo convertido: ${filePath}`);
  } else {
    console.log(`ℹ️ Nenhuma alteração necessária: ${filePath}`);
  }
}

// Arquivos para processar
const filesToProcess: string[] = [
  'src/pages/dashboard.tsx',
  'src/pages/esocial-domestico-completo.tsx',
  'src/pages/login.tsx',
  'src/pages/privacy.tsx',
];

filesToProcess.forEach(processFile);

console.log('🎉 Conversão finalizada!');
