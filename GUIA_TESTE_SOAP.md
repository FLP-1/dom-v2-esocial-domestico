# 🧼 GUIA DE TESTE - INTEGRAÇÃO SOAP eSocial Doméstico

## 📋 **RESUMO DA IMPLEMENTAÇÃO**

✅ **SERVIÇO SOAP IMPLEMENTADO:**

- Cliente SOAP para eSocial Doméstico com certificado A1
- Autenticação mútua TLS
- URLs baseadas na documentação oficial
- Integração completa com interface existente

## 🚀 **COMO TESTAR**

### **1. ACESSAR A INTERFACE:**

```
http://localhost:3000/esocial-integration
```

### **2. CONFIGURAR MODO SOAP:**

1. Na seção "Configurações do eSocial"
2. Clique no botão "Usar SOAP" (ao lado do indicador de modo)
3. O indicador deve mostrar: 🧼 SOAP eSocial Doméstico

### **3. TESTAR FUNCIONALIDADES:**

#### **A) Carregar Dados do Empregador:**

1. Clique em "🏢 Carregar Dados"
2. **Resultado esperado:**
   - Dados reais do eSocial via SOAP
   - Informações do empregador (CPF, nome, endereço)
   - Fonte: "SOAP_REAL"

#### **B) Carregar Lista de Empregados:**

1. Clique em "👥 Carregar Lista"
2. **Resultado esperado:**
   - Lista de empregados (simulada por enquanto)
   - Fonte: "SOAP_SIMULADO"

#### **C) Consultar Histórico de Eventos:**

1. Clique em "📋 Consultar Histórico"
2. **Resultado esperado:**
   - Histórico de eventos (simulado por enquanto)
   - Fonte: "SOAP_SIMULADO"

## 🔧 **CONFIGURAÇÕES TÉCNICAS**

### **URLs SOAP:**

- **Homologação**: `https://hom-esocialgovbrdomestico.saude.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl`
- **Produção**: `https://www.esocial.gov.br/empregador/ConsultaCadastroEmpregador.svc?wsdl`

### **Certificado:**

- **Arquivo**: `./certificados/eCPF A1 24940271 (senha 456587).pfx`
- **Senha**: `456587`
- **Tipo**: A1 (ICP-Brasil)

### **Ambiente:**

- **Padrão**: Homologação (seguro para testes)
- **CPF Empregador**: `59876913700`

## 📊 **INDICADORES DE SUCESSO**

### **✅ SUCESSO:**

- Botão muda para "Usar API REST"
- Indicador mostra "🧼 SOAP eSocial Doméstico"
- Dados carregados com fonte "SOAP_REAL"
- Sem erros de certificado SSL
- Console mostra logs de inicialização SOAP

### **❌ PROBLEMAS:**

- Erro de certificado SSL
- Timeout na conexão
- Dados não carregados
- Erro de autenticação

## 🔍 **LOGS IMPORTANTES**

### **Console do Navegador:**

```
✅ Cliente SOAP eSocial Doméstico inicializado para homologacao
🔍 Consultando empregador: 59876913700 no ambiente homologacao
✅ Dados do empregador obtidos com sucesso
```

### **Network Tab:**

- Requisições SOAP para o WSDL
- Autenticação TLS mútua
- Respostas XML do eSocial

## 🛠️ **SOLUÇÃO DE PROBLEMAS**

### **Erro de Certificado SSL:**

1. Verificar se o certificado existe
2. Verificar se a senha está correta
3. Verificar conectividade de rede
4. Verificar se o ambiente está correto

### **Timeout na Conexão:**

1. Verificar conectividade de rede
2. Verificar se a URL está correta
3. Verificar configurações de firewall
4. Tentar ambiente de homologação

### **Dados Não Carregados:**

1. Verificar se o CPF está correto
2. Verificar se o certificado é válido
3. Verificar se o empregador está cadastrado no eSocial
4. Verificar logs de erro no console

## 📈 **PRÓXIMOS PASSOS**

1. **✅ Concluído**: Implementação SOAP básica
2. **✅ Concluído**: Integração com interface
3. **🔄 Próximo**: Testar com dados reais
4. **🔄 Próximo**: Implementar endpoints adicionais
5. **🔄 Próximo**: Otimizar performance

## 🎯 **RESULTADO ESPERADO**

A integração SOAP deve resolver o problema de certificado SSL (`net::ERR_CERT_AUTHORITY_INVALID`) e permitir acesso real aos dados do eSocial Doméstico usando autenticação mútua TLS com certificado A1.

---

**📞 Suporte**: Em caso de problemas, verificar logs do console e network tab do navegador.
