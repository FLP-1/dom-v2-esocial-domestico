// src/pages/time-clock.tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import ActionButton from '../components/ActionButton';
import ClockInButton from '../components/ClockInButton';
import InfoCard from '../components/InfoCard';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import StatusCard from '../components/StatusCard';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useTheme } from '../hooks/useTheme';

// Animações removidas - agora usando componentes reutilizáveis com suas próprias animações

// Styled Components

const ClockSection = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const TimeDisplay = styled.div`
  text-align: center;
  margin-bottom: 1rem;
`;

const CurrentTime = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CurrentDate = styled.p`
  font-size: 1.25rem;
  color: #7f8c8d;
  margin: 0;
  font-weight: 500;
`;

// ClockInButton component removed - now using reusable ClockInButton component

// StatusCard component removed - now using reusable StatusCard component

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

// InfoCard component removed - now using reusable InfoCard component

const ActionButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 2rem;
`;

// ActionButton component removed - now using reusable ActionButton component

// Modal components removed - now using reusable Modal component

const HistoryList = styled.div`
  .history-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(41, 171, 226, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .icon {
      font-size: 1.5rem;
      color: #29abe2;
    }

    .details {
      flex: 1;
    }

    .time {
      font-weight: 600;
      color: #2c3e50;
      margin: 0 0 0.25rem 0;
    }

    .location {
      font-size: 0.9rem;
      color: #7f8c8d;
      margin: 0;
    }
  }
