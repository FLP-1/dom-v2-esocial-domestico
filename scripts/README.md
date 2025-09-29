# 🚀 Scripts de Automação TypeScript

Este diretório contém scripts de automação escritos em TypeScript para manter a consistência do projeto.

## 📋 Scripts Disponíveis

### 🔍 **find-duplicate-components.ts**

- **Descrição**: Analisa componentes duplicados no projeto
- **Comando**: `npm run scripts:find-duplicates`
- **Saída**: Relatório JSON com componentes similares

### 🔄 **migrate-pages-to-unified.ts**

- **Descrição**: Migra páginas para usar componentes unificados
- **Comando**: `npm run scripts:migrate-pages`
- **Funcionalidade**: Substitui ActionButton → UnifiedButton, Modal → UnifiedModal

### 🎨 **fix-inline-styles.ts**

- **Descrição**: Converte estilos inline para styled-components
- **Comando**: `npm run scripts:fix-styles`
- **Funcionalidade**: Remove estilos inline e cria styled-components

### 🧹 **clean-styled-components.ts**

- **Descrição**: Limpa componentes StyledComponent malformados
- **Comando**: `npm run scripts:clean-components`
- **Funcionalidade**: Remove tags `<StyledComponent>` malformadas

### 🗑️ **final-cleanup-styled-components.ts**

- **Descrição**: Limpeza final de StyledComponent
- **Comando**: `npm run scripts:final-cleanup`
- **Funcionalidade**: Remove todos os StyledComponent restantes

### 🗑️ **remove-legacy-code.ts**

- **Descrição**: Remove código legado não utilizado
- **Comando**: `npm run scripts:remove-legacy`
- **Funcionalidade**: Remove componentes antigos e limpa dependências

## 🚀 Execução

### Executar Script Individual

```bash
npm run scripts:find-duplicates
npm run scripts:migrate-pages
npm run scripts:fix-styles
npm run scripts:clean-components
npm run scripts:final-cleanup
npm run scripts:remove-legacy
```

### Executar Todos os Scripts

```bash
npm run scripts:run-all
```

### Executar Script Diretamente

```bash
npx ts-node scripts/find-duplicate-components.ts
npx ts-node scripts/migrate-pages-to-unified.ts
npx ts-node scripts/fix-inline-styles.ts
npx ts-node scripts/clean-styled-components.ts
npx ts-node scripts/final-cleanup-styled-components.ts
npx ts-node scripts/remove-legacy-code.ts
```

## 📁 Estrutura dos Scripts

```
scripts/
├── README.md                           # Esta documentação
├── run-scripts.ts                      # Executor principal
├── find-duplicate-components.ts        # Análise de duplicatas
├── migrate-pages-to-unified.ts         # Migração de páginas
├── fix-inline-styles.ts               # Conversão de estilos
├── clean-styled-components.ts         # Limpeza de componentes
├── final-cleanup-styled-components.ts # Limpeza final
└── remove-legacy-code.ts              # Remoção de código legado
```

## 🔧 Configuração

### Dependências Necessárias

```bash
npm install -D ts-node typescript @types/node
```

### Configuração do TypeScript

Os scripts usam a configuração do `tsconfig.json` do projeto.

## 📊 Relatórios

### find-duplicate-components.ts

- **Arquivo**: `duplicate-components-report.json`
- **Conteúdo**: Lista de componentes duplicados com similaridade

### remove-legacy-code.ts

- **Backups**: Arquivos `.backup-{timestamp}`
- **Logs**: Console com progresso da remoção

## ⚠️ Avisos Importantes

1. **Backups Automáticos**: Todos os scripts criam backups antes de modificar arquivos
2. **Validação**: Scripts validam build após modificações
3. **Dependências**: Verificam se componentes estão sendo usados antes de remover
4. **TypeScript**: Todos os scripts são tipados e validados

## 🎯 Benefícios

- ✅ **Consistência**: Todos os scripts em TypeScript
- ✅ **Tipagem**: IntelliSense e validação de tipos
- ✅ **Manutenibilidade**: Código mais legível e organizável
- ✅ **Integração**: Funciona com o ecossistema TypeScript do projeto
- ✅ **Documentação**: Código auto-documentado com tipos

## 🔄 Fluxo de Uso Recomendado

1. **Análise**: `npm run scripts:find-duplicates`
2. **Migração**: `npm run scripts:migrate-pages`
3. **Estilos**: `npm run scripts:fix-styles`
4. **Limpeza**: `npm run scripts:clean-components`
5. **Finalização**: `npm run scripts:final-cleanup`
6. **Remoção**: `npm run scripts:remove-legacy`

Ou execute tudo de uma vez:

```bash
npm run scripts:run-all
```
