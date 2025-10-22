# 🔄 APIs de Dados Reais - Sistema DOM v1.0.0

## ✅ DADOS MOCKADOS SUBSTITUÍDOS POR DADOS REAIS

Foram criadas **6 APIs REST** que buscam dados reais do banco de dados PostgreSQL usando Prisma:

---

## 📋 APIs CRIADAS

### 1. 👤 **API de Usuários**
**Endpoint:** `GET /api/users`

**Retorna:**
- Lista de todos os usuários ativos
- Dados pessoais (nome, CPF, email, telefone)
- Perfis associados
- Cidade e UF

**Exemplo de uso:**
```typescript
const response = await fetch('/api/users');
const { success, data } = await response.json();
// data = array de usuários com seus perfis
```

---

### 2. ✅ **API de Tarefas**
**Endpoints:**
- `GET /api/tasks` - Lista todas as tarefas
- `POST /api/tasks` - Cria nova tarefa

**Retorna:**
- Tarefas completas com responsável e criador
- Comentários de cada tarefa
- Anexos
- Checklist
- Status e prioridade

**Dados incluídos:**
- Título, descrição
- Prioridade (baixa, media, alta, urgente)
- Status (pendente, em andamento, concluída)
- Responsável e criador
- Data de vencimento
- Tags
- Comentários com autor e timestamp
- Anexos

**Exemplo de uso:**
```typescript
// Buscar tarefas
const response = await fetch('/api/tasks');
const { success, data: tarefas } = await response.json();

// Criar tarefa
const novaTarefa = await fetch('/api/tasks', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: 'Nova Tarefa',
    descricao: 'Descrição',
    prioridade: 'ALTA',
    atribuidoPara: 'userId',
    dataVencimento: '2025-12-31',
    tags: ['importante'],
  }),
});
```

---

### 3. 🛒 **API de Listas de Compras**
**Endpoints:**
- `GET /api/shopping/lists` - Lista todas as listas
- `POST /api/shopping/lists` - Cria nova lista

**Retorna:**
- Listas de compras ativas
- Itens de cada lista (comprados/pendentes)
- Valor estimado e final
- Usuários com quem foi compartilhado

**Dados incluídos:**
- Nome e categoria da lista
- Itens (nome, quantidade, preço, marca, loja)
- Status de compra de cada item
- Total de itens vs itens comprados
- Valor estimado e valor final
- Compartilhamentos (usuário e permissão)

**Exemplo de uso:**
```typescript
// Buscar listas
const response = await fetch('/api/shopping/lists');
const { success, data: listas } = await response.json();

// Criar lista
const novaLista = await fetch('/api/shopping/lists', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'Supermercado',
    categoria: 'SUPERMERCADO',
    usuarioId: 'userId',
  }),
});
```

---

### 4. 🔔 **API de Alertas**
**Endpoints:**
- `GET /api/alerts` - Lista todos os alertas
- `POST /api/alerts` - Cria novo alerta

**Retorna:**
- Alertas ativos e resolvidos
- Histórico de disparos
- Configurações de notificação
- Condições e gatilhos

**Dados incluídos:**
- Título e descrição
- Tipo (vencimento, pagamento, tarefa, sistema)
- Prioridade (baixa, media, alta)
- Status (ativo, resolvido)
- Data do alerta e expiração
- Configurações de notificação (email, push, SMS)
- Recorrência e frequência
- Histórico de disparos

**Exemplo de uso:**
```typescript
// Buscar alertas
const response = await fetch('/api/alerts');
const { success, data: alertas } = await response.json();

// Criar alerta
const novoAlerta = await fetch('/api/alerts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    titulo: 'Pagamento Pendente',
    descricao: 'Fatura vencendo',
    tipo: 'PAGAMENTO',
    prioridade: 'ALTA',
    categoria: 'FINANCEIRO',
    dataAlerta: '2025-12-31',
    usuarioId: 'userId',
    notificarEmail: true,
    notificarPush: true,
  }),
});
```

---

### 5. 📄 **API de Documentos**
**Endpoints:**
- `GET /api/documents` - Lista todos os documentos
- `POST /api/documents` - Cria novo documento

**Retorna:**
- Documentos de todos os usuários
- Status de validação
- Data de vencimento
- Compartilhamentos

**Dados incluídos:**
- Nome e descrição
- Categoria (RG, CPF, CNH, etc)
- Tipo e tamanho
- Caminho do arquivo e URL pública
- Status de validação
- Data de vencimento e alerta
- Permissão (privado, compartilhado)
- Tags
- Status eSocial e backup
- Compartilhamentos

