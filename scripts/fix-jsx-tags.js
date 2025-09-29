#!/usr/bin/env node

/**
 * Script para corrigir tags JSX não fechadas
 * Substitui tags de abertura pelos componentes otimizados
 */

const fs = require('fs');
const path = require('path');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');

// Mapeamento de componentes para correção
const COMPONENT_MAPPING = {
  'OptimizedErrorMessage': 'OptimizedErrorMessage',
  'OptimizedLabel': 'OptimizedLabel', 
  'OptimizedSectionTitle': 'OptimizedSectionTitle',
  'OptimizedFlexContainer': 'OptimizedFlexContainer',
  'OptimizedCheckboxLabel': 'OptimizedCheckboxLabel',
  'OptimizedStatusIndicator': 'OptimizedStatusIndicator'
};

class JSXFixer {
  constructor() {
    this.stats = {
      filesProcessed: 0,
      tagsFixed: 0,
      errors: []
    };
  }

  /**
   * Executa a correção completa
   */
  async fix() {
    console.log('🔧 Corrigindo tags JSX...\n');
    
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
      
      let updatedContent = content;
      let hasChanges = false;
      
      // Corrigir tags JSX não fechadas
      const jsxPatterns = [
        // OptimizedErrorMessage
        {
          from: /<OptimizedErrorMessage([^>]*)>/g,
          to: (match, props) => {
            // Verificar se já tem tag de fechamento
            const closingTag = `</OptimizedErrorMessage>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedErrorMessage${props}>`;
          }
        },
        
        // OptimizedLabel
        {
          from: /<OptimizedLabel([^>]*)>/g,
          to: (match, props) => {
            const closingTag = `</OptimizedLabel>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedLabel${props}>`;
          }
        },
        
        // OptimizedSectionTitle
        {
          from: /<OptimizedSectionTitle([^>]*)>/g,
          to: (match, props) => {
            const closingTag = `</OptimizedSectionTitle>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedSectionTitle${props}>`;
          }
        },
        
        // OptimizedFlexContainer
        {
          from: /<OptimizedFlexContainer([^>]*)>/g,
          to: (match, props) => {
            const closingTag = `</OptimizedFlexContainer>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedFlexContainer${props}>`;
          }
        },
        
        // OptimizedCheckboxLabel
        {
          from: /<OptimizedCheckboxLabel([^>]*)>/g,
          to: (match, props) => {
            const closingTag = `</OptimizedCheckboxLabel>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedCheckboxLabel${props}>`;
          }
        },
        
        // OptimizedStatusIndicator
        {
          from: /<OptimizedStatusIndicator([^>]*)>/g,
          to: (match, props) => {
            const closingTag = `</OptimizedStatusIndicator>`;
            if (match.includes(closingTag)) return match;
            return `<OptimizedStatusIndicator${props}>`;
          }
        }
      ];
      
      // Aplicar correções
      for (const pattern of jsxPatterns) {
        const newContent = updatedContent.replace(pattern.from, pattern.to);
        if (newContent !== updatedContent) {
          updatedContent = newContent;
          hasChanges = true;
          this.stats.tagsFixed++;
        }
      }
      
      if (hasChanges) {
        fs.writeFileSync(filePath, updatedContent, 'utf8');
        this.stats.filesProcessed++;
        console.log(`✅ Corrigido: ${relativePath}`);
      }
      
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
    console.log(`   Tags corrigidas: ${this.stats.tagsFixed}`);
    
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
  const fixer = new JSXFixer();
  fixer.fix();
}

module.exports = JSXFixer;
