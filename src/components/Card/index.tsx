// src/components/Card/index.tsx
import styled from 'styled-components';

export const Card = styled.div`
  background: #fff;
  border-radius: ${p => p.theme.borderRadius};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
`;
