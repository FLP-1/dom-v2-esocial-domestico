#!/usr/bin/env node

/**
 * Script de Validação do Design System
 * Verifica se todos os componentes estão usando o design system unificado
 */

const fs = require('fs');
const path = require('path');

// Configuração
const SRC_DIR = path.join(__dirname, '../src');
const COMPONENTS_DIR = path.join(SRC_DIR, 'components');

// Componentes legados que devem ser substituídos
const LEGACY_COMPONENTS = [
  'Button',
  'Card', 
  'StatsCard',
  'ActionButton'
];

// Componentes unificados que devem ser usados
const UNIFIED_COMPONENTS = [
  'UnifiedButton',
  'UnifiedCard',
  'UnifiedModal'
];

// Padrões de import que indicam uso de componentes legados
const LEGACY_IMPORT_PATTERNS = [
  /import.*Button.*from.*['"]\.\.\/components\/Button['"]/,
  /import.*Card.*from.*['"]\.\.\/components\/Card['"]/,
  /import.*StatsCard.*from.*['"]\.\.\/components\/StatsCard['"]/,
  /import.*ActionButton.*from.*['"]\.\.\/components\/ActionButton['"]/
];

// Padrões de import que indicam uso correto
const UNIFIED_IMPORT_PATTERNS = [
  /import.*UnifiedButton.*from.*['"]\.\.\/components\/unified['"]/,
  /import.*UnifiedCard.*from.*['"]\.\.\/components\/unified['"]/,
  /import.*UnifiedModal.*from.*['"]\.\.\/components\/unified['"]/
];

class DesignSystemValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.stats = {
      totalFiles: 0,
      legacyImports: 0,
      unifiedImports: 0,
      components: {
        Button: 0,
        Card: 0,
        Modal: 0
      }
    };
  }

  /**
   * Escaneia arquivos em busca de problemas
   */
  scanFiles() {
    console.log('🔍 Escaneando arquivos...\n');
    
    this.scanDirectory(SRC_DIR);
    
    console.log(`📊 Estatísticas:`);
    console.log(`   Total de arquivos: ${this.stats.totalFiles}`);
    console.log(`   Imports legados: ${this.stats.legacyImports}`);
    console.log(`   Imports unificados: ${this.stats.unifiedImports}`);
    console.log(`   Componentes Button: ${this.stats.components.Button}`);
    console.log(`   Componentes Card: ${this.stats.components.Card}`);
    console.log(`   Componentes Modal: ${this.stats.components.Modal}\n`);
  }

  /**
   * Escaneia um diretório recursivamente
   */
  scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Pular node_modules e outros diretórios desnecessários
        if (!['node_modules', '.git', '.next', 'dist'].includes(item)) {
          this.scanDirectory(fullPath);
        }
      } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts'))) {
        this.stats.totalFiles++;
        this.scanFile(fullPath);
      }
    }
  }

  /**
   * Escaneia um arquivo específico
   */
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(SRC_DIR, filePath);
      
      // Verificar imports legados
      this.checkLegacyImports(content, relativePath);
      
      // Verificar imports unificados
      this.checkUnifiedImports(content, relativePath);
      
      // Verificar uso de componentes
      this.checkComponentUsage(content, relativePath);
      
    } catch (error) {
      this.errors.push(`Erro ao ler arquivo ${filePath}: ${error.message}`);
    }
  }

  /**
   * Verifica imports de componentes legados
   */
  checkLegacyImports(content, filePath) {
    for (const pattern of LEGACY_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        this.stats.legacyImports++;
        this.warnings.push(`⚠️  ${filePath}: Import de componente legado detectado`);
      }
    }
  }

  /**
   * Verifica imports de componentes unificados
   */
  checkUnifiedImports(content, filePath) {
    for (const pattern of UNIFIED_IMPORT_PATTERNS) {
      if (pattern.test(content)) {
        this.stats.unifiedImports++;
      }
    }
  }

  /**
   * Verifica uso de componentes
   */
  checkComponentUsage(content, filePath) {
    // Contar uso de componentes
    if (content.includes('<Button')) this.stats.components.Button++;
    if (content.includes('<Card')) this.stats.components.Card++;
    if (content.includes('<Modal')) this.stats.components.Modal++;
    
    // Verificar se está usando componentes unificados
    if (content.includes('<UnifiedButton')) this.stats.components.Button++;
    if (content.includes('<UnifiedCard')) this.stats.components.Card++;
    if (content.includes('<UnifiedModal')) this.stats.components.Modal++;
  }

  /**
   * Gera relatório de validação
   */
  generateReport() {
    console.log('📋 Relatório de Validação do Design System\n');
    
    if (this.errors.length > 0) {
      console.log('❌ Erros encontrados:');
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log('⚠️  Avisos encontrados:');
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('✅ Nenhum problema encontrado! Design system está sendo usado corretamente.\n');
    }
    
    // Recomendações
    this.generateRecommendations();
  }

  /**
   * Gera recomendações baseadas nos resultados
   */
  generateRecommendations() {
    console.log('💡 Recomendações:');
    
    if (this.stats.legacyImports > 0) {
      console.log('   • Substitua imports de componentes legados por componentes unificados');
      console.log('   • Use: import { UnifiedButton, UnifiedCard, UnifiedModal } from "../components/unified"');
    }
    
    if (this.stats.unifiedImports === 0) {
      console.log('   • Nenhum componente unificado detectado - considere migrar');
    }
    
    if (this.stats.components.Button > 0) {
      console.log('   • Considere usar UnifiedButton para consistência');
    }
    
    if (this.stats.components.Card > 0) {
      console.log('   • Considere usar UnifiedCard para consistência');
    }
    
    if (this.stats.components.Modal > 0) {
      console.log('   • Considere usar UnifiedModal para consistência');
    }
    
    console.log('\n📚 Consulte src/design-system/BEST_PRACTICES.md para mais informações');
  }

  /**
   * Executa a validação completa
   */
  run() {
    console.log('🎨 Validador do Design System DOM v2.1.0\n');
    
    this.scanFiles();
    this.generateReport();
    
    // Retornar código de saída baseado nos resultados
    if (this.errors.length > 0) {
      process.exit(1);
    } else if (this.warnings.length > 0) {
      process.exit(2);
    } else {
      process.exit(0);
    }
  }
}

// Executar validação se chamado diretamente
if (require.main === module) {
  const validator = new DesignSystemValidator();
  validator.run();
}

module.exports = DesignSystemValidator;
