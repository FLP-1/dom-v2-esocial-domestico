# 🔐 Guia de Configuração de Credenciais - DOM v2.2.0

## 📋 **CREDENCIAIS RECUPERADAS**

### **📧 Email - SendGrid**
```
API Key: [Sua chave SendGrid]
From Email: [Seu email de envio]
```

### **📱 SMS - Twilio**
```
Account SID: ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Auth Token: xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
Phone Number: +12183668060
```

### **🔐 Certificado eCPF**
```
Arquivo: certificados/eCPF A1 24940271 (senha 456587).pfx
Senha: 456587
```

## 🚀 **COMO CONFIGURAR**

### **1. Criar arquivo .env.local**
```bash
# Copie o arquivo de exemplo
cp config-local-example.env .env.local
```

### **2. Editar .env.local**
```bash
# Abra o arquivo e configure suas credenciais
nano .env.local
# ou
code .env.local
```

### **3. Configurar certificado**
```bash
# Certifique-se de que o certificado está na pasta correta
ls certificados/
# Deve mostrar: eCPF A1 24940271 (senha 456587).pfx
```

### **4. Testar configurações**
```bash
# Teste as configurações
npm run dev
```

## 🛡️ **SEGURANÇA**

### **✅ O que fazer:**
- Use variáveis de ambiente
- Mantenha credenciais em .env.local
- Teste em ambiente local primeiro

### **❌ O que NÃO fazer:**
- Nunca commite .env.local
- Nunca commite certificados
- Nunca compartilhe credenciais por email

## 📁 **ESTRUTURA DE ARQUIVOS**

```
DOM/
├── .env.local                 # Suas credenciais (NÃO commitar)
├── config-local-example.env   # Exemplo de configuração
├── certificados/              # Certificados (NÃO commitar)
│   └── eCPF A1 24940271 (senha 456587).pfx
└── CREDENCIAIS_SEGURAS.md     # Este arquivo (deletar após uso)
```

## 🔧 **CONFIGURAÇÃO RÁPIDA**

### **Para desenvolvimento:**
```bash
# 1. Copie o exemplo
cp config-local-example.env .env.local

# 2. Edite com suas credenciais
# 3. Teste o sistema
npm run dev
```

### **Para produção:**
```bash
# 1. Configure as variáveis no servidor
# 2. Faça upload do certificado
# 3. Teste as conexões
```

## 📞 **SUPORTE**

Se tiver problemas:
1. Verifique se o arquivo .env.local existe
2. Confirme se as variáveis estão corretas
3. Teste as conexões individualmente
4. Consulte a documentação do projeto

---

**⚠️ IMPORTANTE: Delete este arquivo após configurar suas credenciais!**
