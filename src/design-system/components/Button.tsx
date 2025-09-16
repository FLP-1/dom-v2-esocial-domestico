import React from 'react';
import styled from 'styled-components';
import {
  componentShadows,
  createThemedStyles,
  designConstants,
  stateShadows,
} from '../index';

interface ButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  theme?: any;
  className?: string;
  'aria-label'?: string;
}

const StyledButton = styled.button<{
  $variant: ButtonProps['variant'];
  $size: ButtonProps['size'];
  $fullWidth: boolean;
  $loading: boolean;
  $theme: any;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    // Variações de estilo
    const getVariantStyles = () => {
      switch (props.$variant) {
        case 'primary':
          return {
            background: `linear-gradient(135deg, ${themedStyles.primary}, ${themedStyles.secondary})`,
            color: '#FFFFFF',
            border: 'none',
            hoverTransform: 'translateY(-2px)',
          };
        case 'secondary':
          return {
            background: 'transparent',
            color: themedStyles.text,
            border: `2px solid ${themedStyles.border}`,
            hoverTransform: 'translateY(-1px)',
          };
        case 'success':
          return {
            background: `linear-gradient(135deg, ${themedStyles.success}, #2ECC71)`,
            color: '#FFFFFF',
            border: 'none',
            hoverTransform: 'translateY(-2px)',
          };
        case 'warning':
          return {
            background: `linear-gradient(135deg, ${themedStyles.warning}, #E67E22)`,
            color: '#FFFFFF',
            border: 'none',
            hoverTransform: 'translateY(-2px)',
          };
        case 'danger':
          return {
            background: `linear-gradient(135deg, ${themedStyles.error}, #C0392B)`,
            color: '#FFFFFF',
            border: 'none',
            hoverTransform: 'translateY(-2px)',
          };
        case 'ghost':
          return {
            background: 'transparent',
            color: themedStyles.textSecondary,
            border: 'none',
            hoverTransform: 'none',
          };
        default:
          return {
            background: `linear-gradient(135deg, ${themedStyles.primary}, ${themedStyles.secondary})`,
            color: '#FFFFFF',
            border: 'none',
            hoverTransform: 'translateY(-2px)',
          };
      }
    };

    // Tamanhos
    const getSizeStyles = () => {
      switch (props.$size) {
        case 'xs':
          return {
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            minHeight: '28px',
            borderRadius: designConstants.borderRadius.sm,
          };
        case 'sm':
          return {
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minHeight: '36px',
            borderRadius: designConstants.borderRadius.md,
          };
        case 'md':
          return {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            minHeight: '44px',
            borderRadius: designConstants.borderRadius.lg,
          };
        case 'lg':
          return {
            padding: '1rem 2rem',
            fontSize: '1.125rem',
            minHeight: '52px',
            borderRadius: designConstants.borderRadius.xl,
          };
        case 'xl':
          return {
            padding: '1.25rem 2.5rem',
            fontSize: '1.25rem',
            minHeight: '60px',
            borderRadius: designConstants.borderRadius['2xl'],
          };
        default:
          return {
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            minHeight: '44px',
            borderRadius: designConstants.borderRadius.lg,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return `
      /* Reset */
      border: ${variantStyles.border};
      background: ${variantStyles.background};
      color: ${variantStyles.color};

      /* Layout */
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: ${sizeStyles.padding};
      border-radius: ${sizeStyles.borderRadius};
      min-height: ${sizeStyles.minHeight};
      width: ${props.$fullWidth ? '100%' : 'auto'};

      /* Typography */
      font-family: 'Inter', system-ui, sans-serif;
      font-size: ${sizeStyles.fontSize};
      font-weight: 600;
      line-height: 1;
      letter-spacing: 0.025em;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;

      /* Interaction */
      cursor: pointer;
      user-select: none;
      position: relative;
      overflow: hidden;

      /* Transitions */
      transition: ${designConstants.transition.base};
      box-shadow: ${componentShadows.button};

      /* States */
      &:hover:not(:disabled) {
        transform: ${variantStyles.hoverTransform};
        box-shadow: ${componentShadows.buttonHover};
      }

      &:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: ${componentShadows.buttonActive};
      }

      &:focus:not(:disabled) {
        outline: none;
        box-shadow: ${componentShadows.buttonHover}, ${stateShadows.focus(themedStyles.primary)};
      }

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

        &::after {
          content: '';
          position: absolute;
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-left: 0.5rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `
          : ''
      }

      /* Icon positioning */
      .icon {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
    `;
  }}
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  theme,
  className,
  'aria-label': ariaLabel,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      $loading={loading}
      $theme={theme}
      onClick={onClick}
      disabled={disabled || loading}
      type={type}
      className={className}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && iconPosition === 'left' && <span className='icon'>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className='icon'>{icon}</span>}
    </StyledButton>
  );
};

export default Button;
