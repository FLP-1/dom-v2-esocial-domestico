import { useEffect, useCallback, useRef } from 'react';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import { useNetworkDetection } from './useNetworkDetection';
import { logger } from '../utils/logger';

interface UseAutoGeolocationOptions {
  intervalMinutes?: number; // Intervalo em minutos para captura automática
  captureOnRouteChange?: boolean; // Capturar ao mudar de página
  enableLogging?: boolean; // Habilitar logs
}

export const useAutoGeolocation = (options: UseAutoGeolocationOptions = {}) => {
  const {
    intervalMinutes = 5, // Capturar a cada 5 minutos por padrão
    captureOnRouteChange = true,
    enableLogging = true
  } = options;

  const { setLastCaptureLocation } = useGeolocationContext();
  const { wifiName } = useNetworkDetection({ enableLogging });
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastCaptureRef = useRef<Date | null>(null);

  // Função para capturar geolocalização
  const captureLocation = useCallback(async () => {
    try {
      if (enableLogging) {
        logger.log('🔄 Captura automática de geolocalização iniciada');
      }

      // Verificar se a geolocalização está disponível
      if (!navigator.geolocation) {
        if (enableLogging) {
          logger.log('❌ Geolocalização não suportada pelo navegador');
        }
        return;
      }

      // Capturar posição atual
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Timeout na captura de geolocalização'));
        }, 10000); // 10 segundos de timeout

        navigator.geolocation.getCurrentPosition(
          (pos) => {
            clearTimeout(timeout);
            resolve(pos);
          },
          (error) => {
            clearTimeout(timeout);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000 // Aceitar posição de até 1 minuto
          }
        );
      });

      // Obter endereço via geocoding usando endpoint interno com máxima precisão
      let address = 'Endereço indisponível na captura';
      let addressComponents = null;
      let hasNumber = false;
      
      try {
        // Usar zoom=19 para máxima precisão (equivalente a 7 casas decimais)
        const response = await fetch(
          `/api/geocoding/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&zoom=19`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // Priorizar endereço formatado com número
            if (data.formattedAddress) {
              address = data.formattedAddress;
            } else if (data.address) {
              address = data.address;
            }
            
            // Capturar componentes para verificar se tem número
            if (data.components) {
              addressComponents = data.components;
              hasNumber = !!(data.components.number || data.components.house_number);
              
              if (enableLogging && hasNumber) {
                logger.log('✅ Endereço capturado com número:', {
                  number: data.components.number || data.components.house_number,
                  street: data.components.street || data.components.road,
                  neighborhood: data.components.neighborhood || data.components.suburb
                });
              }
            }
          }
        }
      } catch (error) {
        if (enableLogging) {
          logger.log('⚠️ Erro ao obter endereço via geocoding:', error);
        }
      }

      // ✅ WiFi detection agora é centralizado via useNetworkDetection hook

      // Atualizar contexto de geolocalização com dados completos
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address,
        addressComponents,
        hasNumber,
        wifiName,
        timestamp: new Date()
      };

      setLastCaptureLocation && setLastCaptureLocation(locationData);
      lastCaptureRef.current = new Date();

      if (enableLogging) {
        logger.log('✅ Captura automática concluída:', {
          address,
          hasNumber,
          accuracy: `${position.coords.accuracy}m`,
          wifiName,
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      if (enableLogging) {
        logger.log('❌ Erro na captura automática:', error);
      }
    }
  }, [setLastCaptureLocation, enableLogging, wifiName]);

  // Configurar captura periódica
  useEffect(() => {
    if (intervalMinutes > 0) {
      // ❌ NÃO capturar imediatamente - viola política de geolocalização
      // captureLocation(); // Removido - causa violações

      // Configurar intervalo
      intervalRef.current = setInterval(() => {
        // ❌ NÃO capturar automaticamente - viola política de geolocalização
        // captureLocation(); // Removido - causa violações
        if (enableLogging) {
          logger.log('⏰ Intervalo de captura automática atingido - pulado (requer interação do usuário)');
        }
      }, intervalMinutes * 60 * 1000); // Converter minutos para milissegundos

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [intervalMinutes, enableLogging]); // Adicionado enableLogging

  // Capturar ao mudar de rota (se habilitado)
  useEffect(() => {
    if (captureOnRouteChange) {
      const handleRouteChange = () => {
        // Aguardar um pouco para a página carregar
        setTimeout(() => {
          captureLocation();
        }, 1000);
      };

      // Escutar mudanças de rota
      window.addEventListener('popstate', handleRouteChange);
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange);
      };
    }
  }, [captureLocation, captureOnRouteChange]);

  // Função para forçar captura manual
  const forceCapture = useCallback(() => {
    captureLocation();
  }, [captureLocation]);

  // Função para obter última captura
  const getLastCapture = useCallback(() => {
    return lastCaptureRef.current;
  }, []);

  return {
    captureLocation: forceCapture,
    getLastCapture,
    isCapturing: intervalRef.current !== null
  };
};

export default useAutoGeolocation;
