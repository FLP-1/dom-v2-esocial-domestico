# 🔧 Troubleshooting eSocial - Problemas e Soluções

## 🚨 Problemas Identificados e Soluções

### 1. ❌ Erro HTTP 403 - Endpoint Protegido

**Problema:**

```
Erro HTTP 403: Forbidden
Endpoint protegido em HOMOLOGACAO - precisa de habilitação para envio
```

**Causa:**

- Certificado não tem permissão para envio de eventos em homologação
- Ambiente configurado como produção mas usando homologação

**Soluções:**

#### Solução 1: Usar Ambiente de Produção

```json
{
  "cpf": "59876913700",
  "ambiente": "producao"
}
```

#### Solução 2: Habilitar Certificado em Homologação

1. Acessar portal oficial do eSocial
2. Fazer login com certificado digital
3. Solicitar habilitação para homologação
4. Aguardar aprovação (24-48h)

#### Solução 3: Verificar Permissões do Certificado

- Confirmar se certificado está válido
- Verificar se tem permissão para eSocial
- Testar em ambiente de produção

### 2. ⚠️ Erro HTTP 404 - Cadastro Não Encontrado

**Problema:**

```
Erro HTTP 404: Not Found
Cadastro ainda não foi processado pelo eSocial
```

**Causa:**

- CPF não está cadastrado no eSocial
- Cadastro ainda não foi processado

**Soluções:**

#### Solução 1: Cadastrar via Portal Oficial

1. Acessar https://www.esocial.gov.br/
2. Fazer login com certificado digital
3. Cadastrar CPF como empregador
4. Aguardar processamento (24-48h)

#### Solução 2: Aguardar Processamento

- Cadastros podem levar até 48h para serem processados
- Verificar status no portal oficial
- Tentar novamente após processamento

### 3. 🔧 Inconsistência de Ambiente

**Problema:**

- Configurado: Produção
- Usado: Homologação

**Solução:**

```typescript
// Corrigir configuração padrão
const { environment = 'producao' } = req.body;
```

### 4. 🌐 Problemas de Conectividade

**Problema:**

- DNS não resolve
- Conectividade HTTPS falha
- Ping bloqueado

**Soluções:**

#### Solução 1: Configurar DNS Alternativo

```powershell
# Configurar DNS do Google
Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses @("8.8.8.8", "8.8.4.4")
```

#### Solução 2: Limpar Cache DNS

```powershell
ipconfig /flushdns
ipconfig /registerdns
netsh winsock reset
```

#### Solução 3: Verificar Conectividade

```powershell
Test-NetConnection -ComputerName "webservices.envio.esocial.gov.br" -Port 443
Test-NetConnection -ComputerName "webservices.consulta.esocial.gov.br" -Port 443
```

## 📋 Checklist de Verificação

### ✅ Antes de Executar o Fluxo

1. **Certificado Digital**
   - [ ] Certificado instalado e válido
   - [ ] Senha correta
   - [ ] Não expirado
   - [ ] Tem permissão para eSocial

2. **Conectividade**
   - [ ] DNS resolve corretamente
   - [ ] HTTPS funciona
   - [ ] Certificados SERPRO instalados

3. **Configuração**
   - [ ] Ambiente correto (produção/homologação)
   - [ ] CPF válido
   - [ ] Dados completos

4. **Cadastro**
   - [ ] CPF cadastrado no eSocial
   - [ ] Empregador habilitado
   - [ ] Permissões corretas

### ✅ Durante a Execução

1. **Monitorar Logs**
   - [ ] Verificar erros em tempo real
   - [ ] Acompanhar status dos eventos
   - [ ] Corrigir problemas imediatamente

2. **Validar Resultados**
   - [ ] Confirmar protocolos gerados
   - [ ] Verificar status de processamento
   - [ ] Validar dados enviados

### ✅ Após a Execução

1. **Verificar Status**
   - [ ] Consultar protocolos
   - [ ] Confirmar processamento
   - [ ] Validar cadastros

2. **Monitoramento**
   - [ ] Acompanhar status diariamente
   - [ ] Corrigir rejeições
   - [ ] Reenviar se necessário

## 🔄 Fluxo de Correção de Erros

### 1. Identificar o Problema

- Analisar logs de erro
- Verificar status dos eventos
- Confirmar configurações

### 2. Aplicar Solução

- Corrigir configurações
- Reenviar eventos
- Verificar conectividade

### 3. Validar Correção

- Testar novamente
- Confirmar funcionamento
- Monitorar resultados

### 4. Documentar

- Registrar solução aplicada
- Atualizar documentação
- Compartilhar conhecimento

## 📞 Suporte e Recursos

### Documentação Oficial

- [Portal eSocial](https://www.esocial.gov.br/)
- [Manual do Desenvolvedor](https://www.esocial.gov.br/portal/download/manual)
- [WSDLs Oficiais](https://www.esocial.gov.br/portal/download/wsdl)

### Ferramentas de Diagnóstico

- **Diagnóstico Completo:** `/api/diagnostico-esocial`
- **Teste de Conectividade:** `/api/teste-conectividade`
- **Validação de Endpoints:** `/api/validar-endpoints`

### Contatos de Suporte

- **eSocial:** Suporte via portal oficial
- **SERPRO:** Suporte técnico de certificados
- **Desenvolvedor:** Suporte técnico da aplicação

## 🎯 Melhores Práticas

### 1. Sempre Testar em Homologação Primeiro

- Validar funcionamento
- Corrigir problemas
- Depois migrar para produção

### 2. Manter Logs Detalhados

- Registrar todas as operações
- Facilitar troubleshooting
- Rastrear problemas

### 3. Monitorar Regularmente

- Verificar status diariamente
- Corrigir problemas rapidamente
- Manter sistema atualizado

### 4. Documentar Soluções

- Registrar problemas encontrados
- Documentar soluções aplicadas
- Compartilhar conhecimento

## 🔄 Atualizações e Manutenção

### Atualizações Regulares

- Verificar novos endpoints
- Atualizar certificados
- Revisar configurações

### Manutenção Preventiva

- Monitorar logs de erro
- Verificar conectividade
- Validar certificados

### Backup e Recuperação

- Manter backup de configurações
- Documentar procedimentos
- Testar recuperação
