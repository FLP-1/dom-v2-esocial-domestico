import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useUserProfile } from '../../contexts/UserProfileContext';
import { useUserGroup } from '../../contexts/UserGroupContext';
import { useTheme } from '../../hooks/useTheme';
import { Icons } from '../Icons';
import { UnifiedModal } from '../../design-system/components/UnifiedModal';
import SelectionModal from '../SelectionModal';

// slideIn animation removed - not used

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  active?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
}

const SidebarContainer = styled.aside<{ $collapsed: boolean; $theme: any }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => (props.$collapsed ? '100px' : '280px')};
  background: ${props => props.$theme?.colors?.background?.primary || '#ffffff'};
  border-right: 1px solid ${props => props.$theme?.colors?.border?.light || '#e5e7eb'};
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
`;

const SidebarHeader = styled.div<{ $collapsed: boolean; $theme: any }>`
  padding: ${props => (props.$collapsed ? '1rem 0 1rem 1.5rem' : '1.5rem')};
  border-bottom: 1px solid ${props => props.$theme?.colors?.border?.light || '#dee2e6'};
  display: flex;
  align-items: center;
  justify-content: ${props =>
    props.$collapsed ? 'flex-start' : 'space-between'};
  min-height: ${props => (props.$collapsed ? '60px' : '80px')};
  box-sizing: border-box;
`;

const Logo = styled.img<{ $collapsed: boolean }>`
  width: ${props => (props.$collapsed ? '32px' : '40px')};
  height: ${props => (props.$collapsed ? '32px' : '40px')};
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(41, 171, 226, 0.2);
  opacity: 1;
  transition: all 0.3s ease;
  flex-shrink: 0;
  object-fit: contain;
  display: block;
`;

const SidebarTitle = styled.h2<{ $collapsed: boolean; $theme: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.text?.dark || '#2c3e50'};
  margin: 0;
  opacity: ${props => (props.$collapsed ? 0 : 1)};
  transition: opacity 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleButton = styled.button<{ $theme: any }>`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${props => props.$theme?.colors?.text?.medium || '#5a6c7d'};
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: ${props => props.$theme?.colors?.navigation?.primary || '#29abe2'};
  }
`;

const CollapsedToggleButton = styled(ToggleButton)`
  margin-left: auto;
`;

const HeaderActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileIconButton = styled.button<{ $collapsed: boolean; $theme: any }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$theme?.colors?.text?.medium || '#5a6c7d'};
  font-size: 1.2rem;
  margin-left: auto;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: ${props => props.$theme?.colors?.navigation?.primary || '#29abe2'};
    transform: scale(1.1);
  }

  .profile-icon {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const GroupIconButton = styled.button<{ $collapsed: boolean; $theme: any }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.$theme?.colors?.text?.medium || '#5a6c7d'};
  font-size: 1.2rem;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: ${props => props.$theme?.colors?.navigation?.primary || '#29abe2'};
    transform: scale(1.1);
  }

  .group-icon {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const ProfileSection = styled.div`
  padding: 1rem;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
`;

const Navigation = styled.nav`
  flex: 1;
  padding: 1rem 0;
  opacity: 1;
  transition: opacity 0.3s ease;
  overflow-y: auto;
