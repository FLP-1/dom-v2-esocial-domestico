# 🔐 Credenciais do Sistema DOM v1.0.0

## ⚠️ **IMPORTANTE: ARQUIVO TEMPORÁRIO**
Este arquivo contém credenciais sensíveis e deve ser:
- ✅ Usado apenas para configuração local
- ❌ **NUNCA** commitado no git
- 🗑️ **DELETADO** após uso

## 📧 **CONFIGURAÇÕES DE EMAIL**

### **SendGrid (Produção)**
```env
SENDGRID_API_KEY=sua_chave_sendgrid_aqui
SENDGRID_FROM_EMAIL=seu_email@dominio.com
```

### **Twilio Email (Alternativo)**
```env
TWILIO_EMAIL_SID=seu_sid_twilio_email
TWILIO_EMAIL_TOKEN=seu_token_twilio_email
```

## 📱 **CONFIGURAÇÕES DE SMS**

### **Twilio SMS**
```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+12183668060
```

## 🔐 **CONFIGURAÇÕES DE CERTIFICADOS**

### **Certificado eCPF**
- **Arquivo:** `certificados/eCPF A1 24940271 (senha 456587).pfx`
- **Senha:** `456587`
- **Tipo:** eCPF A1

## 🌐 **CONFIGURAÇÕES DE PRODUÇÃO**

### **URLs eSocial**
```env
ESOCIAL_BASE_URL=https://webservices.producaorestrita.esocial.gov.br
ESOCIAL_WSDL_URL=https://webservices.producaorestrita.esocial.gov.br/servicos/wsdl/v1.0/EnviarLoteEventos.wsdl
```

### **Configurações de Ambiente**
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
```

## 📋 **INSTRUÇÕES DE USO**

### **1. Configurar Variáveis de Ambiente**
```bash
# Copie as credenciais para seu arquivo .env.local
cp CREDENCIAIS_SEGURAS.md .env.local
# Edite o arquivo e configure as variáveis
```

### **2. Configurar Certificados**
```bash
# Coloque o certificado na pasta certificados/
mkdir -p certificados/
# Copie o arquivo .pfx para a pasta
```

### **3. Testar Configurações**
```bash
# Teste as configurações
npm run test:config
```

## 🛡️ **SEGURANÇA**

### **Após Configuração:**
1. ✅ Configure as variáveis de ambiente
2. ✅ Teste as configurações
3. 🗑️ **DELETE este arquivo**
4. 🔒 **NUNCA** commite credenciais

### **Arquivos a Proteger:**
- `.env.local`
- `.env.production`
- `certificados/*.pfx`
- `certificados/*.p12`
- `certificados/*.key`

## 📞 **SUPORTE**

Se precisar de ajuda com as configurações:
1. Verifique se as variáveis estão corretas
2. Teste as conexões individualmente
3. Consulte a documentação do projeto

---

**⚠️ LEMBRE-SE: Este arquivo deve ser deletado após uso!**
