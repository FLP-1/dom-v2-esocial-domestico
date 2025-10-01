import styled from 'styled-components';
import {
  BaseContainer,
  BaseInput,
  BaseSelect,
  BaseButton,
  BaseLabel,
  BaseErrorMessage,
  BaseSuccessMessage,
  BaseFlexContainer,
  BaseGridContainer,
  BaseCard,
} from './base-components';
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
import {
  tokens,
  getColor,
  getSpacing,
  getFontSize,
  getShadow,
  getTransition,
  getBorderRadius,
} from './tokens';

// 🚀 Componentes otimizados que substituem os atuais

// FormRow otimizado
export const OptimizedFormRow = styled(BaseGridContainer)`
  grid-template-columns: 1fr 1fr;
  gap: ${getSpacing('md')};
  margin-bottom: ${getSpacing('md')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${getSpacing('lg')};
    margin-bottom: ${getSpacing('lg')};
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: ${getSpacing('lg')};
  }

  @media (min-width: 992px) {
    gap: ${getSpacing('xl')};
  }
`;

// FormSection otimizado
export const OptimizedFormSection = styled(BaseCard)`
  margin-bottom: ${getSpacing('lg')};
  padding: ${getSpacing('md')};
  background: ${props =>
    getColor('surface.secondary', props.$theme?.colors?.surface)};
  border: 1px solid
    ${props => getColor('border.primary', props.$theme?.colors?.border)};
  ${themedMixin}
`;

// SectionTitle otimizado
export const OptimizedSectionTitle = styled.h3<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'md')}
  font-weight: ${tokens.fontWeight.semibold};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  margin: 0 0 ${getSpacing('md')} 0;
  display: flex;
  align-items: center;
  gap: ${getSpacing('sm')};
  padding-bottom: ${getSpacing('sm')};
  border-bottom: 1px solid
    ${props => getColor('border.primary', props.$theme?.colors?.border)};
  ${themedMixin}
`;

// Label otimizado
export const OptimizedLabel = styled(BaseLabel)`
  font-weight: ${tokens.fontWeight.semibold};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  margin-bottom: ${getSpacing('sm')};
  display: block;
  ${themedMixin}
`;

// InputStyled otimizado
export const OptimizedInputStyled = styled(BaseInput)`
  width: 100%;
  ${props => sizeMixin(props.$size || 'md')}
  border: 1px solid ${props =>
    getColor('border.primary', props.$theme?.colors?.border)};
  ${props => borderRadiusMixin('md')}
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

// SelectStyled otimizado
export const OptimizedSelectStyled = styled(BaseSelect).attrs<{ title?: string }>((props) => ({
  title: props.title || 'Selecionar opção',
}))`
  width: 100%;
  ${props => sizeMixin(props.$size || 'md')}
  border: 1px solid ${props =>
    getColor('border.primary', props.$theme?.colors?.border)};
  ${props => borderRadiusMixin('md')}
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

// ErrorMessage otimizado
export const OptimizedErrorMessage = styled(BaseErrorMessage)`
  color: ${props => getColor('error', props.$theme?.colors?.error)};
  font-weight: ${tokens.fontWeight.medium};
  margin-top: ${getSpacing('sm')};
  display: flex;
  align-items: center;
  gap: ${getSpacing('xs')};
  ${themedMixin}
`;

// HelpText otimizado
export const OptimizedHelpText = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  ${props => sizeMixin(props.$size || 'sm')}
  color: ${props =>
    getColor('text.secondary', props.$theme?.colors?.textSecondary)};
  margin-top: ${getSpacing('sm')};
  line-height: 1.4;
  ${themedMixin}
`;

// FlexContainer otimizado
export const OptimizedFlexContainer = styled(BaseFlexContainer)`
  display: flex;
  gap: ${props => props.$gap || getSpacing('md')};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-direction: ${props => props.$direction || 'row'};
  flex-wrap: ${props => (props.$wrap ? 'wrap' : 'nowrap')};
  ${responsiveMixin}
`;

// CheckboxContainer otimizado
export const OptimizedCheckboxContainer = styled(BaseGridContainer)<{
  $maxHeight?: string;
}>`
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(160px, 1fr))'};
  gap: ${getSpacing('sm')};
  margin: ${getSpacing('md')} 0;
  max-height: ${props => props.$maxHeight || 'none'};
  overflow-y: ${props => (props.$maxHeight ? 'auto' : 'visible')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${getSpacing('md')};
  }
`;

// CheckboxItem otimizado
export const OptimizedCheckboxItem = styled.label<{
  $variant?: 'default' | 'card';
  $theme?: any;
}>`
  display: flex;
  align-items: ${props =>
    props.$variant === 'card' ? 'flex-start' : 'center'};
  gap: ${getSpacing('sm')};
  padding: ${props =>
    props.$variant === 'card' ? getSpacing('md') : getSpacing('sm')};
  ${props => borderRadiusMixin('md')}
  cursor: pointer;
  ${transitionMixin}
  font-size: ${getFontSize('sm')};

  ${props =>
    props.$variant === 'card' &&
    `
    border: 1px solid ${getColor('border.primary', props.$theme?.colors?.border)};
    background: ${getColor('surface.primary', props.$theme?.colors?.background)};
    
    &:hover {
      border-color: ${getColor('primary', props.$theme?.colors?.primary)};
    }
  `}

  &:hover {
    background: ${props => getColor('hover', props.$theme?.colors?.hover)};
  }

  input[type='checkbox'] {
    margin: 0;
    ${props => props.$variant === 'card' && 'margin-top: 0.1rem;'}
  }
`;

