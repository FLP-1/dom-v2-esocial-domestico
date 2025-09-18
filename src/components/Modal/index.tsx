import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';

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

const ModalOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div<{
  $maxWidth?: string;
  $width?: string;
  $height?: string;
}>`
  background: white;
  border-radius: 16px;
  max-width: ${props => props.$maxWidth || '600px'};
  width: ${props => props.$width || '90%'};
  height: ${props => props.$height || 'auto'};
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${slideIn} 0.3s ease-out;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    margin: 0.5rem;
    max-width: 95%;
    border-radius: 12px;
    max-height: 95vh;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #29abe2 0%, #1e8bc3 100%);
  color: white;
  border-radius: 16px 16px 0 0;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const ModalTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const CloseButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  cursor: pointer;
  font-size: 1.25rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalButtonContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: string;
  width?: string;
  showCloseButton?: boolean;
  buttonContainer?: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
  width,
  showCloseButton = true,
  buttonContainer,
}) => {
  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent
        {...(maxWidth && { $maxWidth: maxWidth })}
        {...(width && { $width: width })}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && <CloseButton onClick={onClose}>✕</CloseButton>}
          </ModalHeader>
        )}

        {children}

        {buttonContainer && (
          <ModalButtonContainer>{buttonContainer}</ModalButtonContainer>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

// Export sub-components for external use
export const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  flex: 1;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

// Re-export existing components
export { ModalContent, ModalHeader };

export default Modal;
