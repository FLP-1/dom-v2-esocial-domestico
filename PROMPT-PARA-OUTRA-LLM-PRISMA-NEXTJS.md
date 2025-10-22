# 🔍 PROMPT PARA RESOLUÇÃO DO ERRO PRISMA + NEXT.JS 15.5.2

## 📋 CONTEXTO GERAL

Estou enfrentando um erro persistente em uma aplicação **Next.js 15.5.2 + Prisma 6.16.3 + PostgreSQL** no ambiente **Windows 10**.

O erro ocorre especificamente nas **API Routes do Next.js** e impede qualquer interação com o banco de dados.

---

## ❌ ERRO PRINCIPAL

```
Error [PrismaClientInitializationError]: 
Invalid prisma.configuracaoSistema.findFirst() invocation:
Database `(not available)` does not exist on the database server at `localhost:5433`.
```

### **Características do Erro:**
- ✅ **PostgreSQL funciona perfeitamente** (testado via `psql`)
- ✅ **Prisma funciona fora do Next.js** (scripts Node.js funcionam)
- ❌ **Prisma NÃO funciona dentro das API Routes do Next.js**
- ❌ Prisma não consegue interpretar `DATABASE_URL` no contexto do Next.js

---

## 🔧 CONFIGURAÇÕES ATUAIS

### **1. Versões:**
```json
{
  "@prisma/client": "^6.16.3",
  "prisma": "^6.16.3",
  "next": "^15.5.2",
  "react": "^18.2.0",
  "typescript": "^5.0.4",
  "dotenv": "^17.2.3"
}
```

### **2. DATABASE_URL (.env.local):**
```env
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
```

**Status:**
- ✅ Arquivo existe na raiz do projeto
- ✅ Nome correto: `.env.local` (não `env.local`)
- ✅ Sintaxe válida
- ✅ PostgreSQL acessível nesta URL
- ✅ **ATUALIZADO:** DATABASE usa `dom` (corrigido de `dom_v2`)

### **3. Schema Prisma (prisma/schema.prisma):**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 90+ models...
```

### **4. Singleton do Prisma (src/lib/prisma.ts):**
```typescript
import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Forçar DATABASE_URL para resolver problema do Next.js 15.5.2
const databaseUrl = process.env.DATABASE_URL || 'postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public';

const prisma = globalThis.__prisma || new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}

export default prisma
export { prisma }
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

### **6. Exemplo de API Route (src/pages/api/auth/login.ts):**
```typescript
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma'; // ❌ ERRO AQUI
import { generateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // ❌ ERRO NA LINHA ABAIXO
      const user = await prisma.usuario.findUnique({
        where: { cpf },
        include: {
          perfis: {
            include: {
              perfil: true,
            },
          },
        },
      });
      
      // ... resto do código
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ message: 'Erro interno' });
    }
  }
}
```

### **7. ARQUIVO ONDE O ERRO REALMENTE OCORRE (src/lib/configService.ts):**
⚠️ **CRÍTICO:** O stack trace mostra que o erro ocorre em `configService.ts:53` (não linha 31 como stack trace sugeria)

**Linha 53 (ONDE ERRO OCORRE):**
```typescript
const config = await prisma.configuracaoSistema.findFirst({
  where: {
    chave,
    ...(empresaId && { empresaId })
  }
});
```

**Contexto completo do método `getConfig`:**
```typescript
// Linha 42-72
public async getConfig(chave: string, empresaId?: string): Promise<string> {
  await this.updateCacheIfNeeded();

  const cacheKey = empresaId ? `${chave}_${empresaId}` : chave;
  const cached = this.cache.get(cacheKey);
  
  if (cached) {
    return this.convertValue(cached.valor, cached.tipo);
  }

  // ❌ ERRO AQUI (linha 53) - Primeira query ao banco
  const config = await prisma.configuracaoSistema.findFirst({
    where: {
      chave,
      ...(empresaId && { empresaId })
    }
  });

  if (!config) {
    throw new Error(`Configuração '${chave}' não encontrada`);
  }

  // ... resto do código
}
```

