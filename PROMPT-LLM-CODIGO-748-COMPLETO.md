# 🔍 PROMPT PARA LLM - RESOLVER CÓDIGO 748 eSocial (COMPLETO)

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

## 💻 **CÓDIGO TYPESCRIPT FUNCIONAL**

### **🔧 Script de Consulta que Alcançou Status 200:**

```typescript
import * as https from 'https';
import * as fs from 'fs';
import { IncomingHttpHeaders } from 'http';

interface ESocialConsultaConfig {
  cpfEmpregador: string;
  protocolos: string[];
  usarCertificado: boolean;
  certPath?: string;
  keyPath?: string;
}

class ESocialConsultaComMTLS {
  private config: ESocialConsultaConfig;

  constructor(config: ESocialConsultaConfig) {
    this.config = config;
  }

  // XML que funcionou (Status 200)
  private gerarXmlConsulta(protocolo: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:tns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <soapenv:Header/>
  <soapenv:Body>
    <tns:ConsultarLoteEventos>
      <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
        <consultaLoteEventos>
          <protocoloEnvio>${protocolo}</protocoloEnvio>
        </consultaLoteEventos>
      </eSocial>
    </tns:ConsultarLoteEventos>
  </soapenv:Body>
</soapenv:Envelope>`;
  }

  // Configuração mTLS que funciona
  private obterOpcoesConsulta(xml: string): https.RequestOptions {
    const cert = fs.readFileSync(this.config.certPath!, 'utf8');
    const key = fs.readFileSync(this.config.keyPath!, 'utf8');

    return {
      host: 'webservices.producaorestrita.esocial.gov.br',
      path: '/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction:
          '"http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos"',
        'Content-Length': Buffer.byteLength(xml),
        'User-Agent': 'eSocial-Consulta-mTLS/1.0',
        Accept: 'text/xml',
        Connection: 'keep-alive',
      },
      cert: cert,
      key: key,
      rejectUnauthorized: false,
      secureProtocol: 'TLSv1_2_method',
      ciphers: [
        'ECDHE-RSA-AES128-GCM-SHA256',
        'ECDHE-RSA-AES256-GCM-SHA384',
        'AES128-GCM-SHA256',
        'AES256-GCM-SHA384',
      ].join(':'),
      servername: 'webservices.producaorestrita.esocial.gov.br',
      timeout: 30000,
    };
  }

  // Método de consulta
  async consultarProtocolo(protocolo: string): Promise<any> {
    const xml = this.gerarXmlConsulta(protocolo);
    const options = this.obterOpcoesConsulta(xml);

    return new Promise(resolve => {
      const req = https.request(options, res => {
        let data = '';
        res.on('data', chunk => (data += chunk));
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data,
          });
        });
      });

      req.on('error', error => {
        resolve({ error: error.message });
      });

      req.write(xml);
      req.end();
    });
  }
}

// Configuração usada
const config: ESocialConsultaConfig = {
  cpfEmpregador: '59876913700',
  protocolos: ['1.2.20250918.58742', '1.2.20250918.68606'],
  usarCertificado: true,
  certPath: 'temp-cert-forge.pem',
  keyPath: 'temp-key-forge.pem',
};
```

## 📞 **CHAMADAS REALIZADAS E RETORNOS DETALHADOS**

### **🧪 TESTE 1: Protocolo S-2200 com Máscara**

```javascript
// Chamada realizada:
POST https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc
SOAPAction: "http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos"

XML enviado:
<tns:ConsultarLoteEventos>
  <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/consulta/retornoProcessamento/v1_0_0">
    <consultaLoteEventos>
      <protocoloEnvio>1.2.20250918.58742</protocoloEnvio>
    </consultaLoteEventos>
  </eSocial>
</tns:ConsultarLoteEventos>

// Retorno recebido:
Status HTTP: 200 (216ms)
Server: Microsoft-IIS/10.0
Content-Type: text/xml; charset=utf-8

<ConsultarLoteEventosResponse xmlns="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0">
  <ConsultarLoteEventosResult>
    <eSocial xmlns="http://www.esocial.gov.br/schema/lote/eventos/envio/retornoProcessamento/v1_3_0">
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
  </ConsultarLoteEventosResult>
</ConsultarLoteEventosResponse>
```

### **🧪 TESTE 2: Protocolo S-2200 sem Máscara (CORRETO)**

```javascript
// Chamada realizada:
XML enviado:
<consultaLoteEventos>
  <protocoloEnvio>122025091858742</protocoloEnvio>
