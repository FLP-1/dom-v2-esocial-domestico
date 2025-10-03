# 👥 Usuários com Múltiplos Perfis

## ✅ Usuário Configurado para Teste do Modal

Baseado na configuração do seed atualizado, aqui estão os usuários com múltiplos perfis:

---

## 🔑 Francisco Jose Lattari Papaleo

### Credenciais:
```
CPF: 59876913700 (sem máscara)
CPF: 598.769.137-00 (com máscara)
Nome: Francisco Jose Lattari Papaleo
Email: francisco@flpbusiness.com
Senha: senha123
```

### Perfis (2):
1. **🔴 Empregador** (principal)
2. **🟣 Família** (adicional)

### Para Testar o Modal:
1. Execute: `npx tsx prisma/seed.ts`
2. Faça login com CPF `598.769.137-00`
3. O modal deve aparecer com as 2 opções de perfil

---

## 📊 Como Verificar

### Comando para Confirmar:
```powershell
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT u.cpf, u.\"nomeCompleto\", p.nome as perfil FROM usuarios u JOIN usuarios_perfis up ON up.\"usuarioId\" = u.id JOIN perfis p ON p.id = up.\"perfilId\" WHERE u.cpf = '59876913700' ORDER BY up.principal DESC;"
```

### Resultado Esperado:
```
     cpf      |         nomeCompleto         |  perfil
--------------|------------------------------|----------
 59876913700  | Francisco Jose Lattari Papaleo | Empregador
 59876913700  | Francisco Jose Lattari Papaleo | Família
```

---

## 🧪 Teste do Modal

### Cenário 1: Login com CPF 598.769.137-00
```
1. Acesse: http://localhost:3000/login
2. Digite CPF: 598.769.137-00
3. Digite senha: senha123
4. Clique em "Entrar"
5. Modal deve aparecer com 2 opções:
   - Empregador
   - Família
```

### Cenário 2: Seleção de Perfil
```
1. No modal, clique em "Empregador"
2. WelcomeSection deve mostrar: "Empregador • [data]"
3. Faça logout e login novamente
4. Selecione "Família"
5. WelcomeSection deve mostrar: "Família • [data]"
```

---

## 🔧 Se o Modal Não Aparecer

### Possíveis Causas:
1. **Seed não executado**: Execute `npx tsx prisma/seed.ts`
2. **Apenas 1 perfil**: Verifique se o usuário tem 2 perfis
3. **Cache**: Limpe cache do navegador

### Debug:
```powershell
# Verificar quantos perfis o Francisco tem
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT COUNT(*) as total FROM usuarios_perfis up JOIN usuarios u ON u.id = up.\"usuarioId\" WHERE u.cpf = '59876913700';"
```

**Resultado esperado**: `total = 2`

---

## 📝 Outros Usuários

### Usuários com 1 Perfil (Sem Modal):
- **Maria Silva** (CPF: 38645446880) - Perfil: Empregado
- **Usuários gerados automaticamente** - 1 perfil cada

### Usuários com Múltiplos Perfis:
- **Francisco Jose Lattari Papaleo** (CPF: 59876913700) - 2 perfis

---

## 🎯 Resumo para Teste

```
✅ Execute: npx tsx prisma/seed.ts
✅ Login: CPF 598.769.137-00, senha senha123
✅ Modal deve aparecer com 2 opções de perfil
✅ Teste seleção de ambos os perfis
```

---

**Status**: ✅ **Configurado**  
**Próximo**: Executar seed e testar o modal!

O Francisco é o único usuário configurado com múltiplos perfis para testar o modal de seleção.