**Como configService.ts importa Prisma:**
```typescript
// Linha 7
import prisma from './prisma'
```

**Características importantes:**
- ✅ É um **Singleton** (linha 30-36)
- ✅ Tem **cache interno** (Map)
- ✅ Métodos são **assíncronos**
- ⚠️ É **carregado muito cedo** (usado por várias APIs)
- ⚠️ **Primeira query** do sistema ao banco (linha 53)

---

## 🧪 TESTES REALIZADOS

### **✅ Teste 1: PostgreSQL Direto**
```powershell
psql -h localhost -p 5433 -U userdom -d dom
# RESULTADO: ✅ FUNCIONA - Banco acessível
```

### **✅ Teste 2: Prisma Fora do Next.js**
```javascript
// test-prisma-direct.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  const users = await prisma.usuario.findMany();
  console.log('Usuários:', users.length);
}

test();
```
```powershell
node test-prisma-direct.js
# RESULTADO: ✅ FUNCIONA - Retorna dados
```

### **❌ Teste 3: Prisma Dentro do Next.js**
```powershell
npm run dev
# Acessar: http://localhost:3000/api/auth/login
# RESULTADO: ❌ ERRO - Database (not available) does not exist
```

### **📊 Logs do Debug:**
```
🔍 DEBUG PRISMA [abc123]:
   DATABASE_URL presente: true
   NODE_ENV: development
   globalThis.__prisma existe: false
   Criando nova instância: true
✅ Prisma Client [abc123] configurado no globalThis
```

**Observação:** `DATABASE_URL` está presente quando `src/lib/prisma.ts` é carregado, mas mesmo assim o erro persiste.

---

## 🔄 TENTATIVAS DE CORREÇÃO (TODAS FALHARAM)

### **❌ Tentativa 1: Renomear arquivo**
- `env.local` → `.env.local`
- **Resultado:** Não resolveu

### **❌ Tentativa 2: Regenerar Prisma Client**
```powershell
npx prisma generate
```
- **Resultado:** Não resolveu

### **❌ Tentativa 3: Adicionar dotenv manual**
```typescript
import dotenv from 'dotenv';
dotenv.config();
```
- **Resultado:** Causou erro `Cannot read properties of undefined (reading 'isTTY')`

### **❌ Tentativa 4: Forçar DATABASE_URL no constructor**
```typescript
const databaseUrl = process.env.DATABASE_URL || 'postgresql://...';
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})
```
- **Resultado:** Não resolveu

### **❌ Tentativa 5: Adicionar env no next.config.js**
```javascript
module.exports = {
  env: {
    DATABASE_URL: process.env.DATABASE_URL
  }
}
```
- **Resultado:** Não resolveu

### **❌ Tentativa 6: Testar versões anteriores**
- Pesquisado issues do Next.js 15.x
- **Resultado:** Não encontrado solução específica

### **❌ Tentativa 7: Limpar cache e node_modules**
```powershell
# PRECISO CONFIRMAR SE FOI FEITO:
Remove-Item -Recurse -Force node_modules
Remove-Item -Recurse -Force .next
npm install
npx prisma generate
```
- **Status:** (NÃO TESTADO OU NÃO DOCUMENTADO)

### **❌ Tentativa 8: Verificar Prisma Client gerado**
```powershell
# TESTADO:
ls node_modules/.prisma/client
# RESULTADO: ✅ Prisma Client existe e está gerado
```
- **Status:** ✅ TESTADO - Prisma Client presente

### **❌ Tentativa 9: Limpar variável de ambiente do sistema**
```powershell
# PROBLEMA DESCOBERTO: Contradição entre sistema e arquivo
$env:DATABASE_URL  # tinha dom_v2 (antiga)
Get-Content .env.local  # tinha dom (correta)
Remove-Item Env:\DATABASE_URL  # removida variável do sistema
```
- **Status:** ✅ TESTADO - Contradição identificada e corrigida

### **❌ Tentativa 10: Adicionar dotenv.config() manual**
```typescript
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
```
- **Status:** ❌ FALHOU - Causou erro `Cannot read properties of undefined (reading 'isTTY')`
- **Motivo:** Conflito entre dotenv manual e Next.js automático