</consultaLoteEventos>

// Retorno recebido:
Status HTTP: 200 (354ms)
MESMO RESULTADO: Código 748 - "O protocolo informado é inválido."
```

### **🧪 TESTE 3: Protocolo S-1000 sem Máscara (CORRETO)**

```javascript
// Chamada realizada:
XML enviado:
<consultaLoteEventos>
  <protocoloEnvio>122025091868606</protocoloEnvio>
</consultaLoteEventos>

// Retorno recebido:
Status HTTP: 200 (13ms)
MESMO RESULTADO: Código 748 - "O protocolo informado é inválido."
```

## 🔍 **ANÁLISE DO WSDL OFICIAL**

### **📋 SOAPAction Extraída do WSDL:**

```xml
<!-- Do WSDL oficial obtido com mTLS -->
<soap:operation soapAction="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0/ServicoConsultarLoteEventos/ConsultarLoteEventos" style="document"/>

<!-- Elemento esperado -->
<wsdl:part name="parameters" element="tns:ConsultarLoteEventos"/>

<!-- Namespace do serviço -->
targetNamespace="http://www.esocial.gov.br/servicos/empregador/lote/eventos/envio/consulta/retornoProcessamento/v1_1_0"
```

## 📊 **EVOLUÇÃO DOS TESTES**

### **🎯 Jornada Técnica Completa:**

1. **HTTP 403** → mTLS implementado → **ActionNotSupported**
2. **ActionNotSupported** → SOAPAction correta → **InternalServiceFault**
3. **InternalServiceFault** → XML híbrido → **Status 200 + Código 748**
4. **Código 748** → Protocolo sem máscara → **Ainda código 748**
5. **Código 748** → Remoção correta → **Ainda código 748**

## 🎯 **PERGUNTAS ESPECÍFICAS PARA PESQUISA**

### **1. 📋 FORMATO DE PROTOCOLO:**

- O formato `122025091858742` (15 dígitos) está correto para consultas?
- Existe diferença entre protocolo de envio vs. protocolo de consulta?
- Protocolos têm alguma validação de checksum ou algoritmo específico?

### **2. ⏰ TIMING DE PROCESSAMENTO:**

- Quanto tempo lotes eSocial levam para ficarem consultáveis?
- Existe diferença entre S-1000 (empregador) e S-2200 (empregado)?
- Há horários específicos de processamento ou janelas de manutenção?

### **3. 🌐 AMBIENTE DE CONSULTA:**

- Produção Restrita permite consulta de próprios protocolos enviados?
- Protocolos devem ser consultados em ambiente diferente do envio?
- Existe diferença entre `webservices.producaorestrita` e `webservices.consulta`?

### **4. 🔐 PERMISSÕES DE CERTIFICADO:**

- Certificados eCPF domésticos têm limitações para consulta?
- Existe diferença entre permissão de envio vs. consulta?
- Procuração eletrônica específica é necessária para consultas?

### **5. 📊 VALIDAÇÕES ESPECÍFICAS:**

- Código 748 indica formato errado ou protocolo não encontrado?
- Existe validação de CPF do empregador no protocolo?
- Protocolos têm status específico que deve ser verificado antes da consulta?

## 🔍 **TERMOS DE BUSCA SUGERIDOS**

### **🎯 Português:**

- "eSocial código 748 protocolo inválido solução"
- "eSocial consulta lote eventos protocolo formato 15 dígitos"
- "eSocial produção restrita consulta limitações timing"
- "eSocial certificado eCPF permissões consulta protocolo"
- "eSocial protocolo envio vs consulta diferença"

### **📚 FONTES RECOMENDADAS:**

- Documentação técnica eSocial oficial (gov.br)
- Fóruns ACBr (acbr.com.br)
- Comunidade nfephp
- Stack Overflow em português
- Grupos Google eSocial Brasil
- Suporte oficial Serpro/eSocial

## 💡 **OBJETIVO DA PESQUISA**

**Encontrar a causa específica do código 748** e **como resolvê-lo**, considerando que:

### **✅ CONFIRMADO FUNCIONANDO:**

- Toda a infraestrutura técnica está perfeita
- Protocolos são gerados com sucesso nos envios
- Consultas chegam ao servidor (Status 200)
- XML é processado corretamente
- mTLS está estabelecido

### **❌ ÚNICO PROBLEMA:**

- Validação específica de protocolo falha (código 748)
- Afeta protocolos recém-gerados e antigos
- Persiste com formatação correta (15 dígitos)

**Qualquer insight sobre timing, formato, permissões, validações específicas ou alternativas de consulta será extremamente valioso para resolver este último obstáculo técnico!**

---

## 🎯 **DIAGNÓSTICO COMPLETO E CHECKLIST DE AÇÕES**

### **📋 DIAGNÓSTICO OBJETIVO DO CÓDIGO 748:**

**O código 748 não é erro de autenticação ou estrutura SOAP** – é retorno funcional do back-end eSocial indicando **"protocolo não localizado para este empregador/ambiente"**.

#### **🔍 CAUSAS POSSÍVEIS:**

1. **⏰ Protocolo ainda não indexado** (delay de processamento)
2. **🌐 Protocolo de outro ambiente** (Produção × Produção Restrita)
3. **📋 Protocolo truncado/mascarado** incorretamente
4. **📊 Namespace/versão** altera algoritmo de procura no banco

### **🔧 FORMATO CORRETO DO PROTOCOLO:**

#### **✅ FORMATO OFICIAL S-1.3:**

- **Com pontos:** `1.2.YYYYMMDDNNNNNN` (21 caracteres)
- **Sem pontos:** `12YYYYMMDDNNNNNN` (16 caracteres)
- **⚠️ NUNCA remover:** Segunda casa decimal (`.2.`)
- **✅ Zeros à esquerda:** Completar sequencial com zeros (ex: `...000123`)

### **⏰ TIMING DE PROCESSAMENTO:**

#### **📊 JANELAS DE INDEXAÇÃO:**

- **Produção Restrita:** 30s a 3min (até 15min em pico)
- **Produção Oficial:** Até 30min (processamento assíncrono)
- **Condição:** Protocolo só consultável após status "Processado" (201/202/203)

### **🎯 PROBLEMA PRINCIPAL IDENTIFICADO:**

#### **❌ NAMESPACE/VERSÃO INCORRETA:**

**Estamos usando v1_1_0 no endpoint v1_3_0!**

- **Problema:** Endpoint v1_3_0 + namespace v1_1_0 = "compatibility wrapper" → sempre 748
- **Solução:** Usar namespace v1_3_0 + SOAPAction v1_3_0

### **✅ XML CORRETO PARA v1_3_0:**

```xml
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <ConsultarLoteEventos xmlns="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <consulta>
        <cpfCnpj>59876913700</cpfCnpj>
        <protocoloEnvio>1.2.20250918.58742</protocoloEnvio>
      </consulta>
    </ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>
