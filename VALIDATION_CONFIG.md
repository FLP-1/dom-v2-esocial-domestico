# 🔍 CONFIGURAÇÃO DE VALIDAÇÃO - PROJETO DOM v2

## 🚨 **VALIDAÇÕES AUTOMÁTICAS OBRIGATÓRIAS**

### **1. Pre-commit Hooks**

```bash
# Executado automaticamente antes de cada commit
npm run lint:check
npm run format:check
npm run type-check
npm run build:check
```

### **2. Pre-push Hooks**

```bash
# Executado automaticamente antes de cada push
npm run test:unit
npm run test:integration
```

### **3. Validações de Build**

```bash
# Executado em cada build
npm run build
npm run type-check
npm run lint:check
```

## 📋 **CHECKLIST DE VALIDAÇÃO**

### **✅ Antes de Cada Commit**

- [ ] ESLint sem erros
- [ ] Prettier formatado
- [ ] TypeScript sem erros
- [ ] Build funcionando
- [ ] Imports organizados
- [ ] Nomenclatura correta

### **✅ Antes de Cada Push**

- [ ] Todos os testes passando
- [ ] Código revisado
- [ ] Documentação atualizada
- [ ] Performance validada

### **✅ Antes de Cada Deploy**

- [ ] Build de produção funcionando
- [ ] Testes E2E passando
- [ ] Responsividade validada
- [ ] Acessibilidade verificada

## 🔧 **COMANDOS DE VALIDAÇÃO**

### **Linting e Formatação**

```bash
# Verificar linting
npm run lint

# Corrigir linting automaticamente
npm run lint:fix

# Verificar formatação
npm run format:check

# Corrigir formatação automaticamente
npm run format:fix
```

### **TypeScript**

```bash
# Verificar tipos
npm run type-check

# Build com verificação de tipos
npm run build
```

### **Testes**

```bash
# Testes unitários
npm run test

# Testes com coverage
npm run test:coverage

# Testes E2E
npm run test:e2e
```

## 🚫 **REGRAS DE VALIDAÇÃO RÍGIDAS**

### **1. ESLint - ERROS CRÍTICOS**

- ❌ `@typescript-eslint/no-explicit-any` - NUNCA usar `any`
- ❌ `@typescript-eslint/no-unused-vars` - NUNCA variáveis não usadas
- ❌ `no-console` - NUNCA console.log em produção
- ❌ `no-debugger` - NUNCA debugger em código

### **2. TypeScript - CONFIGURAÇÃO STRICT**

- ❌ `strict: true` - Modo strict obrigatório
- ❌ `noImplicitAny: true` - Tipos explícitos obrigatórios
- ❌ `noImplicitReturns: true` - Returns explícitos obrigatórios
- ❌ `noUnusedLocals: true` - Variáveis locais não usadas proibidas

### **3. Prettier - FORMATAÇÃO OBRIGATÓRIA**

- ❌ Aspas simples obrigatórias
- ❌ Ponto e vírgula obrigatório
- ❌ Trailing comma obrigatório
- ❌ 2 espaços para indentação

## 🔒 **TRAVAS DE SEGURANÇA**

### **1. Husky Hooks**

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run test:unit"
    }
  }
}
```

### **2. Lint-staged**

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "git add"]
  }
}
```

### **3. CI/CD Pipeline**

```yaml
# .github/workflows/validation.yml
name: Validation
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run linting
        run: npm run lint
      - name: Run formatting check
        run: npm run format:check
      - name: Run type check
        run: npm run type-check
      - name: Run tests
        run: npm run test
      - name: Build
        run: npm run build
```

## 📊 **MÉTRICAS DE QUALIDADE**

### **1. Coverage Mínimo**

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 80%
- **Lines**: 80%

### **2. Performance**

- **Lighthouse Score**: 90+
- **Bundle Size**: < 500KB
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 4s

### **3. Acessibilidade**

- **WCAG 2.1 AA**: Conformidade obrigatória
- **Keyboard Navigation**: Funcional
- **Screen Reader**: Compatível
- **Color Contrast**: 4.5:1 mínimo

## 🚨 **ALERTAS AUTOMÁTICOS**

### **1. Dependências**

- Alertas para dependências desatualizadas
- Alertas para vulnerabilidades de segurança
- Alertas para dependências não aprovadas

### **2. Código**

- Alertas para complexidade ciclomática alta
- Alertas para funções muito longas
- Alertas para duplicação de código

### **3. Performance**

- Alertas para bundle size grande
- Alertas para renderizações desnecessárias
- Alertas para memory leaks

## 🔄 **PROCESSO DE VALIDAÇÃO**

### **1. Desenvolvimento Local**

1. ✅ Código escrito seguindo padrões
2. ✅ ESLint/Prettier executados
3. ✅ TypeScript validado
4. ✅ Testes unitários executados
5. ✅ Build local funcionando

### **2. Commit**

1. ✅ Pre-commit hooks executados
2. ✅ Validações passando
3. ✅ Código formatado
4. ✅ Commit realizado

### **3. Push**

1. ✅ Pre-push hooks executados
2. ✅ Testes passando
3. ✅ Push realizado

### **4. Deploy**

1. ✅ CI/CD pipeline executado
2. ✅ Todas as validações passando
3. ✅ Deploy realizado

---

## ⚠️ **LEMBRE-SE: VALIDAÇÃO É OBRIGATÓRIA**

Nenhum código pode ser commitado, pushed ou deployado sem passar por todas as validações.
O objetivo é manter a qualidade e consistência do projeto DOM v2.

**"A qualidade nunca é um acidente. É sempre o resultado de esforço inteligente."** - John Ruskin
