import React, { ReactNode } from 'react';
import styled, { keyframes } from 'styled-components';
import { mediaQueries } from '../design-system/utils/responsive';

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
  padding: 1rem;

  /* Mobile: Fullscreen overlay */
  ${mediaQueries.mobile} {
    padding: 0;
    align-items: flex-start;
  }

  /* Touch devices: Better touch targets */
  ${mediaQueries.touchDevice} {
    -webkit-overflow-scrolling: touch;
  }
`;

const ModalContainer = styled.div<{
  $maxWidth?: string;
  $width?: string;
}>`
  background: white;
  border-radius: 16px;
  max-width: ${props => props.$maxWidth || '600px'};
  width: ${props => props.$width || '90%'};
  max-height: 90vh;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  animation: ${fadeIn} 0.3s ease-out;
  margin: 1rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;

  /* Mobile: Fullscreen modal */
  ${mediaQueries.mobile} {
    width: 100% !important;
    height: 100% !important;
    max-width: 100% !important;
    max-height: 100% !important;
    margin: 0 !important;
    border-radius: 0 !important;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  /* Tablet: Optimized size */
  ${mediaQueries.tablet} {
    max-width: 85%;
    max-height: 85vh;
    margin: 2rem auto;
    border-radius: 12px;
  }

  /* Desktop: Standard modal */
  ${mediaQueries.desktop} {
    margin: 2rem auto;
  }

  /* Touch devices: Larger touch targets */
  ${mediaQueries.touchDevice} {
    button {
      min-height: 44px;
      min-width: 44px;
    }
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
  flex-shrink: 0;

  /* Mobile: Adjusted padding and no border radius */
  ${mediaQueries.mobile} {
    padding: 1rem 1.5rem;
    border-radius: 0;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  /* Tablet: Medium padding */
  ${mediaQueries.tablet} {
    padding: 1.25rem 1.75rem;
    border-radius: 12px 12px 0 0;
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

const ModalBody = styled.div`
  padding: 1.5rem 2rem;
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  /* Custom scrollbar */
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

  /* Mobile: Adjusted padding and safe areas */
  ${mediaQueries.mobile} {
    padding: 1rem 1.5rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
  }

  /* Tablet: Medium padding */
  ${mediaQueries.tablet} {
    padding: 1.25rem 1.75rem;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 1.5rem 2rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  flex-shrink: 0;

  /* Mobile: Stack buttons vertically */
  ${mediaQueries.mobile} {
    padding: 1rem 1.5rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    flex-direction: column-reverse;
    gap: 0.75rem;
    position: sticky;
    bottom: 0;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;

    button {
      width: 100%;
      min-height: 48px;
      font-size: 1rem;
    }
  }

  /* Tablet: Horizontal with adjusted spacing */
  ${mediaQueries.tablet} {
    padding: 1.25rem 1.75rem;
    gap: 1.25rem;
  }

  /* Touch devices: Larger touch targets */
  ${mediaQueries.touchDevice} {
    button {
      min-height: 44px;
      padding: 0.75rem 1.5rem;
    }
  }
`;

export interface SimpleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  width?: string;
  showCloseButton?: boolean;
}

export const SimpleModal: React.FC<SimpleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth,
  width,
  showCloseButton = true,
}) => {
  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContainer
        $maxWidth={maxWidth}
        $width={width}
        onClick={e => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <ModalHeader>
            {title && <ModalTitle>{title}</ModalTitle>}
            {showCloseButton && <CloseButton onClick={onClose}>✕</CloseButton>}
          </ModalHeader>
        )}

        <ModalBody>{children}</ModalBody>

        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );
};

export default SimpleModal;
