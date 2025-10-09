# 🔧 Configurar Geolocalização no Chrome

## 🚨 Problema: Chrome Pede Permissão Toda Vez

**Causa:** Chrome configurado em "Perguntar sempre"

**Solução:** Configurar para "Permitir" permanente

---

## 📋 Passo a Passo

### 1️⃣ Configurar Permissão no Chrome

1. Acesse a página (ex: `http://localhost:3000/test-geo-forcado`)
2. Clique no **🔒 cadeado** ao lado da URL
3. Procure por **"Localização"** ou **"Location"**
4. Mude de **"Perguntar (padrão)"** para **"Permitir"**
5. Recarregue a página (F5)

### 2️⃣ Verificar Windows Location Service (Desktop)

**Se precisão continua ruim (>500m):**

1. Abra **Configurações** do Windows
2. Vá em **Privacidade e Segurança**
3. Clique em **Localização**
4. **Ative** "Serviços de localização"
5. **Ative** "Permitir que aplicativos acessem sua localização"
6. Role até "Google Chrome" e **ative**

### 3️⃣ Mobile: Ativar GPS

1. Configurações do celular
2. Localização / GPS
3. **Ativar** GPS
4. No navegador: permitir localização

---

## 🎯 Resultado Esperado

| Dispositivo | Precisão Esperada |
|-------------|-------------------|
| **Mobile (GPS)** | 5-50 metros |
| **Desktop (WiFi)** | 50-200 metros |
| **Desktop (IP)** | 500m-5km ❌ |

---

## 🧪 Testar

Após configurar:

1. Acesse: `http://localhost:3000/test-geo-forcado`
2. Clique em "FORÇAR Alta Precisão"
3. **NÃO** deve pedir permissão (se já permitiu)
4. Aguarde GPS estabilizar (10-30 segundos)
5. Verifique precisão: deve ser ≤ 200m

---

## ❓ Problemas Comuns

### Ainda pede permissão toda vez
- Verifique se configurou no Chrome (passo 1)
- Limpe cache do navegador
- Tente em modo anônimo (para testar)

### Precisão ruim (>500m)
- Desktop: ative Windows Location Service
- Aproxime-se de uma janela (melhora WiFi)
- Mobile: ative GPS nas configurações

### Timeout / Não funciona
- Permissão negada: volte ao passo 1
- Sem GPS/WiFi disponível
- Windows Location Service desligado

---

## 🔍 Referências

- [Geolocation API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Chrome Site Permissions](https://support.google.com/chrome/answer/114662)

