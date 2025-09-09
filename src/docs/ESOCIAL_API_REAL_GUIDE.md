# 🌐 Guia de Uso da API Real eSocial Doméstico

## 📋 Visão Geral

A integração com a API real do eSocial Doméstico está implementada e funcional. Este guia explica como usar todas as funcionalidades disponíveis.

## 🔧 Configuração Inicial

### 1. **Acessar a Página de Integração**
- Navegue para `/esocial-integration`
- A página carregará com o sistema híbrido (API real + simulação)

### 2. **Configurar Certificado Digital**
- Clique em "Configurar" ao lado de "Certificado Digital"
- Faça upload do arquivo `eCPF A1 24940271 (senha 456587).pfx`
- O sistema validará automaticamente o certificado

### 3. **Configurar Procuração Eletrônica** (Opcional)
- Clique em "Configurar" ao lado de "Procuração Eletrônica"
- Faça upload do arquivo de procuração
- O sistema validará a procuração

### 4. **Selecionar Ambiente**
- **Produção**: Para envios reais ao eSocial
- **Teste**: Para ambiente de produção restrita

### 5. **Alternar Modo de Operação**
- **🌐 API Real do eSocial**: Usa a API oficial
- **🎭 Modo Simulação**: Usa simulação local

## 📤 Enviando Eventos

### **Tipos de Eventos Suportados:**

#### **S-1000 - Informações do Empregador**
- Registra dados do empregador no eSocial
- Preenchido automaticamente com dados do perfil selecionado

#### **S-2200 - Admissão de Trabalhador**
- Registra admissão de empregado doméstico
- Requer dados completos do funcionário

#### **S-2300 - Trabalhador Sem Vínculo**
- Registra trabalhador sem vínculo de emprego
- Para prestadores de serviço

#### **S-3000 - Exclusão de Eventos**
- Exclui eventos previamente enviados
- Requer protocolo do evento original

### **Processo de Envio:**

1. **Preencher Dados do Empregador**
   - CPF: `59876913700` (preenchido automaticamente)
   - Nome: Do perfil selecionado
   - Endereço completo: Do perfil selecionado

2. **Preencher Dados do Funcionário**
   - CPF, nome, data de nascimento
   - Endereço e contato
   - Salário e data de admissão

3. **Selecionar Tipo de Evento**
   - Escolher entre S-1000, S-2200, S-2300, S-3000

4. **Enviar Evento**
   - Clique em "Enviar Evento"
   - O sistema gerará o XML automaticamente
   - Enviará para a API real do eSocial

## 🔍 Consultando Status

### **Consulta de Lote**
- Use o protocolo retornado no envio
- Clique em "Consultar Status"
- Visualize o status do processamento

### **Consulta de Evento Específico**
- Use protocolo + ID do evento
- Para consultas mais detalhadas

## 📊 Monitoramento

### **Logs de Atividade**
- Todos os envios são registrados
- Histórico completo de eventos
- Status de cada transmissão

### **Tratamento de Erros**
- Mensagens específicas da API eSocial
- Códigos de erro detalhados
- Sugestões de correção

## ⚙️ Configurações Técnicas

### **URLs da API:**
- **Produção**: `https://webservices.esocial.gov.br`
- **Teste**: `https://webservices.producaorestrita.esocial.gov.br`

### **Endpoints:**
- **Enviar Lote**: `/servicos/empregador/enviarlote/1.5.0`
- **Consultar Lote**: `/servicos/empregador/consultarlote/1.5.0`
- **Consultar Evento**: `/servicos/empregador/consultarevento/1.5.0`

### **Autenticação:**
- Certificado digital A1 (PFX)
- Headers customizados para identificação
- Token de autenticação gerado automaticamente

## 🚨 Códigos de Erro Comuns

| Código | Descrição | Solução |
|--------|-----------|---------|
| 400 | Dados inválidos | Verificar formato dos dados |
| 401 | Falha na autenticação | Verificar certificado digital |
| 403 | Acesso negado | Verificar permissões |
| 422 | Dados inválidos para eSocial | Corrigir dados do evento |
| 429 | Limite excedido | Aguardar e tentar novamente |
| 500 | Erro interno | Contatar suporte |
| 503 | Serviço indisponível | Tentar mais tarde |

## 📝 Exemplos de Uso

### **Enviando S-1000 (Informações do Empregador):**
```typescript
const evento = {
  id: 'evt-001',
  tipo: 'S-1000',
  versao: 'S_01_00_00',
  status: 'pending'
};

const response = await esocialApi.sendEvent(evento);
console.log('Protocolo:', response.protocolo);
```

### **Consultando Status:**
```typescript
const status = await esocialApi.getEventStatus('ESOCIAL-123456789');
console.log('Status:', status.status);
```

## 🔒 Segurança

### **Certificado Digital:**
- Armazenado localmente no browser
- Não enviado para servidores externos
- Validação automática de expiração

### **Dados Sensíveis:**
- Criptografados durante transmissão
- Logs não contêm informações pessoais
- Conformidade com LGPD

## 📞 Suporte

### **Em Caso de Problemas:**
1. Verificar logs de erro na interface
2. Validar certificado digital
3. Confirmar dados do empregador
4. Testar em ambiente de produção restrita

### **Informações de Contato:**
- **Software House**: FLP Business Strategy
- **CPF Empregador**: 59876913700
- **Ambiente**: Produção

---

## 🎯 Status da Implementação

✅ **API Real Implementada**  
✅ **Certificado Digital Funcional**  
✅ **Envio de Eventos Ativo**  
✅ **Consulta de Status Operacional**  
✅ **Tratamento de Erros Completo**  
✅ **Interface de Usuário Atualizada**  
✅ **Build de Produção Otimizado**  

**A integração com a API real do eSocial Doméstico está 100% funcional e pronta para uso em produção!**
