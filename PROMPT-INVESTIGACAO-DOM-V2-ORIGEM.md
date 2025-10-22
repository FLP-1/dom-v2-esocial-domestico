# 🔍 PROMPT PARA INVESTIGAÇÃO DA ORIGEM DO "DOM_V2"

## 📋 CONTEXTO GERAL

Estou enfrentando um problema **CRÍTICO** em uma aplicação **Next.js 15.5.4 + Prisma 6.17.1 + PostgreSQL** no ambiente **Windows 10**.

O problema é que a variável de ambiente `DATABASE_URL` está sendo carregada com o valor **INCORRETO** `dom_v2` em vez do valor **CORRETO** `dom`, mesmo após todas as tentativas de limpeza e correção.

---

## ❌ PROBLEMA PRINCIPAL

**A variável `process.env.DATABASE_URL` contém:**
```
postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public
```

**Mas deveria conter:**
```
postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public
```

**Diferença crítica:** `dom_v2` vs `dom` no nome do banco de dados.

---

## 🔧 CONFIGURAÇÕES ATUAIS

### **1. Versões:**
```json
{
  "@prisma/client": "^6.17.1",
  "prisma": "^6.17.1", 
  "next": "^15.5.4",
  "react": "^18.2.0",
  "typescript": "^5.0.4",
  "node": "v22.16.0"
}
```

### **2. Arquivo .env.local (CORRETO):**
```env
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
```

**Status:**
- ✅ Arquivo existe na raiz do projeto
- ✅ Nome correto: `.env.local`
- ✅ Sintaxe válida
- ✅ Contém `dom` (correto)
- ✅ PostgreSQL acessível nesta URL

### **3. Schema Prisma:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### **4. Singleton do Prisma (src/lib/prisma.ts):**
```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

function getPrismaClient(): PrismaClient {
  if (!globalThis.__prisma) {
    // SOLUÇÃO TEMPORÁRIA (GAMBIARRA)
    const correctUrl = 'postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public'
    
    console.log('⚠️ CORREÇÃO APLICADA - process.env.DATABASE_URL tinha dom_v2:', process.env.DATABASE_URL)
    console.log('✅ Usando URL correta:', correctUrl)

    globalThis.__prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' 
        ? ['query', 'info', 'warn', 'error'] 
        : ['error'],
      datasources: {
        db: {
          url: correctUrl  // FORÇADO - GAMBIARRA!
        }
      }
    })

    console.log('✅ Prisma Client criado com sucesso')
  }

  return globalThis.__prisma
}

// Proxy pattern
const prismaProxy = new Proxy({} as PrismaClient, {
  get(target, prop) {
    const client = getPrismaClient()
    const value = client[prop as keyof PrismaClient]
    
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  }
})

export default prismaProxy
export { prismaProxy as prisma }
```

### **5. Next.js Config (next.config.js):**
```javascript
module.exports = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
  experimental: {
    scrollRestoration: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};
```

---

## 🧪 EVIDÊNCIAS COLETADAS

### **✅ Teste 1: Script Node.js Direto (FUNCIONOU)**
```javascript
// test-env-direct.js
const fs = require('fs');
const path = require('path');

console.log('🔍 TESTE DIRETO - FONTE DO DOM_V2');
console.log('='.repeat(60));

// 1. Ler .env.local diretamente
const envPath = path.join(__dirname, '.env.local');
console.log('\n📂 Lendo .env.local diretamente:');
console.log('   Caminho:', envPath);
console.log('   Existe:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf-8');
  console.log('\n📄 Conteúdo completo do .env.local:');
  console.log(content);
  
  // Extrair DATABASE_URL
  const lines = content.split('\n');
  const dbLine = lines.find(line => line.includes('DATABASE_URL'));
  console.log('\n🎯 Linha DATABASE_URL:');
  console.log('   ', dbLine);
}

// 2. Testar process.env
console.log('\n🌍 process.env atual:');
console.log('   DATABASE_URL:', process.env.DATABASE_URL || 'UNDEFINED');

// 3. Carregar dotenv
console.log('\n🔄 Carregando dotenv...');
require('dotenv').config({ path: '.env.local' });
console.log('   DATABASE_URL após dotenv:', process.env.DATABASE_URL || 'UNDEFINED');
```

**Resultado:**
```
📂 Lendo .env.local diretamente:
   Caminho: E:\DOM\.env.local
   Existe: true

📄 Conteúdo completo do .env.local:
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"

🎯 Linha DATABASE_URL:
    DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"

🌍 process.env atual:
   DATABASE_URL: UNDEFINED

🔄 Carregando dotenv...
   DATABASE_URL após dotenv: postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public
```

**✅ CONFIRMADO:** O `.env.local` contém `dom` (correto) e o script Node.js lê corretamente.

### **❌ Teste 2: Next.js API Route (PROBLEMA)**
```typescript
// src/pages/api/debug/env.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasDbUrl = !!process.env.DATABASE_URL
  const dbUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
    : 'NÃO DEFINIDA'

  res.status(200).json({
    hasDbUrl,
    dbUrlPreview,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE'))
  })
}
```

