# 🚨 URGENTE: URLs Corretas eSocial S-1.3 para Consultas SOAP

## 📋 **PROBLEMA ESPECÍFICO IDENTIFICADO**

Após **investigação completa**, confirmamos que o problema são as **URLs de consulta incorretas** para a versão S-1.3 do eSocial. **Envios funcionam perfeitamente**, mas **consultas retornam 404**.

## ✅ **JÁ CONFIRMADO QUE FUNCIONA:**

### **URLs de Envio (100% funcionais):**

```
https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc
```

- ✅ **S-1000**: Funciona
- ✅ **S-2200**: Funciona
- ✅ **S-1200**: Funciona
- ✅ **Certificado eCPF A1**: Funciona
- ✅ **mTLS**: Configurado corretamente

## ❌ **PROBLEMA CONFIRMADO:**

### **URLs de Consulta (404/HTML):**

```
❌ https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc
❌ https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc
❌ https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/WsConsultarIdentificadorCadastro.svc
```

**Resultados dos testes:**

- **Status**: 404 Not Found
- **Resposta**: Páginas HTML de erro
- **WSDL**: 403 Forbidden mesmo com certificado

## 🔍 **TESTES REALIZADOS (TODOS CONFIRMAM URLS INCORRETAS):**

### **1. Teste cURL:**

```bash
curl -I https://webservices.consulta.esocial.gov.br/.../WsConsultarLoteEventos.svc
# Resultado: HTTP 404
```

### **2. Teste Node.js:**

```javascript
// Status HTTP: 0 (não conecta)
// Resposta: Vazia ou HTML de erro
```

### **3. Teste SOAP 1.1 vs 1.2:**

- ✅ **SOAP 1.1**: Implementado
- ✅ **Namespaces v1_3_0**: Atualizados
- ❌ **URLs**: Ainda 404

## 🎯 **O QUE PRECISO SABER:**

### **1. URLs CORRETAS S-1.3 para CONSULTAS:**

- Qual o domínio correto para consultas na S-1.3?
- As URLs mudaram de `webservices.consulta.esocial.gov.br`?
- Existe documentação oficial com os endpoints S-1.3?

### **2. ESTRUTURA DE URLs S-1.3:**

- Há versionamento explícito nas URLs? (ex: `/v1_3_0/`)
- Os serviços foram reorganizados na S-1.3?
- Existe diferença entre eSocial Doméstico vs Empresarial?

### **3. ENDPOINTS ESPECÍFICOS NECESSÁRIOS:**

```
PRECISO DAS URLs CORRETAS PARA:
- ConsultarLoteEventos (protocolo específico)
- ConsultarEventos (por filtro)
- ConsultarIdentificadorCadastro (por CPF)
- ConsultarQualificacaoCadastral (dados cadastrais)
```

## 📊 **CONTEXTO TÉCNICO:**

### **Funcionando (Envio):**

```xml
POST https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc
SOAPAction: "http://www.esocial.gov.br/schema/lote/eventos/envio/v1_3_0/EnviarLoteEventos"
```

### **Não Funcionando (Consulta):**

```xml
POST https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc
SOAPAction: "http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"
```

## 🚨 **PERGUNTAS DIRETAS:**

### **1. URLs Oficiais S-1.3:**

- Onde encontrar a documentação oficial com as URLs S-1.3?
- O gov.br/esocial tem a lista atualizada?
- Existe manual técnico específico da S-1.3?

### **2. Possíveis URLs Corretas:**

```
Podem ser:
- https://webservices.esocial.gov.br/servicos/...
- https://api.esocial.gov.br/servicos/...
- https://webservices.consulta.esocial.gov.br/v1_3_0/...
- Outro domínio específico para S-1.3?
```

### **3. Fontes Confiáveis:**

- Manual de Orientação do eSocial (MOS) S-1.3
- Documentação técnica oficial gov.br
- Comunicados sobre mudanças na S-1.3
- Exemplos de código oficial

## 💡 **SOLUÇÕES ESPERADAS:**

### **1. URLs Corretas (PRIORITÁRIO):**

```
✅ URL correta para ConsultarLoteEventos na S-1.3
✅ URL correta para ConsultarEventos na S-1.3
✅ URL correta para ConsultarIdentificadorCadastro na S-1.3
```

### **2. Documentação:**

- Link para documentação oficial S-1.3
- Manual com endpoints atualizados
- Exemplos de SOAP requests S-1.3

### **3. Configuração:**

- SOAPActions corretos para S-1.3
- Namespaces exatos para consultas
- Headers HTTP necessários

## 📋 **DADOS PARA TESTE:**

### **Protocolos Válidos:**

- **S-1000**: `1.2.20250917.43762`
- **S-2200**: `1.2.20250917.46410`

### **Dados Reais:**

- **CPF Empregador**: `59876913700`
- **CPF Empregada**: `38645446880`
- **Certificado**: eCPF A1 válido

## 🎯 **RESULTADO ESPERADO:**

**URLs funcionais** que permitam consultar:

1. **Status de protocolos** enviados
2. **Dados cadastrais** do empregador
3. **Informações atuais** da empregada
4. **Eventos processados** pelo eSocial

---

## ⚡ **URGÊNCIA:**

**Tenho toda a infraestrutura funcionando (certificado, mTLS, XML, namespaces S-1.3). Só preciso das URLs corretas para as consultas SOAP na versão S-1.3!**

**Por favor, forneça as URLs oficiais e atualizadas para consultas eSocial S-1.3, preferencialmente com fonte oficial (gov.br/esocial ou MOS).**
