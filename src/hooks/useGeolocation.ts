import { useState, useCallback, useEffect } from 'react';

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface UseGeolocationReturn {
  location: GeolocationData | null;
  error: GeolocationError | null;
  loading: boolean;
  getCurrentPosition: (options?: GeolocationOptions) => Promise<GeolocationData>;
  watchPosition: (callback: (location: GeolocationData) => void, options?: GeolocationOptions) => number;
  clearWatch: (watchId: number) => void;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentPosition = useCallback(async (options: GeolocationOptions = {}): Promise<GeolocationData> => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutos
      ...options
    };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: 0,
          message: 'Geolocalização não é suportada por este navegador'
        };
        setError(error);
        reject(error);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const locationData: GeolocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date(position.timestamp)
          };

          setLocation(locationData);
          setLoading(false);
          resolve(locationData);
        },
        (err) => {
          const error: GeolocationError = {
            code: err.code,
            message: getErrorMessage(err.code)
          };
          setError(error);
          setLoading(false);
          reject(error);
        },
        defaultOptions
      );
    });
  }, []);

  const watchPosition = useCallback((
    callback: (location: GeolocationData) => void,
    options: GeolocationOptions = {}
  ): number => {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
      ...options
    };

    if (!navigator.geolocation) {
      throw new Error('Geolocalização não é suportada por este navegador');
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        const locationData: GeolocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp)
        };

        setLocation(locationData);
        callback(locationData);
      },
      (err) => {
        const error: GeolocationError = {
          code: err.code,
          message: getErrorMessage(err.code)
        };
        setError(error);
      },
      defaultOptions
    );
  }, []);

  const clearWatch = useCallback((watchId: number) => {
    navigator.geolocation.clearWatch(watchId);
  }, []);

  return {
    location,
    error,
    loading,
    getCurrentPosition,
    watchPosition,
    clearWatch
  };
};

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Permissão de geolocalização negada pelo usuário';
    case 2:
      return 'Posição indisponível';
    case 3:
      return 'Timeout na obtenção da posição';
    default:
      return 'Erro desconhecido na geolocalização';
  }
}

export default useGeolocation;