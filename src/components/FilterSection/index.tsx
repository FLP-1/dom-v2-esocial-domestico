// src/components/FilterSection/index.tsx
import styled from 'styled-components';

interface FilterSectionProps {
  theme: any;
  title: string;
  children: React.ReactNode;
}

const FilterContainer = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;

const FilterTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

export default function FilterSection({
  theme,
  title,
  children,
}: FilterSectionProps) {
  return (
    <FilterContainer $theme={theme}>
      <FilterTitle>{title}</FilterTitle>
      <FilterRow>{children}</FilterRow>
    </FilterContainer>
  );
}
