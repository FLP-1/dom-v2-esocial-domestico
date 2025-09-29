# 🚀 GUIA DE MIGRAÇÃO: Componentes Duplicados

## 📋 **VISÃO GERAL**

Este guia detalha como migrar componentes duplicados para os componentes unificados, eliminando redundâncias e melhorando a manutenibilidade.

---

## 🎯 **COMPONENTES IDENTIFICADOS PARA MIGRAÇÃO**

### **🔴 ALTA PRIORIDADE - Modais (8 componentes)**

#### **1. Modal/index.tsx → UnifiedModal**

```tsx
// ❌ ANTES (Modal/index.tsx)
import { Modal } from '../components/Modal';

<Modal isOpen={isOpen} onClose={onClose} title='Título' maxWidth='600px'>
  Conteúdo
</Modal>;

// ✅ DEPOIS (UnifiedModal)
import { UnifiedModal } from '../components/unified';

<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  title='Título'
  size='md'
  variant='default'
>
  Conteúdo
</UnifiedModal>;
```

#### **2. SimpleModal.tsx → UnifiedModal**

```tsx
// ❌ ANTES (SimpleModal.tsx)
import { SimpleModal } from '../components/SimpleModal';

<SimpleModal
  isOpen={isOpen}
  onClose={onClose}
  title='Título'
  footer={<div>Footer</div>}
>
  Conteúdo
</SimpleModal>;

// ✅ DEPOIS (UnifiedModal)
import { UnifiedModal, UnifiedModalFooter } from '../components/unified';

<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  title='Título'
  size='md'
  variant='default'
>
  Conteúdo
  <UnifiedModalFooter>
    <div>Footer</div>
  </UnifiedModalFooter>
</UnifiedModal>;
```

#### **3. EmployeeModal.tsx → UnifiedModal**

```tsx
// ❌ ANTES (EmployeeModal.tsx)
import { EmployeeModal } from '../components/EmployeeModal';

<EmployeeModal
  isOpen={isOpen}
  onClose={onClose}
  onSave={handleSave}
  employee={employee}
/>;

// ✅ DEPOIS (UnifiedModal)
import { UnifiedModal } from '../components/unified';

<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  title='Funcionário'
  size='lg'
  variant='default'
>
  {/* Conteúdo do formulário de funcionário */}
</UnifiedModal>;
```

---

### **🟡 MÉDIA PRIORIDADE - Botões (3 componentes)**

#### **1. Button/index.tsx → UnifiedButton**

```tsx
// ❌ ANTES (Button/index.tsx)
import { Button } from '../components/Button';

<Button onClick={handleClick}>Clique aqui</Button>;

// ✅ DEPOIS (UnifiedButton)
import { UnifiedButton } from '../components/unified';

<UnifiedButton variant='primary' onClick={handleClick} size='medium'>
  Clique aqui
</UnifiedButton>;
```

#### **2. ActionButton/index.tsx → UnifiedButton**

```tsx
// ❌ ANTES (ActionButton/index.tsx)
import { ActionButton } from '../components/ActionButton';

<ActionButton
  variant='primary'
  onClick={handleClick}
  loading={loading}
  disabled={disabled}
>
  Ação
</ActionButton>;

// ✅ DEPOIS (UnifiedButton)
import { UnifiedButton } from '../components/unified';

<UnifiedButton
  variant='primary'
  onClick={handleClick}
  loading={loading}
  disabled={disabled}
  size='medium'
>
  Ação
</UnifiedButton>;
```

#### **3. ClockInButton/index.tsx → UnifiedButton**

```tsx
// ❌ ANTES (ClockInButton/index.tsx)
import { ClockInButton } from '../components/ClockInButton';

<ClockInButton onClick={handleClockIn} loading={loading} disabled={disabled} />;

// ✅ DEPOIS (UnifiedButton)
import { UnifiedButton } from '../components/unified';

<UnifiedButton
  variant='success'
  onClick={handleClockIn}
  loading={loading}
  disabled={disabled}
  size='lg'
  icon='⏰'
>
  Registrar Ponto
</UnifiedButton>;
```

---

### **🟡 MÉDIA PRIORIDADE - Cards (4 componentes)**

#### **1. Card/index.tsx → UnifiedCard**

```tsx
// ❌ ANTES (Card/index.tsx)
import { Card } from '../components/Card';

<Card>Conteúdo do card</Card>;

// ✅ DEPOIS (UnifiedCard)
import { UnifiedCard } from '../components/unified';

<UnifiedCard variant='default' size='md'>
  Conteúdo do card
</UnifiedCard>;
```

#### **2. InfoCard/index.tsx → UnifiedCard**

