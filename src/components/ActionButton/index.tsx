import React, { ReactNode } from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.button<{
  $variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  $theme?: any;
  $size?: 'small' | 'medium' | 'large';
}>`
  background: ${props => {
    if (props.$theme?.colors) {
      switch (props.$variant) {
        case 'primary':
          return `linear-gradient(135deg, ${props.$theme.colors.primary}, ${props.$theme.colors.secondary})`;
        case 'secondary':
          return 'rgba(255, 255, 255, 0.9)';
        case 'success':
          return `linear-gradient(135deg, ${props.$theme.colors.secondary}, #2ecc71)`;
        case 'warning':
          return `linear-gradient(135deg, ${props.$theme.colors.accent}, #e67e22)`;
        case 'danger':
          return 'linear-gradient(135deg, #e74c3c, #c0392b)';
        default:
          return `linear-gradient(135deg, ${props.$theme.colors.primary}, ${props.$theme.colors.secondary})`;
      }
    }

    // Fallback colors
    switch (props.$variant) {
      case 'primary':
        return 'linear-gradient(135deg, #29abe2, #90ee90)';
      case 'secondary':
        return 'rgba(255, 255, 255, 0.9)';
      case 'success':
        return 'linear-gradient(135deg, #90ee90, #2ecc71)';
      case 'warning':
        return 'linear-gradient(135deg, #f39c12, #e67e22)';
      case 'danger':
        return 'linear-gradient(135deg, #e74c3c, #c0392b)';
      default:
        return 'linear-gradient(135deg, #29abe2, #90ee90)';
    }
  }};

  color: ${props => (props.$variant === 'secondary' ? '#2c3e50' : '#fff')};
  border: ${props =>
    props.$variant === 'secondary'
      ? `2px solid ${props.$theme?.colors.primary + '20' || 'rgba(41, 171, 226, 0.2)'}`
      : 'none'};
  border-radius: 12px;
  padding: ${props => {
    switch (props.$size) {
      case 'small':
        return '0.5rem 1rem';
      case 'large':
        return '1rem 2rem';
      default:
        return '0.75rem 1.5rem';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'small':
        return '0.9rem';
      case 'large':
        return '1.1rem';
      default:
        return '1rem';
    }
  }};
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props =>
    props.$variant === 'secondary'
      ? '0 2px 8px rgba(0, 0, 0, 0.1)'
      : `0 4px 16px ${props.$theme?.colors.primary + '50' || 'rgba(41, 171, 226, 0.3)'}`};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: ${props => {
    switch (props.$size) {
      case 'small':
        return '80px';
      case 'large':
        return '200px';
      default:
        return '120px';
    }
  }};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.$variant === 'secondary'
        ? `0 4px 16px ${props.$theme?.colors.primary + '20' || 'rgba(41, 171, 226, 0.2)'}`
        : `0 8px 24px ${props.$theme?.colors.primary + '60' || 'rgba(41, 171, 226, 0.4)'}`};
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .icon {
    font-size: ${props => {
      switch (props.$size) {
        case 'small':
          return '1rem';
        case 'large':
          return '1.5rem';
        default:
          return '1.25rem';
      }
    }};
  }
`;

export interface ActionButtonProps {
  variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  children: ReactNode;
  icon?: string;
  theme?: any;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  children,
  icon,
  theme,
  size = 'medium',
  onClick,
  disabled = false,
  type = 'button',
}) => {
  return (
    <ButtonContainer
      $variant={variant}
      $theme={theme}
      $size={size}
      onClick={onClick}
      disabled={disabled}
      type={type}
    >
      {icon && <span className='icon'>{icon}</span>}
      {children}
    </ButtonContainer>
  );
};

export default ActionButton;