**Exemplo de uso:**
```typescript
// Buscar documentos
const response = await fetch('/api/documents');
const { success, data: documentos } = await response.json();

// Criar documento
const novoDoc = await fetch('/api/documents', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    nome: 'RG Frente',
    descricao: 'Documento de identidade',
    categoria: 'RG',
    tipo: 'PDF',
    tamanho: 1024000,
    caminhoArquivo: '/uploads/rg-frente.pdf',
    usuarioId: 'userId',
    tags: ['importante', 'identidade'],
    permissao: 'PRIVADO',
  }),
});
```

---

### 6. 💰 **API de Empréstimos**
**Endpoints:**
- `GET /api/loans` - Lista todos os empréstimos
- `POST /api/loans` - Cria novo empréstimo

**Retorna:**
- Empréstimos concedidos
- Status de pagamento
- Parcelas pagas vs total
- Dados do funcionário

**Dados incluídos:**
- Nome e CPF do funcionário
- Valor total do empréstimo
- Valor da parcela
- Total de parcelas
- Parcelas já pagas
- Data de concessão e vencimento
- Status (ativo, pago, cancelado)
- Observações

**Exemplo de uso:**
```typescript
// Buscar empréstimos
const response = await fetch('/api/loans');
const { success, data: emprestimos } = await response.json();

// Criar empréstimo
const novoEmprestimo = await fetch('/api/loans', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    usuarioId: 'userId',
    valor: 1000,
    quantidadeParcelas: 10,
    dataConcessao: '2025-10-01',
    observacao: 'Empréstimo consignado',
  }),
});
```

---

## 🔄 COMO SUBSTITUIR DADOS MOCKADOS

### Antes (Dados Mockados):
```typescript
const [tasks, setTasks] = useState([
  { id: '1', title: 'Tarefa Mockada', status: 'pending' },
  // ... mais dados fixos
]);
```

### Depois (Dados Reais):
```typescript
const [tasks, setTasks] = useState([]);

useEffect(() => {
  const loadTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const { success, data } = await response.json();
      
      if (success) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
    }
  };
  
  loadTasks();
}, []);
```

---

## 📊 ESTRUTURA DE RESPOSTA

Todas as APIs seguem o mesmo padrão de resposta:

### Sucesso:
```json
{
  "success": true,
  "data": [...]
}
```

### Erro:
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

---

## 🔐 SEGURANÇA

- ✅ Todas as consultas usam **Prisma** (protegido contra SQL Injection)
- ✅ Dados sensíveis são filtrados (senhas não são retornadas)
- ✅ Validação de tipos com TypeScript
- ✅ Tratamento de erros adequado

---

## 🚀 PRÓXIMOS PASSOS

### 1. Atualizar Componentes

Substitua os dados mockados nas páginas:

**Tarefas** (`src/pages/task-management.tsx`):
```typescript
useEffect(() => {
  fetch('/api/tasks')
    .then(res => res.json())
    .then(({ success, data }) => {
      if (success) setTasks(data);
    });
}, []);
```

**Listas de Compras** (`src/pages/shopping-management.tsx`):
```typescript
useEffect(() => {
  fetch('/api/shopping/lists')
    .then(res => res.json())
    .then(({ success, data }) => {
      if (success) setShoppingLists(data);
    });
}, []);
```

**Alertas** (`src/pages/alert-management.tsx`):
```typescript
useEffect(() => {
  fetch('/api/alerts')
    .then(res => res.json())
    .then(({ success, data }) => {
      if (success) setAlerts(data);
    });
}, []);
```

**Documentos** (`src/pages/document-management.tsx`):
```typescript
useEffect(() => {
  fetch('/api/documents')
    .then(res => res.json())
    .then(({ success, data }) => {
      if (success) setDocuments(data);
    });
}, []);
```

**Empréstimos** (`src/pages/loan-management.tsx`):
```typescript
useEffect(() => {
  fetch('/api/loans')
    .then(res => res.json())
    .then(({ success, data }) => {
      if (success) setLoans(data);
    });
}, []);
```

### 2. Testar APIs

```powershell
# Iniciar servidor
npm run dev

# Testar endpoints
# http://localhost:3000/api/users
# http://localhost:3000/api/tasks
# http://localhost:3000/api/shopping/lists
# http://localhost:3000/api/alerts
# http://localhost:3000/api/documents
# http://localhost:3000/api/loans
```

### 3. Adicionar Loading States

```typescript
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const { success, data } = await response.json();
      if (success) setTasks(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);

if (loading) return <LoadingSpinner />;
```

---

## 📝 RESUMO

✅ **6 APIs REST criadas** com Prisma  
✅ **Dados reais** do banco PostgreSQL  
✅ **Estrutura padronizada** de resposta  
✅ **Validação de tipos** com TypeScript  
✅ **Tratamento de erros** completo  
✅ **Pronto para uso** nas páginas  

---

**Data:** 02/10/2025  
**Versão:** DOM v1.0.0  
**Banco:** PostgreSQL 18 - Porta 5433  
**ORM:** Prisma v6.16.3

