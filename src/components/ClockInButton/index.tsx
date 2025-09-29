import React from 'react';
import styled, { keyframes } from 'styled-components';

const successPulse = keyframes`
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(41, 171, 226, 0.7);
  }
  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 20px rgba(41, 171, 226, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(41, 171, 226, 0);
  }
`;

const ButtonContainer = styled.button<{
  $isClockedIn: boolean;
  $justRegistered: boolean;
  $theme?: any;
  $size?: 'small' | 'medium' | 'large';
}>`
  width: ${props => {
    switch (props.$size) {
      case 'small':
        return '120px';
      case 'large':
        return '250px';
      default:
        return '200px';
    }
  }};
  height: ${props => {
    switch (props.$size) {
      case 'small':
        return '120px';
      case 'large':
        return '250px';
      default:
        return '200px';
    }
  }};
  border-radius: 50%;
  border: none;
  background: ${props => {
    if (props.$theme?.colors) {
      return props.$isClockedIn
        ? `linear-gradient(135deg, ${props.$theme.colors.accent || '#e74c3c'}, #c0392b)`
        : `linear-gradient(135deg, ${props.$theme.colors.primary}, ${props.$theme.colors.secondary})`;
    }

    return props.$isClockedIn
      ? 'linear-gradient(135deg, #e74c3c, #c0392b)'
      : 'linear-gradient(135deg, #29abe2, #90ee90)';
  }};
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: ${props => {
    switch (props.$size) {
      case 'small':
        return '1rem';
      case 'large':
        return '1.5rem';
      default:
        return '1.25rem';
    }
  }};
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props =>
    `0 8px 32px ${props.$theme?.colors.primary + '50' || 'rgba(41, 171, 226, 0.3)'}`};
  position: relative;
  overflow: hidden;
  animation: ${props => (props.$justRegistered ? successPulse : 'none')} 1s
    ease-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props =>
      `0 12px 40px ${props.$theme?.colors.primary + '60' || 'rgba(41, 171, 226, 0.4)'}`};
  }

  &:active {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .icon {
    font-size: ${props => {
      switch (props.$size) {
        case 'small':
          return '2rem';
        case 'large':
          return '4rem';
        default:
          return '3rem';
      }
    }};
    margin-bottom: 0.5rem;
    display: block;
  }

  .text {
    font-size: ${props => {
      switch (props.$size) {
        case 'small':
          return '0.8rem';
        case 'large':
          return '1.2rem';
        default:
          return '1rem';
      }
    }};
    font-weight: 600;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.2),
      transparent
    );
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

export interface ClockInButtonProps {
  isClockedIn: boolean;
  justRegistered?: boolean;
  theme?: any;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  disabled?: boolean;
  icon?: string;
  text?: string;
}

export const ClockInButton: React.FC<ClockInButtonProps> = ({
  isClockedIn,
  justRegistered = false,
  theme,
  size = 'medium',
  onClick,
  disabled = false,
  icon,
  text,
}) => {
  const defaultIcon = isClockedIn ? '⏰' : '🕐';
  const defaultText = isClockedIn ? 'Sair' : 'Entrar';

  return (
    <ButtonContainer
      $isClockedIn={isClockedIn}
      $justRegistered={justRegistered}
      $theme={theme}
      $size={size}
      onClick={onClick}
      disabled={disabled}
    >
      <span className='icon'>{icon || defaultIcon}</span>
      <span className='text'>{text || defaultText}</span>
    </ButtonContainer>
  );
};

export default ClockInButton;
