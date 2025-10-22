import React, { useState } from 'react';
import styled from 'styled-components';
import { useGroup } from '../contexts/GroupContext';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';
import { UnifiedModal } from '../design-system/components/UnifiedModal';
import SelectionModal, { SelectableItem } from './SelectionModal';

const HeaderContainer = styled.header<{ $theme: any }>`
  background: ${props => props.$theme.colors.background.primary};
  border-bottom: 1px solid ${props => props.$theme.colors.border.light};
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
`;

const Logo = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.$theme.colors.text.dark};
`;

const SelectionControls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const SelectionButton = styled.button<{ active?: boolean; $theme: any }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid ${props => props.active ? props.$theme.colors.navigation.active : props.$theme.colors.border.muted};
  border-radius: 6px;
  background: ${props => props.active ? props.$theme.colors.background.light : props.$theme.colors.background.primary};
  color: ${props => props.active ? props.$theme.colors.navigation.active : props.$theme.colors.text.primary};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  font-weight: 500;
  
  &:hover {
    border-color: ${props => props.$theme.colors.navigation.active};
    background: ${props => props.$theme.colors.background.light};
  }
`;

const SelectionInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;


const SelectionLabel = styled.span<{ $theme: any }>`
  font-size: 0.8rem;
  color: ${props => props.$theme.colors.text.secondary};
  font-weight: 500;
`;

const SelectionValue = styled.span<{ $theme: any }>`
  font-size: 0.9rem;
  color: ${props => props.$theme.colors.text.dark};
  font-weight: 600;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1e3a8a, #1d4ed8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const UserName = styled.span`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.$theme?.colors?.text?.primary || '#1f2937'};
`;

interface HeaderWithSelectionProps {
  userName?: string;
  userInitials?: string;
}

const HeaderWithSelection: React.FC<HeaderWithSelectionProps> = ({
  userName = 'Usuário',
  userInitials = 'U'
}) => {
  const { currentProfile, availableProfiles, showProfileModal, setShowProfileModal } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const { selectedGroup, showGroupModal, setShowGroupModal } = useGroup();
  const [showGroupModalLocal, setShowGroupModalLocal] = useState(false);
  const [showProfileModalLocal, setShowProfileModalLocal] = useState(false);

  const handleGroupSelect = (group: any) => {
    // Lógica de seleção de grupo será implementada
    setShowGroupModalLocal(false);
  };

  const handleProfileSelect = (profile: any) => {
    // Lógica de seleção de perfil será implementada
    setShowProfileModalLocal(false);
  };

  return (
    <>
      <HeaderContainer $theme={theme}>
        <Logo $theme={theme}>
          <span role="img" aria-label="Logo">🏠</span>
          Sistema DOM
        </Logo>

        <SelectionControls>
          <SelectionButton
            active={!!selectedGroup}
            $theme={theme}
            onClick={() => setShowGroupModalLocal(true)}
          >
            <span role="img" aria-label="Grupo">👥</span>
            <SelectionInfo>
              <SelectionLabel $theme={theme}>Grupo</SelectionLabel>
              <SelectionValue $theme={theme}>
                {selectedGroup?.nome || 'Selecionar Grupo'}
              </SelectionValue>
            </SelectionInfo>
          </SelectionButton>

          <SelectionButton
            active={!!currentProfile}
            $theme={theme}
            onClick={() => setShowProfileModalLocal(true)}
          >
            <span role="img" aria-label="Perfil">👤</span>
            <SelectionInfo>
              <SelectionLabel $theme={theme}>Perfil</SelectionLabel>
              <SelectionValue $theme={theme}>
                {currentProfile?.name || 'Selecionar Perfil'}
              </SelectionValue>
            </SelectionInfo>
          </SelectionButton>
        </SelectionControls>

        <UserInfo>
          <UserAvatar>
            {userInitials}
          </UserAvatar>
          <UserName>{userName}</UserName>
        </UserInfo>
      </HeaderContainer>

      {/* Modal de Seleção de Grupo */}
      <SelectionModal
        isOpen={showGroupModalLocal}
        onClose={() => setShowGroupModalLocal(false)}
        items={(Array.isArray(availableGroups) ? availableGroups : []).map(group => ({
          id: group.id,
          name: group.nome,
          description: group.descricao,
          color: group.cor,
          icon: group.icone === 'building' ? '🏢' : 
                group.icone === 'users' ? '👥' : 
                group.icone === 'home' ? '🏠' : 
                group.icone === 'briefcase' ? '💼' : '📁'
        }))}
        onItemSelect={(item) => {
          const group = availableGroups?.find(g => g.id === item.id);
          if (group) handleGroupSelect(group);
        }}
        currentItem={selectedGroup ? {
          id: selectedGroup.id,
          name: selectedGroup.nome,
          description: selectedGroup.descricao,
          color: selectedGroup.cor,
          icon: selectedGroup.icone === 'building' ? '🏢' : 
                selectedGroup.icone === 'users' ? '👥' : 
                selectedGroup.icone === 'home' ? '🏠' : 
                selectedGroup.icone === 'briefcase' ? '💼' : '📁'
        } : null}
        title="👥 Selecionar Grupo"
        subtitle="Escolha o grupo que deseja usar"
        icon="👥"
        type="group"
      />

      {/* Modal de Seleção de Perfil */}
      <SelectionModal
        isOpen={showProfileModalLocal}
        onClose={() => setShowProfileModalLocal(false)}
        items={(Array.isArray(availableProfiles) ? availableProfiles : []).map(profile => ({
          id: profile.id,
          name: profile.role,
          description: profile.name,
          color: profile.color,
          avatar: profile.avatar,
          role: profile.role
        }))}
        onItemSelect={(item) => {
          const profile = availableProfiles?.find(p => p.id === item.id);
          if (profile) handleProfileSelect(profile);
        }}
        currentItem={currentProfile ? {
          id: currentProfile.id,
          name: currentProfile.role,
          description: currentProfile.name,
          color: currentProfile.color,
          avatar: currentProfile.avatar,
          role: currentProfile.role
        } : null}
        title="👤 Selecionar Perfil"
        subtitle="Escolha o perfil que deseja usar"
        icon="👤"
        type="profile"
      />
    </>
  );
};

export default HeaderWithSelection;
