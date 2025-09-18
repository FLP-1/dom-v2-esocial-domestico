// Design System - Shadow Tokens

export const shadows = {
  // Sombras base
  none: 'none',

  // Elevação progressiva
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  '2xl': '0 50px 100px -20px rgba(0, 0, 0, 0.25)',

  // Sombras internas
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  innerLg: 'inset 0 4px 8px 0 rgba(0, 0, 0, 0.1)',

  // Sombras coloridas (para usar com cores de tema)
  colored: {
    xs: (color: string) => `0 1px 2px 0 ${color}20`,
    sm: (color: string) => `0 1px 3px 0 ${color}30, 0 1px 2px 0 ${color}20`,
    base: (color: string) =>
      `0 4px 6px -1px ${color}30, 0 2px 4px -1px ${color}20`,
    md: (color: string) =>
      `0 10px 15px -3px ${color}30, 0 4px 6px -2px ${color}20`,
    lg: (color: string) =>
      `0 20px 25px -5px ${color}30, 0 10px 10px -5px ${color}20`,
  },
};

// Sombras específicas para componentes
export const componentShadows = {
  // Cards
  card: shadows.sm,
  cardHover: shadows.md,
  cardActive: shadows.lg,

  // Modais
  modal: shadows['2xl'],
  modalBackdrop: 'rgba(0, 0, 0, 0.5)',

  // Botões
  button: shadows.xs,
  buttonHover: shadows.sm,
  buttonActive: shadows.inner,

  // Dropdowns
  dropdown: shadows.lg,
  tooltip: shadows.md,

  // Navegação
  navbar: shadows.sm,
  sidebar: shadows.base,

  // Inputs
  input: 'none',
  inputFocus: (color: string) => `0 0 0 3px ${color}20`,
  inputError: (color: string) => `0 0 0 3px ${color}20`,

  // Elementos flutuantes
  floating: shadows.xl,
  overlay: shadows['2xl'],
};

// Sombras para diferentes estados
export const stateShadows = {
  // Estados de interação
  hover: shadows.md,
  active: shadows.inner,
  focus: (color: string) => `0 0 0 3px ${color}20`,

  // Estados de validação
  success: (color: string) => `0 0 0 3px ${color}20`,
  error: (color: string) => `0 0 0 3px ${color}20`,
  warning: (color: string) => `0 0 0 3px ${color}20`,

  // Estados de elevação
  elevated: shadows.lg,
  floating: shadows.xl,
  overlay: shadows['2xl'],
};

// Função utilitária para gerar sombras customizadas
export const createShadow = (
  x: number,
  y: number,
  blur: number,
  spread: number,
  color: string,
  opacity: number = 0.1
) => {
  return `${x}px ${y}px ${blur}px ${spread}px ${color}${Math.round(
    opacity * 255
  )
    .toString(16)
    .padStart(2, '0')}`;
};

// Função para combinar múltiplas sombras
export const combineShadows = (...shadows: string[]) => {
  return shadows.filter(shadow => shadow !== 'none').join(', ');
};

export default shadows;
