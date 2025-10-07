import { useCallback } from 'react';
import { useGeolocation } from './useGeolocation';

/**
 * Hook para captura automática de geolocalização em ações críticas
 * Elimina brechas de fraude capturando localização em cada ação importante
 */
export const useGeolocationCapture = () => {
  const { captureRealTimeLocation } = useGeolocation();

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
      console.log(`🎯 Executando ação crítica: ${actionName}`);
      
      const isMobile = isMobileDevice();
      console.log(`📱 Dispositivo: ${isMobile ? 'Mobile' : 'Desktop'}`);
      
      try {
        // 1. Capturar geolocalização otimizada por dispositivo
        console.log(`📍 Capturando geolocalização para: ${actionName}`);
        
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
            console.log('⚠️ Desktop: Captura rápida falhou, continuando sem geolocalização');
            locationData = null;
          }
        }
        
        if (locationData) {
          console.log(`✅ Geolocalização capturada para ${actionName}:`, {
            address: locationData.address,
            accuracy: `${locationData.accuracy}m`,
            wifiName: locationData.wifiName,
            timestamp: new Date().toISOString()
          });
        } else {
          console.log(`⚠️ Geolocalização não disponível para ${actionName} (desktop ou falha)`);
        }

        // 2. Executar a ação original
        console.log(`⚡ Executando ação: ${actionName}`);
        const result = await action(...args);
        
        console.log(`✅ Ação ${actionName} executada com sucesso`);

        // 3. Retornar resultado com dados de localização (se disponível)
        return {
          success: true,
          result,
          locationData: locationData ? {
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            wifiName: locationData.wifiName,
            networkInfo: locationData.networkInfo,
            actionName,
            timestamp: new Date().toISOString(),
            deviceType: isMobile ? 'mobile' : 'desktop'
          } : null
        };

      } catch (error: any) {
        console.error(`❌ Erro na ação ${actionName}:`, error);
        
        // Mesmo com erro de geolocalização, tentar executar a ação
        try {
          const result = await action(...args);
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
    [captureRealTimeLocation, isMobileDevice]
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
