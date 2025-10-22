# ✅ Checklist de Validação - Sistema de Certificados Digitais

## 📋 Lista de Verificação Completa

Use este checklist para validar que tudo está funcionando corretamente.

---

## 1️⃣ Configuração do Ambiente

- [ ] ✅ Arquivo `env.local` atualizado
  - [ ] Possui `DATABASE_URL` correto (banco `dom`)
  - [ ] Possui `CERTIFICATE_MASTER_KEY` definida
  - [ ] **NÃO** possui senhas em texto claro
  - [ ] **NÃO** possui caminhos de certificados hardcoded

```powershell
# Verificar
type env.local
```

---

## 2️⃣ Banco de Dados

- [ ] ✅ Tabela `empregadores` criada
- [ ] ✅ Tabela `certificados_digitais` criada
- [ ] ✅ Tabela `certificados_historico` criada

```powershell
# Verificar tabelas
$env:PGPASSWORD='FLP*2025'
psql -h localhost -p 5433 -U userdom -d dom -c "\dt"
```

**Esperado:**
```
 Schema |           Name           | Type  |  Owner
--------+--------------------------+-------+---------
 public | empregadores             | table | userdom
 public | certificados_digitais    | table | userdom
 public | certificados_historico   | table | userdom
 ...
```

---

## 3️⃣ Dados de Teste (Seed)

- [ ] ✅ Empregador cadastrado
- [ ] ✅ Certificado cadastrado
- [ ] ✅ Senha do certificado criptografada
- [ ] ✅ Histórico de criação registrado

```powershell
# Verificar empregador
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT nome, cpfCnpj FROM empregadores;"

# Verificar certificado
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT nome, tipo, ativo FROM certificados_digitais;"

# Verificar histórico
psql -h localhost -p 5433 -U userdom -d dom -c "SELECT acao, descricao FROM certificados_historico;"
```

---

## 4️⃣ Arquivos Criados

- [ ] ✅ `prisma/schema.prisma` - Models adicionados
- [ ] ✅ `src/lib/security/certificateEncryption.ts` - Criptografia
- [ ] ✅ `src/pages/api/certificates/index.ts` - CRUD
- [ ] ✅ `src/pages/api/certificates/use.ts` - Uso com auditoria
- [ ] ✅ `prisma/seed.ts` - Seed atualizado
- [ ] ✅ `env.local` - Configuração corrigida

```powershell
# Verificar arquivos
Test-Path src\lib\security\certificateEncryption.ts
Test-Path src\pages\api\certificates\index.ts
Test-Path src\pages\api\certificates\use.ts
```

---

## 5️⃣ Segurança

- [ ] ✅ Senhas criptografadas (AES-256-GCM)
  ```sql
  -- A senha NO BANCO deve estar criptografada (hash longo)
  SELECT LENGTH(senha_hash) > 50 FROM certificados_digitais;
  -- Resultado esperado: true
  ```

- [ ] ✅ Dados mascarados na API
  ```powershell
  # Testar API (quando servidor rodar)
  curl http://localhost:3000/api/certificates
  # Verificar que senhas aparecem como "*** CRIPTOGRAFADO ***"
  ```

- [ ] ✅ Histórico de acessos funcionando
  ```sql
  SELECT COUNT(*) FROM certificados_historico WHERE acao = 'CRIACAO';
  -- Resultado esperado: >= 1
  ```

- [ ] ✅ Chave mestra NÃO commitada no Git
  ```powershell
  git status
  # env.local deve estar no .gitignore
  ```

---

## 6️⃣ Conformidade LGPD

- [ ] ✅ Campo `consentimentoLGPD` preenchido
- [ ] ✅ IP de cadastro registrado
- [ ] ✅ Todo acesso gera histórico
- [ ] ✅ Motivo de acesso obrigatório
- [ ] ✅ Dados sensíveis mascarados

```sql
-- Verificar campos LGPD
SELECT 
  consentimentoLGPD,
  dataConsentimentoLGPD,
  ipCadastro
FROM certificados_digitais;
```

---

## 7️⃣ Funcionalidades

### Upload de Certificado
- [ ] ✅ Aceita arquivo .pfx
- [ ] ✅ Criptografa senha automaticamente
- [ ] ✅ Gera hash SHA-256 do arquivo
- [ ] ✅ Registra no histórico

### Listagem
- [ ] ✅ Retorna certificados ativos
- [ ] ✅ Mascara dados sensíveis
- [ ] ✅ Mostra validade do certificado

### Uso (Descriptografia)
- [ ] ✅ Valida se certificado está ativo
- [ ] ✅ Valida se não está revogado
- [ ] ✅ Valida se não está vencido
- [ ] ✅ Exige motivo (LGPD)
- [ ] ✅ Registra no histórico
- [ ] ✅ Incrementa contador de uso

### Revogação
- [ ] ✅ Marca como revogado (não deleta)
- [ ] ✅ Registra motivo
- [ ] ✅ Registra no histórico

---

## 8️⃣ Validação de Senhas

### Senha NO BANCO (deve estar criptografada):
```sql
SELECT 
  nome,
  LEFT(senha_hash, 20) || '...' as senha_parcial,
  LENGTH(senha_hash) as tamanho_hash
FROM certificados_digitais;
```

**Esperado:**
```
 nome                          | senha_parcial              | tamanho_hash
-------------------------------|----------------------------|-------------
 Certificado eCPF A1 - FLP     | a3f7e8c2b1d4...           | 64
```

