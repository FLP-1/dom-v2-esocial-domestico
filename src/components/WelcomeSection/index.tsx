// src/components/WelcomeSection/index.tsx
import styled from 'styled-components';

interface WelcomeSectionProps {
  theme: any;
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
  theme,
  userAvatar,
  userName,
  userRole,
  notificationCount = 0,
  onNotificationClick,
}: WelcomeSectionProps) {
  return (
    <WelcomeContainer>
      <UserAvatar $theme={theme}>{userAvatar}</UserAvatar>
      <WelcomeText>
        <h3>Bem-vindo(a), {userName}!</h3>
        <p>
          {userRole} • {new Date().toLocaleDateString('pt-BR')}
        </p>
      </WelcomeText>
      {notificationCount > 0 && (
        <NotificationContainer>
          <NotificationButton $theme={theme} onClick={onNotificationClick}>
            🔔
            <span className='notification-badge'>{notificationCount}</span>
          </NotificationButton>
        </NotificationContainer>
      )}
    </WelcomeContainer>
  );
}
