# 🗄️ Prisma - Sistema DOM

Estrutura de dados robusta para PostgreSQL com compliance total à LGPD.

---

## 📚 Documentação

- **[DOCUMENTACAO_SCHEMA.md](./DOCUMENTACAO_SCHEMA.md)** - Documentação completa do schema
- **[schema.prisma](./schema.prisma)** - Schema do banco de dados
- **[seed.ts](./seed.ts)** - Dados iniciais (seed)
- **[exemplos-uso.ts](./exemplos-uso.ts)** - Exemplos práticos de uso

---

## 🚀 Início Rápido

### 1. Instalar Dependências

```bash
npm install @prisma/client
npm install -D prisma bcrypt
npm install -D @types/bcrypt
```

### 2. Configurar Banco de Dados

Copie o arquivo `.env.example` para `.env` e configure:

```bash
cp .env.example .env
```

Edite o `.env` com suas credenciais:

```env
DATABASE_URL="postgresql://postgres:senha@localhost:5432/dom_db?schema=public"
```

### 3. Criar Banco de Dados

```bash
# Criar as tabelas
npx prisma migrate dev --name init

# Ou apenas aplicar o schema sem migrations
npx prisma db push
```

### 4. Popular com Dados Iniciais (Seed)

Adicione ao `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

Execute o seed:

```bash
npx prisma db seed
```

### 5. Gerar Cliente Prisma

```bash
npx prisma generate
```

---

## 🎯 Estrutura do Banco

### Tabelas Principais

- **usuarios** - Dados dos usuários (CPF único)
- **perfis** - Tipos de usuário (Empregado, Empregador, Família, Admin)
- **funcionalidades** - Funcionalidades do sistema
- **grupos** - Grupos de comunicação
- **dispositivos** - Dispositivos registrados (anti-fraude)
- **registros_ponto** - Registro de ponto (anti-fraude)
- **documentos** - Gestão de documentos
- **tarefas** - Gestão de tarefas
- **mensagens** - Sistema de comunicação
- **eventos_esocial** - Eventos eSocial
- **calculos_salariais** - Folha de pagamento
- **emprestimos** - Gestão de empréstimos
- **alertas** - Sistema de alertas
- **logs_auditoria** - Log completo (LGPD)

### Tabelas Pivot (N:N)

- **usuarios_perfis** - Usuário ↔ Perfil
- **usuarios_grupos** - Usuário ↔ Grupo
- **perfis_funcionalidades** - Perfil ↔ Funcionalidade

---

## ✅ Requisitos Atendidos

✅ **1 CPF + Tipo de Usuário Único**
- Constraint: `@@unique([usuarioId, perfilId])`

✅ **Informações do CPF Não Repetidas**
- Dados centralizados na tabela `usuarios`
- Normalização completa (3NF)

✅ **Dados Sem Máscaras**
- CPF: 11 dígitos
- Telefone: 11 dígitos
- CEP: 8 dígitos

✅ **Usuário em Múltiplos Grupos**
- Constraint: `@@unique([usuarioId, grupoId])`
- Sem duplicidade no mesmo grupo

✅ **Tipo de Usuário por Funcionalidades**
- 4 perfis: Empregado, Empregador, Família, Admin
- 11+ funcionalidades
- Permissões granulares

✅ **Tabela de Log**
- `logs_auditoria` completa
- Rastreamento de todas operações

✅ **Compliance LGPD**
- Consentimento explícito
- Logs de auditoria
- Exportação de dados
- Direito ao esquecimento

---

## 📊 Comandos Úteis

### Prisma Studio (Interface Visual)

```bash
npx prisma studio
```

### Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Resetar banco (CUIDADO!)
npx prisma migrate reset
```

### Gerar Cliente

```bash
npx prisma generate
```

### Validar Schema

```bash
npx prisma validate
```

### Formatar Schema

```bash
npx prisma format
```

---

## 💡 Exemplos de Uso

