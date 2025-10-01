import React from 'react';
import styled, { keyframes } from 'styled-components';
import { createThemedStyles, designConstants } from '../../design-system';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  $theme?: any;
}

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  $theme?: any;
  children: React.ReactNode;
}

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  $theme?: any;
}

// Animações
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const dots = keyframes`
  0%, 20% { opacity: 0; }
  50% { opacity: 1; }
  100% { opacity: 0; }
`;

// Spinner básico
const SpinnerContainer = styled.div<{ $size: string; $color: string }>`
  ${props => {
    const getSizeStyles = () => {
      switch (props.$size) {
        case 'xs':
          return { size: '12px', border: '2px' };
        case 'sm':
          return { size: '16px', border: '2px' };
        case 'md':
          return { size: '24px', border: '3px' };
        case 'lg':
          return { size: '32px', border: '4px' };
        case 'xl':
          return { size: '48px', border: '5px' };
        default:
          return { size: '24px', border: '3px' };
      }
    };

    const sizeStyles = getSizeStyles();

    return `
      width: ${sizeStyles.size};
      height: ${sizeStyles.size};
      border: ${sizeStyles.border} solid rgba(255, 255, 255, 0.3);
      border-top: ${sizeStyles.border} solid ${props.$color};
      border-radius: 50%;
      animation: ${spin} 1s linear infinite;
      display: inline-block;
    `;
  }}
`;

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color,
  $theme,
}) => {
  const themedStyles = createThemedStyles($theme);
  const spinnerColor = color || themedStyles.primary;

  return <SpinnerContainer $size={size} $color={spinnerColor} />;
};

// Loading com overlay
const OverlayContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const LoadingOverlayStyled = styled.div<{ $isVisible: boolean; $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(4px);
      display: ${props.$isVisible ? 'flex' : 'none'};
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: ${designConstants.zIndex.overlay};
      border-radius: ${designConstants.borderRadius.lg};
    `;
  }}
`;

const LoadingMessage = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      margin-top: 1rem;
      font-size: 1rem;
      font-weight: 500;
      color: ${themedStyles.text};
      text-align: center;
    `;
  }}
`;

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = 'Carregando...',
  $theme,
  children,
}) => {
  return (
    <OverlayContainer>
      {children}
      <LoadingOverlayStyled $isVisible={isLoading} $theme={$theme}>
        <LoadingSpinner size='lg' $theme={$theme} />
        <LoadingMessage $theme={$theme}>{message}</LoadingMessage>
      </LoadingOverlayStyled>
    </OverlayContainer>
  );
};

// Loading dots (para textos)
const DotsContainer = styled.span`
  display: inline-block;
  width: 1.5rem;
  text-align: left;
`;

const Dot = styled.span<{ $delay: number; $color: string }>`
  animation: ${dots} 1.4s infinite ease-in-out both;
  animation-delay: ${props => props.$delay}s;
  color: ${props => props.$color};
  font-size: 1.2em;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }
  &:nth-child(2) {
    animation-delay: -0.16s;
  }
  &:nth-child(3) {
    animation-delay: 0s;
  }
`;

export const LoadingDots: React.FC<{ color?: string; $theme?: any }> = ({
  color,
  $theme,
}) => {
  const themedStyles = createThemedStyles($theme);
  const dotColor = color || themedStyles.primary;

  return (
    <DotsContainer>
      <Dot $delay={0} $color={dotColor}>
        .
      </Dot>
      <Dot $delay={0.16} $color={dotColor}>
        .
      </Dot>
      <Dot $delay={0.32} $color={dotColor}>
        .
      </Dot>
    </DotsContainer>
  );
};

// Skeleton loading
const SkeletonBase = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      background: linear-gradient(
        90deg,
        ${themedStyles.surface} 25%,
        ${themedStyles.border} 50%,
        ${themedStyles.surface} 75%
      );
      background-size: 200% 100%;
      animation: ${pulse} 1.5s ease-in-out infinite;
      border-radius: ${designConstants.borderRadius.md};
    `;
  }}
`;

export const SkeletonText = styled(SkeletonBase)<{
  $width?: string;
  $height?: string;
}>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '1rem'};
  margin: 0.25rem 0;
`;

export const SkeletonCard = styled(SkeletonBase)<{
  $width?: string;
  $height?: string;
}>`
  width: ${props => props.$width || '100%'};
  height: ${props => props.$height || '8rem'};
  margin: 1rem 0;
`;

// Loading button state
const LoadingButtonContainer = styled.div<{ $isLoading: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;

  > button {
    ${props =>
      props.$isLoading
        ? `
      color: transparent;
      pointer-events: none;
    `
        : ''}
  }
`;

const ButtonLoadingOverlay = styled.div<{ $theme: any }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: currentColor;
`;

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading,
  loadingText = 'Carregando',
  children,
  $theme,
}) => {
  return (
    <LoadingButtonContainer $isLoading={isLoading}>
      {children}
      {isLoading && (
        <ButtonLoadingOverlay $theme={$theme}>
          <LoadingSpinner size='sm' $theme={$theme} />
          {loadingText && <span>{loadingText}</span>}
        </ButtonLoadingOverlay>
      )}
    </LoadingButtonContainer>
  );
};

// Progress bar
const ProgressContainer = styled.div<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      width: 100%;
      height: 0.5rem;
      background: ${themedStyles.surface};
      border-radius: ${designConstants.borderRadius.full};
      overflow: hidden;
    `;
  }}
`;

const ProgressBar = styled.div<{ $progress: number; $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      height: 100%;
      width: ${props.$progress}%;
      background: linear-gradient(90deg, ${themedStyles.primary}, ${themedStyles.secondary});
      border-radius: ${designConstants.borderRadius.full};
      transition: width 0.3s ease;
    `;
  }}
`;

const PercentageDisplay = styled.div`
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.875rem;
`;

export const ProgressIndicator: React.FC<{
  progress: number;
  theme?: any;
  showPercentage?: boolean;
}> = ({ progress, theme, showPercentage = false }) => {
  return (
    <div>
      <ProgressContainer $theme={theme}>
        <ProgressBar
          $progress={Math.min(100, Math.max(0, progress))}
          $theme={theme}
        />
      </ProgressContainer>
      {showPercentage && (
        <PercentageDisplay>{Math.round(progress)}%</PercentageDisplay>
      )}
    </div>
  );
};

export default ProgressBar;
