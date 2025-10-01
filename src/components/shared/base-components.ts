import styled from 'styled-components';
import {
  tokens,
  getColor,
  getSpacing,
  getFontSize,
  getShadow,
  getTransition,
  getBorderRadius,
} from './tokens';
import {
  themedMixin,
  responsiveMixin,
  sizeMixin,
  validationMixin,
  transitionMixin,
  hoverMixin,
  focusMixin,
  disabledMixin,
  gridMixin,
  flexMixin,
  statusColorMixin,
  touchTargetMixin,
  accessibilityMixin,
  animationMixin,
  shadowMixin,
  borderRadiusMixin,
  spacingMixin,
} from './mixins';

// 🎯 Componentes base otimizados

// Base para containers
export const BaseContainer = styled.div<{
  $theme?: any;
  $padding?: string;
  $margin?: string;
  $background?: string;
  $border?: string;
  $borderRadius?: string;
  $shadow?: 'sm' | 'md' | 'lg';
}>`
  padding: ${props => props.$padding || getSpacing('md')};
  margin: ${props => props.$margin || '0'};
  background: ${props =>
    props.$background ||
    getColor('surface.primary', props.$theme?.colors?.background)};
  border: ${props =>
    props.$border ||
    `1px solid ${getColor('border.primary', props.$theme?.colors?.border)}`};
  border-radius: ${props => {
    const radius = (props.$borderRadius as any) || 'md';
    return radius === 'sm' ? '0.25rem' : radius === 'md' ? '0.5rem' : radius === 'lg' ? '1rem' : radius === 'full' ? '9999px' : radius;
  }};
  ${props => props.$shadow && shadowMixin(props.$shadow)}
  ${themedMixin}
  ${transitionMixin}
`;

// Base para inputs
export const BaseInput = styled.input<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $hasError?: boolean;
  $fullWidth?: boolean;
}>`
  ${props => sizeMixin(props.$size || 'md')}
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  border: 1px solid
    ${props => getColor('border.primary', props.$theme?.colors?.border)};
  border-radius: 0.5rem;
  background: ${props =>
    getColor('surface.primary', props.$theme?.colors?.background)};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  ${props => validationMixin(props.$hasError || false, props.$theme)}
  ${transitionMixin}
  ${focusMixin}
  ${disabledMixin}
  ${touchTargetMixin}
  ${accessibilityMixin}
  
  &::placeholder {
    color: ${props =>
      getColor('text.secondary', props.$theme?.colors?.placeholder)};
  }
`;

// Base para selects
export const BaseSelect = styled.select<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $hasError?: boolean;
  $fullWidth?: boolean;
}>`
  ${props => sizeMixin(props.$size || 'md')}
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  border: 1px solid
    ${props => getColor('border.primary', props.$theme?.colors?.border)};
  border-radius: 0.5rem;
  background: ${props =>
    getColor('surface.primary', props.$theme?.colors?.background)};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  cursor: pointer;
  ${props => validationMixin(props.$hasError || false, props.$theme)}
  ${transitionMixin}
  ${focusMixin}
  ${disabledMixin}
  ${touchTargetMixin}
  ${accessibilityMixin}
`;

// Base para botões
export const BaseButton = styled.button<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $variant?:
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'ghost'
    | 'link';
  $fullWidth?: boolean;
  $loading?: boolean;
}>`
  ${props => sizeMixin(props.$size || 'md')}
  width: ${props => (props.$fullWidth ? '100%' : 'auto')};
  border: none;
  border-radius: 0.5rem;
  cursor: ${props => (props.$loading ? 'wait' : 'pointer')};
  font-weight: ${tokens.fontWeight.medium};
  ${transitionMixin}
  ${props => hoverMixin(props.$theme)}
  ${focusMixin}
  ${disabledMixin}
  ${touchTargetMixin}
  ${accessibilityMixin}
  ${animationMixin}
  
  /* Variantes de cor */
  background: ${props => {
    const variant = props.$variant || 'primary';
    return variant === 'primary'
      ? getColor('primary', props.$theme?.colors?.primary)
      : variant === 'secondary'
        ? getColor('surface.secondary', props.$theme?.colors?.secondary)
        : variant === 'success'
          ? getColor('success', props.$theme?.colors?.success)
          : variant === 'warning'
            ? getColor('warning', props.$theme?.colors?.warning)
            : variant === 'danger'
              ? getColor('error', props.$theme?.colors?.error)
              : variant === 'ghost'
                ? 'transparent'
                : 'transparent';
  }};

  color: ${props => {
    const variant = props.$variant || 'primary';
    return variant === 'ghost' || variant === 'link'
      ? getColor('primary', props.$theme?.colors?.primary)
      : getColor('surface.primary', props.$theme?.colors?.white);
  }};

  &:hover {
    background: ${props => {
      const variant = props.$variant || 'primary';
      return variant === 'ghost'
        ? getColor('hover', props.$theme?.colors?.hover)
        : variant === 'link'
          ? 'transparent'
          : 'auto';
    }};
  }
`;

