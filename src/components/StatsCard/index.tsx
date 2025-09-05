// src/components/StatsCard/index.tsx
import styled from 'styled-components';

interface StatsCardProps {
  theme: any;
  title: string;
  value: string | number;
  color?: string;
  icon?: string;
  description?: string;
}

const StatsContainer = styled.div<{ $theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 12px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div<{ $color: string }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$color};
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const StatIcon = styled.div<{ $color: string }>`
  font-size: 2rem;
  color: ${props => props.$color};
  margin-bottom: 0.5rem;
`;

export default function StatsCard({
  theme,
  title,
  value,
  color = '#29ABE2',
  icon,
  description,
}: StatsCardProps) {
  return (
    <StatsContainer $theme={theme}>
      <StatItem>
        {icon && <StatIcon $color={color}>{icon}</StatIcon>}
        <StatNumber $color={color}>{value}</StatNumber>
        <StatLabel>{title}</StatLabel>
        {description && <StatLabel>{description}</StatLabel>}
      </StatItem>
    </StatsContainer>
  );
}
