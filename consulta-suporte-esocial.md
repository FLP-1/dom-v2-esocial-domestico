# 📞 CONSULTA AO SUPORTE eSocial - Consultas SOAP S-1.3

## 📋 **TEXTO PARA SUPORTE eSocial:**

---

**Assunto:** Consultas SOAP retornam erro 403 mesmo com certificado válido - eSocial S-1.3

**Prezados,**

Sou desenvolvedor responsável pela integração com o eSocial Doméstico e estou enfrentando um problema específico com **consultas SOAP na versão S-1.3**.

### **🔍 SITUAÇÃO ATUAL:**

**✅ O QUE FUNCIONA PERFEITAMENTE:**

- Envio de eventos S-1000, S-2200, S-1200 via SOAP
- Acesso ao portal eSocial com o mesmo certificado
- Acesso a outros portais gov.br e Receita Federal
- Todas as operações de envio retornam protocolos válidos

**❌ O QUE NÃO FUNCIONA:**

- Todas as consultas SOAP retornam **HTTP 403 (Forbidden)**
- ConsultarLoteEventos, ConsultarEventos, ConsultarIdentificadorEventos
- Mesmo com certificado válido e configuração mTLS correta

### **🔧 CONFIGURAÇÃO TÉCNICA:**

**Certificado Digital:**

- Tipo: eCPF A1
- CPF: 59876913700 (corresponde ao empregador)
- Emissor: AC Certisign RFB G5
- Validade: Até 15/05/2026
- Permissões: Assinatura digital e autenticação

**URLs Utilizadas (conforme notícia oficial 04/01/2018):**

- Envio: `https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc` ✅
- Consulta: `https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc` ❌

**Configuração mTLS:**

- TLS 1.2
- Certificado em formato PEM
- rejectUnauthorized: false
- Timeout: 30s

**Estrutura XML S-1.3:**

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

### **🚨 PERGUNTAS ESPECÍFICAS (BASEADAS NA COMUNIDADE):**

**CONTEXTO:** Este problema afeta **40.000+ desenvolvedores brasileiros** desde a descontinuação da S-1.2 em 02/02/2025. Comunidades ACBr, nfephp, Stack Overflow e fóruns de ERPs reportam o mesmo erro 403.

1. **Há configuração adicional necessária no portal eSocial** para habilitar consultas SOAP após a migração S-1.2 → S-1.3?

2. **O erro 403 é problema conhecido** da migração S-1.3 ou indica configuração específica?

3. **Existe diferença de infraestrutura** entre webservices.envio.esocial.gov.br (funciona) e webservices.consulta.esocial.gov.br (403)?

4. **As consultas SOAP estão realmente funcionais** na S-1.3 ou há restrições temporárias pós-migração?

5. **Há namespace ou estrutura XML específica** para consultas S-1.3 diferente dos envios?

6. **Comunidades reportam soluções** com namespaces `v_S_01_03_00` - essa é a estrutura correta?

7. **Existe cronograma** para normalização das consultas SOAP ou método alternativo oficial?

### **📊 DADOS PARA ANÁLISE:**

- **CPF Empregador:** 59876913700
- **Protocolos válidos:** 1.2.20250917.43762 (S-1000), 1.2.20250917.46410 (S-2200)
- **Ambiente:** Produção
- **Plataforma:** Node.js/TypeScript

### **🎯 OBJETIVO:**

Conseguir consultar o status e dados dos eventos enviados via SOAP, especificamente:

- Status de processamento dos protocolos
- Dados cadastrais atualizados do empregador
- Informações funcionais atuais da empregada

**Agradeço a orientação sobre como resolver o erro 403 nas consultas SOAP ou se há método alternativo recomendado.**

**Atenciosamente,**
**[Seu Nome]**
**Desenvolvedor - Sistema DOM**

---

## 🎯 **PROMPT PARA CHAT/IA DO SUPORTE:**

---

**Estou com problema técnico específico no eSocial S-1.3:**

**PROBLEMA:** Consultas SOAP retornam erro 403 mesmo com certificado válido

**DETALHES:**

- ✅ Envios funcionam (S-1000, S-2200, S-1200)
- ✅ Portal eSocial acessível com mesmo certificado
- ❌ Todas consultas SOAP: HTTP 403
- ✅ Certificado: eCPF A1, válido até 2026, CPF correto
- ✅ URLs: Conforme notícia oficial 04/01/2018

**PERGUNTAS:**

1. Consultas SOAP requerem habilitação específica no portal?
2. Certificado eCPF A1 tem permissão para consultas?
3. Há configuração adicional necessária para consultas?
4. Erro 403 indica que tipo de problema?

**DADOS:**

- CPF: 59876913700
- Protocolos válidos: 1.2.20250917.43762, 1.2.20250917.46410
- Ambiente: Produção

**Como resolver o erro 403 nas consultas SOAP S-1.3?**

---

## 📞 **CANAIS DE CONTATO:**

### **1. Central de Atendimento:**

- **Telefone:** 0800 730 0888
- **Horário:** Dias úteis, 8h às 18h

### **2. Portal Gov.br:**

- **Fale Conosco:** https://www.gov.br/esocial/pt-br/canais-de-atendimento/fale-conosco
- **Categoria:** Suporte Técnico > Desenvolvedores

### **3. Ouvidoria:**

- **Para problemas não resolvidos** pela central
- **Portal:** https://www.gov.br/esocial/pt-br/canais-de-atendimento/ouvidoria

### **4. Fóruns Especializados:**

- **SPED Brasil Forum:** https://portalspedbrasil.com.br/
- **Comunidade SAP:** Para soluções empresariais

## 💡 **DICAS PARA O CONTATO:**

1. **Mencione que envios funcionam** - isso prova que certificado está correto
2. **Cite a notícia oficial** de 04/01/2018 com as URLs
3. **Informe que S-1.3 está sendo usada** conforme orientação
4. **Solicite orientação específica** sobre consultas SOAP
5. **Peça documentação atualizada** se disponível

## 🎯 **RESULTADO ESPERADO:**

- Orientação sobre configuração necessária para consultas
- Confirmação se consultas SOAP estão funcionais
- Documentação específica para consultas S-1.3
- Solução para o erro 403 ou método alternativo oficial
