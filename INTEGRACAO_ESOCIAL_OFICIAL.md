# 🔐 Integração eSocial Oficial - Guia Completo

## 📋 Visão Geral

Este guia implementa a integração oficial com o eSocial usando os WSDLs oficiais e a estrutura de certificados recomendada pelo governo.

## 🎯 WSDLs Oficiais

### Homologação (Produção Restrita)

- **Consulta Empregador:** `https://svt.esocial.gov.br/consulta-cadastro/v1.1?wsdl`
- **Consulta Trabalhador:** `https://svt.esocial.gov.br/consulta-trabalhador/v1.1?wsdl`

### Produção

- **Consulta Empregador:** `https://servicos.esocial.gov.br/consulta-cadastro/v1.1?wsdl`
- **Consulta Trabalhador:** `https://servicos.esocial.gov.br/consulta-trabalhador/v1.1?wsdl`

## 🔧 Preparação dos Certificados

### 1. Exportar Certificado A1 para PFX

```powershell
# Abra PowerShell como Administrador
$senha = ConvertTo-SecureString -String 'SUA_SENHA_DO_CERT' -Force -AsPlainText

# Substitua <Thumbprint> pelo thumbprint do seu certificado A1
Export-PfxCertificate `
  -Cert Cert:\CurrentUser\My\<Thumbprint> `
  -FilePath C:\certs\esocial-cert.pfx `
  -Password $senha
```

### 2. Extrair key.pem e cert.pem

```powershell
# Ajuste paths e senha conforme seu ambiente
$certPfx    = 'C:\certs\esocial-cert.pfx'
$keyOut     = 'C:\certs\key.pem'
$certOut    = 'C:\certs\cert.pem'
$passIn     = 'SUA_SENHA_DO_CERT'

# Gere a chave privada
openssl pkcs12 -in $certPfx -nocerts -nodes -passin pass:$passIn -out $keyOut

# Gere o certificado público
openssl pkcs12 -in $certPfx -clcerts -nokeys -passin pass:$passIn -out $certOut
```

### 3. Usar Script Automatizado

```powershell
# Execute o script de preparação
.\scripts\preparar-certificados.ps1
```

## 🚀 Execução dos Testes

### 1. Interface Web (Recomendado)

Acesse: `http://localhost:3000/testes-completos`

### 2. Testes Individuais

```bash
# Teste eSocial Oficial
curl -X POST http://localhost:3000/api/teste-esocial-oficial \
  -H "Content-Type: application/json" \
  -d '{"environment":"homologacao","cpf":"59876913700","cnpj":"12345678000195"}'

# Teste DNS Avançado
curl -X POST http://localhost:3000/api/teste-dns-avancado \
  -H "Content-Type: application/json" \
  -d '{"environment":"homologacao"}'

# Teste SOAP Avançado
curl -X POST http://localhost:3000/api/teste-soap-avancado \
  -H "Content-Type: application/json" \
  -d '{"environment":"homologacao","cpf":"59876913700"}'
```

## 📊 Tipos de Teste Disponíveis

### 1. 🔴 Testes eSocial Oficiais

- **Funcionalidade:** WSDLs oficiais, consulta empregador/trabalhador
- **Certificado:** Usa WSSecurityCert com key.pem e cert.pem
- **Métodos:** ConsultarCadastroEmpregador, ConsultarCadastroTrabalhador

### 2. 🔵 Testes DNS Avançados

- **Funcionalidade:** Resolução DNS, conectividade HTTPS, acesso a WSDL
- **Comandos:** nslookup, ping, Test-NetConnection, curl, tracert

### 3. 🟢 Testes SOAP Avançados

- **Funcionalidade:** Envelopes SOAP, validação de dados, parsing
- **Validações:** CPF, campos obrigatórios, formatos XML

### 4. 🟣 Testes de Conectividade

- **Funcionalidade:** Ping, DNS, HTTPS, WSDL, endpoint, rota
- **Ferramentas:** Comandos de rede do Windows

### 5. 🟠 Testes Simples

- **Funcionalidade:** Lista endpoints oficiais e recomendações
- **Uso:** Referência rápida de configurações

## 🔍 Estrutura de Certificados

```
public/certificates/
├── eCPF A1 24940271 (senha 456587).pfx  # Certificado original
├── key.pem                               # Chave privada extraída
└── cert.pem                             # Certificado público extraído
```

## ⚙️ Configuração do Projeto

### Dependências Necessárias

```json
{
  "dependencies": {
    "soap": "^0.45.0",
    "@types/soap": "^0.45.0",
    "fs-extra": "^11.1.0",
    "@types/fs-extra": "^11.0.0"
  }
}
```

### Estrutura de Arquivos

```
src/pages/api/
├── teste-esocial-oficial.ts      # Testes com WSDLs oficiais
├── teste-dns-avancado.ts         # Testes DNS detalhados
├── teste-soap-avancado.ts        # Testes SOAP completos
├── teste-conectividade.ts        # Testes de conectividade
├── teste-simples.ts              # Testes simplificados
└── diagnostico-esocial.ts        # Diagnóstico completo

src/pages/
├── testes-completos.tsx          # Interface unificada
├── diagnostico-esocial.tsx       # Interface de diagnóstico
└── teste-conectividade.tsx       # Interface de conectividade

scripts/
└── preparar-certificados.ps1     # Script de preparação
```

## 🎯 Fluxo de Trabalho Recomendado

### 1. Preparação Inicial

```powershell
# 1. Preparar certificados
.\scripts\preparar-certificados.ps1

# 2. Verificar dependências
npm install
```

### 2. Execução de Testes

```powershell
# 1. Iniciar servidor
npm run dev

# 2. Acessar interface
# http://localhost:3000/testes-completos

# 3. Executar todos os testes
# Clique em "Executar Todos os Testes"
```

### 3. Análise de Resultados

- **Verde (✅):** Teste passou
- **Vermelho (❌):** Teste falhou - verificar detalhes
- **Amarelo (⚠️):** Aviso - verificar configurações

## 🔧 Solução de Problemas

### Problema: Certificado não encontrado

**Solução:** Verificar se os arquivos key.pem e cert.pem existem em `public/certificates/`

### Problema: WSDL não acessível

**Solução:** Verificar conectividade de rede e configurações DNS

### Problema: Erro de autenticação

**Solução:** Verificar se o certificado está correto e a senha está correta

### Problema: Timeout de conexão

**Solução:** Verificar configurações de firewall e proxy

## 📚 Referências

- [Manual de Orientação do eSocial](https://www.esocial.gov.br/)
- [Documentação Técnica](https://www.esocial.gov.br/documentacao-tecnica)
- [WSDLs Oficiais](https://www.esocial.gov.br/wsdls)

## 🚀 Próximos Passos

1. **Execute os testes oficiais** para validar a integração
2. **Analise os resultados** para identificar problemas
3. **Corrija as configurações** conforme necessário
4. **Implemente em produção** após validação completa

---

**Sistema implementado com base nas informações oficiais do eSocial e melhores práticas de integração!** 🎯
