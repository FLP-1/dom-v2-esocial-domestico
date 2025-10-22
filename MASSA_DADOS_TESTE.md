# 🌱 MASSA DE DADOS DE TESTE - Sistema DOM v1.0.0

## ✅ SEED CRIADO COM SUCESSO!

### 📋 O QUE FOI CRIADO

#### 1. ✅ **Função de Geração de CPF Válido**
- Implementada função que gera CPFs com **dígitos verificadores corretos**
- Todos os CPFs criados passam na validação oficial do CPF

#### 2. 👥 **Usuários de Teste**

##### Usuário Principal - Empregador
- **CPF:** `59876913700` ✅ **(VÁLIDO)**
- **Nome:** Francisco Jose Lattari Papaleo
- **Email:** francisco@flpbusiness.com
- **Senha:** senha123
- **Perfil:** Empregador
- **Telefone:** 11999999999

##### Usuário Empregado
- **CPF:** `38645446880` ✅ **(VÁLIDO)**
- **Nome:** Maria da Silva Santos
- **Email:** maria.santos@email.com
- **Senha:** senha123
- **Perfil:** Empregado
- **Telefone:** 11988888888

##### 6 Usuários Extras (CPFs gerados automaticamente)
- João Silva
- Ana Santos
- Pedro Oliveira
- Julia Costa
- Carlos Souza
- Fernanda Lima

**Total: 8 usuários** (Todos com CPFs VÁLIDOS)

#### 3. 👔 **Perfis do Sistema**
- ✅ **ADMIN** - Administrador (acesso total)
- ✅ **EMPREGADOR** - Empregador (gestão completa)
- ✅ **EMPREGADO** - Empregado (acesso limitado)
- ✅ **FAMILIA** - Familiar (recursos domésticos)

#### 4. ⚙️ **Funcionalidades (11 total)**
- Dashboard
- Controle de Ponto
- Gestão de Tarefas
- Gestão de Documentos
- Comunicação
- Gestão de Compras
- Gestão de Alertas
- Cálculos Salariais
- Empréstimos
- eSocial Doméstico
- Monitoramento

#### 5. 🔐 **Permissões Configuradas**
- Cada perfil com permissões específicas por funcionalidade
- Permissões de Leitura, Escrita, Exclusão e Admin

#### 6. 👥 **Grupos**
- **Família Papaleo** (Grupo familiar)
  - Francisco (Admin)
  - João (Moderador)
  - Ana e Pedro (Membros)

#### 7. 📱 **Dispositivos (5 unidades)**
- iPhone 14
- Samsung Galaxy S23
- Xiaomi 13
- Diversos dispositivos móveis com geolocalização

#### 8. 📄 **Documentos (15 unidades)**
- RG
- CPF
- CNH
- Comprovante de Residência
- CTPS

#### 9. ✅ **Tarefas (20 unidades)**
- Prioridades: BAIXA, MEDIA, ALTA, URGENTE
- Status: PENDENTE, EM_ANDAMENTO, CONCLUIDA
- Distribuídas entre os usuários

#### 10. 💳 **Planos de Assinatura (3 planos)**

##### Plano Gratuito
- **Preço:** R$ 0,00
- **Recursos:** 1 usuário, 5 documentos, Suporte básico

##### Plano Básico (POPULAR)
- **Preço Mensal:** R$ 29,90
- **Preço Anual:** R$ 299,00 (17% desconto)
- **Recursos:** Até 5 usuários, Documentos ilimitados, Suporte prioritário

##### Plano Premium (RECOMENDADO)
- **Preço Mensal:** R$ 99,90
- **Preço Anual:** R$ 999,00 (17% desconto)
- **Recursos:** Usuários ilimitados, eSocial completo, Suporte 24/7

#### 11. 📋 **Assinaturas**
- Francisco com Plano Básico ativo

#### 12. 🛒 **Listas de Compras**

##### Lista: Compras do Mês
- Arroz (2 kg) - R$ 15,90
- Feijão (1 kg) - R$ 8,50
- Macarrão (500g) - R$ 4,90
- Leite (2L) - R$ 6,50
- Sabonete (4 un) - R$ 8,00
- Detergente (3 un) - R$ 6,90

**Total: 6 itens | 3 comprados**

#### 13. 🔔 **Alertas (5 unidades)**
- Tipos: VENCIMENTO, PAGAMENTO, TAREFA
- Prioridades: BAIXA, MEDIA, ALTA
- Com notificações por email e push

#### 14. 📜 **Termos de Uso**
- Versão v2.1.0
- Tipo: TERMOS_USO
- Ativo desde 01/01/2024

#### 15. ⚙️ **Configurações do Sistema (6)**
- SISTEMA_VERSAO: 2.2.1
- ESOCIAL_AMBIENTE: PRODUCAO
- ESOCIAL_VERSAO: S-1.3
- SESSAO_TIMEOUT: 3600000 (1 hora)
- MAX_LOGIN_TENTATIVAS: 5
- BACKUP_HABILITADO: true

