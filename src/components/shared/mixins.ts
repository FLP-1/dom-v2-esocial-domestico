import { css } from 'styled-components';
import { createThemedStyles } from '../../design-system';

// 🎨 Mixins para reutilização de estilos

/**
 * Mixin para aplicar estilos temáticos
 */
export const themedMixin = (theme: any) => css`
  ${createThemedStyles(theme)}
`;

/**
 * Mixin para responsividade mobile-first
 */
export const responsiveMixin = css`
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

/**
 * Mixin para tamanhos de fonte
 */
export const sizeMixin = (size: 'sm' | 'md' | 'lg') => css`
  font-size: ${size === 'sm' ? '0.75rem' : size === 'lg' ? '1rem' : '0.85rem'};
  padding: ${size === 'sm'
    ? '0.5rem 0.75rem'
    : size === 'lg'
      ? '0.875rem 1.25rem'
      : '0.75rem 1rem'};
`;

/**
 * Mixin para estados de validação
 */
export const validationMixin = (hasError: boolean, theme: any) => css`
  border: 1px solid
    ${hasError
      ? theme?.colors?.error || '#dc3545'
      : theme?.colors?.border || '#d1d5db'};

  &:focus {
    border-color: ${theme?.colors?.primary || '#29abe2'};
    box-shadow: 0 0 0 3px
      ${theme?.colors?.primaryLight || 'rgba(41, 171, 226, 0.1)'};
  }
`;

/**
 * Mixin para transições suaves
 */
export const transitionMixin = css`
  transition: all 0.2s ease;
`;

/**
 * Mixin para hover states
 */
export const hoverMixin = (theme: any) => css`
  &:hover {
    background: ${theme?.colors?.hover || 'rgba(41, 171, 226, 0.1)'};
    transform: translateY(-1px);
  }
`;

/**
 * Mixin para focus states
 */
export const focusMixin = (theme: any) => css`
  &:focus {
    outline: none;
    border-color: ${theme?.colors?.primary || '#29abe2'};
    box-shadow: 0 0 0 3px
      ${theme?.colors?.primaryLight || 'rgba(41, 171, 226, 0.1)'};
  }
`;

/**
 * Mixin para disabled states
 */
export const disabledMixin = (theme: any) => css`
  &:disabled {
    background: ${theme?.colors?.disabled || '#f8f9fa'};
    color: ${theme?.colors?.textDisabled || '#6c757d'};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

/**
 * Mixin para grid responsivo
 */
export const gridMixin = css`
  display: grid;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

/**
 * Mixin para flex container
 */
export const flexMixin = (
  direction: 'row' | 'column' = 'row',
  gap: string = '0.5rem'
) => css`
  display: flex;
  flex-direction: ${direction};
  gap: ${gap};
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

/**
 * Mixin para status colors
 */
export const statusColorMixin = (
  status: 'success' | 'warning' | 'error' | 'info',
  theme: any
) => css`
  background: ${status === 'success'
    ? theme?.colors?.successLight || '#d4edda'
    : status === 'warning'
      ? theme?.colors?.warningLight || '#fff3cd'
      : status === 'error'
        ? theme?.colors?.errorLight || '#f8d7da'
        : theme?.colors?.infoLight || '#d1ecf1'};

  color: ${status === 'success'
    ? theme?.colors?.success || '#155724'
    : status === 'warning'
      ? theme?.colors?.warning || '#856404'
      : status === 'error'
        ? theme?.colors?.error || '#721c24'
        : theme?.colors?.info || '#0c5460'};

  border: 1px solid
    ${status === 'success'
      ? theme?.colors?.success || '#c3e6cb'
      : status === 'warning'
        ? theme?.colors?.warning || '#ffeaa7'
        : status === 'error'
          ? theme?.colors?.error || '#f5c6cb'
          : theme?.colors?.info || '#bee5eb'};
`;

/**
 * Mixin para touch targets (acessibilidade)
 */
export const touchTargetMixin = css`
  min-height: 44px;
  min-width: 44px;

  @media (max-width: 768px) {
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

/**
 * Mixin para acessibilidade
 */
export const accessibilityMixin = css`
  &:focus-visible {
    outline: 2px solid #29abe2;
    outline-offset: 2px;
  }

  &[aria-disabled='true'] {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

/**
 * Mixin para animações
 */
export const animationMixin = css`
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

/**
 * Mixin para sombras
 */
export const shadowMixin = (level: 'sm' | 'md' | 'lg' = 'md') => css`
  box-shadow: ${level === 'sm'
    ? '0 1px 3px rgba(0, 0, 0, 0.1)'
    : level === 'lg'
      ? '0 10px 25px rgba(0, 0, 0, 0.15)'
      : '0 4px 6px rgba(0, 0, 0, 0.1)'};
`;

/**
 * Mixin para border radius
 */
export const borderRadiusMixin = (size: 'sm' | 'md' | 'lg' = 'md') => css`
  border-radius: ${size === 'sm' ? '4px' : size === 'lg' ? '12px' : '8px'};
`;

/**
 * Mixin para espaçamento
 */
export const spacingMixin = (
  padding: string = '1rem',
  margin: string = '0'
) => css`
  padding: ${padding};
  margin: ${margin};
`;

/**
 * Mixin para texto truncado
 */
export const textTruncateMixin = css`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

/**
 * Mixin para scrollbar customizada
 */
export const customScrollbarMixin = (theme: any) => css`
  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: ${theme?.colors?.surface || '#f1f1f1'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${theme?.colors?.primary || '#29abe2'};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: ${theme?.colors?.primaryDark || '#1e8bc3'};
  }
`;
