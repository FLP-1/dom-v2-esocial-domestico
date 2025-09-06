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

const ModalContent = styled.div<{ $maxWidth?: string; $width?: string }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: ${props => props.$maxWidth || '500px'};
  width: ${props => props.$width || '90%'};
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(41, 171, 226, 0.2);
  animation: ${slideIn} 0.3s ease-out;
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #7f8c8d;
  cursor: pointer;
  font-size: 1.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(231, 76, 60, 0.1);
    color: #e74c3c;
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
  margin-bottom: 1.5rem;
`;

export const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
`;

// Re-export existing components
export { ModalContent, ModalHeader };

export default Modal;
