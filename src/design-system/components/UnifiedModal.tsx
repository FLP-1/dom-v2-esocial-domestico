import React, { ReactNode, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { componentShadows, createThemedStyles } from '../index';
import { designConstants } from '../tokens/constants';
import { mediaQueries } from '../utils/responsive';

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

const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const ModalOverlay = styled.div<{
  $isOpen: boolean;
  $theme: any;
  $variant: ModalVariant;
}>`
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

  /* Variante drawer para mobile */
  ${props => props.$variant === 'drawer' && mediaQueries.mobile} {
    align-items: flex-end;
    padding: 0;
  }

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
  $variant: ModalVariant;
  $size: ModalSize;
}>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);
    const sizeConfig = getSizeConfig(props.$size);

    return `
      background: ${themedStyles.background};
      border-radius: ${designConstants.borderRadius['2xl']};
      max-width: ${props.$maxWidth || sizeConfig.maxWidth};
      width: ${props.$width || sizeConfig.width};
      height: ${props.$height || sizeConfig.height};
      max-height: 90vh;
      box-shadow: ${componentShadows.modal};
      animation: ${getAnimation(props.$variant)} 0.3s ease-out;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: relative;

      /* Variante drawer para mobile */
      ${props.$variant === 'drawer' && mediaQueries.mobile} {
        width: 100% !important;
        height: 80vh !important;
        max-height: 80vh !important;
        border-radius: ${designConstants.borderRadius['2xl']} ${designConstants.borderRadius['2xl']} 0 0;
        animation: ${slideInFromRight} 0.3s ease-out;
      }

      @media (max-width: 768px) {
        max-width: 100%;
        max-height: 95vh;
        border-radius: ${designConstants.borderRadius.xl};
      }
    `;
  }}
`;

const ModalHeader = styled.div<{ $theme: any; $variant: ModalVariant }>`
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
      flex-shrink: 0;

      /* Variante drawer para mobile */
      ${props.$variant === 'drawer' && mediaQueries.mobile} {
        border-radius: ${designConstants.borderRadius['2xl']} ${designConstants.borderRadius['2xl']} 0 0;
      }

      @media (max-width: 768px) {
        padding: 1rem 1.5rem;
        border-radius: ${designConstants.borderRadius.xl} ${designConstants.borderRadius.xl} 0 0;
      }
    `;
  }}
`;

const ModalTitle = styled.h2<{ $variant: ModalVariant }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;

  /* Variante drawer para mobile */
  ${props => props.$variant === 'drawer' && mediaQueries.mobile} {
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    font-size: 1.25rem;
    gap: 0.5rem;
  }
`;

const CloseButton = styled.button<{ $theme: any; $variant: ModalVariant }>`
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

  /* Variante drawer para mobile */
  ${props => props.$variant === 'drawer' && mediaQueries.mobile} {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 1.25rem;
  }
`;

export const ModalBody = styled.div<{ $variant: ModalVariant }>`
  padding: 1.5rem 2rem;
  flex: 1;
  overflow-y: auto;

  /* Variante drawer para mobile */
  ${props => props.$variant === 'drawer' && mediaQueries.mobile} {
    padding: 1rem 1.5rem;
  }

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

export const ModalFooter = styled.div<{ $variant: ModalVariant }>`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1rem 2rem 1.5rem 2rem;
  background: ${props => props.theme?.colors?.surface || '#F8F9FA'};
  border-top: 1px solid ${props => props.theme?.colors?.border || '#E9ECEF'};
  flex-shrink: 0;

  /* Variante drawer para mobile */
  ${props => props.$variant === 'drawer' && mediaQueries.mobile} {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
    gap: 0.75rem;

    button {
      width: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 1.5rem;
    flex-direction: column-reverse;
    gap: 0.75rem;

    button {
      width: 100%;
    }
  }
`;

// Tipos
export type ModalVariant = 'default' | 'drawer' | 'fullscreen';
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface UnifiedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  maxWidth?: string;
  width?: string;
  height?: string;
  footer?: ReactNode;
  theme?: any;
  variant?: ModalVariant;
  size?: ModalSize;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
  'data-testid'?: string;
}

// Configurações de tamanho
const getSizeConfig = (size: ModalSize) => {
  const configs = {
    sm: { maxWidth: '400px', width: '90%', height: 'auto' },
    md: { maxWidth: '600px', width: '90%', height: 'auto' },
    lg: { maxWidth: '800px', width: '90%', height: 'auto' },
    xl: { maxWidth: '1000px', width: '90%', height: 'auto' },
    full: { maxWidth: '100%', width: '100%', height: '100vh' },
  };
  return configs[size];
};

// Animação baseada na variante
const getAnimation = (variant: ModalVariant) => {
  switch (variant) {
    case 'drawer':
      return slideInFromRight;
    case 'fullscreen':
      return fadeIn;
    default:
      return slideIn;
  }
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth,
  width,
  height,
  footer,
  theme,
  variant = 'default',
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className,
  'data-testid': testId,
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
    <ModalOverlay
      $isOpen={isOpen}
      $theme={theme}
      $variant={variant}
      onClick={handleOverlayClick}
      className={className}
      data-testid={testId}
    >
      <ModalContent
        $maxWidth={maxWidth}
        $width={width}
        $height={height}
        $theme={theme}
        $variant={variant}
        $size={size}
        onClick={e => e.stopPropagation()}
        role='dialog'
        aria-modal='true'
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {(title || showCloseButton) && (
          <ModalHeader $theme={theme} $variant={variant}>
            {title && (
              <ModalTitle $variant={variant} id='modal-title'>
                {title}
              </ModalTitle>
            )}
            {showCloseButton && (
              <CloseButton
                $theme={theme}
                $variant={variant}
                onClick={onClose}
                aria-label='Fechar modal'
                type='button'
              >
                ✕
              </CloseButton>
            )}
          </ModalHeader>
        )}

        <ModalBody $variant={variant}>{children}</ModalBody>

        {footer && (
          <ModalFooter $variant={variant} theme={theme}>
            {footer}
          </ModalFooter>
        )}
      </ModalContent>
    </ModalOverlay>
  );
};

export default UnifiedModal;
