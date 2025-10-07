import React, { useState } from 'react';
import styled from 'styled-components';
import { useGeolocation } from '../hooks/useGeolocation';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 5px;
  
  &:hover {
    background: #0056b3;
  }
`;

const ResultBox = styled.div`
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  font-family: monospace;
  font-size: 14px;
`;

const ErrorBox = styled.div`
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #721c24;
`;

const SuccessBox = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #155724;
`;

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #856404;
`;

const InfoBox = styled.div`
  margin-top: 30px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 6px;
`;

export default function TestGeolocation() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { forceHighAccuracyCapture, validateAccuracy, clearGeolocationCache: clearCacheFromHook } = useGeolocation();

  // Função para calcular distância entre duas coordenadas (em metros)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Raio da Terra em metros
    const φ1 = lat1 * Math.PI/180; // φ, λ em radianos
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // em metros
  };

  // Função para verificar permissão de geolocalização
  const checkGeolocationPermission = async () => {
    if (!navigator.geolocation) {
      return { status: 'unsupported', message: 'Geolocalização não suportada' };
    }

    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return { 
          status: permission.state, 
          message: `Permissão: ${permission.state}`,
          permission 
        };
      } catch (error) {
        return { 
          status: 'unknown', 
          message: 'Não foi possível verificar permissão' 
        };
      }
    } else {
      return { 
        status: 'unknown', 
        message: 'API de permissões não suportada' 
      };
    }
  };

  // Função para limpar cache de geolocalização
  const clearGeolocationCache = () => {
    console.log('🧹 Tentando limpar cache de geolocalização...');
    // Forçar nova captura sem cache
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log('📍 Nova posição capturada (sem cache):', position);
      },
      (error) => {
        console.log('❌ Erro ao capturar nova posição:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0 // Forçar nova captura
      }
    );
  };

  const testCurrentLocation = async () => {
    setLoading(true);
    setResults([]);

    if (!navigator.geolocation) {
      setResults([{ type: 'error', title: 'Geolocalização não suportada', message: 'Seu navegador não suporta geolocalização' }]);
      setLoading(false);
      return;
    }

    // Verificar permissão primeiro
    const permissionCheck = await checkGeolocationPermission();
    console.log('🔍 Status da permissão:', permissionCheck);
    
    setResults([{
      type: 'info',
      title: 'Status da Permissão',
      data: permissionCheck
    }]);

    // Teste 1: Geollocalização simples
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        
        const result1 = {
          type: 'info',
          title: '📍 Coordenadas Capturadas',
          data: {
            latitude,
            longitude,
            accuracy: `${accuracy}m`,
            timestamp: new Date().toISOString()
          }
        };
        setResults(prev => [...prev, result1]);

        // Teste 2: Geocoding reverso via API interna
        try {
          const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`);
          
          if (response.ok) {
            const data = await response.json();
            
            const result2 = {
              type: 'info',
              title: '🔄 Geocoding Reverso (API Interna)',
              data: {
                endereco: data.address,
                fonte: data.source || 'api_interna',
                success: data.success
              }
            };
            setResults(prev => [...prev, result2]);

            // Teste 3: Validar precisão das coordenadas
            const accuracyValidation = validateAccuracy(accuracy);
            const result3 = {
              type: accuracyValidation.isValid ? 'success' : 'warning',
              title: '🎯 Validação de Precisão',
              data: {
                precisao: `${accuracy.toFixed(1)}m`,
                validacao: accuracyValidation.message,
                status: accuracyValidation.isValid ? 'PRECISÃO ACEITÁVEL' : 'PRECISÃO BAIXA'
              }
            };
            setResults(prev => [...prev, result3]);

            // Teste 4: Informações de rede
            const result4 = {
              type: 'info',
              title: '📡 Informações de Rede',
              data: {
                userAgent: navigator.userAgent,
                online: navigator.onLine,
                language: navigator.language,
                platform: navigator.platform
              }
            };
            setResults(prev => [...prev, result4]);
          } else {
            setResults(prev => [...prev, { type: 'error', title: 'Erro na API de geocoding', message: 'Resposta não OK' }]);
          }
        } catch (error) {
          setResults(prev => [...prev, { type: 'error', title: 'Erro no geocoding', message: error.message }]);
        }

        setLoading(false);
      },
      (error) => {
        setResults([{ type: 'error', title: 'Erro de geolocalização', message: error.message }]);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0
      }
    );
  };

  const testBigDataCloud = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/geocoding?lat=-23.6191744&lon=-46.6419712');
      const data = await response.json();
      
      setResults([{
        type: 'info',
        title: '🌐 Teste da API Interna',
        data: data
      }]);
    } catch (error) {
      setResults([{ type: 'error', title: 'Erro na API interna', message: error.message }]);
    }
    
    setLoading(false);
  };

  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    
    let formatted = '';
    if (address.road || address.street) {
      const streetName = address.road || address.street;
      const houseNumber = address.house_number || address.houseNumber;
      if (houseNumber) {
        formatted += `${streetName}, ${houseNumber}, `;
      } else {
        formatted += `${streetName}, `;
      }
    }
    
    if (address.suburb || address.neighbourhood) {
      formatted += `${address.suburb || address.neighbourhood}, `;
    }
    
    if (address.city || address.town) {
      formatted += `${address.city || address.town}, `;
    }
    
    if (address.state) {
      formatted += `${address.state}, `;
    }
    
    if (address.country) {
      formatted += `${address.country}`;
    }
    
    if (address.postcode) {
      formatted += ` - CEP: ${address.postcode}`;
    }
    
    return formatted.trim();
  };


  return (
    <Container>
      <Title>🔍 Teste de Geolocalização</Title>
      
      <p>Este teste vai verificar se as coordenadas capturadas correspondem ao endereço real.</p>
      
      <div>
        <Button onClick={testCurrentLocation} disabled={loading}>
          {loading ? 'Testando...' : '📍 Testar Geolocalização Atual'}
        </Button>
        
        <Button onClick={testBigDataCloud} disabled={loading}>
          {loading ? 'Testando...' : '🌐 Testar API Interna'}
        </Button>

        <Button onClick={async () => {
          setLoading(true);
          setResults([]);
          try {
            const result = await forceHighAccuracyCapture();
            setResults([{
              type: result.accuracyValidation?.isValid ? 'success' : 'warning',
              title: 'Captura de Alta Precisão',
              data: result
            }]);
          } catch (error) {
            setResults([{
              type: 'error',
              title: 'Erro na captura de alta precisão',
              data: error
            }]);
          }
          setLoading(false);
        }} disabled={loading}>
          {loading ? 'Capturando...' : '🎯 Captura de Alta Precisão'}
        </Button>

        <Button onClick={() => {
          clearCacheFromHook();
          setResults([]);
        }} disabled={loading}>
          🧹 Limpar Cache GPS
        </Button>
      </div>

      {results.map((result, index) => (
        <div key={index}>
          {result.type === 'error' && (
            <ErrorBox>
              <strong>{result.title}</strong>
              <pre>{JSON.stringify(result.data || result.message, null, 2)}</pre>
            </ErrorBox>
          )}
          
          {result.type === 'success' && (
            <SuccessBox>
              <strong>{result.title}</strong>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </SuccessBox>
          )}
          
          {result.type === 'warning' && (
            <WarningBox>
              <strong>{result.title}</strong>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </WarningBox>
          )}
          
          {result.type === 'info' && (
            <ResultBox>
              <strong>{result.title}</strong>
              <pre>{JSON.stringify(result.data, null, 2)}</pre>
            </ResultBox>
          )}
        </div>
      ))}

      <InfoBox>
        <h3>📋 Instruções:</h3>
        <ol>
          <li>Clique em "Testar Geolocalização Atual"</li>
          <li>Permita acesso à localização quando solicitado</li>
          <li>Aguarde até 30 segundos para máxima precisão</li>
          <li>Compare as coordenadas capturadas com o endereço real</li>
          <li>Verifique a distância calculada</li>
        </ol>
        
        <h3>🎯 Critérios de Avaliação:</h3>
        <ul>
          <li><strong>✅ Distância ≤ 100m:</strong> Geolocalização correta</li>
          <li><strong>⚠️ Distância 100-1000m:</strong> Precisão aceitável</li>
          <li><strong>❌ Distância &gt; 1000m:</strong> Problema na geolocalização</li>
        </ul>
      </InfoBox>
    </Container>
  );
}
