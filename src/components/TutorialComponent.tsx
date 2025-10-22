import AccessibleEmoji from './AccessibleEmoji';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { Card } from '../design-system/components';
import { createThemedStyles, mediaQueries } from '../design-system';
import { designConstants } from '../design-system/tokens/constants';
import { fontFamily, fontSize, fontWeight, lineHeight } from '../design-system/tokens/typography';
import { UnifiedButton } from '../components/unified';
import PageContainer from './PageContainer';
import PageHeader from './PageHeader';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import WelcomeSection from './WelcomeSection';

// Types
interface TutorialSlide {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  benefits: string[];
  color: string;
  illustration: React.ReactNode;
}

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(50px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const IllustrationIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.8;
`;

// Styled Components
const WelcomeContainer = styled.div<{ $theme: any }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #1e40af 50%,
    #1d4ed8 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.body.join(', ')};
  position: relative;
  overflow: hidden;
`;


const WelcomeContent = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 2rem;
  animation: ${fadeIn} 1s ease-out;
`;

const LogoContainer = styled.div`
  margin-bottom: 2rem;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const Logo = styled.div<{ $theme: any }>`
  width: 120px;
  height: 120px;
  border-radius: 30px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.9),
    rgba(255, 255, 255, 0.7)
  );
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  /* backdrop-filter: blur(20px); - removido para melhorar legibilidade */
  border: 2px solid rgba(255, 255, 255, 0.3);

  img {
    width: 80px;
    height: 80px;
    border-radius: 15px;
  }
`;

const WelcomeTitle = styled.h1<{ $theme: any }>`
  font-family: ${fontFamily.heading.join(', ')};
  font-size: ${fontSize['5xl']};
  font-weight: ${fontWeight.bold};
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  /* Removido gradiente do texto para melhorar legibilidade */
  
  @media (max-width: 768px) {
    font-size: ${fontSize['4xl']};
  }
`;

const WelcomeSubtitle = styled.p`
  font-size: ${fontSize.xl};
  color: white;
  margin: 0 0 2rem 0;
  font-weight: ${fontWeight.medium};
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  font-family: ${fontFamily.body.join(', ')};
`;

const WelcomeDescription = styled.p`
  font-size: ${fontSize.lg};
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 3rem 0;
  line-height: ${lineHeight.relaxed};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  font-family: ${fontFamily.body.join(', ')};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const SkipButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  padding: 0.75rem 1.5rem;
  color: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  /* backdrop-filter: blur(10px); - removido para melhorar legibilidade */

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-2px);
  }
`;

const TutorialContainer = styled.div<{ $theme: any }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    ${props => props.$theme?.colors?.surface || '#f9fafb'} 0%,
    ${props => props.$theme?.colors?.border || '#e5e7eb'} 100%
  );
  display: flex;
  flex-direction: column;
  font-family: 'Roboto', sans-serif;
`;

const TutorialHeader = styled.header<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.98);
  /* backdrop-filter: blur(20px); - removido para melhorar legibilidade */
  padding: 1.5rem 2rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid ${props => props.$theme?.colors?.primary || '#29ABE2'}33;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ProgressContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ProgressBar = styled.div<{ $theme: any }>`
  width: 200px;
  height: 8px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $theme: any }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: linear-gradient(
    90deg,
    ${props => props.$theme?.colors?.primary || '#29ABE2'},
    ${props => props.$theme?.colors?.secondary || '#90EE90'}
  );
  transition: width 0.5s ease;
  border-radius: 4px;
`;

const ProgressText = styled.span`
  font-weight: 600;
  color: ${props => props.$theme?.colors?.text?.primary || '#2c3e50'};
  font-size: 0.9rem;
`;

const TutorialContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 2rem;
  min-height: calc(100vh - 200px);
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  
  @media (max-height: 900px) {
    padding: 1rem 2rem;
    min-height: calc(100vh - 180px);
    max-height: calc(100vh - 180px);
  }
  
  @media (max-height: 768px) {
    padding: 0.5rem 2rem;
    min-height: calc(100vh - 160px);
    max-height: calc(100vh - 160px);
  }
`;

// SlideContainer removido - usando Card do design system

const SlideContent = styled.div`
  animation: ${slideIn} 0.8s ease-out;
`;

