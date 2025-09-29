# Diferença entre Gestão de Alertas e Notificações

## 📋 Visão Geral

No sistema DOM, **Gestão de Alertas** e **Notificações** são funcionalidades distintas que trabalham em conjunto para manter os usuários informados sobre eventos importantes.

## 🚨 Gestão de Alertas

### **O que é:**

Sistema de **configuração e gerenciamento** de alertas automáticos baseados em condições específicas.

### **Funcionalidades:**

- ✅ **Criação de alertas** personalizados
- ✅ **Configuração de condições** (ex: vencimento de documentos, tarefas pendentes)
- ✅ **Definição de frequência** (diário, semanal, mensal)
- ✅ **Tipos de alerta** (urgente, importante, informativo)
- ✅ **Ativação/desativação** de alertas
- ✅ **Histórico de disparos** de alertas
- ✅ **Gestão de regras** de negócio

### **Exemplos de Alertas:**

- 📄 Documento vencendo em 7 dias
- ⏰ Tarefa não concluída no prazo
- 💰 Pagamento próximo do vencimento
- 📊 Relatório mensal pendente
- 🔔 Backup não realizado

### **Localização:**

- **Página:** `/alert-management`
- **Sidebar:** "Gestão de Alertas" (ícone: ⚠️)

---

## 🔔 Notificações

### **O que é:**

Sistema de **comunicação instantânea** que exibe mensagens em tempo real para o usuário.

### **Funcionalidades:**

- ✅ **Exibição em tempo real** de mensagens
- ✅ **Diferentes tipos** (sucesso, erro, aviso, info)
- ✅ **Posicionamento** (top, bottom, center)
- ✅ **Auto-dismiss** configurável
- ✅ **Histórico** de notificações
- ✅ **Integração** com alertas

### **Exemplos de Notificações:**

- ✅ "Login realizado com sucesso!"
- ❌ "Erro ao salvar documento"
- ⚠️ "Alerta: Documento vencendo"
- ℹ️ "Nova mensagem recebida"
- 🔄 "Sincronização concluída"

### **Localização:**

- **Componente:** `ToastContainer` (react-toastify)
- **Aparece em:** Todas as páginas do sistema

---

## 🔄 Como Funcionam Juntos

### **Fluxo Integrado:**

1. **Alerta configurado** → Condição atendida
2. **Sistema dispara** → Alerta ativado
3. **Notificação exibida** → Usuário informado
4. **Histórico registrado** → Em ambas as funcionalidades

### **Exemplo Prático:**

```
1. Usuário cria alerta: "Documento vencendo em 7 dias"
2. Sistema monitora documentos
3. Quando condição é atendida:
   - Alerta é disparado (registrado em Gestão de Alertas)
   - Notificação aparece: "⚠️ Alerta: Documento vencendo em 7 dias"
   - Usuário vê a notificação em tempo real
```

---

## 🎯 Resumo das Diferenças

| Aspecto            | Gestão de Alertas              | Notificações                   |
| ------------------ | ------------------------------ | ------------------------------ |
| **Propósito**      | Configurar e gerenciar alertas | Exibir mensagens em tempo real |
| **Funcionalidade** | Criação, edição, ativação      | Exibição, auto-dismiss         |
| **Tempo**          | Configuração prévia            | Tempo real                     |
| **Localização**    | Página dedicada                | Todas as páginas               |
| **Ícone**          | ⚠️ (Alerta)                    | 🔔 (Notificação)               |
| **Foco**           | Gestão de regras               | Comunicação imediata           |

---

## 💡 Benefícios da Separação

### **Para o Usuário:**

- ✅ **Controle total** sobre alertas
- ✅ **Feedback imediato** via notificações
- ✅ **Histórico completo** de ambos
- ✅ **Personalização** de regras

### **Para o Sistema:**

- ✅ **Modularidade** - cada funcionalidade independente
- ✅ **Escalabilidade** - fácil adicionar novos tipos
- ✅ **Manutenibilidade** - código organizado
- ✅ **Flexibilidade** - diferentes configurações

---

## 🚀 Conclusão

**Gestão de Alertas** e **Notificações** são complementares:

- **Alertas** = "O que monitorar e quando avisar"
- **Notificações** = "Como avisar o usuário"

Juntos, proporcionam uma experiência completa de monitoramento e comunicação no sistema DOM.