---

## 🚨 PISTA MAIS IMPORTANTE DO LOG

⚠️ **MENSAGEM CRÍTICA:**
```
Prisma has detected that this project was built on Vercel, which caches dependencies.
This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered.
```

**ANÁLISE:**
1. **Projeto NÃO está no Vercel** - está rodando localmente
2. **Por que Prisma detecta Vercel?** → Pode ter variável de ambiente `VERCEL=1` ou similar
3. **"Outdated Prisma Client"** → Sugere problema de cache/geração
4. **Solução sugerida:** "run `prisma generate` during build process"

**QUESTÕES RESPONDIDAS:**
- ✅ Há variável `VERCEL` ou `CI`? **NÃO** (verificado)
- ✅ O Prisma Client foi regenerado? **SIM** (arquivos presentes e atualizados)
- ✅ Há cache antigo do Vercel? **NÃO** (pasta `.vercel` não existe)

**QUESTÕES REMANESCENTES:**
- ❓ Por que Prisma detecta "built on Vercel" sem variáveis ou cache?
- ❓ Por que DATABASE_URL vira `(not available)` na query?
- ❓ Por que funciona fora do Next.js mas não dentro?

---

## 🎯 QUESTÕES ESPECÍFICAS

### **1. Por que o Prisma funciona fora do Next.js mas não dentro?**
- PostgreSQL: ✅ Funciona
- Prisma direto: ✅ Funciona
- Prisma + Next.js: ❌ Falha

### **2. Por que `DATABASE_URL` está presente mas não é interpretada?**
```
DATABASE_URL presente: true  // ✅ Confirmado no log
Database `(not available)` does not exist  // ❌ Erro persiste
```

### **3. Existe algum problema conhecido do Next.js 15.5.2 com Prisma?**
- Next.js 15.x é relativamente novo
- Pode ter mudanças no carregamento de variáveis de ambiente

### **4. O singleton pattern está correto?**
```typescript
const prisma = globalThis.__prisma || new PrismaClient(...)
if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma
}
```

### **5. Há alguma configuração específica do Next.js 15.x que estou perdendo?**
- Mudanças no `next.config.js`?
- Mudanças no carregamento de env?
- Mudanças no webpack/turbopack?

### **6. Por que Prisma detecta Vercel em projeto local?**
- Há variável `VERCEL=1` ou `CI=true` no ambiente?
- Há resquícios de build anterior do Vercel?
- O Prisma Client está usando configuração antiga?

### **7. O erro ocorre no primeiro uso do Prisma (`configService.ts`)?**
- Por que `configService.ts` é carregado antes de tudo?
- Há importação circular?
- `configService` tenta acessar banco antes do Prisma estar pronto?

---

## 🔬 OBSERVAÇÕES IMPORTANTES

### **Comportamento Anômalo:**
1. **DATABASE_URL está presente** no `process.env` quando `src/lib/prisma.ts` é carregado
2. **Prisma Client é instanciado sem erros** inicialmente
3. **Erro só ocorre na primeira query** dentro da API Route
4. **Mensagem de erro sugere** que o Prisma não consegue ler `DATABASE_URL` internamente

### **Hipóteses:**
- **Hipótese 1:** Next.js 15.x mudou como carrega variáveis de ambiente nas API Routes
- **Hipótese 2:** Prisma Client é instanciado antes do `.env.local` ser carregado
- **Hipótese 3:** Há conflito entre o carregamento do Next.js e do Prisma
- **Hipótese 4:** Problema específico do Windows com paths ou encoding

---

## 📝 O QUE PRECISO

### **Solução que:**
1. ✅ Permita Prisma funcionar dentro das API Routes do Next.js
2. ✅ Seja compatível com Next.js 15.5.2
3. ✅ Não use workarounds temporários ou hardcoded
4. ✅ Siga as melhores práticas oficiais do Prisma e Next.js

