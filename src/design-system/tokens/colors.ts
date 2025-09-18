// Design System - Color Tokens
export const colors = {
  // Cores base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Escala de cinzas
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // Cores de status
  success: '#10B981',
  successLight: '#D1FAE5',
  successDark: '#065F46',

  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#92400E',

  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#991B1B',

  info: '#3B82F6',
  infoLight: '#DBEAFE',
  infoDark: '#1E40AF',

  // Cores dos perfis (primárias)
  empregado: {
    primary: '#29ABE2',
    secondary: '#90EE90',
    accent: '#FFDA63',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E9ECEF',
    shadow: 'rgba(41, 171, 226, 0.1)',
  },

  empregador: {
    primary: '#E74C3C',
    secondary: '#F39C12',
    accent: '#9B59B6',
    background: '#FFFFFF',
    surface: '#FDF2F2',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#FADBD8',
    shadow: 'rgba(231, 76, 60, 0.1)',
  },

  familia: {
    primary: '#9B59B6',
    secondary: '#E91E63',
    accent: '#FF9800',
    background: '#FFFFFF',
    surface: '#F3E5F5',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#E1BEE7',
    shadow: 'rgba(155, 89, 182, 0.1)',
  },

  admin: {
    primary: '#34495E',
    secondary: '#2ECC71',
    accent: '#F1C40F',
    background: '#FFFFFF',
    surface: '#F4F6F7',
    text: '#2C3E50',
    textSecondary: '#7F8C8D',
    border: '#D5DBDB',
    shadow: 'rgba(52, 73, 94, 0.1)',
  },
};

// Função para obter cores do perfil
export const getProfileColors = (profileId: string = 'empregado') => {
  return colors[profileId as keyof typeof colors] || colors.empregado;
};

// Função para gerar variações de cor
export const generateColorVariations = (baseColor: string) => {
  return {
    base: baseColor,
    light: `${baseColor}20`, // 20% opacity
    lighter: `${baseColor}10`, // 10% opacity
    dark: `${baseColor}80`, // 80% opacity
    darker: `${baseColor}90`, // 90% opacity
  };
};

// Cores semânticas reutilizáveis
export const semanticColors = {
  // Estados de validação
  valid: colors.success,
  invalid: colors.error,
  pending: colors.warning,

  // Estados de componentes
  disabled: colors.gray400,
  placeholder: colors.gray500,
  divider: colors.gray200,

  // Backgrounds
  bodyBackground: colors.gray50,
  cardBackground: colors.white,
  modalBackground: 'rgba(0, 0, 0, 0.5)',

  // Texto
  textPrimary: colors.gray900,
  textSecondary: colors.gray600,
  textMuted: colors.gray500,
  textInverse: colors.white,

  // Bordas
  borderLight: colors.gray200,
  borderMedium: colors.gray300,
  borderDark: colors.gray400,

  // Sombras
  shadowLight: 'rgba(0, 0, 0, 0.05)',
  shadowMedium: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.15)',
};

export default colors;
