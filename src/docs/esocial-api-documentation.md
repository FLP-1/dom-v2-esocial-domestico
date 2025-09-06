# 📚 Documentação da API eSocial Doméstico - Sistema DOM

## 🎯 Visão Geral

A API eSocial Doméstico do Sistema DOM fornece uma interface completa para integração com o sistema eSocial do Governo Federal, permitindo o envio e gerenciamento de eventos relacionados ao trabalho doméstico.

## 🔗 Endpoints da API

### **Base URL**

```
https://api.dom-esocial.com.br/v1
```

### **Autenticação**

Todos os endpoints requerem autenticação via certificado digital A1 ou A3.

```http
Authorization: Bearer <certificate_token>
X-Certificate-Type: A1|A3
```

---

## 📋 **Eventos eSocial**

### **1. Evento S-1000 - Informações do Empregador/Contribuinte**

#### **POST** `/events/s1000`

Registra informações do empregador no eSocial.

**Request Body:**

```json
{
  "tpInsc": "1",
  "nrInsc": "12345678000199",
  "nmRazao": "Empresa Exemplo Ltda",
  "classTrib": "01",
  "natJurid": "2062",
  "indCoop": "0",
  "indConstr": "0",
  "indDesFolha": "0",
  "indOpcCP": "0",
  "indPorte": "S",
  "indOptRegEletron": "1",
  "contato": {
    "nmCtt": "João Silva",
    "cpfCtt": "12345678901",
    "foneFixo": "1133334444",
    "foneCel": "1199998888",
    "email": "joao@empresa.com"
  },
  "softwareHouse": {
    "cnpjSoftHouse": "12345678000199",
    "nmRazao": "Empresa Exemplo Ltda",
    "nmCont": "João Silva",
    "telefone": "1133334444",
    "email": "contato@empresa.com"
  }
}
```

**Response:**

```json
{
  "success": true,
  "protocolo": "ESOCIAL-123456789",
  "versao": "2.5.0",
  "timestamp": "2024-01-15T10:30:00Z",
  "evento": {
    "id": "evt-123456",
    "tipo": "S-1000",
    "status": "enviado"
  }
}
```

---

### **2. Evento S-2200 - Cadastramento Inicial do Vínculo e Admissão**

#### **POST** `/events/s2200`

Registra a admissão de um empregado doméstico.

**Request Body:**

```json
{
  "cpfTrab": "12345678901",
  "nisTrab": "12345678901",
  "nmTrab": "Maria Santos Silva",
  "sexo": "F",
  "racaCor": "1",
  "estCiv": "2",
  "grauInstr": "08",
  "nmSoc": "Maria Santos",
  "nascimento": {
    "dtNascto": "1985-03-15",
    "codMunic": "3550308",
    "uf": "SP",
    "paisNascto": "105",
    "paisNac": "105"
  },
  "endereco": {
    "brasil": {
      "tpLograd": "R",
      "dscLograd": "Rua das Flores",
      "nrLograd": "123",
      "complemento": "Apto 45",
      "bairro": "Centro",
      "cep": "01234567",
      "codMunic": "3550308",
      "uf": "SP"
    }
  },
  "trabalhador": {
    "infoContrato": {
      "nmCargo": "Empregado Doméstico",
      "CBOCargo": "5121",
      "dtIngr": "2024-01-15",
      "tpRegTrab": "1",
      "tpRegPrev": "1",
      "cadIni": "S"
    }
  }
}
```

**Response:**

```json
{
  "success": true,
  "protocolo": "ESOCIAL-987654321",
  "versao": "2.5.0",
  "timestamp": "2024-01-15T10:35:00Z",
  "evento": {
    "id": "evt-789012",
    "tipo": "S-2200",
    "status": "enviado"
  }
}
```

---

### **3. Evento S-2300 - Trabalhador Sem Vínculo de Emprego/Estatutário**

#### **POST** `/events/s2300`

Registra trabalhador sem vínculo de emprego.

**Request Body:**

```json
{
  "cpfTrab": "98765432100",
  "nisTrab": "98765432100",
  "nmTrab": "João Oliveira Santos",
  "sexo": "M",
  "racaCor": "2",
  "estCiv": "1",
  "grauInstr": "06",
  "nascimento": {
    "dtNascto": "1990-07-20",
    "codMunic": "3304557",
    "uf": "RJ",
    "paisNascto": "105",
    "paisNac": "105"
  },
  "trabalhador": {
    "infoTSVInicio": {
      "cadIni": "S",
      "codCateg": "721",
      "dtInicio": "2024-01-15",
      "natAtividade": "1"
    }
  }
}
```

---

## 🔍 **Consultas e Status**

### **GET** `/events/{protocolo}/status`

Consulta o status de um evento enviado.

**Response:**

```json
{
  "success": true,
  "protocolo": "ESOCIAL-123456789",
  "status": "processado",
  "dataProcessamento": "2024-01-15T11:00:00Z",
  "mensagem": "Evento processado com sucesso",
  "evento": {
    "id": "evt-123456",
    "tipo": "S-1000",
    "versao": "2.5.0"
  }
}
```

### **GET** `/events`

Lista todos os eventos enviados.

**Query Parameters:**

