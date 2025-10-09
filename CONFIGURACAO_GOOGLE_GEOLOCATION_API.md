# 🎯 Configuração: Google Geolocation API

## Por Que Usar?

**Problema:**
- Navegador: 100-500m de precisão ❌
- Google Maps: 10-50m de precisão ✅

**Solução:**
- Usar a MESMA API que Google Maps usa
- Precisão profissional: 10-50m
- Ideal para anti-fraude de registro de ponto

---

## 💰 Custo

| Item | Valor |
|------|-------|
| **Preço por requisição** | $0.005 (meio centavo) |
| **Grátis por mês** | 500 requisições |
| **Custo para 1000 funcionários/mês** | ~$5-10 USD |

**Exemplo:**
- 50 empregados × 2 registros/dia × 22 dias = 2.200 requisições/mês
- Custo: ~$11 USD/mês
- Benefício: Anti-fraude confiável

---

## 🔧 Configuração (Passo a Passo)

### 1️⃣ Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Nome: "DOM-Geolocation"
4. Clique "Criar"

### 2️⃣ Ativar API

1. No menu lateral → "APIs e serviços" → "Biblioteca"
2. Busque: "Geolocation API"
3. Clique em "Geolocation API"
4. Clique "Ativar"

### 3️⃣ Criar API Key

1. Menu lateral → "APIs e serviços" → "Credenciais"
2. Clique "+ Criar credenciais" → "Chave de API"
3. Copie a chave gerada
4. **IMPORTANTE**: Clique em "Restringir chave"

### 4️⃣ Restringir API Key (Segurança)

**Restrições de aplicativo:**
- Selecione "Referenciadores HTTP (sites)"
- Adicione:
  - `http://localhost:3000/*`
  - `http://localhost/*`
  - `https://seudominio.com.br/*` (quando em produção)

**Restrições de API:**
- Selecione "Restringir chave"
- Marque APENAS: "Geolocation API"

### 5️⃣ Configurar no Projeto

**Adicionar ao `.env.local`:**

```bash
# Google Geolocation API
NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY=SuaChaveAqui
```

**Exemplo:**
```bash
NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstu
```

### 6️⃣ Reiniciar Servidor

```powershell
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

---

## 🧪 Testar

1. Acesse: `http://localhost:3000/test-geolocation`
2. Abra console (F12)
3. Clique "Testar Geolocalização"
4. Console deve mostrar:
   ```
   🎯 Google Geolocation API disponível - usando para máxima precisão
   ✅ Google API retornou: {...}
   ```
5. Precisão esperada: **10-50 metros** ✅

---

## 🔒 Segurança

**✅ Fazer:**
- Restringir API key a domínios específicos
- Usar HTTPS em produção
- Monitorar uso no Google Cloud Console
- Configurar alertas de custo

**❌ NÃO fazer:**
- Commit da API key no GitHub (já está no .gitignore)
- Usar mesma key em múltiplos projetos
- Deixar sem restrições

---

## 📊 Monitoramento

**Ver uso e custos:**
1. Google Cloud Console
2. Menu → "APIs e serviços" → "Painel"
3. Selecione "Geolocation API"
4. Veja gráficos de:
   - Requisições por dia
   - Custo estimado
   - Erros

**Configurar alerta:**
1. Menu → "Faturamento" → "Orçamentos e alertas"
2. Criar orçamento: Ex: $50/mês
3. Alerta quando atingir: 80% ($40)

---

## 🚀 Modo Híbrido (Recomendado)

**Como funciona:**
1. **Se API key configurada** → Usa Google API (10-50m)
2. **Se não configurada** → Usa navegador (100-500m)

**Vantagem:**
- Desenvolvimento: Grátis (navegador)
- Produção: Preciso (Google API)

---

## ❓ FAQ

**P: E se exceder limite grátis?**
R: Google cobra automaticamente. Configure alerta de custo.

**P: Funciona em mobile?**
R: Sim, funciona em qualquer navegador.

**P: Preciso de cartão de crédito?**
R: Sim, mas só cobra se exceder 500 req/mês.

**P: Posso desativar depois?**
R: Sim, basta remover `.env.local` e volta para navegador.

**P: Qual a diferença para o navegador?**
R: Google tem banco de dados MASSIVO de WiFi APs e cell towers.

---

## 📝 Checklist de Configuração

- [ ] Criar projeto no Google Cloud
- [ ] Ativar Geolocation API
- [ ] Criar e copiar API key
- [ ] Restringir API key (domínios + API específica)
- [ ] Adicionar key ao `.env.local`
- [ ] Reiniciar servidor
- [ ] Testar e verificar precisão
- [ ] Configurar alerta de custo

---

**Status:** Pronto para uso  
**Precisão esperada:** 10-50 metros  
**Custo estimado:** $5-15/mês para pequenas empresas