// CheckboxLabel otimizado
export const OptimizedCheckboxLabel = styled.span<{ $theme?: any }>`
  font-weight: ${tokens.fontWeight.medium};
  color: ${props => getColor('text.primary', props.$theme?.colors?.text)};
  line-height: 1.4;
  ${themedMixin}
`;

// CheckboxContent otimizado
export const OptimizedCheckboxContent = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: ${getSpacing('xs')};
  ${themedMixin}
`;

// RadioGroup otimizado
export const OptimizedRadioGroup = styled(BaseGridContainer)`
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(120px, 1fr))'};
  gap: ${getSpacing('sm')};
  margin: ${getSpacing('md')} 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${getSpacing('md')};
  }
`;

// PeriodGroup otimizado
export const OptimizedPeriodGroup = styled(BaseFlexContainer)`
  gap: ${getSpacing('sm')};
  align-items: center;
  margin: ${getSpacing('md')} 0;
  padding: ${getSpacing('md')};
  background: ${props =>
    getColor('surface.secondary', props.$theme?.colors?.surface)};
  ${props => borderRadiusMixin('md')}
  border: 1px solid ${props =>
    getColor('border.primary', props.$theme?.colors?.border)};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  ${themedMixin}
`;

// ValidationContainer otimizado
export const OptimizedValidationContainer = styled(BaseContainer)`
  margin-top: ${getSpacing('md')};
  padding: ${getSpacing('md')};
  background: ${props =>
    getColor('surface.secondary', props.$theme?.colors?.surface)};
  ${props => borderRadiusMixin('md')}
  border: 1px solid ${props =>
    getColor('border.primary', props.$theme?.colors?.border)};
  ${themedMixin}
`;

// SuccessMessage otimizado
export const OptimizedSuccessMessage = styled(BaseSuccessMessage)`
  color: ${props => getColor('success', props.$theme?.colors?.success)};
  background: ${props =>
    getColor('successLight', props.$theme?.colors?.successLight)};
  padding: ${getSpacing('md')};
  ${props => borderRadiusMixin('md')}
  border: 1px solid ${props =>
    getColor('success', props.$theme?.colors?.success)};
  font-weight: ${tokens.fontWeight.medium};
  margin-top: ${getSpacing('sm')};
  ${themedMixin}
`;

// StatusIndicator otimizado
export const OptimizedStatusIndicator = styled.span<{
  $status?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${getSpacing('sm')};
  padding: ${getSpacing('xs')} ${getSpacing('md')};
  border-radius: 9999px;
  font-size: ${getFontSize('sm')};
  font-weight: ${tokens.fontWeight.medium};
  ${props => statusColorMixin(props.$status || 'info', props.$theme)}
  ${themedMixin}
`;

// CertificateStatus otimizado
export const OptimizedCertificateStatus = styled.div<{
  $status?: 'valid' | 'invalid' | 'expired' | 'pending';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: ${getSpacing('sm')};
  padding: ${getSpacing('sm')} ${getSpacing('md')};
  border-radius: 0.5rem;
  font-size: ${getFontSize('sm')};
  font-weight: ${tokens.fontWeight.medium};
  ${props => {
    const statusMap = { valid: 'success', invalid: 'error', expired: 'warning', pending: 'info' };
    const mappedStatus = statusMap[props.$status || 'pending'] || 'info';
    return statusColorMixin(mappedStatus as any, props.$theme);
  }}
  ${themedMixin}
`;

// ButtonGroup otimizado
export const OptimizedButtonGroup = styled(BaseFlexContainer)`
  flex-direction: ${props => props.$direction || 'row'};
  gap: ${props => props.$gap || getSpacing('md')};
  align-items: ${props => props.$align || 'center'};
  justify-content: flex-end;
  margin-top: ${getSpacing('md')};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${getSpacing('sm')};

    button {
      width: 100%;
    }
  }
`;

// LoadingOverlay otimizado
export const OptimizedLoadingOverlay = styled.div<{ $isLoading: boolean }>`
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    display: ${props => (props.$isLoading ? 'flex' : 'none')};
    align-items: center;
    justify-content: center;
    z-index: ${tokens.zIndex.modal};
  }
`;

// ValidationButton otimizado
export const OptimizedValidationButton = styled(BaseButton)<{
  $disabled?: boolean;
}>`
  padding: ${getSpacing('sm')};
  background: ${props =>
    props.$disabled
      ? getColor('text.disabled', props.$theme?.colors?.disabled)
      : getColor('primary', props.$theme?.colors?.primary)};
  color: ${props => getColor('surface.primary', props.$theme?.colors?.white)};
  border: none;
  border-radius: 0.25rem;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: ${getFontSize('sm')};
  white-space: nowrap;
  ${transitionMixin}

  &:hover {
    background: ${props =>
      props.$disabled
        ? getColor('text.disabled', props.$theme?.colors?.disabled)
        : getColor('primaryDark', props.$theme?.colors?.primaryDark)};
  }
`;

// InfoMessage otimizado
export const OptimizedInfoMessage = styled.div<{
  $variant?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  margin-top: ${getSpacing('md')};
  padding: ${getSpacing('md')};
  ${props => borderRadiusMixin('md')}
  font-size: ${getFontSize('sm')};
  font-weight: ${tokens.fontWeight.medium};
  ${props => statusColorMixin(props.$variant || 'info', props.$theme)}
  ${themedMixin}
`;

// ResponsiveContainer otimizado
export const OptimizedResponsiveContainer = styled(BaseFlexContainer)`
  gap: ${props => props.$gap || getSpacing('md')};
  flex-direction: ${props => props.$direction || 'row'};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: ${getSpacing('sm')};

    button {
      width: 100%;
    }
  }
`;
