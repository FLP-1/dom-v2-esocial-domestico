// pages/_app.tsx

import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import {
  UserProfileProvider,
  useUserProfile,
} from '../contexts/UserProfileContext';
import { GeolocationProvider, useGeolocationContext } from '../contexts/GeolocationContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { GlobalStyle } from '../styles/GlobalStyle';
import { theme } from '../styles/theme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import ProfileSelectionModal from '../components/ProfileSelectionModal';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [key, setKey] = useState(0);
  const { captureRealTimeLocation } = useGeolocation();
  const { setLastLocation } = useGeolocationContext();
  const {
    handleProfileSelection,
    currentProfile,
    availableProfiles,
    showProfileModal,
    setShowProfileModal,
  } = useUserProfile();

  // Forçar re-renderização quando a rota mudar (incluindo navegação com seta)
  useEffect(() => {
    const handleRouteChange = () => {
      setKey(prev => prev + 1);
      // Disparar captura manual na mudança de página se permissão já concedida
      try {
        if (navigator.permissions && navigator.permissions.query) {
          navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((result) => {
            if (result.state === 'granted') {
              captureRealTimeLocation()
                .then(data => {
                  setLastLocation({
                    latitude: data.latitude,
                    longitude: data.longitude,
                    accuracy: data.accuracy,
                    address: data.address,
                    wifiName: data.wifiName,
                    networkInfo: data.networkInfo,
                    timestamp: new Date()
                  });
                })
                .catch(() => {});
            }
          });
        }
      } catch {}
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
  }, [router.events, captureRealTimeLocation, setLastLocation]);

  const handleProfileSelect = (profile: any) => {
    handleProfileSelection(profile);
    router.push('/dashboard');
  };

  return (
    <div className='page-transition'>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <Component key={key} {...pageProps} />

        {/* Modal Global de Seleção de Perfil */}
        <ProfileSelectionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          profiles={availableProfiles}
          onProfileSelect={handleProfileSelect}
          currentProfile={currentProfile}
        />
      </ThemeProvider>
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
        <GeolocationProvider>
          <AppContent {...props} />
        </GeolocationProvider>
      </UserProfileProvider>
    </>
  );
}
