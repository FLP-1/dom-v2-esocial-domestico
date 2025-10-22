# 🔑 Login Correto - DOM v1.0.0

## ⚠️ Situação Atual

O banco de dados pode não ter usuários ainda. Vamos criar o usuário Francisco Lima para teste.

---

## 🔧 Solução: Executar Seed Completo

### 1. Resetar e Recriar Banco
```powershell
# Resetar banco (cuidado: apaga tudo!)
npx prisma db push --force-reset

# Executar seed completo
npx tsx prisma/seed.ts
```

### 2. Verificar se Usuário foi Criado
```powershell
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT cpf, \"nomeCompleto\", email FROM usuarios WHERE cpf = '59876913700';"
```

---

## 🔑 Credenciais Após Seed

### Usuário Principal (Francisco)
```
CPF: 59876913700 (sem máscara)
CPF: 598.769.137-00 (com máscara)
Nome: Francisco Jose Lattari Papaleo
Email: francisco@flpbusiness.com
Senha: senha123
```

### Outros Usuários Criados pelo Seed
O seed cria vários usuários automaticamente. Todos têm a senha `senha123`.

---

## 🧪 Como Testar

### 1. Executar Seed (se necessário)
```powershell
npx tsx prisma/seed.ts
```

### 2. Verificar no Console
Você deve ver algo como:
```
🌱 Iniciando seed do banco de dados...
📋 Criando perfis...
👤 Criando usuários...
✅ Usuários criados!
🔑 CREDENCIAIS DE ACESSO:
   📧 Email: francisco@flpbusiness.com
   🔒 Senha: senha123
   👤 CPF: 59876913700
```

### 3. Fazer Login
```
URL: http://localhost:3000/login
CPF: 598.769.137-00
Senha: senha123
```

### 4. Verificar WelcomeSection
Deve mostrar: **"Bem-vindo, Francisco Jose Lattari Papaleo!"**

---

## 📊 Dados do Seed

O seed cria:

### Usuários
- Francisco Jose Lattari Papaleo (CPF: 59876913700)
- Maria Silva (CPF: 38645446880) 
- Admin (CPF gerado automaticamente)
- E outros...

### Perfis
- Empregado
- Empregador  
- Família
- Admin

### Dados Relacionados
- Grupos
- Funcionalidades
- Dispositivos
- Documentos
- Tarefas
- Alertas
- Empregadores
- Certificados Digitais

---

## 🔍 Verificar se Funcionou

### Comando para Listar Usuários
```powershell
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT cpf, \"nomeCompleto\", email FROM usuarios LIMIT 5;"
```

### Resultado Esperado
```
     cpf      |         nomeCompleto         |           email            
--------------|------------------------------|---------------------------
 59876913700  | Francisco Jose Lattari Papaleo | francisco@flpbusiness.com
 38645446880  | Maria Silva                  | maria@email.com
 ...          | ...                          | ...
```

---

## ⚠️ Se Ainda Não Funcionar

### Opção 1: Verificar Conexão
```powershell
# Testar conexão com banco
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT version();"
```

### Opção 2: Verificar Tabelas
```powershell
# Listar tabelas
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "\dt"
```

### Opção 3: Executar Seed Manual
Se o seed automático não funcionar, posso criar um script manual para inserir apenas o Francisco.

---

## 📝 Próximos Passos

1. ✅ Executar seed completo
2. ✅ Verificar se usuários foram criados
3. ✅ Testar login com CPF 598.769.137-00
4. ✅ Confirmar que WelcomeSection mostra dados reais

---

**Status**: 🔄 **Em Andamento**  
**Próximo**: Executar seed e testar login

Execute o comando `npx tsx prisma/seed.ts` e depois teste o login! 🚀
