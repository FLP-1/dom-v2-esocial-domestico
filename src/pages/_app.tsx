// pages/_app.tsx

import { AppProps } from 'next/app';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import ProfileSelectionModal from '../components/ProfileSelectionModal';
import {
  UserProfileProvider,
  useUserProfile,
} from '../contexts/UserProfileContext';
import { GlobalStyle } from '../styles/GlobalStyle';
import { theme } from '../styles/theme';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const [key, setKey] = useState(0);
  const {
    showProfileModal,
    setShowProfileModal,
    availableProfiles,
    handleProfileSelection,
    currentProfile,
  } = useUserProfile();

  // Forçar re-renderização quando a rota mudar (incluindo navegação com seta)
  useEffect(() => {
    const handleRouteChange = () => {
      setKey(prev => prev + 1);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    router.events.on('beforeHistoryChange', handleRouteChange);

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
      router.events.off('beforeHistoryChange', handleRouteChange);
    };
  }, [router.events]);

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
        <AppContent {...props} />
      </UserProfileProvider>
    </>
  );
}
