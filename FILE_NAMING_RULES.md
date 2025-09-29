# 📁 REGRAS DE NOMENCLATURA DE ARQUIVOS - PROJETO DOM v2

## 🚨 **REGRAS OBRIGATÓRIAS - NÃO PODEM SER QUEBRADAS**

### **1. ESTRUTURA DE PASTAS**

#### **Componentes**

- ✅ **Pasta**: PascalCase (ex: `UserProfile`, `Button`, `Modal`)
- ✅ **Arquivo**: `index.tsx` (obrigatório)
- ✅ **Exemplo**: `src/components/UserProfile/index.tsx`

#### **Páginas**

- ✅ **Pasta**: `pages` (sem subpastas)
- ✅ **Arquivo**: camelCase.tsx (ex: `userProfile.tsx`)
- ✅ **Exemplo**: `src/pages/userProfile.tsx`

#### **Utilitários**

- ✅ **Pasta**: `utils` (sem subpastas)
- ✅ **Arquivo**: camelCase.ts (ex: `cpfValidator.ts`)
- ✅ **Exemplo**: `src/utils/cpfValidator.ts`

#### **Estilos**

- ✅ **Pasta**: `styles` (sem subpastas)
- ✅ **Arquivo**: PascalCase.ts (ex: `GlobalStyle.ts`)
- ✅ **Exemplo**: `src/styles/GlobalStyle.ts`

#### **Hooks**

- ✅ **Pasta**: `hooks` (sem subpastas)
- ✅ **Arquivo**: usePascalCase.ts (ex: `useAuth.ts`)
- ✅ **Exemplo**: `src/hooks/useAuth.ts`

#### **Contextos**

- ✅ **Pasta**: `contexts` (sem subpastas)
- ✅ **Arquivo**: PascalCaseContext.ts (ex: `AuthContext.ts`)
- ✅ **Exemplo**: `src/contexts/AuthContext.ts`

#### **Tipos**

- ✅ **Pasta**: `src` (raiz)
- ✅ **Arquivo**: `types.ts` (obrigatório)
- ✅ **Exemplo**: `src/types.ts`

### **2. PADRÕES DE NOMENCLATURA**

#### **PascalCase** (Primeira letra maiúscula)

- **Componentes**: `UserProfile`, `Button`, `Modal`
- **Estilos**: `GlobalStyle`, `Theme`, `Colors`
- **Contextos**: `AuthContext`, `UserContext`

#### **camelCase** (Primeira letra minúscula)

- **Páginas**: `userProfile`, `dashboard`, `login`
- **Utilitários**: `cpfValidator`, `dateFormatter`, `apiClient`
- **Hooks**: `useAuth`, `useLocalStorage`, `useApi`

#### **kebab-case** (Hífens)

- **Arquivos de configuração**: `next.config.js`, `tsconfig.json`
- **Documentação**: `file-naming-rules.md`

### **3. EXTENSÕES OBRIGATÓRIAS**

#### **TypeScript React**

- ✅ **Componentes**: `.tsx`
- ✅ **Páginas**: `.tsx`
- ✅ **Hooks**: `.ts`
- ✅ **Contextos**: `.ts`
- ✅ **Utilitários**: `.ts`
- ✅ **Estilos**: `.ts`
- ✅ **Tipos**: `.ts`

#### **JavaScript** (Proibido)

- ❌ **NUNCA** usar `.js`
- ❌ **NUNCA** usar `.jsx`

### **4. PALAVRAS PROIBIDAS**

#### **Nomes de Arquivos**

- ❌ `test`, `spec`, `mock`, `stub`
- ❌ `temp`, `tmp`, `backup`, `old`, `new`
- ❌ `copy`, `duplicate`, `final`, `draft`

#### **Nomes de Pastas**

- ❌ `test`, `spec`, `mock`, `stub`
- ❌ `temp`, `tmp`, `backup`, `old`, `new`
- ❌ `copy`, `duplicate`, `final`, `draft`

### **5. CARACTERES PROIBIDOS**

#### **Nomes de Arquivos**

