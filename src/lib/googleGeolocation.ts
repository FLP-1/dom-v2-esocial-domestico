/**
 * 🎯 Google Geolocation API
 * 
 * API oficial do Google para geolocalização de alta precisão
 * Mesma tecnologia usada pelo Google Maps
 * 
 * Precisão: 10-50m (muito superior ao navegador)
 * Custo: $0.005 por requisição (500 grátis/mês)
 */

import logger from '../utils/logger';

interface GoogleGeolocationResponse {
  location: {
    lat: number;
    lng: number;
  };
  accuracy: number;
}

interface WiFiAccessPoint {
  macAddress: string;
  signalStrength?: number;
  age?: number;
  channel?: number;
  signalToNoiseRatio?: number;
}

/**
 * Obtém localização usando Google Geolocation API
 * MUITO mais precisa que navigator.geolocation
 */
export async function getGoogleGeolocation(apiKey: string): Promise<{
  latitude: number;
  longitude: number;
  accuracy: number;
}> {
  try {
    logger.geo('🌐 Usando Google Geolocation API...');
    
    // Coletar informações de WiFi se disponível
    const wifiAccessPoints = await collectWiFiAccessPoints();
    
    const requestBody: any = {
      considerIp: true
    };
    
    // Adicionar WiFi APs se disponível
    if (wifiAccessPoints && wifiAccessPoints.length > 0) {
      requestBody.wifiAccessPoints = wifiAccessPoints;
      logger.geo(`📡 WiFi APs detectados: ${wifiAccessPoints.length}`);
    }
    
    const response = await fetch(
      `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      }
    );
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Google API error: ${error.error?.message || 'Unknown'}`);
    }
    
    const data: GoogleGeolocationResponse = await response.json();
    
    logger.geo('✅ Google Geolocation respondeu:', {
      lat: data.location.lat,
      lng: data.location.lng,
      accuracy: `${data.accuracy}m`
    });
    
    return {
      latitude: data.location.lat,
      longitude: data.location.lng,
      accuracy: data.accuracy
    };
    
  } catch (error: any) {
    logger.error('❌ Erro ao usar Google Geolocation API:', error);
    throw error;
  }
}

/**
 * Tentar coletar WiFi Access Points (requer permissões especiais)
 * Nem todos navegadores suportam
 */
async function collectWiFiAccessPoints(): Promise<WiFiAccessPoint[] | null> {
  try {
    // Verificar se Navigator tem API de WiFi
    // (Nota: Maioria dos navegadores não expõe isso por questões de privacidade)
    
    // Por enquanto, retornar null
    // Em produção, isso funcionaria melhor em app nativo ou extensão
    return null;
    
  } catch (error) {
    logger.warn('WiFi scan não disponível');
    return null;
  }
}

/**
 * Verifica se a API key do Google está configurada
 */
export function hasGoogleGeolocationKey(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY;
}

/**
 * Obtém a API key do ambiente
 */
export function getGoogleGeolocationKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_GEOLOCATION_API_KEY;
}

