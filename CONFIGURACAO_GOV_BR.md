# 🔐 CONFIGURAÇÃO DO GOV.BR PARA ACESSO REAL AO ESOCIAL

## 📋 **PASSO A PASSO PARA CONFIGURAR**

### **1. REGISTRAR APLICAÇÃO NO GOV.BR**

1. **Acesse o portal do gov.br:**
   - URL: https://sso.acesso.gov.br/
   - Faça login com sua conta gov.br (nível ouro ou prata)

2. **Registre nova aplicação:**
   - Nome: "eSocial DOM - Sistema Doméstico"
   - Descrição: "Sistema para gestão de empregados domésticos com integração ao eSocial"
   - Redirect URI: `http://localhost:3000/api/esocial-real-govbr/callback`

3. **Obtenha as credenciais:**
   - Client ID
   - Client Secret

### **2. CONFIGURAR VARIÁVEIS DE AMBIENTE**

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Configurações do gov.br OAuth2
GOV_BR_CLIENT_ID=seu_client_id_aqui
GOV_BR_CLIENT_SECRET=seu_client_secret_aqui
GOV_BR_REDIRECT_URI=http://localhost:3000/api/esocial-real-govbr/callback

# Configurações do eSocial
ESOCIAL_ENVIRONMENT=homologacao
ESOCIAL_COMPANY_ID=59876913700

# Configurações de SSL (apenas para desenvolvimento)
NODE_TLS_REJECT_UNAUTHORIZED=0
```

### **3. TESTAR A CONFIGURAÇÃO**

1. **Inicie o servidor:**
   ```bash
   npm run dev
   ```

2. **Acesse a interface:**
   - URL: http://localhost:3000/esocial-integration

3. **Teste o fluxo OAuth2:**
   - Clique em "Autorizar gov.br"
   - Faça login no gov.br
   - Autorize o acesso
   - Copie o token retornado
   - Clique em "Configurar Token"
   - Cole o token

4. **Teste dados reais:**
   - Clique em "Carregar Dados" do empregador
   - Verifique se os dados são reais (fonte: ESOCIAL_REAL)

## 🔧 **ENDPOINTS DISPONÍVEIS**

### **API de Autorização:**
- `POST /api/esocial-real-govbr` - Gerar URL de autorização
- `GET /api/esocial-real-govbr/callback` - Callback OAuth2

### **API de Consulta:**
- `POST /api/esocial-real-govbr` com action:
  - `consultarEmpregador` - Dados do empregador
  - `consultarEmpregados` - Lista de empregados
  - `consultarEventos` - Histórico de eventos

## 📊 **EXEMPLO DE USO**

```typescript
// 1. Gerar URL de autorização
const authResponse = await fetch('/api/esocial-real-govbr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'getAuthUrl',
    cpfCnpj: '59876913700',
    environment: 'homologacao'
  })
});

// 2. Usar token para consultar dados
const dataResponse = await fetch('/api/esocial-real-govbr', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'consultarEmpregador',
    cpfCnpj: '59876913700',
    environment: 'homologacao',
    accessToken: 'SEU_TOKEN_AQUI'
  })
});
```

## ⚠️ **IMPORTANTE**

1. **Conta gov.br:** Deve ser nível ouro ou prata
2. **Ambiente:** Use homologação para testes
3. **Token:** Expira em 1 hora, renove quando necessário
4. **SSL:** Em produção, remova `NODE_TLS_REJECT_UNAUTHORIZED=0`

## 🎯 **PRÓXIMOS PASSOS**

1. ✅ Configurar aplicação no gov.br
2. ✅ Testar fluxo OAuth2
3. ✅ Validar dados reais
4. 🔄 Implementar renovação automática de token
5. 🔄 Adicionar cache para dados
6. 🔄 Implementar retry automático
