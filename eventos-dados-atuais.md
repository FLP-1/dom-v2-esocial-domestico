# 📋 EVENTOS eSocial QUE RETORNAM DADOS ATUAIS

## 🎯 **EVENTOS PARA DADOS TRABALHISTAS ATUAIS**

| Evento     | Nome                        | Dados Retornados                 | Quando Usar               |
| ---------- | --------------------------- | -------------------------------- | ------------------------- |
| **S-1200** | Remuneração do Trabalhador  | Salário atual, horas, adicionais | **Mensal** - dados atuais |
| **S-2300** | Trabalhador Sem Vínculo     | Dados de autônomos/terceiros     | Início de prestação       |
| **S-2400** | Cadastro de Beneficiário    | Dados de dependentes             | Quando há dependentes     |
| **S-1210** | Pagamentos Diversos         | Pagamentos extras                | Quando aplicável          |
| **S-2205** | Alteração Dados Contratuais | **DADOS ATUALIZADOS**            | **Quando há mudanças**    |
| **S-2206** | Alteração Contrato Trabalho | Mudanças contratuais             | Alterações contratuais    |

## 🔍 **EVENTOS MAIS IMPORTANTES PARA DADOS ATUAIS:**

### **S-1200 - Remuneração Mensal (DADOS ATUAIS)**

- ✅ **Salário atual**
- ✅ **Jornada de trabalho**
- ✅ **Horas trabalhadas**
- ✅ **Adicionais e descontos**
- ✅ **Local de trabalho**

### **S-2205 - Alteração Dados Contratuais (MAIS ATUAL)**

- ✅ **Última alteração salarial**
- ✅ **Cargo atual**
- ✅ **Jornada atual**
- ✅ **Local de trabalho atual**
- ✅ **Dados mais recentes**

### **S-2206 - Alteração Contrato (MUDANÇAS RECENTES)**

- ✅ **Alterações contratuais**
- ✅ **Mudanças de função**
- ✅ **Transferências**
- ✅ **Promoções**

## ❌ **POR QUE CONSULTAS SOAP NÃO FUNCIONAM:**

### **URLs de Consulta vs Envio:**

- **Envio**: `webservices.envio.esocial.gov.br` ✅ **FUNCIONA**
- **Consulta**: `webservices.consulta.esocial.gov.br` ❌ **ERRO 404/500**

### **O que Consultas SOAP Deveriam Retornar:**

1. **XML dos eventos** já enviados
2. **Status de processamento**
3. **Dados validados** pelo eSocial
4. **Histórico de eventos**

### **Por que Falham:**

- **URLs incorretas** ou **descontinuadas**
- **Estrutura XML** diferente para consultas
- **Permissões** do certificado
- **Endpoints obsoletos**

## 🎯 **ESTRATÉGIA CORRETA:**

### **Em vez de CONSULTAR, ENVIAR eventos que retornam dados:**

1. **S-1200** → Dados atuais de folha
2. **S-2205** → Alterações mais recentes
3. **S-2206** → Mudanças contratuais

### **Fluxo Correto:**

1. **Enviar evento** → Receber protocolo
2. **Aguardar processamento** → Consultar protocolo
3. **Extrair dados** → Da resposta do evento
