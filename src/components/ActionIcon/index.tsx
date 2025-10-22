import React from 'react';
import styled from 'styled-components';

interface ActionIconProps {
  variant: 'approve' | 'reject' | 'edit' | 'delete' | 'view' | 'warning' | 'info' | 'success' | 'primary';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

const getVariantStyles = (variant: ActionIconProps['variant']) => {
  const variants = {
    approve: {
      backgroundColor: '#28a745',
      hoverColor: '#218838',
      icon: '✅'
    },
    reject: {
      backgroundColor: '#dc3545',
      hoverColor: '#c82333',
      icon: '❌'
    },
    edit: {
      backgroundColor: '#17a2b8',
      hoverColor: '#138496',
      icon: '✏️'
    },
    delete: {
      backgroundColor: '#dc3545',
      hoverColor: '#c82333',
      icon: '🗑️'
    },
    view: {
      backgroundColor: '#6c757d',
      hoverColor: '#545b62',
      icon: '👁️'
    },
    warning: {
      backgroundColor: '#ffc107',
      hoverColor: '#e0a800',
      icon: '⚠️'
    },
    info: {
      backgroundColor: '#17a2b8',
      hoverColor: '#138496',
      icon: 'ℹ️'
    },
    success: {
      backgroundColor: '#28a745',
      hoverColor: '#218838',
      icon: '✅'
    },
    primary: {
      backgroundColor: '#007bff',
      hoverColor: '#0056b3',
      icon: '🔧'
    }
  };

  return variants[variant] || variants.primary;
};

const getSizeStyles = (size: ActionIconProps['size']) => {
  const sizes = {
    small: {
      width: '24px',
      height: '24px',
      fontSize: '12px'
    },
    medium: {
      width: '32px',
      height: '32px',
      fontSize: '16px'
    },
    large: {
      width: '48px',
      height: '48px',
      fontSize: '24px'
    }
  };

  return sizes[size] || sizes.medium;
};

const StyledActionIcon = styled.button<ActionIconProps>`
  width: ${props => getSizeStyles(props.size || 'medium').width};
  height: ${props => getSizeStyles(props.size || 'medium').height};
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease;
  font-size: ${props => getSizeStyles(props.size || 'medium').fontSize};
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  background-color: ${props => getVariantStyles(props.variant).backgroundColor};
  color: white;
  
  &:hover {
    background-color: ${props => 
      props.disabled 
        ? getVariantStyles(props.variant).backgroundColor 
        : getVariantStyles(props.variant).hoverColor
    };
    transform: ${props => props.disabled ? 'none' : 'scale(1.1)'};
    box-shadow: ${props => 
      props.disabled 
        ? '0 2px 4px rgba(0, 0, 0, 0.1)' 
        : '0 4px 8px rgba(0, 0, 0, 0.2)'
    };
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'scale(0.95)'};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  ${props => props.loading && `
    &::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid transparent;
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `}
`;

const ActionIcon: React.FC<ActionIconProps> = ({
  variant,
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  title,
  children,
  className
}) => {
  const variantInfo = getVariantStyles(variant);
  
  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <StyledActionIcon
      variant={variant}
      size={size}
      disabled={disabled || loading}
      loading={loading}
      onClick={handleClick}
      title={title}
      className={className}
    >
      {loading ? '⏳' : (children || variantInfo.icon)}
    </StyledActionIcon>
  );
};

export default ActionIcon;
