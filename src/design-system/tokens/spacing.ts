// Design System - Spacing Tokens

export const spacing = {
  // Espaçamentos base
  0: '0',
  px: '1px',

  // Escala de espaçamentos
  1: '0.25rem', // 4px
  2: '0.5rem', // 8px
  3: '0.75rem', // 12px
  4: '1rem', // 16px
  5: '1.25rem', // 20px
  6: '1.5rem', // 24px
  8: '2rem', // 32px
  10: '2.5rem', // 40px
  12: '3rem', // 48px
  16: '4rem', // 64px
  20: '5rem', // 80px
  24: '6rem', // 96px
  32: '8rem', // 128px
  40: '10rem', // 160px
  48: '12rem', // 192px
  56: '14rem', // 224px
  64: '16rem', // 256px

  // Aliases semânticos
  xs: '0.25rem', // 4px
  sm: '0.5rem', // 8px
  md: '1rem', // 16px
  lg: '1.5rem', // 24px
  xl: '2rem', // 32px
  '2xl': '3rem', // 48px
  '3xl': '4rem', // 64px
  '4xl': '5rem', // 80px
  '5xl': '6rem', // 96px
};

// Espaçamentos específicos para componentes
export const componentSpacing = {
  // Padding interno de componentes
  buttonPadding: {
    sm: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    md: `${spacing[3]} ${spacing[4]}`, // 12px 16px
    lg: `${spacing[4]} ${spacing[6]}`, // 16px 24px
  },

  inputPadding: {
    sm: `${spacing[2]} ${spacing[3]}`, // 8px 12px
    md: `${spacing[3]} ${spacing[4]}`, // 12px 16px
    lg: `${spacing[4]} ${spacing[5]}`, // 16px 20px
  },

  cardPadding: {
    sm: spacing[4], // 16px
    md: spacing[6], // 24px
    lg: spacing[8], // 32px
  },

  modalPadding: {
    sm: spacing[4], // 16px
    md: spacing[6], // 24px
    lg: spacing[8], // 32px
  },

  // Gaps entre elementos
  stackGap: {
    xs: spacing[1], // 4px
    sm: spacing[2], // 8px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
  },

  gridGap: {
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
  },

  // Margens
  sectionMargin: {
    sm: spacing[8], // 32px
    md: spacing[12], // 48px
    lg: spacing[16], // 64px
  },
};

// Breakpoints para responsividade
export const breakpoints = {
  xs: '0px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  '2xl': '1400px',
};

// Container max-widths
export const containerSizes = {
  sm: '540px',
  md: '720px',
  lg: '960px',
  xl: '1140px',
  '2xl': '1320px',
};

export default spacing;
