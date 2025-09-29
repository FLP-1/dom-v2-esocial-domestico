# 🔍 PROMPT PARA LLM - RESOLVER CÓDIGO 748 eSocial

## 📊 **CONTEXTO TÉCNICO**

Preciso de ajuda para resolver um problema específico com consultas eSocial no Brasil. Conseguimos estabelecer comunicação completa (mTLS + Status 200), mas todos os protocolos retornam código 748.

## 🎯 **PROBLEMA ESPECÍFICO**

### **✅ O QUE JÁ FUNCIONA:**

- **mTLS:** Certificado eCPF aceito pelo eSocial ✅
- **Envios:** S-1000 e S-2200 funcionando perfeitamente ✅
- **SOAPAction:** Correta (extraída do WSDL oficial) ✅
- **XML Estrutura:** Híbrida validada pelo servidor ✅
- **Status HTTP:** 200 consistente ✅
- **Resposta:** XML eSocial estruturado ✅

### **❌ PROBLEMA RESTANTE:**

- **Código 748:** "O protocolo informado é inválido"
- **Afeta:** TODOS os protocolos (incluindo recém-gerados)
- **Testamos:** Com pontos, sem pontos, diferentes formatos
- **Resultado:** Sempre código 748

## 📋 **DETALHES TÉCNICOS**

### **🔧 CONFIGURAÇÃO FUNCIONAL:**

```xml
<!-- SOAPAction (do WSDL oficial) -->
http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos

<!-- XML Estrutura (funcionando - Status 200) -->
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <protocoloEnvio>122025091858742</protocoloEnvio>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>

<!-- Endpoint funcionando -->
https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc
```

### **📊 RESPOSTA RECEBIDA:**

```xml
<ConsultarLoteEventosResponse>
  <eSocial>
    <retornoProcessamentoLoteEventos>
      <status>
        <cdResposta>501</cdResposta>
        <descResposta>Solicitação de consulta incorreta - Erro preenchimento.</descResposta>
        <ocorrencias>
          <ocorrencia>
            <codigo>748</codigo>
            <descricao>O protocolo informado é inválido.</descricao>
            <tipo>1</tipo>
          </ocorrencia>
        </ocorrencias>
      </status>
    </retornoProcessamentoLoteEventos>
  </eSocial>
</ConsultarLoteEventosResponse>
```

### **🧪 PROTOCOLOS TESTADOS:**

- **S-2200 (recém-enviado):** `1.2.20250918.58742` → `122025091858742` → Código 748
- **S-1000 (recém-enviado):** `1.2.20250918.68606` → `122025091868606` → Código 748
- **Manuais diversos:** Todos → Código 748
- **Aguardamos 30+ min:** Ainda código 748

## 🔍 **PERGUNTAS ESPECÍFICAS**

### **1. 📋 FORMATO DE PROTOCOLO:**

- O formato `122025091858742` (15 dígitos) está correto?
- Existe alguma validação específica de formato além dos 15 dígitos?
- Protocolos têm algum checksum ou dígito verificador?

### **2. ⏰ TIMING DE PROCESSAMENTO:**

- Quanto tempo lotes eSocial levam para ficarem consultáveis?
- Existe diferença entre S-1000 (empregador) e S-2200 (empregado)?
- Há horários específicos de processamento?

### **3. 🌐 AMBIENTE DE CONSULTA:**

- Produção Restrita tem limitações específicas para consultas?
- Protocolos de Produção Restrita são consultáveis no mesmo ambiente?
- Existe diferença entre envio e consulta de ambiente?

### **4. 🔐 PERMISSÕES DE CERTIFICADO:**

- Certificados eCPF têm permissões específicas para consulta?
- Existe diferença entre permissão de envio vs. consulta?
- Procuração eletrônica é necessária para consultas?

### **5. 📊 TIPOS DE CONSULTA:**

- Existem outros métodos de consulta além de protocolo?
- Consulta por CPF do trabalhador é possível?
- Há endpoints específicos para diferentes tipos de consulta?

## 🎯 **PESQUISA SUGERIDA**

### **🔍 TERMOS DE BUSCA:**

- "eSocial código 748 protocolo inválido solução"
- "eSocial consulta lote eventos protocolo formato"
- "eSocial produção restrita consulta limitações"
- "eSocial certificado eCPF permissões consulta"
- "eSocial timing processamento lote consulta"

### **📚 FONTES RECOMENDADAS:**

- Documentação técnica eSocial oficial
- Fóruns de desenvolvedores brasileiros
- Stack Overflow em português
- Comunidades ACBr, nfephp
- Suporte oficial Serpro/eSocial

### **🎯 FOCO DA PESQUISA:**

1. **Casos similares** de código 748 resolvidos
2. **Timing específico** para consultas
3. **Validações adicionais** de protocolo
4. **Permissões de certificado** para consulta
5. **Alternativas de consulta** (CPF, período, etc.)

## 📈 **PROGRESSO ATUAL**

### **🏆 SUCESSOS CONFIRMADOS:**

- ✅ mTLS estabelecido com eSocial
- ✅ SOAPAction correta identificada
- ✅ XML estrutura funcional
- ✅ Status 200 consistente
- ✅ Envios S-1000/S-2200 operacionais

### **⚠️ OBSTÁCULO RESTANTE:**

- Código 748 em todos os protocolos
- Estrutura técnica perfeita, problema específico de validação

## 💡 **OBJETIVO DA PESQUISA**

**Encontrar a causa específica do código 748 e como resolvê-lo**, considerando que:

- Toda a infraestrutura técnica está funcionando
- Protocolos são gerados com sucesso
- Consultas chegam ao servidor e são processadas
- Apenas a validação de protocolo falha

**Qualquer insight sobre timing, formato, permissões ou alternativas será muito valioso!**
