# 📧📱 Configuração de Email e SMS Reais

## 🚀 Como Configurar o Envio Real de Email e SMS

### **🎯 Estratégia Híbrida Inteligente**

O sistema agora usa uma **estratégia híbrida** que escolhe automaticamente o melhor provedor:

1. **Twilio SendGrid** (Prioridade 1) - Para produção
2. **Nodemailer + Gmail** (Prioridade 2) - Para desenvolvimento
3. **Modo Simulação** (Fallback) - Se nenhum estiver configurado

### **📊 Verificar Status dos Provedores**

Acesse: `http://localhost:3000/api/status-email`

Esta API mostra:

- ✅ Quais provedores estão configurados
- 🎯 Qual será usado por padrão
- 📝 Instruções de configuração
- 🔧 Status detalhado de cada provedor

### **1. Configuração de Email (Gmail)**

#### **Passo 1: Criar Senha de App no Gmail**

1. Acesse sua conta do Gmail
2. Vá em **Configurações** → **Segurança**
3. Ative a **Verificação em duas etapas**
4. Vá em **Senhas de app**
5. Gere uma nova senha de app para "DOM Sistema"
6. Copie a senha gerada

#### **Passo 2: Configurar Variáveis de Ambiente**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações de Email - Nodemailer (Gmail)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gerada

# Configurações de Email - Twilio SendGrid (Recomendado para Produção)
SENDGRID_API_KEY=sua-api-key-sendgrid
SENDGRID_FROM_EMAIL=noreply@dom.com.br

# Configurações de SMS (Twilio)
TWILIO_ACCOUNT_SID=seu-account-sid
TWILIO_AUTH_TOKEN=seu-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### **2. Configuração de SMS (Twilio)**

#### **Passo 1: Criar Conta no Twilio**

1. Acesse [twilio.com](https://www.twilio.com)
2. Crie uma conta gratuita
3. Verifique seu número de telefone
4. Vá em **Console** → **Account Info**
5. Copie o **Account SID** e **Auth Token**

#### **Passo 2: Comprar Número de Telefone**

1. No console do Twilio, vá em **Phone Numbers** → **Manage** → **Buy a number**
2. Escolha um número com capacidade de SMS
3. Copie o número comprado

#### **Passo 3: Configurar no .env.local**

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu-auth-token-aqui
TWILIO_PHONE_NUMBER=+1234567890
```

### **3. Alternativas de Email**

#### **SendGrid (Recomendado para Produção)**

```env
SENDGRID_API_KEY=sua-api-key
```

#### **AWS SES**

```env
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
```

#### **SMTP Personalizado**

```env
SMTP_HOST=smtp.exemplo.com
SMTP_PORT=587
SMTP_USER=usuario@exemplo.com
SMTP_PASS=senha-do-smtp
```

### **4. Alternativas de SMS**

#### **AWS SNS**

```env
AWS_ACCESS_KEY_ID=sua-access-key
AWS_SECRET_ACCESS_KEY=sua-secret-key
AWS_REGION=us-east-1
```

#### **Zenvia (Brasil)**

```env
ZENVIA_API_URL=https://api.zenvia.com
ZENVIA_API_TOKEN=seu-token
```

### **5. Testando a Configuração**

#### **Modo Desenvolvimento (Simulação)**

- Se as credenciais não estiverem configuradas, o sistema usa modo simulação
- Os emails e SMS aparecem no console do servidor
- Perfeito para desenvolvimento e testes

#### **Modo Produção (Real)**

- Com as credenciais configuradas, emails e SMS são enviados de verdade
- Logs detalhados no console
- Rastreamento de Message IDs

### **6. Estrutura dos Arquivos**

```
src/
├── lib/
│   ├── emailConfig.ts    # Configuração de email
│   └── smsConfig.ts      # Configuração de SMS
├── pages/api/
│   ├── enviar-email.ts   # API de envio de email
│   └── enviar-sms.ts     # API de envio de SMS
└── .env.local            # Variáveis de ambiente (criar manualmente)
```

### **7. Exemplo de Uso**

```typescript
// O sistema detecta automaticamente se as credenciais estão configuradas
// Se não estiverem, usa modo simulação
// Se estiverem, envia emails/SMS reais

// Email
const response = await fetch('/api/enviar-email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'usuario@exemplo.com',
    codigo: 'ABC123',
    tipo: 'email',
  }),
});

// SMS
const response = await fetch('/api/enviar-sms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    telefone: '+5511999999999',
    codigo: 'XYZ789',
  }),
});
```

### **8. Troubleshooting**

#### **Email não enviando:**

- Verifique se a senha de app está correta
- Confirme se a verificação em duas etapas está ativa
- Teste as credenciais no Gmail

#### **SMS não enviando:**

- Verifique se o número do Twilio está correto
- Confirme se o Account SID e Auth Token estão corretos
- Teste no console do Twilio

#### **Modo simulação ativo:**

- Verifique se o arquivo `.env.local` existe
- Confirme se as variáveis estão com os nomes corretos
- Reinicie o servidor após configurar

### **9. Custos**

#### **Gmail:**

- ✅ Gratuito até 500 emails/dia
- ✅ Perfeito para desenvolvimento

#### **Twilio:**

- ✅ $0.0075 por SMS nos EUA
- ✅ $0.05 por SMS no Brasil
- ✅ Crédito inicial gratuito

#### **SendGrid:**

- ✅ 100 emails/dia gratuitos
- ✅ $14.95/mês para 40.000 emails

### **10. Segurança**

- ⚠️ **NUNCA** commite o arquivo `.env.local`
- ✅ Use senhas de app, não senhas normais
- ✅ Rotacione as credenciais regularmente
- ✅ Monitore o uso das APIs
