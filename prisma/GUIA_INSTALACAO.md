# 🚀 Guia de Instalação - Prisma + PostgreSQL

Guia completo para configurar o banco de dados do Sistema DOM.

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 14+ instalado e rodando
- npm ou yarn

---

## 1️⃣ Instalar PostgreSQL

### Windows

```bash
# Download do instalador oficial
https://www.postgresql.org/download/windows/

# Ou usar Chocolatey
choco install postgresql
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### macOS

```bash
# Usar Homebrew
brew install postgresql@14

# Iniciar serviço
brew services start postgresql@14
```

---

## 2️⃣ Configurar PostgreSQL

### Criar Usuário e Banco de Dados

```bash
# Acessar PostgreSQL
sudo -u postgres psql

# Criar usuário
CREATE USER dom_user WITH PASSWORD 'senha_segura_aqui';

# Criar banco de dados
CREATE DATABASE dom_db;

# Dar permissões
GRANT ALL PRIVILEGES ON DATABASE dom_db TO dom_user;

# Sair
\q
```

### Testar Conexão

```bash
psql -U dom_user -h localhost -d dom_db -W
```

---

## 3️⃣ Instalar Dependências do Projeto

```bash
# Na raiz do projeto
cd E:\DOM

# Instalar Prisma
npm install @prisma/client
npm install -D prisma typescript ts-node @types/node

# Instalar bcrypt para hash de senhas
npm install bcrypt
npm install -D @types/bcrypt
```

---

## 4️⃣ Configurar Variáveis de Ambiente

### Criar arquivo .env

```bash
# Copiar template
cp prisma/env-template.txt .env

# Ou criar manualmente
```

### Editar .env

```env
# Configuração principal
DATABASE_URL="postgresql://dom_user:senha_segura_aqui@localhost:5432/dom_db?schema=public"

# Outras configurações
NODE_ENV="development"
ENCRYPTION_KEY="sua-chave-de-32-caracteres-aqui"
JWT_SECRET="sua-chave-jwt-secreta"
```

---

## 5️⃣ Executar Migrations

### Opção A: Usando Migrations (Recomendado)

```bash
# Criar e aplicar migrations
npx prisma migrate dev --name init

# Isso irá:
# ✅ Criar as tabelas
# ✅ Gerar o cliente Prisma
# ✅ Aplicar o schema
```

### Opção B: Aplicar Schema Diretamente

```bash
# Aplicar schema sem criar migrations
npx prisma db push

# Gerar cliente
npx prisma generate
```

---

## 6️⃣ Popular com Dados Iniciais (Seed)

### Configurar package.json

Adicione ao seu `package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset",
    "db:studio": "npx prisma studio"
  }
}
```

### Executar Seed

```bash
npm run db:seed

# Ou diretamente
npx prisma db seed
```

### O Seed Criará:

✅ 4 Perfis (Empregado, Empregador, Família, Admin)  
✅ 11+ Funcionalidades  
✅ Permissões para cada perfil  
✅ 2 Usuários de exemplo  
✅ Termos de uso v2.1.0  
✅ Configurações iniciais

---

## 7️⃣ Verificar Instalação

### Abrir Prisma Studio

```bash
npm run db:studio

# Ou
npx prisma studio
```

Acesse: http://localhost:5555

### Verificar Dados

No Prisma Studio, verifique:

- ✅ Tabela `usuarios` tem 2 registros
- ✅ Tabela `perfis` tem 4 registros
- ✅ Tabela `funcionalidades` tem 11+ registros
- ✅ Tabela `perfis_funcionalidades` tem permissões configuradas

---

## 8️⃣ Testar Conexão no Código

Criar arquivo `test-db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Buscar todos os perfis
  const perfis = await prisma.perfil.findMany()
  console.log('Perfis:', perfis)

  // Buscar usuários
  const usuarios = await prisma.usuario.findMany({
    include: {
      perfis: {
        include: {
          perfil: true
        }
      }
    }
  })
  console.log('Usuários:', usuarios)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Executar:

```bash
npx ts-node test-db.ts
```

---

## 9️⃣ Scripts Úteis

### Adicionar ao package.json

```json
{
  "scripts": {
    "db:migrate": "npx prisma migrate dev",
    "db:migrate:deploy": "npx prisma migrate deploy",
    "db:generate": "npx prisma generate",
    "db:seed": "npx prisma db seed",
    "db:reset": "npx prisma migrate reset",
    "db:studio": "npx prisma studio",
    "db:validate": "npx prisma validate",
    "db:format": "npx prisma format",
    "db:backup": "node scripts/backup-db.js"
  }
}
```

### Usar Scripts