- `tipo`: Filtro por tipo de evento (S-1000, S-2200, etc.)
- `status`: Filtro por status (enviado, processado, erro)
- `dataInicio`: Data de início (YYYY-MM-DD)
- `dataFim`: Data de fim (YYYY-MM-DD)
- `limit`: Número máximo de resultados (padrão: 50)
- `offset`: Offset para paginação (padrão: 0)

**Response:**

```json
{
  "success": true,
  "total": 150,
  "limit": 50,
  "offset": 0,
  "eventos": [
    {
      "id": "evt-123456",
      "tipo": "S-1000",
      "protocolo": "ESOCIAL-123456789",
      "status": "processado",
      "dataEnvio": "2024-01-15T10:30:00Z",
      "dataProcessamento": "2024-01-15T11:00:00Z"
    }
  ]
}
```

---

## 🔧 **Configurações**

### **POST** `/config/certificate`

Configura certificado digital para autenticação.

**Request Body:**

```json
{
  "tipo": "A1",
  "arquivo": "<base64_encoded_certificate>",
  "senha": "senha_do_certificado"
}
```

### **POST** `/config/proxy`

Configura procuração eletrônica.

**Request Body:**

```json
{
  "arquivo": "<base64_encoded_proxy>",
  "tipo": "pdf",
  "validoAte": "2025-12-31"
}
```

### **GET** `/config/status`

Verifica status das configurações.

**Response:**

```json
{
  "success": true,
  "certificado": {
    "configurado": true,
    "tipo": "A1",
    "validoAte": "2025-12-31T23:59:59Z",
    "diasRestantes": 365
  },
  "proxy": {
    "configurado": true,
    "validoAte": "2025-12-31T23:59:59Z",
    "diasRestantes": 365
  },
  "ambiente": "producao"
}
```

---

## 📊 **Relatórios e Exportação**

### **GET** `/reports/events`

Gera relatório de eventos.

**Query Parameters:**

- `formato`: json, csv, xml, pdf
- `dataInicio`: Data de início
- `dataFim`: Data de fim
- `tipo`: Tipo de evento

**Response:**

```json
{
  "success": true,
  "relatorio": {
    "id": "rel-123456",
    "formato": "pdf",
    "url": "https://api.dom-esocial.com.br/v1/reports/rel-123456/download",
    "tamanho": 1024000,
    "dataCriacao": "2024-01-15T12:00:00Z"
  }
}
```

---

## 🚨 **Códigos de Erro**

| Código | Descrição             | Solução                              |
| ------ | --------------------- | ------------------------------------ |
| 400    | Bad Request           | Verificar formato dos dados enviados |
| 401    | Unauthorized          | Verificar certificado digital        |
| 403    | Forbidden             | Verificar permissões                 |
| 404    | Not Found             | Recurso não encontrado               |
| 422    | Unprocessable Entity  | Dados inválidos para o eSocial       |
| 429    | Too Many Requests     | Limite de requisições excedido       |
| 500    | Internal Server Error | Erro interno do servidor             |
| 503    | Service Unavailable   | Serviço temporariamente indisponível |

---

## 📝 **Exemplos de Uso**

### **JavaScript/TypeScript**

```typescript
import { ESocialApiService } from './services/esocialApi';

const api = new ESocialApiService();

// Configurar certificado
await api.configureCertificate({
  tipo: 'A1',
  arquivo: certificateFile,
  senha: 'senha123',
});

// Enviar evento S-1000
const evento = await api.sendEvent('S-1000', {
  tpInsc: '1',
  nrInsc: '12345678000199',
  nmRazao: 'Empresa Exemplo Ltda',
});

console.log('Protocolo:', evento.protocolo);
```

### **cURL**

```bash
# Enviar evento S-1000
curl -X POST https://api.dom-esocial.com.br/v1/events/s1000 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "tpInsc": "1",
    "nrInsc": "12345678000199",
    "nmRazao": "Empresa Exemplo Ltda"
  }'

# Consultar status
curl -X GET https://api.dom-esocial.com.br/v1/events/ESOCIAL-123456789/status \
  -H "Authorization: Bearer <token>"
```

---

## 🔒 **Segurança**

### **Certificados Digitais**

- Suporte a certificados A1 (arquivo) e A3 (token/cartão)
- Validação automática de expiração
- Criptografia de dados sensíveis

### **Procuração Eletrônica**

- Validação de assinatura digital
- Verificação de validade
- Armazenamento seguro

### **Rate Limiting**

- 100 requisições por minuto por usuário
- 1000 requisições por hora por usuário
- Headers de rate limit incluídos nas respostas

---

## 📞 **Suporte**

- **Email:** suporte@dom-esocial.com.br
- **Telefone:** (11) 3333-4444
- **Chat:** Disponível no sistema
- **Documentação:** https://docs.dom-esocial.com.br

---

## 📄 **Changelog**

### **v1.0.0** (2024-01-15)

- Lançamento inicial da API
- Suporte a eventos S-1000, S-2200, S-2300
- Validação de certificados A1 e A3
- Sistema de relatórios
- Dashboard de monitoramento

---

_Esta documentação é atualizada regularmente. Para a versão mais recente, consulte: https://docs.dom-esocial.com.br_
