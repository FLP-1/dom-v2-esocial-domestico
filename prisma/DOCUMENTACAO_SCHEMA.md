# 📊 Documentação do Schema Prisma - Sistema DOM v2.2.1

## 🎯 Visão Geral

Esta documentação descreve a estrutura de dados completa do Sistema DOM, implementada com Prisma ORM e PostgreSQL, totalmente em conformidade com a LGPD e normas de compliance.

---

## 📋 Índice

1. [Princípios e Requisitos](#princípios-e-requisitos)
2. [Estrutura de Tabelas](#estrutura-de-tabelas)
3. [Regras de Negócio](#regras-de-negócio)
4. [Compliance e LGPD](#compliance-e-lgpd)
5. [Relacionamentos](#relacionamentos)
6. [Índices e Performance](#índices-e-performance)
7. [Segurança](#segurança)

---

## ✅ Princípios e Requisitos

### Requisitos Atendidos

✅ **1. CPF Único + Tipo de Usuário**
- Tabela `Usuario` com CPF único (`@unique`)
- Tabela `UsuarioPerfil` com constraint `@@unique([usuarioId, perfilId])` 
- Garante que 1 CPF só pode ter 1 perfil de cada tipo

✅ **2. Informações do CPF Não Repetidas**
- Dados pessoais centralizados na tabela `Usuario`
- Relacionamentos via chaves estrangeiras (normalização)
- Sem duplicação de dados pessoais

✅ **3. Dados Sem Máscaras**
- CPF: `VARCHAR(11)` - apenas números
- Telefone: `VARCHAR(11)` - apenas números  
- CEP: `VARCHAR(8)` - apenas números
- Todos os campos validados na aplicação antes da inserção

✅ **4. Usuário em Múltiplos Grupos (Sem Duplicidade)**
- Tabela `UsuarioGrupo` com constraint `@@unique([usuarioId, grupoId])`
- Um usuário pode estar em N grupos
- Impossível duplicar um usuário no mesmo grupo

✅ **5. Tipo de Usuário Determinado por Funcionalidades**
- Tabela `Perfil` (EMPREGADO, EMPREGADOR, FAMILIA, ADMIN)
- Tabela `Funcionalidade` (7+ funcionalidades principais)
- Tabela `PerfilFuncionalidade` (relacionamento N:N com permissões)

✅ **6. Tabela de Log**
- Tabela `LogAuditoria` completa
- Registra todas operações sensíveis
- Campos: ação, entidade, dados antes/depois, IP, etc.

✅ **7. Compliance e LGPD**
- Campos de consentimento LGPD
- Logs de auditoria detalhados
- Criptografia de dados sensíveis (implementar na aplicação)
- Anonimização possível
- Retenção de dados controlada

---

## 🗄️ Estrutura de Tabelas

### 1. 👤 Autenticação e Usuários

#### `usuarios`
**Propósito:** Tabela principal de usuários com dados pessoais

**Campos Principais:**
- `cpf` (VARCHAR(11), UNIQUE) - Identificador único sem máscara
- `nomeCompleto`, `apelido`, `dataNascimento`
- `email` (UNIQUE), `telefone`
- Endereço completo sem máscaras
- Autenticação: senha hash, salt, 2FA
- LGPD: `consentimentoLGPD`, `dataConsentimento`, `termosAceitos`

**Índices:**
```sql
@@index([cpf])
@@index([email])
@@index([telefone])
```

#### `perfis`
**Propósito:** Tipos de usuário no sistema

**Perfis Implementados:**
1. **EMPREGADO** - Cor: #29ABE2
2. **EMPREGADOR** - Cor: #E74C3C
3. **FAMILIA** - Cor: #9B59B6
4. **ADMIN** - Cor: #34495E

**Campos:**
- `codigo` (UNIQUE) - Código do perfil
- `nome`, `descricao`, `cor`, `icone`

#### `usuarios_perfis` (Pivot)
**Propósito:** Relacionamento N:N entre usuários e perfis

**Constraint Crítica:**
```prisma
@@unique([usuarioId, perfilId])
```
✅ Garante que um usuário não pode ter o mesmo perfil duplicado

**Campos:**
- `avatar`, `apelido` - Dados específicos do perfil
- `principal` - Perfil padrão do usuário

---

### 2. 🔐 Segurança e Anti-Fraude

#### `dispositivos`
**Propósito:** Controle de dispositivos para anti-fraude

**Campos de Segurança:**
- `dispositivoId` (UNIQUE) - ID único do dispositivo
- `modelo`, `versaoSO`, `tipo` (WEB, IOS, ANDROID)
- `nomeRedeWiFi`, `enderecoIP`
- Geolocalização: `latitude`, `longitude`, `precisao`
- `confiavel` - Dispositivo validado

**Uso:** Registro de ponto, autenticação

#### `sessoes`
**Propósito:** Gerenciamento de sessões JWT

**Campos:**
- `token` (UNIQUE), `refreshToken`
- `enderecoIP`, `userAgent`
- `expiraEm` - Controle de validade

#### `registros_ponto`
**Propósito:** Registro de ponto com anti-fraude

**Recursos Anti-Fraude:**
- `dataHora` - **SEMPRE do servidor** (não do dispositivo)
- Geolocalização obrigatória
- `dentroGeofence` - Validação de área permitida
- `enderecoIP`, `nomeRedeWiFi`
- `hashIntegridade` - Marca d'água digital
- Aprovação por supervisor

**Tipos de Registro:**
- ENTRADA
- SAIDA
- INTERVALO_INICIO
- INTERVALO_FIM

---

### 3. 🎯 Funcionalidades

#### `funcionalidades`
**Propósito:** Funcionalidades do sistema (7+ implementadas)

**Funcionalidades Principais:**
1. **dashboard** - Dashboard personalizado
2. **time-clock** - Controle de ponto
3. **task-management** - Gestão de tarefas
4. **document-management** - Gestão de documentos
5. **communication** - Sistema de comunicação
6. **shopping-management** - Gestão de compras
7. **alert-management** - Gestão de alertas
8. **payroll-management** - Cálculos salariais
9. **loan-management** - Empréstimos
10. **esocial** - Integração eSocial
11. **monitoring** - Monitoramento

#### `perfis_funcionalidades` (Pivot)
**Propósito:** Define permissões de cada perfil

**Permissões:**
- `permissaoLeitura` - Pode visualizar
- `permissaoEscrita` - Pode criar/editar
- `permissaoExclusao` - Pode excluir
- `permissaoAdmin` - Acesso administrativo

**Exemplo:**
```typescript
// Empregado tem acesso ao controle de ponto
{
  perfilId: "empregado-uuid",
  funcionalidadeId: "time-clock-uuid",
  permissaoLeitura: true,
  permissaoEscrita: true,   // Pode registrar ponto
  permissaoExclusao: false, // Não pode excluir registros
  permissaoAdmin: false
}
```

---

### 4. 👥 Grupos e Comunicação

#### `grupos`
**Propósito:** Grupos de usuários para organização

**Tipos de Grupo:**
- COMUNICACAO
- TRABALHO
- FAMILIA
- PROJETO

#### `usuarios_grupos` (Pivot)
**Propósito:** Membros de grupos

**Constraint Crítica:**
```prisma
@@unique([usuarioId, grupoId])
```
✅ Um usuário não pode estar duplicado no mesmo grupo

**Papéis:**
- ADMIN - Administrador do grupo
- MEMBRO - Membro regular
- MODERADOR - Moderador

#### `mensagens`
**Propósito:** Sistema de mensagens

**Tipos de Mensagem:**
- TEXT - Texto simples
- IMAGE - Imagem
- FILE - Arquivo
- AUDIO - Áudio

---

### 5. 📄 Dados e Documentos

#### `documentos`
**Propósito:** Gestão de documentos

**Recursos:**
- Validação de documentos
- Alertas de vencimento
- Integração eSocial
- Controle de permissões (PRIVATE, PUBLIC, SHARED)
- Tags para categorização
- Hash para integridade

#### `tarefas`
**Propósito:** Gestão de tarefas

**Campos:**
- Prioridade: HIGH, MEDIUM, LOW
- Status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED
- `checklist` (JSON) - Subitens da tarefa
- `comentarios` (JSON) - Histórico de comentários

#### `eventos_esocial`
**Propósito:** Eventos eSocial

**Tipos de Evento:**
- S-1000 - Informações do Empregador
- S-2200 - Admissão de Trabalhador
- S-2300 - Trabalhador Sem Vínculo
- S-1200 - Remuneração

**Status:**
- PENDING - Aguardando envio
- SENT - Enviado
- PROCESSED - Processado
- ERROR - Erro

---

### 6. 💰 Financeiro

#### `calculos_salariais`
**Propósito:** Cálculos de folha de pagamento

**Dados:**
- `salarioBruto`, `salarioLiquido`
- `descontos` (JSON) - Array de descontos
- `proventos` (JSON) - Array de proventos
- Cálculo de INSS e IR
- Controle de pagamento

**Constraint:**
```prisma
@@unique([cpfEmpregado, mesReferencia, anoReferencia])
```
Um cálculo único por empregado/mês/ano

#### `emprestimos`
**Propósito:** Gestão de empréstimos

**Controle:**
- Valores e parcelas
- Parcelas pagas vs. total
- Status: ATIVO, PAGO, CANCELADO

#### `listas_compras`
**Propósito:** Listas de compras

**Dados:**
- `itens` (JSON) - Array de itens
- Totais e valores estimados
- Controle de itens comprados

---

### 7. 🔔 Alertas e Notificações

#### `alertas`
**Propósito:** Sistema de alertas

**Tipos de Alerta:**
- VENCIMENTO_DOC - Vencimento de documento
- PAGAMENTO - Pagamento pendente
- TAREFA - Tarefa atrasada
- MANUTENCAO - Manutenção preventiva

**Prioridades:**
- HIGH - Alta
- MEDIUM - Média
- LOW - Baixa

**Recorrência:**
- Alertas únicos ou recorrentes
- Frequência: DIARIA, SEMANAL, MENSAL

---

### 8. 📋 Log e Auditoria (LGPD)

#### `logs_auditoria`
**Propósito:** Auditoria completa do sistema

**Campos Principais:**
- `acao` - Ação realizada (LOGIN, CREATE, UPDATE, DELETE, etc.)
- `entidade` - Entidade afetada
- `dadosAnteriores`, `dadosNovos` - Dados antes e depois (JSON)
- `enderecoIP`, `userAgent` - Dados da requisição
- `tipoLog` - Tipo: SECURITY, DATA_ACCESS, DATA_MODIFICATION, LGPD
- `nivelSeveridade` - INFO, WARNING, ERROR, CRITICAL

**Exemplo de Uso:**
```typescript
// Log de acesso a dados pessoais (LGPD)
{
  usuarioId: "admin-uuid",
  acao: "READ",
  entidade: "Usuario",
  entidadeId: "usuario-uuid",
  descricao: "Acesso aos dados pessoais do usuário",
  tipoLog: "LGPD",
  nivelSeveridade: "INFO",
  enderecoIP: "192.168.1.1"
}
```

---

## 🔗 Relacionamentos

### Diagrama de Relacionamentos Principais

```
Usuario (1) -----> (N) UsuarioPerfil (N) <----- (1) Perfil
   |                                               |
   |                                               |
   +---> (N) UsuarioGrupo (N) <----- (1) Grupo    +---> (N) PerfilFuncionalidade (N) <----- (1) Funcionalidade
   |                                               
   +---> (N) Dispositivo
   +---> (N) Sessao
   +---> (N) LogAuditoria
   +---> (N) Documento
   +---> (N) Tarefa (atribuidas)
   +---> (N) Tarefa (criadas)
   +---> (N) Mensagem
   +---> (N) RegistroPonto
   +---> (N) Emprestimo
   +---> (N) Alerta
```

### Relacionamentos N:N (Pivot Tables)

1. **Usuario ↔ Perfil** via `usuarios_perfis`
   - Constraint: Não permite duplicação de perfil para o mesmo usuário

2. **Usuario ↔ Grupo** via `usuarios_grupos`
   - Constraint: Não permite duplicação de usuário no mesmo grupo

3. **Perfil ↔ Funcionalidade** via `perfis_funcionalidades`
   - Define permissões granulares

---

## 🔒 Compliance e LGPD

### Dados Pessoais Sensíveis

**Tabela `usuarios`:**
- CPF (identificador único)
- Nome completo
- Data de nascimento
- Email e telefone
- Endereço completo

**Proteção:**
```prisma
// Campos de consentimento
consentimentoLGPD Boolean  @default(false)
dataConsentimento DateTime?
termosAceitos     Boolean  @default(false)
versaoTermos      String?
```

### Log de Auditoria (LGPD)

**Obrigatório registrar:**
- ✅ Acessos a dados pessoais
- ✅ Modificações de dados
- ✅ Exclusões
- ✅ Exportações de dados
- ✅ Consentimentos

**Exemplo:**
```typescript
// Log de consentimento LGPD
await prisma.logAuditoria.create({
  data: {
    usuarioId: usuario.id,
    acao: "CONSENT",
    entidade: "Usuario",
    descricao: "Usuário aceitou termos LGPD",
    tipoLog: "LGPD",
    nivelSeveridade: "INFO",
    dadosNovos: {
      consentimento: true,
      versaoTermos: "v2.1.0"
    }
  }
})
```

### Direitos do Titular (LGPD)

#### 1. Direito de Acesso
```typescript
// Usuário pode acessar todos seus dados
const meusDados = await prisma.usuario.findUnique({
  where: { id: usuarioId },
  include: {
    perfis: true,
    documentos: true,
    tarefas: true,
    // ... outros dados
  }
})
```

#### 2. Direito de Retificação
```typescript
// Usuário pode corrigir seus dados
// Log automático na tabela logs_auditoria
```

#### 3. Direito de Exclusão
```typescript
// Soft delete ou hard delete
// Logs mantidos por período legal
await prisma.usuario.update({
  where: { id: usuarioId },
  data: { ativo: false }
})
```

#### 4. Direito de Portabilidade
```typescript
// Exportar todos os dados do usuário
const exportacao = await prisma.usuario.findUnique({
  where: { id: usuarioId },
  include: { /* todos os relacionamentos */ }
})
```

---

## 📊 Índices e Performance

### Índices Implementados

**Tabela `usuarios`:**
```prisma
@@index([cpf])      // Busca por CPF
@@index([email])    // Busca por email
@@index([telefone]) // Busca por telefone
```

**Tabela `logs_auditoria`:**
```prisma
@@index([usuarioId])  // Logs por usuário
@@index([acao])       // Logs por ação
@@index([entidade])   // Logs por entidade
@@index([criadoEm])   // Logs por data
@@index([tipoLog])    // Logs por tipo
```

**Tabela `registros_ponto`:**
```prisma
@@index([usuarioId])  // Pontos por usuário
@@index([dataHora])   // Pontos por data
@@index([tipo])       // Pontos por tipo
```

### Otimizações Recomendadas

1. **Particionamento da tabela `logs_auditoria`**
   - Por data (mensal ou trimestral)
   - Melhora performance de consultas

2. **Cache de dados frequentes**
   - Perfis e funcionalidades
   - Configurações do sistema

3. **Paginação obrigatória**
   - Limite de resultados em queries
   - Uso de `cursor` para grandes datasets

---

## 🔐 Segurança

### Criptografia

**Na Aplicação (não no banco):**
- Senhas: bcrypt ou argon2
- Dados sensíveis: AES-256
- Tokens: JWT assinados

**Campos a criptografar:**
```typescript
// Antes de salvar no banco
usuario.senhaHash = await bcrypt.hash(senha, saltRounds)
usuario.salt = generateSalt()
```

### Validação de Dados

**Antes da inserção:**
```typescript
// CPF sem máscara
const cpfLimpo = cpf.replace(/\D/g, '')
if (cpfLimpo.length !== 11) throw new Error('CPF inválido')

// Telefone sem máscara  
const telefoneLimpo = telefone.replace(/\D/g, '')
if (telefoneLimpo.length !== 11) throw new Error('Telefone inválido')

// CEP sem máscara
const cepLimpo = cep.replace(/\D/g, '')
if (cepLimpo.length !== 8) throw new Error('CEP inválido')
```

### Rate Limiting

**Recomendado:**
- Login: 5 tentativas por minuto
- API: 100 requisições por minuto
- Registro de ponto: 1 por minuto

### Anti-Fraude (Registro de Ponto)

**Verificações Obrigatórias:**
1. ✅ Horário do servidor (nunca do dispositivo)
2. ✅ Geolocalização dentro do geofence
3. ✅ Dispositivo registrado e confiável
4. ✅ IP consistente
5. ✅ Rede Wi-Fi conhecida
6. ✅ Hash de integridade

---

## 🚀 Próximos Passos

### 1. Instalação do Prisma
```bash
npm install @prisma/client
npm install -D prisma
```

### 2. Configuração
```bash
# Criar arquivo .env
DATABASE_URL="postgresql://user:password@localhost:5432/dom_db"
```

### 3. Gerar Cliente Prisma
```bash
npx prisma generate
```

### 4. Executar Migrations
```bash
npx prisma migrate dev --name init
```

### 5. Seed do Banco
```bash
npx prisma db seed
```

---

## 📚 Referências

- [Prisma Documentation](https://www.prisma.io/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Lei Geral de Proteção de Dados (LGPD)](https://www.gov.br/lgpd)
- [Manual do eSocial](https://www.gov.br/esocial)

---

## 📝 Notas Importantes

### ⚠️ Atenção

1. **Nunca armazene senhas em texto plano**
2. **Sempre valide e sanitize dados de entrada**
3. **Use prepared statements (Prisma faz isso automaticamente)**
4. **Mantenha logs de auditoria por no mínimo 5 anos (LGPD)**
5. **Criptografe backups do banco de dados**
6. **Implemente backup automático diário**
7. **Use SSL/TLS para conexão com o banco**

### ✅ Conformidade Atingida

- ✅ LGPD - Lei Geral de Proteção de Dados
- ✅ Normalização de dados (3NF)
- ✅ Integridade referencial
- ✅ Auditoria completa
- ✅ Anti-fraude no registro de ponto
- ✅ Segurança de dados

---

**Versão:** 2.2.1  
**Data:** 2024  
**Autor:** Sistema DOM