### **Formato de Resposta Desejado:**
```markdown
## 🎯 CAUSA RAIZ
[Explicação detalhada do que causa o problema]

## 🔧 SOLUÇÃO
[Passo a passo completo da correção]

## 📊 VALIDAÇÃO
[Como testar se funcionou]

## 📚 REFERÊNCIAS
[Links para documentação oficial]
```

---

## 🌍 CONTEXTO ADICIONAL

### **Ambiente:**
- **OS:** Windows 10 (Build 26100)
- **Shell:** PowerShell
- **Node:** v22.16.0 (✅ VERIFICADO)
- **Package Manager:** npm 11.4.2
- **IDE:** VS Code / Cursor
- **Bundler Next.js:** Webpack (Next.js 15.5.2 padrão)
- **TypeScript:** 5.9.2

### **Estrutura do Projeto:**
```
E:\DOM\
├── .env.local                 # ✅ Existe
├── next.config.js             # ✅ Configurado
├── package.json               # ✅ Dependências corretas
├── prisma/
│   └── schema.prisma          # ✅ Schema válido
├── src/
│   ├── lib/
│   │   └── prisma.ts          # ❌ ERRO AQUI (dentro do Next.js)
│   └── pages/
│       └── api/
│           └── auth/
│               └── login.ts   # ❌ ERRO AQUI (ao usar prisma)
```

### **PostgreSQL:**
- **Versão:** PostgreSQL 16+
- **Host:** localhost
- **Porta:** 5433 (customizada)
- **Database:** dom (✅ corrigido)
- **Schema:** public
- **Usuário:** userdom
- **Status:** ✅ Rodando e acessível via psql

---

## ⚠️ RESTRIÇÕES

### **NÃO posso:**
- ❌ Mudar para outro ORM (preciso do Prisma)
- ❌ Fazer downgrade do Next.js (projeto exige 15.x)
- ❌ Usar dados mockados (preciso de dados reais do banco)
- ❌ Usar API externa (preciso de conexão direta)

### **POSSO:**
- ✅ Modificar configurações do Prisma
- ✅ Modificar `next.config.js`
- ✅ Adicionar/remover dependências
- ✅ Alterar estrutura de arquivos
- ✅ Usar patches ou workarounds oficiais

---

## 🎯 OBJETIVO FINAL

**Conseguir que a seguinte linha funcione dentro de uma API Route do Next.js:**

```typescript
// src/pages/api/auth/login.ts
import prisma from '../../../lib/prisma';

// Esta linha deve funcionar:
const user = await prisma.usuario.findUnique({ where: { cpf } });
```

**Sem retornar:**
```
Database `(not available)` does not exist
```

---

## 💡 AGRADECIMENTO

Agradeço qualquer insight, mesmo que parcial:
- Links para issues do GitHub relevantes
- Mudanças conhecidas do Next.js 15.x
- Configurações alternativas do Prisma
- Debugging adicional que eu possa fazer
- Qualquer informação que ajude a resolver

**Este problema está bloqueando todo o desenvolvimento do projeto.** 🙏

---

## 📎 ANEXOS

### **Log Completo do Erro:**
```
Error [PrismaClientInitializationError]: Invalid prisma.configuracaoSistema.findFirst() invocation:


  Prisma has detected that this project was built on Vercel, which caches dependencies. This leads to an outdated Prisma Client because Prisma's auto-generation isn't triggered. To fix this, make sure to run the `prisma generate` command during the build process.

Learn more: https://pris.ly/d/vercel-build


Database `(not available)` does not exist on the database server at `localhost:5433`.
    at ni.handleRequestError (E:\DOM\node_modules\@prisma\client\runtime\library.js:123:6817)
    at ni.handleAndLogRequestError (E:\DOM\node_modules\@prisma\client\runtime\library.js:123:6148)
    at ni.request (E:\DOM\node_modules\@prisma\client\runtime\library.js:123:5856)
    at async l (E:\DOM\node_modules\@prisma\client\runtime\library.js:128:10025)
    at async getConfigFromDB (E:\DOM\src\lib\configService.ts:31:21)
    at async getConfigValue (E:\DOM\src\lib\configService.ts:60:24)
```

