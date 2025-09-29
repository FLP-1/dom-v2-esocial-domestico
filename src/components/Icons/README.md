# Sistema de Ícones Centralizado

## 📋 Visão Geral

Sistema centralizado de ícones reutilizáveis para manter consistência e facilitar manutenção.

## 🎯 Benefícios

- ✅ **Consistência**: Todos os ícones seguem o mesmo padrão
- ✅ **Reutilização**: Um ícone, múltiplos usos
- ✅ **Manutenção**: Mudanças centralizadas
- ✅ **Acessibilidade**: Labels padronizados
- ✅ **TypeScript**: Tipagem segura

## 📚 Como Usar

### Importação

```tsx
import { Icons, Icon, useIcon } from '../components/Icons';
```

### Uso Direto

```tsx
// Usando o objeto Icons
<button>{Icons.home}</button>

// Usando o componente Icon
<Icon name="home" />

// Usando o hook
const MyComponent = () => {
  const homeIcon = useIcon('home');
  return <button>{homeIcon}</button>;
};
```

## 🗂️ Categorias de Ícones

### Navegação

- `home` - 🏠 Home
- `menu` - ☰ Menu
- `close` - ✕ Fechar
- `back` - ← Voltar

### Ações

- `check` - ✓ Check
- `x` - ✗ X
- `plus` - ➕ Adicionar
- `edit` - ✏ Editar
- `delete` - 🗑 Excluir
- `save` - 💾 Salvar
- `refresh` - 🔄 Atualizar

### Tempo

- `clock` - ⏰ Relógio
- `time` - 🕒 Tempo

### Documentos

- `document` - 📄 Documento
- `folder` - 📁 Pasta
- `print` - 🖨 Imprimir
- `download` - ⬇ Download

### Comunicação

- `message` - 💬 Mensagem
- `phone` - 📞 Telefone
- `video` - 📹 Vídeo
- `search` - 🔍 Pesquisar
- `attachment` - 📎 Anexo
- `smile` - 😊 Sorriso
- `send` - ➤ Enviar

### Usuários

- `user` - 👤 Usuário
- `profile` - 👤 Perfil
- `team` - 👥 Equipe
- `family` - 👨‍👩‍👧‍👦 Família

### Finanças

- `money` - 💰 Dinheiro
- `payment` - 💵 Pagamento
- `bank` - 🏦 Banco
- `calculator` - 🧮 Calculadora

### Status

- `success` - ✅ Sucesso
- `warning` - ⚠ Aviso
- `error` - ❌ Erro
- `alert` - ⚠️ Alerta
- `notification` - 🔔 Notificação

### Sistema

- `online` - 🟢 Online
- `offline` - 🔴 Offline
- `pending` - 🟡 Pendente
- `neutral` - ⚪ Neutro

## 🔧 Adicionando Novos Ícones

1. Adicione o ícone no objeto `Icons`
2. Use `AccessibleEmoji` com label descritivo
3. Documente na categoria apropriada
4. Teste a acessibilidade

```tsx
// Exemplo
newIcon: <AccessibleEmoji emoji='🆕' label='Novo' />,
```

## ⚠️ Regras Importantes

1. **Sempre use `AccessibleEmoji`** para acessibilidade
2. **Labels descritivos** em português
3. **Nomes em inglês** para as chaves
4. **Categorize** os ícones logicamente
5. **Teste** antes de adicionar