**Resultado:**
```json
{
  "hasDbUrl": true,
  "dbUrlPreview": "postgresql://userdom:***@localhost:5433/dom_v2?schema=public",
  "nodeEnv": "development",
  "allEnvKeys": ["DATABASE_URL"]
}
```

**❌ PROBLEMA:** Next.js API Route mostra `dom_v2` (incorreto).

### **🔍 Teste 3: Debug Detalhado no Prisma**
```typescript
// Logs do servidor Next.js
🔍 DEBUG - process.env.DATABASE_URL: postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public
🔍 DEBUG - URL forçada: postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public
🔍 DEBUG - URL final usada: postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public
```

**❌ CONFIRMADO:** `process.env.DATABASE_URL` dentro do Next.js contém `dom_v2`.

---

## 🔄 TENTATIVAS DE CORREÇÃO (TODAS FALHARAM)

### **❌ Tentativa 1: Limpeza de Cache**
```powershell
# Limpar todos os caches
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
Remove-Item -Recurse -Force node_modules\.prisma
Remove-Item -Recurse -Force node_modules\.cache
npm install
npx prisma generate
```
**Status:** ❌ Falhou - `dom_v2` persistiu

### **❌ Tentativa 2: Remoção de Variáveis do Sistema**
```powershell
# Verificar variáveis do sistema
Get-ChildItem Env: | Where-Object { $_.Name -like "*DATABASE*" }

# Remover variáveis
Remove-Item Env:\DATABASE_URL -ErrorAction SilentlyContinue
```
**Status:** ❌ Falhou - `dom_v2` persistiu

### **❌ Tentativa 3: Investigação do Registro do Windows**
```powershell
# Verificar registro do usuário
Get-ItemProperty "HKCU:\Environment" -ErrorAction SilentlyContinue

# Resultado encontrado:
DATABASE_URL : postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public

# Remover do registro
Remove-ItemProperty -Path "HKCU:\Environment" -Name "DATABASE_URL" -ErrorAction SilentlyContinue
```
**Status:** ✅ Removido do registro, mas ❌ `dom_v2` ainda persistiu

### **❌ Tentativa 4: Parada de Processos Node.js**
```powershell
# Encontrar múltiplos processos Node.js
Get-Process -Name node

# Resultado: 3 processos encontrados
# IDs: 5532, 11364, 26564

# Parar todos os processos
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
```
**Status:** ✅ Processos parados, mas ❌ `dom_v2` ainda persistiu

### **❌ Tentativa 5: Investigação Exaustiva de Arquivos**
```powershell
# Buscar dom_v2 em todos os arquivos
Get-ChildItem -Recurse | Select-String "dom_v2"

# Resultado: Apenas em arquivos de documentação (.md)
# Nenhum arquivo de código contém dom_v2 hardcoded
```
**Status:** ✅ Confirmado - não há código hardcoded com `dom_v2`

---

## 🚨 EVIDÊNCIAS CRÍTICAS

### **✅ O QUE FUNCIONA:**
1. **Script Node.js direto** lê `.env.local` corretamente (`dom`)
2. **Arquivo .env.local** contém URL correta (`dom`)
3. **PostgreSQL** é acessível na URL correta
4. **Prisma Client** funciona quando URL é forçada no código

### **❌ O QUE NÃO FUNCIONA:**
1. **Next.js API Routes** carregam `process.env.DATABASE_URL` com `dom_v2`
2. **Variável de ambiente** no contexto do Next.js está incorreta
3. **Todas as limpezas de cache** não resolvem o problema

### **🔍 CONTRADIÇÃO PRINCIPAL:**
```
✅ Script Node.js + dotenv: dom (correto)
✅ Arquivo .env.local: dom (correto)  
❌ Next.js process.env.DATABASE_URL: dom_v2 (incorreto)
```

---

## 🎯 QUESTÕES ESPECÍFICAS

### **1. Por que Next.js carrega `dom_v2` quando o arquivo tem `dom`?**
- Next.js tem seu próprio sistema de carregamento de env vars
- Pode haver conflito entre diferentes fontes de env vars
- Pode haver cache interno do Next.js que não foi limpo

### **2. Existe alguma fonte de `dom_v2` que não identificamos?**
- Cache do sistema operacional Windows?
- Configuração em nível de usuário/máquina?
- Variável de ambiente em processo pai?
- Configuração do PowerShell/CMD?

### **3. Por que o problema persiste após todas as limpezas?**
- Cache persistente em nível de sistema?
- Configuração em arquivo não investigado?
- Variável de ambiente em contexto diferente?

### **4. Há alguma configuração específica do Next.js 15.5.4?**
- Mudanças no carregamento de env vars?
- Comportamento diferente com `.env.local`?
- Cache interno que não pode ser limpo?

---

## 🔬 OBSERVAÇÕES IMPORTANTES

