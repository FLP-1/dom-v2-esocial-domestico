// 🎨 Tokens otimizados para styled components

export const tokens = {
  // Cores base
  colors: {
    primary: '#29ABE2',
    primaryLight: 'rgba(41, 171, 226, 0.1)',
    primaryDark: '#1E8BC3',

    // Cores de status
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    error: '#EF4444',
    errorLight: '#FEE2E2',
    info: '#3B82F6',
    infoLight: '#DBEAFE',

    // Cores neutras
    text: {
      primary: '#2C3E50',
      secondary: '#6C757D',
      disabled: '#9CA3AF',
    },

    surface: {
      primary: '#FFFFFF',
      secondary: '#F8F9FA',
      tertiary: '#F3F4F6',
    },

    border: {
      primary: '#E5E7EB',
      secondary: '#D1D5DB',
      focus: '#29ABE2',
    },

    // Estados
    hover: 'rgba(41, 171, 226, 0.1)',
    disabled: '#F8F9FA',
  },

  // Espaçamento
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },

  // Tamanhos de fonte
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
  },

  // Pesos de fonte
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Border radius
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '50%',
  },

  // Sombras
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.1)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 25px rgba(0, 0, 0, 0.15)',
    focus: '0 0 0 3px rgba(41, 171, 226, 0.1)',
  },

  // Transições
  transitions: {
    fast: '0.15s ease',
    normal: '0.2s ease',
    slow: '0.3s ease',
    bounce: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '992px',
    desktop: '1200px',
  },

  // Z-index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
  },

  // Touch targets (acessibilidade)
  touchTargets: {
    minSize: '44px',
    minHeight: '44px',
  },
} as const;

// 🎯 Helper functions para usar tokens
export const getColor = (path: string, fallback?: string) => {
  const keys = path.split('.');
  let value: any = tokens.colors;

  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) break;
  }

  return value || fallback || tokens.colors.text.primary;
};

export const getSpacing = (size: keyof typeof tokens.spacing) => {
  return tokens.spacing[size];
};

export const getFontSize = (size: keyof typeof tokens.fontSize) => {
  return tokens.fontSize[size];
};

export const getShadow = (level: keyof typeof tokens.shadows) => {
  return tokens.shadows[level];
};

export const getTransition = (type: keyof typeof tokens.transitions) => {
  return tokens.transitions[type];
};

export const getBorderRadius = (size: keyof typeof tokens.borderRadius) => {
  return tokens.borderRadius[size];
};

// 🎨 Função para aplicar tema
export const applyTheme = (theme: any, fallback: any = tokens) => {
  return {
    colors: { ...fallback.colors, ...theme?.colors },
    spacing: { ...fallback.spacing, ...theme?.spacing },
    fontSize: { ...fallback.fontSize, ...theme?.fontSize },
    fontWeight: { ...fallback.fontWeight, ...theme?.fontWeight },
    borderRadius: { ...fallback.borderRadius, ...theme?.borderRadius },
    shadows: { ...fallback.shadows, ...theme?.shadows },
    transitions: { ...fallback.transitions, ...theme?.transitions },
  };
};

// 🚀 Função para criar variantes
export const createVariants = <T extends Record<string, any>>(
  variants: T,
  defaultVariant: keyof T
) => {
  return (variant: keyof T = defaultVariant) => variants[variant];
};

// 📱 Função para media queries
export const mediaQuery = (breakpoint: keyof typeof tokens.breakpoints) => {
  return `@media (max-width: ${tokens.breakpoints[breakpoint]})`;
};

// 🎯 Função para criar estilos responsivos
export const responsive = {
  mobile: mediaQuery('mobile'),
  tablet: mediaQuery('tablet'),
  desktop: mediaQuery('desktop'),
};

// 🔧 Função para criar estilos condicionais
export const conditional = (
  condition: boolean,
  trueStyle: string,
  falseStyle: string = ''
) => {
  return condition ? trueStyle : falseStyle;
};

// 🎨 Função para criar estilos de validação
export const validationStyles = (hasError: boolean, theme: any) => {
  return {
    borderColor: hasError
      ? getColor('error', theme?.colors?.error)
      : getColor('border.primary', theme?.colors?.border),
    boxShadow: hasError ? getShadow('sm') : 'none',
  };
};

// 🚀 Função para criar estilos de hover
export const hoverStyles = (theme: any) => {
  return {
    backgroundColor: getColor('hover', theme?.colors?.hover),
    transform: 'translateY(-1px)',
    transition: getTransition('normal'),
  };
};

// 🎯 Função para criar estilos de focus
export const focusStyles = (theme: any) => {
  return {
    outline: 'none',
    borderColor: getColor('border.focus', theme?.colors?.primary),
    boxShadow: getShadow('focus'),
  };
};

// 📱 Função para criar estilos de disabled
export const disabledStyles = (theme: any) => {
  return {
    backgroundColor: getColor('disabled', theme?.colors?.disabled),
    color: getColor('text.disabled', theme?.colors?.textDisabled),
    cursor: 'not-allowed',
    opacity: 0.6,
  };
};
