#!/usr/bin/env node

/**
 * Script para corrigir todas as tags JSX não fechadas
 */

const fs = require('fs');
const path = require('path');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');

// Padrões de correção
const FIX_PATTERNS = [
  // SectionTitle
  { from: /<\/SectionTitle>/g, to: '</OptimizedSectionTitle>' },
  
  // Label
  { from: /<\/Label>/g, to: '</OptimizedLabel>' },
  
  // ErrorMessage
  { from: /<\/ErrorMessage>/g, to: '</OptimizedErrorMessage>' },
  
  // FlexContainer
  { from: /<\/FlexContainer>/g, to: '</OptimizedFlexContainer>' },
  
  // CheckboxLabel
  { from: /<\/CheckboxLabel>/g, to: '</OptimizedCheckboxLabel>' },
  
  // StatusIndicator
  { from: /<\/StatusIndicator>/g, to: '</OptimizedStatusIndicator>' },
  
  // FormRow
  { from: /<\/FormRow>/g, to: '</OptimizedFormRow>' },
  
  // FormSection
  { from: /<\/FormSection>/g, to: '</OptimizedFormSection>' },
  
  // InputStyled
  { from: /<\/InputStyled>/g, to: '</OptimizedInputStyled>' },
  
  // SelectStyled
  { from: /<\/SelectStyled>/g, to: '</OptimizedSelectStyled>' },
  
  // HelpText
  { from: /<\/HelpText>/g, to: '</OptimizedHelpText>' },
  
  // SuccessMessage
  { from: /<\/SuccessMessage>/g, to: '</OptimizedSuccessMessage>' },
  
  // InfoMessage
  { from: /<\/InfoMessage>/g, to: '</OptimizedInfoMessage>' },
  
  // ValidationContainer
  { from: /<\/ValidationContainer>/g, to: '</OptimizedValidationContainer>' },
  
  // ButtonGroup
  { from: /<\/ButtonGroup>/g, to: '</OptimizedButtonGroup>' },
  
  // LoadingOverlay
  { from: /<\/LoadingOverlay>/g, to: '</OptimizedLoadingOverlay>' },
  
  // ValidationButton
  { from: /<\/ValidationButton>/g, to: '</OptimizedValidationButton>' },
  
  // ResponsiveContainer
  { from: /<\/ResponsiveContainer>/g, to: '</OptimizedResponsiveContainer>' }
];

class JSXAllFixer {
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
    console.log('🔧 Corrigindo todas as tags JSX...\n');
    
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
      
      // Aplicar todas as correções
      for (const pattern of FIX_PATTERNS) {
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
  const fixer = new JSXAllFixer();
  fixer.fix();
}

module.exports = JSXAllFixer;
