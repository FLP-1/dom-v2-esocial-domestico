# 📢 Exemplo de Uso do NotificationService

## **🚀 Sistema Implementado**

Implementei um **NotificationService centralizado** baseado nas suas sugestões. Agora você tem:

### **✅ Funcionalidades Implementadas:**

1. **📧 Email via Twilio SendGrid/Nodemailer**
2. **📱 SMS via Twilio** (sua conta: `TWILIO_ACCOUNT_SID_AQUI`)
3. **🎯 Sistema de preferências por usuário**
4. **🔄 Fallback automático entre provedores**
5. **📊 Logs e métricas detalhados**

## **🧪 Como Testar**

### **1. API de Teste:**

```bash
# Testar notificação de email
curl -X POST http://localhost:3000/api/test-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "seu-email@gmail.com",
    "type": "email_validation"
  }'

# Testar notificação de SMS
curl -X POST http://localhost:3000/api/test-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "phone": "+5511999999999",
    "type": "phone_validation"
  }'

# Testar alerta do sistema (email + SMS)
curl -X POST http://localhost:3000/api/test-notifications \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "email": "seu-email@gmail.com",
    "phone": "+5511999999999",
    "type": "system_alert",
    "message": "Alerta crítico do sistema!"
  }'
```

### **2. Uso no Código:**

```typescript
import {
  notificationService,
  NotificationService,
} from '../lib/NotificationService';

// Exemplo 1: Validação de email
const user = {
  id: 'user123',
  email: 'usuario@exemplo.com',
  phone: '+5511999999999',
};

const codigo = 'ABC123';
const notification = NotificationService.createEmailValidation(user, codigo);
const results = await notificationService.notify(user, notification);

// Exemplo 2: Alerta crítico
const alertNotification = NotificationService.createSystemAlert(
  user,
  'Seu documento está pronto para download'
);
const results = await notificationService.notify(user, alertNotification);

// Exemplo 3: Notificação personalizada
const customNotification = {
  userId: user.id,
  type: 'document_ready' as const,
  title: 'Documento Pronto',
  message: 'Seu holerite está disponível para download',
  urgency: 'normal' as const,
  channels: ['email', 'sms'] as const,
};
const results = await notificationService.notify(user, customNotification);
```

## **🎯 Tipos de Notificação Disponíveis**

```typescript
// Tipos implementados
type NotificationType =
  | 'email_validation' // Validação de email
  | 'phone_validation' // Validação de telefone
  | 'user_registration' // Cadastro de usuário
  | 'password_reset' // Reset de senha
  | 'system_alert' // Alerta do sistema
  | 'payment_reminder' // Lembrete de pagamento
  | 'document_ready'; // Documento pronto
```

## **📊 Configuração de Canais por Tipo**

```typescript
// Configuração padrão (pode ser personalizada por usuário)
const defaultChannels = {
  email_validation: ['email'], // Só email
  phone_validation: ['sms'], // Só SMS
  user_registration: ['email'], // Só email
  password_reset: ['email', 'sms'], // Email + SMS
  system_alert: ['email', 'sms'], // Email + SMS
  payment_reminder: ['email'], // Só email
  document_ready: ['email'], // Só email
};
```

## **🔧 Configuração Necessária**

### **Arquivo .env.local:**

```env
# SMS - Twilio (sua conta)
TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID_AQUI
TWILIO_AUTH_TOKEN=seu-auth-token-aqui
TWILIO_PHONE_NUMBER=+5511999999999

# Email - SendGrid (recomendado)
SENDGRID_API_KEY=SG.sua-api-key-aqui
SENDGRID_FROM_EMAIL=noreply@seudominio.com

# Email - Gmail (alternativa)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
```

## **📈 Próximos Passos**

### **Fase 1: Configurar Twilio (Agora)**

1. ✅ Adicionar TWILIO_AUTH_TOKEN no .env.local
2. ✅ Comprar número de telefone no Twilio
3. ✅ Configurar SendGrid API Key
4. ✅ Testar com a API de teste

### **Fase 2: Integrar no Sistema (Depois)**

1. ⏳ Substituir chamadas diretas por NotificationService
2. ⏳ Implementar preferências do usuário no banco
3. ⏳ Adicionar sistema de filas (BullMQ/Redis)
4. ⏳ Implementar dashboard de métricas

### **Fase 3: Push Notifications (Opcional)**

1. ⏳ Configurar Firebase se necessário
2. ⏳ Implementar notificações push mobile
3. ⏳ Implementar notificações web push

## **🎉 Vantagens do Sistema Atual**

✅ **Centralizado**: Um lugar para todas as notificações
✅ **Flexível**: Fácil adicionar novos canais/tipos
✅ **Resiliente**: Fallback automático entre provedores
✅ **Configurável**: Preferências por usuário
✅ **Monitorável**: Logs detalhados de tudo
✅ **Escalável**: Pronto para filas e workers

**🚀 Agora é só configurar suas credenciais do Twilio e começar a usar!**
