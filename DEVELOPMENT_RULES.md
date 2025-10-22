# 🛡️ REGRAS DE DESENVOLVIMENTO - PROJETO DOM

## ⚠️ REGRAS OBRIGATÓRIAS - NÃO PODEM SER QUEBRADAS

### 🚫 **PROIBIÇÕES ABSOLUTAS**

#### **1. Stack Tecnológica - TRAVA RÍGIDA**

- ❌ **NUNCA** usar bibliotecas fora da stack aprovada
- ❌ **NUNCA** adicionar dependências sem aprovação
- ❌ **NUNCA** usar CSS puro (apenas styled-components)
- ❌ **NUNCA** usar bibliotecas de UI externas (Material-UI, Ant Design, etc.)
- ❌ **NUNCA** usar JavaScript puro (apenas TypeScript)

#### **2. Estrutura de Arquivos - PADRÃO OBRIGATÓRIO**

- ❌ **NUNCA** criar arquivos fora da estrutura definida
- ❌ **NUNCA** misturar lógica de negócio com componentes UI
- ❌ **NUNCA** criar componentes sem index.tsx
- ❌ **NUNCA** usar imports relativos longos (máximo 2 níveis)

#### **3. Componentes - REGRAS RÍGIDAS**

- ❌ **NUNCA** criar componentes sem TypeScript
- ❌ **NUNCA** usar props sem tipagem
- ❌ **NUNCA** criar componentes sem styled-components
- ❌ **NUNCA** usar className (apenas styled-components)
- ❌ **NUNCA** criar componentes sem export default

#### **4. Estado e Dados - CONTROLE RIGOROSO**

- ❌ **NUNCA** usar Redux ou Zustand (apenas Context/useState)
- ❌ **NUNCA** criar estado global sem Context
- ❌ **NUNCA** usar localStorage sem validação
- ❌ **NUNCA** criar dados hardcoded sem mock data

### ✅ **OBRIGAÇÕES ABSOLUTAS**

#### **1. TypeScript - 100% OBRIGATÓRIO**

- ✅ **SEMPRE** tipar todas as props, estados e funções
- ✅ **SEMPRE** usar interfaces para objetos complexos
- ✅ **SEMPRE** validar tipos em runtime quando necessário
- ✅ **SEMPRE** usar strict mode do TypeScript

#### **2. Styled-Components - PADRÃO ÚNICO**

- ✅ **SEMPRE** usar styled-components para estilização
- ✅ **SEMPRE** usar tema centralizado (theme.ts)
- ✅ **SEMPRE** usar transient props ($prop) para props do styled-components
- ✅ **SEMPRE** usar keyframes para animações

#### **3. Componentes - ESTRUTURA OBRIGATÓRIA**

- ✅ **SEMPRE** criar pasta para cada componente
- ✅ **SEMPRE** usar index.tsx como arquivo principal
- ✅ **SEMPRE** exportar como default
- ✅ **SEMPRE** usar Props interface tipada

#### **4. Validação e Segurança**

- ✅ **SEMPRE** validar CPF com cpfValidator
- ✅ **SEMPRE** usar try/catch em operações assíncronas
- ✅ **SEMPRE** sanitizar inputs do usuário
- ✅ **SEMPRE** usar toast para feedback

## 📋 **PADRÕES DE CÓDIGO OBRIGATÓRIOS**

### **1. Estrutura de Componente**

```typescript
// ✅ CORRETO
interface ComponentProps {
  title: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const StyledComponent = styled.div<{ $variant?: string }>`
  // estilos aqui
`;

export default function Component({ title, onClick, variant = 'primary' }: ComponentProps) {
  return (
    <StyledComponent $variant={variant} onClick={onClick}>
      {title}
    </StyledComponent>
  );
}
```

### **2. Imports - ORDEM OBRIGATÓRIA**

