import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

const StyledComponent1 = styled.div`
  cursor: onClick ? pointer : default
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const CardContainer = styled.div<{ $theme?: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px
    ${props => props.$theme?.colors.shadow || 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid
    ${props => props.$theme?.colors.primary + '20' || 'rgba(41, 171, 226, 0.1)'};
  animation: ${fadeIn} 0.6s ease-out;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px
      ${props => props.$theme?.colors.shadow || 'rgba(0, 0, 0, 0.15)'};
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const CardIcon = styled.span<{ $theme?: any }>`
  font-size: 1.5rem;
  color: ${props => props.$theme?.colors.primary || '#29abe2'};
`;

const CardTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
`;

const CardContent = styled.div`
  color: #5a6c7d;
  line-height: 1.6;
`;

const CardLocation = styled.p<{ $theme?: any }>`
  font-weight: 500;
  color: ${props => props.$theme?.colors.primary || '#29abe2'};
  margin: 0.5rem 0;
`;

const CardWifi = styled.p`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin: 0;
`;

export interface InfoCardProps {
  icon: string;
  title: string;
  children: ReactNode;
  theme?: any;
  location?: string;
  wifi?: string;
  onClick?: () => void;
}

export const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  children,
  theme,
  location,
  wifi,
  onClick,
}) => {
  return (
    <CardContainer $theme={theme} onClick={onClick} as={StyledComponent1}>
      <CardHeader>
        <CardIcon $theme={theme}>{icon}</CardIcon>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        {children}
        {location && <CardLocation $theme={theme}>{location}</CardLocation>}
        {wifi && <CardWifi>WiFi: {wifi}</CardWifi>}
      </CardContent>
    </CardContainer>
  );
};

export default InfoCard;
