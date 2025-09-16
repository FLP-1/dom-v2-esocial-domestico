import React from 'react';
import styled from 'styled-components';
import {
  componentShadows,
  createThemedStyles,
  designConstants,
} from '../index';

interface CardProps {
  variant?: 'default' | 'outlined' | 'filled' | 'elevated';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  hoverable?: boolean;
  theme?: any;
  className?: string;
  padding?: boolean;
}

const StyledCard = styled.div<{
  $variant: CardProps['variant'];
  $size: CardProps['size'];
  $hoverable: boolean;
  $clickable: boolean;
  $padding: boolean;
  $theme: any;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    // Variações de estilo
    const getVariantStyles = () => {
      switch (props.$variant) {
        case 'outlined':
          return {
            background: 'transparent',
            border: `1px solid ${themedStyles.border}`,
            shadow: 'none',
          };
        case 'filled':
          return {
            background: themedStyles.surface,
            border: 'none',
            shadow: 'none',
          };
        case 'elevated':
          return {
            background: themedStyles.background,
            border: 'none',
            shadow: componentShadows.cardHover,
          };
        default:
          return {
            background: themedStyles.background,
            border: `1px solid ${themedStyles.border}`,
            shadow: componentShadows.card,
          };
      }
    };

    // Tamanhos
    const getSizeStyles = () => {
      switch (props.$size) {
        case 'sm':
          return {
            padding: props.$padding ? '1rem' : '0',
            borderRadius: designConstants.borderRadius.md,
          };
        case 'lg':
          return {
            padding: props.$padding ? '2rem' : '0',
            borderRadius: designConstants.borderRadius['2xl'],
          };
        default:
          return {
            padding: props.$padding ? '1.5rem' : '0',
            borderRadius: designConstants.borderRadius.xl,
          };
      }
    };

    const variantStyles = getVariantStyles();
    const sizeStyles = getSizeStyles();

    return `
      /* Base styles */
      background: ${variantStyles.background};
      border: ${variantStyles.border};
      border-radius: ${sizeStyles.borderRadius};
      padding: ${sizeStyles.padding};
      box-shadow: ${variantStyles.shadow};

      /* Layout */
      display: flex;
      flex-direction: column;
      position: relative;
      overflow: hidden;

      /* Interaction */
      transition: ${designConstants.transition.base};
      cursor: ${props.$clickable ? 'pointer' : 'default'};

      /* Hover effects */
      ${
        props.$hoverable || props.$clickable
          ? `
        &:hover {
          transform: translateY(-2px);
          box-shadow: ${componentShadows.cardHover};
        }
      `
          : ''
      }

      /* Active effects */
      ${
        props.$clickable
          ? `
        &:active {
          transform: translateY(0);
          box-shadow: ${variantStyles.shadow};
        }
      `
          : ''
      }

      /* Focus effects */
      ${
        props.$clickable
          ? `
        &:focus {
          outline: none;
          box-shadow: ${variantStyles.shadow}, ${stateShadows.focus(themedStyles.primary)};
        }
      `
          : ''
      }
    `;
  }}
`;

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  size = 'md',
  children,
  onClick,
  hoverable = false,
  theme,
  className,
  padding = true,
  ...props
}) => {
  return (
    <StyledCard
      $variant={variant}
      $size={size}
      $hoverable={hoverable}
      $clickable={!!onClick}
      $padding={padding}
      $theme={theme}
      onClick={onClick}
      className={className}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
