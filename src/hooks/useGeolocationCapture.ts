import { useCallback } from 'react';
import { useGeolocation } from './useGeolocation';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import logger from '../utils/logger';

/**
 * Hook para captura automática de geolocalização em ações críticas
 * Elimina brechas de fraude capturando localização em cada ação importante
 */
export const useGeolocationCapture = () => {
  const { getCurrentPosition } = useGeolocation();
  const { updateLastLocationIfBetter, setLastCaptureLocation, setLastCaptureStatus } = useGeolocationContext();

  /**
   * Detectar se é dispositivo mobile
   */
  const isMobileDevice = useCallback((): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           ('ontouchstart' in window) ||
           (navigator.maxTouchPoints > 0);
  }, []);

  /**
   * Wrapper para ações críticas que precisam de geolocalização
   * Captura automaticamente a localização antes de executar a ação
   * Com otimização para mobile vs desktop
   */
  const executeWithLocationCapture = useCallback(
    async <T extends (...args: any[]) => any>(
      action: T,
      actionName: string,
      ...args: Parameters<T>
    ): Promise<{
      success: boolean;
      result?: ReturnType<T>;
      locationData?: any;
      error?: string;
    }> => {
      logger.log(`🎯 Executando ação crítica: ${actionName}`);
      
      const isMobile = isMobileDevice();
      logger.log(`📱 Dispositivo: ${isMobile ? 'Mobile' : 'Desktop'}`);
      
      try {
        // 1. Capturar geolocalização
        logger.geo(`📍 Capturando geolocalização para: ${actionName}`);
        
        // Usar mesma estratégia para mobile e desktop
        // O timeout já está configurado no captureRealTimeLocation (via banco de dados)
        let locationData;
        try {
          locationData = await getCurrentPosition();
        } catch (error) {
          logger.warn(`⚠️ Captura de geolocalização falhou para ${actionName}, continuando sem localização`);
          locationData = null;
        }
        
        if (locationData) {
          logger.geo(`✅ Geolocalização capturada para ${actionName}:`, {
            address: locationData.address,
            accuracy: `${locationData.accuracy}m`,
            wifiName: locationData.wifiName,
            timestamp: new Date().toISOString()
          });
          
          // ✅ Salvar no contexto global para WelcomeSection
          updateLastLocationIfBetter({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            wifiName: locationData.wifiName,
            networkInfo: locationData.networkInfo,
            timestamp: new Date()
          });
        } else {
          logger.warn(`⚠️ Geolocalização não disponível para ${actionName} (desktop ou falha)`);
        }

        // 2. Executar a ação original COM dados de geolocalização
        logger.log(`⚡ Executando ação: ${actionName}`);
        const result = await action(locationData, ...args);
        
        logger.log(`✅ Ação ${actionName} executada com sucesso`);

        // 3. Se a ação concluiu com sucesso, marcar a última captura usada para persistência
        if (locationData) {
          setLastCaptureLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            wifiName: locationData.wifiName,
            networkInfo: locationData.networkInfo,
            timestamp: new Date()
          });
          // Reset meta até receber status do servidor no chamador
          setLastCaptureStatus && setLastCaptureStatus(null);
        }

        // 4. Retornar resultado com dados de localização (se disponível)
        return {
          success: true,
          result,
          locationData: locationData ? {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            addressComponents: locationData.addressComponents,
            hasNumber: locationData.hasNumber,
            wifiName: locationData.wifiName,
            networkInfo: locationData.networkInfo,
            actionName,
            timestamp: new Date().toISOString(),
            deviceType: isMobile ? 'mobile' : 'desktop'
          } : null
        };

      } catch (error: any) {
        logger.error(`❌ Erro na ação ${actionName}:`, error);
        
        // Mesmo com erro de geolocalização, tentar executar a ação
        try {
          const result = await action(null, ...args); // Passar null para locationData
          return {
            success: true,
            result,
            locationData: null, // Geolocalização falhou
            error: `Geolocalização falhou: ${error.message}`
          };
        } catch (actionError: any) {
          return {
            success: false,
            error: `Ação falhou: ${actionError.message}`
          };
        }
      }
    },
    [getCurrentPosition, isMobileDevice, updateLastLocationIfBetter, setLastCaptureLocation, setLastCaptureStatus]
  );

  /**
   * Wrapper específico para botões críticos
   */
  const createCriticalButtonHandler = useCallback(
    (action: (...args: any[]) => any, actionName: string) => {
      return async (...args: any[]) => {
        return executeWithLocationCapture(action, actionName, ...args);
      };
    },
    [executeWithLocationCapture]
  );

  /**
   * Wrapper para ações de formulário
   */
  const createCriticalFormHandler = useCallback(
    (action: (formData: any) => any, actionName: string) => {
      return async (formData: any) => {
        return executeWithLocationCapture(action, actionName, formData);
      };
    },
    [executeWithLocationCapture]
  );

  return {
    executeWithLocationCapture,
    createCriticalButtonHandler,
    createCriticalFormHandler
  };
};

export default useGeolocationCapture;
