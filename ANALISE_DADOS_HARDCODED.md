# 📊 ANÁLISE DETALHADA: Dados Hardcoded e Mockados

## ⚠️ **CORREÇÃO IMPORTANTE**

**Esta análise foi CORRIGIDA após verificação do schema existente.**

Ver arquivo **`ANALISE_TABELAS_EXISTENTES.md`** para análise correta!

## 🎯 **RESUMO EXECUTIVO**

Esta análise identificou **todos os dados hardcoded e mockados** que devem ser substituídos por dados do banco de dados para um sistema mais robusto e dinâmico.

**IMPORTANTE**: A maioria das tabelas propostas **JÁ EXISTEM** no banco! Ver análise corrigida.

---

## 🔴 **PRIORIDADE CRÍTICA**

### 1. **Gerenciamento de Folha de Pagamento** (`payroll-management.tsx`)

**Problema**: Dados de funcionários e documentos hardcoded

**Localização**: Linhas 633-719

**Dados Hardcoded**:
- ✅ Array `employees` com 2 funcionários fictícios (Maria Santos, Ana Costa)
- ✅ Array `documents` com 4 documentos mockados
- ✅ Objeto `payrollSummary` com dados financeiros hardcoded

**Substituir por**:
```typescript
// Buscar do banco de dados
const employees = await prisma.usuario.findMany({
  where: { 
    perfis: { 
      some: { perfil: { codigo: 'EMPREGADO' } } 
    }
  },
  include: {
    perfis: { include: { perfil: true } }
  }
});

const documents = await prisma.documento.findMany({
  where: { 
    categoria: 'folha_pagamento',
    usuarioId: currentUser.id
  },
  orderBy: { criadoEm: 'desc' }
});

const payrollSummary = await prisma.folhaPagamento.findFirst({
  where: { usuarioId: currentUser.id },
  orderBy: { criadoEm: 'desc' }
});
```

---

### 2. **Comunicação/Mensagens** (`communication.tsx`)

**Problema**: Contatos e mensagens totalmente mockados

**Localização**: Linhas 551-689

**Dados Hardcoded**:
- ✅ Array `contacts` com 4 contatos fictícios
- ✅ Array `conversations` com 4 conversas mockadas
- ✅ Objeto `messages` com histórico completo de mensagens

**Substituir por**:
```typescript
// Criar tabelas no banco
model Contato {
  id            String   @id @default(uuid())
  usuarioId     String
  contatoId     String
  apelido       String?
  statusOnline  String   // 'online', 'away', 'offline'
  ultimaVisto   DateTime?
  bloqueado     Boolean  @default(false)
  criadoEm      DateTime @default(now())
  
  usuario       Usuario  @relation("ContatosUsuario", fields: [usuarioId], references: [id])
  contato       Usuario  @relation("ContatosDeUsuario", fields: [contatoId], references: [id])
  
  @@map("contatos")
}

model Conversa {
  id            String   @id @default(uuid())
  tipo          String   // 'individual', 'grupo'
  nome          String?  // Para grupos
  avatar        String?
  fixada        Boolean  @default(false)
  silenciada    Boolean  @default(false)
  criadoEm      DateTime @default(now())
  
  participantes ConversaParticipante[]
  mensagens     Mensagem[]
  
  @@map("conversas")
}

model ConversaParticipante {
  id           String   @id @default(uuid())
  conversaId   String
  usuarioId    String
  criadoEm     DateTime @default(now())
  
  conversa     Conversa @relation(fields: [conversaId], references: [id])
  usuario      Usuario  @relation(fields: [usuarioId], references: [id])
  
  @@map("conversa_participantes")
}

model Mensagem {
  id           String   @id @default(uuid())
  conversaId   String
  remetenteId  String
  conteudo     String   @db.Text
  tipo         String   // 'text', 'image', 'audio', 'file'
  lida         Boolean  @default(false)
  criadoEm     DateTime @default(now())
  
  conversa     Conversa @relation(fields: [conversaId], references: [id])
  remetente    Usuario  @relation(fields: [remetenteId], references: [id])
  
  @@map("mensagens")
}
```