✅ Se `tamanho_hash` >= 50 → Senha está criptografada!  
❌ Se `tamanho_hash` < 20 → ⚠️ PROBLEMA: Senha pode estar em texto claro!

---

## 9️⃣ Testes Funcionais

### Teste 1: Sincronizar Banco
```powershell
npx prisma generate
npx prisma db push
```
**Esperado:** ✅ Sem erros

### Teste 2: Executar Seed
```powershell
npx tsx prisma/seed.ts
```
**Esperado:** 
```
🌱 Iniciando seed...
📋 Criando perfis...
👤 Criando usuários...
🏢 Criando empregadores...
🔐 Criando certificados digitais...
✅ Certificados digitais criados!
⚠️  IMPORTANTE: A senha do certificado está CRIPTOGRAFADA no banco!
```

### Teste 3: Consultar Dados
```powershell
psql -h localhost -p 5433 -U userdom -d dom -c "
SELECT 
  e.nome as empregador,
  c.nome as certificado,
  c.tipo,
  c.data_validade,
  c.ativo
FROM certificados_digitais c
JOIN empregadores e ON e.id = c.empregador_id;
"
```

**Esperado:**
```
     empregador        |          certificado           |   tipo    | data_validade | ativo
-----------------------|--------------------------------|-----------|---------------|-------
 FLP Business Strategy | Certificado eCPF A1 - FLP...  | E_CPF_A1  | 2025-12-31    | t
```

---

## 🔟 Documentação

- [ ] ✅ `CERTIFICADOS_DIGITAIS_LGPD.md` - Documentação técnica completa
- [ ] ✅ `RESUMO_CERTIFICADOS_LGPD.md` - Resumo executivo
- [ ] ✅ `CHECKLIST_CERTIFICADOS.md` - Este checklist
- [ ] ✅ `CORRECAO_DADOS_EMPREGADOR.md` - Histórico de correções
- [ ] ✅ `RESUMO_CORRECAO_ENV_LOCAL.md` - Correção do env.local

---

## 📊 Relatórios de Validação

### Relatório 1: Status Geral
```sql
SELECT 
  COUNT(*) as total_certificados,
  SUM(CASE WHEN ativo THEN 1 ELSE 0 END) as ativos,
  SUM(CASE WHEN revogado THEN 1 ELSE 0 END) as revogados,
  SUM(CASE WHEN data_validade > NOW() THEN 1 ELSE 0 END) as validos
FROM certificados_digitais;
```

### Relatório 2: Auditoria LGPD
```sql
SELECT 
  acao,
  COUNT(*) as total,
  COUNT(DISTINCT certificado_id) as certificados_diferentes
FROM certificados_historico
GROUP BY acao;
```

### Relatório 3: Segurança
```sql
SELECT 
  'Senhas Criptografadas' as verificacao,
  CASE 
    WHEN MIN(LENGTH(senha_hash)) > 50 THEN '✅ SIM'
    ELSE '❌ NÃO'
  END as status
FROM certificados_digitais

UNION ALL

SELECT 
  'Consentimento LGPD',
  CASE 
    WHEN COUNT(*) = SUM(CASE WHEN consentimento_lgpd THEN 1 ELSE 0 END) THEN '✅ SIM'
    ELSE '⚠️ PARCIAL'
  END
FROM certificados_digitais;
```

---

## ✅ Resultado Final Esperado

Se TODOS os itens acima estiverem marcados:

```
╔══════════════════════════════════════════════╗
║                                              ║
║  ✅ SISTEMA DE CERTIFICADOS DIGITAIS         ║
║  ✅ IMPLEMENTADO COM SUCESSO!                ║
║                                              ║
║  🛡️  Segurança: AES-256-GCM                  ║
║  ⚖️  LGPD: 100% Conforme                     ║
║  📊 Auditoria: Completa                      ║
║  🔒 Senhas: Criptografadas                   ║
║                                              ║
║  🚀 PRONTO PARA PRODUÇÃO!                    ║
║                                              ║
╚══════════════════════════════════════════════╝
```

---

## 🆘 Problemas Comuns

### ❌ Problema: Tabelas não foram criadas
**Solução:**
```powershell
npx prisma db push --force-reset
npx tsx prisma/seed.ts
```

### ❌ Problema: Senha em texto claro no banco
**Causa:** Seed antigo executado
**Solução:**
```powershell
# Limpar e recriar
npx prisma migrate reset --force
npx tsx prisma/seed.ts
```

### ❌ Problema: CERTIFICATE_MASTER_KEY não encontrada
**Solução:**
```powershell
# Adicionar ao env.local
echo 'CERTIFICATE_MASTER_KEY=dom_master_key_certificate_encryption_2025_secure_v1' >> env.local
```

### ❌ Problema: API retorna erro 500
**Causa:** Banco não sincronizado
**Solução:**
```powershell
npx prisma generate
npx prisma db push
```

---

## 📞 Suporte

Se algo não está funcionando:

1. ✅ Verifique este checklist item por item
2. ✅ Consulte `CERTIFICADOS_DIGITAIS_LGPD.md` para detalhes técnicos
3. ✅ Execute os comandos de validação acima
4. ✅ Verifique os logs de erro

---

**Data**: 2025-10-02  
**Versão**: DOM v1.0.0-final

