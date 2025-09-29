import { execSync } from 'child_process';

console.log('🚀 Executando scripts de automação...');

interface ScriptConfig {
  name: string;
  description: string;
  command: string;
}

const scripts: ScriptConfig[] = [
  {
    name: 'find-duplicates',
    description: 'Encontrar componentes duplicados',
    command: 'npx ts-node scripts/find-duplicate-components.ts',
  },
  {
    name: 'migrate-pages',
    description: 'Migrar páginas para componentes unificados',
    command: 'npx ts-node scripts/migrate-pages-to-unified.ts',
  },
  {
    name: 'fix-inline-styles',
    description: 'Converter estilos inline para styled-components',
    command: 'npx ts-node scripts/fix-inline-styles.ts',
  },
  {
    name: 'clean-styled-components',
    description: 'Limpar componentes StyledComponent malformados',
    command: 'npx ts-node scripts/clean-styled-components.ts',
  },
  {
    name: 'final-cleanup',
    description: 'Limpeza final de StyledComponent',
    command: 'npx ts-node scripts/final-cleanup-styled-components.ts',
  },
  {
    name: 'remove-legacy',
    description: 'Remover código legado',
    command: 'npx ts-node scripts/remove-legacy-code.ts',
  },
];

function runScript(script: ScriptConfig): void {
  console.log(`\n📝 Executando: ${script.name}`);
  console.log(`📋 Descrição: ${script.description}`);

  try {
    execSync(script.command, { stdio: 'inherit' });
    console.log(`✅ ${script.name} executado com sucesso`);
  } catch (error) {
    console.log(`❌ Erro ao executar ${script.name}:`, error);
  }
}

function showMenu(): void {
  console.log('\n📋 Scripts disponíveis:');
  scripts.forEach((script, index) => {
    console.log(`${index + 1}. ${script.name} - ${script.description}`);
  });
  console.log('0. Executar todos os scripts');
  console.log('q. Sair');
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showMenu();
    return;
  }

  const scriptName = args[0];

  if (scriptName === 'all') {
    console.log('🔄 Executando todos os scripts...');
    scripts.forEach(runScript);
    return;
  }

  const script = scripts.find(s => s.name === scriptName);
  if (script) {
    runScript(script);
  } else {
    console.log(`❌ Script não encontrado: ${scriptName}`);
    showMenu();
  }
}

main();
