import React from 'react';
import styled from 'styled-components';
import { UserProfile } from '../contexts/UserProfileContext';
import { Icons } from './Icons';

interface ProfileSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  onProfileSelect: (profile: UserProfile) => void;
  currentProfile?: UserProfile | null;
}

const ProfileModal = styled.div<{ $isOpen: boolean }>`
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
  animation: fadeIn 0.3s ease-out;
`;

const ProfileModalContent = styled.div`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(41, 171, 226, 0.3);
  animation: slideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 2rem;
    border-bottom: 2px solid #f1f3f4;
    padding-bottom: 1.5rem;

    .title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .close-button {
      background: #f8f9fa;
      border: none;
      font-size: 1.25rem;
      color: #6c757d;
      cursor: pointer;
      padding: 0.75rem;
      border-radius: 12px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;

      &:hover {
        background: #e9ecef;
        color: #495057;
        transform: scale(1.05);
      }
    }
  }
`;

const ProfileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ModalSubtitle = styled.p`
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: #6c757d;
  margin: 0 0 1.5rem 0;
  text-align: center;
  line-height: 1.5;
`;

const ProfileItem = styled.div<{ $isSelected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  padding: 1.25rem;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid
    ${props => (props.$isSelected ? props.$color : 'transparent')};
  background: ${props => (props.$isSelected ? `${props.$color}12` : '#f8f9fa')};
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      135deg,
      ${props => props.$color}08,
      transparent
    );
    opacity: ${props => (props.$isSelected ? 1 : 0)};
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${props =>
      props.$isSelected ? `${props.$color}18` : '#e9ecef'};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.$color}40;
  }

  .profile-avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: ${props => props.$color};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 1.25rem;
    margin-right: 1.25rem;
    flex-shrink: 0;
    position: relative;
    z-index: 1;
    box-shadow: 0 4px 12px ${props => props.$color}40;
    transition: all 0.3s ease;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 20px ${props => props.$color}50;
    }
  }

  .profile-info {
    flex: 1;
    position: relative;
    z-index: 1;

    .profile-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.125rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 0.375rem 0;
      transition: color 0.3s ease;
    }

    .profile-role {
      font-family: 'Roboto', sans-serif;
      font-size: 0.9rem;
      color: #6c757d;
      margin: 0;
      font-weight: 500;
      transition: color 0.3s ease;
    }
  }

  .selection-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: ${props => (props.$isSelected ? 1 : 0)};
    transform: ${props => (props.$isSelected ? 'scale(1)' : 'scale(0.8)')};
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 1;

    &::before {
      content: '✓';
      color: white;
      font-size: 0.875rem;
      font-weight: 700;
    }
  }
`;

const ProfileSelectionModal: React.FC<ProfileSelectionModalProps> = ({
  isOpen,
  onClose,
  profiles,
  onProfileSelect,
  currentProfile,
}) => {
  return (
    <ProfileModal $isOpen={isOpen}>
      <ProfileModalContent>
        <div className='header'>
          <h2 className='title'>
            {Icons.profile}
            Selecionar Perfil
          </h2>
          <button
            className='close-button'
            onClick={onClose}
            aria-label='Fechar modal de seleção de perfil'
          >
            {Icons.close}
          </button>
        </div>

        <ModalSubtitle>
          Escolha o perfil que deseja usar para acessar o sistema
        </ModalSubtitle>

        <ProfileList>
          {profiles.map(profile => (
            <ProfileItem
              key={profile.id}
              $isSelected={currentProfile?.id === profile.id}
              $color={profile.color}
              onClick={() => onProfileSelect(profile)}
            >
              <div className='profile-avatar'>{profile.avatar}</div>
              <div className='profile-info'>
                <div className='profile-name'>{profile.name}</div>
                <div className='profile-role'>{profile.role}</div>
              </div>
              <div className='selection-indicator' />
            </ProfileItem>
          ))}
        </ProfileList>
      </ProfileModalContent>
    </ProfileModal>
  );
};

export default ProfileSelectionModal;