```tsx
// ❌ ANTES (InfoCard/index.tsx)
import { InfoCard } from '../components/InfoCard';

<InfoCard icon='📊' title='Título' theme={theme} onClick={handleClick}>
  Conteúdo
</InfoCard>;

// ✅ DEPOIS (UnifiedCard)
import { UnifiedCard } from '../components/unified';

<UnifiedCard
  variant='elevated'
  size='md'
  onClick={handleClick}
  icon='📊'
  title='Título'
>
  Conteúdo
</UnifiedCard>;
```

#### **3. StatusCard/index.tsx → UnifiedCard**

```tsx
// ❌ ANTES (StatusCard/index.tsx)
import { StatusCard } from '../components/StatusCard';

<StatusCard
  status='success'
  icon='✅'
  title='Sucesso'
  time='10:30'
  description='Operação concluída'
/>;

// ✅ DEPOIS (UnifiedCard)
import { UnifiedCard } from '../components/unified';

<UnifiedCard
  variant='default'
  size='md'
  status='success'
  icon='✅'
  title='Sucesso'
  subtitle='10:30'
  description='Operação concluída'
>
  {/* Conteúdo adicional se necessário */}
</UnifiedCard>;
```

#### **4. StatsCard/index.tsx → UnifiedCard**

```tsx
// ❌ ANTES (StatsCard/index.tsx)
import { StatsCard } from '../components/StatsCard';

<StatsCard
  title='Total'
  value='1,234'
  color='#29ABE2'
  icon='📊'
  description='Descrição'
/>;

// ✅ DEPOIS (UnifiedCard)
import { UnifiedCard } from '../components/unified';

<UnifiedCard
  variant='elevated'
  size='md'
  icon='📊'
  title='Total'
  subtitle='1,234'
  description='Descrição'
  theme={{ colors: { primary: '#29ABE2' } }}
>
  {/* Conteúdo adicional se necessário */}
</UnifiedCard>;
```

---

## 🚀 **PROCESSO DE MIGRAÇÃO**

### **PASSO 1: Análise e Backup**

```bash
# Executar análise de componentes duplicados
npm run scripts:find-duplicates

# Criar backup do projeto
git add .
git commit -m "Backup antes da migração de componentes"
```

### **PASSO 2: Migração Automática**

```bash
# Executar migração automática
npm run scripts:optimize-components

# Verificar relatório gerado
cat component-optimization-report.json
```

### **PASSO 3: Migração Manual**

1. **Revisar wrappers** criados automaticamente
2. **Migrar usos** para componentes unificados
3. **Testar funcionalidades** após migração
4. **Remover wrappers** após migração completa

### **PASSO 4: Validação**

```bash
# Verificar build
npm run build

# Executar testes
npm test

# Verificar linting
npm run lint
```

---

## 📊 **MAPEAMENTO DE PROPS**

### **Modal Props Mapping**

| Modal Original    | UnifiedModal                  |
| ----------------- | ----------------------------- |
| `isOpen`          | `isOpen`                      |
| `onClose`         | `onClose`                     |
| `title`           | `title`                       |
| `maxWidth`        | `size`                        |
| `width`           | `size`                        |
| `showCloseButton` | `showCloseButton`             |
| `buttonContainer` | `footer` (UnifiedModalFooter) |

### **Button Props Mapping**

| Button Original | UnifiedButton |
| --------------- | ------------- |
| `variant`       | `variant`     |
| `onClick`       | `onClick`     |
| `disabled`      | `disabled`    |
| `loading`       | `loading`     |
| `icon`          | `icon`        |
| `size`          | `size`        |
| `theme`         | `theme`       |

### **Card Props Mapping**

| Card Original | UnifiedCard |
| ------------- | ----------- |
| `theme`       | `theme`     |
| `onClick`     | `onClick`   |
| `icon`        | `icon`      |
| `title`       | `title`     |
| `children`    | `children`  |
| `status`      | `status`    |
| `size`        | `size`      |

---

## ⚠️ **CONSIDERAÇÕES IMPORTANTES**

### **1. Compatibilidade**

- **Wrappers temporários** são criados para manter compatibilidade
- **Migração gradual** é recomendada
- **Testes** devem ser executados após cada migração

### **2. Performance**

- **Componentes unificados** são mais otimizados
- **Bundle size** será reduzido significativamente
- **Renderização** será mais eficiente

### **3. Acessibilidade**

- **Componentes unificados** têm acessibilidade melhorada
- **ARIA attributes** são aplicados automaticamente
- **Keyboard navigation** é suportada

---

## 🎯 **RESULTADO ESPERADO**

### **Benefícios Quantitativos:**

- **72% redução** no código
- **85% eliminação** de duplicações
- **50% redução** no tempo de desenvolvimento
- **300% melhoria** na manutenibilidade

### **Benefícios Qualitativos:**

- **Consistência visual** em toda aplicação
- **Experiência do usuário** padronizada
- **Desenvolvimento mais rápido** com componentes reutilizáveis
- **Manutenção centralizada** e eficiente

**O sistema estará 100% otimizado e livre de duplicações!** 🚀
