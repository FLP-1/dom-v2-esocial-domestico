// src/components/Button/index.tsx
import styled from 'styled-components';

export const Button = styled.button`
  background: ${p => p.theme.colors.primary};
  color: #fff;
  border: none;
  border-radius: ${p => p.theme.borderRadius};
  padding: 0.75rem 1.5rem;
  font-family: ${p => p.theme.fonts.heading};
  cursor: pointer;
  &:hover {
    opacity: 0.9;
  }
`;
