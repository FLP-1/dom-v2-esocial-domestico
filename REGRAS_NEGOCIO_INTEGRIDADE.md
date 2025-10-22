# REGRAS DE NEGÓCIO - INTEGRIDADE DE DADOS

## 📋 REGRAS IMPLEMENTADAS

### 1. CPF ÚNICO NO SISTEMA
- **Regra**: Não pode haver 2 ou mais usuários com o mesmo CPF
- **Implementação**: 
  - Constraint `@unique` no campo `cpf` da tabela `usuarios`
  - Validação no `ValidationService.validateUniqueCPF()`
  - Validação em tempo real no frontend via `useValidation`

### 2. APENAS 1 EMPREGADOR POR GRUPO
- **Regra**: Não pode haver mais de um empregador por grupo
- **Implementação**:
  - Validação no `ValidationService.validateSingleEmployerPerGroup()`
  - Verifica se o usuário tem perfil 'EMPREGADOR' antes de aplicar a regra
  - Impede criação/atualização se já existir empregador no grupo

### 3. CPF ÚNICO DENTRO DO GRUPO
- **Regra**: Não pode haver, no grupo, 2 ou mais CPFs iguais
- **Implementação**:
  - Validação no `ValidationService.validateUniqueCPFInGroup()`
  - Verifica se o CPF já existe em vínculos ativos do grupo
  - Aplica para todos os perfis, não apenas empregadores

### 4. USUÁRIO + PERFIL + GRUPO = ÚNICO
- **Regra**: A combinação deve ser única para evitar duplicações
- **Implementação**:
  - Constraint `@@unique([usuarioId, grupoId])` na tabela `usuarios_grupos`
  - Constraint `@@unique([usuarioId, perfilId])` na tabela `usuarios_perfis`
  - Validação completa no `ValidationService.validateUserGroupAssignment()`

## 🔧 COMPONENTES IMPLEMENTADOS

### 1. ValidationService (`src/services/validationService.ts`)
Serviço centralizado com todas as validações:
- `validateUniqueCPF()` - CPF único no sistema
- `validateSingleEmployerPerGroup()` - 1 empregador por grupo
- `validateUniqueCPFInGroup()` - CPF único no grupo
- `validateUserGroupAssignment()` - Validação completa
- `validateUserCreation()` - Validação para criação
- `validateUserUpdate()` - Validação para atualização
- `validateUserGroupRemoval()` - Validação para remoção

### 2. API de Validação (`src/pages/api/validation/validate-user.ts`)
Endpoint para validações do frontend:
- `POST /api/validation/validate-user`
- Suporta diferentes tipos de validação
- Retorna resultado estruturado

### 3. Hook useValidation (`src/hooks/useValidation.ts`)
Hook React para validações em tempo real:
- Integra com a API de validação
- Validações assíncronas
- Estado de loading

### 4. Formulário UserManagementForm (`src/components/UserManagementForm/index.tsx`)
Componente com validações em tempo real:
- Validação de CPF em tempo real
- Validação de email em tempo real
- Feedback visual de erros
- Impede submissão com erros

### 5. API de Gerenciamento (`src/pages/api/users/manage.ts`)
Endpoint para operações CRUD com validações:
- `create-user` - Criar usuário com validações
- `update-user` - Atualizar usuário com validações
- `add-user-to-group` - Adicionar usuário ao grupo
- `remove-user-from-group` - Remover usuário do grupo

## 🛠️ SCRIPTS DE MANUTENÇÃO

### 1. Análise de Integridade (`scripts/analyze-data-integrity.js`)
Script para verificar o estado atual dos dados:
```bash
node scripts/analyze-data-integrity.js
```

### 2. Migração de Integridade (`scripts/migrate-data-integrity.js`)
Script para corrigir dados inconsistentes:
```bash
node scripts/migrate-data-integrity.js
```

## 📊 VALIDAÇÕES APLICADAS

### Frontend (Tempo Real)
- ✅ CPF único no sistema
- ✅ Email único no sistema
- ✅ Regras de grupo (empregador único, CPF único)
- ✅ Feedback visual imediato
- ✅ Impede submissão com erros

### Backend (APIs)
- ✅ Todas as validações do frontend
- ✅ Validação de permissões
- ✅ Validação de dados obrigatórios
- ✅ Rollback em caso de erro

