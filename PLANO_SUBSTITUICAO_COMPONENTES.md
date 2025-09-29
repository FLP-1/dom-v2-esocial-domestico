# 🔄 Plano de Substituição de Componentes Duplicados

## 📊 Análise dos Resultados

### **Componentes Identificados para Unificação**

#### **1. Modais (17 componentes) - PRIORIDADE ALTA**

- **Duplicados**: 17 modais diferentes
- **Impacto**: Alto (maior duplicação)
- **Estratégia**: Migração gradual para `UnifiedModal`

#### **2. Botões (5 componentes) - PRIORIDADE MÉDIA**

- **Duplicados**: ActionButton, Button, ClockInButton, LoadingStates, design-system/Button
- **Impacto**: Médio
- **Estratégia**: Unificar no design system

#### **3. Cards (6 componentes) - PRIORIDADE MÉDIA**

- **Duplicados**: Card, InfoCard, StatsCard, StatusCard, LoadingStates, design-system/Card
- **Impacto**: Médio
- **Estratégia**: Unificar no design system

---

## 🎯 Estratégia de Substituição

### **Fase 1: Modais (Semanas 1-2)**

#### **Ordem de Migração**

1. **SimpleModal** ✅ (Já migrado)
2. **Modal/index.tsx** (Próximo)
3. **Modais simples** (ValidationModal, TermsAcceptanceModal)
4. **Modais complexos** (EmployeeModal, EmployerModal)
5. **Modais multi-step** (EmployerModalMultiStep)

#### **Processo de Migração**

```bash
# 1. Criar versão migrada
cp src/components/Modal/index.tsx src/components/Modal/index.migrated.tsx

# 2. Atualizar imports gradualmente
# 3. Testar funcionalidade
# 4. Remover versão antiga
```

### **Fase 2: Botões (Semanas 3-4)**

#### **Componentes para Unificar**

- `ActionButton` → `design-system/Button`
- `ClockInButton` → `design-system/Button` (variante)
- `Button/index.tsx` → Remover (usar design system)

#### **Estratégia**

```tsx
// Antes
import ActionButton from '../components/ActionButton';

// Depois
import { Button } from '../design-system/components';
```

### **Fase 3: Cards (Semanas 5-6)**

#### **Componentes para Unificar**

- `InfoCard` → `design-system/Card` (variante info)
- `StatsCard` → `design-system/Card` (variante stats)
- `StatusCard` → `design-system/Card` (variante status)

---

## 🛠️ Implementação Prática

### **1. Script de Migração Automática**

```javascript
// scripts/migrate-components.js
const MIGRATION_MAP = {
  SimpleModal: 'UnifiedModal',
  Modal: 'UnifiedModal',
  ActionButton: 'Button',
  InfoCard: 'Card',
  StatsCard: 'Card',
  StatusCard: 'Card',
};

function migrateComponent(filePath, oldImport, newImport) {
  // Substituir imports
  // Atualizar props
  // Manter compatibilidade
}
```

### **2. Testes de Regressão**

```bash
# Executar antes de cada migração
npm test -- --testPathPattern="migration"

# Verificar funcionalidade
npm run test:integration

# Validar performance
npm run test:performance
```

### **3. Validação Visual**

```bash
# Comparar antes/depois
npm run storybook
npm run test:visual
```

---

## 📋 Checklist de Migração

### **Para Cada Componente**

#### **Antes da Migração**

- [ ] Fazer backup do componente
- [ ] Identificar todas as props utilizadas
- [ ] Mapear para nova API
- [ ] Criar testes de compatibilidade
- [ ] Documentar mudanças

#### **Durante a Migração**

- [ ] Criar wrapper de compatibilidade
- [ ] Atualizar imports gradualmente
- [ ] Testar em diferentes contextos
- [ ] Validar responsividade
- [ ] Verificar acessibilidade

#### **Após a Migração**

- [ ] Executar testes existentes
- [ ] Verificar performance
- [ ] Atualizar documentação
- [ ] Remover código legado
- [ ] Comunicar mudanças à equipe

---

