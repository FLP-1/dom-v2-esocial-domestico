import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { HelpText } from './shared/styles';

interface GeofencingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (justificativa: string) => void;
  coordenadas: {
    latitude: number;
    longitude: number;
    precisao: number;
  };
  localMaisProximo: {
    nome: string;
    distancia: number;
  } | null;
  distanciaMinima: number;
  endereco: string;
}

const ModalOverlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: ${props => props.isOpen ? 'flex' : 'none'};
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
`;

const ModalHeader = styled.div<{ $theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${props => props.$theme.colors.border.light};
`;

const ModalTitle = styled.h2<{ $theme: any }>`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.$theme.colors.text.dark};
  margin: 0;
`;

const CloseButton = styled.button<{ $theme: any }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: ${props => props.$theme.colors.text.secondary};
  padding: 4px;
  
  &:hover {
    color: ${props => props.$theme.colors.text.primary};
  }
`;

const AlertBox = styled.div<{ $theme: any }>`
  background-color: ${props => props.$theme.colors.status.warning.background};
  border: 1px solid ${props => props.$theme.colors.status.warning.border};
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const AlertTitle = styled.h3<{ $theme: any }>`
  color: ${props => props.$theme.colors.status.warning.text};
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const AlertText = styled.p<{ $theme: any }>`
  color: ${props => props.$theme.colors.status.warning.text};
  margin: 0;
  font-size: 0.95rem;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
`;

const InfoItem = styled.div<{ $theme: any }>`
  background-color: ${props => props.$theme.colors.background.secondary};
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
`;

const InfoLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 4px;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  color: #1f2937;
  font-weight: 600;
`;

const JustificativaSection = styled.div`
  margin-bottom: 24px;
`;

const JustificativaLabel = styled.label`
  display: block;
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 8px;
`;

const JustificativaTextarea = styled.textarea`
  width: 100%;
  min-height: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  
  ${props => props.variant === 'primary' ? `
    background-color: #3b82f6;
    color: white;
    
    &:hover {
      background-color: #2563eb;
    }
    
    &:disabled {
      background-color: #9ca3af;
      cursor: not-allowed;
    }
  ` : `
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;
    
    &:hover {
      background-color: #e5e7eb;
    }
  `}
`;

const GeofencingModal: React.FC<GeofencingModalProps> = ({
  isOpen,
  onClose,
  onApprove,
  coordenadas,
  localMaisProximo,
  distanciaMinima,
  endereco
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [justificativa, setJustificativa] = useState('');

  useEffect(() => {
    if (isOpen) {
      setJustificativa('');
    }
  }, [isOpen]);

  const handleApprove = () => {
    if (justificativa.trim()) {
      onApprove(justificativa.trim());
      onClose();
    }
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <ModalOverlay isOpen={isOpen}>
      <ModalContent>
        <ModalHeader>
          <ModalTitle><span role="img" aria-label="Proibido">🚫</span> Localização Fora do Raio Autorizado</ModalTitle>
          <CloseButton onClick={handleCancel}>×</CloseButton>
        </ModalHeader>

        <AlertBox>
          <AlertTitle><span role="img" aria-label="Atenção">⚠️</span> Atenção</AlertTitle>
          <AlertText>
            Sua localização atual está fora do raio autorizado para registro de ponto. 
            Para prosseguir, é necessário fornecer uma justificativa.
          </AlertText>
        </AlertBox>

        <InfoGrid>
          <InfoItem>
            <InfoLabel><span role="img" aria-label="Localização">📍</span> Coordenadas</InfoLabel>
            <InfoValue>
              {coordenadas.latitude.toFixed(6)}, {coordenadas.longitude.toFixed(6)}
            </InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel><span role="img" aria-label="Régua">📏</span> Precisão</InfoLabel>
            <InfoValue>{Math.round(coordenadas.precisao)}m</InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel><span role="img" aria-label="Prédio">🏢</span> Local Mais Próximo</InfoLabel>
            <InfoValue>
              {localMaisProximo ? localMaisProximo.nome : 'N/A'}
            </InfoValue>
          </InfoItem>
          
          <InfoItem>
            <InfoLabel><span role="img" aria-label="Régua">📐</span> Distância</InfoLabel>
            <InfoValue>
              {localMaisProximo ? `${localMaisProximo.distancia}m` : `${Math.round(distanciaMinima)}m`}
            </InfoValue>
          </InfoItem>
        </InfoGrid>

        <JustificativaSection>
          <JustificativaLabel>
            Justificativa para registro fora do local autorizado:
          </JustificativaLabel>
          <JustificativaTextarea
            value={justificativa}
            onChange={(e) => setJustificativa(e.target.value)}
            placeholder="Descreva o motivo para o registro de ponto neste local..."
            maxLength={500}
          />
          <HelpText $theme={theme} $size="sm">
            {justificativa.length}/500 caracteres
          </HelpText>
        </JustificativaSection>

        <ButtonGroup>
          <Button variant="secondary" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button 
            variant="primary" 
            onClick={handleApprove}
            disabled={!justificativa.trim()}
          >
            Aprovar e Registrar
          </Button>
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default GeofencingModal;
