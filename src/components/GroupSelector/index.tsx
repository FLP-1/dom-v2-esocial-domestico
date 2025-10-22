import React from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { useUserGroups, UserGroup } from '../../hooks/useUserGroups';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface GroupSelectorProps {
  theme: any;
  onGroupChange?: (groupId: string) => void;
}

const SelectorContainer = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px ${props => props.$theme?.shadow || 'rgba(0, 0, 0, 0.1)'};
  border: 1px solid ${props => props.$theme?.navigation?.primary || '#29ABE2'}20;
`;

const SelectorHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const SelectorTitle = styled.h3<{ $theme: any }>`
  margin: 0;
  color: ${props => props.$theme?.text?.dark || '#2c3e50'};
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const GroupList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GroupOption = styled.button<{ $selected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border: 2px solid ${props => props.$selected ? props.$color : 'transparent'};
  border-radius: 8px;
  background: ${props => props.$selected ? `${props.$color}15` : '#f8f9fa'};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${props => props.$selected ? `${props.$color}25` : '#e9ecef'};
    transform: translateY(-1px);
  }
`;

const GroupIcon = styled.div<{ $color: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const GroupInfo = styled.div`
  flex: 1;
`;

const GroupName = styled.div<{ $selected: boolean; $theme: any }>`
  font-weight: ${props => props.$selected ? 600 : 500};
  color: ${props => props.$theme?.text?.dark || '#2c3e50'};
  font-size: 0.95rem;
`;

const GroupDescription = styled.div<{ $theme: any }>`
  color: ${props => props.$theme?.text?.secondary || '#6c757d'};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`;

const PrincipalBadge = styled.span<{ $theme: any }>`
  background: ${props => props.$theme?.status?.success?.color || '#28a745'};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
`;

const LoadingState = styled.div<{ $theme: any }>`
  text-align: center;
  padding: 1rem;
  color: ${props => props.$theme?.text?.secondary || '#6c757d'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorState = styled.div<{ $theme: any }>`
  text-align: center;
  padding: 1rem;
  color: ${props => props.$theme?.status?.error?.color || '#e74c3c'};
  background: ${props => props.$theme?.status?.error?.background || '#fdf2f2'};
  border-radius: 8px;
  border: 1px solid ${props => props.$theme?.status?.error?.border || '#fecaca'};
`;

const GroupSelector: React.FC<GroupSelectorProps> = ({ theme, onGroupChange }) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const { 
    groups, 
    selectedGroup, 
    loading, 
    error, 
    hasMultipleGroups, 
    selectGroup 
  } = useUserGroups();

  const handleGroupSelect = (groupId: string) => {
    selectGroup(groupId);
    onGroupChange?.(groupId);
  };

  if (loading) {
    return (
      <SelectorContainer $theme={themeColors}>
        <LoadingState $theme={themeColors}>
          <AccessibleEmoji emoji="⏳" label="Carregando" />
          Carregando grupos...
        </LoadingState>
      </SelectorContainer>
    );
  }

  if (error) {
    return (
      <SelectorContainer $theme={themeColors}>
        <ErrorState $theme={themeColors}>
          <AccessibleEmoji emoji="❌" label="Erro" />
          {error}
        </ErrorState>
      </SelectorContainer>
    );
  }

  // Se não há múltiplos grupos, não mostrar o seletor
  if (!hasMultipleGroups) {
    return null;
  }

  return (
    <SelectorContainer $theme={themeColors}>
      <SelectorHeader>
        <SelectorTitle $theme={themeColors}>
          <AccessibleEmoji emoji="🏢" label="Grupo" />
          Selecionar Grupo
        </SelectorTitle>
      </SelectorHeader>

      <GroupList>
        {groups.map((group) => (
          <GroupOption
            key={group.id}
            $selected={selectedGroup?.id === group.id}
            $color={group.cor}
            onClick={() => handleGroupSelect(group.id)}
          >
            <GroupIcon $color={group.cor}>
              {group.icone ? (
                <AccessibleEmoji emoji={group.icone} label={group.nome} />
              ) : (
                <AccessibleEmoji emoji="🏢" label="Grupo" />
              )}
            </GroupIcon>
            
            <GroupInfo>
              <GroupName $selected={selectedGroup?.id === group.id} $theme={themeColors}>
                {group.nome}
                {group.principal && <PrincipalBadge $theme={themeColors}>Principal</PrincipalBadge>}
              </GroupName>
              {group.descricao && (
                <GroupDescription $theme={themeColors}>{group.descricao}</GroupDescription>
              )}
            </GroupInfo>
          </GroupOption>
        ))}
      </GroupList>
    </SelectorContainer>
  );
};

export default GroupSelector;
