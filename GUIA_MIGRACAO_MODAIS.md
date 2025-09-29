# 🔄 Guia de Migração de Modais

## 📋 Visão Geral

Este guia detalha como migrar os modais existentes para o novo sistema unificado do design system.

---

## 🎯 Objetivo da Migração

- **Unificar**: Reduzir duplicação de código
- **Padronizar**: Aplicar design system consistente
- **Melhorar**: Acessibilidade e responsividade
- **Otimizar**: Performance e manutenibilidade

---

## 📊 Status dos Modais

### ✅ **Modais Identificados para Migração**

| Modal                    | Status         | Prioridade | Complexidade |
| ------------------------ | -------------- | ---------- | ------------ |
| `SimpleModal`            | 🔄 Em migração | Alta       | Baixa        |
| `Modal/index.tsx`        | 🔄 Em migração | Alta       | Baixa        |
| `EmployeeModal`          | ⏳ Pendente    | Alta       | Média        |
| `EmployerModal`          | ⏳ Pendente    | Alta       | Média        |
| `EmployerModalMultiStep` | ⏳ Pendente    | Média      | Alta         |
| `PayrollModalNew`        | ⏳ Pendente    | Média      | Média        |
| `ReportModal`            | ⏳ Pendente    | Média      | Média        |
| `TaxGuideModalNew`       | ⏳ Pendente    | Baixa      | Baixa        |
| `TermsAcceptanceModal`   | ⏳ Pendente    | Baixa      | Baixa        |
| `ProfileSelectionModal`  | ⏳ Pendente    | Média      | Média        |
| `CertificateUploadModal` | ⏳ Pendente    | Baixa      | Baixa        |
| `PasswordChangeModal`    | ⏳ Pendente    | Baixa      | Baixa        |
| `ProxyUploadModal`       | ⏳ Pendente    | Baixa      | Baixa        |
| `ValidationModal`        | ⏳ Pendente    | Baixa      | Baixa        |

---

## 🚀 Processo de Migração

### **Passo 1: Preparação**

```bash
# 1. Fazer backup do componente atual
cp src/components/Modal/index.tsx src/components/Modal/index.tsx.backup

# 2. Verificar dependências
grep -r "import.*Modal" src/ --include="*.tsx" --include="*.ts"
```

### **Passo 2: Migração Básica**

#### **Antes (Modal Legado)**

```tsx
import Modal from '../components/Modal';

<Modal
  isOpen={isOpen}
  onClose={onClose}
  title='Título do Modal'
  maxWidth='600px'
  showCloseButton={true}
>
  <div>Conteúdo do modal</div>
</Modal>;
```

#### **Depois (UnifiedModal)**

```tsx
import { UnifiedModal } from '../design-system/components/UnifiedModal';

<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  title='Título do Modal'
  maxWidth='600px'
  showCloseButton={true}
  theme={theme}
  variant='default'
  size='md'
>
  <div>Conteúdo do modal</div>
</UnifiedModal>;
```

### **Passo 3: Migração com Footer**

#### **Antes**

```tsx
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title='Modal com Footer'
  buttonContainer={
    <div>
      <button onClick={onClose}>Cancelar</button>
      <button onClick={handleSave}>Salvar</button>
    </div>
  }
>
  <div>Conteúdo</div>
</Modal>
```

#### **Depois**

```tsx
<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  title='Modal com Footer'
  footer={
    <div>
      <button onClick={onClose}>Cancelar</button>
      <button onClick={handleSave}>Salvar</button>
    </div>
  }
  theme={theme}
>
  <div>Conteúdo</div>
</UnifiedModal>
```

---

## 🎨 Variantes Disponíveis

### **1. Variante Default**

```tsx
<UnifiedModal
  variant="default"
  size="md"
  // ... outras props
>
```

### **2. Variante Drawer (Mobile)**

```tsx
<UnifiedModal
  variant="drawer"
  size="lg"
  // ... outras props
>
```

### **3. Variante Fullscreen**

```tsx
<UnifiedModal
  variant="fullscreen"
  size="full"
  // ... outras props
>
```

---

## 📏 Tamanhos Disponíveis

