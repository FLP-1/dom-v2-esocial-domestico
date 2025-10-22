// src/pages/api/geocoding/reverse.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { reverseGeocodeGoogle, hasGoogleMapsKey, getGoogleMapsKey, formatAddressForDisplay } from '../../../lib/googleGeocoding';
import { reverseGeocodeFree, getAvailableFreeAPIs, reverseGeocodeOpenCage } from '../../../lib/freeGeocoding';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lon, zoom = '18' } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  const latitude = parseFloat(lat as string);
  const longitude = parseFloat(lon as string);

  if (isNaN(latitude) || isNaN(longitude)) {
    return res.status(400).json({ error: 'Invalid latitude or longitude' });
  }

  try {
    // 🎯 SISTEMA SIMPLIFICADO: Nominatim + OpenCage
    // console.log('🌐 Usando sistema otimizado...');

    // 🎯 PRIORIDADE 1: OpenCage (melhor qualidade para busca reversa)
    const openCageKey = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;
    if (openCageKey) {
      try {
        const openCageResult = await reverseGeocodeOpenCage(latitude, longitude, openCageKey);
        if (openCageResult.success) {
          return res.status(200).json({
            success: true,
            address: openCageResult.address,
            fullAddress: openCageResult.address,
            cep: openCageResult.components?.postalCode,
            formattedAddress: openCageResult.formattedAddress,
            components: openCageResult.components,
            source: 'opencage',
            availableAPIs: ['OpenCage Data']
          });
        }
      } catch (openCageError) {
        // console.log('⚠️ OpenCage falhou, tentando Nominatim...');
      }
    }
    
    // 🎯 PRIORIDADE 2: Nominatim (sempre funciona)
    // console.log('🌐 Usando Nominatim...');
    
    try {
      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=pt-BR&zoom=19`;
      
      const nominatimResponse = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'DOM-System/1.0 (Geolocation System)',
        },
        // ✅ Timeout aumentado para 30 segundos devido à latência alta
        signal: AbortSignal.timeout(30000)
      });
      
      if (nominatimResponse.ok) {
        const nominatimData = await nominatimResponse.json();
        
        if (nominatimData && nominatimData.display_name) {
          const address = nominatimData.display_name;
          const components = {
            street: nominatimData.address?.road || '',
            number: nominatimData.address?.house_number || '',
            neighborhood: nominatimData.address?.suburb || '',
            city: nominatimData.address?.city || nominatimData.address?.town || '',
            state: nominatimData.address?.state || '',
            country: nominatimData.address?.country || '',
            postalCode: nominatimData.address?.postcode || ''
          };
          
          return res.status(200).json({
            success: true,
            address: address,
            fullAddress: address,
            formattedAddress: address,
            components: components,
            source: 'nominatim',
            availableAPIs: ['Nominatim (OpenStreetMap)']
          });
        }
      }
    } catch (nominatimError) {
        // console.log('⚠️ Erro no Nominatim:', nominatimError);
    }

  } catch (error) {
    console.error('Erro no geocoding:', error);
    
    // Fallback final para coordenadas
    return res.status(200).json({
      success: false,
      address: `Endereço indisponível (Lat: ${latitude}, Lon: ${longitude})`,
      formattedAddress: `Endereço indisponível (Lat: ${latitude}, Lon: ${longitude})`,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      source: 'fallback'
    });
  }
}
