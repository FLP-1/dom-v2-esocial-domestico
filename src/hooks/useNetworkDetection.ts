import { useState, useEffect, useCallback } from 'react';

interface NetworkInfo {
  wifiName: string;
  connectionType: string;
  effectiveType: string;
  downlink: number;
  isOnline: boolean;
  // ✅ SSID real capturado do sistema operacional
  realSSID?: string;
  ssidPlatform?: string;
  ssidLoading?: boolean;
  ssidError?: string | null;
}

interface UseNetworkDetectionOptions {
  enableLogging?: boolean;
  updateInterval?: number; // em milissegundos
  enableRealSSID?: boolean; // ✅ Capturar SSID real do sistema operacional
}

export const useNetworkDetection = (options: UseNetworkDetectionOptions = {}) => {
  const { enableLogging = false, updateInterval = 5000, enableRealSSID = false } = options;
  
  // ✅ Proteções robustas para evitar travamentos
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [consecutiveErrors, setConsecutiveErrors] = useState(0);
  
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    wifiName: 'WiFi não detectado',
    connectionType: 'unknown',
    effectiveType: 'unknown',
    downlink: 0,
    isOnline: true,
    // ✅ Inicializar campos do SSID real
    realSSID: undefined,
    ssidPlatform: undefined,
    ssidLoading: false,
    ssidError: null
  });

  const detectNetworkInfo = useCallback((): NetworkInfo => {
    try {
      // APIs do navegador só devem ser usadas no cliente
      if (typeof window === 'undefined') {
        return {
          wifiName: 'WiFi não detectado',
          connectionType: 'unknown',
          effectiveType: 'unknown',
          downlink: 0,
          isOnline: true,
          realSSID: undefined,
          ssidPlatform: undefined,
          ssidLoading: false,
          ssidError: null
        };
      }

      const isOnline = navigator.onLine;
      let wifiName = 'WiFi não detectado';
      let connectionType = 'unknown';
      let effectiveType = 'unknown';
      let downlink = 0;

      // Detectar informações de rede via navigator.connection
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        
        if (connection) {
          connectionType = connection.type || 'unknown';
          effectiveType = connection.effectiveType || 'unknown';
          downlink = connection.downlink || 0;

          if (connection.type !== 'none' && isOnline) {
            // Detectar tipo de conexão e gerar nome apropriado
            if (connectionType === 'wifi' || connectionType === 'ethernet') {
              if (connection.downlink && connection.effectiveType) {
                wifiName = `WiFi: ${connection.effectiveType} (${connection.downlink}Mbps)`;
              } else if (connection.effectiveType) {
                wifiName = `WiFi: ${connection.effectiveType}`;
              } else {
                wifiName = 'WiFi: Conectado';
              }
            } else if (connectionType === 'cellular') {
              wifiName = `Dados Móveis: ${connection.effectiveType || '4G'}`;
            } else if (connection.downlink && connection.downlink > 10) {
            // Conexão rápida provavelmente é WiFi
            wifiName = `WiFi: ${connection.effectiveType || 'Conexão Rápida'} (${connection.downlink}Mbps)`;
          } else if (connection.effectiveType) {
            // Tentar determinar se é WiFi baseado na velocidade
            if (connection.effectiveType.includes('4g') || connection.downlink > 5) {
              wifiName = `WiFi: ${connection.effectiveType}`;
            } else {
              wifiName = `Conexão: ${connection.effectiveType}`;
            }
          } else {
            // Fallback inteligente baseado na velocidade
            if (connection.downlink && connection.downlink > 5) {
              wifiName = 'WiFi: Conectado';
            } else {
              wifiName = 'WiFi: Conectado';
            }
          }
          }
        }
      }

      // Fallbacks inteligentes
      if (wifiName === 'WiFi não detectado' && isOnline) {
        if ('RTCPeerConnection' in window) {
          wifiName = 'WiFi: Conectado (WebRTC)';
        } else {
          wifiName = 'WiFi: Conectado';
        }
      }

      // ✅ Tentar melhorar detecção de nome da rede
      if (wifiName === 'WiFi: Conectado' && connectionType === 'wifi') {
        // Se sabemos que é WiFi, tentar obter mais informações
        if (effectiveType && effectiveType !== 'unknown') {
          wifiName = `WiFi: ${effectiveType}`;
        }
        
        // Tentar usar informações de velocidade para inferir tipo de rede
        if (downlink > 0) {
          if (downlink > 50) {
            wifiName = `WiFi: Rede Rápida (${downlink}Mbps)`;
          } else if (downlink > 10) {
            wifiName = `WiFi: Rede Padrão (${downlink}Mbps)`;
          } else {
            wifiName = `WiFi: Rede Básica (${downlink}Mbps)`;
          }
        }
      }

      // ✅ Tentar detectar nome real da rede WiFi usando APIs avançadas
      if (wifiName.includes('WiFi:') && connectionType === 'wifi') {
        try {
          // Tentar usar WebRTC para detectar informações de rede local
          if ('RTCPeerConnection' in window) {
            const pc = new RTCPeerConnection({
              iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });
            
            pc.createDataChannel('');
            pc.createOffer().then(offer => {
              pc.setLocalDescription(offer);
            });
            
            // Tentar extrair informações da conexão
            setTimeout(() => {
              pc.close();
            }, 1000);
          }
          
          // Tentar usar outras APIs se disponíveis
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            if (conn && conn.type === 'wifi') {
              // Se é WiFi, tentar obter mais detalhes
              if (conn.effectiveType && conn.downlink) {
                wifiName = `WiFi: ${conn.effectiveType} (${conn.downlink}Mbps)`;
              } else {
                wifiName = 'WiFi: Rede Detectada';
              }
            }
          }
        } catch (error) {
          // Manter fallback padrão
        }
      }

      // ✅ Tentativa avançada de detectar nome da rede WiFi
      // Nota: Navegadores web têm limitações de segurança para detectar nomes de rede WiFi
      // Mas podemos tentar algumas abordagens:
      
      // 1. Tentar usar WebRTC para obter informações de rede local
      if (wifiName === 'WiFi: Conectado' || wifiName.includes('WiFi:')) {
        try {
          // Tentar detectar se é uma rede específica baseada em padrões conhecidos
          // Esta é uma abordagem limitada, mas pode funcionar em alguns casos
          
          // Verificar se há informações sobre a rede no localStorage (se já foi detectada antes)
          if (typeof window !== 'undefined') {
            const storedWifiName = localStorage.getItem('detected_wifi_name');
            if (storedWifiName && storedWifiName !== 'WiFi: Conectado') {
              wifiName = storedWifiName;
            }
          }
          
          // Tentar usar APIs experimentais (se disponíveis)
          if ('connection' in navigator) {
            const conn = (navigator as any).connection;
            
            // Verificar se há informações específicas sobre a rede
            if (conn && conn.type === 'wifi') {
              // Tentar inferir nome da rede baseado em características
              if (conn.effectiveType === '4g' && conn.downlink > 20) {
                // Pode ser uma rede 5G ou WiFi rápida
                wifiName = 'WiFi: Rede Rápida (Possível 5G)';
              } else if (conn.downlink > 50) {
                wifiName = 'WiFi: Rede Rápida';
              }
            }
          }
        } catch (error) {
          // Manter fallback padrão
        }
      }

      const info: NetworkInfo = {
        wifiName,
        connectionType,
        effectiveType,
        downlink,
        isOnline
      };

      // console.log removido para evitar warnings de linting

      return info;
    } catch (error) {
      // console.error removido para evitar warnings de linting
      
      return {
        wifiName: 'WiFi não detectado',
        connectionType: 'error',
        effectiveType: 'error',
        downlink: 0,
        isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
        realSSID: undefined,
        ssidPlatform: undefined,
        ssidLoading: false,
        ssidError: null
      };
    }
  }, []);

  // ✅ Função para capturar SSID real do sistema operacional
  const fetchRealSSID = useCallback(async (): Promise<{
    ssid: string;
    platform: string;
    error?: string;
  }> => {
    try {
      const response = await fetch('/api/wifi/ssid');
      const data = await response.json();
      
      if (data.success) {
        return {
          ssid: data.ssid,
          platform: data.platform
        };
      } else {
        return {
          ssid: 'Não detectado',
          platform: 'desconhecido',
          error: data.error
        };
      }
    } catch (error) {
      return {
        ssid: 'Erro ao capturar',
        platform: 'desconhecido',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }, []);

  // Atualizar informações de rede com proteções robustas
  const updateNetworkInfo = useCallback(async () => {
    // ✅ Proteção 1: Evitar múltiplas chamadas simultâneas
    if (isUpdating) {
               // if (enableLogging) {
               //   console.log('🔄 Atualização já em andamento, pulando...');
               // }
      return;
    }
    
    // ✅ Proteção 2: Rate limiting - máximo 1 chamada por segundo
    const now = Date.now();
    if (now - lastUpdateTime < 1000) {
             // if (enableLogging) {
             //   console.log('⏱️ Rate limiting ativo, aguardando...');
             // }
      return;
    }
    
    // ✅ Proteção 3: Backoff exponencial em caso de erros consecutivos
    if (consecutiveErrors > 3) {
      const backoffTime = Math.min(30000, 1000 * Math.pow(2, consecutiveErrors - 3));
      if (now - lastUpdateTime < backoffTime) {
               // if (enableLogging) {
               //   console.log(`🚫 Backoff ativo por ${backoffTime}ms devido a ${consecutiveErrors} erros consecutivos`);
               // }
        return;
      }
    }
    
    // ✅ Debounce: cancelar timeout anterior se existir
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    
    const timeout = setTimeout(async () => {
      setIsUpdating(true);
      setLastUpdateTime(now);
      
      try {
        const basicInfo = detectNetworkInfo();
        
        // ✅ Capturar SSID real se habilitado
        if (enableRealSSID) {
          setNetworkInfo(prev => ({ ...prev, ...basicInfo, ssidLoading: true, ssidError: null }));
          
          try {
            const ssidData = await fetchRealSSID();
            setNetworkInfo(prev => ({
              ...prev,
              ...basicInfo,
              realSSID: ssidData.ssid,
              ssidPlatform: ssidData.platform,
              ssidLoading: false,
              ssidError: ssidData.error || null
            }));
            
            // ✅ Reset contador de erros em caso de sucesso
            setConsecutiveErrors(0);
            
          } catch (error) {
            setConsecutiveErrors(prev => prev + 1);
            setNetworkInfo(prev => ({
              ...prev,
              ...basicInfo,
              ssidLoading: false,
              ssidError: error instanceof Error ? error.message : 'Erro ao capturar SSID'
            }));
          }
        } else {
          setNetworkInfo(basicInfo);
        }
      } catch (error) {
        setConsecutiveErrors(prev => prev + 1);
        if (enableLogging) {
          console.error('❌ Erro na atualização de rede:', error);
        }
      } finally {
        setIsUpdating(false);
      }
    }, 2000); // 2 segundos de debounce para maior estabilidade
    
    setDebounceTimeout(timeout);
  }, [enableRealSSID, debounceTimeout, isUpdating, lastUpdateTime, consecutiveErrors]); // ✅ Dependências essenciais apenas

  // Configurar listeners e atualizações periódicas
  useEffect(() => {
    // ✅ Proteção: Evitar chamadas excessivas na inicialização
    const initTimeout = setTimeout(() => {
      updateNetworkInfo();
    }, 1000); // Aguardar 1 segundo antes da primeira chamada

    // Listener para mudanças na conexão
    const handleConnectionChange = () => {
      // ✅ Debounce para mudanças de conexão
      setTimeout(() => {
        updateNetworkInfo();
      }, 2000);
    };

    // Listener para mudanças de status online/offline
    const handleOnlineStatusChange = () => {
      // ✅ Debounce para mudanças de status
      setTimeout(() => {
        updateNetworkInfo();
      }, 2000);
    };

    // Adicionar listeners
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.addEventListener) {
        connection.addEventListener('change', handleConnectionChange);
      }
    }

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    // ✅ Atualização periódica com proteção - apenas se updateInterval > 0
    let intervalId: NodeJS.Timeout | null = null;
    if (updateInterval > 0) {
      intervalId = setInterval(() => {
        // ✅ Verificar se não está atualizando antes de chamar
        if (!isUpdating) {
          updateNetworkInfo();
        }
      }, updateInterval);
    }

    // Cleanup
    return () => {
      // ✅ Cleanup do timeout de inicialização
      clearTimeout(initTimeout);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection && connection.removeEventListener) {
          connection.removeEventListener('change', handleConnectionChange);
        }
      }

      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);

      if (intervalId) {
        clearInterval(intervalId);
      }
      
      // ✅ Cleanup do debounce timeout
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [updateInterval, enableRealSSID]); // ✅ Dependências essenciais apenas

  return {
    ...networkInfo,
    updateNetworkInfo,
    detectNetworkInfo,
    // ✅ Função para atualizar SSID real manualmente
    refreshRealSSID: enableRealSSID ? fetchRealSSID : undefined
  };
};

export default useNetworkDetection;