### **Comportamento Anômalo:**
1. **Script Node.js** lê `.env.local` corretamente
2. **Next.js** lê a mesma variável incorretamente
3. **Limpezas completas** não resolvem o problema
4. **Registro do Windows** foi limpo mas problema persiste

### **Hipóteses Não Testadas:**
1. **Cache do sistema Windows** em nível mais profundo
2. **Configuração do PowerShell** que persiste entre sessões
3. **Variável de ambiente em processo pai** do Node.js
4. **Configuração específica do Next.js 15.5.4** com env vars
5. **Cache interno do Node.js** que não pode ser limpo

---

## 📝 O QUE PRECISO

### **Solução que:**
1. ✅ **Identifique a fonte real** do `dom_v2`
2. ✅ **Elimine a causa raiz** (não apenas sintomas)
3. ✅ **Seja reproduzível** e documentável
4. ✅ **Não use workarounds** ou gambiarras
5. ✅ **Funcione em produção** com segurança

### **Formato de Resposta Desejado:**
```markdown
## 🎯 CAUSA RAIZ IDENTIFICADA
[Explicação detalhada de onde vem o dom_v2]

## 🔧 SOLUÇÃO DEFINITIVA
[Passo a passo para eliminar a causa raiz]

## 📊 VALIDAÇÃO
[Como confirmar que a solução funciona]

## 🚨 PONTOS DE ATENÇÃO
[O que pode dar errado e como evitar]

## 📚 REFERÊNCIAS
[Links para documentação oficial]
```

---

## 🌍 CONTEXTO ADICIONAL

### **Ambiente:**
- **OS:** Windows 10 (Build 26100)
- **Shell:** PowerShell
- **Node:** v22.16.0
- **Package Manager:** npm 11.4.2
- **IDE:** VS Code / Cursor
- **Bundler Next.js:** Webpack (Next.js 15.5.4 padrão)

### **Estrutura do Projeto:**
```
E:\DOM\
├── .env.local                 # ✅ Contém dom (correto)
├── next.config.js             # ✅ Sem configurações de env
├── package.json               # ✅ Sem configurações de env
├── prisma/
│   └── schema.prisma          # ✅ Schema válido
├── src/
│   ├── lib/
│   │   └── prisma.ts          # ❌ Usa gambiarra (URL forçada)
│   └── pages/
│       └── api/
│           └── debug/
│               ├── env.ts     # ❌ Mostra dom_v2
│               └── db.ts      # ✅ Funciona com gambiarra
```

### **PostgreSQL:**
- **Versão:** PostgreSQL 16+
- **Host:** localhost
- **Porta:** 5433 (customizada)
- **Database:** dom (✅ correto)
- **Schema:** public
- **Usuário:** userdom
- **Status:** ✅ Rodando e acessível

---

## ⚠️ RESTRIÇÕES

### **NÃO posso:**
- ❌ Usar gambiarras ou workarounds
- ❌ Forçar URLs no código
- ❌ Aceitar soluções temporárias
- ❌ Ignorar a causa raiz

### **POSSO:**
- ✅ Investigar qualquer fonte de configuração
- ✅ Modificar arquivos de configuração
- ✅ Limpar qualquer tipo de cache
- ✅ Reiniciar serviços ou sistema
- ✅ Usar ferramentas de debugging avançadas

---

## 🎯 OBJETIVO FINAL

**Identificar e eliminar a fonte real do `dom_v2` para que:**

```typescript
// Isso deve funcionar sem gambiarra:
console.log(process.env.DATABASE_URL)
// Deve mostrar: postgresql://userdom:***@localhost:5433/dom?schema=public
// NÃO: postgresql://userdom:***@localhost:5433/dom_v2?schema=public
```

**E que a aplicação funcione normalmente sem forçar URLs no código.**

---

## 💡 AGRADECIMENTO

Agradeço qualquer insight que ajude a resolver esta causa raiz:

- **Ferramentas de debugging** que posso usar
- **Locais específicos** onde investigar
- **Configurações do Windows** que podem estar causando
- **Comportamentos específicos** do Next.js 15.5.4
- **Métodos avançados** de investigação de env vars

**Este problema está impedindo o desenvolvimento normal e precisa ser resolvido definitivamente.** 🙏

---

## 📎 ANEXOS

### **Log Completo do Debug:**
```
🔍 DEBUG - process.env.DATABASE_URL: postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public
🔍 DEBUG - URL forçada: postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public
🔍 DEBUG - URL final usada: postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public
🔄 Criando nova instância do Prisma Client...
📍 DATABASE_URL: postgresql://userdom:***@localhost:5433/dom_v2?schema=public
✅ Prisma Client criado com sucesso
```

### **Resultado da API de Debug:**
```json
{
  "hasDbUrl": true,
  "dbUrlPreview": "postgresql://userdom:***@localhost:5433/dom_v2?schema=public",
  "nodeEnv": "development",
  "allEnvKeys": ["DATABASE_URL"]
}
```

**O problema é real, persistente e precisa de uma solução definitiva, não uma gambiarra.**
