import AccessibleEmoji from '../AccessibleEmoji';
// src/components/WelcomeSection/index.tsx
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useGeolocationContext } from '../../contexts/GeolocationContext';
// Hook de geolocalização removido - solicitação manual apenas

interface WelcomeSectionProps {
  $theme: any;
  userAvatar: string;
  userName: string;
  userRole: string;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const WelcomeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const UserAvatar = styled.div<{ $theme: any }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: linear-gradient(
    135deg,
    ${props => props.$theme.colors.primary},
    ${props => props.$theme.colors.secondary}
  );
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px ${props => props.$theme.colors.primary}50;
`;

const WelcomeText = styled.div`
  h3 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.25rem 0;
  }

  p {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0;
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6c757d;
  
  .icon {
    font-size: 0.9rem;
    opacity: 0.8;
  }
`;

const TimeDisplay = styled.span`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #495057;
`;

const LocationInfo = styled.span`
  font-style: italic;
  
  .location-details {
    font-size: 0.75rem;
    opacity: 0.8;
  }
`;

const WifiInfo = styled.span`
  color: #28a745;
  font-weight: 500;
`;

const StatusBadge = styled.span<{ $variant?: 'ok' | 'warn' | 'pending' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 600;
  color: ${({ $variant }) => ($variant === 'warn' ? '#a15c00' : $variant === 'pending' ? '#8a6d3b' : '#155724')};
  background: ${({ $variant }) => ($variant === 'warn' ? '#fff3cd' : $variant === 'pending' ? '#ffeeba' : '#d4edda')};
  border: 1px solid ${({ $variant }) => ($variant === 'warn' ? '#ffeeba' : $variant === 'pending' ? '#ffe8a1' : '#c3e6cb')};
`;


const NotificationContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const NotificationButton = styled.button<{ $theme: any }>`
  background: ${props => props.$theme.colors.primary}20;
  border: 1px solid ${props => props.$theme.colors.primary}40;
  border-radius: 12px;
  padding: 0.75rem;
  color: ${props => props.$theme.colors.primary};
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props => props.$theme.colors.primary}30;
    transform: translateY(-2px);
  }

  .notification-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #e74c3c;
    color: white;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.7rem;
    font-weight: 600;
  }
`;

export default function WelcomeSection({
  $theme,
  userAvatar,
  userName,
  userRole,
  notificationCount = 0,
  onNotificationClick,
}: WelcomeSectionProps) {
  const { currentProfile } = useUserProfile();
  const { lastLocation, lastCaptureLocation, lastCaptureStatus } = useGeolocationContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  
  // Informações de WiFi detectadas sem solicitar permissão de geolocalização
  const [wifiName, setWifiName] = useState<string>('WiFi não detectado');

  // Atualizar hora a cada segundo
  useEffect(() => {
    setIsClient(true);
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Detectar informações de rede WiFi sem solicitar geolocalização
  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          const type = connection.type;
          const downlink = connection.downlink;
          
          // Detectar se é WiFi ou conexão móvel
          if (type === 'wifi' || type === 'ethernet') {
            setWifiName('WiFi: Conectado');
          } else if (type === 'cellular') {
            setWifiName(`Dados Móveis: ${effectiveType || '4G'}`);
          } else if (downlink && downlink > 10) {
            setWifiName('WiFi: Conectado');
          } else if (effectiveType === '4g' && type === undefined) {
            setWifiName('WiFi: Conectado');
          } else if (effectiveType && effectiveType !== '4g') {
            setWifiName(`Conexão: ${effectiveType}`);
          } else {
            setWifiName('WiFi: Conectado');
          }
        } else {
          setWifiName('WiFi: Conectado');
        }
      } else {
        setWifiName('WiFi: Conectado');
      }
    };

    updateConnectionInfo();

    // Escutar mudanças na conexão
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection && connection.addEventListener) {
        connection.addEventListener('change', updateConnectionInfo);
        return () => connection.removeEventListener('change', updateConnectionInfo);
      }
    }
  }, []);


  // Usar nickname do contexto se disponível, senão usar o nome passado como prop
  const displayName = currentProfile?.nickname || userName;
  const currentDate = currentTime.toLocaleDateString('pt-BR');
  const currentTimeString = currentTime.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <WelcomeContainer>
      <UserAvatar $theme={$theme}>{userAvatar}</UserAvatar>
      <WelcomeText>
        <h3>Bem-vindo(a), {displayName}!</h3>
        <InfoContainer>
          <InfoRow>
            <span className="icon"><AccessibleEmoji emoji="👤" label="Usuário" /></span>
            <span>{userRole}</span>
          </InfoRow>
          <InfoRow>
            <span className="icon"><AccessibleEmoji emoji="📅" label="Data" /></span>
            <span>{currentDate}</span>
            <span className="icon"><AccessibleEmoji emoji="⏰" label="Hora" /></span>
            <TimeDisplay suppressHydrationWarning>{isClient ? currentTimeString : ''}</TimeDisplay>
          </InfoRow>
          <InfoRow>
            <span className="icon"><AccessibleEmoji emoji="📍" label="Localização" /></span>
            <LocationInfo>
              {lastCaptureLocation ? (
                <>
                  {lastCaptureLocation.address || 'Endereço não disponível'}
                  <br />
                  <small className="location-details">
                    Usada no registro • Precisão: {Math.round(lastCaptureLocation.accuracy)}m | {new Date(lastCaptureLocation.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                  {' '}
                  {lastCaptureStatus?.imprecise && (
                    <StatusBadge $variant='warn'>Imprecisa</StatusBadge>
                  )}
                  {lastCaptureStatus?.pending && (
                    <StatusBadge $variant='pending'>Pendente</StatusBadge>
                  )}
                </>
              ) : lastLocation ? (
                <>
                  {lastLocation.address || 'Endereço não disponível'}
                  <br />
                  <small className="location-details">
                    Melhor recente • Precisão: {Math.round(lastLocation.accuracy)}m | {new Date(lastLocation.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </>
              ) : (
                'Localização será exibida após registrar o ponto'
              )}
            </LocationInfo>
          </InfoRow>
          <InfoRow>
            <span className="icon"><AccessibleEmoji emoji="📶" label="WiFi" /></span>
            <WifiInfo>
              {lastLocation?.wifiName || wifiName || 'WiFi não detectado'}
            </WifiInfo>
          </InfoRow>
        </InfoContainer>
      </WelcomeText>
      {notificationCount > 0 && (
        <NotificationContainer>
          <NotificationButton $theme={$theme} onClick={onNotificationClick}>
            <AccessibleEmoji emoji='🔔' label='Notificação' />
            <span className='notification-badge'>{notificationCount}</span>
          </NotificationButton>
        </NotificationContainer>
      )}
    </WelcomeContainer>
  );
}