### Banco de Dados (Constraints)
- ✅ CPF único (`@unique`)
- ✅ Email único (`@unique`)
- ✅ Usuário-Grupo único (`@@unique([usuarioId, grupoId])`)
- ✅ Usuário-Perfil único (`@@unique([usuarioId, perfilId])`)

## 🚨 CENÁRIOS BLOQUEADOS

### 1. Tentativa de CPF Duplicado
```typescript
// ❌ BLOQUEADO: CPF já existe
await ValidationService.validateUniqueCPF('12345678901');
// Retorna: { isValid: false, errors: ['CPF 12345678901 já está cadastrado...'] }
```

### 2. Tentativa de Múltiplos Empregadores
```typescript
// ❌ BLOQUEADO: Grupo já tem empregador
await ValidationService.validateSingleEmployerPerGroup('grupo-id');
// Retorna: { isValid: false, errors: ['O grupo já possui um empregador...'] }
```

### 3. Tentativa de CPF Duplicado no Grupo
```typescript
// ❌ BLOQUEADO: CPF já existe no grupo
await ValidationService.validateUniqueCPFInGroup('12345678901', 'grupo-id');
// Retorna: { isValid: false, errors: ['CPF 12345678901 já está cadastrado neste grupo...'] }
```

## ✅ CENÁRIOS PERMITIDOS

### 1. Usuário com Múltiplos Grupos
```typescript
// ✅ PERMITIDO: Mesmo usuário em grupos diferentes
const user1 = { cpf: '12345678901', grupoId: 'grupo-a' };
const user2 = { cpf: '12345678901', grupoId: 'grupo-b' }; // Grupo diferente
```

### 2. Usuário com Múltiplos Perfis
```typescript
// ✅ PERMITIDO: Mesmo usuário com perfis diferentes
const user1 = { usuarioId: 'user-1', perfilId: 'empregador' };
const user2 = { usuarioId: 'user-1', perfilId: 'funcionario' }; // Perfil diferente
```

### 3. Empregador em Grupo Diferente
```typescript
// ✅ PERMITIDO: Empregador em grupos diferentes
const empregador1 = { perfil: 'EMPREGADOR', grupoId: 'grupo-a' };
const empregador2 = { perfil: 'EMPREGADOR', grupoId: 'grupo-b' }; // Grupo diferente
```

## 🔍 MONITORAMENTO

### Logs de Validação
Todas as validações são logadas para auditoria:
```typescript
console.log('🔍 Validação CPF:', { cpf, result: validation.isValid });
console.log('🔍 Validação Grupo:', { grupoId, result: validation.isValid });
```

### Métricas de Integridade
Script de análise fornece relatório completo:
- Total de usuários
- Total de grupos
- Vínculos ativos
- Inconsistências encontradas

## 🚀 COMO USAR

### 1. Validar no Frontend
```typescript
import { useValidation } from '../hooks/useValidation';

const { validateUserCreation } = useValidation();

const result = await validateUserCreation(cpf, email);
if (!result.isValid) {
  console.log('Erros:', result.errors);
}
```

### 2. Validar no Backend
```typescript
import ValidationService from '../services/validationService';

const validation = await ValidationService.validateUserGroupAssignment({
  cpf: '12345678901',
  grupoId: 'grupo-id',
  perfilId: 'perfil-id'
});

if (!validation.isValid) {
  throw new Error(validation.errors.join(', '));
}
```

### 3. Executar Manutenção
```bash
# Verificar integridade
node scripts/analyze-data-integrity.js

# Corrigir inconsistências
node scripts/migrate-data-integrity.js
```

## 📈 BENEFÍCIOS

1. **Integridade Garantida**: Dados sempre consistentes
2. **Validação em Tempo Real**: UX melhorada
3. **Prevenção de Erros**: Bloqueio proativo
4. **Auditoria Completa**: Logs de todas as operações
5. **Manutenção Automática**: Scripts de correção
6. **Escalabilidade**: Validações centralizadas

---

**✅ SISTEMA IMPLEMENTADO E FUNCIONANDO**

Todas as regras de negócio foram implementadas com validações em múltiplas camadas (frontend, backend, banco de dados) garantindo a integridade dos dados conforme especificado.
