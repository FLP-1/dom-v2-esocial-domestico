import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from './AccessibleEmoji';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

// Interface genérica para itens selecionáveis
export interface SelectableItem {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  color?: string;
  icon?: string;
  role?: string; // Para perfis
  nickname?: string; // Para perfis
}

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: SelectableItem[];
  onItemSelect: (item: SelectableItem) => void;
  currentItem?: SelectableItem | null;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  type: 'profile' | 'group';
}

const SelectionModal = styled.div<{ $isOpen: boolean }>`
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

const SelectionModalContent = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 500px;
  width: 90%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid ${props => props.$theme?.navigation?.primary || 'rgba(41, 171, 226, 0.3)'};
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
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 2rem;
    border-bottom: 2px solid ${props => props.theme?.border?.secondary || '#f1f3f4'};
    padding-bottom: 1.5rem;

    .title {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: ${props => props.theme?.text?.dark || '#2c3e50'};
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-info {
      margin-top: 0.5rem;
      
      .user-nickname {
        font-family: 'Montserrat', sans-serif;
        font-size: 1.25rem;
        font-weight: 800;
        color: ${props => props.theme?.navigation?.primary || '#29abe2'};
        margin: 0 0 0.25rem 0;
        background: linear-gradient(135deg, ${props => props.theme?.navigation?.primary || '#29abe2'}, ${props => props.theme?.accent?.green || '#90ee90'});
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        text-shadow: 0 2px 4px rgba(41, 171, 226, 0.1);
      }

      .user-name {
        font-family: 'Roboto', sans-serif;
        font-size: 1rem;
        color: ${props => props.theme?.text?.secondary || '#6c757d'};
        margin: 0;
        font-weight: 500;
      }
    }

    .close-button {
      background: ${props => props.theme?.background?.secondary || '#f8f9fa'};
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
        background: ${props => props.theme?.background?.tertiary || '#e9ecef'};
        color: ${props => props.theme?.text?.secondary || '#495057'};
        transform: scale(1.05);
      }
    }
  }
`;

const ModalSubtitle = styled.p<{ $theme: any }>`
  font-family: 'Roboto', sans-serif;
  font-size: 1rem;
  color: ${props => props.$theme?.text?.secondary || '#6c757d'};
  margin: 0 0 2rem 0;
  line-height: 1.5;
  text-align: center;
`;

const ItemList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemButton = styled.button<{ $isSelected: boolean; $color?: string; $theme: any }>`
  position: relative;
  background: ${props => 
    props.$isSelected 
      ? `${props.$color || props.$theme?.navigation?.primary || '#29abe2'}15` 
      : props.$theme?.background?.secondary || '#f8f9fa'};
  border: 2px solid ${props => 
    props.$isSelected 
      ? `${props.$color || props.$theme?.navigation?.primary || '#29abe2'}40` 
      : props.$theme?.background?.tertiary || '#e9ecef'};
  border-radius: 16px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 1rem;

  &:hover {
    background: ${props => `${props.$color || props.$theme?.navigation?.primary || '#29abe2'}10`};
    border-color: ${props => `${props.$color || props.$theme?.navigation?.primary || '#29abe2'}60`};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }

  .item-info {
    flex: 1;
    
    .item-name {
      font-family: 'Montserrat', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: ${props => props.theme?.text?.dark || '#2c3e50'};
      margin: 0 0 0.25rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .item-description {
      font-family: 'Roboto', sans-serif;
      font-size: 0.875rem;
      color: ${props => props.$theme?.text?.secondary || '#6c757d'};
      margin: 0;
      line-height: 1.4;
    }

    .item-role {
      font-family: 'Roboto', sans-serif;
      font-size: 0.75rem;
      color: ${props => props.$theme?.navigation?.primary || '#29abe2'};
      margin: 0.25rem 0 0 0;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  }

  .item-avatar {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: ${props => 
      props.$isSelected 
        ? props.$color || props.$theme?.navigation?.primary || '#29abe2'
        : props.$theme?.text?.secondary || '#6c757d'};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
    box-shadow: 0 4px 12px ${props => 
      props.$isSelected 
        ? `${props.$color || '#29abe2'}40` 
        : 'rgba(0, 0, 0, 0.1)'};
    transition: all 0.3s ease;
  }

  .selection-indicator {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: ${props => props.$color || '#29abe2'};
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

const Icons = {
  close: <AccessibleEmoji emoji="✖️" label="Fechar" />,
};

const SelectionModalComponent: React.FC<SelectionModalProps> = ({
  isOpen,
  onClose,
  items,
  onItemSelect,
  currentItem,
  title,
  subtitle,
  icon,
  type,
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  // Para perfis, mostrar nome e nickname do primeiro item (todos têm o mesmo usuário)
  const userName = type === 'profile' && items.length > 0 ? items[0].name : '';
  const userNickname = type === 'profile' && items.length > 0 ? items[0].nickname || items[0].name : '';

  return (
    <SelectionModal $isOpen={isOpen}>
      <SelectionModalContent $theme={theme}>
        <div className='header'>
          <div>
            <h2 className='title'>
              {icon}
              {title}
            </h2>
            {type === 'profile' && userNickname && (
              <div className='user-info'>
                <h3 className='user-nickname'>{userNickname}</h3>
                {userName && <p className='user-name'>{userName}</p>}
              </div>
            )}
          </div>
          <button
            className='close-button'
            onClick={onClose}
            aria-label={`Fechar modal de seleção de ${type === 'profile' ? 'perfil' : 'grupo'}`}
          >
            {Icons.close}
          </button>
        </div>

        <ModalSubtitle $theme={theme}>
          {subtitle}
        </ModalSubtitle>

        <ItemList>
          {items.map((item) => (
            <ItemButton
              key={item.id}
              $isSelected={currentItem?.id === item.id}
              $color={item.color}
              $theme={theme}
              onClick={() => onItemSelect(item)}
              aria-label={`Selecionar ${type === 'profile' ? 'perfil' : 'grupo'} ${item.name}`}
            >
              <div className='item-avatar'>
                {item.avatar || item.icon || (type === 'profile' ? '👤' : '👥')}
              </div>
              <div className='item-info'>
                <h3 className='item-name'>
                  {item.name}
                </h3>
                {item.description && (
                  <p className='item-description'>
                    {item.description}
                  </p>
                )}
                {item.role && (
                  <p className='item-role'>
                    {item.role}
                  </p>
                )}
              </div>
              <div className='selection-indicator' />
            </ItemButton>
          ))}
        </ItemList>
      </SelectionModalContent>
    </SelectionModal>
  );
};

export default SelectionModalComponent;
