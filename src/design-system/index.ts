// Design System - Index
// Exporta todos os tokens, componentes e utilitários do design system

// Tokens
export {
  default as colors,
  generateColorVariations,
  getProfileColors,
  semanticColors,
} from './tokens/colors';
export {
  combineShadows,
  componentShadows,
  createShadow,
  default as shadows,
  stateShadows,
} from './tokens/shadows';
export {
  breakpoints,
  componentSpacing,
  containerSizes,
  default as spacing,
} from './tokens/spacing';
export {
  responsiveTextStyles,
  textStyles,
  default as typography,
} from './tokens/typography';

// Componentes
export {
  Button,
  Card,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
} from './components';

// Temas (re-exportar do hook existente para compatibilidade)
export { profileThemes, useTheme } from '../hooks/useTheme';

// Utilitários de tema
export const getThemeValue = (theme: any, path: string, fallback?: any) => {
  const keys = path.split('.');
  let value = theme;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback;
    }
  }

  return value || fallback;
};

// Função para criar estilos baseados em tema
export const createThemedStyles = (theme: any) => ({
  // Cores
  primary: theme?.colors?.primary || colors.empregado.primary,
  secondary: theme?.colors?.secondary || colors.empregado.secondary,
  accent: theme?.colors?.accent || colors.empregado.accent,
  background: theme?.colors?.background || colors.empregado.background,
  surface: theme?.colors?.surface || colors.empregado.surface,
  text: theme?.colors?.text || colors.empregado.text,
  textSecondary: theme?.colors?.textSecondary || colors.empregado.textSecondary,
  border: theme?.colors?.border || colors.empregado.border,
  shadow: theme?.colors?.shadow || colors.empregado.shadow,

  // Estados
  success: semanticColors.valid,
  error: semanticColors.invalid,
  warning: semanticColors.pending,
  info: semanticColors.info,

  // Sombras temáticas
  shadowColored: componentShadows.card,
  shadowHover: componentShadows.cardHover,
  shadowFocus: stateShadows.focus(
    theme?.colors?.primary || colors.empregado.primary
  ),
});

// Constantes de design
export const designConstants = {
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.125rem', // 2px
    base: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    '2xl': '1rem', // 16px
    '3xl': '1.5rem', // 24px
    full: '9999px',
  },

  // Z-index layers
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Transitions
  transition: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',

    // Propriedades específicas
    color: '150ms ease-in-out',
    background: '150ms ease-in-out',
    border: '150ms ease-in-out',
    shadow: '150ms ease-in-out',
    transform: '150ms ease-in-out',
    opacity: '150ms ease-in-out',
  },

  // Timing functions
  easing: {
    linear: 'linear',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',

    // Cubic bezier customizados
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
};

// Breakpoints para media queries
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Utilities
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,

  // Orientação
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',

  // Preferências do usuário
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  prefersDarkMode: '@media (prefers-color-scheme: dark)',
};

// Função para aplicar estilos responsivos
export const responsive = (styles: Record<string, any>) => {
  const breakpointKeys = Object.keys(breakpoints);
  let responsiveStyles = '';

  breakpointKeys.forEach(breakpoint => {
    if (styles[breakpoint]) {
      responsiveStyles += `
        ${mediaQueries[breakpoint as keyof typeof mediaQueries]} {
          ${styles[breakpoint]}
        }
      `;
    }
  });

  return responsiveStyles;
};

export default {
  colors,
  spacing,
  typography,
  shadows,
  designConstants,
  mediaQueries,
  getThemeValue,
  createThemedStyles,
  responsive,
};
