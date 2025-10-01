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
  info: semanticColors.pending, // usando pending como fallback para info

  // Sombras temáticas
  shadowColored: componentShadows.card,
  shadowHover: componentShadows.cardHover,
  shadowFocus: stateShadows.focus(
    theme?.colors?.primary || colors.empregado.primary
  ),
});

// Constantes de design (importadas para evitar dependência circular)
export { designConstants } from './tokens/constants';

// Importar tokens para uso local
import { colors, semanticColors } from './tokens/colors';
import { designConstants } from './tokens/constants';
import { componentShadows, shadows, stateShadows } from './tokens/shadows';
import { breakpoints, spacing } from './tokens/spacing';
import typography from './tokens/typography';

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

const designSystem = {
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

export default designSystem;
