import React from 'react';
import styled from 'styled-components';

interface NotificationBadgeProps {
  count: number;
  maxCount?: number;
  variant?: 'default' | 'warning' | 'error' | 'success' | 'info';
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  showZero?: boolean;
  className?: string;
}

const getVariantStyles = (variant: NotificationBadgeProps['variant']) => {
  const variants = {
    default: {
      backgroundColor: '#dc3545',
      color: 'white',
      borderColor: 'white'
    },
    warning: {
      backgroundColor: '#ffc107',
      color: '#212529',
      borderColor: 'white'
    },
    error: {
      backgroundColor: '#dc3545',
      color: 'white',
      borderColor: 'white'
    },
    success: {
      backgroundColor: '#28a745',
      color: 'white',
      borderColor: 'white'
    },
    info: {
      backgroundColor: '#17a2b8',
      color: 'white',
      borderColor: 'white'
    }
  };

  return variants[variant] || variants.default;
};

const getSizeStyles = (size: NotificationBadgeProps['size']) => {
  const sizes = {
    small: {
      width: '16px',
      height: '16px',
      fontSize: '10px',
      borderWidth: '1px'
    },
    medium: {
      width: '20px',
      height: '20px',
      fontSize: '12px',
      borderWidth: '2px'
    },
    large: {
      width: '24px',
      height: '24px',
      fontSize: '14px',
      borderWidth: '2px'
    }
  };

  return sizes[size] || sizes.medium;
};

const getPositionStyles = (position: NotificationBadgeProps['position']) => {
  const positions = {
    'top-right': {
      top: '-8px',
      right: '-8px'
    },
    'top-left': {
      top: '-8px',
      left: '-8px'
    },
    'bottom-right': {
      bottom: '-8px',
      right: '-8px'
    },
    'bottom-left': {
      bottom: '-8px',
      left: '-8px'
    }
  };

  return positions[position] || positions['top-right'];
};

const StyledBadge = styled.div<NotificationBadgeProps>`
  position: absolute;
  width: ${props => getSizeStyles(props.size || 'medium').width};
  height: ${props => getSizeStyles(props.size || 'medium').height};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: ${props => getSizeStyles(props.size || 'medium').fontSize};
  line-height: 1;
  border: ${props => getSizeStyles(props.size || 'medium').borderWidth} solid ${props => getVariantStyles(props.variant).borderColor};
  
  background-color: ${props => getVariantStyles(props.variant).backgroundColor};
  color: ${props => getVariantStyles(props.variant).color};
  
  ${props => {
    const positionStyles = getPositionStyles(props.position || 'top-right');
    return Object.entries(positionStyles).map(([key, value]) => `${key}: ${value};`).join('\n');
  }}
  
  /* Animação de entrada */
  animation: badgeAppear 0.3s ease-out;
  
  @keyframes badgeAppear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    50% {
      transform: scale(1.2);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  /* Pulsar quando há notificações */
  ${props => props.count > 0 && `
    animation: badgeAppear 0.3s ease-out, badgePulse 2s infinite;
    
    @keyframes badgePulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.1);
      }
    }
  `}
`;

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  maxCount = 99,
  variant = 'default',
  size = 'medium',
  position = 'top-right',
  showZero = false,
  className
}) => {
  // Não mostrar badge se count for 0 e showZero for false
  if (count === 0 && !showZero) {
    return null;
  }

  // Limitar o número exibido
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <StyledBadge
      count={count}
      maxCount={maxCount}
      variant={variant}
      size={size}
      position={position}
      showZero={showZero}
      className={className}
    >
      {displayCount}
    </StyledBadge>
  );
};

export default NotificationBadge;
