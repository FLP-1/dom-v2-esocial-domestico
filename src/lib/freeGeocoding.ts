/**
 * 🆓 APIs de Geocodificação GRATUITAS
 * 
 * Sistema inteligente com múltiplas APIs gratuitas:
 * 1. OpenCage Data (2.500 req/dia grátis)
 * 2. BigDataCloud (ilimitado, boa qualidade)
 * 3. Positionstack (10.000 req/dia grátis)
 * 4. Nominatim (fallback final)
 * 
 * Vantagens:
 * - 100% gratuito
 * - Redundância (múltiplas fontes)
 * - Qualidade superior ao Nominatim
 * - Sem dependência de APIs pagas
 */

import logger from '../utils/logger';

interface GeocodingResult {
  success: boolean;
  address?: string;
  formattedAddress?: string;
  components?: any;
  source?: string;
  error?: string;
}

interface AddressComponents {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

/**
 * OpenCage Data API - 2.500 requisições/dia grátis
 * Boa qualidade, dados atualizados
 */
export async function reverseGeocodeOpenCage(
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<GeocodingResult> {
  try {
    // Se não tem API key, pular
    if (!apiKey) {
      return { success: false, error: 'OpenCage API key não configurada' };
    }

    logger.geo('🌐 Tentando OpenCage Data API...');
    
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}&language=pt&countrycode=br&no_annotations=1`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Free Geocoding)',
      },
      // ✅ Timeout de 15 segundos para APIs gratuitas
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`OpenCage API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return { success: false, error: 'Nenhum endereço encontrado' };
    }

    const result = data.results[0];
    const components = result.components;
    
    const formattedAddress = [
      components.house_number && components.road ? 
        `${components.road}, ${components.house_number}` : 
        components.road,
      components.suburb || components.neighbourhood,
      components.city || components.town,
      components.state,
      components.country
    ].filter(Boolean).join(', ');

    const postalCode = components.postcode ? ` - CEP: ${components.postcode}` : '';

    return {
      success: true,
      address: result.formatted,
      formattedAddress: formattedAddress + postalCode,
      components: {
        street: components.road,
        number: components.house_number,
        neighborhood: components.suburb || components.neighbourhood,
        city: components.city || components.town,
        state: components.state,
        country: components.country,
        postalCode: components.postcode
      },
      source: 'opencage'
    };

  } catch (error: any) {
    logger.error('❌ Erro OpenCage:', error);
    return { success: false, error: error.message };
  }
}

/**
 * BigDataCloud API - Ilimitado e gratuito
 * Boa qualidade, sem limites
 */
