#!/usr/bin/env node

/**
 * Script de Migração para Componentes Otimizados
 * Substitui componentes atuais pelos otimizados
 */

const fs = require('fs');
const path = require('path');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

// Mapeamento de componentes
const COMPONENT_MAPPING = {
  'FormRow': 'OptimizedFormRow',
  'FormSection': 'OptimizedFormSection',
  'SectionTitle': 'OptimizedSectionTitle',
  'Label': 'OptimizedLabel',
  'InputStyled': 'OptimizedInputStyled',
  'SelectStyled': 'OptimizedSelectStyled',
  'ErrorMessage': 'OptimizedErrorMessage',
  'HelpText': 'OptimizedHelpText',
  'FlexContainer': 'OptimizedFlexContainer',
  'CheckboxContainer': 'OptimizedCheckboxContainer',
  'CheckboxItem': 'OptimizedCheckboxItem',
  'CheckboxLabel': 'OptimizedCheckboxLabel',
  'CheckboxContent': 'OptimizedCheckboxContent',
  'RadioGroup': 'OptimizedRadioGroup',
  'PeriodGroup': 'OptimizedPeriodGroup',
  'ValidationContainer': 'OptimizedValidationContainer',
  'SuccessMessage': 'OptimizedSuccessMessage',
  'StatusIndicator': 'OptimizedStatusIndicator',
  'CertificateStatus': 'OptimizedCertificateStatus',
  'ButtonGroup': 'OptimizedButtonGroup',
  'LoadingOverlay': 'OptimizedLoadingOverlay',
  'ValidationButton': 'OptimizedValidationButton',
  'InfoMessage': 'OptimizedInfoMessage',
  'ResponsiveContainer': 'OptimizedResponsiveContainer'
};

// Padrões de import para substituir
const IMPORT_PATTERNS = [
  {
    from: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\.\/shared\/styles['"]/g,
    to: (match, imports) => {
      const componentList = imports.split(',').map(comp => comp.trim());
      const optimizedComponents = componentList.map(comp => {
        const cleanComp = comp.replace(/\s*as\s+\w+/, '').trim();
        return COMPONENT_MAPPING[cleanComp] || comp;
      });
      return `import { ${optimizedComponents.join(', ')} } from '../shared/optimized-styles'`;
    }
  },
  {
    from: /import\s*{\s*([^}]+)\s*}\s*from\s*['"]\.\/shared\/styles['"]/g,
    to: (match, imports) => {
      const componentList = imports.split(',').map(comp => comp.trim());
      const optimizedComponents = componentList.map(comp => {
        const cleanComp = comp.replace(/\s*as\s+\w+/, '').trim();
        return COMPONENT_MAPPING[cleanComp] || comp;
      });
      return `import { ${optimizedComponents.join(', ')} } from './shared/optimized-styles'`;
    }
  }
];

// Padrões de uso de componentes para substituir
const USAGE_PATTERNS = Object.entries(COMPONENT_MAPPING).map(([old, new_]) => ({
  from: new RegExp(`<${old}\\b`, 'g'),
  to: `<${new_}`
}));

class ComponentMigrator {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      componentsReplaced: 0,
      importsUpdated: 0,
      errors: []
    };
  }

  /**
   * Executa a migração completa
   */
  async migrate() {
    console.log('🚀 Iniciando migração para componentes otimizados...\n');
    
    try {
      await this.scanAndMigrate(SRC_DIR);
      this.generateReport();
    } catch (error) {
      console.error('❌ Erro durante a migração:', error.message);
      process.exit(1);
    }
  }

  /**
   * Escaneia e migra arquivos recursivamente
   */
  async scanAndMigrate(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular node_modules e outros diretórios desnecessários
        if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
          await this.scanAndMigrate(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        await this.migrateFile(fullPath);
      }
    }
  }

  /**
   * Migra um arquivo específico
   */
  async migrateFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(SRC_DIR, filePath);
      
      let updatedContent = content;
      let hasChanges = false;
      
      // Atualizar imports
      for (const pattern of IMPORT_PATTERNS) {
        const newContent = updatedContent.replace(pattern.from, pattern.to);
        if (newContent !== updatedContent) {
          updatedContent = newContent;
          hasChanges = true;
          this.stats.importsUpdated++;
        }
      }
      
      // Atualizar uso de componentes
      for (const pattern of USAGE_PATTERNS) {
        const newContent = updatedContent.replace(pattern.from, pattern.to);
        if (newContent !== updatedContent) {
          updatedContent = newContent;
          hasChanges = true;
          this.stats.componentsReplaced++;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        this.stats.filesProcessed++;
        console.log(`✅ Migrado: ${relativePath}`);
      }
      
    } catch (error) {
      this.stats.errors.push(`Erro em ${filePath}: ${error.message}`);
    }
  }

  /**
   * Gera relatório da migração
   */
  generateReport() {
    console.log('\n📊 Relatório de Migração:');
    console.log(`   Arquivos processados: ${this.stats.filesProcessed}`);
    console.log(`   Imports atualizados: ${this.stats.importsUpdated}`);
    console.log(`   Componentes substituídos: ${this.stats.componentsReplaced}`);
    
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
    
    console.log('\n📚 Documentação:');
    console.log('   - Guia de migração: src/components/shared/migration-guide.md');
    console.log('   - Componentes otimizados: src/components/shared/optimized-styles.ts');
    console.log('   - Mixins: src/components/shared/mixins.ts');
    console.log('   - Tokens: src/components/shared/tokens.ts');
  }
}

// Executar migração se chamado diretamente
if (require.main === module) {
  const migrator = new ComponentMigrator();
  migrator.migrate();
}

module.exports = ComponentMigrator;
