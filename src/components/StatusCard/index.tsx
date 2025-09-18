import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

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

const StatusContainer = styled.div<{
  $status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  $theme?: any;
}>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px
    ${props => props.$theme?.colors.shadow || 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid
    ${props => props.$theme?.colors.primary + '20' || 'rgba(41, 171, 226, 0.1)'};
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
  min-width: 300px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px
      ${props => props.$theme?.colors.shadow || 'rgba(0, 0, 0, 0.15)'};
  }
`;

const StatusIcon = styled.div<{
  $status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  $theme?: any;
}>`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: ${props => {
    if (props.$theme?.colors) {
      switch (props.$status) {
        case 'in':
        case 'success':
          return props.$theme.colors.primary;
        case 'out':
          return props.$theme.colors.accent || '#e74c3c';
        case 'break':
        case 'warning':
          return props.$theme.colors.accent || '#f39c12';
        case 'info':
          return props.$theme.colors.textSecondary || '#7f8c8d';
        default:
          return props.$theme.colors.primary;
      }
    }

    // Fallback colors
    switch (props.$status) {
      case 'in':
      case 'success':
        return '#29abe2';
      case 'out':
        return '#e74c3c';
      case 'break':
      case 'warning':
        return '#f39c12';
      case 'info':
        return '#7f8c8d';
      default:
        return '#29abe2';
    }
  }};
`;

const StatusText = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const StatusTime = styled.p`
  font-size: 1rem;
  color: #7f8c8d;
  margin: 0;
`;

const StatusDescription = styled.p`
  font-size: 0.9rem;
  color: #5a6c7d;
  margin: 0.5rem 0 0 0;
  line-height: 1.4;
`;

export interface StatusCardProps {
  status: 'in' | 'out' | 'break' | 'success' | 'warning' | 'info';
  icon: string;
  title: string;
  time?: string;
  description?: string;
  theme?: any;
  onClick?: () => void;
  children?: ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  status,
  icon,
  title,
  time,
  description,
  theme,
  onClick,
  children,
}) => {
  return (
    <StatusContainer
      $status={status}
      $theme={theme}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <StatusIcon $status={status} $theme={theme}>
        {icon}
      </StatusIcon>

      <StatusText>{title}</StatusText>

      {time && <StatusTime>{time}</StatusTime>}

      {description && <StatusDescription>{description}</StatusDescription>}

      {children}
    </StatusContainer>
  );
};

export default StatusCard;
