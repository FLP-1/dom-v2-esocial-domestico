# 🎨 Design System - Melhores Práticas

## 📋 Visão Geral

Este documento contém as melhores práticas para usar o design system unificado do DOM v2.1.0.

## 🚀 Componentes Unificados

### UnifiedButton

```tsx
import { UnifiedButton } from '../components/unified';

// ✅ Correto - Use as variantes disponíveis
<UnifiedButton variant="primary" size="lg">
  Salvar
</UnifiedButton>

// ✅ Correto - Com ícone
<UnifiedButton variant="success" icon="✅">
  Confirmar
</UnifiedButton>

// ❌ Evite - Não use estilos inline
<UnifiedButton style={{ color: 'red' }}>
  Botão
</UnifiedButton>
```

### UnifiedCard

```tsx
import { UnifiedCard } from '../components/unified';

// ✅ Correto - Use as variantes
<UnifiedCard variant="elevated" size="lg">
  <h3>Título</h3>
  <p>Conteúdo do card</p>
</UnifiedCard>

// ✅ Correto - Com tema
<UnifiedCard variant="outlined" theme={theme}>
  Conteúdo
</UnifiedCard>
```

### UnifiedModal

```tsx
import { UnifiedModal } from '../components/unified';

// ✅ Correto - Use as variantes
<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  variant="compact"
  maxWidth="500px"
>
  Conteúdo do modal
</UnifiedModal>

// ✅ Correto - Modal fullscreen
<UnifiedModal
  isOpen={isOpen}
  onClose={onClose}
  variant="fullscreen"
  maxWidth="1000px"
>
  Conteúdo complexo
</UnifiedModal>
```

## 🎯 Regras de Uso

### 1. Sempre Use Componentes Unificados

```tsx
// ✅ Correto
import {
  UnifiedButton,
  UnifiedCard,
  UnifiedModal,
} from '../components/unified';

// ❌ Evite - Componentes legados
import { Button } from '../components/Button';
import { Card } from '../components/Card';
```

### 2. Use Tokens do Design System

```tsx
// ✅ Correto - Use tokens
const StyledComponent = styled.div`
  color: ${props => props.theme.colors.primary};
  padding: ${props => props.theme.spacing.md};
  border-radius: ${props => props.theme.borderRadius};
`;

// ❌ Evite - Valores hardcoded
const StyledComponent = styled.div`
  color: #007bff;
  padding: 16px;
  border-radius: 8px;
`;
```

### 3. Respeite o Sistema de Temas

```tsx
// ✅ Correto - Use o contexto de tema
const MyComponent = () => {
  const { theme } = useTheme();

  return (
    <UnifiedButton theme={theme} variant='primary'>
      Botão
    </UnifiedButton>
  );
};
```

## 🔧 Performance

### 1. Lazy Loading

```tsx
// ✅ Correto - Lazy loading para modais complexos
const EmployeeModal = lazy(() => import('./EmployeeModal'));

const App = () => (
  <Suspense fallback={<div>Carregando...</div>}>
    <EmployeeModal />
  </Suspense>
);
```

### 2. Memoização

```tsx
// ✅ Correto - Memoize componentes pesados
const ExpensiveComponent = memo(({ data }) => {
  return <div>{/* Componente complexo */}</div>;
});
```

### 3. Otimização de Re-renders

```tsx
// ✅ Correto - Use useCallback para funções
const MyComponent = () => {
  const handleClick = useCallback(() => {
    // Lógica do clique
  }, []);

  return <UnifiedButton onClick={handleClick}>Clique</UnifiedButton>;
};
```

## 📱 Responsividade

### 1. Use Breakpoints do Design System

```tsx
const ResponsiveComponent = styled.div`
  padding: ${props => props.theme.spacing.sm};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing.lg};
  }
`;
```

### 2. Mobile-First

```tsx
// ✅ Correto - Mobile-first
const MobileFirstComponent = styled.div`
  font-size: ${props => props.theme.fontSizes.sm};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSizes.lg};
  }
`;
```

## ♿ Acessibilidade

### 1. Sempre Use Labels

```tsx
// ✅ Correto
<UnifiedButton aria-label="Fechar modal">
  <AccessibleEmoji emoji="❌" label="Fechar" />
</UnifiedButton>

// ❌ Evite
<UnifiedButton>
  ❌
</UnifiedButton>
```

### 2. Navegação por Teclado

```tsx
// ✅ Correto - Suporte a teclado
<UnifiedButton
  onClick={handleClick}
  onKeyDown={e => e.key === 'Enter' && handleClick()}
>
  Botão
</UnifiedButton>
```

## 🧪 Testes

### 1. Teste Componentes Unificados

```tsx
// ✅ Correto - Teste as variantes
describe('UnifiedButton', () => {
  it('should render primary variant', () => {
    render(<UnifiedButton variant='primary'>Test</UnifiedButton>);
    expect(screen.getByRole('button')).toHaveClass('primary');
  });
});
```

### 2. Teste Acessibilidade

```tsx
// ✅ Correto - Teste acessibilidade
import { axe, toHaveNoViolations } from 'jest-axe';

test('should not have accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## 📊 Métricas de Qualidade

### 1. Bundle Size

- UnifiedButton: ~2KB
- UnifiedCard: ~3KB
- UnifiedModal: ~5KB

### 2. Performance

- First Paint: < 1.5s
- First Contentful Paint: < 2s
- Lighthouse Score: > 90

## 🚨 Anti-Padrões

### ❌ Não Faça

```tsx
// ❌ Estilos inline
<UnifiedButton style={{ color: 'red' }}>

// ❌ Componentes legados
import { Button } from '../components/Button';

// ❌ Valores hardcoded
const color = '#007bff';

// ❌ Sem acessibilidade
<UnifiedButton>❌</UnifiedButton>
```

### ✅ Faça Assim

```tsx
// ✅ Use tokens
<UnifiedButton variant="danger">

// ✅ Componentes unificados
import { UnifiedButton } from '../components/unified';

// ✅ Use tokens
const color = theme.colors.primary;

// ✅ Com acessibilidade
<UnifiedButton aria-label="Fechar">
  <AccessibleEmoji emoji="❌" label="Fechar" />
</UnifiedButton>
```

## 🔄 Migração

### 1. Substitua Componentes Legados

```tsx
// Antes
import { Button } from '../components/Button';
<Button>Clique</Button>;

// Depois
import { UnifiedButton } from '../components/unified';
<UnifiedButton variant='primary'>Clique</UnifiedButton>;
```

### 2. Atualize Imports

```tsx
// Antes
import { Button, Card, Modal } from '../components';

// Depois
import {
  UnifiedButton,
  UnifiedCard,
  UnifiedModal,
} from '../components/unified';
```

## 📚 Recursos Adicionais

- [Design System Tokens](./tokens/)
- [Componentes Unificados](../components/unified/)
- [Guia de Temas](./themes/)
- [Testes de Acessibilidade](./tests/)

---

**Última atualização:** Dezembro 2024  
**Versão:** 2.1.0  
**Mantenedor:** Equipe DOM
