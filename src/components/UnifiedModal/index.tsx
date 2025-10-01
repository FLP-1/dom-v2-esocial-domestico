import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { createThemedStyles } from '../../design-system';

// Animações
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// Styled Components
const Overlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Container = styled.div<{
  $maxWidth?: string;
  $width?: string;
  $height?: string;
  $variant?: 'default' | 'fullscreen' | 'compact';
  $theme?: any;
}>`
  background: white;
  border-radius: ${props => {
    switch (props.$variant) {
      case 'fullscreen':
        return '0';
      case 'compact':
        return '8px';
      default:
        return '12px';
    }
  }};
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-height: 90vh;
  overflow: hidden;
  position: relative;
  width: ${props => {
    if (props.$width) return props.$width;
    if (props.$variant === 'fullscreen') return '100vw';
    if (props.$variant === 'compact') return '400px';
    return '90vw';
  }};
  max-width: ${props => {
    if (props.$maxWidth) return props.$maxWidth;
    if (props.$variant === 'fullscreen') return '100vw';
    if (props.$variant === 'compact') return '400px';
    return '600px';
  }};
  height: ${props => {
    if (props.$height) return props.$height;
    if (props.$variant === 'fullscreen') return '100vh';
    return 'auto';
  }};
  animation: ${fadeIn} 0.3s ease-out;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}

  @media (max-width: 768px) {
    width: 95vw;
    max-width: 95vw;
    margin: 1rem;
    max-height: 95vh;
  }
`;

const Header = styled.div<{ $theme?: any }>`
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

const Title = styled.h2<{ $theme?: any }>`
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

const CloseButton = styled.button<{ $theme?: any }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  color: #6b7280;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: #374151;
  }

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

const Body = styled.div<{ $theme?: any }>`
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}

  @media (max-width: 768px) {
    padding: 1rem;
    max-height: calc(95vh - 120px);
  }
`;

const Footer = styled.div<{ $theme?: any }>`
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}

  @media (max-width: 768px) {
    padding: 0 1rem 1rem 1rem;
    flex-direction: column;
    gap: 0.5rem;

    button {
      width: 100%;
    }
  }
`;

export interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  width?: string;
  height?: string;
  showCloseButton?: boolean;
  variant?: 'default' | 'fullscreen' | 'compact';
  $theme?: any;
  'aria-label'?: string;
}

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  width,
  height,
  showCloseButton = true,
  variant = 'default',
  $theme,
  'aria-label': ariaLabel,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Overlay
      $isOpen={isOpen}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role='dialog'
      aria-modal='true'
      aria-label={ariaLabel || title}
    >
      <Container
        $maxWidth={maxWidth}
        $width={width}
        $height={height}
        $variant={variant}
        $theme={$theme}
      >
        {title && (
          <Header $theme={$theme}>
            <Title $theme={$theme}>{title}</Title>
            {showCloseButton && (
              <CloseButton
                $theme={$theme}
                onClick={onClose}
                aria-label='Fechar modal'
              >
                ×
              </CloseButton>
            )}
          </Header>
        )}

        <Body $theme={$theme}>{children}</Body>

        {footer && <Footer $theme={$theme}>{footer}</Footer>}
      </Container>
    </Overlay>
  );
};

// Componentes auxiliares para compatibilidade
export const ModalBodyComponent = styled.div<{ $theme?: any }>`
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(90vh - 120px);

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const ModalHeaderComponent = styled.div<{ $theme?: any }>`
  padding: 1.5rem 1.5rem 0 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export const ModalFooterComponent = styled.div<{ $theme?: any }>`
  padding: 0 1.5rem 1.5rem 1.5rem;
  border-top: 1px solid #e5e7eb;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  align-items: center;

  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    return themedStyles;
  }}
`;

export default UnifiedModal;
