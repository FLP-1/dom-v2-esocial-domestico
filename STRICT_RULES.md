# 🚨 REGRAS ESTRITAS - IMPLEMENTAÇÃO OBRIGATÓRIA

## ⚠️ **TRAVAS QUE DEVO SEGUIR OBRIGATORIAMENTE**

### **1. ANTES DE QUALQUER DESENVOLVIMENTO**

- ✅ **SEMPRE** ler a documentação do projeto
- ✅ **SEMPRE** verificar se a funcionalidade está na stack aprovada
- ✅ **SEMPRE** usar apenas as tecnologias listadas em DEVELOPMENT_RULES.md

### **2. DURANTE O DESENVOLVIMENTO**

- ✅ **SEMPRE** usar TypeScript com tipagem completa
- ✅ **SEMPRE** usar styled-components (NUNCA CSS puro)
- ✅ **SEMPRE** criar componentes com estrutura: pasta/index.tsx
- ✅ **SEMPRE** usar nomenclatura: PascalCase para componentes

### **3. APÓS DESENVOLVIMENTO**

- ✅ **SEMPRE** executar `npm run validate` antes de finalizar
- ✅ **SEMPRE** verificar se o build funciona: `npm run build`
- ✅ **SEMPRE** confirmar que não há erros de TypeScript

## 🚫 **PROIBIÇÕES ABSOLUTAS - NUNCA FAZER**

### **Tecnologias Proibidas**

- ❌ **NUNCA** usar Material-UI, Ant Design, Bootstrap
- ❌ **NUNCA** usar CSS puro ou CSS modules
- ❌ **NUNCA** usar JavaScript puro (apenas TypeScript)
- ❌ **NUNCA** usar bibliotecas não listadas no package.json

### **Padrões Proibidos**

- ❌ **NUNCA** criar componentes sem pasta própria
- ❌ **NUNCA** usar className (apenas styled-components)
- ❌ **NUNCA** criar arquivos .css ou .scss
- ❌ **NUNCA** usar any em TypeScript

## 🔍 **CHECKLIST OBRIGATÓRIO ANTES DE ENTREGAR**

### **Validação Técnica**

- [ ] `npm run type-check` - Sem erros
- [ ] `npm run lint:check` - Apenas warnings aceitáveis
- [ ] `npm run format:check` - Código formatado
- [ ] `npm run build` - Build funcionando

### **Validação de Regras**

- [ ] Usou apenas styled-components?
- [ ] Usou TypeScript com tipagem completa?
- [ ] Seguiu estrutura de pastas correta?
- [ ] Usou nomenclatura correta?
- [ ] Não usou bibliotecas proibidas?

### **Validação de Funcionalidade**

- [ ] Funcionalidade está na documentação?
- [ ] Segue padrões do projeto DOM v2?
- [ ] Usa dados mocados (não backend real)?
- [ ] Interface responsiva?

## 🚨 **ALERTAS AUTOMÁTICOS**

### **Se eu tentar usar bibliotecas proibidas:**

```text
🚫 ERRO: Biblioteca não aprovada!
Use apenas: Next.js, React, TypeScript, styled-components
```

### **Se eu tentar usar CSS puro:**

```text
🚫 ERRO: CSS puro proibido!
Use apenas styled-components
```

### **Se eu tentar usar JavaScript:**

```text
🚫 ERRO: JavaScript puro proibido!
Use apenas TypeScript
```

## 📋 **PROCESSO DE VALIDAÇÃO OBRIGATÓRIO**

### **1. Antes de Começar**

1. Ler DEVELOPMENT_RULES.md
2. Verificar stack tecnológica
3. Confirmar funcionalidade na documentação

### **2. Durante Desenvolvimento**

1. Usar apenas tecnologias aprovadas
2. Seguir padrões de código
3. Usar TypeScript com tipagem

### **3. Antes de Finalizar**

1. Executar validações automáticas
2. Verificar checklist de regras
3. Confirmar build funcionando

## ⚡ **COMANDOS DE EMERGÊNCIA**

### **Se algo der errado:**

```bash
# Corrigir formatação
npm run format:fix

# Corrigir linting
npm run lint:fix

# Verificar tipos
npm run type-check

# Validar tudo
npm run validate
```

## 🎯 **OBJETIVO DESTAS REGRAS**

- **Consistência**: Código sempre igual
- **Qualidade**: Padrões altos sempre
- **Segurança**: Nenhum desvio permitido
- **Manutenibilidade**: Fácil de manter

---

## ⚠️ **LEMBRE-SE: ESTAS SÃO REGRAS INEGOCIÁVEIS**

Qualquer violação deve ser corrigida imediatamente.
O objetivo é criar um ambiente de desenvolvimento 100% controlado e previsível.
