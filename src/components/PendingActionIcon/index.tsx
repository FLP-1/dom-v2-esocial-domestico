import React from 'react';
import styled from 'styled-components';
import ActionIcon from '../ActionIcon';
import NotificationBadge from '../NotificationBadge';

interface PendingActionIconProps {
  count: number;
  variant?: 'warning' | 'delete' | 'info';
  size?: 'small' | 'medium' | 'large';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  badgeVariant?: 'default' | 'warning' | 'error' | 'success' | 'info';
  showBadge?: boolean;
  className?: string;
}

const PendingActionContainer = styled.div<{ size: PendingActionIconProps['size'] }>`
  position: relative;
  display: inline-block;
  cursor: pointer;
  
  ${props => {
    const sizes = {
      small: '24px',
      medium: '32px',
      large: '48px'
    };
    const size = sizes[props.size || 'medium'];
    return `
      width: ${size};
      height: ${size};
    `;
  }}
`;

const PendingActionIcon: React.FC<PendingActionIconProps> = ({
  count,
  variant = 'warning',
  size = 'medium',
  position = 'top-right',
  onClick,
  title,
  disabled = false,
  loading = false,
  icon = '⏳',
  badgeVariant = 'default',
  showBadge = true,
  className
}) => {
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <PendingActionContainer 
      size={size}
      onClick={handleClick}
      className={className}
    >
      <ActionIcon
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick={undefined} // onClick é tratado pelo container
        title={title || `Ações Pendentes (${count})`}
      >
        {icon}
      </ActionIcon>
      
      {showBadge && count > 0 && (
        <NotificationBadge
          count={count}
          variant={badgeVariant}
          size={size === 'large' ? 'medium' : 'small'}
          position={position}
        />
      )}
    </PendingActionContainer>
  );
};

export default PendingActionIcon;
