// Design System - Typography Tokens

export const fontFamily = {
  // Fontes principais
  sans: [
    'Inter',
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
  mono: [
    'Fira Code',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],

  // Fontes específicas do sistema
  heading: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
  body: ['Inter', 'system-ui', 'sans-serif'],
  button: ['Inter', 'system-ui', 'sans-serif'],
};

export const fontSize = {
  // Escala de tamanhos
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
};

export const fontWeight = {
  thin: '100',
  extralight: '200',
  light: '300',
  normal: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900',
};

export const lineHeight = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',

  // Aliases específicos
  heading: '1.2',
  body: '1.5',
  caption: '1.4',
};

export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

// Estilos de texto predefinidos
export const textStyles = {
  // Headings
  h1: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['4xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.tight,
  },

  h2: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['3xl'],
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.tight,
  },

  h3: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },

  h4: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },

  h5: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },

  h6: {
    fontFamily: fontFamily.heading,
    fontSize: fontSize.base,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.heading,
    letterSpacing: letterSpacing.normal,
  },

  // Body text
  bodyLarge: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.body,
    letterSpacing: letterSpacing.normal,
  },

  body: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.body,
    letterSpacing: letterSpacing.normal,
  },

  bodySmall: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.body,
    letterSpacing: letterSpacing.normal,
  },

  // Utility text
  caption: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.caption,
    letterSpacing: letterSpacing.wide,
  },

  overline: {
    fontFamily: fontFamily.body,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.caption,
    letterSpacing: letterSpacing.widest,
    textTransform: 'uppercase' as const,
  },

  // Button text
  buttonLarge: {
    fontFamily: fontFamily.button,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.normal,
  },

  button: {
    fontFamily: fontFamily.button,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.normal,
  },

  buttonSmall: {
    fontFamily: fontFamily.button,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.none,
    letterSpacing: letterSpacing.normal,
  },

  // Code text
  code: {
    fontFamily: fontFamily.mono,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.normal,
    letterSpacing: letterSpacing.normal,
  },
};

// Responsive typography
export const responsiveTextStyles = {
  // Hero text - responsivo
  hero: {
    fontSize: {
      base: fontSize['4xl'],
      md: fontSize['5xl'],
      lg: fontSize['6xl'],
    },
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.tight,
  },

  // Display text - responsivo
  display: {
    fontSize: {
      base: fontSize['3xl'],
      md: fontSize['4xl'],
      lg: fontSize['5xl'],
    },
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading,
  },
};

const typographyTokens = {
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  textStyles,
  responsiveTextStyles,
};

export default typographyTokens;
