import React from 'react';
import styled from 'styled-components';
import { createThemedStyles, semanticColors, stateShadows } from '../index';
import { designConstants } from '../tokens/constants';

interface InputProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  state?: 'default' | 'error' | 'success' | 'warning';
  fullWidth?: boolean;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'search';
  autoComplete?: string;
  maxLength?: number;
  theme?: any;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

const StyledInput = styled.input<{
  $size: InputProps['size'];
  $variant: InputProps['variant'];
  $state: InputProps['state'];
  $fullWidth: boolean;
  $theme: any;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    // Estados de validação
    const getStateStyles = () => {
      switch (props.$state) {
        case 'error':
          return {
            borderColor: semanticColors.invalid,
            focusShadow: stateShadows.focus(semanticColors.invalid),
          };
        case 'success':
          return {
            borderColor: semanticColors.valid,
            focusShadow: stateShadows.focus(semanticColors.valid),
          };
        case 'warning':
          return {
            borderColor: semanticColors.pending,
            focusShadow: stateShadows.focus(semanticColors.pending),
          };
        default:
          return {
            borderColor: themedStyles.border,
            focusShadow: stateShadows.focus(themedStyles.primary),
          };
      }
    };

    // Variações de estilo
    const getVariantStyles = () => {
      switch (props.$variant) {
        case 'filled':
          return {
            background: themedStyles.surface,
            border: `2px solid transparent`,
          };
        case 'outlined':
          return {
            background: 'transparent',
            border: `2px solid ${getStateStyles().borderColor}`,
          };
        default:
          return {
            background: themedStyles.background,
            border: `2px solid ${getStateStyles().borderColor}`,
          };
      }
    };

    // Tamanhos
    const getSizeStyles = () => {
      switch (props.$size) {
        case 'sm':
          return {
            padding: '0.5rem 0.75rem',
            fontSize: '0.875rem',
            borderRadius: designConstants.borderRadius.md,
          };
        case 'lg':
          return {
            padding: '1rem 1.25rem',
            fontSize: '1.125rem',
            borderRadius: designConstants.borderRadius.xl,
          };
        default:
          return {
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: designConstants.borderRadius.lg,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();
    const stateStyles = getStateStyles();

    return `
      /* Reset */
      border: ${variantStyles.border};
      background: ${variantStyles.background};
      color: ${themedStyles.text};

      /* Layout */
      width: ${props.$fullWidth ? '100%' : 'auto'};
      padding: ${sizeStyles.padding};
      border-radius: ${sizeStyles.borderRadius};

      /* Typography */
      font-family: 'Inter', system-ui, sans-serif;
      font-size: ${sizeStyles.fontSize};
      font-weight: 400;
      line-height: 1.5;

      /* Interaction */
      transition: ${designConstants.transition.base};

      /* Placeholder */
      &::placeholder {
        color: ${semanticColors.placeholder};
        opacity: 1;
      }

      /* Focus state */
      &:focus {
        outline: none;
        border-color: ${themedStyles.primary};
        box-shadow: ${stateStyles.focusShadow};
      }

      /* Hover state */
      &:hover:not(:disabled):not(:focus) {
        border-color: ${themedStyles.primary};
      }

      /* Disabled state */
      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        background: ${semanticColors.disabled};
        color: ${semanticColors.textMuted};
      }

      /* Error state specific styles */
      ${
        props.$state === 'error'
          ? `
        &:focus {
          border-color: ${semanticColors.invalid};
          box-shadow: ${stateShadows.focus(semanticColors.invalid)};
        }
      `
          : ''
      }

      /* Success state specific styles */
      ${
        props.$state === 'success'
          ? `
        &:focus {
          border-color: ${semanticColors.valid};
          box-shadow: ${stateShadows.focus(semanticColors.valid)};
        }
      `
          : ''
      }
    `;
  }}
`;

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: inline-flex;
  align-items: center;
  position: relative;
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
`;

const IconWrapper = styled.div<{
  $position: 'left' | 'right';
  $size: InputProps['size'];
}>`
  position: absolute;
  ${props => props.$position}: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1.25rem';
      default:
        return '1rem';
    }
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.textSecondary || '#6B7280'};
  pointer-events: none;
  z-index: 1;
`;

export const Input: React.FC<InputProps> = ({
  size = 'md',
  variant = 'default',
  state = 'default',
  fullWidth = false,
  disabled = false,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  autoComplete,
  maxLength,
  theme,
  className,
  id,
  name,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}) => {
  return (
    <InputContainer $fullWidth={fullWidth}>
      <StyledInput
        $size={size}
        $variant={variant}
        $state={state}
        $fullWidth={fullWidth}
        $theme={theme}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        type={type}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={className}
        id={id}
        name={name}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        {...props}
      />
    </InputContainer>
  );
};

export default Input;