```

### **✅ SOAPAction CORRETA para v1_3_0:**

```
"http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"
```

### **🌐 ENDPOINTS CORRETOS:**

- **Produção Restrita:** `https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc`
- **Produção:** `https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/WsConsultarLoteEventos.svc`

### **📋 CHECKLIST DE CORREÇÕES:**

#### **☑️ AÇÕES IMEDIATAS:**

1. **Aguardar 5-10 min** após envio antes de consultar
2. **Usar mesmo ambiente** onde enviou (Produção Restrita)
3. **Protocolo com pontos:** `1.2.YYYYMMDDNNNNNN` (formato original)
4. **Namespace v1_3_0** + SOAPAction v1_3_0
5. **Campo `<cpfCnpj>`** = CPF do certificado (59876913700)
6. **Header SOAPAction** sem aspas duplicadas
7. **Endpoint v1_3_0** correspondente ao ambiente

#### **🔍 VALIDAÇÕES ADICIONAIS:**

8. **Verificar no portal** se protocolo existe
9. **Confirmar permissão** "Empregador" no certificado
10. **Abrir chamado Serpro** se persistir com evidências

---

## 📈 **EVIDÊNCIAS TÉCNICAS PARA ANÁLISE**

### **🔧 Configuração mTLS Funcionando:**

- **Certificado:** eCPF A1 convertido PFX → PEM
- **Algoritmos:** TLSv1_2, ECDHE-RSA-AES128-GCM-SHA256
- **Validação:** Servidor aceita e processa requisições

### **📊 Protocolos Testados:**

- **S-1000:** `1.2.20250918.68606` → `122025091868606` → Código 748
- **S-2200:** `1.2.20250918.58742` → `122025091858742` → Código 748
- **Manuais:** Diversos formatos → Sempre código 748

### **🎯 Próxima Investigação:**

Focar em **timing de processamento**, **permissões específicas** ou **validações adicionais** que podem estar causando o código 748 mesmo com estrutura técnica perfeita.
