#!/usr/bin/env node

/**
 * Script para corrigir imports dos componentes otimizados
 */

const fs = require('fs');
const path = require('path');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');

// Componentes que precisam ser importados
const OPTIMIZED_COMPONENTS = [
  'OptimizedFormRow',
  'OptimizedFormSection', 
  'OptimizedSectionTitle',
  'OptimizedLabel',
  'OptimizedInputStyled',
  'OptimizedSelectStyled',
  'OptimizedErrorMessage',
  'OptimizedHelpText',
  'OptimizedSuccessMessage',
  'OptimizedInfoMessage',
  'OptimizedFlexContainer',
  'OptimizedCheckboxContainer',
  'OptimizedCheckboxItem',
  'OptimizedCheckboxLabel',
  'OptimizedCheckboxContent',
  'OptimizedRadioGroup',
  'OptimizedPeriodGroup',
  'OptimizedValidationContainer',
  'OptimizedStatusIndicator',
  'OptimizedCertificateStatus',
  'OptimizedButtonGroup',
  'OptimizedLoadingOverlay',
  'OptimizedValidationButton',
  'OptimizedResponsiveContainer'
];

class ImportFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      importsAdded: 0,
      errors: []
    };
  }

  /**
   * Executa a correção completa
   */
  async fix() {
    console.log('🔧 Corrigindo imports dos componentes otimizados...\n');
    
    try {
      await this.scanAndFix(SRC_DIR);
      this.generateReport();
    } catch (error) {
      console.error('❌ Erro durante a correção:', error.message);
      process.exit(1);
    }
  }

  /**
   * Escaneia e corrige arquivos recursivamente
   */
  async scanAndFix(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular node_modules e outros diretórios desnecessários
        if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
          await this.scanAndFix(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        await this.fixFile(fullPath);
      }
    }
  }

  /**
   * Corrige um arquivo específico
   */
  async fixFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(SRC_DIR, filePath);
      
      // Verificar se o arquivo usa componentes otimizados
      const usesOptimizedComponents = OPTIMIZED_COMPONENTS.some(comp => 
        content.includes(`<${comp}`)
      );
      
      if (!usesOptimizedComponents) {
        return;
      }
      
      // Verificar se já tem import dos componentes otimizados
      if (content.includes('from \'./shared/optimized-styles\'') || 
          content.includes('from \'../shared/optimized-styles\'')) {
        return;
      }
      
      // Encontrar componentes usados no arquivo
      const usedComponents = OPTIMIZED_COMPONENTS.filter(comp => 
        content.includes(`<${comp}`)
      );
      
      if (usedComponents.length === 0) {
        return;
      }
      
      // Determinar o caminho do import
      const isInComponents = filePath.includes('/components/');
      const importPath = isInComponents ? './shared/optimized-styles' : '../components/shared/optimized-styles';
      
      // Adicionar import
      const importStatement = `import { ${usedComponents.join(', ')} } from '${importPath}';\n`;
      
      // Encontrar onde inserir o import
      const lines = content.split('\n');
      let insertIndex = 0;
      
      // Procurar por outros imports
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1;
        }
      }
      
      // Inserir o import
      lines.splice(insertIndex, 0, importStatement);
      const updatedContent = lines.join('\n');
      
      // Salvar arquivo
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      this.stats.filesProcessed++;
      this.stats.importsAdded += usedComponents.length;
      console.log(`✅ Adicionado import em: ${relativePath} (${usedComponents.length} componentes)`);
      
    } catch (error) {
      this.stats.errors.push(`Erro em ${filePath}: ${error.message}`);
    }
  }

  /**
   * Gera relatório da correção
   */
  generateReport() {
    console.log('\n📊 Relatório de Correção:');
    console.log(`   Arquivos processados: ${this.stats.filesProcessed}`);
    console.log(`   Imports adicionados: ${this.stats.importsAdded}`);
    
    if (this.stats.errors.length > 0) {
      console.log(`   Erros encontrados: ${this.stats.errors.length}`);
      this.stats.errors.forEach(error => console.log(`   ❌ ${error}`));
    } else {
      console.log('   ✅ Nenhum erro encontrado!');
    }
    
    console.log('\n🎯 Próximos passos:');
    console.log('   1. Execute: npm run build');
    console.log('   2. Execute: npm run test');
    console.log('   3. Verifique: npm run analyze');
  }
}

// Executar correção se chamado diretamente
if (require.main === module) {
  const fixer = new ImportFixer();
  fixer.fix();
}

module.exports = ImportFixer;
