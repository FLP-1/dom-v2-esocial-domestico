# Prompt para Análise de Geolocalização - Sistema DOM

## 📋 Contexto Geral

Sistema web de controle de ponto (time-clock) desenvolvido em **Next.js 15.5.2** + **TypeScript** + **React** + **Prisma ORM**.

**Objetivo:** Capturar geolocalização APENAS ao registrar ponto (captura manual, não automática), com precisão adequada para validação de presença.

---

## 🚨 Problema Atual

### 1. **Precisão Ruim (968 metros)**
- **Esperado:** 15-20 metros (funcionava antes)
- **Atual:** ~1km (968m) em desktop
- **Contexto:** Google Maps funciona com precisão boa no mesmo hardware

### 2. **Popup de Permissão Aparece Indevidamente**
- **Esperado:** Popup SÓ ao clicar em card de registro de ponto
- **Atual:** Popup aparece (possivelmente ao carregar página?)
- **Contexto:** Captura deve ser 100% manual, não automática

### 3. **Possível Confusão: WiFi SSID vs Geolocalização GPS**
- **WiFi SSID:** Nome da rede (`navigator.connection`) - sem permissão
- **Geolocalização:** Coordenadas GPS (`navigator.geolocation`) - requer permissão
- **Suspeita:** Código pode estar misturando as duas

---

## 🏗️ Arquitetura Implementada

### Arquivos Principais

1. **`src/hooks/useGeolocation.ts` (245 linhas)**
   - Hook principal de geolocalização
   - `useEffect` vazio (não chama nada automaticamente)
   - Expõe: `captureRealTimeLocation()`, `refreshLocation()`, `getCurrentLocation()`

2. **`src/hooks/useGeolocationCapture.ts` (154 linhas)**
   - Wrapper para ações críticas
   - Estratégia:
     - **Mobile:** Chama `captureRealTimeLocation()` direto
     - **Desktop:** `Promise.race` com timeout 3s, se falhar → `locationData = null`
   - Usado por `TimeRecordCard` e `UnifiedButton`

3. **`src/components/TimeRecordCard/index.tsx`**
   - Usa `useGeolocationCapture`
   - Captura geolocalização ao clicar no card
   - Handler: `createCriticalButtonHandler(onClick, actionName)`

4. **`src/components/WelcomeSection/index.tsx`**
   - **NÃO usa** `useGeolocation`
   - Usa apenas detecção de WiFi local (sem GPS)
   - `const [wifiName, setWifiName] = useState<string>('WiFi não detectado');`

5. **`src/pages/login.tsx`**
   - `locationData = null` (sem geolocalização no login)

---

## 🔧 Implementação Técnica

### useGeolocation.ts - Função de Captura

```typescript
const captureRealTimeLocation = useCallback(async (): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  wifiName?: string;
  networkInfo?: NetworkInfo;
}> => {
  const maxAccuracy = await getGeolocationMaxAccuracy();
  const timeout = await getGeolocationTimeout();
  
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalizacao nao suportada pelo navegador'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const [address, networkInfo] = await Promise.all([
            getAddressFromCoords(latitude, longitude),
            captureNetworkInfo()
          ]);

          resolve({
            latitude,
            longitude,
            accuracy,
            address,
            wifiName: networkInfo.wifiName,
            networkInfo
          });
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        reject(new Error(`Erro de geolocalizacao: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: timeout,
        maximumAge: 0
      }
    );
  });
}, [getAddressFromCoords, captureNetworkInfo]);
```

**Configuração:**
- `enableHighAccuracy: true`
- `timeout: await getGeolocationTimeout()` (configurável via banco)
- `maximumAge: 0` (sem cache)

### useGeolocationCapture.ts - Estratégia Mobile/Desktop

```typescript
let locationData;
if (isMobile) {
  // Mobile: GPS nativo, captura rápida e precisa
  locationData = await captureRealTimeLocation();
} else {
  // Desktop: Tentar captura rápida, fallback se demorar
  try {
    locationData = await Promise.race([
      captureRealTimeLocation(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout rápido para desktop')), 3000)
      )
    ]);
  } catch (error) {
    logger.warn('⚠️ Desktop: Captura rápida falhou, continuando sem geolocalização');
    locationData = null;
  }
}
```

### useEffect - Inicialização

```typescript
useEffect(() => {
  // Geolocalizacao pronta - aguardando acao manual do usuario
}, []);