// Base para labels
export const BaseLabel = styled.label<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $required?: boolean;
}>`
  ${props => sizeMixin(props.$size || 'md')}
  font-weight: ${tokens.fontWeight.semibold};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  display: block;
  margin-bottom: ${getSpacing('sm')};

  ${props =>
    props.$required &&
    `
    &::after {
      content: ' *';
      color: ${getColor('error', props.$theme?.colors?.error)};
    }
  `}
`;

// Base para mensagens de erro
export const BaseErrorMessage = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'sm')}
  color: ${props => getColor('error', props.$theme?.colors?.error)};
  font-weight: ${tokens.fontWeight.medium};
  margin-top: ${getSpacing('sm')};
  display: flex;
  align-items: center;
  gap: ${getSpacing('xs')};
`;

// Base para mensagens de sucesso
export const BaseSuccessMessage = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'sm')}
  color: ${props => getColor('success', props.$theme?.colors?.success)};
  background: ${props =>
    getColor('successLight', props.$theme?.colors?.successLight)};
  padding: ${getSpacing('md')};
  border-radius: 0.5rem;
  border: 1px solid ${props =>
    getColor('success', props.$theme?.colors?.success)};
  font-weight: ${tokens.fontWeight.medium};
  margin-top: ${getSpacing('sm')};
  display: flex;
  align-items: center;
  gap: ${getSpacing('xs')};
`;

// Base para containers flex
export const BaseFlexContainer = styled.div<{
  $theme?: any;
  $direction?: 'row' | 'column';
  $gap?: string;
  $align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  $justify?:
    | 'flex-start'
    | 'center'
    | 'flex-end'
    | 'space-between'
    | 'space-around';
  $wrap?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  gap: ${props => props.$gap || getSpacing('md')};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-wrap: ${props => (props.$wrap ? 'wrap' : 'nowrap')};
  ${responsiveMixin}
`;

// Base para containers grid
export const BaseGridContainer = styled.div<{
  $theme?: any;
  $columns?: string;
  $gap?: string;
  $align?: 'start' | 'center' | 'end' | 'stretch';
  $justify?: 'start' | 'center' | 'end' | 'stretch';
}>`
  ${gridMixin}
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(200px, 1fr))'};
  gap: ${props => props.$gap || getSpacing('md')};
  align-items: ${props => props.$align || 'stretch'};
  justify-items: ${props => props.$justify || 'stretch'};
`;

// Base para cards
export const BaseCard = styled.div<{
  $theme?: any;
  $padding?: string;
  $margin?: string;
  $shadow?: 'sm' | 'md' | 'lg';
  $border?: string;
  $borderRadius?: string;
  $background?: string;
}>`
  padding: ${props => props.$padding || getSpacing('lg')};
  margin: ${props => props.$margin || '0'};
  background: ${props =>
    props.$background ||
    getColor('surface.primary', props.$theme?.colors?.background)};
  border: ${props =>
    props.$border ||
    `1px solid ${getColor('border.primary', props.$theme?.colors?.border)}`};
  border-radius: ${props => {
    const radius = (props.$borderRadius as any) || 'md';
    return radius === 'sm' ? '0.25rem' : radius === 'md' ? '0.5rem' : radius === 'lg' ? '1rem' : radius === 'full' ? '9999px' : radius;
  }};
  ${props => props.$shadow && shadowMixin(props.$shadow)}
  ${transitionMixin}
  ${animationMixin}
