/**
 * 🎯 Google Maps Geocoding API
 * 
 * API oficial do Google para geocodificação reversa de alta qualidade
 * Converte coordenadas (lat/lng) em endereços precisos
 * 
 * Vantagens sobre Nominatim:
 * - Dados mais atualizados e precisos
 * - Melhor cobertura global
 * - Endereços formatados consistentemente
 * - Suporte a múltiplos idiomas
 * 
 * Custo: $5 por 1000 requisições (500 grátis/mês)
 */

import logger from '../utils/logger';

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
      location_type: string;
    };
    place_id: string;
    types: string[];
  }>;
  status: string;
}

interface FormattedAddress {
  formattedAddress: string;
  streetNumber?: string;
  route?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  placeId?: string;
}

/**
 * Converte coordenadas em endereço usando Google Maps Geocoding API
 */
export async function reverseGeocodeGoogle(
  latitude: number,
  longitude: number,
  apiKey: string
): Promise<{
  success: boolean;
  address?: FormattedAddress;
  error?: string;
}> {
  try {
    logger.geo('🌐 Usando Google Maps Geocoding API...');
    
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}&language=pt-BR&region=BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Geocoding Service)',
      },
    });

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data: GoogleGeocodingResponse = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`Google Geocoding API error: ${data.status}`);
    }

    if (!data.results || data.results.length === 0) {
      return {
        success: false,
        error: 'Nenhum endereço encontrado para as coordenadas fornecidas'
      };
    }

    // Pegar o primeiro resultado (mais relevante)
    const result = data.results[0];
    
    // Extrair componentes do endereço
    const addressComponents = result.address_components;
    const components: any = {};
    
    addressComponents.forEach(component => {
      const types = component.types;
      if (types.includes('street_number')) {
        components.streetNumber = component.long_name;
      } else if (types.includes('route')) {
        components.route = component.long_name;
      } else if (types.includes('sublocality') || types.includes('neighborhood')) {
        components.neighborhood = component.long_name;
      } else if (types.includes('locality') || types.includes('administrative_area_level_2')) {
        components.city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        components.state = component.long_name;
      } else if (types.includes('country')) {
        components.country = component.long_name;
      } else if (types.includes('postal_code')) {
        components.postalCode = component.long_name;
      }
    });

    const formattedAddress: FormattedAddress = {
      formattedAddress: result.formatted_address,
      streetNumber: components.streetNumber,
      route: components.route,
      neighborhood: components.neighborhood,
      city: components.city,
      state: components.state,
      country: components.country,
      postalCode: components.postalCode,
      placeId: result.place_id
    };

    logger.geo('✅ Google Geocoding respondeu:', {
      address: formattedAddress.formattedAddress,
      city: formattedAddress.city,
      state: formattedAddress.state
    });

    return {
      success: true,
      address: formattedAddress
    };

  } catch (error: any) {
    logger.error('❌ Erro ao usar Google Geocoding API:', error);
    return {
      success: false,
      error: error.message || 'Erro desconhecido'
    };
  }
}

/**
 * Verifica se a API key do Google Maps está configurada
 */
export function hasGoogleMapsKey(): boolean {
  return !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

/**
 * Obtém a API key do ambiente
 */
export function getGoogleMapsKey(): string | undefined {
  return process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
}

/**
 * Formata endereço para exibição no sistema
 */
export function formatAddressForDisplay(address: FormattedAddress): string {
  const parts = [];
  
  if (address.route) {
    const street = address.streetNumber 
      ? `${address.route}, ${address.streetNumber}`
      : address.route;
    parts.push(street);
  }
  
  if (address.neighborhood) {
    parts.push(address.neighborhood);
  }
  
  if (address.city) {
    parts.push(address.city);
  }
  
  if (address.state) {
    parts.push(address.state);
  }
  
  if (address.postalCode) {
    parts.push(`CEP: ${address.postalCode}`);
  }
  
  return parts.join(', ');
}
