import React, { ReactNode, useCallback } from 'react';
import styled from 'styled-components';
import { componentShadows, createThemedStyles } from '../../design-system';
import { useGeolocationCapture } from '../../hooks/useGeolocationCapture';
import { logger } from '../../utils/logger';

// Styled Components
const ButtonContainer = styled.button<{
  $variant:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'link';
  $theme?: any;
  $size?: 'xs' | 'sm' | 'medium' | 'lg' | 'xl';
  $fullWidth?: boolean;
  $disabled?: boolean;
  $loading?: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  min-height: ${props => {
    switch (props.$size) {
      case 'xs':
        return '28px';
      case 'sm':
        return '32px';
      case 'lg':
        return '48px';
      case 'xl':
        return '56px';
      default:
        return '40px';
    }
  }};
  padding: ${props => {
    switch (props.$size) {
      case 'xs':
        return '0.25rem 0.75rem';
      case 'sm':
        return '0.375rem 1rem';
      case 'lg':
        return '0.75rem 1.5rem';
      case 'xl':
        return '1rem 2rem';
      default:
        return '0.5rem 1rem';
    }
  }};
  font-size: ${props => {
    switch (props.$size) {
      case 'xs':
        return '0.75rem';
      case 'sm':
        return '0.875rem';
      case 'lg':
        return '1.125rem';
      case 'xl':
        return '1.25rem';
      default:
        return '1rem';
    }
  }};

  /* Disabled state */
  ${props =>
    props.$disabled || props.$loading
      ? `
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `
      : ''}

  /* Loading state */
  ${props =>
    props.$loading
      ? `
    color: transparent;
  `
      : ''}

  /* Variant styles */
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    const baseStyles = themedStyles;

    switch (props.$variant) {
      case 'primary':
        return `
          background: ${baseStyles.primary || '#29abe2'};
          color: white;
          box-shadow: ${componentShadows.button};

          &:hover:not(:disabled) {
            background: ${baseStyles.primary || '#1e8bc3'};
            box-shadow: ${componentShadows.buttonHover};
            transform: translateY(-1px);
          }

          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${componentShadows.button};
          }
        `;

      case 'secondary':
        return `
          background: ${baseStyles.secondary || '#6c757d'};
          color: white;
          box-shadow: ${componentShadows.button};

          &:hover:not(:disabled) {
            background: ${baseStyles.secondary || '#5a6268'};
            box-shadow: ${componentShadows.buttonHover};
            transform: translateY(-1px);
          }
        `;

      case 'success':
        return `
          background: ${baseStyles.success || '#28a745'};
          color: white;
          box-shadow: ${componentShadows.button};

          &:hover:not(:disabled) {
            background: ${baseStyles.success || '#218838'};
            box-shadow: ${componentShadows.buttonHover};
            transform: translateY(-1px);
          }
        `;

      case 'warning':
        return `
          background: ${baseStyles.warning || '#ffc107'};
          color: ${baseStyles.text || '#212529'};
          box-shadow: ${componentShadows.button};

          &:hover:not(:disabled) {
            background: ${baseStyles.warning || '#e0a800'};
            box-shadow: ${componentShadows.buttonHover};
            transform: translateY(-1px);
          }
        `;

      case 'danger':
        return `
          background: ${baseStyles.error || '#dc3545'};
          color: white;
          box-shadow: ${componentShadows.button};

          &:hover:not(:disabled) {
            background: ${baseStyles.error || '#c82333'};
            box-shadow: ${componentShadows.buttonHover};
            transform: translateY(-1px);
          }
        `;

      case 'ghost':
        return `
          background: transparent;
          color: ${baseStyles.primary || '#29abe2'};
          border: 1px solid ${baseStyles.primary || '#29abe2'};

          &:hover:not(:disabled) {
            background: ${baseStyles.primary || '#29abe2'};
            color: white;
            transform: translateY(-1px);
          }
        `;

      case 'link':
        return `
          background: transparent;
          color: ${baseStyles.primary || '#29abe2'};
          padding: 0;
          min-height: auto;
          text-decoration: underline;

          &:hover:not(:disabled) {
            text-decoration: underline;
          }
        `;

      default:
        return '';
    }
  }}

  /* Icon styles */
  .icon {
    font-size: ${props => props.$size === 'xs'
      ? '0.875rem'
      : props.$size === 'sm'
        ? '1rem'
        : props.$size === 'lg'
          ? '1.5rem'
          : props.$size === 'xl'
            ? '1.75rem'
            : '1.25rem'};
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Link variant specific styles */
  ${props => props.$variant === 'link'
    ? `
        &:hover {
          text-decoration: underline;
        }
      `
    : ''}
`;

const LoadingSpinner = styled.div<{
  $size?: 'xs' | 'sm' | 'medium' | 'lg' | 'xl';
}>`
  width: ${props => {
    switch (props.$size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '14px';
      case 'lg':
        return '20px';
      case 'xl':
        return '24px';
      default:
        return '16px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'xs':
        return '12px';
      case 'sm':
        return '14px';
      case 'lg':
        return '20px';
      case 'xl':
        return '24px';
      default:
        return '16px';
    }
  }};
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
`;

export interface UnifiedButtonProps {
  $variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'link';
  children: ReactNode;
  icon?: string | ReactNode;
  $theme?: any;
  $size?: 'xs' | 'sm' | 'medium' | 'lg' | 'xl';
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  $disabled?: boolean;
  $loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
  $fullWidth?: boolean;
  // Novas propriedades para captura automática de geolocalização
  $criticalAction?: boolean; // Se true, captura geolocalização automaticamente
  $actionName?: string; // Nome da ação para logs e auditoria
}

export const UnifiedButton: React.FC<UnifiedButtonProps> = ({
  $variant = 'primary',
  children,
  icon,
  $theme,
  $size = 'medium',
  onClick,
  $disabled = false,
  $loading = false,
  type = 'button',
  'aria-label': ariaLabel,
  $fullWidth = false,
  $criticalAction = false,
  $actionName = 'Ação do botão',
}) => {
  const { createCriticalButtonHandler } = useGeolocationCapture();

  // Handler que captura geolocalização automaticamente para ações críticas
  const handleClick = useCallback(async (event: React.MouseEvent<HTMLButtonElement>) => {
    if ($criticalAction && onClick) {
      logger.geo(`🎯 Botão crítico clicado: ${$actionName}`);
      const criticalHandler = createCriticalButtonHandler(onClick, $actionName);
      await criticalHandler(event);
    } else if (onClick) {
      onClick(event);
    }
  }, [onClick, $criticalAction, $actionName, createCriticalButtonHandler]);
  return (
    <ButtonContainer
      $variant={$variant}
      $theme={$theme}
      $size={$size}
      $fullWidth={$fullWidth}
      $loading={$loading}
      onClick={handleClick}
      disabled={$disabled || $loading}
      type={type}
      aria-label={ariaLabel}
    >
      {$loading && <LoadingSpinner $size={$size} />}
      {icon && !$loading && <span className='icon'>{icon}</span>}
      {children}
    </ButtonContainer>
  );
};

export default UnifiedButton;