`;

// Base para modais
export const BaseModal = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg' | 'xl';
  $fullscreen?: boolean;
}>`
  background: ${props =>
    getColor('surface.primary', props.$theme?.colors?.background)};
  border-radius: ${props => props.$fullscreen ? '0.25rem' : '1rem'};
  ${props => shadowMixin('lg')}
  ${transitionMixin}
  ${animationMixin}
  
  ${props =>
    props.$fullscreen
      ? `
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  `
      : `
    width: ${
      props.$size === 'sm'
        ? '400px'
        : props.$size === 'md'
          ? '600px'
          : props.$size === 'lg'
            ? '800px'
            : '1000px'
    };
    max-width: 90vw;
    max-height: 90vh;
  `}
`;

// Base para overlays
export const BaseOverlay = styled.div<{
  $theme?: any;
  $zIndex?: number;
  $background?: string;
}>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$background || 'rgba(0, 0, 0, 0.5)'};
  z-index: ${props => props.$zIndex || tokens.zIndex.modal};
  display: flex;
  align-items: center;
  justify-content: center;
  ${transitionMixin}
`;

// Base para tooltips
export const BaseTooltip = styled.div<{
  $theme?: any;
  $position?: 'top' | 'bottom' | 'left' | 'right';
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'sm')}
  background: ${props =>
    getColor('text.primary', props.$theme?.colors?.tooltipBackground)};
  color: ${props =>
    getColor('surface.primary', props.$theme?.colors?.tooltipText)};
  padding: ${getSpacing('sm')} ${getSpacing('md')};
  border-radius: 0.25rem;
  ${shadowMixin('md')}
  position: absolute;
  z-index: ${tokens.zIndex.tooltip};
  white-space: nowrap;
  ${transitionMixin}

  /* Posicionamento */
  ${props =>
    props.$position === 'top' &&
    `
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: ${getSpacing('sm')};
  `}
  
  ${props =>
    props.$position === 'bottom' &&
    `
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-top: ${getSpacing('sm')};
  `}
  
  ${props =>
    props.$position === 'left' &&
    `
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-right: ${getSpacing('sm')};
  `}
  
  ${props =>
    props.$position === 'right' &&
    `
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    margin-left: ${getSpacing('sm')};
  `}
`;

// Base para loading spinners
export const BaseSpinner = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $color?: string;
}>`
  width: ${props =>
    props.$size === 'sm' ? '16px' : props.$size === 'lg' ? '32px' : '24px'};
  height: ${props =>
    props.$size === 'sm' ? '16px' : props.$size === 'lg' ? '32px' : '24px'};
  border: 2px solid
    ${props =>
      props.$color || getColor('border.primary', props.$theme?.colors?.border)};
  border-top: 2px solid
    ${props =>
      props.$color || getColor('primary', props.$theme?.colors?.primary)};
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

// Base para progress bars
export const BaseProgressBar = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  $color?: string;
  $background?: string;
}>`
  width: 100%;
  height: ${props =>
    props.$size === 'sm' ? '4px' : props.$size === 'lg' ? '12px' : '8px'};
  background: ${props =>
    props.$background ||
    getColor('surface.secondary', props.$theme?.colors?.background)};
  border-radius: 9999px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: ${props =>
      props.$color || getColor('primary', props.$theme?.colors?.primary)};
    border-radius: 9999px;
    ${transitionMixin}
  }
`;

// Base para badges
export const BaseBadge = styled.span<{
  $theme?: any;
  $variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'sm')}
  display: inline-flex;
  align-items: center;
  gap: ${getSpacing('xs')};
  padding: ${getSpacing('xs')} ${getSpacing('sm')};
  border-radius: 9999px;
  font-weight: ${tokens.fontWeight.medium};
  ${props => statusColorMixin((props.$variant === 'neutral' ? 'info' : props.$variant) || 'info', props.$theme)}
  ${transitionMixin}
`;

// Base para dividers
export const BaseDivider = styled.hr<{
  $theme?: any;
  $orientation?: 'horizontal' | 'vertical';
  $size?: 'sm' | 'md' | 'lg';
  $color?: string;
}>`
  border: none;
  background: ${props =>
    props.$color || getColor('border.primary', props.$theme?.colors?.border)};

  ${props =>
    props.$orientation === 'horizontal'
      ? `
    width: 100%;
    height: ${props.$size === 'sm' ? '1px' : props.$size === 'lg' ? '3px' : '2px'};
    margin: ${getSpacing('md')} 0;
  `
      : `
    height: 100%;
    width: ${props.$size === 'sm' ? '1px' : props.$size === 'lg' ? '3px' : '2px'};
    margin: 0 ${getSpacing('md')};
  `}
`;
