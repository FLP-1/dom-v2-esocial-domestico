// src/components/FormComponents/index.tsx
import styled from 'styled-components';
import { mediaQueries } from '../../design-system/utils/responsive';

// FormGroup
interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup = styled.div<FormGroupProps>`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;

  /* Mobile: Full width and larger gaps */
  ${mediaQueries.mobile} {
    min-width: auto;
    width: 100%;
    gap: 0.75rem;
  }

  /* Touch devices: Larger touch targets */
  ${mediaQueries.touchDevice} {
    input,
    select,
    textarea {
      min-height: 44px;
      font-size: 16px; /* Prevent zoom on iOS */
    }
  }
`;

// Label
interface LabelProps {
  children: React.ReactNode;
  htmlFor?: string;
}

export const Label = styled.label<LabelProps>`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
`;

// Input
export const Input = styled.input<{ $theme: any; $hasError?: boolean }>`
  padding: 0.75rem;
  border: 2px solid
    ${props =>
      props.$hasError ? '#e74c3c' : props.$theme?.colors?.border || '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px
      ${props => props.$theme?.colors?.primary || '#29ABE2'}20;
  }

  /* Mobile: Larger touch targets and prevent zoom */
  ${mediaQueries.mobile} {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem;
  }

  /* Touch devices: Better interaction */
  ${mediaQueries.touchDevice} {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

// Select
interface SelectProps {
  $theme: any;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  title?: string;
  id?: string;
}

export const Select = styled.select<SelectProps>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$theme?.colors?.border || '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px
      ${props => props.$theme?.colors?.primary || '#29ABE2'}20;
  }

  /* Mobile: Larger touch targets */
  ${mediaQueries.mobile} {
    min-height: 44px;
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem;
  }

  /* Touch devices: Better interaction */
  ${mediaQueries.touchDevice} {
    -webkit-appearance: none;
    -webkit-tap-highlight-color: transparent;
  }
`;

// Form
interface FormProps {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  className?: string;
}

export const Form = styled.form<FormProps>`
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
`;

// ErrorMessage
interface ErrorMessageProps {
  children: React.ReactNode;
}

export const ErrorMessage = styled.div<ErrorMessageProps>`
  color: #e74c3c;
  font-size: 0.7rem;
  margin-top: 0.25rem;
  font-family: 'Roboto', sans-serif;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '⚠️';
    font-size: 0.6rem;
  }
`;