const SlideTitle = styled.h2<{ $color: string; $theme: any }>`
  font-family: ${fontFamily.heading.join(', ')};
  font-size: ${fontSize['3xl']};
  font-weight: ${fontWeight.bold};
  color: ${props => props.$theme?.colors?.primary || props.$color};
  margin: 0 0 0.75rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    font-size: ${fontSize['2xl']};
  }
  
  @media (max-height: 900px) {
    font-size: ${fontSize['2xl']};
    margin: 0 0 0.5rem 0;
  }
`;

const SlideDescription = styled.p<{ $theme: any }>`
  font-size: ${fontSize.lg};
  color: ${props => props.$theme?.colors?.text?.secondary || '#5a6c7d'};
  margin: 0 0 1.5rem 0;
  line-height: ${lineHeight.relaxed};
  font-family: ${fontFamily.body.join(', ')};
  
  @media (max-height: 900px) {
    font-size: ${fontSize.base};
    margin: 0 0 1rem 0;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem 0;
  
  @media (max-height: 900px) {
    margin: 0 0 1rem 0;
  }
`;

const FeatureItem = styled.li<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: ${fontSize.sm};
  color: ${props => props.$theme?.colors?.text?.primary || '#2c3e50'};
  font-family: ${fontFamily.body.join(', ')};

  &::before {
    content: '✨';
    font-size: 1rem;
  }
  
  @media (max-height: 900px) {
    font-size: ${fontSize.xs};
    margin-bottom: 0.25rem;
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BenefitItem = styled.li<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: ${fontSize.xs};
  color: ${props => props.$theme?.colors?.text?.tertiary || '#7f8c8d'};
  font-family: ${fontFamily.body.join(', ')};

  &::before {
    content: '🎯';
    font-size: 0.9rem;
  }
  
  @media (max-height: 900px) {
    font-size: 0.75rem;
    margin-bottom: 0.25rem;
  }
`;

const SlideIllustration = styled.div<{ $color: string; $theme: any }>`
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 3s ease-in-out infinite;

  .illustration-icon {
    font-size: 6rem;
    color: ${props => props.$theme?.colors?.primary || props.$color};
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1));
  }
  
  @media (max-height: 900px) {
    .illustration-icon {
      font-size: 4rem;
    }
  }
`;

const NavigationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.98);
  /* backdrop-filter: blur(20px); - removido para melhorar legibilidade */
  border-top: 1px solid rgba(0, 0, 0, 0.1);
`;

const NavigationButton = styled.button<{ $theme: any; $disabled?: boolean }>`
  background: ${props =>
    props.$disabled ? '#e0e0e0' : props.$theme?.colors?.primary || '#29ABE2'};
  color: ${props => (props.$disabled ? '#9e9e9e' : 'white')};
  border: none;
  border-radius: 12px;
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px ${props => props.$theme?.colors?.primary || '#29ABE2'}66;
  }

  &:disabled {
    opacity: 0.5;
  }
`;

const CompletionContainer = styled.div<{ $theme: any }>`
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    #1e3a8a 0%,
    #1e40af 50%,
    #1d4ed8 100%
  );
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-family: ${fontFamily.body.join(', ')};
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
`;

const CompletionContent = styled.div`
  max-width: 600px;
  animation: ${fadeIn} 1s ease-out;
`;

const CompletionIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
  animation: ${bounce} 2s ease-in-out infinite;
`;

const CompletionTitle = styled.h1`
  font-family: ${fontFamily.heading.join(', ')};
  font-size: ${fontSize['5xl']};
  font-weight: ${fontWeight.bold};
  color: white;
  margin: 0 0 1rem 0;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  
  @media (max-width: 768px) {
    font-size: ${fontSize['4xl']};
  }
`;

const CompletionDescription = styled.p`
  font-size: ${fontSize.xl};
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 3rem 0;
  line-height: ${lineHeight.relaxed};
  font-family: ${fontFamily.body.join(', ')};
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  margin: 3rem 0;
`;

const StatCard = styled.div<{ $theme: any }>`
  background: ${props => props.$theme?.colors?.primary || 'rgba(48, 71, 94, 0.9)'};
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid ${props => props.$theme?.colors?.primary || 'rgba(48, 71, 94, 0.3)'};
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
`;

const StatNumber = styled.div`
  font-size: ${fontSize['4xl']};
  font-weight: ${fontWeight.bold};
  color: white;
  margin-bottom: 0.5rem;
  font-family: ${fontFamily.heading.join(', ')};
`;

const StatLabel = styled.div`
  font-size: ${fontSize.sm};
  color: rgba(255, 255, 255, 0.8);
  font-weight: ${fontWeight.medium};
  font-family: ${fontFamily.body.join(', ')};