`;

const NavItem = styled.div<{ $active?: boolean; $collapsed?: boolean; $theme?: any }>`
  display: flex;
  align-items: center;
  gap: ${props => (props.$collapsed ? '0' : '1rem')};
  padding: ${props =>
    props.$collapsed ? '1rem 0 1rem 1.5rem' : '0.75rem 1.5rem'};
  color: ${props => (props.$active ? '#29abe2' : '#5a6c7d')};
  cursor: pointer;
  transition: all 0.3s ease;
  border-right: ${props =>
    props.$active ? '3px solid #29abe2' : '3px solid transparent'};
  background: ${props =>
    props.$active ? 'rgba(41, 171, 226, 0.05)' : 'transparent'};
  justify-content: ${props => (props.$collapsed ? 'flex-start' : 'flex-start')};
  width: 100%;
  min-height: 56px;
  box-sizing: border-box;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: ${props => props.$theme?.colors?.navigation?.primary || '#29abe2'};
  }

  .icon {
    font-size: 1.5rem;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .label {
    font-weight: 500;
    white-space: nowrap;
    opacity: ${props => (props.$collapsed ? 0 : 1)};
    transition: opacity 0.3s ease;
  }
`;

export default function Sidebar({
  collapsed,
  onToggle,
  currentPath,
}: SidebarProps) {
  const router = useRouter();
  
  // Hook do contexto de perfil
  const { currentProfile, availableProfiles, setShowProfileModal, setCurrentProfile, showProfileModal } =
    useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());

  // Hook do contexto de grupo
  const { 
    currentGroup, 
    availableGroups, 
    setShowGroupModal, 
    hasMultipleGroups,
    setCurrentGroup,
    showGroupModal
  } = useUserGroup();

  // Navegação centralizada - única fonte da verdade
  const navigationItems: NavigationItem[] = [
    {
      id: 'dashboard',
      icon: Icons.home,
      label: 'Dashboard',
      path: '/dashboard',
    },
    {
      id: 'time-clock',
      icon: Icons.clock,
      label: 'Controle de Ponto',
      path: '/time-clock',
    },
    {
      id: 'task-management',
      icon: Icons.checklist,
      label: 'Gestão de Tarefas',
      path: '/task-management',
    },
    {
      id: 'finances',
      icon: Icons.money,
      label: 'Finanças',
      path: '#',
    },
    {
      id: 'document-management',
      icon: Icons.document,
      label: 'Gestão de Documentos',
      path: '/document-management',
    },
    {
      id: 'communication',
      icon: Icons.message,
      label: 'Comunicação',
      path: '/communication',
    },
    {
      id: 'shopping-management',
      icon: Icons.shopping,
      label: 'Gestão de Compras',
      path: '/shopping-management',
    },
    {
      id: 'alert-management',
      icon: Icons.alert,
      label: 'Gestão de Alertas',
      path: '/alert-management',
    },
    {
      id: 'subscription-plans',
      icon: Icons.diamond,
      label: 'Planos de Assinatura',
      path: '/subscription-plans',
    },
    {
      id: 'payroll-management',
      icon: Icons.calculator,
      label: 'Cálculos Salariais',
      path: '/payroll-management',
    },
    {
      id: 'loan-management',
      icon: Icons.bank,
      label: 'Empréstimos',
      path: '/loan-management',
    },
    {
      id: 'terms-management',
      icon: Icons.document,
      label: 'Termos e Políticas',
      path: '/terms-management',
    },
    {
      id: 'esocial-domestico-completo',
      icon: Icons.government,
      label: 'eSocial Doméstico',
      path: '/esocial-domestico-completo',
    },
    {
      id: 'monitoring-dashboard',
      icon: Icons.dashboard,
      label: 'Monitoramento',
      path: '/monitoring-dashboard',
    },
    {
      id: 'tutorial',
      icon: Icons.tutorial,
      label: 'Tutorial',
      path: '/welcome-tutorial',
    },
    {
      id: 'team',
      icon: Icons.team,
      label: 'Equipe',
      path: '#',
    },
    {
      id: 'reports',
      icon: Icons.analytics,
      label: 'Relatórios',
      path: '#',
    },
    {
      id: 'settings',
      icon: Icons.settings,
      label: 'Configurações',
      path: '#',
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (itemPath: string) => {
    // Comparação exata do path
    return currentPath === itemPath;
  };

  return (
    <SidebarContainer $collapsed={collapsed} $theme={theme}>
      <SidebarHeader $collapsed={collapsed} $theme={theme}>
        {collapsed ? (
          <>
            <Logo src='/logo.png' alt='Logo DOM' $collapsed={collapsed} />
            <CollapsedToggleButton
              $theme={theme}
              onClick={onToggle}
              aria-label='Expandir sidebar'
            >
              {Icons.menu}
            </CollapsedToggleButton>
          </>
        ) : (
          <>
            <LogoContainer>
              <Logo src='/logo.png' alt='Logo DOM' $collapsed={collapsed} />
              <SidebarTitle $collapsed={collapsed} $theme={theme}>DOM</SidebarTitle>
            </LogoContainer>
            <HeaderActionsContainer>
              {availableProfiles.length > 1 && (
                <ProfileIconButton
                  $collapsed={collapsed}
                  $theme={theme}
                  onClick={() => setShowProfileModal(true)}
                  title={`Perfil: ${currentProfile?.name || 'Usuário'}`}
                >
                  <span className='profile-icon'>{Icons.profile}</span>
                </ProfileIconButton>
              )}
              {hasMultipleGroups && (
                <GroupIconButton
                  $collapsed={collapsed}
                  $theme={theme}
                  onClick={() => setShowGroupModal(true)}
                  title={`Grupo: ${currentGroup?.nome || 'Grupo'}`}
                >
                  <span className='group-icon' role="img" aria-label="Grupo">👥</span>
                </GroupIconButton>
              )}
              <ToggleButton $theme={theme} onClick={onToggle} aria-label='Recolher sidebar'>
                {Icons.close}
              </ToggleButton>
            </HeaderActionsContainer>
          </>
        )}
      </SidebarHeader>

      <Navigation>
        {navigationItems.map(item => (
          <NavItem
            key={item.id}
            $active={isActive(item.path)}
            $collapsed={collapsed}
            $theme={theme}
            onClick={() => handleNavigation(item.path)}
          >
            <span className='icon'>{item.icon}</span>
            <span className='label'>{item.label}</span>
          </NavItem>
        ))}
      </Navigation>

      {/* Seção de Perfil no Final */}
      {collapsed && availableProfiles.length > 0 && (
        <ProfileSection>
          <ProfileIconButton
            $collapsed={collapsed}
            onClick={() => setShowProfileModal(true)}
            title={`Perfil: ${currentProfile?.name || 'Usuário'}`}
          >
            <span className='profile-icon'>
              {currentProfile?.avatar || 'U'}
            </span>
          </ProfileIconButton>
        </ProfileSection>
      )}

      {/* Modais de Seleção */}
      <SelectionModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
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
          if (profile) {
            setCurrentProfile(profile);
            setShowProfileModal(false);
          }
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

      <SelectionModal
        isOpen={showGroupModal}
        onClose={() => setShowGroupModal(false)}
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
          if (group) {
            setCurrentGroup(group);
            setShowGroupModal(false);
          }
        }}
        currentItem={currentGroup ? {
          id: currentGroup.id,
          name: currentGroup.nome,
          description: currentGroup.descricao,
          color: currentGroup.cor,
          icon: currentGroup.icone === 'building' ? '🏢' : 
                currentGroup.icone === 'users' ? '👥' : 
                currentGroup.icone === 'home' ? '🏠' : 
                currentGroup.icone === 'briefcase' ? '💼' : '📁'
        } : null}
        title="👥 Selecionar Grupo"
        subtitle="Escolha o grupo que deseja usar"
        icon="👥"
        type="group"
      />
    </SidebarContainer>
  );
}
