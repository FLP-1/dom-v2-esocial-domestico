import * as fs from 'fs';
import * as path from 'path';

console.log('🔍 Analisando componentes duplicados...');

interface ComponentInfo {
  name: string;
  path: string;
  size: number;
  content: string;
}

interface DuplicateGroup {
  componentName: string;
  files: ComponentInfo[];
  similarity: number;
}

// Função para ler arquivos de componente
function readComponentFiles(directory: string): ComponentInfo[] {
  const components: ComponentInfo[] = [];

  function scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDirectory(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        const content = fs.readFileSync(filePath, 'utf8');
        const componentName = path.basename(file, path.extname(file));

        components.push({
          name: componentName,
          path: filePath,
          size: content.length,
          content,
        });
      }
    });
  }

  scanDirectory(directory);
  return components;
}

// Função para calcular similaridade entre dois componentes
function calculateSimilarity(
  comp1: ComponentInfo,
  comp2: ComponentInfo
): number {
  const content1 = comp1.content.toLowerCase();
  const content2 = comp2.content.toLowerCase();

  // Calcular similaridade baseada em palavras-chave comuns
  const keywords1 = content1.split(/\s+/);
  const keywords2 = content2.split(/\s+/);

  const commonKeywords = keywords1.filter(keyword =>
    keywords2.includes(keyword)
  );
  const totalKeywords = new Set([...keywords1, ...keywords2]).size;

  return (commonKeywords.length / totalKeywords) * 100;
}

// Função para encontrar duplicatas
function findDuplicates(components: ComponentInfo[]): DuplicateGroup[] {
  const duplicates: DuplicateGroup[] = [];
  const processed = new Set<string>();

  components.forEach(comp1 => {
    if (processed.has(comp1.path)) return;

    const similarComponents = components.filter(comp2 => {
      if (comp1.path === comp2.path) return false;
      if (processed.has(comp2.path)) return false;

      const similarity = calculateSimilarity(comp1, comp2);
      return similarity > 60; // 60% de similaridade
    });

    if (similarComponents.length > 0) {
      const group: DuplicateGroup = {
        componentName: comp1.name,
        files: [comp1, ...similarComponents],
        similarity: calculateSimilarity(comp1, similarComponents[0]),
      };

      duplicates.push(group);

      // Marcar como processados
      processed.add(comp1.path);
      similarComponents.forEach(comp => processed.add(comp.path));
    }
  });

  return duplicates;
}

// Função principal
function analyzeDuplicates(): void {
  console.log('📁 Analisando componentes...');

  const componentsDir = 'src/components';
  const designSystemDir = 'src/design-system/components';

  const allComponents: ComponentInfo[] = [];

  if (fs.existsSync(componentsDir)) {
    allComponents.push(...readComponentFiles(componentsDir));
  }

  if (fs.existsSync(designSystemDir)) {
    allComponents.push(...readComponentFiles(designSystemDir));
  }

  console.log(`📊 Total de componentes encontrados: ${allComponents.length}`);

  const duplicates = findDuplicates(allComponents);

  if (duplicates.length === 0) {
    console.log('✅ Nenhuma duplicação encontrada!');
    return;
  }

  console.log(`\n🔍 ${duplicates.length} grupos de duplicação encontrados:\n`);

  duplicates.forEach((group, index) => {
    console.log(
      `${index + 1}. ${group.componentName} (${group.similarity.toFixed(1)}% similar)`
    );
    group.files.forEach(file => {
      console.log(`   📄 ${file.path} (${file.size} bytes)`);
    });
    console.log('');
  });

  // Gerar relatório
  const report = {
    timestamp: new Date().toISOString(),
    totalComponents: allComponents.length,
    duplicateGroups: duplicates.length,
    duplicates: duplicates.map(group => ({
      componentName: group.componentName,
      similarity: group.similarity,
      files: group.files.map(file => ({
        path: file.path,
        size: file.size,
      })),
    })),
  };

  fs.writeFileSync(
    'duplicate-components-report.json',
    JSON.stringify(report, null, 2)
  );
  console.log('📄 Relatório salvo em: duplicate-components-report.json');
}

// Executar análise
analyzeDuplicates();
