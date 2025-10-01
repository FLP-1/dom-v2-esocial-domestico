# ⚡ Comandos Rápidos - Prisma

Referência rápida de comandos para o dia a dia.

---

## 🚀 Instalação Inicial

```bash
# 1. Instalar dependências
npm install @prisma/client bcrypt
npm install -D prisma @types/bcrypt ts-node

# 2. Configurar .env
cp prisma/env-template.txt .env
# Editar DATABASE_URL

# 3. Criar banco e aplicar schema
npm run db:migrate

# 4. Popular com dados iniciais
npm run db:seed

# 5. Abrir Prisma Studio
npm run db:studio
```

---

## 📊 Comandos do Banco

### Migrations

```bash
# Criar e aplicar migration
npm run db:migrate

# Aplicar migrations em produção
npm run db:migrate:deploy

# Resetar banco (⚠️ apaga dados!)
npm run db:reset

# Aplicar schema sem migrations
npm run db:push
```

### Cliente Prisma

```bash
# Gerar cliente
npm run db:generate

# Validar schema
npm run db:validate

# Formatar schema
npm run db:format
```

### Dados

```bash
# Popular com seed
npm run db:seed

# Abrir Prisma Studio
npm run db:studio
```

---

## 🔧 PostgreSQL

### Comandos Básicos

```bash
# Conectar ao banco
psql -U dom_user -h localhost -d dom_db -W

# Listar bancos
\l

# Listar tabelas
\dt

# Descrever tabela
\d usuarios

# Sair
\q
```

### Criar Banco

```bash
# Entrar como postgres
sudo -u postgres psql

# Criar usuário
CREATE USER dom_user WITH PASSWORD 'senha_segura';

# Criar banco
CREATE DATABASE dom_db;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE dom_db TO dom_user;
```

### Backup e Restore

```bash
# Backup
pg_dump -U dom_user -h localhost dom_db > backup_$(date +%Y%m%d).sql

# Restore
psql -U dom_user -h localhost dom_db < backup_20240101.sql
```

---

## 📝 Queries Úteis (SQL)

### Usuários

```sql
-- Contar usuários
SELECT COUNT(*) FROM usuarios;

-- Usuários com perfis
SELECT u.nome_completo, p.nome as perfil
FROM usuarios u
JOIN usuarios_perfis up ON u.id = up.usuario_id
JOIN perfis p ON up.perfil_id = p.id;

-- Usuários por perfil
SELECT p.nome, COUNT(*) as total
FROM perfis p
LEFT JOIN usuarios_perfis up ON p.id = up.perfil_id
GROUP BY p.id, p.nome;
```

### Logs

```sql
-- Últimos 10 logs
SELECT * FROM logs_auditoria 
ORDER BY criado_em DESC 
LIMIT 10;

-- Logs por tipo
SELECT tipo_log, COUNT(*) as total
FROM logs_auditoria
GROUP BY tipo_log;

-- Logs de um usuário
SELECT * FROM logs_auditoria
WHERE usuario_id = 'uuid-aqui'
ORDER BY criado_em DESC;
```

### Registro de Ponto

```sql
-- Pontos do dia
SELECT * FROM registros_ponto
WHERE data_hora::date = CURRENT_DATE;

-- Pontos não aprovados
SELECT * FROM registros_ponto
WHERE aprovado = false;

-- Estatísticas de ponto
SELECT 
  tipo,
  COUNT(*) as total,
  AVG(CASE WHEN dentro_geofence THEN 1 ELSE 0 END) * 100 as perc_geofence
FROM registros_ponto
GROUP BY tipo;
```

---

## 💡 Prisma Client (TypeScript)

### Operações Básicas

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// CREATE
const usuario = await prisma.usuario.create({
  data: { /* dados */ }
})

// READ
const usuario = await prisma.usuario.findUnique({
  where: { cpf: '12345678901' }
})

// UPDATE
await prisma.usuario.update({
  where: { id: 'uuid' },
  data: { nomeCompleto: 'Novo Nome' }
})

// DELETE
await prisma.usuario.delete({
  where: { id: 'uuid' }
})

// FIND MANY
const usuarios = await prisma.usuario.findMany({
  where: { ativo: true },
  include: { perfis: true },
  take: 20,
  skip: 0,
  orderBy: { criadoEm: 'desc' }
})
```

### Transações

```typescript
// Transação
await prisma.$transaction([
  prisma.usuario.create({ data: {} }),
  prisma.logAuditoria.create({ data: {} }),
])

// Ou com lógica
await prisma.$transaction(async (tx) => {
  const usuario = await tx.usuario.create({ data: {} })
  await tx.logAuditoria.create({ 
    data: { usuarioId: usuario.id } 
  })
})
```

### Aggregations

```typescript
// Contar
const count = await prisma.usuario.count()

// Aggregate
const stats = await prisma.calculoSalarial.aggregate({
  _avg: { salarioBruto: true },
  _sum: { salarioBruto: true },
  _max: { salarioBruto: true },
  _min: { salarioBruto: true },
})
```

---

## 🔍 Debugging

### Logs do Prisma

```typescript
// Em desenvolvimento
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Ver SQL gerado
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
  ],
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})
```

### Verificar Conexão

```typescript
// Testar conexão
await prisma.$connect()
console.log('✅ Conectado ao banco')

