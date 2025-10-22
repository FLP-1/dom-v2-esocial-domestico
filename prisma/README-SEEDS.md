# 🌱 Guia de Seeds do Banco de Dados

## 📋 Visão Geral

Este diretório contém os scripts de população (seeds) do banco de dados para desenvolvimento e testes.

---

## 🎯 Seeds Disponíveis

### 1. **seed-completo.ts** ⭐ (PRINCIPAL)

**Quando usar:**
- Reset completo do banco de dados
- Início de novos testes
- Após alterações no schema que exigem recriação do banco
- Configuração inicial do ambiente de desenvolvimento

**O que faz:**
- 🧹 Limpa TODOS os dados existentes
- 👥 Cria 4 usuários completos com dados válidos
- 👔 Cria 4 perfis (Empregador, Empregado, Família, Admin)
- 🔗 Associa perfis aos usuários
- 👨‍👩‍👧‍👦 Cria membros da família
- 💬 Cria conversas e mensagens de teste
- 📋 Cria tarefas de exemplo
- 💰 Cria empréstimos
- 📄 Cria documentos
- ⚙️ Configura sistema
- 📊 Cria métricas e estatísticas

**Como executar:**
```powershell
# Método 1: Via npm script (recomendado)
npm run db:seed

# Método 2: Via Prisma diretamente
npx prisma db seed

# Método 3: Reset completo + seed
npx prisma migrate reset
```

**Dados criados:**
- ✅ 4 usuários com CPFs válidos
- ✅ 5 associações usuário-perfil
- ✅ 2 membros da família
- ✅ 2 conversas com 4 mensagens
- ✅ 3 tarefas
- ✅ 3 empréstimos
- ✅ 2 documentos
- ✅ 4 métricas
- ✅ 5 configurações do sistema
- ✅ 1 termo de uso

---

### 2. **seed-novo-empregado.ts** 🔧 (INCREMENTAL)

**Quando usar:**
- Adicionar um novo empregado SEM limpar o banco
- Testar funcionalidades de modal de perfis
- Validar relacionamentos entre empregador e empregado
- Testes incrementais de funcionalidades específicas

**O que faz:**
- 🔍 Busca empregador existente (Francisco)
- 👤 Cria novo empregado vinculado ao empregador
- 🔗 Associa perfil de Empregado
- 📋 Cria tarefas para o novo empregado
- 💰 Configura dados de folha de pagamento
- ⚠️ **NÃO limpa dados existentes**

**Como executar:**
```powershell
# Via ts-node
npx ts-node prisma/seed-novo-empregado.ts

# Ou via script npm (se configurado)
npm run db:seed:incremental
```

**Pré-requisitos:**
- ⚠️ Banco deve ter dados prévios (especialmente Francisco como empregador)
- ⚠️ Executar após `seed-completo.ts`

---

## 🛠️ Utilitários

### **utils/cpf-validator.ts**

Funções auxiliares para validação e geração de CPFs:

- `validarCPF(cpf: string)`: Valida dígitos verificadores
- `gerarCPF()`: Gera CPF válido aleatório
- `formatarCPF(cpf: string)`: Formata CPF (XXX.XXX.XXX-XX)
- `CPF_TESTES`: Objeto com 10 CPFs válidos pré-testados

**CPFs de Teste Disponíveis:**
```typescript
{
  francisco: '59876913700', // Empregador principal
  maria: '12345678909',     // Empregada
  carlos: '98765432100',    // Empregado
  ana: '11144477735',       // Família
  pedro: '11122233396',     // Membro família
  joao: '30747782610',      // Reserva
  juliana: '52205200755',   // Reserva
  lucas: '00076323633',     // Reserva
  patricia: '40263020673',  // Para novo empregado
  roberto: '51474442544'    // Reserva
}
```

---

## 📂 Seeds Antigos (Backup)

Diretório: `seeds-backup/`

Contém seeds deprecados mantidos apenas para referência histórica:
- `seed-original-deprecated.ts` - Seed original com geração aleatória de CPF
- `seed-massa-testes-deprecated.ts` - Massa de testes simplificada