useEffect(() => {
  updateConnectionInfo(); // Apenas navigator.connection, SEM geolocalização

  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.addEventListener) {
      connection.addEventListener('change', updateConnectionInfo);
      return () => connection.removeEventListener('change', updateConnectionInfo);
    }
  }
}, [updateConnectionInfo]);
```

---

## 📊 Resultados Obtidos

### Teste Realizado
- **Dispositivo:** Desktop Windows
- **Navegador:** Chrome
- **WiFi:** Conectado
- **Resultado:** 968.4 metros de precisão

### Comportamento Observado
1. Popup de permissão aparece (possivelmente ao carregar página)
2. Precisão muito ruim (~1km)
3. Sistema funciona, mas localização imprecisa

---

## 📚 Documentação Existente

### 1. DECISAO_GEOLOCALIZACAO_MANUAL.md
- Define que geolocalização é **manual** (só ao clicar)
- WelcomeSection: WiFi SSID sem GPS
- Login: sem geolocalização (`locationData = null`)
- TimeRecordCard: captura ao clicar

### 2. LIMITACOES_TECNICAS_GEOLOCALIZACAO.md
- Documento criado por assistente anterior
- Afirma que 968m é "adequado" (questionável)
- Justifica imprecisão em desktop por falta de GPS

---

## ❓ Perguntas para Análise

### 1. **Precisão Ruim**
- Por que 968m se antes tinha 15-20m?
- Google Maps funciona bem - o que eles fazem diferente?
- `enableHighAccuracy: true` está sendo respeitado?
- Há algum problema com `getCurrentPosition` vs `watchPosition`?

### 2. **Popup de Permissão**
- Por que popup aparece se `useEffect` está vazio?
- Há alguma captura automática escondida?
- `captureNetworkInfo()` ou `updateConnectionInfo()` chamam geolocalização?
- Algum componente instanciado automaticamente está acionando?

### 3. **WiFi vs Geolocalização**
- `captureNetworkInfo()` usa `navigator.connection` ou `navigator.geolocation`?
- Há confusão entre SSID (sem permissão) e GPS (com permissão)?
- `networkInfo.wifiName` vem de onde?

### 4. **Estratégia Desktop**
- Timeout de 3s é adequado?
- `getCurrentPosition` única tentativa é suficiente?
- Deveria usar `watchPosition` para aguardar estabilização?
- Diferença entre WiFi triangulation e localização por IP?

---

## 🎯 Objetivo da Análise

1. **Identificar** por que precisão caiu de 15-20m para 968m
2. **Identificar** onde está a captura automática (popup indevido)
3. **Propor solução** que funcione independente de configurações do usuário
4. **Garantir** captura 100% manual (só ao clicar)
5. **Melhorar precisão** para níveis aceitáveis (<100m ideal)

---

## 🛠️ Tecnologias

- **Framework:** Next.js 15.5.2
- **Linguagem:** TypeScript
- **UI:** React + styled-components
- **ORM:** Prisma
- **API:** Geolocation API (browser nativo)
- **Reverse Geocoding:** OpenStreetMap Nominatim

---

## 📝 Notas Importantes

1. **Solução anterior funcionava:** 15-20m de precisão (código foi modificado depois)
2. **Google Maps funciona:** Mesmo hardware/navegador tem precisão boa
3. **Não pode depender de configurações:** Chrome, Windows Location Service, etc.
4. **Captura manual:** Popup SÓ ao clicar, nunca ao carregar
5. **Sistema deve funcionar:** Mesmo sem geolocalização (locationData = null)

---

## 🔍 Análise Solicitada

Por favor, analise:

1. **Código atual** está correto conforme documentação?
2. **Por que precisão ruim** (968m vs 15-20m antes)?
3. **Onde está captura automática** (popup indevido)?
4. **Confusão WiFi/GPS?** `captureNetworkInfo` vs `captureRealTimeLocation`
5. **Solução** para melhorar precisão sem depender de config do usuário
6. **getCurrentPosition vs watchPosition:** Qual usar e por quê?

---

## 📂 Arquivos para Análise

Se necessário, solicite leitura de:
- `src/hooks/useGeolocation.ts`
- `src/hooks/useGeolocationCapture.ts`
- `src/components/TimeRecordCard/index.tsx`
- `src/components/WelcomeSection/index.tsx`
- `src/pages/login.tsx`
- `DECISAO_GEOLOCALIZACAO_MANUAL.md`

---

**Data:** 08/10/2025  
**Ambiente:** Produção (Windows Desktop + Chrome)  
**Prioridade:** Alta (funcionalidade crítica para anti-fraude)