// Executar query raw
const result = await prisma.$queryRaw`
  SELECT version();
`
console.log(result)
```

---

## 🚨 Troubleshooting Comum

### Erro: "password authentication failed"

```bash
# Resetar senha do PostgreSQL
sudo -u postgres psql
ALTER USER dom_user WITH PASSWORD 'nova_senha';
```

### Erro: "database does not exist"

```bash
# Criar banco
sudo -u postgres psql
CREATE DATABASE dom_db;
GRANT ALL PRIVILEGES ON DATABASE dom_db TO dom_user;
```

### Erro: "Client not generated"

```bash
# Gerar cliente novamente
npm run db:generate
```

### Migration falhou

```bash
# Ver status
npx prisma migrate status

# Resetar (⚠️ apaga dados!)
npm run db:reset
```

### Servidor PostgreSQL não está rodando

```bash
# Linux
sudo systemctl start postgresql
sudo systemctl status postgresql

# Windows
net start postgresql-x64-14

# macOS
brew services start postgresql@14
```

---

## 📊 Monitoramento

### Tamanho do Banco

```sql
-- Tamanho do banco
SELECT pg_size_pretty(pg_database_size('dom_db'));

-- Tamanho por tabela
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Índices

```sql
-- Listar índices
SELECT * FROM pg_indexes
WHERE schemaname = 'public';

-- Índices não utilizados
SELECT * FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND schemaname = 'public';
```

### Conexões Ativas

```sql
-- Ver conexões
SELECT * FROM pg_stat_activity
WHERE datname = 'dom_db';

-- Encerrar conexão
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'dom_db'
AND pid <> pg_backend_pid();
```

---

## 🔐 Segurança

### Alterar Senha

```sql
-- PostgreSQL
ALTER USER dom_user WITH PASSWORD 'nova_senha_forte';
```

### Revogar Permissões

```sql
-- Revogar todas permissões
REVOKE ALL PRIVILEGES ON DATABASE dom_db FROM dom_user;

-- Dar permissões específicas
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO dom_user;
```

### SSL (Produção)

```env
# .env
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

## 🔄 Atualizar Dados

### Adicionar Novo Perfil

```typescript
await prisma.perfil.create({
  data: {
    codigo: 'PARCEIRO',
    nome: 'Parceiro',
    cor: '#3498DB',
    ativo: true,
  }
})
```

### Adicionar Nova Funcionalidade

```typescript
const func = await prisma.funcionalidade.create({
  data: {
    codigo: 'nova-funcionalidade',
    nome: 'Nova Funcionalidade',
    rota: '/nova-funcionalidade',
    ordem: 12,
  }
})

// Dar permissão a um perfil
await prisma.perfilFuncionalidade.create({
  data: {
    perfilId: 'perfil-id',
    funcionalidadeId: func.id,
    permissaoLeitura: true,
    permissaoEscrita: true,
  }
})
```

### Limpar Logs Antigos

```sql
-- Apagar logs com mais de 90 dias
DELETE FROM logs_auditoria
WHERE criado_em < NOW() - INTERVAL '90 days';
```

---

## 📦 Exportar/Importar

### Exportar Dados (JSON)

```typescript
// Exportar todos usuários
const usuarios = await prisma.usuario.findMany({
  include: { perfis: true }
})

const fs = require('fs')
fs.writeFileSync('usuarios.json', JSON.stringify(usuarios, null, 2))
```

### Importar Dados (JSON)

```typescript
const fs = require('fs')
const data = JSON.parse(fs.readFileSync('usuarios.json', 'utf-8'))

for (const usuario of data) {
  await prisma.usuario.create({ data: usuario })
}
```

### Exportar Schema

```bash
# Gerar SQL do schema
npx prisma migrate diff \
  --from-empty \
  --to-schema-datamodel prisma/schema.prisma \
  --script > schema.sql
```

---

## ⚡ Performance

### Cache de Queries

```typescript
// Usar Redis ou similar
import Redis from 'ioredis'
const redis = new Redis()

const cacheKey = 'usuarios:all'
const cached = await redis.get(cacheKey)

if (cached) {
  return JSON.parse(cached)
}

const usuarios = await prisma.usuario.findMany()
await redis.set(cacheKey, JSON.stringify(usuarios), 'EX', 3600)
return usuarios
```

### Paginação Eficiente

```typescript
// Cursor-based (melhor para grandes datasets)
const usuarios = await prisma.usuario.findMany({
  take: 20,
  cursor: { id: lastId },
  orderBy: { id: 'asc' },
})

// Offset-based (mais simples)
const page = 1
const pageSize = 20
const usuarios = await prisma.usuario.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
})
```

### Select Específico

```typescript
// ❌ Ruim - traz tudo
const usuario = await prisma.usuario.findUnique({
  where: { id }
})

// ✅ Bom - traz apenas necessário
const usuario = await prisma.usuario.findUnique({
  where: { id },
  select: {
    id: true,
    nomeCompleto: true,
    email: true,
  }
})
```

---

## 📝 Notas Rápidas

### Dados Sem Máscara

```typescript
// Sempre remover máscaras antes de salvar
const cpfLimpo = cpf.replace(/\D/g, '') // 12345678901
const telefoneLimpo = telefone.replace(/\D/g, '') // 11999999999
const cepLimpo = cep.replace(/\D/g, '') // 01234567
```

### Hash de Senha

```typescript
import * as bcrypt from 'bcrypt'

// Criar hash
const saltRounds = 10
const hash = await bcrypt.hash(senha, saltRounds)

// Verificar senha
const match = await bcrypt.compare(senha, hash)
```

### UUID

```typescript
import { randomUUID } from 'crypto'

const id = randomUUID() // Gera UUID v4
```

---

## 🔗 Links Úteis

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**✅ Referência rápida para uso diário do Prisma!**

**Versão:** 2.2.1