### Criar Usuário

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const usuario = await prisma.usuario.create({
  data: {
    cpf: '12345678901', // Sem máscara
    nomeCompleto: 'João da Silva',
    email: 'joao@email.com',
    telefone: '11999999999', // Sem máscara
    dataNascimento: new Date('1990-01-15'),
    senhaHash: 'hash_aqui',
    salt: 'salt_aqui',
    consentimentoLGPD: true,
    termosAceitos: true,
  }
})
```

### Buscar Usuário com Perfis

```typescript
const usuario = await prisma.usuario.findUnique({
  where: { cpf: '12345678901' },
  include: {
    perfis: {
      include: {
        perfil: true
      }
    }
  }
})
```

### Verificar Permissão

```typescript
const permissoes = await prisma.perfilFuncionalidade.findFirst({
  where: {
    perfil: {
      usuarios: {
        some: {
          usuarioId: 'user-id'
        }
      }
    },
    funcionalidade: {
      codigo: 'time-clock'
    }
  }
})

const podeRegistrarPonto = permissoes?.permissaoEscrita
```

Mais exemplos em: [exemplos-uso.ts](./exemplos-uso.ts)

---

## 🔒 Segurança

### Dados Sem Máscara

**Sempre remova máscaras antes de salvar:**

```typescript
// ❌ ERRADO
cpf: '123.456.789-01'

// ✅ CORRETO  
cpf: '12345678901'
```

### Criptografia

**Senhas:**

```typescript
import * as bcrypt from 'bcrypt'

const saltRounds = 10
const senhaHash = await bcrypt.hash(senha, saltRounds)
```

**Dados Sensíveis:**

Use criptografia AES-256 para dados muito sensíveis:

```typescript
import * as crypto from 'crypto'

const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(algorithm, key, iv)
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}
```

### Validação de CPF

```typescript
function validarCPF(cpf: string): boolean {
  // Remover máscara
  const cpfLimpo = cpf.replace(/\D/g, '')
  
  // Validar tamanho
  if (cpfLimpo.length !== 11) return false
  
  // Validar dígitos verificadores
  // ... implementar lógica
  
  return true
}
```

---

## 📋 LGPD e Compliance

### Logs Obrigatórios

```typescript
// Sempre logar acessos a dados pessoais
await prisma.logAuditoria.create({
  data: {
    usuarioId: usuario.id,
    acao: 'READ',
    entidade: 'Usuario',
    descricao: 'Acesso aos dados pessoais',
    tipoLog: 'LGPD',
    nivelSeveridade: 'INFO',
  }
})
```

### Exportar Dados (LGPD)

```typescript
// Usuário pode solicitar seus dados
const meusDados = await prisma.usuario.findUnique({
  where: { id: usuarioId },
  include: {
    perfis: true,
    documentos: true,
    tarefas: true,
    // ... todos os relacionamentos
  }
})
```

### Excluir Dados (LGPD)

```typescript
// Direito ao esquecimento
await prisma.usuario.delete({
  where: { id: usuarioId }
})
// Cascade irá excluir relacionamentos
```

---

## 🚨 Troubleshooting

### Erro de Conexão

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -U postgres -h localhost -p 5432
```

### Migração Falhou

```bash
# Resetar migrations
npx prisma migrate reset

# Aplicar novamente
npx prisma migrate dev
```

### Cliente não atualizado

```bash
# Regerar cliente
npx prisma generate
```

---

## 📚 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [LGPD - Lei 13.709/2018](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

---

## 📝 Notas

### Backup

**Recomendado:**
- Backup diário automático
- Retenção de 30 dias
- Criptografia dos backups
- Teste de restore mensal

```bash
# Backup manual
pg_dump -U postgres dom_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres dom_db < backup_20240101.sql
```

### Performance

**Índices:**
- Todos os campos de busca têm índices
- CPF, email, telefone indexados
- Logs indexados por data e tipo

**Otimizações:**
- Use `select` para limitar campos
- Use paginação em listas grandes
- Implemente cache com Redis

**Exemplo:**

```typescript
// ✅ BOM - Seleciona apenas campos necessários
const usuarios = await prisma.usuario.findMany({
  select: {
    id: true,
    nomeCompleto: true,
    email: true,
  },
  take: 20,
  skip: page * 20,
})

// ❌ RUIM - Traz tudo
const usuarios = await prisma.usuario.findMany()
```

---

**Versão:** 1.0.0  
**Última Atualização:** 2024  
**Autor:** Sistema DOM

