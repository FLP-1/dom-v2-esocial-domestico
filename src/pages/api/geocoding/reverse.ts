// src/pages/api/geocoding/reverse.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { reverseGeocodeGoogle, hasGoogleMapsKey, getGoogleMapsKey, formatAddressForDisplay } from '../../../lib/googleGeocoding';
import { reverseGeocodeFree, getAvailableFreeAPIs } from '../../../lib/freeGeocoding';

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
    // 🎯 PRIORIDADE 1: Google Maps (se disponível e com budget)
    if (hasGoogleMapsKey()) {
      console.log('🌐 Tentando Google Maps Geocoding API...');
      
      const googleResult = await reverseGeocodeGoogle(
        latitude, 
        longitude, 
        getGoogleMapsKey()!
      );

      if (googleResult.success && googleResult.address) {
        const formattedAddress = formatAddressForDisplay(googleResult.address);
        
        return res.status(200).json({
          success: true,
          address: formattedAddress,
          fullAddress: googleResult.address.formattedAddress,
          cep: googleResult.address.postalCode,
          formattedAddress: formattedAddress,
          components: {
            street: googleResult.address.route,
            number: googleResult.address.streetNumber,
            neighborhood: googleResult.address.neighborhood,
            city: googleResult.address.city,
            state: googleResult.address.state,
            country: googleResult.address.country,
            postcode: googleResult.address.postalCode
          },
          source: 'google_maps'
        });
      }
      
      console.log('⚠️ Google Maps falhou, tentando APIs gratuitas...');
    }

    // 🎯 PRIORIDADE 2: Nominatim (sempre funciona, sem chave)
    console.log('🌐 Tentando Nominatim (OpenStreetMap)...');
    
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
      console.log('⚠️ Erro no Nominatim:', nominatimError);
    }
    
    // 🎯 PRIORIDADE 3: APIs GRATUITAS (se configuradas)
    console.log('🆓 Usando sistema de APIs gratuitas...');
    
    const freeResult = await reverseGeocodeFree(latitude, longitude);
    
    if (freeResult.success) {
      return res.status(200).json({
        success: true,
        address: freeResult.address,
        fullAddress: freeResult.address,
        cep: freeResult.components?.postalCode,
        formattedAddress: freeResult.formattedAddress,
        components: freeResult.components,
        source: freeResult.source,
        availableAPIs: getAvailableFreeAPIs()
      });
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