```typescript
// 1. React e Next.js
import React from 'react';
import { useRouter } from 'next/router';

// 2. Bibliotecas externas
import styled from 'styled-components';
import { toast } from 'react-toastify';

// 3. Componentes internos
import { Button } from '../components/Button';
import { Card } from '../components/Card';

// 4. Utilitários e tipos
import { validateCpf } from '../utils/cpfValidator';
import { Profile } from '../types';
```

### **3. Nomenclatura - PADRÃO RÍGIDO**

- **Componentes**: PascalCase (ex: `UserProfile`)
- **Arquivos**: camelCase (ex: `userProfile.tsx`)
- **Pastas**: camelCase (ex: `userProfile/`)
- **Props**: camelCase (ex: `isVisible`)
- **Styled Components**: PascalCase (ex: `StyledContainer`)
- **Transient Props**: $ prefix (ex: `$isVisible`)

## 🔒 **TRAVAS DE SEGURANÇA**

### **1. ESLint Rules - CONFIGURAÇÃO RÍGIDA**

- `@typescript-eslint/no-explicit-any`: error
- `@typescript-eslint/no-unused-vars`: error
- `react/prop-types`: off (usando TypeScript)
- `no-console`: warn (apenas em desenvolvimento)

### **2. Prettier - FORMATAÇÃO OBRIGATÓRIA**

- Sempre usar aspas simples
- Sempre usar ponto e vírgula
- Sempre usar trailing comma
- Sempre usar 2 espaços para indentação

### **3. Git Hooks - VALIDAÇÃO AUTOMÁTICA**

- Pre-commit: ESLint + Prettier + TypeScript check
- Pre-push: Testes unitários (quando implementados)

## 🚨 **VALIDAÇÕES AUTOMÁTICAS**

### **1. Build Validation**

- TypeScript compilation obrigatória
- ESLint sem erros
- Prettier formatado
- Imports válidos

### **2. Runtime Validation**

- Props validation com TypeScript
- Error boundaries em componentes críticos
- Toast notifications para erros

## 📚 **DOCUMENTAÇÃO OBRIGATÓRIA**

### **1. Todo Componente Deve Ter**

- Interface Props documentada
- Exemplo de uso em comentário
- JSDoc para funções complexas

### **2. Todo Arquivo Deve Ter**

- Header com descrição
- Imports organizados
- Exports claros

## 🔄 **PROCESSO DE DESENVOLVIMENTO**

### **1. Antes de Criar Qualquer Código**

1. ✅ Verificar se está na stack aprovada
2. ✅ Verificar estrutura de pastas
3. ✅ Verificar nomenclatura
4. ✅ Verificar tipagem TypeScript

### **2. Durante o Desenvolvimento**

1. ✅ Seguir padrões de código
2. ✅ Usar styled-components
3. ✅ Validar com ESLint/Prettier
4. ✅ Testar funcionalidade

### **3. Antes de Finalizar**

1. ✅ Verificar todas as regras
2. ✅ Executar build sem erros
3. ✅ Validar responsividade
4. ✅ Testar em diferentes perfis

## ⚡ **COMANDOS DE VALIDAÇÃO**

```bash
# Verificar regras
npm run lint
npm run format
npm run type-check
npm run build

# Corrigir automaticamente
npm run lint:fix
npm run format:fix
```

## 🎯 **OBJETIVO DESTAS REGRAS**

- **Consistência**: Código uniforme e previsível
- **Qualidade**: Padrões altos de desenvolvimento
- **Manutenibilidade**: Fácil manutenção e evolução
- **Colaboração**: Qualquer desenvolvedor pode contribuir
- **Segurança**: Redução de bugs e vulnerabilidades

---

## ⚠️ **LEMBRE-SE: ESTAS REGRAS SÃO INEGOCIÁVEIS**

Qualquer violação destas regras deve ser corrigida imediatamente.
O objetivo é criar um ambiente de desenvolvimento seguro, consistente e de alta qualidade.

**"Código limpo não é escrito seguindo um conjunto de regras. Você não se torna um artesão de software aprendendo uma lista de heurísticas. A proficiência profissional vem apenas com a prática contínua."** - Robert C. Martin
