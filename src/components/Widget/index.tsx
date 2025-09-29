import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const WidgetContainer = styled.div<{
  $type: 'primary' | 'secondary' | 'success' | 'warning';
  $theme: any;
  $clickable?: boolean;
}>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${fadeIn} 0.6s ease-out;
  cursor: ${props => (props.$clickable ? 'pointer' : 'default')};

  &:hover {
    transform: ${props => (props.$clickable ? 'translateY(-4px)' : 'none')};
    box-shadow: ${props =>
      props.$clickable
        ? '0 8px 24px rgba(0, 0, 0, 0.15)'
        : '0 4px 16px ' + props.$theme.colors.shadow};
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .icon {
    font-size: 1.5rem;
    color: ${props => {
      switch (props.$type) {
        case 'primary':
          return props.$theme.colors.primary;
        case 'secondary':
          return props.$theme.colors.textSecondary;
        case 'success':
          return props.$theme.colors.secondary;
        case 'warning':
          return props.$theme.colors.accent;
        default:
          return props.$theme.colors.primary;
      }
    }};
  }

  .content {
    color: #5a6c7d;
    line-height: 1.6;
  }

  .metric {
    font-size: 2rem;
    font-weight: 700;
    color: ${props => {
      switch (props.$type) {
        case 'primary':
          return props.$theme.colors.primary;
        case 'secondary':
          return props.$theme.colors.textSecondary;
        case 'success':
          return props.$theme.colors.secondary;
        case 'warning':
          return props.$theme.colors.accent;
        default:
          return props.$theme.colors.primary;
      }
    }};
    margin: 0.5rem 0;
  }

  .description {
    font-size: 0.9rem;
    color: #7f8c8d;
    margin: 0;
  }
`;

export interface WidgetProps {
  id: string;
  title: string;
  icon: string;
  type: 'primary' | 'secondary' | 'success' | 'warning';
  theme: any;
  metric?: string | number;
  description?: string;
  content?: React.ReactNode;
  clickable?: boolean;
  onClick?: () => void;
}

export const Widget: React.FC<WidgetProps> = ({
  title,
  icon,
  type,
  theme,
  metric,
  description,
  content,
  clickable = true,
  onClick,
}) => {
  return (
    <WidgetContainer
      $type={type}
      $theme={theme}
      $clickable={clickable}
      onClick={onClick}
    >
      <div className='header'>
        <h3 className='title'>{title}</h3>
        <span className='icon'>{icon}</span>
      </div>

      {metric && <div className='metric'>{metric}</div>}

      {description && <p className='description'>{description}</p>}

      {content && <div className='content'>{content}</div>}
    </WidgetContainer>
  );
};

export default Widget;