- ❌ Espaços: `user profile.tsx`
- ❌ Caracteres especiais: `user@profile.tsx`
- ❌ Símbolos: `user#profile.tsx`
- ❌ Acentos: `usuário.tsx`

#### **Nomes de Pastas**

- ❌ Espaços: `user profile/`
- ❌ Caracteres especiais: `user@profile/`
- ❌ Símbolos: `user#profile/`
- ❌ Acentos: `usuário/`

### **6. EXEMPLOS CORRETOS**

#### **✅ Componentes**

```
src/components/
├── Button/
│   └── index.tsx
├── Modal/
│   └── index.tsx
├── UserProfile/
│   └── index.tsx
└── Layout/
    └── index.tsx
```

#### **✅ Páginas**

```
src/pages/
├── index.tsx
├── login.tsx
├── dashboard.tsx
├── userProfile.tsx
└── _app.tsx
```

#### **✅ Utilitários**

```
src/utils/
├── cpfValidator.ts
├── dateFormatter.ts
├── apiClient.ts
└── constants.ts
```

#### **✅ Estilos**

```
src/styles/
├── GlobalStyle.ts
├── theme.ts
├── colors.ts
└── typography.ts
```

#### **✅ Hooks**

```
src/hooks/
├── useAuth.ts
├── useLocalStorage.ts
├── useApi.ts
└── useForm.ts
```

#### **✅ Contextos**

```
src/contexts/
├── AuthContext.ts
├── UserContext.ts
├── ThemeContext.ts
└── AppContext.ts
```

### **7. EXEMPLOS INCORRETOS**

#### **❌ Componentes**

```
src/components/
├── button.tsx          # ❌ Deveria ser Button/index.tsx
├── user-profile.tsx    # ❌ Deveria ser UserProfile/index.tsx
├── modal.js            # ❌ Extensão .js proibida
└── test.tsx            # ❌ Palavra "test" proibida
```

#### **❌ Páginas**

```
src/pages/
├── UserProfile.tsx     # ❌ Deveria ser userProfile.tsx
├── user-profile.tsx    # ❌ Hífen proibido
├── user profile.tsx    # ❌ Espaço proibido
└── test.tsx            # ❌ Palavra "test" proibida
```

#### **❌ Utilitários**

```
src/utils/
├── CpfValidator.ts     # ❌ Deveria ser cpfValidator.ts
├── cpf-validator.ts    # ❌ Hífen proibido
├── cpf validator.ts    # ❌ Espaço proibido
└── test.ts             # ❌ Palavra "test" proibida
```

### **8. VALIDAÇÃO AUTOMÁTICA**

#### **Comando de Validação**

```bash
npm run validate:naming
```

#### **O que é Verificado**

- ✅ Estrutura de pastas
- ✅ Nomenclatura de arquivos
- ✅ Extensões corretas
- ✅ Palavras proibidas
- ✅ Caracteres proibidos
- ✅ Padrões de nomenclatura

#### **Resultado**

- ✅ **Sucesso**: Todos os arquivos seguem as regras
- ❌ **Falha**: Lista de problemas encontrados

### **9. CORREÇÃO AUTOMÁTICA**

#### **Comando de Correção**

```bash
npm run fix:naming
```

#### **O que é Corrigido**

- ✅ Renomeação de arquivos
- ✅ Renomeação de pastas
- ✅ Correção de extensões
- ✅ Correção de nomenclatura

### **10. INTEGRAÇÃO COM GIT HOOKS**

#### **Pre-commit**

- ✅ Validação automática de nomenclatura
- ✅ Bloqueio de commit se houver problemas
- ✅ Correção automática quando possível

#### **Pre-push**

- ✅ Validação rigorosa de nomenclatura
- ✅ Bloqueio de push se houver problemas

---

## ⚠️ **LEMBRE-SE: ESTAS REGRAS SÃO INEGOCIÁVEIS**

Qualquer violação destas regras deve ser corrigida imediatamente.
O objetivo é criar um ambiente de desenvolvimento consistente e previsível.

**"A consistência é a última refúgio das mentes sem imaginação."** - Oscar Wilde
