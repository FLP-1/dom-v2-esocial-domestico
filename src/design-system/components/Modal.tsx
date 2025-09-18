import React, { ReactNode, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { componentShadows, createThemedStyles } from '../index';
import { designConstants } from '../tokens/constants';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const ModalOverlay = styled.div<{ $isOpen: boolean; $theme: any }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: ${designConstants.zIndex.modal};
  backdrop-filter: blur(8px);
  animation: ${fadeIn} 0.3s ease-out;
  padding: 1rem;

  @media (max-width: 768px) {
    padding: 0.5rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
`;

const ModalContent = styled.div<{
  $maxWidth?: string;
  $width?: string;
  $height?: string;
  $theme: any;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      background: ${themedStyles.background};
      border-radius: ${designConstants.borderRadius['2xl']};
      max-width: ${props.$maxWidth || '600px'};
      width: ${props.$width || '100%'};
      height: ${props.$height || 'auto'};
      max-height: 90vh;
      box-shadow: ${componentShadows.modal};
      animation: ${slideIn} 0.3s ease-out;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;

      @media (max-width: 768px) {
        max-width: 100%;
        max-height: 95vh;
        border-radius: ${designConstants.borderRadius.xl};
      }
    `;
  }}
`;

const ModalHeader = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem 2rem;
      background: linear-gradient(135deg, ${themedStyles.primary}, ${themedStyles.secondary});
      color: white;
      border-radius: ${designConstants.borderRadius['2xl']} ${designConstants.borderRadius['2xl']} 0 0;

      @media (max-width: 768px) {
        padding: 1rem 1.5rem;
        border-radius: ${designConstants.borderRadius.xl} ${designConstants.borderRadius.xl} 0 0;
      }
    `;
  }}
`;

const ModalTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: ${designConstants.borderRadius.lg};
  transition: ${designConstants.transition.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }
`;

export const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  flex: 1;
  overflow-y: auto;

  /* Scrollbar customizada */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 1.5rem 2rem;
  background: ${props => props.theme?.colors?.surface || '#F8F9FA'};
  border-top: 1px solid ${props => props.theme?.colors?.border || '#E9ECEF'};

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
    gap: 0.75rem;

    button {
      width: 100%;
    }
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  width?: string;
  height?: string;
  footer?: ReactNode;
  theme?: any;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
  width,
  height,
  footer,
  theme,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
}) => {
  // Fechar com ESC
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevenir scroll do body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, closeOnEscape]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay $isOpen={isOpen} $theme={theme} onClick={handleOverlayClick}>
      <ModalContent
        $maxWidth={maxWidth}
        $width={width}
        $height={height}
        $theme={theme}
        onClick={e => e.stopPropagation()}
      >
        <ModalHeader $theme={theme}>
          <ModalTitle>{title}</ModalTitle>
          {showCloseButton && (
            <CloseButton
              $theme={theme}
              onClick={onClose}
              aria-label='Fechar modal'
            >
              ✕
            </CloseButton>
          )}
        </ModalHeader>

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter theme={theme}>{footer}</ModalFooter>}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal;
