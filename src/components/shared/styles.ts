import styled from 'styled-components';
import { createThemedStyles } from '../../design-system';

// Common form styles
export const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

export const FormSection = styled.div<{ $theme?: any }>`
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.$theme?.colors?.surface || '#f8f9fa'};
  border-radius: 8px;
  border: 1px solid ${props => props.$theme?.colors?.border || '#e5e7eb'};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SectionTitle = styled.h3<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.9rem';
      case 'lg':
        return '1.25rem';
      default:
        return '1.1rem';
    }
  }};
  font-weight: 600;
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${props => props.$theme?.colors?.border || '#e5e7eb'};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const Label = styled.label<{ $theme?: any; $size?: 'sm' | 'md' | 'lg' }>`
  font-weight: 600;
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  margin-bottom: 0.5rem;
  display: block;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const InputStyled = styled.input<{
  $hasError?: boolean;
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.5rem 0.75rem';
      case 'lg':
        return '0.875rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  border: 1px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.error || '#dc3545'
        : props.$theme?.colors?.border || '#d1d5db'};
  border-radius: 6px;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  transition: all 0.2s ease;
  background: ${props => props.$theme?.colors?.background || '#ffffff'};
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29abe2'};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$theme?.colors?.primaryLight || 'rgba(41, 171, 226, 0.1)'};
  }

  &:disabled {
    background: ${props => props.$theme?.colors?.disabled || '#f8f9fa'};
    color: ${props => props.$theme?.colors?.textDisabled || '#6c757d'};
    cursor: not-allowed;
  }

  &::placeholder {
    color: ${props => props.$theme?.colors?.placeholder || '#9ca3af'};
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SelectStyled = styled.select<{
  $hasError?: boolean;
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
  'aria-label'?: string;
  title?: string;
}>`
  width: 100%;
  padding: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.5rem 0.75rem';
      case 'lg':
        return '0.875rem 1.25rem';
      default:
        return '0.75rem 1rem';
    }
  }};
  border: 1px solid
    ${props =>
      props.$hasError
        ? props.$theme?.colors?.error || '#dc3545'
        : props.$theme?.colors?.border || '#d1d5db'};
  border-radius: 6px;
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.75rem';
      case 'lg':
        return '1rem';
      default:
        return '0.85rem';
    }
  }};
  background: ${props => props.$theme?.colors?.background || '#ffffff'};
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29abe2'};
    box-shadow: 0 0 0 3px
      ${props =>
        props.$theme?.colors?.primaryLight || 'rgba(41, 171, 226, 0.1)'};
  }

  &:disabled {
    background: ${props => props.$theme?.colors?.disabled || '#f8f9fa'};
    color: ${props => props.$theme?.colors?.textDisabled || '#6c757d'};
    cursor: not-allowed;
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const ErrorMessage = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  color: ${props => props.$theme?.colors?.error || '#dc3545'};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.8rem';
    }
  }};
  font-weight: 500;
  margin-top: 0.25rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const HelpText = styled.div<{
  $theme?: any;
  $size?: 'sm' | 'md' | 'lg';
}>`
  color: ${props => props.$theme?.colors?.textSecondary || '#6c757d'};
  font-size: ${props => {
    switch (props.$size) {
      case 'sm':
        return '0.7rem';
      case 'lg':
        return '0.9rem';
      default:
        return '0.8rem';
    }
  }};
  margin-top: 0.25rem;
  line-height: 1.4;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Common layout components
export const FlexContainer = styled.div<{
  $gap?: string;
  $align?: string;
  $justify?: string;
  $direction?: 'row' | 'column';
  $wrap?: boolean;
}>`
  display: flex;
  gap: ${props => props.$gap || '0.5rem'};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};
  flex-direction: ${props => props.$direction || 'row'};
  flex-wrap: ${props => (props.$wrap ? 'wrap' : 'nowrap')};

  @media (max-width: 768px) {
    flex-direction: ${props =>
      props.$direction === 'column' ? 'column' : 'column'};
    gap: 0.75rem;
  }
`;

// Common interactive elements
export const CheckboxContainer = styled.div<{
  $columns?: string;
  $maxHeight?: string;
}>`
  display: grid;
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(160px, 1fr))'};
  gap: 0.5rem;
  margin: 0.75rem 0;
  max-height: ${props => props.$maxHeight || 'none'};
  overflow-y: ${props => (props.$maxHeight ? 'auto' : 'visible')};

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const CheckboxItem = styled.label<{ $variant?: 'default' | 'card' }>`
  display: flex;
  align-items: ${props =>
    props.$variant === 'card' ? 'flex-start' : 'center'};
  gap: 0.4rem;
  padding: ${props => (props.$variant === 'card' ? '0.75rem' : '0.4rem')};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  ${props =>
    props.$variant === 'card'
      ? `
    border: 1px solid rgba(41, 171, 226, 0.2);
    background: rgba(255, 255, 255, 0.8);
    &:hover {
      border-color: #29abe2;
    }
  `
      : ''}

  &:hover {
    background: ${props =>
      props.$variant === 'card'
        ? 'rgba(41, 171, 226, 0.1)'
        : 'rgba(41, 171, 226, 0.1)'};
  }

  input[type='checkbox'] {
    margin: 0;
    ${props => (props.$variant === 'card' ? 'margin-top: 0.1rem;' : '')}
  }
`;

export const CheckboxLabel = styled.span<{ $theme?: any }>`
  font-weight: 500;
  color: ${props => props.$theme?.colors?.text || '#2c3e50'};
  line-height: 1.4;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const CheckboxContent = styled.div<{ $theme?: any }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Radio and period groups
export const RadioGroup = styled.div<{ $columns?: string }>`
  display: grid;
  grid-template-columns: ${props =>
    props.$columns || 'repeat(auto-fit, minmax(120px, 1fr))'};
  gap: 0.5rem;
  margin: 0.75rem 0;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

export const PeriodGroup = styled.div<{ $theme?: any }>`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0.75rem 0;
  padding: 1rem;
  background: ${props => props.$theme?.colors?.surface || '#f8f9fa'};
  border-radius: 8px;
  border: 1px solid ${props => props.$theme?.colors?.border || '#e5e7eb'};

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Validation and status components
export const ValidationContainer = styled.div<{ $theme?: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.$theme?.colors?.surface || '#f8f9fa'};
  border-radius: 8px;
  border: 1px solid ${props => props.$theme?.colors?.border || '#e5e7eb'};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const SuccessMessage = styled.div<{ $theme?: any }>`
  color: ${props => props.$theme?.colors?.success || '#28a745'};
  background: ${props => props.$theme?.colors?.successLight || '#d4edda'};
  padding: 0.75rem;
  border-radius: 6px;
  border: 1px solid ${props => props.$theme?.colors?.success || '#28a745'};
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.5rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const StatusIndicator = styled.div<{
  $status?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  background: ${props => {
    const statusColors = {
      success: '#d4edda',
      warning: '#fff3cd',
      error: '#f8d7da',
      info: '#d1ecf1',
    };
    return (
      statusColors[props.$status as keyof typeof statusColors] || '#e9ecef'
    );
  }};
  color: ${props => {
    const statusColors = {
      success: '#155724',
      warning: '#856404',
      error: '#721c24',
      info: '#0c5460',
    };
    return (
      statusColors[props.$status as keyof typeof statusColors] || '#495057'
    );
  }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const CertificateStatus = styled.div<{
  $status?: 'valid' | 'invalid' | 'expired' | 'pending';
  $theme?: any;
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  background: ${props => {
    const statusColors = {
      valid: '#d4edda',
      invalid: '#f8d7da',
      expired: '#fff3cd',
      pending: '#d1ecf1',
    };
    return (
      statusColors[props.$status as keyof typeof statusColors] || '#e9ecef'
    );
  }};
  color: ${props => {
    const statusColors = {
      valid: '#155724',
      invalid: '#721c24',
      expired: '#856404',
      pending: '#0c5460',
    };
    return (
      statusColors[props.$status as keyof typeof statusColors] || '#495057'
    );
  }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Button groups and actions
export const ButtonGroup = styled.div<{
  $direction?: 'row' | 'column';
  $gap?: string;
  $align?: string;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  gap: ${props => props.$gap || '0.75rem'};
  align-items: ${props => props.$align || 'center'};
  justify-content: flex-end;
  margin-top: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
`;

export const LoadingOverlay = styled.div<{ $isLoading: boolean }>`
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
    z-index: 10;
  }
`;

// Validation and form utilities
export const ValidationButton = styled.button<{ $disabled?: boolean }>`
  padding: 0.5rem;
  background: ${props => (props.$disabled ? '#ccc' : '#29abe2')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  white-space: nowrap;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => (props.$disabled ? '#ccc' : '#1e8bc3')};
  }
`;

export const InfoMessage = styled.div<{
  $variant?: 'success' | 'warning' | 'error' | 'info';
  $theme?: any;
}>`
  margin-top: 1rem;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  background: ${props => {
    const variantColors = {
      success: '#d4edda',
      warning: '#fff3cd',
      error: '#f8d7da',
      info: '#d1ecf1',
    };
    return (
      variantColors[props.$variant as keyof typeof variantColors] ||
      props.$theme?.colors?.surface ||
      '#f8f9fa'
    );
  }};
  color: ${props => {
    const variantColors = {
      success: '#155724',
      warning: '#856404',
      error: '#721c24',
      info: '#0c5460',
    };
    return (
      variantColors[props.$variant as keyof typeof variantColors] ||
      props.$theme?.colors?.text ||
      '#2c3e50'
    );
  }};
  border: 1px solid
    ${props => {
      const variantColors = {
        success: '#c3e6cb',
        warning: '#ffeaa7',
        error: '#f5c6cb',
        info: '#bee5eb',
      };
      return (
        variantColors[props.$variant as keyof typeof variantColors] ||
        props.$theme?.colors?.border ||
        '#e5e7eb'
      );
    }};

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

// Responsive utilities
export const ResponsiveContainer = styled.div<{
  $direction?: 'row' | 'column';
  $gap?: string;
  $align?: string;
  $justify?: string;
}>`
  display: flex;
  gap: ${props => props.$gap || '0.75rem'};
  flex-direction: ${props => props.$direction || 'row'};
  align-items: ${props => props.$align || 'center'};
  justify-content: ${props => props.$justify || 'flex-start'};

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
`;
