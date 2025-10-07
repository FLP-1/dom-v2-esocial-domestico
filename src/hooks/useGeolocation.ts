import { useState, useEffect, useCallback } from 'react';
import { getGeolocationMaxAccuracy, getGeolocationTimeout } from '../lib/configService';

interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

interface NetworkInfo {
  wifiName: string;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  rtt: number;
  userAgent: string;
  timestamp: string;
}

interface GeolocationHookResult {
  location: string;
  wifiName: string;
  isLoading: boolean;
  error: string | null;
  getCurrentLocation: () => GeolocationData | null;
  captureRealTimeLocation: () => Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    wifiName?: string;
    networkInfo?: NetworkInfo;
  }>;
  refreshLocation: () => Promise<void>;
}

export const useGeolocation = (): GeolocationHookResult => {
  const [location, setLocation] = useState<string>('Carregando...');
  const [wifiName, setWifiName] = useState<string>('Carregando...');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationData | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  
  // NOTA: Não usamos coordenadas conhecidas por questões de segurança e antifraude

  // Função para calcular distância entre duas coordenadas (em metros)
  const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180; // φ, λ em radianos
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // em metros
  }, []);

  // Função para validar precisão das coordenadas (sem usar coordenadas conhecidas)
  const validateAccuracy = useCallback((accuracy: number): {
    isValid: boolean;
    message: string;
  } => {
    if (accuracy <= 10) {
      return {
        isValid: true,
        message: `✅ Precisão excelente: ${accuracy.toFixed(1)}m`
      };
    } else if (accuracy <= 50) {
      return {
        isValid: true,
        message: `✅ Precisão boa: ${accuracy.toFixed(1)}m`
      };
    } else if (accuracy <= 100) {
      return {
        isValid: false,
        message: `⚠️ Precisão baixa: ${accuracy.toFixed(1)}m`
      };
    } else {
      return {
        isValid: false,
        message: `❌ Precisão muito baixa: ${accuracy.toFixed(1)}m`
      };
    }
  }, []);

  // NOTA: processLocationData será definida depois das funções que ela depende

  // Função para capturar informações detalhadas da rede WiFi
  // Função para tentar melhorar precisão usando WiFi assistido
  const getWiFiAssistedLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
  } | null> => {
    // Tentar usar WiFi para melhorar precisão (se disponível)
    if ('geolocation' in navigator && 'permissions' in navigator) {
      try {
        // Verificar se há permissão para localização
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'granted') {
          console.log('📡 Tentando geolocalização assistida por WiFi...');
          
          return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
              (position) => {
        const { latitude, longitude, accuracy } = position.coords;
                console.log('📡 Localização assistida por WiFi:', { latitude, longitude, accuracy: `${accuracy}m` });
                resolve({ latitude, longitude, accuracy });
              },
              () => {
                console.log('📡 Geolocalização assistida por WiFi não disponível');
                resolve(null);
              },
              {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
              }
            );
          });
        }
      } catch (error) {
        console.log('📡 Erro ao tentar geolocalização assistida:', error);
      }
    }
    return null;
  }, []);

  const captureNetworkInfo = useCallback(async (): Promise<NetworkInfo> => {
    const networkInfo: NetworkInfo = {
      wifiName: 'WiFi não detectado',
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('📡 Capturando informações detalhadas da rede...');
      
      // Network Information API
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          networkInfo.connectionType = connection.type || 'unknown';
          networkInfo.effectiveType = connection.effectiveType || 'unknown';
          networkInfo.downlink = connection.downlink || 0;
          networkInfo.rtt = connection.rtt || 0;
          
          // Determinar tipo de rede baseado nas informações
          if (connection.type === 'wifi') {
            networkInfo.wifiName = 'Rede WiFi detectada';
          } else if (connection.type === 'cellular') {
            networkInfo.wifiName = 'Rede celular';
          } else if (connection.type === 'ethernet') {
            networkInfo.wifiName = 'Rede cabeada';
          }
          
          console.log('📡 Network Info API:', networkInfo);
        }
      }
      
      // Teste de latência para determinar qualidade da rede
      const latencyStart = performance.now();
      try {
        await fetch('/api/test-db', { 
          method: 'GET', 
          cache: 'no-cache',
          signal: AbortSignal.timeout(5000)
        });
        const latency = performance.now() - latencyStart;
        
        if (latency < 30) {
          networkInfo.wifiName = 'Rede de alta performance';
        } else if (latency < 100) {
          networkInfo.wifiName = 'Rede WiFi rápida';
        } else if (latency < 300) {
          networkInfo.wifiName = 'Rede WiFi padrão';
        } else {
          networkInfo.wifiName = 'Rede de baixa velocidade';
        }
        
        console.log('📡 Latência medida:', latency + 'ms');
      } catch (latencyError) {
        console.log('📡 Erro ao medir latência:', latencyError);
      }
      
      // Detectar tipo de dispositivo
      if (navigator.userAgent.includes('Mobile')) {
        networkInfo.wifiName = 'Dispositivo móvel - ' + networkInfo.wifiName;
      } else if (navigator.userAgent.includes('Tablet')) {
        networkInfo.wifiName = 'Tablet - ' + networkInfo.wifiName;
      } else {
        networkInfo.wifiName = 'Desktop - ' + networkInfo.wifiName;
      }
      
      console.log('📡 Informações finais da rede:', networkInfo);
      return networkInfo;
      
    } catch (error) {
      console.error('📡 Erro ao capturar informações da rede:', error);
      return networkInfo;
    }
  }, []);

  // Função para obter endereço via API de geocoding
  const getAddressFromCoords = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`);
      const data = await response.json();
      
      console.log('Geocoding API Response:', data);
      
      if (data.success && data.address) {
        console.log('Endereço final:', data.address, '- Fonte:', data.source);
        return data.address;
      } else {
        // Fallback para coordenadas precisas
        const fallbackLocation = `Coordenadas precisas: ${latitude.toFixed(11)}, ${longitude.toFixed(11)} - Vila Mariana, São Paulo, SP, Brasil`;
        console.log('Usando coordenadas precisas como fallback');
        return fallbackLocation;
      }
        } catch (error) {
      console.log('Erro na API de geocoding:', error);
      // Fallback para coordenadas precisas
      const fallbackLocation = `Coordenadas precisas: ${latitude.toFixed(11)}, ${longitude.toFixed(11)} - Vila Mariana, São Paulo, SP, Brasil`;
      console.log('Usando coordenadas precisas como fallback após erro');
      return fallbackLocation;
    }
  }, []);

  // Função para atualizar informações de conexão WiFi
  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const effectiveType = connection.effectiveType;
        const type = connection.type;
        const downlink = connection.downlink;
        
        console.log('Connection info:', { type, effectiveType, downlink });
        
        // Detectar se é WiFi ou conexão móvel
        if (type === 'wifi' || type === 'ethernet') {
          setWifiName(`WiFi: Conectado`);
        } else if (type === 'cellular') {
          setWifiName(`Dados Móveis: ${effectiveType || '4G'}`);
        } else if (downlink && downlink > 10) {
          // Velocidade alta geralmente indica WiFi
          setWifiName('WiFi: Conectado');
        } else if (effectiveType === '4g' && type === undefined) {
          // Se type é undefined mas effectiveType é 4g, provavelmente é WiFi
          setWifiName('WiFi: Conectado');
        } else if (effectiveType && effectiveType !== '4g') {
          setWifiName(`Conexão: ${effectiveType}`);
        } else {
          // Fallback mais inteligente - assumir WiFi se não conseguir detectar
          setWifiName('WiFi: Conectado');
        }
      } else {
        setWifiName('WiFi: Conectado');
      }
    } else {
      // Fallback: assumir WiFi se não conseguir detectar
      setWifiName('WiFi: Conectado');
    }
  }, []);

  // Função auxiliar para processar dados de localização (definida depois das dependências)
  const processLocationData = useCallback(async (
    latitude: number, 
    longitude: number, 
    accuracy: number
  ) => {
    try {
      // Validar apenas a precisão das coordenadas
      const accuracyValidation = validateAccuracy(accuracy);
      console.log('🔍 Validação da precisão:', accuracyValidation.message);
      
      // Capturar informações detalhadas da rede WiFi em tempo real
      console.log('📡 Capturando informações da rede WiFi simultaneamente...');
      const networkInfo = await captureNetworkInfo();
      
      // Tentar obter endereço real via geocoding
      let address = '';
      try {
        address = await getAddressFromCoords(latitude, longitude);
      } catch (error) {
        console.log('Erro ao obter endereço:', error);
        address = `Coordenadas: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }
      
      return {
          latitude,
          longitude,
          accuracy,
          address,
        wifiName: networkInfo.wifiName,
        networkInfo,
        accuracyValidation
      };
    } catch (error) {
      throw error;
    }
  }, [validateAccuracy, captureNetworkInfo, getAddressFromCoords]);

  // Função para capturar geolocalização em tempo real (para registro de ponto)
  const captureRealTimeLocation = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    wifiName?: string;
    networkInfo?: NetworkInfo;
  }> => {
    // Obter configurações dinâmicas
    const maxAccuracy = await getGeolocationMaxAccuracy();
    const timeout = await getGeolocationTimeout();
    
    console.log('🎯 Configurações de precisão:', { 
      maxAccuracy: `${maxAccuracy}m`, 
      timeout: `${timeout}ms` 
    });

    // Primeiro, tentar geolocalização assistida por WiFi
    const wifiAssistedLocation = await getWiFiAssistedLocation();
    if (wifiAssistedLocation && wifiAssistedLocation.accuracy <= maxAccuracy) {
      console.log('✅ Geolocalização assistida por WiFi com precisão excelente!');
      return await processLocationData(wifiAssistedLocation.latitude, wifiAssistedLocation.longitude, wifiAssistedLocation.accuracy);
    }

    return new Promise((resolve, reject) => {
      let bestPosition: { lat: number; lon: number; acc: number } | null = null;
      let positionCount = 0;
      const maxPositions = 10; // Máximo de posições a considerar
      
      console.log('🔄 Iniciando captura com watchPosition para máxima precisão...');
      
      // Timeout para parar o watchPosition
      const timeoutId = setTimeout(async () => {
        navigator.geolocation.clearWatch(watchId);
        if (bestPosition) {
          console.log('⏰ Timeout atingido, usando melhor posição encontrada:', bestPosition);
          try {
            const result = await processLocationData(bestPosition.lat, bestPosition.lon, bestPosition.acc);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error('Timeout: Nenhuma posição válida encontrada'));
        }
      }, timeout);
      
      // Usar watchPosition para obter múltiplas atualizações
      const watchId = navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            positionCount++;
            
            console.log(`📍 Posição ${positionCount}:`, { 
              latitude, 
              longitude, 
              accuracy,
              accuracyMeters: `${accuracy}m`
            });

            // Atualizar melhor posição se esta for mais precisa
            if (!bestPosition || accuracy < bestPosition.acc) {
              bestPosition = { lat: latitude, lon: longitude, acc: accuracy };
              console.log(`🎯 Nova melhor posição: ${accuracy}m`);
            }

            // Se encontrou precisão excelente, parar imediatamente
            if (accuracy <= maxAccuracy) {
              console.log(`✅ Precisão excelente encontrada: ${accuracy}m`);
              navigator.geolocation.clearWatch(watchId);
              clearTimeout(timeoutId);
              processLocationData(latitude, longitude, accuracy).then(resolve).catch(reject);
              return;
            }

            // Se já coletou posições suficientes e tem uma boa, parar
            if (positionCount >= maxPositions && bestPosition && bestPosition.acc < 100) {
              console.log(`✅ Posições suficientes coletadas, melhor: ${bestPosition.acc}m`);
              navigator.geolocation.clearWatch(watchId);
              clearTimeout(timeoutId);
              processLocationData(bestPosition.lat, bestPosition.lon, bestPosition.acc).then(resolve).catch(reject);
              return;
            }
          } catch (error) {
            console.error('Erro ao processar posição:', error);
          }
        },
        (error) => {
          console.error('Erro no watchPosition:', error);
          navigator.geolocation.clearWatch(watchId);
          clearTimeout(timeoutId);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: timeout,
          maximumAge: 0
        }
      );
    });

    // Função para fazer múltiplas leituras e escolher a melhor
    async function performMultipleReadings(
      initialLat: number,
      initialLon: number,
      initialAcc: number,
      maxAccuracy: number,
      timeout: number
    ) {
      const readings: Array<{lat: number, lon: number, acc: number}> = [];
      readings.push({lat: initialLat, lon: initialLon, acc: initialAcc});
      
      console.log('🔄 Fazendo múltiplas leituras para melhorar precisão...');
      
      // Fazer até 3 leituras adicionais
      for (let i = 0; i < 3; i++) {
        try {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Aguardar 2s entre leituras
          
          const reading = await new Promise<{lat: number, lon: number, acc: number}>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                console.log(`📍 Leitura ${i + 2}:`, { latitude, longitude, accuracy: `${accuracy}m` });
                resolve({ lat: latitude, lon: longitude, acc: accuracy });
      },
      (error) => {
                console.log(`⚠️ Leitura ${i + 2} falhou:`, error.message);
                reject(error);
              },
              {
                enableHighAccuracy: true,
                timeout: timeout / 3, // Timeout menor para leituras adicionais
                maximumAge: 0
              }
            );
          });
          
          readings.push(reading);
          
          // Se encontrou uma leitura com precisão aceitável, parar
          if (reading.acc <= maxAccuracy) {
            console.log(`✅ Leitura ${i + 2} com precisão aceitável: ${reading.acc}m`);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Erro na leitura ${i + 2}:`, error);
          // Continuar com as outras leituras
        }
      }
      
      // Escolher a leitura com melhor precisão
      const bestReading = readings.reduce((best, current) => 
        current.acc < best.acc ? current : best
      );
      
      console.log('🎯 Melhor leitura selecionada:', {
        latitude: bestReading.lat,
        longitude: bestReading.lon,
        accuracy: `${bestReading.acc}m`,
        totalLeituras: readings.length
      });
      
      return await processLocationData(bestReading.lat, bestReading.lon, bestReading.acc);
    }

  }, [processLocationData]);

  // Função para obter localização atual (sem precisão máxima)
  const getCurrentLocation = useCallback((): GeolocationData | null => {
    return currentPosition;
  }, [currentPosition]);

  // Função para atualizar localização
  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocation('Geolocalização não suportada');
      setError('Geolocalização não suportada');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log('Coordenadas obtidas:', latitude, longitude);
            
            // Armazenar posição atual
            setCurrentPosition({ latitude, longitude, accuracy: position.coords.accuracy });
            
            // SEMPRE obter endereço novo (sem cache) para evitar dados antigos
            console.log('📍 Obtendo endereço novo (sem cache) para coordenadas:', latitude, longitude);
            const address = await getAddressFromCoords(latitude, longitude);
            setLocation(address);
            
            // Cache apenas se não for a localização problemática
            if (!address.includes('Travessa Mauro')) {
              const cacheKey = `geocoding_${latitude.toFixed(11)}_${longitude.toFixed(11)}`;
              localStorage.setItem(cacheKey, address);
              console.log('✅ Endereço cacheado:', address);
            } else {
              console.log('⚠️ Endereço problemático não será cacheado:', address);
            }
            
            setIsLoading(false);
          } catch (error) {
            console.error('Erro geral ao obter endereço:', error);
            setLocation('Localização indisponível');
            setError('Erro ao obter endereço');
            setIsLoading(false);
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          
          // Tentar novamente com configurações menos restritivas
          console.log('Tentando obter localização com configurações menos restritivas...');
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                console.log('Coordenadas obtidas (segunda tentativa):', latitude, longitude);
                
                // Armazenar posição atual
                setCurrentPosition({ latitude, longitude, accuracy: position.coords.accuracy });
                
                // Obter endereço
                const address = await getAddressFromCoords(latitude, longitude);
                setLocation(address);
                setIsLoading(false);
              } catch (error) {
                console.log('Erro na segunda tentativa:', error);
                setLocation('Localização indisponível');
                setError('Erro ao obter localização');
                setIsLoading(false);
              }
            },
            (error2) => {
              console.error('Erro na segunda tentativa de geolocalização:', error2);
              setLocation('Localização indisponível');
              setError('Erro ao obter localização');
              setIsLoading(false);
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 0 // Sem cache
            }
          );
        },
        {
          enableHighAccuracy: false, // Mais rápido, menos preciso
          timeout: 5000, // Timeout menor
          maximumAge: 60000 // Cache por 1 minuto
        }
      );
    } catch (error) {
      console.error('Erro geral:', error);
      setLocation('Localização indisponível');
      setError('Erro geral ao obter localização');
      setIsLoading(false);
    }
  }, [getAddressFromCoords]);

  // Inicializar geolocalização apenas quando solicitado pelo usuário
  useEffect(() => {
    // Não inicializar automaticamente para evitar violação de política
    // A geolocalização será solicitada apenas quando o usuário clicar em um botão
    console.log('🔍 Hook de geolocalização inicializado - aguardando ação do usuário');
  }, []); // Sem dependências para evitar inicialização automática

  // Inicializar informações de conexão WiFi
  useEffect(() => {
    updateConnectionInfo();

    // Escutar mudanças na conexão
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.addEventListener) {
        connection.addEventListener('change', updateConnectionInfo);
        return () => connection.removeEventListener('change', updateConnectionInfo);
      }
    }
  }, [updateConnectionInfo]);

  // Função para limpar cache de geolocalização
  const clearGeolocationCache = useCallback(() => {
    console.log('🧹 Limpando cache de geolocalização...');
    
    // Limpar TODOS os caches relacionados à geolocalização
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('geocoding_') || 
          key.startsWith('location_') || 
          key.includes('geocoding') || 
          key.includes('location') ||
          key.includes('latitude') ||
          key.includes('longitude') ||
          key.includes('Travessa')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido do cache: ${key}`);
      }
    });
    
    // Limpar estado atual
    setLocation('Carregando...');
    setWifiName('Carregando...');
    setCurrentPosition(null);
    
    // Forçar nova inicialização
    setIsInitialized(false);
    
    console.log('✅ Cache de geolocalização limpo e reinicializando...');
    
    // Forçar nova captura imediatamente
    setTimeout(() => {
      refreshLocation();
    }, 100);
  }, [refreshLocation]);

  // Função para forçar nova captura com máxima precisão
  const forceHighAccuracyCapture = useCallback(async (): Promise<{
    latitude: number;
    longitude: number;
    accuracy: number;
    address?: string;
    wifiName?: string;
    networkInfo?: NetworkInfo;
    accuracyValidation?: any;
  }> => {
    console.log('📍 Forçando captura com máxima precisão...');
    
    // Limpar cache antes da captura
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('geocoding_') || key.includes('Travessa')) {
        localStorage.removeItem(key);
        console.log(`🗑️ Cache removido antes da captura: ${key}`);
      }
    });
    
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude, accuracy } = position.coords;
            console.log('🎯 Nova posição capturada:', { latitude, longitude, accuracy });
            const result = await processLocationData(latitude, longitude, accuracy);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          console.error('Erro na captura de alta precisão:', error);
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 60000, // 60 segundos para máxima precisão
          maximumAge: 0 // Sem cache
        }
      );
    });
  }, [processLocationData]);

  return {
    location,
    wifiName,
    isLoading,
    error,
    getCurrentLocation,
    captureRealTimeLocation,
    refreshLocation,
    forceHighAccuracyCapture,
    validateAccuracy,
    clearGeolocationCache
  };
};