```bash
# Abrir Prisma Studio
npm run db:studio

# Resetar banco (cuidado!)
npm run db:reset

# Validar schema
npm run db:validate

# Formatar schema
npm run db:format
```

---

## 🔟 Backup e Restore

### Criar Backup

```bash
# Backup completo
pg_dump -U dom_user -h localhost -d dom_db -F c -f backup_$(date +%Y%m%d).dump

# Backup SQL
pg_dump -U dom_user -h localhost -d dom_db > backup_$(date +%Y%m%d).sql
```

### Restore Backup

```bash
# Restore de arquivo .dump
pg_restore -U dom_user -h localhost -d dom_db backup_20240101.dump

# Restore de arquivo .sql
psql -U dom_user -h localhost -d dom_db < backup_20240101.sql
```

### Script Automático de Backup

Criar `scripts/backup-db.js`:

```javascript
const { exec } = require('child_process')
const path = require('path')

const backupDir = path.join(__dirname, '..', 'backups')
const date = new Date().toISOString().split('T')[0]
const backupFile = path.join(backupDir, `backup_${date}.sql`)

const command = `pg_dump -U dom_user -h localhost -d dom_db > "${backupFile}"`

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ Erro no backup: ${error}`)
    return
  }
  console.log(`✅ Backup criado: ${backupFile}`)
})
```

---

## 🔒 Segurança

### 1. Senha Segura do PostgreSQL

```bash
# Alterar senha do usuário
psql -U postgres
ALTER USER dom_user WITH PASSWORD 'nova_senha_forte_aqui';
```

### 2. Configurar SSL (Produção)

No arquivo `.env`:

```env
DATABASE_URL="postgresql://dom_user:senha@localhost:5432/dom_db?schema=public&sslmode=require"
```

### 3. Configurar pg_hba.conf

```bash
# Localizar arquivo
sudo find / -name pg_hba.conf

# Editar (exemplo Ubuntu)
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Adicionar:

```
# IPv4 local connections:
host    dom_db    dom_user    127.0.0.1/32    md5
```

Reiniciar PostgreSQL:

```bash
sudo systemctl restart postgresql
```

### 4. Firewall

```bash
# Permitir apenas localhost (desenvolvimento)
sudo ufw allow from 127.0.0.1 to any port 5432

# Produção - IP específico
sudo ufw allow from IP_DO_SERVIDOR to any port 5432
```

---

## 🚨 Troubleshooting

### Erro: "Connection refused"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar porta
sudo netstat -plunt | grep 5432
```

### Erro: "password authentication failed"

```bash
# Resetar senha
sudo -u postgres psql
ALTER USER dom_user WITH PASSWORD 'nova_senha';
```

### Erro: "database does not exist"

```bash
# Criar banco manualmente
sudo -u postgres psql
CREATE DATABASE dom_db;
GRANT ALL PRIVILEGES ON DATABASE dom_db TO dom_user;
```

### Erro: "Prisma Client not generated"

```bash
# Gerar cliente novamente
npx prisma generate
```

### Erro: "Migration failed"

```bash
# Resetar migrations (CUIDADO: apaga dados!)
npx prisma migrate reset

# Ou reverter última migration
npx prisma migrate resolve --rolled-back 20240101000000_init
```

---

## 📊 Verificações Finais

### ✅ Checklist

- [ ] PostgreSQL instalado e rodando
- [ ] Banco de dados `dom_db` criado
- [ ] Usuário `dom_user` criado com permissões
- [ ] Arquivo `.env` configurado
- [ ] Dependências instaladas (`@prisma/client`, etc.)
- [ ] Migrations aplicadas (`npx prisma migrate dev`)
- [ ] Seed executado (`npx prisma db seed`)
- [ ] Prisma Studio acessível (`npx prisma studio`)
- [ ] Dados de teste visíveis no Studio
- [ ] Backup configurado

### Testar Tudo

```bash
# 1. Verificar PostgreSQL
psql -U dom_user -h localhost -d dom_db -c "SELECT version();"

# 2. Verificar Prisma
npx prisma validate

# 3. Abrir Studio
npx prisma studio

# 4. Testar query
npx ts-node test-db.ts
```

---

## 📚 Próximos Passos

1. ✅ Implementar autenticação (JWT)
2. ✅ Criar endpoints da API
3. ✅ Implementar validações
4. ✅ Configurar CORS
5. ✅ Implementar rate limiting
6. ✅ Configurar logs
7. ✅ Implementar cache (Redis)
8. ✅ Configurar monitoramento (Sentry)

---

## 🔗 Recursos

- [Prisma Docs](https://www.prisma.io/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Versão:** 2.2.1  
**Última Atualização:** 2024  
**Suporte:** Sistema DOM