| Tamanho | Max Width | Uso Recomendado        |
| ------- | --------- | ---------------------- |
| `sm`    | 400px     | Alertas, confirmações  |
| `md`    | 600px     | Formulários simples    |
| `lg`    | 800px     | Formulários complexos  |
| `xl`    | 1000px    | Dashboards, relatórios |
| `full`  | 100%      | Telas completas        |

---

## 🔧 Configurações Avançadas

### **Controle de Comportamento**

```tsx
<UnifiedModal
  closeOnOverlayClick={false}  // Não fechar ao clicar no overlay
  closeOnEscape={false}         // Não fechar com ESC
  showCloseButton={false}      // Ocultar botão de fechar
  // ... outras props
>
```

### **Tema Personalizado**

```tsx
<UnifiedModal
  theme={{
    colors: {
      primary: '#E74C3C',
      secondary: '#C0392B',
      // ... outras cores
    }
  }}
  // ... outras props
>
```

---

## 🧪 Testes Durante Migração

### **1. Teste de Funcionalidade**

```tsx
// Verificar se o modal abre e fecha corretamente
expect(screen.getByText('Título do Modal')).toBeInTheDocument();
fireEvent.click(screen.getByLabelText('Fechar modal'));
expect(onClose).toHaveBeenCalled();
```

### **2. Teste de Responsividade**

```tsx
// Simular viewport móvel
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 375,
});

// Verificar se o modal se adapta
expect(modal).toHaveStyle('max-width: 100%');
```

### **3. Teste de Acessibilidade**

```tsx
// Verificar roles e labels
expect(screen.getByRole('dialog')).toBeInTheDocument();
expect(screen.getByLabelText('Fechar modal')).toBeInTheDocument();
```

---

## 📋 Checklist de Migração

### **Antes da Migração**

- [ ] Fazer backup do componente atual
- [ ] Identificar todas as props utilizadas
- [ ] Verificar dependências
- [ ] Criar testes para o componente atual

### **Durante a Migração**

- [ ] Substituir import
- [ ] Mapear props antigas para novas
- [ ] Aplicar tema correto
- [ ] Testar funcionalidade básica
- [ ] Verificar responsividade
- [ ] Validar acessibilidade

### **Após a Migração**

- [ ] Executar testes existentes
- [ ] Testar em diferentes navegadores
- [ ] Verificar performance
- [ ] Atualizar documentação
- [ ] Remover código legado

---

## 🚨 Problemas Comuns e Soluções

### **1. Modal não fecha com ESC**

```tsx
// ❌ Problema
<UnifiedModal closeOnEscape={false} />

// ✅ Solução
<UnifiedModal closeOnEscape={true} />
```

### **2. Tema não aplicado**

```tsx
// ❌ Problema
<UnifiedModal theme={undefined} />

// ✅ Solução
<UnifiedModal theme={currentTheme} />
```

### **3. Responsividade quebrada**

```tsx
// ❌ Problema
<UnifiedModal size="xl" variant="default" />

// ✅ Solução
<UnifiedModal size="lg" variant="drawer" />
```

---

## 📊 Métricas de Sucesso

### **Antes da Migração**

- Código duplicado: ~40%
- Tempo de build: ~2min
- Testes passando: 85%
- Acessibilidade: 70%

### **Após a Migração**

- Código duplicado: ~10%
- Tempo de build: ~1.5min
- Testes passando: 95%
- Acessibilidade: 90%

---

## 🎯 Próximos Passos

1. **Migrar SimpleModal** (Prioridade Alta)
2. **Migrar Modal/index.tsx** (Prioridade Alta)
3. **Migrar EmployeeModal** (Prioridade Alta)
4. **Migrar EmployerModal** (Prioridade Alta)
5. **Migrar modais restantes** (Prioridade Média/Baixa)

---

## 📞 Suporte

Para dúvidas ou problemas durante a migração:

1. **Verificar este guia**
2. **Consultar testes existentes**
3. **Revisar documentação do design system**
4. **Contatar equipe de desenvolvimento**

---

_Guia criado em: $(date)_
_Versão: 1.0_
_Status: Em Uso_
