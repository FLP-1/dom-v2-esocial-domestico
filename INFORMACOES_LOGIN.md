# 🔑 Informações de Login - DOM v1.0.0

## ✅ Problema Resolvido

A API agora aceita CPF **COM** ou **SEM** máscara!

---

## 🔧 Correção Implementada

### API `/api/auth/profiles` Atualizada
```typescript
// Remove máscara do CPF automaticamente
const cpfLimpo = cpf.replace(/[.\-\s]/g, '')

// Aceita qualquer formato:
// "598.769.137-00" → "59876913700"
// "59876913700" → "59876913700"
// "598 769 137 00" → "59876913700"
```

---

## 🔑 Credenciais de Acesso

### CPF do Empregador Principal
```
CPF: 59876913700 (sem máscara)
CPF: 598.769.137-00 (com máscara)
Senha: senha123
```

### Outros CPFs Disponíveis
Após executar o seed, você terá vários usuários. Use qualquer um dos CPFs gerados com a senha `senha123`.

---

## 🧪 Como Testar

### 1. Iniciar Servidor
```powershell
npm run dev
```

### 2. Acessar Login
```
http://localhost:3000/login
```

### 3. Fazer Login
```
CPF: 598.769.137-00 (ou 59876913700)
Senha: senha123
```

### 4. Verificar Dados Reais
- WelcomeSection mostrará: "Bem-vindo, Francisco Lima!"
- Perfil: "Empregador"
- Dados vêm do banco PostgreSQL

---

## 📊 Dados do Usuário Principal

### Banco de Dados
```sql
SELECT 
  cpf,
  "nomeCompleto",
  email,
  telefone
FROM usuarios 
WHERE cpf = '59876913700';
```

**Resultado Esperado:**
```
cpf           | nomeCompleto        | email                    | telefone
--------------|---------------------|--------------------------|----------
59876913700   | Francisco Lima      | francisco@flpbusiness.com| 11999999999
```

### Perfis Disponíveis
```
1. Empregador (Cor: #E74C3C)
2. [Outros perfis conforme seed]
```

---

## 🔄 Fluxo de Login Atual

```
1. Usuário digita: 598.769.137-00
   ↓
2. API remove máscara: 59876913700
   ↓
3. Busca no banco: WHERE cpf = '59876913700'
   ↓
4. Retorna dados reais: Francisco Lima
   ↓
5. WelcomeSection mostra: "Bem-vindo, Francisco Lima!"
```

---

## ⚠️ Observações

### ✅ Aceita Qualquer Formato
- `598.769.137-00` ✅
- `59876913700` ✅
- `598 769 137 00` ✅

### 🔒 Senha
- **TODOS** os usuários do seed têm a senha: `senha123`
- Senhas estão hasheadas no banco com bcrypt

### 📝 Validação
- API valida se CPF tem 11 dígitos
- Verifica se usuário existe e está ativo
- Retorna erro se CPF inválido ou usuário não encontrado

---

## 🚀 Teste Rápido

```bash
# Teste direto da API
curl "http://localhost:3000/api/auth/profiles?cpf=598.769.137-00"

# Resposta esperada:
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Francisco Lima",
      "role": "Empregador",
      "avatar": "FL",
      "color": "#E74C3C",
      "cpf": "59876913700",
      ...
    }
  ]
}
```

---

## 📚 Arquivos Modificados

| Arquivo | Alteração |
|---------|-----------|
| `src/pages/api/auth/profiles.ts` | ✅ Remove máscara do CPF |
| `INFORMACOES_LOGIN.md` | ✅ Este documento |

---

**Status**: ✅ **CORRIGIDO**  
**Data**: 2025-10-02  
**Versão**: DOM v1.0.0-final

Agora o login funciona com CPF com ou sem máscara! 🎉
