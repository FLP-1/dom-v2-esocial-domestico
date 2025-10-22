import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: 'Latitude and longitude are required' });
  }

  try {
    // Tentar Nominatim primeiro (melhor para endereços específicos)
    // Usar zoom máximo (18) para maior precisão de endereço
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=pt-BR,pt,en&zoom=18&extratags=1`;
    
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(nominatimUrl, {
      headers: {
        'User-Agent': 'DOM-App/1.0'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timer));

    if (response.ok) {
      const data = await response.json();
      
      if (data.address) {
        const addr = data.address;
        let address = '';
        
        // Construir endereço específico para controle de fraudes
        // Priorizar: Rua + Número + Bairro + Cidade + Estado
        
        // Rua e número (mais importante para controle de fraudes)
        if (addr.road || addr.street) {
          const streetName = addr.road || addr.street;
          const houseNumber = addr.house_number || addr.houseNumber || addr.housenumber;
          if (houseNumber) {
            address += `${streetName}, ${houseNumber}, `;
          } else {
            address += `${streetName}, `;
          }
        } else if (addr.pedestrian || addr.footway) {
          // Para pedestres/vias menores
          address += `${addr.pedestrian || addr.footway}, `;
        } else if (addr.house_name || addr.building) {
          // Para prédios sem rua específica
          address += `${addr.house_name || addr.building}, `;
        }
        
        // Bairro/Subúrbio
        if (addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district) {
          address += `${addr.suburb || addr.neighbourhood || addr.quarter || addr.city_district}, `;
        }
        
        // Cidade
        if (addr.city || addr.town || addr.village || addr.municipality) {
          address += `${addr.city || addr.town || addr.village || addr.municipality}`;
        }
        
        // Estado
        if (addr.state || addr.region) {
          address += `, ${addr.state || addr.region}`;
        }
        
        // País
        if (addr.country) {
          address += `, ${addr.country}`;
        }
        
        // CEP se disponível (importante para controle)
        if (addr.postcode) {
          address += ` - CEP: ${addr.postcode}`;
        }
        
        if (address.trim()) {
          return res.status(200).json({ 
            success: true, 
            address: address.trim(),
            source: 'nominatim'
          });
        }
      }
    }

    // Se Nominatim falhou, tentar OpenCage (melhor precisão)
    const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${process.env.OPENCAGE_API_KEY || 'demo'}&language=pt&pretty=1`;
    
    const controller2 = new AbortController();
    const timer2 = setTimeout(() => controller2.abort(), 5000);
    const openCageResponse = await fetch(openCageUrl, {
      signal: controller2.signal
    }).finally(() => clearTimeout(timer2));
    
    if (openCageResponse.ok) {
      const data = await openCageResponse.json();
      
      if (data.results && data.results.length > 0) {
        const result = data.results[0];
        const components = result.components;
        
        let address = '';
        
        // Construir endereço mais preciso
        if (components.road && components.house_number) {
          address = `${components.road}, ${components.house_number}`;
        } else if (components.road) {
          address = components.road;
        }
        
        if (components.suburb || components.neighbourhood) {
          address += `, ${components.suburb || components.neighbourhood}`;
        }
        
        if (components.city || components.town) {
          address += `, ${components.city || components.town}`;
        }
        
        if (components.state) {
          address += `, ${components.state}`;
        }
        
        if (components.country) {
          address += `, ${components.country}`;
        }
        
        if (components.postcode) {
          address += ` - CEP: ${components.postcode}`;
        }
        
        if (address.trim()) {
          return res.status(200).json({ 
            success: true, 
            address: address.trim(),
            source: 'opencage'
          });
        }
      }
    }
    
    // Se OpenCage falhou, tentar BigDataCloud
    const bigDataCloudUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=pt`;
    
    const controller3 = new AbortController();
    const timer3 = setTimeout(() => controller3.abort(), 5000);
    const bigDataResponse = await fetch(bigDataCloudUrl, {
      signal: controller3.signal
    }).finally(() => clearTimeout(timer3));
    
    if (bigDataResponse.ok) {
      const data = await bigDataResponse.json();
      
      if (data.locality && data.principalSubdivision) {
        let address = '';
        
        // Verificar se temos informações de endereço mais específicas
        if (data.localityInfo && data.localityInfo.administrative) {
          // Buscar informações mais específicas (rua, número, bairro)
          const specificInfo = data.localityInfo.administrative.find((a: any) => 
            a.order >= 7 && !a.name.includes('Região') && !a.name.includes('Metropolitana') && 
            !a.name.includes('São Paulo') && a.name.length > 5
          );
          
          const neighborhood = data.localityInfo.administrative.find((a: any) => 
            a.order === 6 && !a.name.includes('Região') && !a.name.includes('Metropolitana') &&
            !a.name.includes('São Paulo') && a.name.length > 5
          );
          
          // Usar informação específica se encontrada
          if (specificInfo && specificInfo.name) {
            address += `${specificInfo.name}, `;
          }
          
          if (neighborhood && neighborhood.name) {
            address += `${neighborhood.name}, `;
          }
        }
        
        // Se não temos endereço específico, usar coordenadas com precisão
        if (!address || address.trim() === '') {
          address = `Coordenadas precisas: ${parseFloat(lat as string).toFixed(8)}, ${parseFloat(lon as string).toFixed(8)} - `;
        }
        
        address += `${data.locality}, ${data.principalSubdivision}`;
        
        // Adicionar país se diferente do estado
        if (data.countryName && data.countryName !== data.principalSubdivision) {
          address += `, ${data.countryName}`;
        }
        
        return res.status(200).json({ 
          success: true, 
          address: address,
          source: 'bigdatacloud'
        });
      }
    }

    // Se todas as APIs falharam, retornar coordenadas precisas
    return res.status(200).json({ 
      success: true, 
      address: `Coordenadas precisas: ${parseFloat(lat as string).toFixed(8)}, ${parseFloat(lon as string).toFixed(8)} - São Paulo, SP, Brasil`,
      source: 'coordinates'
    });

  } catch (error) {
    console.error('Erro na API de geocoding:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor' 
    });
  }
}
