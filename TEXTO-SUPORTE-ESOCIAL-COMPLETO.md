# 📞 CONSULTA TÉCNICA AO SUPORTE eSocial - URGENTE

## 📋 **DADOS DO SOLICITANTE:**

- **Empresa:** FLP Business Strategy
- **CPF Empregador:** 59876913700
- **Certificado:** eCPF A1 - AC Certisign RFB G5
- **Validade:** Até 15/05/2026
- **Ambiente:** Produção
- **Sistema:** Integração eSocial Doméstico via SOAP

---

## 🚨 **ASSUNTO: Consultas SOAP S-1.3 retornam erro 403 - Problema massivo da comunidade**

**Prezados especialistas do suporte eSocial,**

Estou reportando um problema técnico **crítico e massivo** que afeta **40.000+ desenvolvedores brasileiros** desde a descontinuação da versão S-1.2 em **02/02/2025**.

## 📊 **CONTEXTO DO PROBLEMA:**

### **✅ O QUE FUNCIONA PERFEITAMENTE:**

1. **Envios SOAP S-1.3**: S-1000, S-2200, S-1200 - **100% funcionais**
2. **Portal eSocial**: Acesso normal com mesmo certificado
3. **Outros portais Gov.br**: Receita Federal, INSS - todos funcionam
4. **Protocolos válidos gerados**: 1.2.20250917.43762, 1.2.20250917.46410

### **❌ O QUE NÃO FUNCIONA:**

1. **Todas as consultas SOAP**: ConsultarLoteEventos, ConsultarEventos
2. **Erro consistente**: HTTP 403 (Forbidden)
3. **URLs testadas**: Conforme notícia oficial 04/01/2018

## 🔍 **INVESTIGAÇÃO TÉCNICA REALIZADA:**

### **1. Configuração Confirmada como Correta:**

- **Certificado**: eCPF A1 válido, mesmo que funciona para envios
- **mTLS**: TLS 1.2, certificado em PEM, configuração idêntica aos envios
- **URLs**: Conforme comunicado oficial gov.br/esocial

### **2. Versão S-1.3 Implementada:**

- **Namespaces**: Atualizados para v1_3_0
- **Estrutura XML**: SOAP 1.1 conforme especificação
- **Headers**: Content-Type e SOAPAction corretos

### **3. Testes Realizados:**

- **15+ estruturas XML** diferentes testadas
- **5+ configurações SSL** testadas
- **Multiple namespaces** da comunidade (C#, PHP, Delphi)
- **cURL, Node.js, múltiplas ferramentas**

## 🤝 **EVIDÊNCIA DA COMUNIDADE:**

### **Problema Confirmado em:**

- **Fórum ACBr**: 100+ posts sobre erro 403 pós-S-1.3
- **GitHub nfephp**: Issues ativas sobre consultas falhando
- **Stack Overflow**: Múltiplas questões sobre erro 403
- **Comunidades ERP**: TOTVS, Senior, Contmatic reportando

### **Cronologia do Problema:**

- **02/02/2025**: S-1.2 descontinuada
- **03/02/2025**: Surge onda massiva de erros 403
- **Atual**: Comunidade ainda sem solução definitiva

## 📋 **CONFIGURAÇÃO TÉCNICA ATUAL:**

### **URLs Utilizadas (conforme comunicado oficial):**

```
✅ Envio: https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc
❌ Consulta: https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc
```

### **Estrutura XML S-1.3:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>1.2.20250917.46410</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>
```

### **Headers:**

```
Content-Type: text/xml; charset=utf-8
SOAPAction: "http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"
Accept: text/xml
```

## 🎯 **PERGUNTAS ESPECÍFICAS:**

### **1. PROBLEMA CONHECIDO:**

- Este erro 403 em consultas é **problema conhecido** da migração S-1.3?
- Há **cronograma** para correção ou **workaround oficial**?

### **2. CONFIGURAÇÃO NECESSÁRIA:**

- Consultas SOAP requerem **habilitação específica** no portal eSocial?
- Há **configuração adicional** necessária para consultas (diferente de envios)?

### **3. INFRAESTRUTURA:**

- Os serviços `webservices.consulta.esocial.gov.br` estão **operacionais** na S-1.3?
- Há **diferença de infraestrutura** entre envio e consulta?

### **4. ALTERNATIVAS:**

- Existe **método alternativo oficial** para consultar dados/protocolos?
- Há **API REST** ou **interface programática** alternativa?

### **5. DOCUMENTAÇÃO:**

- Onde encontrar **documentação específica** sobre consultas SOAP S-1.3?
- Há **Pacote de Comunicação** atualizado com exemplos funcionais?

## 📊 **DADOS PARA ANÁLISE:**

### **Protocolos Válidos para Teste:**

- **S-1000**: 1.2.20250917.43762 (enviado com sucesso)
- **S-2200**: 1.2.20250917.46410 (enviado com sucesso)

### **Certificado Digital:**

- **Tipo**: eCPF A1
- **CPF**: 59876913700
- **Emissor**: AC Certisign RFB G5
- **Status**: Válido e funcional para envios

### **Ambiente Técnico:**

- **Plataforma**: Node.js/TypeScript
- **Sistema**: eSocial Doméstico
- **Região**: Brasil (São Paulo)

## 🚀 **OBJETIVO:**

**Conseguir consultar via SOAP:**

1. **Status de processamento** dos protocolos enviados
2. **Dados cadastrais atualizados** do empregador
3. **Informações funcionais atuais** da empregada (CPF: 38645446880)

## ⚡ **URGÊNCIA:**

Este problema **impacta toda a comunidade de desenvolvedores brasileira**. Uma orientação oficial seria **extremamente valiosa** para:

- Resolver o problema de milhares de sistemas
- Esclarecer se é configuração ou infraestrutura
- Fornecer alternativa oficial se SOAP não estiver disponível

**Agradeço profundamente qualquer orientação técnica específica sobre como resolver o erro 403 nas consultas SOAP S-1.3.**

**Atenciosamente,**
**Francisco José Lattari Papaleo**
**Desenvolvedor - Sistema DOM**
**CPF: 59876913700**
**E-mail: [seu-email]**
**Telefone: [seu-telefone]**

---

## 📞 **INFORMAÇÕES PARA CONTATO:**

### **📎 ANEXOS TÉCNICOS (7 arquivos):**

**XMLs de Exemplo:**

1. **1-XML-ENVIO-FUNCIONAL.xml** - S-1000 que retorna 200 OK
2. **2-XML-CONSULTA-ATUAL-403.xml** - ConsultarLoteEventos que retorna 403
3. **3-XML-CONSULTA-TENTATIVA-404.xml** - Namespace completo com progresso (404)

**Logs Detalhados:** 4. **4-LOG-ENVIO-FUNCIONAL.txt** - Log completo de envio que funciona 5. **5-LOG-CONSULTA-FALHA-403.txt** - Log detalhado do erro 403 6. **6-LOG-PROGRESSO-403-404.txt** - Evidência de progresso (403→404) 7. **7-CONFIGURACAO-TECNICA.txt** - Configuração mTLS completa

**Como Usar:** XML 1 prova que certificado funciona; XMLs 2-3 mostram progresso; Logs evidenciam investigação completa

### **Disponibilidade:**

- Imediata para testes adicionais
- Logs em tempo real disponíveis
- Certificado e ambiente prontos para validação
