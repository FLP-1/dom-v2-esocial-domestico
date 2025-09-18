# 🔑 Credenciais Necessárias para Twilio

## **📱 SMS (Twilio)**

### **Informações Necessárias:**

1. **TWILIO_ACCOUNT_SID**
   - 📝 **O que é:** Identificador único da sua conta Twilio
   - 🔍 **Formato:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (34 caracteres)
   - 📍 **Onde encontrar:** Console Twilio → Dashboard → Account Info

2. **TWILIO_AUTH_TOKEN**
   - 📝 **O que é:** Token de autenticação para acessar a API
   - 🔍 **Formato:** String de 32 caracteres alfanuméricos
   - 📍 **Onde encontrar:** Console Twilio → Dashboard → Account Info (clique no "olho" para revelar)

3. **TWILIO_PHONE_NUMBER**
   - 📝 **O que é:** Número de telefone comprado no Twilio para enviar SMS
   - 🔍 **Formato:** `+5511999999999` (formato internacional)
   - 📍 **Onde encontrar:** Console Twilio → Phone Numbers → Manage → Active Numbers

### **Como Obter:**

1. **Criar Conta:**
   - Acesse: https://www.twilio.com/try-twilio
   - Faça o cadastro gratuito
   - Confirme seu email e telefone

2. **Encontrar Account SID e Auth Token:**
   - Faça login no Console Twilio
   - Na página inicial (Dashboard), você verá:
     - **Account SID:** `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - **Auth Token:** Clique no ícone do "olho" para revelar

3. **Comprar Número de Telefone:**
   - No Console, vá em **Phone Numbers** → **Manage** → **Buy a number**
   - Escolha país (Brasil: +55)
   - Selecione um número com capacidade **SMS**
   - Compre o número (aproximadamente $1/mês)

## **📧 EMAIL (Twilio SendGrid)**

### **Informações Necessárias:**

1. **SENDGRID_API_KEY**
   - 📝 **O que é:** Chave de API para acessar o SendGrid
   - 🔍 **Formato:** `SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - 📍 **Onde encontrar:** SendGrid Console → Settings → API Keys

2. **SENDGRID_FROM_EMAIL** (Opcional)
   - 📝 **O que é:** Email remetente que aparecerá nos emails enviados
   - 🔍 **Formato:** `noreply@seudominio.com`
   - 📍 **Configuração:** Pode ser qualquer email válido do seu domínio

### **Como Obter:**

1. **Opção 1: Via Twilio (Recomendado)**
   - No Console Twilio, vá em **SendGrid Email API**
   - Clique em **Get Started**
   - Isso criará automaticamente uma conta SendGrid vinculada

2. **Opção 2: Diretamente no SendGrid**
   - Acesse: https://sendgrid.com
   - Crie uma conta gratuita
   - Confirme seu email

3. **Criar API Key:**
   - No Console SendGrid, vá em **Settings** → **API Keys**
   - Clique em **Create API Key**
   - Escolha **Full Access** ou **Restricted Access**
   - Dê um nome (ex: "DOM Sistema")
   - Copie a API Key (só aparece uma vez!)

4. **Configurar Domínio (Opcional mas Recomendado):**
   - Vá em **Settings** → **Sender Authentication**
   - Configure **Domain Authentication**
   - Adicione registros DNS no seu provedor

## **💰 Custos**

### **SMS (Twilio):**

- 📱 **Número de telefone:** ~$1.00/mês
- 📤 **SMS no Brasil:** ~$0.05 por SMS
- 📤 **SMS nos EUA:** ~$0.0075 por SMS
- 🎁 **Crédito inicial:** $15 gratuitos

### **Email (SendGrid):**

- 📧 **Plano gratuito:** 100 emails/dia
- 📧 **Plano Essentials:** $14.95/mês (40.000 emails)
- 📧 **Plano Pro:** $89.95/mês (100.000 emails)

## **📋 Arquivo .env.local Completo**

```env
# SMS - Twilio
TWILIO_ACCOUNT_SID=TWILIO_ACCOUNT_SID_AQUI
TWILIO_AUTH_TOKEN=seu-auth-token-de-32-caracteres
TWILIO_PHONE_NUMBER=+5511999999999

# Email - Twilio SendGrid
SENDGRID_API_KEY=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@seudominio.com

# Email - Nodemailer (Alternativa)
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app-gmail
```

## **🧪 Como Testar as Credenciais**

### **1. Testar SMS:**

```bash
curl -X POST "https://api.twilio.com/2010-04-01/Accounts/SEU_ACCOUNT_SID/Messages.json" \
  -d "From=+5511999999999" \
  -d "To=+5511888888888" \
  -d "Body=Teste SMS" \
  -u SEU_ACCOUNT_SID:SEU_AUTH_TOKEN
```

### **2. Testar Email:**

```bash
curl --request POST \
  --url https://api.sendgrid.com/v3/mail/send \
  --header "Authorization: Bearer SUA_API_KEY" \
  --header "Content-Type: application/json" \
  --data '{
    "personalizations": [{"to": [{"email": "teste@exemplo.com"}]}],
    "from": {"email": "noreply@seudominio.com"},
    "subject": "Teste",
    "content": [{"type": "text/plain", "value": "Teste de email"}]
  }'
```

### **3. Usar API de Status do Sistema:**

```
GET http://localhost:3000/api/status-email
```

## **⚠️ Segurança**

1. **NUNCA** commite credenciais no código
2. Use sempre o arquivo `.env.local`
3. Rotacione as credenciais periodicamente
4. Use **Restricted API Keys** quando possível
5. Configure **IP whitelisting** se disponível
6. Monitore o uso para detectar abusos

## **🔧 Troubleshooting**

### **SMS não funciona:**

- ✅ Verificar se o número foi comprado
- ✅ Confirmar se tem créditos na conta
- ✅ Verificar se o número de destino está no formato correto
- ✅ Testar com número verificado primeiro

### **Email não funciona:**

- ✅ Verificar se a API Key está correta
- ✅ Confirmar se o domínio está autenticado
- ✅ Verificar se não está em sandbox mode
- ✅ Testar com email verificado primeiro

### **Erro de autenticação:**

- ✅ Verificar se Account SID e Auth Token estão corretos
- ✅ Confirmar se a API Key tem as permissões necessárias
- ✅ Verificar se não há espaços extras nas credenciais