⚠️ **NÃO use esses arquivos!** Eles estão desatualizados e podem causar inconsistências.

---

## 🚀 Fluxo de Trabalho Recomendado

### **Cenário 1: Novo Ambiente de Desenvolvimento**
```powershell
# 1. Criar banco de dados
npx prisma migrate dev

# 2. Popular com dados iniciais
npx prisma db seed
```

### **Cenário 2: Reset Completo para Testes**
```powershell
# Reset tudo (migrations + seed)
npx prisma migrate reset
```

### **Cenário 3: Adicionar Dados Incrementalmente**
```powershell
# 1. Popular base inicial
npx prisma db seed

# 2. Adicionar novo empregado
npx ts-node prisma/seed-novo-empregado.ts
```

### **Cenário 4: Atualização de Schema**
```powershell
# 1. Criar migration
npx prisma migrate dev --name nome_da_alteracao

# 2. Repopular banco
npx prisma db seed
```

---

## ⚙️ Configuração

### **package.json**
```json
{
  "prisma": {
    "seed": "ts-node prisma/seed-completo.ts"
  },
  "scripts": {
    "db:seed": "npx prisma db seed",
    "db:seed:incremental": "npx ts-node prisma/seed-novo-empregado.ts",
    "db:reset:full": "npx prisma migrate reset --skip-seed && npm run db:seed"
  }
}
```

---

## 🐛 Troubleshooting

### **Erro: "CPF inválido"**
- Todos os CPFs em `CPF_TESTES` são pré-validados
- Se ocorrer, verifique se o arquivo `utils/cpf-validator.ts` está correto

### **Erro: "Empregador não encontrado" (seed-novo-empregado)**
- Execute primeiro o `seed-completo.ts`
- Verifique se Francisco (CPF: 59876913700) existe no banco

### **Erro: Foreign key constraint**
- Ordem de deleção no seed-completo está otimizada
- Se ocorrer, verifique se há dados órfãos de execuções anteriores

### **Erro: "duplicate key value violates unique constraint"**
- Provavelmente o banco já tem dados
- Solução: Execute `npx prisma migrate reset` para limpar tudo

---

## 📊 Validação dos Dados

Após executar o seed, valide com:

```powershell
# Via Prisma Studio (interface visual)
npx prisma studio

# Via consulta SQL
npx prisma db execute --schema=prisma/schema.prisma --stdin
# Cole: SELECT 'usuarios' as tabela, COUNT(*) FROM usuarios;
```

**Contagens esperadas (seed-completo.ts):**
- Usuários: 4
- Perfis: 4
- Usuários-Perfis: 5
- Documentos: 2
- Tarefas: 3
- Empréstimos: 3
- Conversas: 2
- Mensagens: 4

---

## 📝 Notas Importantes

1. **NUNCA commite dados sensíveis** nos seeds
2. **Todos os CPFs** são válidos mas fictícios (exceto Francisco que é real de teste)
3. **Senhas** nos seeds são hash bcrypt de "senha123"
4. **Seeds são APENAS para desenvolvimento/teste**, nunca para produção
5. **Ordem de execução** é crítica - respeite as foreign keys

---

## 🔄 Manutenção

### **Ao adicionar nova tabela:**
1. Adicione deleção no início do `seed-completo.ts` (ordem reversa de dependência)
2. Adicione criação de dados de exemplo
3. Atualize este README com as contagens esperadas

### **Ao criar novo tipo de seed:**
1. Crie arquivo `seed-[nome].ts`
2. Documente neste README quando usar
3. Adicione script no `package.json` se necessário

---

## 📚 Referências

- [Prisma Seeding](https://www.prisma.io/docs/guides/database/seed-database)
- [Validação de CPF](https://www.macoratti.net/alg_cpf.htm)
- Schema: `prisma/schema.prisma`

---

**Última atualização:** 2025-10-08  
**Responsável:** Sistema DOM - AI Agent

