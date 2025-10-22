import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  addressComponents?: {
    street?: string;
    road?: string;
    number?: string;
    house_number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  wifiName?: string;
  networkInfo?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  timestamp: Date;
}

export interface CaptureStatusMeta {
  approved?: boolean;
  pending?: boolean;
  overrideUsed?: boolean;
  imprecise?: boolean;
  reason?: string;
  serverRecordId?: string;
}

interface GeolocationContextType {
  /** Melhor leitura recente (maior precisão) para UI */
  lastLocation: GeolocationData | null;
  setLastLocation: (location: GeolocationData) => void;
  updateLastLocationIfBetter: (location: GeolocationData) => void;

  /** Última leitura usada com sucesso em um registro persistido */
  lastCaptureLocation: GeolocationData | null;
  setLastCaptureLocation: (location: GeolocationData) => void;
  lastCaptureStatus?: CaptureStatusMeta | null;
  setLastCaptureStatus?: (status: CaptureStatusMeta | null) => void;
}

const GeolocationContext = createContext<GeolocationContextType>({
  lastLocation: null,
  setLastLocation: () => {},
  updateLastLocationIfBetter: () => {},
  lastCaptureLocation: null,
  setLastCaptureLocation: () => {},
  lastCaptureStatus: null,
  setLastCaptureStatus: () => {},
});

export const useGeolocationContext = () => useContext(GeolocationContext);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [lastLocation, setLastLocation] = useState<GeolocationData | null>(null);
  const [lastCaptureLocation, setLastCaptureLocation] = useState<GeolocationData | null>(null);
  const [lastCaptureStatus, setLastCaptureStatus] = useState<CaptureStatusMeta | null>(null);
  
  // ✅ Usar o novo hook de geolocalização
  const { getCurrentPosition, location: currentLocation } = useGeolocation();

  const updateLastLocationIfBetter = useCallback((location: GeolocationData) => {
    // Não substituir se a nova precisão for pior que a atual
    if (lastLocation) {
      const isNewer = location.timestamp.getTime() >= lastLocation.timestamp.getTime();
      const isMoreAccurate = location.accuracy <= lastLocation.accuracy;

      if (!isNewer && !isMoreAccurate) {
        return; // evitar regressão por leituras antigas e imprecisas
      }

      if (!isMoreAccurate && isNewer) {
        // Nova leitura é mais recente porém menos precisa: manter a melhor
        return;
      }
    }

    setLastLocation(location);
  }, [lastLocation]);

  // ✅ Geolocalização automática desabilitada - será solicitada apenas quando necessário
  // useEffect(() => {
  //   const captureLocation = async () => {
  //     try {
  //       await getCurrentPosition({
  //         enableHighAccuracy: true,
  //         timeout: 15000,
  //         maximumAge: 300000
  //       });
  //     } catch (error) {
  //       console.warn('Erro ao capturar localização inicial:', error);
  //     }
  //   };

  //   captureLocation();
  // }, [getCurrentPosition]);

  // ✅ Atualizar lastLocation quando currentLocation mudar
  useEffect(() => {
    if (currentLocation) {
      updateLastLocationIfBetter(currentLocation);
    }
  }, [currentLocation, updateLastLocationIfBetter]);

  return (
    <GeolocationContext.Provider value={{ lastLocation, setLastLocation, updateLastLocationIfBetter, lastCaptureLocation, setLastCaptureLocation, lastCaptureStatus, setLastCaptureStatus }}>
      {children}
    </GeolocationContext.Provider>
  );
};

