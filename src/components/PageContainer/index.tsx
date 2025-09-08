// src/components/PageContainer/index.tsx
import styled from 'styled-components';

interface PageContainerProps {
  theme: any;
  children: React.ReactNode;
  className?: string;
}

const Container = styled.div<{ $theme: any }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${props => props.$theme.colors.surface} 0%,
    ${props => props.$theme.colors.border} 100%
  );
  display: flex;
  font-family: 'Roboto', sans-serif;
`;

const MainContent = styled.main<{ $sidebarCollapsed: boolean }>`
  flex: 1;
  margin-left: ${props => (props.$sidebarCollapsed ? '100px' : '280px')};
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding: 0;
  min-height: 100vh;
  position: relative;
  z-index: 1;
`;

const ContentWrapper = styled.div`
  padding: 2rem;
  max-width: 100%;
  box-sizing: border-box;
`;

interface PageContainerPropsWithSidebar extends PageContainerProps {
  sidebarCollapsed: boolean;
}

export default function PageContainer({
  theme,
  children,
  className,
  sidebarCollapsed = false,
}: PageContainerPropsWithSidebar) {
  return (
    <Container $theme={theme} className={className}>
      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <ContentWrapper>{children}</ContentWrapper>
      </MainContent>
    </Container>
  );
}
