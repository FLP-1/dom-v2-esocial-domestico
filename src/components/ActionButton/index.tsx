import React, { ReactNode } from 'react';
import styled from 'styled-components';
import {
  componentShadows,
  createThemedStyles,
  designConstants,
  stateShadows,
} from '../../design-system';

const ButtonContainer = styled.button<{
  $variant: 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  $theme?: any;
  $size?: 'small' | 'medium' | 'large';
  $loading?: boolean;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    const getVariantStyles = () => {
      switch (props.$variant) {
        case 'primary':
          return {
            background: `linear-gradient(135deg, ${themedStyles.primary}, ${themedStyles.secondary})`,
            color: '#FFFFFF',
            border: 'none',
          };
        case 'secondary':
          return {
            background: 'rgba(255, 255, 255, 0.9)',
            color: themedStyles.text,
            border: `2px solid ${themedStyles.border}`,
          };
        case 'success':
          return {
            background: `linear-gradient(135deg, ${themedStyles.success}, #2ECC71)`,
            color: '#FFFFFF',
            border: 'none',
          };
        case 'warning':
          return {
            background: `linear-gradient(135deg, ${themedStyles.warning}, #E67E22)`,
            color: '#FFFFFF',
            border: 'none',
          };
        case 'danger':
          return {
            background: `linear-gradient(135deg, ${themedStyles.error}, #C0392B)`,
            color: '#FFFFFF',
            border: 'none',
          };
        default:
          return {
            background: `linear-gradient(135deg, ${themedStyles.primary}, ${themedStyles.secondary})`,
            color: '#FFFFFF',
            border: 'none',
          };
      }
    };

    const getSizeStyles = () => {
      switch (props.$size) {
        case 'small':
          return {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minWidth: '80px',
            borderRadius: designConstants.borderRadius.md,
          };
        case 'large':
          return {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            minWidth: '200px',
            borderRadius: designConstants.borderRadius.xl,
          };
        default:
          return {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            minWidth: '120px',
            borderRadius: designConstants.borderRadius.lg,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return `
      /* Base styles */
      background: ${variantStyles.background};
      color: ${variantStyles.color};
      border: ${variantStyles.border};
      border-radius: ${sizeStyles.borderRadius};
      padding: ${sizeStyles.padding};
      font-size: ${sizeStyles.fontSize};
      min-width: ${sizeStyles.minWidth};

      /* Typography */
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 600;
      letter-spacing: 0.025em;
      text-align: center;

      /* Layout */
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      position: relative;
      overflow: hidden;

      /* Interaction */
      cursor: pointer;
      user-select: none;
      transition: ${designConstants.transition.base};
      box-shadow: ${componentShadows.button};

      /* Hover state */
      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: ${componentShadows.buttonHover};
      }

      /* Active state */
      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: ${componentShadows.buttonActive};
      }

      /* Focus state */
      &:focus:not(:disabled) {
        outline: none;
        box-shadow: ${componentShadows.buttonHover}, ${stateShadows.focus(themedStyles.primary)};
      }

      /* Disabled state */
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;

        &:hover {
          transform: none;
          box-shadow: none;
        }
      }

      /* Loading state */
      ${
        props.$loading
          ? `
        cursor: wait;
        pointer-events: none;
      `
          : ''
      }

      /* Icon styles */
      .icon {
        font-size: ${props.$size === 'small' ? '1rem' : props.$size === 'large' ? '1.5rem' : '1.25rem'};
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `;
  }}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  'aria-label'?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  variant,
  children,
  icon,
  theme,
  size = 'medium',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  'aria-label': ariaLabel,
}) => {
  return (
    <ButtonContainer
      $variant={variant}
      $theme={theme}
      $size={size}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      $loading={loading}
      aria-label={ariaLabel}
    >
      {loading && <LoadingSpinner />}
      {icon && <span className='icon'>{icon}</span>}
      {children}
    </ButtonContainer>
  );
};

export default ActionButton;
