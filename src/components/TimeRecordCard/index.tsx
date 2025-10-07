import React, { ReactNode, useCallback } from 'react';
import styled, { keyframes, css } from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard } from '../unified';
import { useGeolocationCapture } from '../../hooks/useGeolocationCapture';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

// Styled Components
const TimeRecordContainer = styled.div<{
  $theme: any;
  $status: 'available' | 'completed' | 'pending' | 'disabled';
  $clickable: boolean;
}>`
  position: relative;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  ${props => props.$clickable && `
    cursor: pointer;
    
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 40px ${props.$theme.colors.shadow};
    }
    
    &:active {
      transform: translateY(-2px);
    }
  `}

  ${props => props.$status === 'completed' && css`
    animation: ${fadeIn} 0.6s ease-out, ${pulse} 2s infinite;
  `}

  ${props => props.$status === 'disabled' && `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `}
`;

const TimeDisplay = styled.div<{ $theme: any; $status: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  text-align: center;

  .time-value {
    font-size: 1.5rem;
    font-weight: 700;
    color: ${props => {
      switch (props.$status) {
        case 'completed':
          return props.$theme.colors.primary;
        case 'pending':
          return '#f39c12';
        case 'available':
          return props.$theme.colors.text;
        case 'disabled':
          return '#bdc3c7';
        default:
          return props.$theme.colors.text;
      }
    }};
    line-height: 1.2;
  }

  .time-label {
    font-size: 0.9rem;
    font-weight: 600;
    color: ${props => {
      switch (props.$status) {
        case 'completed':
          return props.$theme.colors.primary;
        case 'pending':
          return '#e67e22';
        case 'available':
          return '#2c3e50';
        case 'disabled':
          return '#95a5a6';
        default:
          return '#2c3e50';
      }
    }};
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .time-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: ${props => props.$status === 'disabled' ? 0.5 : 1};
  }
`;

const StatusIndicator = styled.div<{
  $status: 'available' | 'completed' | 'pending' | 'disabled';
  $theme: any;
}>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'completed':
        return props.$theme.colors.primary;
      case 'pending':
        return '#f39c12';
      case 'available':
        return '#27ae60';
      case 'disabled':
        return '#bdc3c7';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LocationInfo = styled.div<{ $theme: any }>`
  margin-top: 1rem;
  padding: 0.75rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}20;
  
  .location-text {
    font-size: 0.8rem;
    color: ${props => props.$theme.colors.textSecondary || '#7f8c8d'};
    margin: 0 0 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .wifi-text {
    font-size: 0.8rem;
    color: ${props => props.$theme.colors.textSecondary || '#7f8c8d'};
    margin: 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const ObservationSection = styled.div<{ $theme: any }>`
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  
  .observation-label {
    font-size: 0.8rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.5rem 0;
  }
  
  .observation-text {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin: 0;
    font-style: italic;
  }
`;

const ApprovalBadge = styled.div<{ $theme: any; $approved: boolean }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$approved ? '#27ae60' : '#f39c12'};
  color: white;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// Interfaces
export interface TimeRecord {
  id: string;
  type: 'entrada' | 'saida_almoco' | 'retorno_almoco' | 'saida' | 'inicio_extra' | 'fim_extra';
  time?: string;
  location?: string;
  wifi?: string;
  employeeObservation?: string;
  employerObservation?: string;
  approved?: boolean;
  timestamp?: Date;
}

export interface TimeRecordCardProps {
  record: TimeRecord;
  theme: any;
  onClick?: () => void;
  isDisabled?: boolean;
  // Propriedades para captura automática de geolocalização
  $criticalAction?: boolean;
  $actionName?: string;
}

// Configurações dos tipos de registro
const recordConfig = {
  entrada: {
    label: 'Entrada',
    icon: '🕐',
    color: '#27ae60',
  },
  saida_almoco: {
    label: 'Saída Almoço',
    icon: '🍽️',
    color: '#f39c12',
  },
  retorno_almoco: {
    label: 'Retorno Almoço',
    icon: '🔄',
    color: '#3498db',
  },
  saida: {
    label: 'Saída',
    icon: '🏠',
    color: '#e74c3c',
  },
  inicio_extra: {
    label: 'Início Hora Extra',
    icon: '⏰',
    color: '#9b59b6',
  },
  fim_extra: {
    label: 'Fim Hora Extra',
    icon: '⏹️',
    color: '#34495e',
  },
};

export const TimeRecordCard: React.FC<TimeRecordCardProps> = ({
  record,
  theme,
  onClick,
  isDisabled = false,
  $criticalAction = true, // Por padrão, registros de ponto são críticos
  $actionName,
}) => {
  const { createCriticalButtonHandler } = useGeolocationCapture();
  const config = recordConfig[record.type];
  const status = record.time ? 'completed' : isDisabled ? 'disabled' : 'available';
  const clickable = !isDisabled && !record.time;
  
  // Nome da ação baseado no tipo de registro
  const actionName = $actionName || `Registro de ${config.label}`;

  const handleClick = useCallback(async () => {
    if (clickable && onClick) {
      // Só capturar geolocalização quando o usuário REALMENTE clicar
      if ($criticalAction) {
        console.log(`🎯 Registro de ponto crítico: ${actionName}`);
        const criticalHandler = createCriticalButtonHandler(onClick, actionName);
        await criticalHandler();
      } else {
        onClick();
      }
    }
  }, [clickable, onClick, $criticalAction, actionName, createCriticalButtonHandler]);

  return (
    <TimeRecordContainer
      $theme={theme}
      $status={status}
      $clickable={clickable}
      onClick={handleClick}
    >
      <UnifiedCard
        theme={theme}
        variant="default"
        size="md"
        interactive={clickable}
        onClick={handleClick}
        aria-label={`${config.label} - ${record.time || 'Clique para registrar'}`}
      >
        {record.type.includes('extra') && record.approved !== undefined && (
          <ApprovalBadge $theme={theme} $approved={record.approved}>
            {record.approved ? 'Aprovado' : 'Pendente'}
          </ApprovalBadge>
        )}

        {status === 'completed' && (
          <StatusIndicator $status={status} $theme={theme}>
            Registrado
          </StatusIndicator>
        )}

        <TimeDisplay $theme={theme} $status={status}>
          <div className="time-icon">
            <AccessibleEmoji emoji={config.icon} label={config.label} />
          </div>
          <div className="time-value">
            {record.time || '--:--'}
          </div>
          <div className="time-label">
            {config.label}
          </div>
        </TimeDisplay>

        {record.time && (
          <>
            {(record.location || record.wifi) && (
              <LocationInfo $theme={theme}>
                {record.location && (
                  <p className="location-text">
                    <AccessibleEmoji emoji="📍" label="Localização" />
                    {record.location}
                  </p>
                )}
                {record.wifi && (
                  <p className="wifi-text">
                    <AccessibleEmoji emoji="📶" label="WiFi" />
                    {record.wifi}
                  </p>
                )}
              </LocationInfo>
            )}

            {(record.employeeObservation || record.employerObservation) && (
              <ObservationSection $theme={theme}>
                {record.employeeObservation && (
                  <>
                    <p className="observation-label">Observação do Empregado:</p>
                    <p className="observation-text">{record.employeeObservation}</p>
                  </>
                )}
                {record.employerObservation && (
                  <>
                    <p className="observation-label">Observação do Empregador:</p>
                    <p className="observation-text">{record.employerObservation}</p>
                  </>
                )}
              </ObservationSection>
            )}
          </>
        )}
      </UnifiedCard>
    </TimeRecordContainer>
  );
};

export default TimeRecordCard;
