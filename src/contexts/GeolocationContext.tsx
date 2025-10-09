import { createContext, useContext, useState, ReactNode } from 'react';

export interface GeolocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  address?: string;
  wifiName?: string;
  networkInfo?: {
    connectionType?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
  };
  timestamp: Date;
}

interface GeolocationContextType {
  lastLocation: GeolocationData | null;
  setLastLocation: (location: GeolocationData) => void;
}

const GeolocationContext = createContext<GeolocationContextType>({
  lastLocation: null,
  setLastLocation: () => {},
});

export const useGeolocationContext = () => useContext(GeolocationContext);

export const GeolocationProvider = ({ children }: { children: ReactNode }) => {
  const [lastLocation, setLastLocation] = useState<GeolocationData | null>(null);

  return (
    <GeolocationContext.Provider value={{ lastLocation, setLastLocation }}>
      {children}
    </GeolocationContext.Provider>
  );
};

