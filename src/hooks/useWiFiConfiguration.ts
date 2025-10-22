// src/hooks/useWiFiConfiguration.ts
import { useState, useEffect, useCallback } from 'react';

interface WiFiConfiguration {
  networkName: string;
  isConfigured: boolean;
}

const WIFI_CONFIG_KEY = 'wifi_network_config';

export const useWiFiConfiguration = () => {
  const [wifiConfig, setWifiConfig] = useState<WiFiConfiguration>({
    networkName: '',
    isConfigured: false
  });

  // Carregar configuração salva
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(WIFI_CONFIG_KEY);
      if (saved) {
        try {
          const config = JSON.parse(saved);
          setWifiConfig(config);
        } catch (error) {
          console.error('Erro ao carregar configuração WiFi:', error);
        }
      }
    }
  }, []);

  // Salvar configuração
  const saveWiFiConfiguration = useCallback((networkName: string) => {
    const config: WiFiConfiguration = {
      networkName,
      isConfigured: true
    };
    
    setWifiConfig(config);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(WIFI_CONFIG_KEY, JSON.stringify(config));
      // Também salvar no localStorage do useNetworkDetection
      localStorage.setItem('detected_wifi_name', `WiFi: ${networkName}`);
    }
  }, []);

  // Limpar configuração
  const clearWiFiConfiguration = useCallback(() => {
    setWifiConfig({ networkName: '', isConfigured: false });
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(WIFI_CONFIG_KEY);
      localStorage.removeItem('detected_wifi_name');
    }
  }, []);

  // Obter nome da rede formatado
  const getFormattedNetworkName = useCallback(() => {
    if (wifiConfig.isConfigured && wifiConfig.networkName) {
      return `WiFi: ${wifiConfig.networkName}`;
    }
    return null;
  }, [wifiConfig]);

  return {
    wifiConfig,
    saveWiFiConfiguration,
    clearWiFiConfiguration,
    getFormattedNetworkName
  };
};
