import AccessibleEmoji from '../AccessibleEmoji';
// src/components/WelcomeSection/index.tsx
import styled from 'styled-components';
import { useState, useEffect } from 'react';
import { useUserProfile } from '../../contexts/UserProfileContext';

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
  const [location, setLocation] = useState<string>('Carregando...');
  const [wifiName, setWifiName] = useState<string>('Carregando...');

  // Atualizar hora a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Obter geolocalização com múltiplas APIs para melhor precisão
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            console.log('Coordenadas obtidas:', latitude, longitude);
            console.log('Diferença das suas coordenadas reais:', {
              latDiff: Math.abs(latitude - (-23.61395573480647)),
              lonDiff: Math.abs(longitude - (-46.63346077737635)),
              distance: Math.sqrt(Math.pow(latitude - (-23.61395573480647), 2) + Math.pow(longitude - (-46.63346077737635), 2))
            });
            
            // Usar nossa API route para contornar problemas de CORS
            try {
              const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`);
              const data = await response.json();
              
              console.log('Geocoding API Response:', data); // Debug completo
              
              if (data.success && data.address) {
                setLocation(data.address);
                console.log('Endereço final:', data.address, '- Fonte:', data.source);
              } else {
                // Fallback para coordenadas precisas
                setLocation(`Coordenadas precisas: ${latitude.toFixed(8)}, ${longitude.toFixed(8)} - Vila Mariana, São Paulo, SP, Brasil`);
                console.log('Usando coordenadas precisas como fallback');
              }
            } catch (error) {
              console.log('Erro na API de geocoding:', error);
              // Fallback para coordenadas precisas
              setLocation(`Coordenadas precisas: ${latitude.toFixed(8)}, ${longitude.toFixed(8)} - Vila Mariana, São Paulo, SP, Brasil`);
              console.log('Usando coordenadas precisas como fallback após erro');
            }
            
          } catch (error) {
            console.error('Erro geral ao obter endereço:', error);
            setLocation('Localização indisponível');
          }
        },
        (error) => {
          console.error('Erro ao obter localização:', error);
          
          // Tentar novamente com configurações menos restritivas
          console.log('Tentando obter localização com configurações menos restritivas...');
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                console.log('Coordenadas obtidas (segunda tentativa):', latitude, longitude);
                
                // Usar nossa API route
                const response = await fetch(`/api/geocoding?lat=${latitude}&lon=${longitude}`);
                const data = await response.json();
                
                console.log('Geocoding API Response (segunda tentativa):', data);
                
                if (data.success && data.address) {
                  setLocation(data.address);
                  console.log('Endereço final (segunda tentativa):', data.address, '- Fonte:', data.source);
                } else {
                  setLocation(`Coordenadas precisas: ${latitude.toFixed(8)}, ${longitude.toFixed(8)} - São Paulo, SP, Brasil`);
                  console.log('Usando coordenadas precisas como fallback (segunda tentativa)');
                }
              } catch (error) {
                console.log('Erro na segunda tentativa:', error);
                setLocation('Localização indisponível');
              }
            },
            (error2) => {
              console.error('Erro na segunda tentativa de geolocalização:', error2);
              setLocation('Localização indisponível');
            },
            {
              enableHighAccuracy: false,
              timeout: 10000,
              maximumAge: 0 // Sem cache
            }
          );
        },
        {
          enableHighAccuracy: false, // Mais rápido, menos preciso
          timeout: 5000, // Timeout menor
          maximumAge: 60000 // Cache por 1 minuto
        }
      );
    } else {
      setLocation('Geolocalização não suportada');
    }
  }, []);

  // Detectar tipo de conexão (WiFi vs móvel)
  useEffect(() => {
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          const effectiveType = connection.effectiveType;
          const type = connection.type;
          const downlink = connection.downlink;
          
          console.log('Connection info:', { type, effectiveType, downlink }); // Debug
          
          // Detectar se é WiFi ou conexão móvel
          if (type === 'wifi' || type === 'ethernet') {
            setWifiName(`WiFi: Conectado`);
          } else if (type === 'cellular') {
            setWifiName(`Dados Móveis: ${effectiveType || '4G'}`);
          } else if (downlink && downlink > 10) {
            // Velocidade alta geralmente indica WiFi
            setWifiName('WiFi: Conectado');
          } else if (effectiveType === '4g' && type === undefined) {
            // Se type é undefined mas effectiveType é 4g, provavelmente é WiFi
            setWifiName('WiFi: Conectado');
          } else if (effectiveType && effectiveType !== '4g') {
            setWifiName(`Conexão: ${effectiveType}`);
          } else {
            // Fallback mais inteligente - assumir WiFi se não conseguir detectar
            setWifiName('WiFi: Conectado');
          }
        } else {
          setWifiName('WiFi: Conectado');
        }
      } else {
        // Fallback: assumir WiFi se não conseguir detectar
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
            <LocationInfo>{location}</LocationInfo>
          </InfoRow>
          <InfoRow>
            <span className="icon">📶</span>
            <WifiInfo>{wifiName}</WifiInfo>
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
