# 📋 **Procuração Eletrônica - eSocial**

## 🎯 **O que é a Procuração Eletrônica?**

A **Procuração Eletrônica** é um documento digital que autoriza uma pessoa (procurador) a representar outra pessoa (outorgante) em atos específicos perante o sistema eSocial.

### **📄 Características:**

- **Documento Legal:** Autorização formal para representação
- **Formato Digital:** Arquivo XML assinado digitalmente
- **Validação:** Verificado pelo sistema eSocial
- **Segurança:** Criptografia e assinatura digital

## 🔍 **Quando é Necessária?**

### **Cenários de Uso:**

1. **Representação Legal:**
   - Advogados representando clientes
   - Contadores representando empresas
   - Consultores representando empregadores

2. **Delegação de Responsabilidades:**
   - Terceiros fazendo envios no eSocial
   - Prestadores de serviço
   - Software houses

3. **Compliance:**
   - Atendimento às exigências legais
   - Auditoria e fiscalização
   - Controle de acesso

## 📁 **Formato do Arquivo:**

### **Especificações Técnicas:**

- **Formato:** XML (eXtensible Markup Language)
- **Padrão:** eSocial XML Schema
- **Assinatura:** Certificado digital do outorgante
- **Validação:** XSD (XML Schema Definition)

### **Estrutura Básica:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/...">
  <evtAdmissao Id="ID123456789">
    <ideEvento>
      <tpAmb>1</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>59876913700</nrInsc>
    </ideEmpregador>
    <!-- ... outros campos ... -->
  </evtAdmissao>
</eSocial>
```

## 📥 **Arquivo de Exemplo:**

### **Localização:**

- **Caminho:** `certificados/exemplo-procuracao-eletronica.xml`
- **Tamanho:** ~5KB
- **Formato:** XML assinado

### **Conteúdo do Exemplo:**

- **Empregador:** FRANCISCO JOSE LATTARI PAPALEO (CPF: 59876913700)
- **Trabalhador:** Dados completos de exemplo
- **Evento:** S-1000 (Cadastramento Inicial do Vínculo)
- **Validação:** Estrutura conforme XSD do eSocial

## 🔧 **Como Usar:**

### **1. Upload da Procuração:**

1. Acesse a tela de **Configurações**
2. Clique em **"Configurar"** ao lado de "Procuração Eletrônica"
3. Faça upload do arquivo XML
4. O sistema validará automaticamente

### **2. Validação:**

- **Estrutura XML:** Verificação do schema
- **Assinatura Digital:** Validação da autenticidade
- **Dados:** Verificação de consistência
- **Validade:** Verificação de expiração

### **3. Uso no Sistema:**

- **Representação:** Atos em nome do outorgante
- **Envio de Eventos:** Transmissão ao eSocial
- **Consultas:** Acesso a informações
- **Auditoria:** Rastreamento de ações

## ⚠️ **Importante:**

### **Requisitos:**

- **Certificado Digital:** Válido e ativo
- **Assinatura:** Do outorgante
- **Validade:** Dentro do prazo
- **Formato:** XML conforme XSD

### **Limitações:**

- **Escopo:** Apenas atos especificados
- **Prazo:** Validade limitada
- **Revogação:** Pode ser revogada a qualquer momento
- **Responsabilidade:** Outorgante responde pelos atos

## 📞 **Suporte:**

Para dúvidas sobre procuração eletrônica:

- **Email:** suporte@dom-esocial.com.br
- **Telefone:** (11) 99999-9999
- **Documentação:** [Portal eSocial](https://www.esocial.gov.br)

---

**Última atualização:** 2024-01-15
**Versão:** 1.0.0