`;


const TutorialHeaderTitle = styled.h3`
  margin: 0;
  color: ${props => props.$theme?.colors?.text?.primary || '#2c3e50'};
  font-size: ${fontSize.xl};
  font-family: ${fontFamily.heading.join(', ')};
  font-weight: ${fontWeight.semibold};
`;

const TutorialHeaderSubtitle = styled.p`
  margin: 0.25rem 0 0 0;
  color: #7f8c8d;
  font-size: ${fontSize.sm};
  font-family: ${fontFamily.body.join(', ')};
`;

const DotIndicator = styled.div<{ $active: boolean; $theme: any }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props =>
    props.$active ? props.$theme?.colors?.primary || '#29ABE2' : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.3s ease;
`;

const DotsContainer = styled.div`
  display: flex;
  gap: 1rem;
`;

interface TutorialComponentProps {
  isLandingPage?: boolean;
}

export default function TutorialComponent({ isLandingPage = false }: TutorialComponentProps) {
  const router = useRouter();
  const { theme } = useTheme('empregado', true);
  const [currentStep, setCurrentStep] = useState<
    'welcome' | 'tutorial' | 'completion'
  >('welcome');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const tutorialSlides: TutorialSlide[] = [
    {
      id: 'dashboard',
      title: 'Dashboard Inteligente',
      description:
        'Seu centro de comando para gerenciar toda a rotina doméstica com visão completa e personalizada.',
      icon: <AccessibleEmoji emoji='🏠' label='Home' />,
      color: '#29ABE2',
      illustration: <AccessibleEmoji emoji='📊' label='Dashboard' />,
      features: [
        'Visão geral em tempo real',
        'Widgets personalizáveis',
        'Alertas e notificações',
        'Calendário integrado',
      ],
      benefits: [
        'Controle total da sua casa',
        'Economia de tempo',
        'Organização automática',
        'Decisões baseadas em dados',
      ],
    },
    {
      id: 'time-clock',
      title: 'Controle de Ponto Seguro',
      description:
        'Sistema anti-fraude com geolocalização, verificação de dispositivo e rede Wi-Fi para registros confiáveis.',
      icon: '⏰',
      color: '#2ECC71',
      illustration: '🔒',
      features: [
        'Geolocalização com geofencing',
        'Verificação de dispositivo',
        'Captura de rede Wi-Fi',
        'Horário do servidor confiável',
      ],
      benefits: [
        'Zero possibilidade de fraude',
        'Conformidade com LGPD',
        'Relatórios precisos',
        'Tranquilidade total',
      ],
    },
    {
      id: 'task-management',
      title: 'Gestão de Tarefas Colaborativa',
      description:
        'Organize, atribua e acompanhe tarefas com comentários, checklists e notificações em tempo real.',
      icon: <AccessibleEmoji emoji='📋' label='Checklist' />,
      color: '#F39C12',
      illustration: <AccessibleEmoji emoji='👥' label='Equipe' />,
      features: [
        'Criação e atribuição de tarefas',
        'Comentários e checklists',
        'Notificações push e email',
        'Chat estilo WhatsApp',
      ],
      benefits: [
        'Colaboração eficiente',
        'Comunicação clara',
        'Acompanhamento em tempo real',
        'Produtividade maximizada',
      ],
    },
    {
      id: 'document-management',
      title: 'Gestão de Documentos',
      description:
        'Organize, armazene e gerencie todos os documentos importantes com alertas de vencimento e controle de acesso.',
      icon: <AccessibleEmoji emoji='📄' label='Documento' />,
      color: '#9B59B6',
      illustration: <AccessibleEmoji emoji='🗂' label='Organizador' />,
      features: [
        'Upload e categorização',
        'Alertas de vencimento',
        'Controle de permissões',
        'Busca inteligente',
      ],
      benefits: [
        'Organização perfeita',
        'Nunca perca um prazo',
        'Acesso controlado',
        'Busca instantânea',
      ],
    },
    {
      id: 'communication',
      title: 'Comunicação Unificada',
      description:
        'Chat em tempo real, grupos colaborativos e notificações instantâneas para manter toda a equipe conectada.',
      icon: <AccessibleEmoji emoji='💬' label='Comunicação' />,
      color: '#E67E22',
      illustration: <AccessibleEmoji emoji='📱' label='Aplicativo' />,
      features: [
        'Chat em tempo real',
        'Grupos colaborativos',
        'Status online/offline',
        'Notificações push',
      ],
      benefits: [
        'Comunicação instantânea',
        'Colaboração eficiente',
        'Informações sempre atualizadas',
        'Equipe sempre conectada',
      ],
    },
    {
      id: 'shopping-management',
      title: 'Gestão de Compras',
      description:
        'Organize listas de compras por categoria, controle gastos e compartilhe com a família para uma gestão eficiente.',
      icon: <AccessibleEmoji emoji='🛍' label='Compras' />,
      color: '#9B59B6',
      illustration: <AccessibleEmoji emoji='📋' label='Checklist' />,
      features: [
        'Listas por categoria',
        'Controle de preços',
        'Compartilhamento familiar',
        'Sugestões inteligentes',
      ],
      benefits: [
        'Organização perfeita',
        'Economia garantida',
        'Colaboração familiar',
        'Nunca esqueça nada',
      ],
    },
    {
      id: 'security',
      title: 'Segurança e Conformidade',
      description:
        'Sistema robusto com criptografia, logs de auditoria e conformidade total com a LGPD.',
      icon: <AccessibleEmoji emoji='🛡' label='Segurança' />,
      color: '#E74C3C',
      illustration: <AccessibleEmoji emoji='🔐' label='Criptografia' />,
      features: [
        'Criptografia de dados',
        'Logs de auditoria',
        'Conformidade LGPD',
        'Autenticação JWT',
      ],
      benefits: [
        'Dados 100% protegidos',
        'Rastreabilidade completa',
        'Conformidade legal',
        'Acesso seguro',
      ],
    },
  ];

  const handleStartTutorial = () => {
    setCurrentStep('tutorial');
    toast.success(
      'Bem-vindo ao tutorial do Sistema DOM! <AccessibleEmoji emoji="🎉" label="Parabéns" />'
    );
  };

  const handleSkipTutorial = () => {
    router.push('/login');
    toast.info(
      'Tutorial pulado. Você pode acessá-lo novamente a qualquer momento!'
    );
  };

  const handleNextSlide = () => {
    if (currentSlide < tutorialSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setCurrentStep('completion');
    }
  };

  const handlePreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleGoToDashboard = () => {
    router.push('/login');
    toast.success(
      'Bem-vindo ao Sistema DOM! <AccessibleEmoji emoji="🚀" label="Iniciar" />'
    );
  };

  const handleRevisitTutorial = () => {
    setCurrentStep('tutorial');
    setCurrentSlide(0);
  };

  const progress = ((currentSlide + 1) / tutorialSlides.length) * 100;

  // Wrapper condicional para landing page vs página interna
  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (isLandingPage) {
      return <>{children}</>;
    }
    
    return (
      <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          currentPath="/tutorial"
        />

        <TopBar $theme={theme}>
          <WelcomeSection
            $theme={theme}
            userAvatar="U"
            userName="Usuário"
            userRole="Visitante"
            notificationCount={0}
            onNotificationClick={() => {}}
          />
        </TopBar>

        <PageHeader
          $theme={theme}
          title="Tutorial do Sistema DOM"
          subtitle="Conheça todas as funcionalidades do sistema"
        />
        {children}
      </PageContainer>
    );
  };

  if (currentStep === 'welcome') {
    return (
      <Wrapper>

        <WelcomeContainer $theme={theme}>
          <SkipButton onClick={handleSkipTutorial}>Pular Tour</SkipButton>

          <WelcomeContent>
          <LogoContainer>
            <Logo $theme={theme}>
              <Image src='/logo.png' alt='Logo DOM' width={80} height={80} />
            </Logo>
          </LogoContainer>

          <WelcomeTitle $theme={theme}>Bem-vindo ao Sistema DOM!</WelcomeTitle>

          <WelcomeSubtitle>
            A solução completa para a gestão do seu lar
          </WelcomeSubtitle>

          <WelcomeDescription>
            Transforme sua casa em um ambiente organizado, seguro e eficiente.
            Com tecnologia avançada e interface intuitiva, o DOM revoluciona a
            forma como você gerencia sua rotina doméstica.
          </WelcomeDescription>

          <ButtonContainer>
            <UnifiedButton
              variant='secondary'
              size='lg'
              theme={theme}
              onClick={handleStartTutorial}
              icon={<AccessibleEmoji emoji='🚀' label='Iniciar' />}
              iconPosition='left'
            >
              Começar Tour
            </UnifiedButton>
          </ButtonContainer>
        </WelcomeContent>

        <ToastContainer
          position='top-center'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
        />
        </WelcomeContainer>
      </Wrapper>
    );
  }

  if (currentStep === 'tutorial') {
    const slide = tutorialSlides[currentSlide];

    if (!slide) {
      return null;
    }

    return (
      <Wrapper>

        <ProgressContainer>
          <ProgressText>
            {currentSlide + 1} de {tutorialSlides.length}
          </ProgressText>
          <ProgressBar $theme={theme}>
            <ProgressFill $progress={progress} $theme={theme} />
          </ProgressBar>
        </ProgressContainer>

        <TutorialContent>
          <Card 
            variant="elevated" 
            size="lg" 
            theme={theme}
            style={{ 
              maxWidth: '1000px', 
              width: '100%',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '2rem',
              alignItems: 'center',
              padding: '2rem',
              maxHeight: 'calc(100vh - 300px)',
              overflow: 'hidden'
            }}
          >
            <SlideContent>
              <SlideTitle $color={slide.color} $theme={theme}>{slide.title}</SlideTitle>

              <SlideDescription $theme={theme}>{slide.description}</SlideDescription>

              <FeaturesList>
                {slide.features.map((feature, index) => (
                  <FeatureItem key={index} $theme={theme}>{feature}</FeatureItem>
                ))}
              </FeaturesList>

              <BenefitsList>
                {slide.benefits.map((benefit, index) => (
                  <BenefitItem key={index} $theme={theme}>{benefit}</BenefitItem>
                ))}
              </BenefitsList>
            </SlideContent>

            <SlideIllustration $color={slide.color} $theme={theme}>
              <IllustrationIcon>{slide.illustration}</IllustrationIcon>
            </SlideIllustration>
          </Card>
        </TutorialContent>

        <NavigationContainer>
          <UnifiedButton
            variant='secondary'
            size='md'
            theme={theme}
            disabled={currentSlide === 0}
            onClick={handlePreviousSlide}
            icon='←'
            iconPosition='left'
          >
            Anterior
          </UnifiedButton>

          <DotsContainer>
            {tutorialSlides.map((_, index) => (
              <DotIndicator
                key={index}
                $active={index === currentSlide}
                $theme={theme}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </DotsContainer>

          <UnifiedButton 
            variant='primary'
            size='md'
            theme={theme} 
            onClick={handleNextSlide}
            icon={currentSlide === tutorialSlides.length - 1 ? '✓' : '→'}
            iconPosition='right'
          >
            {currentSlide === tutorialSlides.length - 1 ? 'Finalizar' : 'Próximo'}
          </UnifiedButton>
        </NavigationContainer>
      </Wrapper>
    );
  }

  if (currentStep === 'completion') {
    return (
      <Wrapper>

        <CompletionContainer $theme={theme}>
          <CompletionContent>
          <CompletionIcon>
            <AccessibleEmoji emoji='🎉' label='Parabéns' />
          </CompletionIcon>

          <CompletionTitle>Pronto para começar?</CompletionTitle>

          <CompletionDescription>
            Você agora conhece todas as funcionalidades do Sistema DOM! Sua
            jornada rumo a uma casa mais organizada, segura e eficiente começa
            agora.
          </CompletionDescription>

          <StatsContainer>
            <StatCard $theme={theme}>
              <StatNumber>7</StatNumber>
              <StatLabel>Módulos Principais</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber>100%</StatNumber>
              <StatLabel>Seguro e Conforme</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber>24/7</StatNumber>
              <StatLabel>Disponível</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber>∞</StatNumber>
              <StatLabel>Possibilidades</StatLabel>
            </StatCard>
          </StatsContainer>

          <ButtonContainer>
            <UnifiedButton
              variant='primary'
              size='lg'
              theme={theme}
              onClick={handleGoToDashboard}
              icon={<AccessibleEmoji emoji='🔐' label='Login' />}
              iconPosition='left'
            >
              Ir para o login
            </UnifiedButton>

            <UnifiedButton
              variant='secondary'
              size='lg'
              theme={theme}
              onClick={handleRevisitTutorial}
              icon={<AccessibleEmoji emoji='🔄' label='Sincronizar' />}
              iconPosition='left'
            >
              Revisitar Tutorial
            </UnifiedButton>
          </ButtonContainer>
        </CompletionContent>

        <ToastContainer
          position='top-center'
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='light'
        />
        </CompletionContainer>
      </Wrapper>
    );
  }

  return null;
}