`;

// Tipos
interface TimeRecord {
  id: string;
  type: 'in' | 'out' | 'break';
  timestamp: Date;
  location: string;
  wifi: string;
}

// UserProfile interface removed - using inline types

export default function TimeClock() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [justRegistered, setJustRegistered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'history' | 'details' | 'break'>(
    'history'
  );
  // Perfis disponíveis
  const [userProfiles] = useState([
    {
      id: '1',
      name: 'João Silva',
      role: 'Empregado',
      avatar: 'JS',
      color: '#29ABE2',
    },
    {
      id: '2',
      name: 'Maria Santos',
      role: 'Empregador',
      avatar: 'MS',
      color: '#E74C3C',
    },
    {
      id: '3',
      name: 'Família Silva',
      role: 'Família',
      avatar: 'FS',
      color: '#9B59B6',
    },
  ]);

  const [selectedProfile, setSelectedProfile] = useState(userProfiles[0]);
  const { theme, updateTheme } = useTheme(selectedProfile?.role.toLowerCase());

  const handleProfileChange = (profile: any) => {
    setSelectedProfile(profile);
    updateTheme(profile.role.toLowerCase());
  };

  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([
    {
      id: '1',
      type: 'in',
      timestamp: new Date('2024-01-15T08:00:00'),
      location: 'Casa - Sala de Estar',
      wifi: 'Casa_WiFi_5G',
    },
    {
      id: '2',
      type: 'break',
      timestamp: new Date('2024-01-15T12:00:00'),
      location: 'Casa - Cozinha',
      wifi: 'Casa_WiFi_5G',
    },
    {
      id: '3',
      type: 'in',
      timestamp: new Date('2024-01-15T13:00:00'),
      location: 'Casa - Sala de Estar',
      wifi: 'Casa_WiFi_5G',
    },
  ]);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simular geolocalização
  const getCurrentLocation = () => {
    return {
      location: 'Casa - Sala de Estar',
      wifi: 'Casa_WiFi_5G',
    };
  };

  const handleClockInOut = () => {
    const { location, wifi } = getCurrentLocation();
    const newRecord: TimeRecord = {
      id: Date.now().toString(),
      type: isClockedIn ? 'out' : 'in',
      timestamp: new Date(),
      location,
      wifi,
    };

    setTimeRecords(prev => [newRecord, ...prev]);
    setIsClockedIn(!isClockedIn);
    setJustRegistered(true);

    // Feedback visual e sonoro
    toast.success(
      `Ponto ${isClockedIn ? 'registrado' : 'registrado'} com sucesso!`,
      {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      }
    );

    // Resetar animação após 1 segundo
    setTimeout(() => {
      setJustRegistered(false);
    }, 1000);
  };

  const handleBreak = () => {
    const { location, wifi } = getCurrentLocation();
    const newRecord: TimeRecord = {
      id: Date.now().toString(),
      type: 'break',
      timestamp: new Date(),
      location,
      wifi,
    };

    setTimeRecords(prev => [newRecord, ...prev]);
    toast.info('Intervalo registrado com sucesso!');
  };

  const openModal = (type: 'history' | 'details' | 'break') => {
    setModalType(type);
    setModalOpen(true);
  };

  const getStatusInfo = () => {
    const lastRecord = timeRecords[0];
    if (!lastRecord)
      return { status: 'out', time: 'Nenhum registro', icon: '⏰' };

    const timeStr = lastRecord.timestamp.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    switch (lastRecord.type) {
      case 'in':
        return { status: 'in', time: `Entrada: ${timeStr}`, icon: '✅' };
      case 'out':
        return { status: 'out', time: `Saída: ${timeStr}`, icon: '❌' };
      case 'break':
        return { status: 'break', time: `Intervalo: ${timeStr}`, icon: '☕' };
      default:
        return { status: 'out', time: 'Nenhum registro', icon: '⏰' };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
        userProfiles={userProfiles}
        selectedProfile={selectedProfile || userProfiles[0]}
        onProfileChange={handleProfileChange}
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar={selectedProfile?.avatar || 'U'}
          userName={selectedProfile?.name || 'Usuário'}
          userRole={selectedProfile?.role || 'Usuário'}
          notificationCount={2}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Controle de Ponto'
        subtitle='Registre sua entrada, saída e intervalos de forma segura'
      />

        <ClockSection>
          <TimeDisplay>
            <CurrentTime>
              {currentTime.toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </CurrentTime>
            <CurrentDate>
              {currentTime.toLocaleDateString('pt-BR', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </CurrentDate>
          </TimeDisplay>

          <ClockInButton
            isClockedIn={isClockedIn}
            justRegistered={justRegistered}
            onClick={handleClockInOut}
            theme={theme}
            icon={isClockedIn ? '⏰' : '👆'}
            text={isClockedIn ? 'Registrar Saída' : 'Registrar Entrada'}
          />

          <StatusCard
            status={statusInfo.status as 'in' | 'out' | 'break'}
            icon={statusInfo.icon}
            title={
              statusInfo.status === 'in'
                ? 'Trabalhando'
                : statusInfo.status === 'out'
                  ? 'Fora do Trabalho'
                  : 'Em Intervalo'
            }
            time={statusInfo.time}
            theme={theme}
          />
        </ClockSection>

        <InfoGrid>
          <InfoCard
            icon='📍'
            title='Localização Atual'
            theme={theme}
            location='Casa - Sala de Estar'
            wifi='Casa_WiFi_5G'
          >
            <></>
          </InfoCard>

          <InfoCard icon='⏱️' title='Horário de Trabalho' theme={theme}>
            <p>Início: 08:00</p>
            <p>Fim: 17:00</p>
            <p>Intervalo: 12:00 - 13:00</p>
          </InfoCard>

          <InfoCard icon='📊' title='Resumo do Dia' theme={theme}>
            <p>Tempo trabalhado: 6h 30min</p>
            <p>Registros hoje: {timeRecords.length}</p>
            <p>Status: {isClockedIn ? 'Ativo' : 'Inativo'}</p>
          </InfoCard>
        </InfoGrid>

        <ActionButtons>
          <ActionButton
            variant='secondary'
            onClick={() => openModal('history')}
            icon='📋'
            theme={theme}
          >
            Histórico
          </ActionButton>
          <ActionButton
            variant='warning'
            onClick={handleBreak}
            icon='☕'
            theme={theme}
          >
            Intervalo
          </ActionButton>
          <ActionButton
            variant='success'
            onClick={() => openModal('details')}
            icon='📝'
            theme={theme}
          >
            Detalhes
          </ActionButton>
        </ActionButtons>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          modalType === 'history'
            ? 'Histórico de Registros'
            : modalType === 'details'
              ? 'Detalhes do Registro'
              : 'Registrar Intervalo'
        }
        buttonContainer={
          <>
            <ActionButton
              variant='secondary'
              onClick={() => setModalOpen(false)}
              theme={theme}
            >
              Fechar
            </ActionButton>
            {modalType === 'break' && (
              <ActionButton
                variant='warning'
                onClick={() => {
                  handleBreak();
                  setModalOpen(false);
                }}
                theme={theme}
              >
                Registrar Intervalo
              </ActionButton>
            )}
          </>
        }
      >
        {modalType === 'history' && (
          <HistoryList>
            {timeRecords.slice(0, 10).map(record => (
              <div key={record.id} className='history-item'>
                <span className='icon'>
                  {record.type === 'in'
                    ? '✅'
                    : record.type === 'out'
                      ? '❌'
                      : '☕'}
                </span>
                <div className='details'>
                  <p className='time'>
                    {record.timestamp.toLocaleString('pt-BR')}
                  </p>
                  <p className='location'>{record.location}</p>
                </div>
              </div>
            ))}
          </HistoryList>
        )}

        {modalType === 'details' && (
          <div>
            <p>
              Adicione observações, anexe arquivos ou registre horas extras.
            </p>
            <p>Esta funcionalidade será implementada em breve.</p>
          </div>
        )}

        {modalType === 'break' && (
          <div>
            <p>Registre seu intervalo de almoço ou pausa.</p>
            <p>Duração padrão: 1 hora</p>
          </div>
        )}
      </Modal>

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
    </PageContainer>
  );
}