---

## 🚀 COMO USAR

### 1. Executar o Seed

```powershell
# Método 1: Usando o script pronto
.\executar-seed.ps1

# Método 2: Manual
npm install --save-dev tsx
npx tsx prisma/seed.ts

# Método 3: Usando Prisma CLI
npm run db:seed
```

### 2. Fazer Login no Sistema

#### Opção 1: Empregador
```
Email: francisco@flpbusiness.com
Senha: senha123
CPF: 59876913700
```

#### Opção 2: Empregado
```
Email: maria.santos@email.com
Senha: senha123
CPF: 38645446880
```

#### Opção 3: Outros usuários
```
Emails: joao.silva@email.com, ana.santos@email.com, etc
Senha: senha123 (para todos)
CPFs: Gerados automaticamente (válidos)
```

### 3. Verificar Dados no Banco

```powershell
# Contar usuários
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT COUNT(*) FROM usuarios;"

# Listar usuários
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT cpf, nome_completo, email FROM usuarios;"

# Ver CPFs válidos
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT cpf, nome_completo FROM usuarios ORDER BY criado_em;"
```

### 4. Abrir Prisma Studio (Interface Visual)

```powershell
npm run db:studio
```

Acesse: http://localhost:5555

---

## 🔍 VALIDAÇÃO DE CPF

### Como Funciona

O seed implementa a validação oficial de CPF do Brasil:

```typescript
function gerarCPFValido(): string {
  // 1. Gera 9 primeiros dígitos aleatórios
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  
  // 2. Calcula primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += base[i] * (10 - i)
  }
  let digito1 = 11 - (soma % 11)
  digito1 = digito1 >= 10 ? 0 : digito1
  
  // 3. Calcula segundo dígito verificador
  soma = 0
  for (let i = 0; i < 9; i++) {
    soma += base[i] * (11 - i)
  }
  soma += digito1 * 2
  let digito2 = 11 - (soma % 11)
  digito2 = digito2 >= 10 ? 0 : digito2
  
  // 4. Retorna CPF completo com 11 dígitos
  return [...base, digito1, digito2].join('')
}
```

### CPFs Pré-configurados (Todos Válidos)

| Usuário | CPF | Validação |
|---------|-----|-----------|
| Francisco | 59876913700 | ✅ VÁLIDO |
| Maria | 38645446880 | ✅ VÁLIDO |
| Demais usuários | Gerados dinamicamente | ✅ VÁLIDOS |

---

## 📊 ESTATÍSTICAS ESPERADAS

Após executar o seed, você deve ter:

- ✅ **8 Usuários** (todos com CPF válido)
- ✅ **4 Perfis**
- ✅ **11 Funcionalidades**
- ✅ **1 Grupo** familiar
- ✅ **5 Dispositivos**
- ✅ **15 Documentos**
- ✅ **20 Tarefas**
- ✅ **3 Planos** de assinatura
- ✅ **1 Assinatura** ativa
- ✅ **1 Lista** de compras
- ✅ **6 Itens** de compra
- ✅ **5 Alertas**
- ✅ **6 Configurações**
- ✅ **1 Termo** de uso

---

## 🛠️ SOLUÇÃO DE PROBLEMAS

### Erro: "Prisma Client not found"
```powershell
npx prisma generate
```

### Erro: "ts-node not found"
```powershell
npm install --save-dev tsx ts-node
```

### Erro: "bcrypt not found"
```powershell
npm install bcryptjs @types/bcryptjs
```

### Limpar e recriar dados
```powershell
# Resetar banco
npm run db:reset

# Recriar tabelas
npm run db:push

# Popular novamente
npx tsx prisma/seed.ts
```

### Verificar se seed foi executado
```powershell
psql -h localhost -p 5433 -U postgres -d dom -c "SELECT COUNT(*) as total FROM usuarios;"
```

Se retornar 0, execute o seed novamente.

---

## 📝 NOTAS IMPORTANTES

1. **CPFs Válidos:** Todos os CPFs gerados têm dígitos verificadores corretos e passam na validação oficial
2. **Senha Padrão:** Todos os usuários têm senha `senha123`
3. **Dados Realistas:** Nomes, endereços e telefones são fictícios mas realistas
4. **Relacionamentos:** Todos os relacionamentos entre tabelas estão configurados
5. **LGPD:** Todos os usuários aceitaram termos e consentimento LGPD

---

## 🔐 SEGURANÇA

- As senhas são criptografadas com **bcrypt** (10 rounds)
- Cada usuário tem um **salt** único
- CPFs são armazenados **sem máscara** (apenas números)
- Tokens e hashes são gerados de forma segura

---

**Criado em:** 02/10/2025  
**Versão do Sistema:** DOM v1.0.0  
**PostgreSQL:** Versão 18 - Porta 5433