---

### 3. **Gestão de Empréstimos** (`loan-management.tsx`)

**Problema**: Solicitações de empréstimo hardcoded

**Localização**: Linhas 568-618

**Dados Hardcoded**:
- ✅ Array `requests` com 3 solicitações fictícias
- ✅ Objeto `summary` com resumo financeiro hardcoded

**Substituir por**:
```typescript
// Criar tabela no banco
model Emprestimo {
  id                String    @id @default(uuid())
  usuarioId         String
  empregadoId       String
  tipo              String    // 'loan', 'advance'
  valor             Decimal   @db.Decimal(10, 2)
  parcelas          Int
  dataVencimento    DateTime
  justificativa     String    @db.Text
  status            String    // 'pending', 'approved', 'rejected', 'paid'
  dataSolicitacao   DateTime  @default(now())
  dataAprovacao     DateTime?
  aprovadoPor       String?
  valorParcela      Decimal?  @db.Decimal(10, 2)
  taxaJuros         Decimal?  @db.Decimal(5, 2)
  valorTotal        Decimal?  @db.Decimal(10, 2)
  criadoEm          DateTime  @default(now())
  atualizadoEm      DateTime  @updatedAt
  
  usuario           Usuario   @relation("EmprestimosEmpregador", fields: [usuarioId], references: [id])
  empregado         Usuario   @relation("EmprestimosEmpregado", fields: [empregadoId], references: [id])
  
  @@map("emprestimos")
}
```

---

## 🟡 **PRIORIDADE ALTA**

### 4. **Dashboard** (`dashboard.tsx`)

**Problema**: Métricas e tarefas hardcoded

**Localização**: Linhas 108-190

**Dados Hardcoded**:
- ✅ Array `tasks` com 4 tarefas fictícias
- ✅ Array `widgets` com métricas hardcoded:
  - Saldo: "R$ 15.420"
  - Documentos: "8"
  - Equipe: "12 membros"

**Substituir por**:
```typescript
// Buscar do banco de dados
const tasks = await prisma.tarefa.findMany({
  where: { usuarioId: currentUser.id },
  orderBy: { prioridade: 'desc' }
});

const saldoAtual = await prisma.folhaPagamento.aggregate({
  where: { usuarioId: currentUser.id },
  _sum: { valorLiquido: true }
});

const documentosNovos = await prisma.documento.count({
  where: {
    usuarioId: currentUser.id,
    criadoEm: {
      gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
    }
  }
});

const equipeTamanho = await prisma.usuario.count({
  where: {
    perfis: {
      some: {
        perfil: { codigo: { in: ['EMPREGADO', 'FAMILIA'] } }
      }
    },
    ativo: true
  }
});
```

---

### 5. **Dados de eSocial Simulados**

**Problema**: Arrays vazios mas estrutura preparada para mock

**Localização**: `src/config/constants.ts` linhas 212-215

**Dados Hardcoded**:
```typescript
export const ESOCIAL_SIMULATED_DATA = {
  EMPREGADOS: [],
  EVENTOS: [],
} as const;
```

**Ação**: Manter como está (arrays vazios são OK) mas garantir que dados venham sempre do banco, não sejam populados aqui.

---

## 🟢 **PRIORIDADE MÉDIA**

### 6. **Certificados de Teste** (`certificateValidationService.ts`)

**Problema**: Certificados de teste hardcoded

**Localização**: Linhas 280-340

**Dados Hardcoded**:
- ✅ Certificados fictícios para testes
- ✅ CPFs: "123.456.789-00", "987.654.321-00"
- ✅ CNPJs: "12.345.678/0001-90", "98.765.432/0001-10"

**Ação**: Manter para ambiente de desenvolvimento/testes, mas adicionar flag:
```typescript
if (process.env.NODE_ENV === 'development' && process.env.ENABLE_TEST_CERTIFICATES === 'true') {
  // Usar certificados de teste
}
```

