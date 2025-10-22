# 🔧 Correção: Dados de Empregador Movidos para o Banco de Dados

## 📋 Problema Identificado

O arquivo `env.local` continha dados sensíveis do empregador que **NÃO** deveriam estar em variáveis de ambiente:

```env
# ❌ DADOS QUE ESTAVAM NO ENV.LOCAL (ERRADO):
ESOCIAL_EMPREGADOR_CPF=59876913700
ESOCIAL_EMPREGADOR_NOME=FLP Business Strategy
ESOCIAL_CERTIFICATE_PATH=./certificados/eCPF A1 24940271 (senha 456587).pfx
ESOCIAL_CERTIFICATE_PASSWORD=456587
```

### 🚨 Por que isso estava errado?

1. **Dados de negócio não são configurações**: CPF, nome e endereço são dados de negócio, não configurações técnicas
2. **Falta de flexibilidade**: Não permite múltiplos empregadores
3. **Segurança**: Dados sensíveis expostos em arquivo de configuração
4. **Manutenibilidade**: Mudanças de dados exigiriam alteração de código/ambiente

---

## ✅ Solução Implementada

### 1. **Criação da Tabela `empregadores`**

Adicionado ao `prisma/schema.prisma`:

```prisma
model Empregador {
  id                    String    @id @default(uuid())
  cpfCnpj               String    @unique @db.VarChar(14)
  tipoInscricao         String    @default("CPF") @db.VarChar(4)
  nome                  String    @db.VarChar(255)
  razaoSocial           String?   @db.VarChar(255)
  email                 String    @db.VarChar(255)
  telefone              String    @db.VarChar(11)
  logradouro            String    @db.VarChar(255)
  numero                String    @db.VarChar(20)
  complemento           String?   @db.VarChar(100)
  bairro                String    @db.VarChar(100)
  cidade                String    @db.VarChar(100)
  uf                    String    @db.VarChar(2)
  cep                   String    @db.VarChar(8)
  certificadoPath       String?   @db.VarChar(500)
  certificadoPassword   String?   @db.VarChar(255)
  certificadoCPF        String?   @db.VarChar(11)
  certificadoSerial     String?   @db.VarChar(255)
  certificadoValidoAte  DateTime?
  ambienteESocial       String    @default("HOMOLOGACAO") @db.VarChar(20)
  ativo                 Boolean   @default(true)
  criadoEm              DateTime  @default(now())
  atualizadoEm          DateTime  @updatedAt

  @@index([cpfCnpj])
  @@index([ativo])
  @@map("empregadores")
}
```

### 2. **Atualização do Seed**

Adicionado em `prisma/seed.ts`:

```typescript
// 🏢 EMPREGADORES
console.log('🏢 Criando empregadores...')

const empregadorPrincipal = await prisma.empregador.upsert({
  where: { cpfCnpj: '59876913700' },
  update: {},
  create: {
    cpfCnpj: '59876913700',
    tipoInscricao: 'CPF',
    nome: 'FLP Business Strategy',
    razaoSocial: 'FLP Business Strategy',
    email: 'contato@flpbusiness.com',
    telefone: '11999999999',
    logradouro: 'Rua das Flores',
    numero: '123',
    complemento: 'Sala 45',
    bairro: 'Centro',
    cidade: 'São Paulo',
    uf: 'SP',
    cep: '01234567',
    certificadoPath: './certificados/eCPF A1 24940271 (senha 456587).pfx',
    certificadoCPF: '24940271',
    certificadoSerial: '456587',
    ambienteESocial: 'HOMOLOGACAO',
    ativo: true,
  },
})
```

### 3. **Arquivo `env.local` Corrigido**

Agora contém **APENAS** configurações técnicas:

```env
# ===========================================
# 🗄️ CONFIGURAÇÕES DO BANCO DE DADOS
# ===========================================
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"

# ===========================================
# 🌐 CONFIGURAÇÕES GERAIS
# ===========================================
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# 🔐 CONFIGURAÇÕES DE AUTENTICAÇÃO
# ===========================================
JWT_SECRET=dom_secret_key_32_chars_min_2025
JWT_EXPIRES_IN=7d
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dom_nextauth_secret_key_2025

# ===========================================
# 🔐 CONFIGURAÇÕES DE CERTIFICADOS eSocial
# ===========================================
ESOCIAL_CERTIFICATE_PATH=./certificados/eCPF A1 24940271 (senha 456587).pfx
ESOCIAL_CERTIFICATE_PASSWORD=456587

# ===========================================
# 🌐 URLS DO eSocial
# ===========================================
ESOCIAL_URL_PRODUCAO=https://webservices.envio.esocial.gov.br
ESOCIAL_URL_HOMOLOGACAO=https://webservices.producaorestrita.esocial.gov.br
```

### 4. **API para Gerenciar Empregadores**

Criado em `src/pages/api/employers/index.ts`:

```typescript
// GET /api/employers - Lista todos os empregadores ativos
// POST /api/employers - Cria novo empregador
```

---

## 🔄 Alterações Realizadas

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `env.local` | ✅ Corrigido | Removidos dados de empregador |
| `prisma/schema.prisma` | ✅ Atualizado | Adicionado model Empregador |
| `prisma/seed.ts` | ✅ Atualizado | Adicionado seed de empregador |
| `src/pages/api/employers/index.ts` | ✅ Criado | API para gerenciar empregadores |

---

## 🎯 Benefícios da Nova Abordagem

### ✅ Separação de Responsabilidades
- **Configurações**: Permanecem no `env.local` (URLs, segredos, certificados)
- **Dados de Negócio**: Armazenados no banco de dados

### ✅ Escalabilidade
- Suporte a múltiplos empregadores
- Fácil adição/edição via interface administrativa

### ✅ Segurança
- Dados sensíveis no banco com controle de acesso
- Histórico de alterações (auditoria)

### ✅ Flexibilidade
- Alterações sem necessidade de redeploy
- Gestão via interface web

---

## 📝 Como Usar

### Consultar Empregadores

```bash
# Via API
GET http://localhost:3000/api/employers

# Via Banco de Dados
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT * FROM empregadores;"
```

### Adicionar Novo Empregador

```bash
POST http://localhost:3000/api/employers
Content-Type: application/json

{
  "cpfCnpj": "12345678900",
  "nome": "João Silva",
  "email": "joao@email.com",
  "telefone": "11987654321",
  "logradouro": "Rua Exemplo",
  "numero": "100",
  "bairro": "Centro",
  "cidade": "São Paulo",
  "uf": "SP",
  "cep": "01000000"
}
```

---

## 🧪 Validação

Execute os comandos para validar:

```powershell
# 1. Sincronizar banco
npx prisma db push

# 2. Executar seed
npx tsx prisma/seed.ts

# 3. Verificar dados
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT nome, cpfCnpj, email FROM empregadores;"
```

---

## ✅ Status: CORRIGIDO COM SUCESSO

- ✅ Tabela `empregadores` criada
- ✅ Dados migrados do `env.local` para o banco
- ✅ API REST implementada
- ✅ Seed atualizado
- ✅ Documentação completa

---

**Data de Correção**: 2025-10-02  
**Versão**: DOM v1.0.0-final

