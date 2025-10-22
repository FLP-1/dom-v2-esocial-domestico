// pages/_app.tsx

import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import {
  UserProfileProvider,
  useUserProfile,
} from '../contexts/UserProfileContext';
import { GroupProvider } from '../contexts/GroupContext';
import {
  UserGroupProvider,
  useUserGroup,
} from '../contexts/UserGroupContext';
import { GeolocationProvider, useGeolocationContext } from '../contexts/GeolocationContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { useGroupLoader } from '../hooks/useGroupLoader';
import { useTheme } from '../hooks/useTheme';
import { GlobalStyle } from '../styles/GlobalStyle';
import {
  UnifiedButton,
  UnifiedCard,
} from '../components/unified';
import { UnifiedModal } from '../design-system/components/UnifiedModal';
import SelectionModal from '../components/SelectionModal';
import { AntifaudeProvider } from '../components/AntifaudeProvider';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [key, setKey] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const { getCurrentPosition } = useGeolocation();
  const { updateLastLocationIfBetter } = useGeolocationContext();
  const {
    handleProfileSelection,
    currentProfile,
    availableProfiles,
    showProfileModal,
    setShowProfileModal,
  } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());

  const {
    currentGroup,
    availableGroups,
    showGroupModal,
    setShowGroupModal,
    setCurrentGroup,
  } = useUserGroup();

  // ✅ Carregar grupos do usuário apenas uma vez
  useGroupLoader();

  // Marcar primeira carga como concluída após hidratação
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
      setIsHydrated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Forçar re-renderização quando a rota mudar (incluindo navegação com seta)
  const { setLastCaptureLocation, setLastCaptureStatus } = useGeolocationContext();
  useEffect(() => {
    const handleRouteChange = () => {
      setKey(prev => prev + 1);
      // Só hidratar dados se não estivermos na página de login
      if (router.pathname !== '/login') {
        // Hidratar "última captura usada no registro" do servidor
        fetch('/api/time-clock/last')
          .then(r => (r && r.ok ? r.json() : null))
          .then(json => {
            const last = json?.data;
            if (last) {
              setLastCaptureLocation && setLastCaptureLocation({
                latitude: last.latitude,
                longitude: last.longitude,
                accuracy: last.precisao,
                address: last.endereco || undefined,
                wifiName: last.nomeRedeWiFi || undefined,
                timestamp: new Date(last.dataHora)
              });
              setLastCaptureStatus && setLastCaptureStatus({ approved: !!last.aprovado, pending: !last.aprovado, imprecise: !last.dentroGeofence, serverRecordId: last.id });
            }
          })
          .catch(() => {});
      }
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
  }, [router.events, router.pathname, setLastCaptureLocation, setLastCaptureStatus]);

  const handleProfileSelect = (profile: any) => {
    handleProfileSelection(profile);
    router.push('/dashboard');
  };

  return (
    <div className={isInitialLoad ? 'initial-load' : 'page-transition'}>
      <GlobalStyle />
      <Component key={key} {...pageProps} />

        {/* Modais apenas após hidratação para evitar FOUC */}
        {isHydrated && (
          <>
            {/* Modal Global de Seleção de Perfil */}
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

            {/* Modal Global de Seleção de Grupo */}
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
          </>
        )}
    </div>
  );
}

export default function App(props: AppProps) {
  return (
    <>
      <Head>
        <title>DOM</title>
        <meta
          name='description'
          content='Sistema de gestão empresarial e familiar'
        />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <meta
          httpEquiv='Cache-Control'
          content='no-cache, no-store, must-revalidate'
        />
        <meta httpEquiv='Pragma' content='no-cache' />
        <meta httpEquiv='Expires' content='0' />
      </Head>

      <UserProfileProvider>
        <GroupProvider>
          <UserGroupProvider>
            <GeolocationProvider>
              <AntifaudeProvider>
                <AppContent {...props} />
              </AntifaudeProvider>
            </GeolocationProvider>
          </UserGroupProvider>
        </GroupProvider>
      </UserProfileProvider>
    </>
  );
}