## 🚨 Riscos e Mitigações

### **Riscos Identificados**

#### **1. Quebra de Funcionalidade**

- **Risco**: Alto
- **Mitigação**: Testes abrangentes, migração gradual
- **Rollback**: Manter versões antigas durante transição

#### **2. Regressão Visual**

- **Risco**: Médio
- **Mitigação**: Comparação lado a lado, testes visuais
- **Rollback**: Reverter para componente anterior

#### **3. Performance**

- **Risco**: Baixo
- **Mitigação**: Monitoramento contínuo, otimizações
- **Rollback**: Ajustar configurações

### **Plano de Rollback**

```bash
# 1. Reverter para versão anterior
git checkout HEAD~1 -- src/components/Modal/

# 2. Restaurar imports
# 3. Executar testes
# 4. Validar funcionalidade
```

---

## 📊 Métricas de Sucesso

### **Métricas Técnicas**

- [ ] Redução de 60% no código duplicado
- [ ] Melhoria de 30% no tempo de build
- [ ] 100% dos componentes com testes
- [ ] 0 erros de acessibilidade

### **Métricas de Qualidade**

- [ ] Consistência visual em todos os componentes
- [ ] Performance otimizada
- [ ] Manutenibilidade melhorada
- [ ] Documentação completa

---

## 🎯 Cronograma Detalhado

### **Semana 1: Modais Simples**

- [ ] Migrar SimpleModal ✅
- [ ] Migrar Modal/index.tsx
- [ ] Migrar ValidationModal
- [ ] Migrar TermsAcceptanceModal

### **Semana 2: Modais Complexos**

- [ ] Migrar EmployeeModal
- [ ] Migrar EmployerModal
- [ ] Migrar PayrollModalNew
- [ ] Migrar ReportModal

### **Semana 3: Modais Especiais**

- [ ] Migrar EmployerModalMultiStep
- [ ] Migrar CertificateUploadModal
- [ ] Migrar PasswordChangeModal
- [ ] Migrar ProxyUploadModal

### **Semana 4: Botões**

- [ ] Unificar ActionButton
- [ ] Unificar ClockInButton
- [ ] Remover Button/index.tsx
- [ ] Atualizar imports

### **Semana 5: Cards**

- [ ] Unificar InfoCard
- [ ] Unificar StatsCard
- [ ] Unificar StatusCard
- [ ] Atualizar imports

### **Semana 6: Finalização**

- [ ] Remover código legado
- [ ] Atualizar documentação
- [ ] Treinamento da equipe
- [ ] Monitoramento pós-implementação

---

## 🛠️ Ferramentas de Apoio

### **1. Scripts de Migração**

```bash
# Encontrar componentes duplicados
node scripts/find-duplicate-components.js

# Migrar componente específico
node scripts/migrate-component.js --component=SimpleModal

# Validar migração
node scripts/validate-migration.js --component=SimpleModal
```

### **2. Testes Automatizados**

```bash
# Testes de compatibilidade
npm run test:compatibility

# Testes de performance
npm run test:performance

# Testes visuais
npm run test:visual
```

### **3. Monitoramento**

```bash
# Verificar bundle size
npm run analyze:bundle

# Verificar duplicação
npm run analyze:duplicates

# Verificar performance
npm run analyze:performance
```

---

## 📞 Suporte e Comunicação

### **Canais de Comunicação**

- **Slack**: #frontend-migration
- **Email**: frontend-team@company.com
- **Reuniões**: Segundas e Quartas, 14h

### **Responsabilidades**

- **Líder Técnico**: Arquitetura e decisões técnicas
- **Desenvolvedores**: Implementação e testes
- **QA**: Validação e testes de regressão
- **UX/UI**: Validação visual e de usabilidade

---

## 🎯 Próximos Passos Imediatos

1. **Aprovar plano de migração**
2. **Definir cronograma com a equipe**
3. **Criar ambiente de teste**
4. **Iniciar migração do SimpleModal**
5. **Validar primeira migração**

---

_Plano criado em: $(date)_
_Versão: 1.0_
_Status: Em Aprovação_
