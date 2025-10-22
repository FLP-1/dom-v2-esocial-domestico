# 🌱 COMO EXECUTAR O SEED - Guia Passo a Passo

## ✅ O QUE JÁ FOI FEITO

1. ✅ Banco de dados `dom` criado
2. ✅ Usuário `userdom` configurado
3. ✅ 41 tabelas criadas no banco
4. ✅ Arquivo `prisma/seed.ts` criado com **CPFs VÁLIDOS**
5. ✅ Função de validação de CPF implementada
6. ✅ Variável de ambiente `DATABASE_URL` configurada no Windows

---

## 🚀 EXECUTE AGORA - PASSO A PASSO

### Passo 1: Abra um NOVO terminal PowerShell

Importante: Abra um terminal NOVO para garantir que as variáveis de ambiente estejam carregadas.

### Passo 2: Navegue para o diretório do projeto

```powershell
cd E:\DOM
```

### Passo 3: Instale as dependências do seed

```powershell
npm install --save-dev tsx @types/bcryptjs
npm install bcryptjs
```

### Passo 4: Execute o seed

```powershell
npx tsx prisma/seed.ts
```

**OU use o script pronto:**

```powershell
.\executar-seed.ps1
```

### Passo 5: Verifique os dados criados

```powershell
# Ver total de usuários
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT COUNT(*) FROM usuarios;"

# Ver usuários criados
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT cpf, nome_completo, email FROM usuarios;"
```

---

## 🔑 CREDENCIAIS PARA LOGIN

Após executar o seed, use estas credenciais para fazer login:

### Opção 1: Empregador (Acesso Completo)
```
📧 Email: francisco@flpbusiness.com
🔒 Senha: senha123
👤 CPF: 59876913700
```

### Opção 2: Empregado
```
📧 Email: maria.santos@email.com
🔒 Senha: senha123
👤 CPF: 38645446880
```

### Opção 3: Outros usuários
```
📧 Emails disponíveis:
   - joao.silva@email.com
   - ana.santos@email.com
   - pedro.oliveira@email.com
   - julia.costa@email.com
   - carlos.souza@email.com
   - fernanda.lima@email.com

🔒 Senha: senha123 (todos)
👤 CPF: Gerado automaticamente com validação correta
```

---

## 📊 DADOS QUE SERÃO CRIADOS

O seed irá criar:

| Item | Quantidade | Detalhes |
|------|------------|----------|
| **Usuários** | 8 | Todos com CPF válido |
| **Perfis** | 4 | Admin, Empregador, Empregado, Família |
| **Funcionalidades** | 11 | Todas as funcionalidades do sistema |
| **Permissões** | 30+ | Configuradas por perfil |
| **Grupos** | 1 | Família Papaleo |
| **Dispositivos** | 5 | Smartphones com geolocalização |
| **Documentos** | 15 | RG, CPF, CNH, etc. |
| **Tarefas** | 20 | Distribuídas entre usuários |
| **Planos** | 3 | Gratuito, Básico, Premium |
| **Assinaturas** | 1 | Francisco com Plano Básico |
| **Listas de Compras** | 1 | 6 itens de supermercado |
| **Alertas** | 5 | Vencimentos e pagamentos |
| **Termos** | 1 | Versão v2.1.0 |
| **Configurações** | 6 | Sistema e eSocial |

---

## ✅ VALIDAÇÃO DE CPF

### Como funciona

Todos os CPFs são gerados com a **validação oficial brasileira**:

1. Gera 9 dígitos aleatórios
2. Calcula o 1º dígito verificador
3. Calcula o 2º dígito verificador
4. Retorna CPF de 11 dígitos **100% válido**

### CPFs pré-configurados (já validados)

- ✅ **59876913700** - Francisco (Empregador)
- ✅ **38645446880** - Maria (Empregado)
- ✅ Demais usuários: CPFs gerados automaticamente (todos válidos)

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### Problema 1: "Prisma Client not found"

**Solução:**
```powershell
npx prisma generate
```

### Problema 2: "Cannot find module 'tsx'"

**Solução:**
```powershell
npm install --save-dev tsx
```

### Problema 3: "Cannot find module 'bcryptjs'"

**Solução:**
```powershell
npm install bcryptjs @types/bcryptjs
```

### Problema 4: "Error: P2002 - Unique constraint failed"

Isso significa que o seed já foi executado antes. Para reexecutar:

**Solução 1 - Limpar apenas os dados:**
```powershell
psql -h localhost -p 5433 -U postgres -d dom -c "TRUNCATE TABLE usuarios CASCADE;"
npx tsx prisma/seed.ts
```

**Solução 2 - Resetar banco completo:**
```powershell
npm run db:reset
npx tsx prisma/seed.ts
```

### Problema 5: Seed executado mas não aparece nada

**Verificar se os dados foram criados:**
```powershell
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT * FROM usuarios LIMIT 3;"
```

Se aparecer dados, o seed funcionou!

---

## 🎯 PRÓXIMOS PASSOS

Após executar o seed:

### 1. Abrir o Prisma Studio (Interface Visual)

```powershell
npm run db:studio
```

Acesse: **http://localhost:5555**

Você verá todos os dados criados de forma visual!

### 2. Iniciar o Sistema

```powershell
npm run dev
```

Acesse: **http://localhost:3000**

### 3. Fazer Login

Use as credenciais acima para fazer login no sistema.

---

## 📝 COMANDOS ÚTEIS

### Ver dados no banco

```powershell
# Listar todos os usuários
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT cpf, nome_completo, email FROM usuarios;"

# Contar registros em cada tabela
psql -h localhost -p 5433 -U postgres -d dom -c "
SELECT 
  'usuarios' as tabela, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'perfis', COUNT(*) FROM perfis
UNION ALL
SELECT 'documentos', COUNT(*) FROM documentos
UNION ALL
SELECT 'tarefas', COUNT(*) FROM tarefas
UNION ALL
SELECT 'alertas', COUNT(*) FROM alertas;
"

# Ver CPFs gerados
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT cpf, nome_completo FROM usuarios ORDER BY criado_em;"
```

### Resetar dados

```powershell
# Deletar apenas usuários (cascata deleta relacionados)
psql -h localhost -p 5433 -U postgres -d dom -c "TRUNCATE TABLE usuarios CASCADE;"

# Resetar banco completo (cuidado!)
npm run db:reset
```

---

## 🔒 SEGURANÇA DOS DADOS

- ✅ Senhas criptografadas com **bcrypt** (10 rounds)
- ✅ Cada usuário tem **salt único**
- ✅ CPFs validados com **dígitos verificadores corretos**
- ✅ Tokens seguros
- ✅ Conformidade com **LGPD**

---

## 📞 PRECISA DE AJUDA?

Se nada funcionar, execute este comando para diagnóstico:

```powershell
Write-Host "=== DIAGNÓSTICO ===" -ForegroundColor Cyan
Write-Host "DATABASE_URL: $env:DATABASE_URL"
Write-Host ""
npm list tsx bcryptjs
Write-Host ""
psql -h localhost -p 5433 -U postgres -d dom -c "\dt" 2>&1 | Select-String "usuarios"
```

---

**Última atualização:** 02/10/2025  
**Versão:** DOM v1.0.0  
**Banco:** PostgreSQL 18 - Porta 5433

