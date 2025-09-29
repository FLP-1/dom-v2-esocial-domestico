import * as fs from 'fs';

console.log('🔄 Migrando páginas para componentes unificados...');

interface FileReplacement {
  filePath: string;
  replacements: Array<{
    oldString: string;
    newString: string;
  }>;
}

// Configurações de migração
const migrationConfig: FileReplacement[] = [
  {
    filePath: 'src/pages/dashboard.tsx',
    replacements: [
      {
        oldString: "import { ActionButton } from '../components/ActionButton';",
        newString: "import { UnifiedButton } from '../components/unified';",
      },
      {
        oldString: "import { Modal } from '../components/Modal';",
        newString: "import { UnifiedModal } from '../components/unified';",
      },
      {
        oldString: '<ActionButton',
        newString: '<UnifiedButton',
      },
      {
        oldString: '</ActionButton>',
        newString: '</UnifiedButton>',
      },
      {
        oldString: '<Modal',
        newString: '<UnifiedModal',
      },
      {
        oldString: '</Modal>',
        newString: '</UnifiedModal>',
      },
    ],
  },
  {
    filePath: 'src/pages/esocial-domestico-completo.tsx',
    replacements: [
      {
        oldString: "import { ActionButton } from '../components/ActionButton';",
        newString: "import { UnifiedButton } from '../components/unified';",
      },
      {
        oldString: '<ActionButton',
        newString: '<UnifiedButton',
      },
      {
        oldString: '</ActionButton>',
        newString: '</UnifiedButton>',
      },
    ],
  },
  {
    filePath: 'src/pages/login.tsx',
    replacements: [
      {
        oldString: "import { ActionButton } from '../components/ActionButton';",
        newString: "import { UnifiedButton } from '../components/unified';",
      },
      {
        oldString: '<ActionButton',
        newString: '<UnifiedButton',
      },
      {
        oldString: '</ActionButton>',
        newString: '</UnifiedButton>',
      },
    ],
  },
  {
    filePath: 'src/pages/alert-management.tsx',
    replacements: [
      {
        oldString: "import { ActionButton } from '../components/ActionButton';",
        newString: "import { UnifiedButton } from '../components/unified';",
      },
      {
        oldString: "import { Modal } from '../components/Modal';",
        newString: "import { UnifiedModal } from '../components/unified';",
      },
      {
        oldString: '<ActionButton',
        newString: '<UnifiedButton',
      },
      {
        oldString: '</ActionButton>',
        newString: '</UnifiedButton>',
      },
      {
        oldString: '<Modal',
        newString: '<UnifiedModal',
      },
      {
        oldString: '</Modal>',
        newString: '</UnifiedModal>',
      },
    ],
  },
  {
    filePath: 'src/pages/subscription-plans.tsx',
    replacements: [
      {
        oldString: "import { ActionButton } from '../components/ActionButton';",
        newString: "import { UnifiedButton } from '../components/unified';",
      },
      {
        oldString: '<ActionButton',
        newString: '<UnifiedButton',
      },
      {
        oldString: '</ActionButton>',
        newString: '</UnifiedButton>',
      },
    ],
  },
];

// Função para processar um arquivo
function processFile(config: FileReplacement): void {
  if (!fs.existsSync(config.filePath)) {
    console.log(`⚠️ Arquivo não encontrado: ${config.filePath}`);
    return;
  }

  console.log(`📝 Processando: ${config.filePath}`);

  let content: string = fs.readFileSync(config.filePath, 'utf8');
  const originalContent: string = content;

  // Aplicar todas as substituições
  config.replacements.forEach(({ oldString, newString }) => {
    content = content.replace(new RegExp(oldString, 'g'), newString);
  });

  if (content !== originalContent) {
    // Criar backup
    const backupPath: string = config.filePath + '.backup-' + Date.now();
    fs.writeFileSync(backupPath, originalContent);
    console.log(`💾 Backup criado: ${backupPath}`);

    // Salvar arquivo migrado
    fs.writeFileSync(config.filePath, content);
    console.log(`✅ Arquivo migrado: ${config.filePath}`);
  } else {
    console.log(`ℹ️ Nenhuma alteração necessária: ${config.filePath}`);
  }
}

// Processar todos os arquivos
migrationConfig.forEach(processFile);

console.log('🎉 Migração finalizada!');