export async function reverseGeocodeBigDataCloud(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  try {
    logger.geo('🌐 Tentando BigDataCloud API...');
    
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=pt`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Free Geocoding)',
      },
      // ✅ Timeout de 15 segundos para APIs gratuitas
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`BigDataCloud API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.localityInfo) {
      return { success: false, error: 'Nenhum endereço encontrado' };
    }

    const info = data.localityInfo;
    const administrative = info.administrative || [];
    const locality = info.locality || [];
    
    // Construir endereço
    const street = locality.find(l => l.administrativeLevel === 1)?.name;
    const city = administrative.find(a => a.administrativeLevel === 2)?.name;
    const state = administrative.find(a => a.administrativeLevel === 1)?.name;
    const country = administrative.find(a => a.administrativeLevel === 0)?.name;
    
    const formattedAddress = [street, city, state, country].filter(Boolean).join(', ');

    return {
      success: true,
      address: formattedAddress,
      formattedAddress: formattedAddress,
      components: {
        street: street,
        city: city,
        state: state,
        country: country
      },
      source: 'bigdatacloud'
    };

  } catch (error: any) {
    logger.error('❌ Erro BigDataCloud:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Positionstack API - 10.000 requisições/dia grátis
 * Excelente qualidade, dados atualizados
 */
export async function reverseGeocodePositionstack(
  latitude: number,
  longitude: number,
  apiKey?: string
): Promise<GeocodingResult> {
  try {
    // Se não tem API key, pular
    if (!apiKey) {
      return { success: false, error: 'Positionstack API key não configurada' };
    }

    logger.geo('🌐 Tentando Positionstack API...');
    
    const url = `http://api.positionstack.com/v1/reverse?access_key=${apiKey}&query=${latitude},${longitude}&limit=1&language=pt`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Free Geocoding)',
      },
      // ✅ Timeout de 15 segundos para APIs gratuitas
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Positionstack API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      return { success: false, error: 'Nenhum endereço encontrado' };
    }

    const result = data.data[0];
    
    const formattedAddress = [
      result.street,
      result.neighbourhood,
      result.locality,
      result.region,
      result.country
    ].filter(Boolean).join(', ');

    return {
      success: true,
      address: result.label,
      formattedAddress: formattedAddress,
      components: {
        street: result.street,
        number: result.number,
        neighborhood: result.neighbourhood,
        city: result.locality,
        state: result.region,
        country: result.country,
        postalCode: result.postal_code
      },
      source: 'positionstack'
    };

  } catch (error: any) {
    logger.error('❌ Erro Positionstack:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Nominatim (fallback final)
 * Sempre funciona, qualidade limitada
 */
export async function reverseGeocodeNominatim(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  try {
    logger.geo('🌐 Usando Nominatim como fallback final...');
    
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'DOM-System/1.0 (Free Geocoding)',
      },
      // ✅ Timeout de 15 segundos para APIs gratuitas
      signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }

    const data = await response.json();
    
    const address = data.display_name || 'Endereço não encontrado';
    const addressComponents = data.address || {};
    
    const formattedAddress = [
      addressComponents.house_number && addressComponents.road ? 
        `${addressComponents.road}, ${addressComponents.house_number}` : 
        addressComponents.road,
      addressComponents.suburb || addressComponents.neighbourhood,
      addressComponents.city || addressComponents.town,
      addressComponents.state,
      addressComponents.country
    ].filter(Boolean).join(', ');

    const cep = addressComponents.postcode ? ` - CEP: ${addressComponents.postcode}` : '';

    return {
      success: true,
      address: address,
      formattedAddress: formattedAddress + cep,
      components: addressComponents,
      source: 'nominatim'
    };

  } catch (error: any) {
    logger.error('❌ Erro Nominatim:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Sistema inteligente de fallback
 * Tenta múltiplas APIs gratuitas em ordem de qualidade
 */
export async function reverseGeocodeFree(
  latitude: number,
  longitude: number
): Promise<GeocodingResult> {
  logger.geo('🆓 Iniciando geocodificação com APIs gratuitas...');

  // 1. Tentar OpenCage (melhor qualidade, 2.500 req/dia)
  const openCageKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
  if (openCageKey) {
    const openCageResult = await reverseGeocodeOpenCage(latitude, longitude, openCageKey);
    if (openCageResult.success) {
      logger.geo('✅ OpenCage retornou endereço');
      return openCageResult;
    }
  }

  // 2. Tentar BigDataCloud (ilimitado, boa qualidade)
  const bigDataResult = await reverseGeocodeBigDataCloud(latitude, longitude);
  if (bigDataResult.success) {
    logger.geo('✅ BigDataCloud retornou endereço');
    return bigDataResult;
  }

  // 3. Tentar Positionstack (10.000 req/dia, excelente qualidade)
  const positionstackKey = process.env.NEXT_PUBLIC_POSITIONSTACK_API_KEY;
  if (positionstackKey) {
    const positionstackResult = await reverseGeocodePositionstack(latitude, longitude, positionstackKey);
    if (positionstackResult.success) {
      logger.geo('✅ Positionstack retornou endereço');
      return positionstackResult;
    }
  }

  // 4. Fallback final: Nominatim (sempre funciona)
  const nominatimResult = await reverseGeocodeNominatim(latitude, longitude);
  if (nominatimResult.success) {
    logger.geo('✅ Nominatim retornou endereço (fallback)');
    return nominatimResult;
  }

  // 5. Se tudo falhar
  return {
    success: false,
    error: 'Todas as APIs de geocodificação falharam',
    source: 'none'
  };
}

/**
 * Verifica quais APIs estão disponíveis
 */
export function getAvailableFreeAPIs(): string[] {
  const apis = [];
  
  if (process.env.NEXT_PUBLIC_OPENCAGE_API_KEY) {
    apis.push('OpenCage (2.500 req/dia)');
  }
  
  apis.push('BigDataCloud (ilimitado)');
  
  if (process.env.NEXT_PUBLIC_POSITIONSTACK_API_KEY) {
    apis.push('Positionstack (10.000 req/dia)');
  }
  
  apis.push('Nominatim (fallback)');
  
  return apis;
}
