# 🎯 Configuração: Google Maps Geocoding API

## Por Que Usar Google Maps?

**Problema identificado:**
- ✅ **Coordenadas corretas** (Nominatim funciona bem)
- ❌ **Endereços de baixa qualidade** (Nominatim tem limitações)
- ❌ **Dados desatualizados** (Nominatim é open source, menos atualizado)

**Solução:**
- ✅ **Google Maps tem banco de dados MASSIVO e atualizado**
- ✅ **Endereços precisos e formatados consistentemente**
- ✅ **Melhor cobertura global**
- ✅ **Suporte nativo ao português brasileiro**

---

## 💰 Custo

| Item | Valor |
|------|-------|
| **Preço por requisição** | $5 por 1000 requisições |
| **Grátis por mês** | 500 requisições |
| **Custo para 1000 funcionários/mês** | ~$5-10 USD |

**Exemplo prático:**
- 50 empregados × 2 registros/dia × 22 dias = 2.200 requisições/mês
- Custo: ~$11 USD/mês
- Benefício: **Anti-fraude confiável com endereços precisos**

---

## 🔧 Configuração (Passo a Passo)

### 1️⃣ Criar Projeto no Google Cloud

1. Acesse: https://console.cloud.google.com/
2. Clique em "Selecionar projeto" → "Novo projeto"
3. Nome: "DOM-Geocoding"
4. Clique "Criar"

### 2️⃣ Ativar APIs Necessárias

**Geocoding API:**
1. Menu lateral → "APIs e serviços" → "Biblioteca"
2. Busque: "Geocoding API"
3. Clique em "Geocoding API"
4. Clique "Ativar"

**Maps JavaScript API (opcional, para mapas):**
1. Busque: "Maps JavaScript API"
2. Clique "Ativar"

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
- Marque APENAS: "Geocoding API"

### 5️⃣ Configurar no Projeto

**Adicionar ao `.env.local`:**

```bash
# Google Maps Geocoding API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=SuaChaveAqui
```

**Exemplo:**
```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstu
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
   🌐 Tentando Google Maps Geocoding API...
   ✅ Google Geocoding respondeu: {...}
   ```
5. Verificar campo `source: 'google_maps'` na resposta

---

## 🔄 Como Funciona Agora

**Sistema híbrido inteligente:**

1. **Se Google Maps API key configurada:**
   - ✅ Usa Google Maps (melhor qualidade)
   - ✅ Endereços precisos e atualizados
   - ✅ Formatação consistente

2. **Se Google Maps falhar ou não configurado:**
   - ✅ Fallback para Nominatim (gratuito)
   - ✅ Mantém funcionalidade básica

3. **Se tudo falhar:**
   - ✅ Mostra coordenadas como fallback

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
3. Selecione "Geocoding API"
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
1. **Se API key configurada** → Usa Google Maps (melhor qualidade)
2. **Se não configurada** → Usa Nominatim (gratuito)
3. **Se tudo falhar** → Mostra coordenadas

**Vantagem:**
- Desenvolvimento: Grátis (Nominatim)
- Produção: Preciso (Google Maps)
- Sempre funciona (fallbacks)

---

## ❓ FAQ

**P: E se exceder limite grátis?**
R: Google cobra automaticamente. Configure alerta de custo.

**P: Funciona em mobile?**
R: Sim, funciona em qualquer navegador.

**P: Preciso de cartão de crédito?**
R: Sim, mas só cobra se exceder 500 req/mês.

**P: Posso desativar depois?**
R: Sim, basta remover `.env.local` e volta para Nominatim.

**P: Qual a diferença para o Nominatim?**
R: Google tem banco de dados MASSIVO e atualizado, Nominatim é open source com dados limitados.

**P: E se Google Maps falhar?**
R: Sistema automaticamente usa Nominatim como fallback.

---

## 📝 Checklist de Configuração

- [ ] Criar projeto no Google Cloud
- [ ] Ativar Geocoding API
- [ ] Criar e copiar API key
- [ ] Restringir API key (domínios + API específica)
- [ ] Adicionar key ao `.env.local`
- [ ] Reiniciar servidor
- [ ] Testar e verificar qualidade dos endereços
- [ ] Configurar alerta de custo

---

**Status:** Pronto para uso  
**Qualidade esperada:** Endereços precisos e atualizados  
**Custo estimado:** $5-15/mês para pequenas empresas  
**Fallback:** Nominatim (gratuito)
