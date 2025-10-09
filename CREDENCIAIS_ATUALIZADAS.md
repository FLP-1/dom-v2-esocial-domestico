# 🔐 Credenciais Atualizadas do Sistema DOM

**Data da Atualização:** 08/10/2025  
**Seed Executado:** ✅ Completo

---

## 🗄️ BANCO DE DADOS

### Configuração PostgreSQL
```
Host: localhost
Porta: 5433
Banco: dom
Usuário: userdom
Senha: FLP*2025
```

### String de Conexão
```
DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
```

---

## 👥 USUÁRIOS DE TESTE

### 1️⃣ Francisco (Administrador Principal)
```
CPF: 59876913700
Nome: Francisco Jose Lattari Papaleo
Email: francisco@email.com
Senha: senha123
Perfis: Administrador, Empregado
Status: ✅ Ativo
```

### 2️⃣ Maria (Empregada)
```
CPF: 12345678909
Nome: Maria Santos Silva
Email: maria.santos@email.com
Senha: senha123
Perfis: Empregado
Status: ✅ Ativo
```

### 3️⃣ Carlos (RH)
```
CPF: 98765432100
Nome: Carlos Oliveira Costa
Email: carlos.oliveira@email.com
Senha: senha123
Perfis: RH
Status: ✅ Ativo
```

### 4️⃣ Ana (Dependente)
```
CPF: 11144477735
Nome: Ana Paula Lattari
Email: ana.lattari@email.com
Senha: senha123
Perfis: Dependente
Status: ✅ Ativo
```

---

## 🔑 TOKENS E SECRETS

### JWT Configuration
```env
JWT_SECRET=dom_secret_key_32_chars_min_2025
JWT_EXPIRES_IN=7d
```

### NextAuth Configuration
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dom_nextauth_secret_key_2025
```

### Chave Mestra de Criptografia
```env
CERTIFICATE_MASTER_KEY=dom_master_key_certificate_encryption_2025_secure_v1
```

---

## 📊 DADOS CRIADOS NO SEED

| Tabela | Quantidade |
|--------|-----------|
| 👔 Perfis | 4 |
| 👥 Usuários | 4 |
| 🔗 Usuários-Perfis | 5 |
| 👨‍👩‍👧‍👦 Membros Família | 2 |
| 💬 Conversas | 2 |
| 👥 Participantes | 4 |
| 💬 Mensagens | 4 |
| ✅ Tarefas | 3 |
| 💰 Empréstimos | 3 |
| 📄 Documentos | 2 |
| 📊 Métricas | 4 |
| 📈 Estatísticas | 3 |
| ⚙️ Configurações | 5 |
| 📋 Termos | 1 |

**Total:** ✅ **46 registros** criados com sucesso!

---

## ✅ VALIDAÇÕES REALIZADAS

- ✅ **CPFs Válidos:** Todos os CPFs possuem dígitos verificadores corretos
- ✅ **Senhas Hash:** Todas as senhas foram criptografadas com bcrypt
- ✅ **Relacionamentos:** Todas as foreign keys estão íntegras
- ✅ **Campos Obrigatórios:** Todos os campos required foram preenchidos
- ✅ **Datas:** Timestamps criados automaticamente

---

## 🔐 CERTIFICADOS eSocial (Referência)

### Caminho do Certificado
```env
ESOCIAL_CERTIFICATE_PATH=./certificados/eCPF A1 24940271 (senha 456587).pfx
ESOCIAL_CERTIFICATE_PASSWORD=456587
```

### URLs eSocial
```env
ESOCIAL_URL_PRODUCAO=https://webservices.envio.esocial.gov.br
ESOCIAL_URL_HOMOLOGACAO=https://webservices.producaorestrita.esocial.gov.br
```

---

## 🚀 COMO TESTAR

### 1. Verificar usuários no banco
```powershell
cd E:\DOM
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U postgres -d dom -c 'SELECT cpf, \"nomeCompleto\", email FROM usuarios;'
```

### 2. Iniciar o servidor
```powershell
cd E:\DOM
npm run dev
```

### 3. Fazer login
1. Acesse: http://localhost:3000
2. Use qualquer uma das credenciais acima
3. Email: `francisco@email.com`
4. Senha: `senha123`

### 4. Abrir Prisma Studio
```powershell
cd E:\DOM
npx prisma studio
```

---

## 🔄 REFAZER O SEED

Se precisar repopular o banco:

```powershell
cd E:\DOM
$env:DATABASE_URL = "postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
npx prisma db seed
```

---

## 📋 PERFIS DISPONÍVEIS

### Administrador
- ✅ Acesso total ao sistema
- ✅ Gerenciamento de usuários
- ✅ Configurações do sistema
- **Usuário:** francisco@email.com

### Empregado
- ✅ Acesso às próprias informações
- ✅ Documentos pessoais
- ✅ Tarefas atribuídas
- **Usuários:** francisco@email.com, maria.santos@email.com

### RH
- ✅ Gestão de funcionários
- ✅ Documentos de RH
- ✅ Relatórios
- **Usuário:** carlos.oliveira@email.com

### Dependente
- ✅ Visualização de informações
- ✅ Acesso limitado
- **Usuário:** ana.lattari@email.com

---

## ⚠️ SEGURANÇA

### ⚠️ ATENÇÃO - AMBIENTE DE DESENVOLVIMENTO

Estas credenciais são apenas para **DESENVOLVIMENTO/TESTE**!

**NUNCA use em produção:**
- ❌ Senhas simples como "senha123"
- ❌ Secrets genéricos
- ❌ CPFs de teste

### 🔒 Para Produção, utilize:
- ✅ Senhas fortes e únicas
- ✅ Secrets gerados aleatoriamente (min. 32 caracteres)
- ✅ CPFs reais apenas quando necessário
- ✅ Variáveis de ambiente seguras
- ✅ Certificados válidos

---

## 📝 NOTAS IMPORTANTES

1. **Senhas Hasheadas:** Todas as senhas no banco estão criptografadas com bcrypt
2. **CPFs Válidos:** Todos os CPFs têm dígitos verificadores corretos
3. **Email Único:** Cada usuário tem um email único
4. **Perfis Múltiplos:** Francisco tem perfil de Admin + Empregado
5. **Relacionamentos:** Todos os dados estão relacionados corretamente

---

## 🆘 PROBLEMAS COMUNS

### Login não funciona
**Solução:** Verifique se o seed foi executado com sucesso
```powershell
psql -h localhost -p 5433 -U postgres -d dom -c 'SELECT COUNT(*) FROM usuarios;'
```
Deve retornar: `4`

### Erro de conexão com banco
**Solução:** Verifique se o PostgreSQL está rodando na porta 5433
```powershell
netstat -ano | findstr :5433
```

### Senha incorreta
**Solução:** A senha de todos os usuários de teste é: `senha123`

---

## ✅ STATUS FINAL

```
✅ Banco de dados: dom (conectado)
✅ Seed executado: Completo
✅ Usuários criados: 4
✅ Perfis criados: 4
✅ Relacionamentos: Íntegros
✅ CPFs validados: Todos corretos
✅ Senhas: Hasheadas (bcrypt)
✅ Tokens: Configurados
✅ Sistema: Pronto para uso!
```

---

**🎉 TUDO PRONTO PARA COMEÇAR A TESTAR!**

**Última atualização:** 08/10/2025

