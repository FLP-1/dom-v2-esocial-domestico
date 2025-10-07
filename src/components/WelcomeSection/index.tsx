import AccessibleEmoji from '../AccessibleEmoji';
// src/components/WelcomeSection/index.tsx
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useGeolocation } from '../../hooks/useGeolocation';

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
`;

const WifiInfo = styled.span`
  color: #28a745;
  font-weight: 500;
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
  const [currentTime, setCurrentTime] = useState(new Date());
  // Hook de geolocalização para atualizações automáticas (após login)
  const { location, wifiName, isLoading, error, refreshLocation } = useGeolocation();

  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Inicializar geolocalização no WelcomeSection (usuário já fez login = já deu consentimento)
  useEffect(() => {
    // Só inicializar se há um perfil ativo (usuário logado)
    if (currentProfile) {
      console.log('📍 Inicializando geolocalização no WelcomeSection (usuário logado)');
      refreshLocation();
    }
  }, [currentProfile, refreshLocation]);


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
            <span className="icon">👤</span>
            <span>{userRole}</span>
          </InfoRow>
          <InfoRow>
            <span className="icon">📅</span>
            <span>{currentDate}</span>
            <span className="icon">⏰</span>
            <TimeDisplay>{currentTimeString}</TimeDisplay>
          </InfoRow>
          <InfoRow>
            <span className="icon">📍</span>
            <LocationInfo>
              {isLoading ? 'Carregando localização...' : 
               error ? 'Localização indisponível' : 
               location || 'Localização não disponível'}
            </LocationInfo>
          </InfoRow>
          <InfoRow>
            <span className="icon">📶</span>
            <WifiInfo>
              {wifiName || 'WiFi não detectado'}
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
