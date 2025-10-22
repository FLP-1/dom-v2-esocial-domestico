/* eslint-disable no-alert, jsx-a11y/accessible-emoji, react/no-unescaped-entities */
import { logger } from '../utils/logger';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useGeolocation } from '../hooks/useGeolocation';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: ${props => props.theme?.text?.primary || '#333'};
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: ${props => props.theme?.navigation?.primary || '#007bff'};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin: 10px 5px;
  
  &:hover {
    background: ${props => props.theme?.navigation?.primary || '#0056b3'};
  }
  
  &:disabled {
    background: ${props => props.theme?.text?.secondary || '#6c757d'};
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  background: ${props => props.theme?.background?.secondary || '#f8f9fa'};
  border: 1px solid ${props => props.theme?.border?.primary || '#dee2e6'};
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  font-family: monospace;
  font-size: 14px;
  white-space: pre-wrap;
  word-break: break-word;
`;

const ErrorBox = styled.div`
  background: ${props => props.theme?.status?.error?.background || '#f8d7da'};
  border: 1px solid ${props => props.theme?.status?.error?.border || '#f5c6cb'};
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: ${props => props.theme?.status?.error?.text || '#721c24'};
`;

const SuccessBox = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #155724;
`;

const InfoBox = styled.div`
  margin-top: 30px;
  padding: 15px;
  background-color: #e9ecef;
  border-radius: 6px;
`;

const YellowBox = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
`;

const TipList = styled.ol`
  margin-left: 20px;
  margin-top: 5px;
`;

const SmallNote = styled.p`
  margin-top: 10px;
  font-size: 12px;
`;

const SuccessAltBox = styled.div`
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #155724;
`;

const WarnAltBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 15px;
  margin: 10px 0;
  color: #856404;
`;

const BlueBox = styled.div`
  margin-top: 15px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 4px;
`;

const LinkStyled = styled.a`
  color: #1976d2;
  text-decoration: underline;
  word-break: break-all;
`;

export default function TestGeolocation() {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { getCurrentPosition } = useGeolocation();

  const testGeolocation = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      logger.geo('🎯 Iniciando teste de geolocalização...');
      logger.geo('📊 DIAGNÓSTICO: Vou testar EXATAMENTE como Google Maps faz');
      
      // Teste 1: Verificar permissões
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        logger.geo('🔐 Permissão:', permission.state);
      }
      
      // Teste 2: Verificar se Windows Location está ativo
      logger.geo('💻 Windows Location Service: Verifique em Configurações → Privacidade → Localização');
      
      const locationData = await getCurrentPosition();
      
      logger.geo('✅ Localização capturada com sucesso:', locationData);
      logger.geo('📍 Cole as coordenadas no Google Maps para comparar:', 
        `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`);
      
      setResult({
        timestamp: new Date().toISOString(),
        ...locationData,
        googleMapsLink: `https://www.google.com/maps?q=${locationData.latitude},${locationData.longitude}`
      });
    } catch (err: any) {
      logger.error('❌ Erro ao capturar localização:', err);
      setError(err.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    try {
      const keys = Object.keys(localStorage);
      let cleared = 0;
      
      keys.forEach(key => {
        if (key.startsWith('geocoding_')) {
          localStorage.removeItem(key);
          cleared++;
        }
      });
      
      alert(`Cache limpo! ${cleared} entrada(s) removida(s).`);
    } catch (err) {
      alert('Erro ao limpar cache');
    }
  };

  return (
    <Container>
      <Title>🧪 Teste de Geolocalização</Title>
      
      <InfoBox>
        <h3>ℹ️ Informações - Versão Aprimorada</h3>
        <p><strong>🎯 Nova abordagem para melhor precisão:</strong></p>
        <ul>
          <li><strong>watchPosition</strong>: Recebe múltiplas atualizações GPS até estabilizar</li>
          <li><strong>Validação IP</strong>: Compara com localização por IP para detectar erros</li>
          <li><strong>Melhor resultado</strong>: Retorna a posição mais precisa obtida</li>
          <li><strong>Reverse geocoding</strong>: Converte coordenadas em endereço</li>
        </ul>
        <p><strong>Meta de precisão:</strong> ≤ 50 metros (mobile) | ≤ 200 metros (desktop)</p>
        
        <YellowBox>
          <strong>⚠️ Dicas para melhor precisão:</strong>
          <TipList>
            <li><strong>Permissão:</strong> Na 1ª vez, clique em "Permitir" quando o navegador pedir</li>
            <li><strong>Localização:</strong> Aproxime-se de uma janela (melhora sinal)</li>
            <li><strong>Aguarde:</strong> O teste fará 3 tentativas com intervalo de 2s</li>
            <li><strong>Mobile:</strong> Ative GPS nas configurações do sistema</li>
          </TipList>
          <SmallNote>
            <strong>🔧 Pedindo permissão sempre?</strong> Chrome → Configurações do site (🔒 ao lado da URL) → Localização → Permitir
          </SmallNote>
        </YellowBox>
      </InfoBox>

      <div>
        <Button onClick={testGeolocation} disabled={loading}>
          {loading ? '⏳ Capturando...' : '📍 Testar Geolocalização'}
        </Button>
        
        <Button onClick={clearCache} disabled={loading}>
          🧹 Limpar Cache
        </Button>
      </div>

      {loading && (
        <InfoBox>
          <p>⏳ Capturando localização com alta precisão...</p>
          <p><strong>O que está acontecendo:</strong></p>
          <ul>
            <li>Fazendo múltiplas leituras para melhor precisão</li>
            <li>Aguardando GPS/WiFi estabilizar</li>
            <li>Pode levar até 10 segundos</li>
          </ul>
          <p><strong>ℹ️ Sobre permissão:</strong> Na primeira vez, o navegador pede permissão (é normal e obrigatório por segurança).</p>
        </InfoBox>
      )}

      {error && (
        <ErrorBox>
          <h4>❌ Erro</h4>
          <p>{error}</p>
        </ErrorBox>
      )}

      {result && (
        <>
          {result.accuracy <= 50 ? (
            <SuccessBox>
              <h4>✅ Localização Excelente!</h4>
              <p><strong>Precisão:</strong> {result.accuracy?.toFixed(1)}m ✅</p>
              <p><strong>Dispositivo:</strong> {result.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</p>
            </SuccessBox>
          ) : result.accuracy <= 200 ? (
            <SuccessAltBox>
              <h4>✅ Localização Boa</h4>
              <p><strong>Precisão:</strong> {result.accuracy?.toFixed(1)}m</p>
              <p><strong>Dispositivo:</strong> {result.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</p>
              <p>Precisão aceitável para validação de presença.</p>
            </SuccessAltBox>
          ) : result.accuracy <= 1000 ? (
            <WarnAltBox>
              <h4>⚠️ Localização com Precisão Baixa</h4>
              <p><strong>Precisão:</strong> {result.accuracy?.toFixed(1)}m</p>
              <p><strong>Dispositivo:</strong> {result.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</p>
              <p>Tente: se aproximar de janela, verificar permissões, ou aguardar alguns segundos e tentar novamente.</p>
            </WarnAltBox>
          ) : (
            <ErrorBox>
              <h4>❌ Precisão Muito Ruim</h4>
              <p><strong>Precisão:</strong> {result.accuracy?.toFixed(1)}m</p>
              <p><strong>Dispositivo:</strong> {result.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</p>
              <p>Verifique permissões de localização no navegador e sistema operacional.</p>
            </ErrorBox>
          )}

          <ResultBox>
            <h4>📊 Dados Completos:</h4>
            {JSON.stringify(result, null, 2)}
          </ResultBox>

          <InfoBox>
            <h4>📍 Resumo:</h4>
            <p><strong>Tipo de Dispositivo:</strong> {result.deviceType === 'desktop' ? '💻 Desktop' : '📱 Mobile'}</p>
            <p><strong>Endereço:</strong> {result.address || 'Não disponível'}</p>
            <p><strong>Latitude:</strong> {result.latitude?.toFixed(6)}</p>
            <p><strong>Longitude:</strong> {result.longitude?.toFixed(6)}</p>
            <p><strong>Precisão:</strong> {result.accuracy?.toFixed(1)} metros</p>
            <p><strong>WiFi/Rede:</strong> {result.wifiName || 'Não detectado'}</p>
            <p><strong>Tipo de Conexão:</strong> {result.networkInfo?.connectionType || 'Desconhecido'}</p>
            <p><strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString('pt-BR')}</p>
            
            {result.googleMapsLink && (
              <BlueBox>
                <p><strong>🗺️ Comparar com Google Maps:</strong></p>
                <LinkStyled 
                  href={result.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir coordenadas no Google Maps
                </LinkStyled>
                <SmallNote>
                  ☝️ Clique para ver se a localização está correta no Google Maps
                </SmallNote>
              </BlueBox>
            )}
          </InfoBox>
        </>
      )}
    </Container>
  );
}
