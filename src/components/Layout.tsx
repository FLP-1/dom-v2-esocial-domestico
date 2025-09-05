// src/components/Layout.tsx
import { useRouter } from 'next/router';
import { ReactNode, useState } from 'react';
import styled from 'styled-components';
import { ProfileProps } from '../types';
import { Button } from './Button';
import Modal from './Modal';

type MenuItem = {
  label: string;
  href: string;
  icon: string;
};

type MenuGroup = {
  title: string;
  items: MenuItem[];
};

type LayoutProps = {
  profiles: ProfileProps[];
  selectedProfile: ProfileProps;
  onProfileChange: (id: string) => void;
  pageTitle: string;
  pageDescription: string;
  children: ReactNode;
};

const Container = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const Sidebar = styled.nav<{ $collapsed: boolean }>`
  width: ${p => (p.$collapsed ? '60px' : '240px')};
  background: #fff;
  border-right: 1px solid #eee;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
`;

const SidebarHeader = styled.div<{ bg: string; $collapsed: boolean }>`
  background: ${p => p.bg};
  color: #fff;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 60px;

  img {
    height: 32px;
    width: auto;
  }
`;

const SidebarContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0;
`;

const MenuItem = styled.a<{ $active: boolean; $collapsed: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.6rem 1rem;
  color: ${p => (p.$active ? p.theme.colors.primary : '#333')};
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  &:hover {
    background: #f5f5f5;
  }

  span.icon {
    font-size: 1.2rem;
    margin-right: ${p => (p.$collapsed ? '0' : '0.75rem')};
  }

  .label {
    display: ${p => (p.$collapsed ? 'none' : 'inline')};
  }
`;

const ProfileSection = styled.div`
  padding: 0.75rem 1.5rem;
  border-top: 1px solid #eee;

  .info {
    h1 {
      margin: 0;
      font-size: 1.25rem;
      color: #333;
    }

    p {
      margin: 0;
      font-size: 0.9rem;
      color: #666;
    }
  }

  .burger {
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const MaterialIcon = styled.span`
  font-family: 'Material Symbols Outlined';
  font-weight: normal;
  font-style: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  word-wrap: normal;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
`;

const LabelSpan = styled.span<{ $collapsed: boolean }>`
  display: ${p => (p.$collapsed ? 'none' : 'inline')};
`;

const InfoDiv = styled.div<{ $collapsed: boolean }>`
  display: ${p => (p.$collapsed ? 'none' : 'block')};
`;

const BurgerIcon = styled.span`
  font-size: 1.5rem;
  cursor: pointer;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: #fff;
  border-bottom: 1px solid #eee;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;

  h1 {
    margin: 0;
    font-size: 1.5rem;
    color: #333;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
`;

export default function Layout({
  profiles,
  selectedProfile,
  onProfileChange,
  pageTitle,
  pageDescription,
  children,
}: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const router = useRouter();

  const menuGroups: MenuGroup[] = [
    {
      title: 'Tarefas',
      items: [
        { label: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        { label: 'Minhas Tarefas', href: '/tasks', icon: 'task' },
      ],
    },
    {
      title: 'Financeiro',
      items: [{ label: 'Visão Geral', href: '/finance', icon: 'attach_money' }],
    },
    {
      title: 'Documentos',
      items: [{ label: 'Meus Documentos', href: '/docs', icon: 'folder' }],
    },
    {
      title: 'Configurações',
      items: [{ label: 'Meu Perfil', href: '/settings', icon: 'settings' }],
    },
  ];

  const handleProfileSelect = (profileId: string) => {
    onProfileChange(profileId);
    setShowProfileModal(false);
    router.push('/dashboard');
  };

  return (
    <Container>
      <Sidebar $collapsed={collapsed}>
        <SidebarHeader bg={selectedProfile.color} $collapsed={collapsed}>
          <InfoDiv $collapsed={collapsed}>
            <h1>DOM</h1>
          </InfoDiv>
          <BurgerIcon onClick={() => setCollapsed(!collapsed)}>
            <MaterialIcon>{collapsed ? 'menu' : 'close'}</MaterialIcon>
          </BurgerIcon>
        </SidebarHeader>

        <SidebarContent>
          {menuGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <InfoDiv $collapsed={collapsed}>
                <h3
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.8rem',
                    color: '#666',
                    margin: 0,
                  }}
                >
                  {group.title}
                </h3>
              </InfoDiv>
              {group.items.map((item, itemIndex) => (
                <MenuItem
                  key={itemIndex}
                  href={item.href}
                  $active={router.pathname === item.href}
                  $collapsed={collapsed}
                >
                  <MaterialIcon>{item.icon}</MaterialIcon>
                  <LabelSpan $collapsed={collapsed}>{item.label}</LabelSpan>
                </MenuItem>
              ))}
            </div>
          ))}
        </SidebarContent>

        <ProfileSection>
          <InfoDiv $collapsed={collapsed}>
            <div className='info'>
              <h1>{selectedProfile.nickname}</h1>
              <p>{selectedProfile.role}</p>
            </div>
          </InfoDiv>
          <BurgerIcon onClick={() => setShowProfileModal(true)}>
            <MaterialIcon>account_circle</MaterialIcon>
          </BurgerIcon>
        </ProfileSection>
      </Sidebar>

      <MainContent>
        <Header>
          <h1>{pageTitle}</h1>
          <p>{pageDescription}</p>
        </Header>
        <Content>{children}</Content>
      </MainContent>

      {showProfileModal && (
        <Modal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        >
          <h2>Selecionar Perfil</h2>
          {profiles.map(profile => (
            <Button
              key={profile.id}
              onClick={() => handleProfileSelect(profile.id)}
              style={{ margin: '0.5rem', backgroundColor: profile.color }}
            >
              {profile.nickname} - {profile.role}
            </Button>
          ))}
        </Modal>
      )}
    </Container>
  );
}