⚠️ **PISTAS CRÍTICAS NO LOG:**
1. Mensagem menciona **"Vercel"** mas projeto está rodando **localmente**
   - ✅ **VERIFICADO:** Sem variáveis VERCEL ou CI no ambiente
   - ✅ **VERIFICADO:** Sem pasta `.vercel` no projeto
2. Erro ocorre em **`src/lib/configService.ts:53`** (não em `login.ts`)
   - ✅ **CONFIRMADO:** Linha 53 é `prisma.configuracaoSistema.findFirst()`
   - ⚠️ É a **primeira query** do sistema ao banco
3. Sugere problema com **Prisma Client desatualizado/cache**
   - ✅ **VERIFICADO:** Prisma Client existe e está gerado
   - ✅ **VERIFICADO:** Versão 6.16.3 (atualizada)
4. **CONTRADIÇÃO PRINCIPAL:**
   - ✅ PostgreSQL acessível via `psql`
   - ✅ Prisma Client gerado e presente
   - ✅ DATABASE_URL definida (`dom_v2`)
   - ❌ Prisma reporta database `(not available)`

### **Estrutura Completa do Schema:**
- 90+ models
- Relações complexas entre tabelas
- Índices configurados
- ✅ Schema validado: `npx prisma validate` → Success

---

## 🔍 INFORMAÇÃO EXTRA: O QUE FUNCIONAVA ANTES

**Contexto importante:** Esta aplicação já funcionou anteriormente. O erro começou recentemente.

**Possíveis causas da quebra:**
1. Atualização do Next.js (14.x → 15.5.2)?
2. Atualização do Prisma (versão anterior → 6.16.3)?
3. Mudança no `.env.local` (nome, localização, sintaxe)?
4. Mudança na estrutura do Prisma Client singleton?

**Seria útil saber:**
- Quais mudanças exatas ocorreram entre Next.js 14.x e 15.x relacionadas a env vars
- Se há breaking changes conhecidos do Prisma 6.x com Next.js 15.x
- Como o Next.js 15.x carrega `.env.local` internamente
- Por que Prisma detecta "Vercel" em ambiente local

---

## ✅ INFORMAÇÕES ADICIONAIS COLETADAS

### **1. Versão exata do Node.js:**
```
v22.16.0
```

### **2. Versão completa do Prisma:**
```
prisma                  : 6.16.3
@prisma/client          : 6.16.3
Computed binaryTarget   : windows
Operating System        : win32
Architecture            : x64
Node.js                 : v22.16.0
TypeScript              : 5.9.2
Query Engine (Node-API) : libquery-engine bb420e667c1820a8c05a38023385f6cc7ef8e83a
                          (at node_modules\@prisma\engines\query_engine-windows.dll.node)
PSL                     : @prisma/prisma-schema-wasm 6.16.1-1.bb420e667c1820a8c05a38023385f6cc7ef8e83a
Schema Engine           : schema-engine-cli bb420e667c1820a8c05a38023385f6cc7ef8e83a
                          (at node_modules\@prisma\engines\schema-engine-windows.exe)
Default Engines Hash    : bb420e667c1820a8c05a38023385f6cc7ef8e83a
Studio                  : 0.511.0
```

⚠️ **AVISO:** Há um warning sobre `package.json#prisma` ser deprecated (migrar para `prisma.config.ts`)

### **3. Variáveis de ambiente:**
```
VERCEL: (não definida)
CI: (não definida)
NODE_ENV: (não definida)

DATABASE_URL (sistema): (removida - estava com dom_v2)
DATABASE_URL (.env.local): postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public
```

✅ **Sem variáveis VERCEL ou CI** - projeto não detecta ambiente Vercel via env vars
✅ **Contradição dom/dom_v2 resolvida** - variável do sistema removida

### **4. Conteúdo de `src/lib/configService.ts`:**
✅ **Código fornecido na seção 7** (367 linhas)
- Erro ocorre na **linha 53**: `prisma.configuracaoSistema.findFirst()`
- É a **primeira query** do sistema ao banco
- Singleton com cache interno
- ⚠️ **PROBLEMA:** Carregado muito cedo, antes das env vars estarem prontas

