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
  const [location, setLocation] = useState<string>('Localizacao sera obtida quando necessario');
  const [wifiName, setWifiName] = useState<string>('WiFi nao detectado');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationData | null>(null);
  
  const getAddressFromCoords = useCallback(async (latitude: number, longitude: number): Promise<string> => {
    try {
      const cacheKey = `geocoding_${latitude.toFixed(6)}_${longitude.toFixed(6)}`;
      const cached = localStorage.getItem(cacheKey);
      
      if (cached) {
        return cached;
      }

      // Usar proxy server-side para evitar CORS e enriquecer endereço (inclui número)
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`, { signal: controller.signal })
        .finally(() => clearTimeout(timer));

      if (!response.ok) {
        throw new Error('Erro na API de geocoding');
      }

      const data = await response.json();
      const address: string | undefined = data?.address;

      const finalAddress = address && address.trim().length > 0
        ? address
        : `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;

      localStorage.setItem(cacheKey, finalAddress);
      
      return finalAddress;
    } catch (error) {
      return `Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
    }
  }, []);

  const captureNetworkInfo = useCallback(async (): Promise<NetworkInfo> => {
    const networkInfo: NetworkInfo = {
      wifiName: 'WiFi nao detectado',
      connectionType: 'unknown',
      effectiveType: 'unknown',
      downlink: 0,
      rtt: 0,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    try {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          networkInfo.effectiveType = connection.effectiveType || 'unknown';
          networkInfo.downlink = connection.downlink || 0;
          networkInfo.rtt = connection.rtt || 0;
          
          const type = connection.type;
          
          if (type === 'wifi' || type === 'ethernet') {
            networkInfo.connectionType = 'wifi';
            networkInfo.wifiName = 'WiFi: Conectado';
          } else if (type === 'cellular') {
            networkInfo.connectionType = 'cellular';
            networkInfo.wifiName = `Dados Moveis: ${networkInfo.effectiveType || '4G'}`;
          } else if (networkInfo.downlink > 10) {
            networkInfo.connectionType = 'wifi';
            networkInfo.wifiName = 'WiFi: Conectado (alta velocidade)';
          } else {
            networkInfo.connectionType = 'unknown';
            networkInfo.wifiName = 'WiFi: Conectado';
          }
        }
      }
    } catch (error) {
      // Silenciar erro
    }

    return networkInfo;
  }, []);

  const updateConnectionInfo = useCallback(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection) {
        const type = connection.type;
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink;
        
        if (type === 'wifi' || type === 'ethernet') {
          setWifiName('WiFi: Conectado');
        } else if (type === 'cellular') {
          setWifiName(`Dados Moveis: ${effectiveType || '4G'}`);
        } else if (downlink && downlink > 10) {
          setWifiName('WiFi: Conectado');
        } else {
          setWifiName('WiFi: Conectado');
        }
      } else {
        setWifiName('WiFi: Conectado');
      }
    } else {
      setWifiName('WiFi: Conectado');
    }
  }, []);

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

  const getCurrentLocation = useCallback((): GeolocationData | null => {
    return currentPosition;
  }, [currentPosition]);

  const refreshLocation = useCallback(async (): Promise<void> => {
    if (!navigator.geolocation) {
      setLocation('Geolocalizacao nao suportada');
      setError('Geolocalizacao nao suportada');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const locationData = await captureRealTimeLocation();
      setCurrentPosition({
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        accuracy: locationData.accuracy
      });
      setLocation(locationData.address || 'Localizacao obtida');
      setIsLoading(false);
    } catch (error: any) {
      setLocation('Localizacao indisponivel');
      setError(error.message || 'Erro ao obter localizacao');
      setIsLoading(false);
    }
  }, [captureRealTimeLocation]);

  useEffect(() => {
    // Geolocalizacao pronta - aguardando acao manual do usuario
  }, []);

  useEffect(() => {
    updateConnectionInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.addEventListener) {
        connection.addEventListener('change', updateConnectionInfo);
        return () => connection.removeEventListener('change', updateConnectionInfo);
      }
    }
  }, [updateConnectionInfo]);

  return {
    location,
    wifiName,
    isLoading,
    error,
    getCurrentLocation,
    captureRealTimeLocation,
    refreshLocation
  };
};

