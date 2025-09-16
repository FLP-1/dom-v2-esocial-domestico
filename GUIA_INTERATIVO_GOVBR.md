# 🎯 GUIA INTERATIVO: CONFIGURAÇÃO GOV.BR

## 📋 **STATUS ATUAL**

- ✅ **Arquivo .env.local criado** com template
- ✅ **APIs funcionando** (200 OK)
- ✅ **Páginas de teste funcionando**
- ⚠️ **Credenciais gov.br** precisam ser configuradas

---

## 🚀 **PASSO A PASSO INTERATIVO**

### **ETAPA 1: REGISTRAR APLICAÇÃO NO GOV.BR**

#### **1.1 Acessar Portal**

```
🔗 https://sso.acesso.gov.br/developer
```

#### **1.2 Criar Nova Aplicação**

- **Nome:** `DOM eSocial Integration`
- **Descrição:** `Sistema de integração com eSocial Doméstico`
- **Tipo:** `Aplicação Web`
- **Redirect URI:** `http://localhost:3000/api/esocial-real-govbr/callback`

#### **1.3 Copiar Credenciais**

- **Client ID:** `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- **Client Secret:** `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

---

### **ETAPA 2: CONFIGURAR VARIÁVEIS**

#### **2.1 Editar .env.local**

```bash
# Abrir arquivo .env.local
# Substituir valores:

GOV_BR_CLIENT_ID=seu_client_id_real_aqui
GOV_BR_CLIENT_SECRET=seu_client_secret_real_aqui
GOV_BR_REDIRECT_URI=http://localhost:3000/api/esocial-real-govbr/callback
NODE_ENV=development
```

#### **2.2 Reiniciar Servidor**

```bash
# Parar servidor (Ctrl+C)
npm run dev
```

---

### **ETAPA 3: TESTAR CONFIGURAÇÃO**

#### **3.1 Verificar Configuração**

```bash
powershell -ExecutionPolicy Bypass -File configurar-govbr.ps1
```

#### **3.2 Testar Páginas**

- **Simulação:** http://localhost:3000/test-simple
- **Teste gov.br:** http://localhost:3000/test-govbr
- **Interface principal:** http://localhost:3000/esocial-integration

---

### **ETAPA 4: TESTAR FLUXO OAUTH2**

#### **4.1 Acessar Página de Teste**

```
🔗 http://localhost:3000/test-govbr
```

#### **4.2 Configurar Teste**

- **Modo:** "Modo Real"
- **CPF/CNPJ:** `59876913700`
- **Ambiente:** `homologacao`

#### **4.3 Gerar URL de Autorização**

1. **Clicar:** "Obter URL de Autorização"
2. **Copiar:** URL gerada
3. **Abrir:** URL em nova aba

#### **4.4 Autorizar no gov.br**

1. **Fazer login** com conta gov.br
2. **Autorizar** acesso ao eSocial
3. **Copiar:** código de autorização

#### **4.5 Testar Consultas**

1. **Colar código** no campo "Token de Acesso"
2. **Testar:** "Consultar Empregador"
3. **Testar:** "Consultar Empregados"
4. **Testar:** "Consultar Eventos"

---

## 🎯 **RESULTADOS ESPERADOS**

### **Com Configuração Completa:**

- ✅ **Dados reais** do eSocial
- ✅ **Interface funcional** com gov.br
- ✅ **Consultas em tempo real**
- ✅ **Histórico de eventos real**

### **Sem Configuração:**

- ✅ **Dados simulados** funcionando
- ✅ **Interface funcional** para testes
- ✅ **Base para configuração real**

---

## 🚨 **SOLUÇÃO DE PROBLEMAS**

### **Erro: "invalid_client"**

- ✅ Verificar Client ID no .env.local
- ✅ Verificar aplicação ativa no gov.br

### **Erro: "redirect_uri_mismatch"**

- ✅ Verificar URI exata no gov.br
- ✅ Verificar protocolo (http/https)

### **Erro: "access_denied"**

- ✅ Verificar conta gov.br nível ouro/prata
- ✅ Verificar acesso ao eSocial habilitado

---

## 📊 **PÁGINAS DISPONÍVEIS**

### **1. Página Simples (Simulação)**

- **URL:** http://localhost:3000/test-simple
- **Função:** Teste básico sem gov.br
- **Status:** ✅ Funcionando

### **2. Página de Teste gov.br**

- **URL:** http://localhost:3000/test-govbr
- **Função:** Teste completo do fluxo OAuth2
- **Status:** ✅ Funcionando (precisa configurar credenciais)

### **3. Página Principal**

- **URL:** http://localhost:3000/esocial-integration
- **Função:** Interface completa com acesso real
- **Status:** ✅ Funcionando (precisa configurar credenciais)

---

## 🎉 **PRÓXIMOS PASSOS**

1. **Registrar aplicação** no gov.br
2. **Configurar credenciais** no .env.local
3. **Reiniciar servidor** (npm run dev)
4. **Testar fluxo OAuth2** completo
5. **Usar dados reais** do eSocial

**🚀 Sistema pronto para acesso real!**
