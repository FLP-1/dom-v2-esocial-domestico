// src/components/TopBar/index.tsx
import styled from 'styled-components';

interface TopBarProps {
  theme: any;
  children: React.ReactNode;
}

const TopBarContainer = styled.header<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1rem 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;

export default function TopBar({ theme, children }: TopBarProps) {
  return <TopBarContainer $theme={theme}>{children}</TopBarContainer>;
}
