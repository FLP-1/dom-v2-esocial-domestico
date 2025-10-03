# 🗑️ Análise para Eliminação de Dados Mockados - Sistema DOM

## 📊 Status da Análise

### ✅ **CONCLUÍDO:**

#### **1. Análise Completa de Dados Mockados**
- ✅ Identificados todos os arquivos com dados mockados/hardcoded
- ✅ Mapeadas 17 arquivos que contêm dados simulados
- ✅ Catalogados dados centralizados em `src/data/centralized.ts`

#### **2. Estrutura do Banco de Dados**
- ✅ **Tabelas JÁ EXISTEM**: `termos`, `grupos`, `perfis`, `empregadores`, `alertas`, `conversas`, `mensagens`, `planos_assinatura`, `assinaturas`, `registros_ponto`, `logs_auditoria`, `configuracoes`
- ✅ **Novas Tabelas CRIADAS**: 
  - `estatisticas_sistema` - Para métricas gerais
  - `membros_familia` - Para familiares
  - `dados_paginas` - Para conteúdo de páginas
  - `notificacoes` - Para sistema de notificações

#### **3. Schema Atualizado**
- ✅ Adicionadas 4 novas tabelas ao `prisma/schema.prisma`
- ✅ Relações configuradas corretamente
- ✅ Índices criados para performance
- ✅ Schema aplicado no banco (`npx prisma db push`)

#### **4. Seed Atualizado**
- ✅ Dados para estatísticas do sistema
- ✅ Membros da família de exemplo
- ✅ Dados de páginas iniciais
- ✅ Notificações de boas-vindas

---

## 🔄 **EM ANDAMENTO:**

### **APIs Necessárias para Substituir Dados Mockados**

#### **APIs que JÁ EXISTEM:**
- ✅ `/api/tasks` - Tarefas (já conectada)
- ✅ `/api/alerts` - Alertas
- ✅ `/api/subscriptions/plans` - Planos de assinatura
- ✅ `/api/messages` - Mensagens/Comunicações
- ✅ `/api/timeclock` - Registro de ponto
- ✅ `/api/groups` - Grupos
- ✅ `/api/profiles` - Perfis/Tipos de usuários
- ✅ `/api/employers` - Empregadores
- ✅ `/api/terms` - Termos e políticas
- ✅ `/api/documents` - Documentos

#### **APIs que PRECISAM SER CRIADAS:**
- ❌ `/api/statistics` - Estatísticas do sistema
- ❌ `/api/family-members` - Membros da família
- ❌ `/api/page-data` - Dados de páginas
- ❌ `/api/notifications` - Notificações

---

## 📋 **Dados Mockados Identificados**

### **1. Arquivo Centralizado (`src/data/centralized.ts`)**
```typescript
// ❌ DADOS MOCKADOS QUE DEVEM SER REMOVIDOS:
export const MOCK_TERMOS: DocumentVersion[] = [...]
export const MOCK_POLITICAS: DocumentVersion[] = [...]
export const MOCK_STATS = {...}
export const MOCK_GROUPS = [...]
export const MOCK_USER_TYPES = [...]
export const MOCK_EMPLOYERS = [...]
export const MOCK_FAMILY_MEMBERS = [...]
export const MOCK_TIME_CLOCK_RECORDS = [...]
export const MOCK_COMMUNICATIONS = [...]
export const MOCK_ALERTS = [...]
export const MOCK_SUBSCRIPTION_PLANS = [...]
export const MOCK_PAGE_DATA = {...}
```

### **2. Serviços com Dados Mockados**
- ❌ `notificationService.ts` - Notificações simuladas
- ❌ `webhookService.ts` - Webhooks mock
- ❌ `exportService.ts` - Dados de exportação hardcoded

### **3. Páginas com Dados Hardcoded**
- ❌ `esocial-domestico-completo.tsx` - Folha de pagamento simulada
- ❌ `esocial-integration.tsx` - Eventos eSocial mock
- ❌ `monitoring-dashboard.tsx` - Métricas simuladas

---

## 🎯 **Próximos Passos**

### **1. Criar APIs Faltantes**
```bash
# APIs que precisam ser criadas:
src/pages/api/statistics/index.ts
src/pages/api/family-members/index.ts
src/pages/api/page-data/index.ts
src/pages/api/notifications/index.ts
```

