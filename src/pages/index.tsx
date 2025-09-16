// pages/index.tsx
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`from{opacity:0;}to{opacity:1;}`;
const SplashContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  animation: ${fadeIn} 1s ease-in;
  background: ${p => p.theme.colors.primary};
`;
export default function Splash() {
  const router = useRouter();
  useEffect(() => {
    const timeout = setTimeout(() => router.push('/login'), 3000);
    return () => clearTimeout(timeout);
  }, [router]);
  return (
    <SplashContainer>
      <Image src='/logo.png' alt='DOM Logo' width={200} height={200} priority />
    </SplashContainer>
  );
}
