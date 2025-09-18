// src/components/PageHeader/index.tsx
import styled from 'styled-components';

interface PageHeaderProps {
  theme: any;
  title: string;
  subtitle: string;
}

const PageTitle = styled.h1<{ $theme: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$theme.colors.primary};
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: #7f8c8d;
  margin: 0 0 2rem 0;
  font-weight: 500;
`;

export default function PageHeader({
  theme,
  title,
  subtitle,
}: PageHeaderProps) {
  return (
    <>
      <PageTitle $theme={theme}>{title}</PageTitle>
      <PageSubtitle>{subtitle}</PageSubtitle>
    </>
  );
}