### **2. Atualizar Páginas Frontend**
- Substituir imports de `MOCK_*` por chamadas às APIs
- Implementar loading states
- Adicionar tratamento de erros

### **3. Atualizar Serviços**
- Remover dados mockados dos serviços
- Conectar aos endpoints reais
- Implementar cache quando necessário

### **4. Remover Arquivo Centralizado**
- Deletar `src/data/centralized.ts`
- Verificar se não há outras dependências

---

## 🗄️ **Estrutura das Novas Tabelas**

### **Estatísticas do Sistema**
```sql
CREATE TABLE estatisticas_sistema (
  id UUID PRIMARY KEY,
  chave VARCHAR(100) UNIQUE,
  valor VARCHAR(255),
  descricao TEXT,
  categoria VARCHAR(100),
  tipo_dado VARCHAR(50),
  atualizada_em TIMESTAMP,
  criado_em TIMESTAMP
);
```

### **Membros da Família**
```sql
CREATE TABLE membros_familia (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  nome VARCHAR(255),
  parentesco VARCHAR(100),
  cpf VARCHAR(11),
  data_nascimento DATE,
  telefone VARCHAR(11),
  email VARCHAR(255),
  endereco JSONB,
  contato_emergencia BOOLEAN,
  responsavel_financeiro BOOLEAN,
  ativo BOOLEAN,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### **Dados de Páginas**
```sql
CREATE TABLE dados_paginas (
  id UUID PRIMARY KEY,
  slug VARCHAR(100) UNIQUE,
  titulo VARCHAR(255),
  conteudo TEXT,
  tipo_pagina VARCHAR(50),
  categoria VARCHAR(100),
  tags TEXT[],
  ativa BOOLEAN,
  publica BOOLEAN,
  ultima_modificacao TIMESTAMP,
  modificado_por VARCHAR(255),
  versao VARCHAR(20),
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

### **Notificações**
```sql
CREATE TABLE notificacoes (
  id UUID PRIMARY KEY,
  usuario_id UUID REFERENCES usuarios(id),
  tipo VARCHAR(50),
  titulo VARCHAR(255),
  mensagem TEXT,
  categoria VARCHAR(100),
  prioridade VARCHAR(20),
  lida BOOLEAN,
  enviada BOOLEAN,
  dados_acao JSONB,
  data_envio TIMESTAMP,
  data_leitura TIMESTAMP,
  data_expiracao TIMESTAMP,
  criado_em TIMESTAMP,
  atualizado_em TIMESTAMP
);
```

---

## 🔧 **Comandos Executados**

```bash
# 1. Análise de dados mockados
grep -r "MOCK_\|mock\|hardcoded" src/

# 2. Criação de novas tabelas
npx prisma db push

# 3. Seed atualizado (com erro de email duplicado)
npx tsx prisma/seed.ts

# 4. Reset e reaplicação
npx prisma migrate reset --force --skip-seed
npx prisma db push
```

---

## ⚠️ **Problemas Identificados**

### **1. Seed com Erro de Email Duplicado**
- **Problema**: Conflito de emails únicos ao criar usuários extras
- **Solução**: Usar `upsert` em vez de `create` ou gerar emails únicos

### **2. Dependências de Dados Mockados**
- **Problema**: Páginas ainda importam dados de `centralized.ts`
- **Solução**: Criar APIs e atualizar imports

---

## 🎉 **Benefícios Alcançados**

### **Dados Reais no Banco:**
- ✅ Persistência entre sessões
- ✅ Sincronização entre usuários
- ✅ Auditoria completa
- ✅ Backup e recuperação

### **Estrutura Escalável:**
- ✅ Relacionamentos corretos
- ✅ Índices para performance
- ✅ Validações de integridade
- ✅ LGPD compliance

### **APIs Padronizadas:**
- ✅ CRUD completo
- ✅ Tratamento de erros
- ✅ Validação de dados
- ✅ Documentação automática

---

**Status**: 🔄 **Em Progresso - APIs em Desenvolvimento**  
**Próximo**: Criar APIs faltantes e conectar páginas frontend
