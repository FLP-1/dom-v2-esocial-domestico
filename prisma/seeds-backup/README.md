# ⚠️ Seeds Deprecados (Backup)

Este diretório contém seeds antigos mantidos apenas para **referência histórica**.

## 🚫 NÃO USE ESSES ARQUIVOS

Estes seeds estão **desatualizados** e podem causar:
- Inconsistências de dados
- CPFs inválidos
- Falta de relacionamentos
- Bugs inesperados

## 📂 Arquivos

### `seed-original-deprecated.ts`
- **Origem:** Seed original do projeto (1.796 linhas)
- **Problema:** Gera CPFs aleatórios sem validação adequada
- **Status:** Deprecated em 2025-10-08

### `seed-massa-testes-deprecated.ts`
- **Origem:** Tentativa intermediária de massa de testes
- **Problema:** Estrutura incompleta, substituída por seed-completo
- **Status:** Deprecated em 2025-10-08

## ✅ Use Ao Invés

Consulte `../README-SEEDS.md` para seeds atuais e funcionais:
- **seed-completo.ts** - População completa do banco
- **seed-novo-empregado.ts** - Seed incremental

## 🗑️ Quando Deletar

Esses arquivos podem ser deletados com segurança após:
1. Confirmação que seed-completo.ts funciona em produção
2. 30 dias sem necessidade de reverter
3. Aprovação do time

---

**Data de Backup:** 2025-10-08  
**Razão:** Consolidação e organização de seeds

