import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';

// slideIn animation removed - not used

interface NavigationItem {
  id: string;
  label: string;
  icon: string;
  path: string;
  active?: boolean;
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  currentPath: string;
  userProfiles?: Array<{
    id: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
  }>;
  selectedProfile?:
    | {
        id: string;
        name: string;
        role: string;
        avatar: string;
        color: string;
      }
    | undefined;
  onProfileChange?: (profile: any) => void;
}

const SidebarContainer = styled.aside<{ $collapsed: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: ${props => (props.$collapsed ? '100px' : '280px')};
  background: #ffffff;
  border-right: 1px solid #dee2e6;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1000;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  overflow: visible;
`;

const SidebarHeader = styled.div<{ $collapsed: boolean }>`
  padding: ${props => (props.$collapsed ? '1rem 0 1rem 1.5rem' : '1.5rem')};
  border-bottom: 1px solid #dee2e6;
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

const SidebarTitle = styled.h2<{ $collapsed: boolean }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #2c3e50;
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

const ToggleButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #5a6c7d;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: #29abe2;
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

const ProfileIconButton = styled.button<{ $collapsed: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #5a6c7d;
  font-size: 1.2rem;
  margin-left: auto;
  width: 32px;
  height: 32px;

  &:hover {
    background: rgba(41, 171, 226, 0.1);
    color: #29abe2;
    transform: scale(1.1);
  }

  .profile-icon {
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

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
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const ProfileModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 400px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(41, 171, 226, 0.2);
  animation: slideIn 0.3s ease-out;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.25rem;
    font-weight: 600;
    color: #2c3e50;
    margin: 0;
  }

  .close-button {
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
  }
`;

const ProfileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfileItem = styled.button<{ $isSelected: boolean; $color: string }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid
    ${props => (props.$isSelected ? props.$color : 'transparent')};
  border-radius: 12px;
  background: ${props =>
    props.$isSelected ? `${props.$color}15` : 'rgba(255, 255, 255, 0.8)'};
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background: ${props => `${props.$color}20`};
    border-color: ${props => props.$color};
    transform: translateY(-2px);
  }

  .profile-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: ${props => props.$color};
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 600;
    font-size: 1rem;
  }

  .profile-info {
    flex: 1;
  }

  .profile-name {
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 0.25rem 0;
  }

  .profile-role {
    color: #7f8c8d;
    font-size: 0.9rem;
    margin: 0;
  }
`;

const Navigation = styled.nav`
  padding: 1rem 0;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

const NavItem = styled.div<{ $active?: boolean; $collapsed?: boolean }>`
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
    color: #29abe2;
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
  userProfiles = [],
  selectedProfile,
  onProfileChange,
}: SidebarProps) {
  const router = useRouter();
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Navegação centralizada - única fonte da verdade
  const navigationItems: NavigationItem[] = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard', path: '/dashboard' },
    {
      id: 'time-clock',
      icon: '⏰',
      label: 'Controle de Ponto',
      path: '/time-clock',
    },
    {
      id: 'task-management',
      icon: '📋',
      label: 'Gestão de Tarefas',
      path: '/task-management',
    },
    { id: 'finances', icon: '💰', label: 'Finanças', path: '#' },
    {
      id: 'document-management',
      icon: '📄',
      label: 'Gestão de Documentos',
      path: '/document-management',
    },
    {
      id: 'communication',
      icon: '💬',
      label: 'Comunicação',
      path: '/communication',
    },
    {
      id: 'shopping-management',
      icon: '🛒',
      label: 'Gestão de Compras',
      path: '/shopping-management',
    },
    {
      id: 'tutorial',
      icon: '🎓',
      label: 'Tutorial',
      path: '/welcome-tutorial',
    },
    { id: 'team', icon: '👥', label: 'Equipe', path: '#' },
    { id: 'reports', icon: '📊', label: 'Relatórios', path: '#' },
    { id: 'settings', icon: '⚙️', label: 'Configurações', path: '#' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  const isActive = (itemPath: string) => {
    // Comparação exata do path
    return currentPath === itemPath;
  };

  const handleProfileSelect = (profile: any) => {
    if (onProfileChange) {
      onProfileChange(profile);
    }
    setProfileModalOpen(false);
  };

  return (
    <SidebarContainer $collapsed={collapsed}>
      <SidebarHeader $collapsed={collapsed}>
        {collapsed ? (
          <>
            <Logo src='/logo.png' alt='Logo DOM' $collapsed={collapsed} />
            <CollapsedToggleButton onClick={onToggle}>☰</CollapsedToggleButton>
          </>
        ) : (
          <>
            <LogoContainer>
              <Logo src='/logo.png' alt='Logo DOM' $collapsed={collapsed} />
              <SidebarTitle $collapsed={collapsed}>DOM</SidebarTitle>
            </LogoContainer>
            <HeaderActionsContainer>
              {userProfiles.length > 1 && (
                <ProfileIconButton
                  $collapsed={collapsed}
                  onClick={() => setProfileModalOpen(true)}
                >
                  <span className='profile-icon'>👤</span>
                </ProfileIconButton>
              )}
              <ToggleButton onClick={onToggle}>✕</ToggleButton>
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
            onClick={() => handleNavigation(item.path)}
          >
            <span className='icon'>{item.icon}</span>
            <span className='label'>{item.label}</span>
          </NavItem>
        ))}
      </Navigation>

      {/* Modal de Seleção de Perfil */}
      <ProfileModal $isOpen={profileModalOpen}>
        <ProfileModalContent>
          <div className='header'>
            <h2 className='title'>Selecionar Perfil</h2>
            <button
              className='close-button'
              onClick={() => setProfileModalOpen(false)}
            >
              ✕
            </button>
          </div>

          <ProfileList>
            {userProfiles.map(profile => (
              <ProfileItem
                key={profile.id}
                $isSelected={selectedProfile?.id === profile.id}
                $color={profile.color}
                onClick={() => handleProfileSelect(profile)}
              >
                <div className='profile-avatar'>{profile.avatar}</div>
                <div className='profile-info'>
                  <div className='profile-name'>{profile.name}</div>
                  <div className='profile-role'>{profile.role}</div>
                </div>
              </ProfileItem>
            ))}
          </ProfileList>
        </ProfileModalContent>
      </ProfileModal>
    </SidebarContainer>
  );
}
