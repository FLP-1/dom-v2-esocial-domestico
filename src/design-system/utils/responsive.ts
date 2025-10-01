// Utilitários de responsividade padronizados
import { useState, useEffect } from 'react';
import { breakpoints } from '../tokens/spacing';

// Media queries padronizadas
export const mediaQueries = {
  // Mobile first approach
  mobile: `@media (max-width: ${breakpoints.md})`,
  tablet: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktop: `@media (min-width: ${breakpoints.lg})`,

  // Breakpoints específicos
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,

  // Utilities específicas
  mobileOnly: `@media (max-width: ${breakpoints.md})`,
  tabletOnly: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  desktopOnly: `@media (min-width: ${breakpoints.lg})`,

  // Orientação
  landscape: '@media (orientation: landscape)',
  portrait: '@media (orientation: portrait)',

  // Preferências do usuário
  prefersReducedMotion: '@media (prefers-reduced-motion: reduce)',
  prefersDarkMode: '@media (prefers-color-scheme: dark)',

  // Touch devices
  touchDevice: '@media (hover: none) and (pointer: coarse)',
  mouseDevice: '@media (hover: hover) and (pointer: fine)',
};

// Função para criar estilos responsivos
export const responsive = (styles: {
  mobile?: string;
  tablet?: string;
  desktop?: string;
  [key: string]: string | undefined;
}) => {
  let css = '';

  // Mobile first
  if (styles.mobile) {
    css += styles.mobile;
  }

  // Tablet
  if (styles.tablet) {
    css += `
      ${mediaQueries.tablet} {
        ${styles.tablet}
      }
    `;
  }

  // Desktop
  if (styles.desktop) {
    css += `
      ${mediaQueries.desktop} {
        ${styles.desktop}
      }
    `;
  }

  // Breakpoints específicos
  Object.keys(breakpoints).forEach(breakpoint => {
    if (styles[breakpoint]) {
      css += `
        ${mediaQueries[breakpoint as keyof typeof mediaQueries]} {
          ${styles[breakpoint]}
        }
      `;
    }
  });

  return css;
};

// Container responsivo
export const createResponsiveContainer = (maxWidth?: string) => `
  width: 100%;
  max-width: ${maxWidth || '1200px'};
  margin: 0 auto;
  padding: 0 1rem;

  ${mediaQueries.sm} {
    padding: 0 1.5rem;
  }

  ${mediaQueries.lg} {
    padding: 0 2rem;
  }
`;

// Grid responsivo
export const createResponsiveGrid = (columns: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}) => `
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(${columns.mobile || 1}, 1fr);

  ${mediaQueries.tablet} {
    grid-template-columns: repeat(${columns.tablet || 2}, 1fr);
    gap: 1.5rem;
  }

  ${mediaQueries.desktop} {
    grid-template-columns: repeat(${columns.desktop || 3}, 1fr);
    gap: 2rem;
  }
`;

// Tipografia responsiva
export const createResponsiveText = (sizes: {
  mobile: string;
  tablet?: string;
  desktop?: string;
}) => `
  font-size: ${sizes.mobile};

  ${
    sizes.tablet
      ? `
    ${mediaQueries.tablet} {
      font-size: ${sizes.tablet};
    }
  `
      : ''
  }

  ${
    sizes.desktop
      ? `
    ${mediaQueries.desktop} {
      font-size: ${sizes.desktop};
    }
  `
      : ''
  }
`;

// Espaçamento responsivo
export const createResponsiveSpacing = (spacing: {
  mobile: string;
  tablet?: string;
  desktop?: string;
}) => `
  padding: ${spacing.mobile};

  ${
    spacing.tablet
      ? `
    ${mediaQueries.tablet} {
      padding: ${spacing.tablet};
    }
  `
      : ''
  }

  ${
    spacing.desktop
      ? `
    ${mediaQueries.desktop} {
      padding: ${spacing.desktop};
    }
  `
      : ''
  }
`;

// Modal responsivo
export const createResponsiveModal = () => `
  /* Mobile: Fullscreen modal */
  ${mediaQueries.mobile} {
    position: fixed !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
  }

  /* Tablet: Centered with margins */
  ${mediaQueries.tablet} {
    max-width: 90%;
    max-height: 90%;
    margin: 2rem auto;
  }

  /* Desktop: Normal modal */
  ${mediaQueries.desktop} {
    max-width: 600px;
    max-height: 80vh;
  }
`;

// Sidebar responsivo
export const createResponsiveSidebar = () => `
  /* Mobile: Hidden by default, overlay when open */
  ${mediaQueries.mobile} {
    position: fixed;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 1100;

    &.open {
      transform: translateX(0);
    }

    &::after {
      content: '';
      position: fixed;
      top: 0;
      left: 280px;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: -1;
    }
  }

  /* Tablet: Collapsible */
  ${mediaQueries.tablet} {
    position: relative;
    transform: none;
  }

  /* Desktop: Always visible */
  ${mediaQueries.desktop} {
    position: relative;
  }
`;

// Formulário responsivo
export const createResponsiveForm = () => `
  /* Mobile: Single column */
  ${mediaQueries.mobile} {
    .form-row {
      grid-template-columns: 1fr !important;
      gap: 1rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    input, select, textarea {
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }

  /* Tablet: Two columns */
  ${mediaQueries.tablet} {
    .form-row {
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }
  }

  /* Desktop: Flexible columns */
  ${mediaQueries.desktop} {
    .form-row {
      gap: 2rem;
    }
  }
`;

// Função para detectar dispositivo
export const deviceDetection = {
  isMobile: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < parseInt(breakpoints.md);
  },

  isTablet: () => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return (
      width >= parseInt(breakpoints.md) && width < parseInt(breakpoints.lg)
    );
  },

  isDesktop: () => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth >= parseInt(breakpoints.lg);
  },

  isTouchDevice: () => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
};

// Hook para responsividade
export const useResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(deviceDetection.isMobile());
      setIsTablet(deviceDetection.isTablet());
      setIsDesktop(deviceDetection.isDesktop());
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice: deviceDetection.isTouchDevice(),
  };
};

const responsiveUtils = {
  mediaQueries,
  responsive,
  createResponsiveContainer,
  createResponsiveGrid,
  createResponsiveText,
  createResponsiveSpacing,
  createResponsiveModal,
  createResponsiveSidebar,
  createResponsiveForm,
  deviceDetection,
  useResponsive,
};

export default responsiveUtils;
