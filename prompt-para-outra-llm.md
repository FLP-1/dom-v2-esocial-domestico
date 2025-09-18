# 🚨 AJUDA URGENTE: Consultas SOAP eSocial S-1.3 Falhando

## 📋 **CONTEXTO DO PROBLEMA**

Estou desenvolvendo uma integração com o **eSocial Doméstico** em **Node.js/TypeScript** e todas as **consultas SOAP estão falhando** mesmo após implementar todas as correções recomendadas. **Envios funcionam perfeitamente**, mas **consultas retornam 404/500**.

## 🔍 **PROBLEMA ESPECÍFICO**

### **✅ O QUE FUNCIONA:**

- ✅ **Envio de eventos** (S-1000, S-2200, S-1200) - **100% funcional**
- ✅ **Certificado eCPF A1** - Carregado e funcionando para envios
- ✅ **mTLS configurado** - Cert + Key em PEM funcionando
- ✅ **URLs de envio** - `webservices.envio.esocial.gov.br` funcionam

### **❌ O QUE NÃO FUNCIONA:**

- ❌ **Todas as consultas SOAP** - ConsultarLoteEventos, ConsultarEventos, etc.
- ❌ **URLs de consulta** - `webservices.consulta.esocial.gov.br` retornam 404/500
- ❌ **WSDLs de consulta** - Retornam 403 mesmo com certificado
- ❌ **Namespaces v1_3_0** - Atualizados mas ainda falham

## 🔧 **JÁ IMPLEMENTADO (SEGUINDO ORIENTAÇÕES):**

### **1. Versão S-1.3 Atualizada:**

```typescript
// Todos os namespaces atualizados de v1_1_0 para v1_3_0
xmlns: cons =
  'http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0';
```

### **2. URLs Oficiais S-1.3:**

```typescript
// Configuração atual
consultaEmpregador: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
consultaTrabalhador: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarqualificacaocadastral/WsConsultarQualificacaoCadastral.svc',
consultaEventos: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc'
```

### **3. Certificado mTLS Configurado:**

```typescript
const agent = new https.Agent({
  cert: cert, // PEM format
  key: key, // PEM format
  rejectUnauthorized: false,
});
```

### **4. SOAP Fault Capturado:**

```typescript
// Implementado captura detalhada de <soap:Fault>
const faultMatch = response.data.match(/<soap:Fault>(.*?)<\/soap:Fault>/s);
```

## 📊 **RESULTADOS DOS TESTES ATUAIS:**

| **Endpoint**                   | **Status** | **Erro**                        |
| ------------------------------ | ---------- | ------------------------------- |
| ConsultarLoteEventos           | ❌         | HTTP 500: Internal Server Error |
| ConsultarEventos               | ❌         | HTTP 404: Not Found             |
| ConsultarIdentificadorCadastro | ❌         | HTTP 404: Not Found             |
| WSDLs com certificado          | ❌         | HTTP 403: Forbidden             |

## 🎯 **DADOS DISPONÍVEIS:**

### **Certificado:**

- **Tipo:** eCPF A1 (.pfx)
- **Status:** Válido e funcionando para envios
- **Conversão:** PEM format com cert + key

### **Protocolos Válidos:**

- **S-1000:** `1.2.20250917.43762` (sucesso)
- **S-2200:** `1.2.20250917.46410` (sucesso)
- **CPF Empregador:** `59876913700`
- **CPF Empregada:** `38645446880`

### **XML de Consulta Atual:**

```xml
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header />
  <soap:Body>
    <cons:ConsultarLoteEventos
      xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <cons:consulta>
        <cons:cpfCnpj>59876913700</cons:cpfCnpj>
        <cons:protocolo>1.2.20250917.46410</cons:protocolo>
      </cons:consulta>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>
```

## 🚨 **PERGUNTAS ESPECÍFICAS:**

### **1. URLs Corretas S-1.3:**

- As URLs `webservices.consulta.esocial.gov.br` estão corretas para S-1.3?
- Existe algum domínio específico para consultas na versão S-1.3?
- Há endpoints diferentes para eSocial Doméstico vs. Empresarial?

### **2. Namespaces S-1.3:**

- Os namespaces `v1_3_0` estão corretos?
- Existe documentação oficial com os namespaces da S-1.3?
- Há diferenças nos namespaces entre envio e consulta?

### **3. Autenticação mTLS:**

- O mesmo certificado eCPF serve para envios E consultas?
- Há configurações adicionais de mTLS para consultas?
- É necessário `rejectUnauthorized: true` em produção?

### **4. Estrutura XML:**

- A estrutura do XML de consulta está correta para S-1.3?
- Há mudanças nos elementos XML entre v1_1_0 e v1_3_0?
- Os SOAPActions estão corretos?

### **5. Alternativas:**

- Existe API REST alternativa para consultas?
- Há outros métodos para obter dados atuais dos empregados?
- É possível consultar via portal e extrair dados?

## 💡 **SOLUÇÕES ESPERADAS:**

1. **URLs corretas** para consultas na versão S-1.3
2. **Namespaces corretos** para os XMLs de consulta
3. **Configuração mTLS** específica para consultas
4. **Estrutura XML** correta para S-1.3
5. **Métodos alternativos** se SOAP não funcionar

## 🔍 **INFORMAÇÕES ADICIONAIS:**

- **Ambiente:** Produção (não homologação)
- **Plataforma:** Node.js 18+ / TypeScript
- **Certificado:** Válido até 2025
- **Região:** Brasil
- **Tipo:** eSocial Doméstico (Pessoa Física)

## 🎯 **RESULTADO ESPERADO:**

Conseguir **consultar dados reais** dos empregados via SOAP ou método alternativo, especificamente:

- Dados cadastrais atualizados
- Informações contratuais atuais
- Histórico de eventos
- Status dos protocolos enviados

---

**🚀 POR FAVOR, AJUDE COM SOLUÇÕES PRÁTICAS E TESTÁVEIS!**

Preciso de orientação específica sobre como resolver esses erros 404/500 nas consultas SOAP do eSocial S-1.3, considerando que os envios funcionam perfeitamente com a mesma configuração.
