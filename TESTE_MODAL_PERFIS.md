# 🧪 Teste do Modal de Seleção de Perfis

## ✅ Usuário Configurado para Teste

Atualizei o seed para criar um usuário com **múltiplos perfis** para você testar o modal.

---

## 🔑 Credenciais para Teste

### Usuário com Múltiplos Perfis
```
CPF: 59876913700 (sem máscara)
CPF: 598.769.137-00 (com máscara)
Nome: Francisco Jose Lattari Papaleo
Email: francisco@flpbusiness.com
Senha: senha123
```

### Perfis Disponíveis
O Francisco agora tem **2 perfis**:
1. **Empregador** (principal)
2. **Família** (adicional)

---

## 🧪 Como Testar o Modal

### 1. Executar Seed Atualizado
```powershell
npx tsx prisma/seed.ts
```

### 2. Fazer Login
```
URL: http://localhost:3000/login
CPF: 598.769.137-00
Senha: senha123
```

### 3. Verificar Modal
Como o Francisco tem **2 perfis**, o sistema deve:
- ✅ Mostrar o modal de seleção de perfis
- ✅ Exibir as opções:
  - 🔴 **Empregador** (perfil principal)
  - 🟣 **Família** (perfil adicional)

### 4. Testar Seleção
- Clique em qualquer um dos perfis
- Verifique se o WelcomeSection mostra o perfil selecionado
- Teste navegar entre páginas para confirmar que o perfil foi aplicado

---

## 📊 Comportamento Esperado

### Se 1 Perfil
```
Login → Redirecionamento direto para /dashboard
WelcomeSection: "Bem-vindo, Francisco!"
```

### Se 2+ Perfis (Modal)
```
Login → Modal de seleção aparece
┌─────────────────────────────────┐
│  Selecione seu Perfil           │
│                                  │
│  ● Francisco Jose Lattari Papaleo│
│    🔴 Empregador                 │
│                                  │
│  ● Francisco Jose Lattari Papaleo│
│    🟣 Família                    │
│                                  │
│  [Selecionar]                    │
└─────────────────────────────────┘
```

---

## 🔍 Verificar se Funcionou

### Comando para Verificar Perfis
```powershell
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT u.cpf, u.\"nomeCompleto\", p.nome as perfil, up.principal FROM usuarios u JOIN usuarios_perfis up ON up.\"usuarioId\" = u.id JOIN perfis p ON p.id = up.\"perfilId\" WHERE u.cpf = '59876913700' ORDER BY up.principal DESC;"
```

### Resultado Esperado
```
     cpf      |         nomeCompleto         |  perfil   | principal
--------------|------------------------------|-----------|----------
 59876913700  | Francisco Jose Lattari Papaleo | Empregador | t
 59876913700  | Francisco Jose Lattari Papaleo | Família    | f
```

---

## 🎯 Teste Completo

### Cenário 1: Perfil Empregador
1. Faça login com CPF 598.769.137-00
2. Selecione "Empregador" no modal
3. Verifique se o WelcomeSection mostra:
   ```
   Bem-vindo(a), Francisco Jose Lattari Papaleo!
   Empregador • [data]
   ```

### Cenário 2: Perfil Família
1. Faça logout e login novamente
2. Selecione "Família" no modal
3. Verifique se o WelcomeSection mostra:
   ```
   Bem-vindo(a), Francisco Jose Lattari Papaleo!
   Família • [data]
   ```

---

## 🔧 Se o Modal Não Aparecer

### Possíveis Causas
1. **Seed não executado**: Execute `npx tsx prisma/seed.ts`
2. **Apenas 1 perfil**: Verifique se o usuário tem 2 perfis
3. **Cache do navegador**: Limpe o cache ou use modo incógnito

### Debug
```powershell
# Verificar quantos perfis o usuário tem
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT COUNT(*) as total_perfis FROM usuarios_perfis up JOIN usuarios u ON u.id = up.\"usuarioId\" WHERE u.cpf = '59876913700';"
```

---

## 📝 Resultado Esperado

### ✅ Modal Funcionando
- Aparece modal com 2 opções de perfil
- Permite selecionar entre Empregador e Família
- WelcomeSection atualiza conforme seleção
- Navegação funciona com perfil selecionado

### ❌ Modal Não Funcionando
- Redireciona direto para dashboard
- WelcomeSection mostra perfil padrão
- Não permite escolha de perfil

---

**Execute o seed e teste o login!** 🚀  
O modal deve aparecer porque o Francisco agora tem 2 perfis!
