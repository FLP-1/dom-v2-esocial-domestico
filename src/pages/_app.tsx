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
  const { updateLastLocationIfBetter } = useGeolocationContext();
  const {
    handleProfileSelection,
    currentProfile,
    availableProfiles,
    showProfileModal,
    setShowProfileModal,
  } = useUserProfile();

  // Forçar re-renderização quando a rota mudar (incluindo navegação com seta)
  const { setLastCaptureLocation, setLastCaptureStatus } = useGeolocationContext();
  useEffect(() => {
    const handleRouteChange = () => {
      setKey(prev => prev + 1);
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
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
  }, [router.events, setLastCaptureLocation, setLastCaptureStatus]);

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
