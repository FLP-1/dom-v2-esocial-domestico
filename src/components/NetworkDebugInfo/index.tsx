// src/components/NetworkDebugInfo/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { networkFingerprintingService } from '../../services/antifraude/network-fingerprinting';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useNetworkDetection } from '../../hooks/useNetworkDetection';

interface DebugInfo {
  timestamp: string;
  networkDetection: any;
  fingerprint: any;
  analysis: any;
}

const DebugContainer = styled.div`
  background: ${props => props.theme?.background?.secondary || '#f8f9fa'};
  border: 1px solid ${props => props.theme?.border?.secondary || '#e9ecef'};
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
  font-family: monospace;
  font-size: 0.8rem;
`;

const DebugSection = styled.div`
  margin-bottom: 1rem;
  
  h4 {
    color: ${props => props.theme?.text?.secondary || '#495057'};
    margin: 0 0 0.5rem 0;
    font-size: 0.9rem;
  }
  
  pre {
    background: ${props => props.theme?.background?.primary || '#ffffff'};
    border: 1px solid ${props => props.theme?.border?.primary || '#dee2e6'};
    border-radius: 4px;
    padding: 0.5rem;
    margin: 0;
    overflow-x: auto;
    white-space: pre-wrap;
  }
`;

const RefreshButton = styled.button`
  background: ${props => props.theme?.navigation?.primary || '#007bff'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  margin-bottom: 1rem;
  
  &:hover {
    background: ${props => props.theme?.navigation?.primary || '#0056b3'};
  }
`;

const NetworkDebugInfo: React.FC = () => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // ✅ Hook unificado de detecção de rede (inclui SSID real)
  const networkDetection = useNetworkDetection({ 
    enableLogging: true, 
    enableRealSSID: true 
  });

  const collectDebugInfo = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Gerar fingerprint
      const fingerprint = await networkFingerprintingService.generateNetworkFingerprint();
      
      // Análise de rede
      const analysis = await networkFingerprintingService.analyzeNetwork(fingerprint);

      const info: DebugInfo = {
        timestamp: new Date().toISOString(),
        networkDetection: networkDetection,
        fingerprint: fingerprint,
        analysis: analysis
      };

      setDebugInfo(info);
    } catch (err: any) {
      setError(err.message || 'Erro ao coletar informações');
    } finally {
      setLoading(false);
    }
  }, [networkDetection]);

  useEffect(() => {
    collectDebugInfo();
  }, [collectDebugInfo]);

  if (error) {
    return (
      <DebugContainer>
        <h3><span role="img" aria-label="Erro">❌</span> Erro ao Coletar Dados de Rede</h3>
        <p>{error}</p>
        <RefreshButton onClick={collectDebugInfo}>
          Tentar Novamente
        </RefreshButton>
      </DebugContainer>
    );
  }

  return (
    <DebugContainer>
      <h3><span role="img" aria-label="Lupa">🔍</span> Dados de Rede Capturados Automaticamente</h3>
      
      <RefreshButton onClick={collectDebugInfo} disabled={loading}>
        {loading ? 'Coletando...' : <><span role="img" aria-label="Atualizar">🔄</span> Atualizar Dados</>}
      </RefreshButton>

      {debugInfo && (
        <>
          <DebugSection>
            <h4><span role="img" aria-label="Sinal">📶</span> Detecção de Rede (useNetworkDetection)</h4>
            <pre>{JSON.stringify(debugInfo.networkDetection, null, 2)}</pre>
          </DebugSection>

          <DebugSection>
            <h4><span role="img" aria-label="Lupa">🔍</span> Fingerprint de Rede (networkFingerprintingService)</h4>
            <pre>{JSON.stringify(debugInfo.fingerprint, null, 2)}</pre>
          </DebugSection>

          <DebugSection>
            <h4><span role="img" aria-label="Escudo">🛡️</span> Análise de Risco e Antifraude</h4>
            <pre>{JSON.stringify(debugInfo.analysis, null, 2)}</pre>
          </DebugSection>

          <DebugSection>
            <h4><span role="img" aria-label="Localização">📍</span> Dados de Endereço</h4>
            <pre>{JSON.stringify({
              endereco: debugInfo.fingerprint?.address || 'Não disponível',
              coordenadas: {
                latitude: debugInfo.fingerprint?.latitude || 'Não disponível',
                longitude: debugInfo.fingerprint?.longitude || 'Não disponível'
              },
              precisao: debugInfo.fingerprint?.accuracy || 'Não disponível'
            }, null, 2)}</pre>
          </DebugSection>

          <DebugSection>
            <h4><span role="img" aria-label="Sinal">📶</span> SSID Real do Sistema Operacional (Integrado)</h4>
            <pre>{JSON.stringify({
              realSSID: debugInfo.networkDetection?.realSSID || 'Não detectado',
              ssidPlatform: debugInfo.networkDetection?.ssidPlatform || 'desconhecido',
              ssidLoading: debugInfo.networkDetection?.ssidLoading || false,
              ssidError: debugInfo.networkDetection?.ssidError || null,
              wifiName: debugInfo.networkDetection?.wifiName || 'Não detectado',
              connectionType: debugInfo.networkDetection?.connectionType || 'desconhecido'
            }, null, 2)}</pre>
          </DebugSection>
        </>
      )}
    </DebugContainer>
  );
};

export default NetworkDebugInfo;