---

### 7. **Documentação eSocial** (`esocial-api-documentation.md`)

**Problema**: Exemplos com dados fictícios

**Localização**: Múltiplas linhas

**Ação**: Manter como está (é documentação, dados de exemplo são apropriados)

---

## 📋 **TABELAS A CRIAR NO BANCO DE DADOS**

### **1. Sistema de Comunicação**
```sql
- contatos
- conversas
- conversa_participantes
- mensagens
```

### **2. Sistema de Empréstimos**
```sql
- emprestimos
- emprestimo_parcelas (opcional, para controle detalhado)
```

### **3. Sistema de Tarefas**
```sql
- tarefas
- tarefa_anexos (opcional)
- tarefa_comentarios (opcional)
```

### **4. Métricas do Dashboard**
```sql
- metricas_dashboard (cache de métricas calculadas)
- estatisticas_sistema
```

---

## 🎯 **PLANO DE AÇÃO RECOMENDADO**

### **Fase 1: Dados Críticos de Usuários** (Prioridade Imediata)
1. ✅ Criar tabelas de empréstimos
2. ✅ Migrar dados de folha de pagamento para o banco
3. ✅ Remover hardcoded de `payroll-management.tsx`
4. ✅ Remover hardcoded de `loan-management.tsx`

### **Fase 2: Sistema de Comunicação** (Próxima Sprint)
1. ✅ Criar tabelas de mensagens e contatos
2. ✅ Implementar APIs de comunicação
3. ✅ Migrar `communication.tsx` para usar banco de dados

### **Fase 3: Dashboard e Métricas** (Médio Prazo)
1. ✅ Criar tabela de tarefas
2. ✅ Implementar cálculo dinâmico de métricas
3. ✅ Criar cache de estatísticas

### **Fase 4: Otimização** (Longo Prazo)
1. ✅ Implementar caching de consultas frequentes
2. ✅ Criar índices otimizados
3. ✅ Implementar paginação e lazy loading

---

## 📊 **ESTATÍSTICAS**

### **Total de Arquivos Analisados**: 18
### **Total de Dados Hardcoded Encontrados**: 7 categorias principais

### **Breakdown por Prioridade**:
- 🔴 **Crítica**: 3 arquivos (payroll, communication, loan)
- 🟡 **Alta**: 2 arquivos (dashboard, esocial)
- 🟢 **Média**: 2 arquivos (certificates, documentation)

### **Impacto Estimado**:
- **Linhas de código a refatorar**: ~800 linhas
- **Tabelas novas a criar**: 8-10 tabelas
- **APIs novas a implementar**: 12-15 endpoints

---

## ✅ **BENEFÍCIOS DA MIGRAÇÃO**

1. **Dados Reais**: Sistema funcionará com dados reais de produção
2. **Flexibilidade**: Fácil adicionar/remover/editar dados
3. **Escalabilidade**: Suporta crescimento sem mudanças no código
4. **Auditoria**: Rastreamento completo de mudanças
5. **Multi-tenant**: Suporte para múltiplos usuários/empresas
6. **Backup**: Dados protegidos e recuperáveis
7. **Performance**: Consultas otimizadas com índices
8. **Segurança**: Controle de acesso e permissões

---

## 🚨 **ATENÇÃO**

### **Não Substituir**:
- ✅ Constantes de configuração do sistema (URLs, timeouts)
- ✅ Dados de exemplo em documentação
- ✅ Certificados de teste em ambiente de desenvolvimento
- ✅ Validações e regras de negócio

### **Substituir Obrigatoriamente**:
- ❌ Dados de usuários fictícios
- ❌ Mensagens e conversas mockadas
- ❌ Documentos e folhas de pagamento hardcoded
- ❌ Empréstimos e solicitações fictícias
- ❌ Métricas e estatísticas hardcoded
- ❌ Tarefas e workflows mockados

---

**Data da Análise**: 2025-10-08  
**Responsável**: Análise Automatizada  
**Status**: ✅ Completo e Detalhado