### **5. Estado do Prisma Client gerado:**
```
✅ Prisma Client existe

Arquivos encontrados:
- client.d.ts
- client.js
- default.d.ts
- default.js
- edge.d.ts
- edge.js
- index-browser.js
- index.d.ts
- index.js
- package.json
```

✅ **Prisma Client está gerado e presente**

### **6. Arquivos de cache Vercel:**
```
✅ Pasta .vercel não existe
```

✅ **Sem cache do Vercel** no projeto

### **7. Arquivos de configuração npm/yarn:**
```
.npmrc: não existe
.yarnrc: não existe
```

✅ **Sem arquivos de configuração customizados**

---

## 🎯 HIPÓTESES PRIORIZADAS (COM BASE NO LOG)

### **🔴 HIPÓTESE MAIS PROVÁVEL:**
**Prisma Client instanciado antes das env vars estarem disponíveis no contexto do Next.js**

**Evidências:**
- ✅ Next.js carrega `.env.local` (log confirmado)
- ✅ Prisma funciona COM dotenv manual fora do Next.js
- ✅ Prisma falha SEM dotenv manual fora do Next.js
- ❌ Prisma falha dentro do Next.js (mesmo com env vars carregadas)
- ❌ dotenv.config() manual causa conflito `isTTY` com Next.js

**Nova hipótese:**
- `configService.ts` é importado e executa query ANTES do Next.js processar `.env.local`
- Singleton pattern pode estar usando instância antiga
- Timing de carregamento entre Next.js e Prisma Client

**Teste sugerido:**
```typescript
// Lazy loading do Prisma Client
const getPrisma = () => {
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['query', 'info', 'warn', 'error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  return globalThis.__prisma;
};
```

### **🟡 HIPÓTESE SECUNDÁRIA:**
**`configService.ts` carrega antes do `.env.local` ser processado**

**Evidências:**
- ✅ Erro ocorre em `configService.ts` (carregado cedo?)
- ✅ `DATABASE_URL` presente no log mas Prisma não vê

**Teste sugerido:**
- Inspecionar quando `configService.ts` é importado
- Adicionar log em `configService.ts` mostrando `process.env.DATABASE_URL`

### **🟢 HIPÓTESE TERCIÁRIA:**
**Next.js 15.x mudou ordem de carregamento de env vars**

**Evidências:**
- ✅ Projeto funcionava antes
- ✅ Next.js 15.x é versão nova

**Teste sugerido:**
- Testar com Next.js 14.x temporariamente
- Verificar changelog oficial do Next.js 15.x

---

**🎯 FOCO PRINCIPAL: Resolver "Database `(not available)` does not exist" investigando timing de carregamento entre Next.js e Prisma Client**

---

## 📋 DESCOBERTAS MAIS RECENTES (ATUALIZAÇÃO FINAL)

### **✅ PROBLEMAS RESOLVIDOS:**
1. **Contradição dom/dom_v2:** Variável do sistema removida, `.env.local` usa `dom`
2. **Conflito dotenv:** Removido `dotenv.config()` manual que causava erro `isTTY`
3. **Next.js carrega .env.local:** Logs confirmam "injecting env (0) from .env.local"

### **🔍 EVIDÊNCIAS CRÍTICAS:**
```
✅ Script Node.js + dotenv: "Query executada com sucesso! Usuários: 5"
❌ Script Node.js sem dotenv: "Environment variable not found: DATABASE_URL"
❌ Next.js API Routes: "Database (not available) does not exist"
```

### **💡 INSIGHT PRINCIPAL:**
**O problema NÃO é carregamento de env vars, mas sim TIMING de acesso ao Prisma Client**

**Hipótese atual:**
- `configService.ts` é importado e executa query ANTES do Prisma Client ter acesso às env vars
- Next.js carrega `.env.local` mas Prisma Client já foi instanciado com configuração antiga
- Singleton pattern pode estar usando instância com `DATABASE_URL` undefined

### **🎯 PRÓXIMAS ESTRATÉGIAS:**
1. **Lazy loading:** Instanciar Prisma Client apenas na primeira query
2. **Factory pattern:** Função que cria Prisma Client sob demanda
3. **Delay de inicialização:** Aguardar env vars estarem prontas
4. **Context de execução:** Verificar se Prisma roda no contexto correto do Next.js

