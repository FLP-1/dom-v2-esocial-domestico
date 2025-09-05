// src/components/FormComponents/index.tsx
import styled from 'styled-components';

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

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px
      ${props => props.$theme?.colors?.primary || '#29ABE2'}20;
  }
`;

// Select
export const Select = styled.select<{ $theme: any }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$theme?.colors?.border || '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px
      ${props => props.$theme?.colors?.primary || '#29ABE2'}20;
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