---

## 📊 RESUMO EXECUTIVO DAS DESCOBERTAS

### **✅ O QUE ESTÁ FUNCIONANDO:**
1. PostgreSQL rodando e acessível via `psql` na porta 5433
2. Prisma Client gerado corretamente (versão 6.16.3)
3. `DATABASE_URL` definida no `.env.local` (aponta para `dom_v2`)
4. Prisma funciona perfeitamente FORA do Next.js (scripts Node.js)
5. Node.js v22.16.0 atualizado
6. Sem variáveis `VERCEL` ou `CI` no ambiente
7. Sem cache `.vercel` no projeto

### **❌ O QUE ESTÁ FALHANDO:**
1. Prisma NÃO funciona dentro das API Routes do Next.js
2. Erro ocorre na **primeira query** ao banco (`configService.ts:53`)
3. Prisma reporta database como `(not available)` (não consegue ler `DATABASE_URL`)
4. Mensagem do Vercel aparece mesmo sem ambiente Vercel
5. **NOVO:** dotenv.config() manual causa erro `isTTY` (conflito com Next.js)

### **🔴 CONTRADIÇÃO PRINCIPAL:**
```
✅ DATABASE_URL existe: postgresql://userdom:FLP*2025@localhost:5433/dom
✅ PostgreSQL acessível
✅ Prisma Client gerado
✅ Next.js carrega .env.local (logs mostram "injecting env")
❌ Prisma vê: Database `(not available)` does not exist
```

### **🎯 ARQUIVOS-CHAVE:**
- `src/lib/prisma.ts` → Singleton do Prisma Client (funciona)
- `src/lib/configService.ts:53` → ONDE O ERRO OCORRE (primeira query)
- `.env.local` → DATABASE_URL definida
- `next.config.js` → Configuração Next.js (sem env customizado)

### **💡 HIPÓTESE MAIS PROVÁVEL APÓS DESCOBERTAS RECENTES:**
**Prisma Client não consegue acessar `process.env.DATABASE_URL` no momento da query dentro do Next.js, mesmo ela estando definida e sendo carregada pelo Next.js.**

**Evidências adicionais:**
- ✅ Next.js carrega `.env.local` (log: "injecting env (0) from .env.local")
- ✅ Script Node.js COM dotenv funciona: "Query executada com sucesso! Usuários: 5"
- ❌ Script Node.js SEM dotenv falha: "Environment variable not found: DATABASE_URL"
- ❌ dotenv.config() manual causa conflito `isTTY` com Next.js

**Possíveis causas:**
1. **Timing de carregamento:** `configService.ts` é carregado ANTES do Next.js processar `.env.local`
2. **Conflito de contexto:** Prisma Client instanciado em contexto diferente do Next.js
3. **Singleton pattern:** globalThis.__prisma pode estar usando configuração antiga
4. **Next.js 15.x:** Mudanças internas no carregamento de env vars

### **🧪 TESTES ADICIONAIS REALIZADOS:**

**Teste com dotenv manual (FALHOU):**
```typescript
// src/lib/prisma.ts
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // ❌ Causou erro 'isTTY'
```

**Teste Prisma fora do Next.js (SUCESSO):**
```javascript
// test-prisma-with-dotenv.js
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
// ✅ Query executada com sucesso! Usuários: 5
```

**Teste Prisma sem dotenv (FALHOU):**
```javascript
// test-prisma.js (sem dotenv)
const { PrismaClient } = require('@prisma/client');
// ❌ Environment variable not found: DATABASE_URL
```

### **🎯 PRÓXIMAS HIPÓTESES A INVESTIGAR:**
1. **Lazy loading do Prisma Client** - Instanciar apenas quando necessário
2. **Contexto de execução** - Verificar se Prisma roda no contexto correto
3. **Timing de inicialização** - Delay na primeira query até env vars estarem prontas
4. **Singleton pattern alternativo** - Usar factory function em vez de instância global

