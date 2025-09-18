import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { ActionButton } from '../components/ActionButton';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { getAuditService } from '../services/auditService';
import { getBackupService } from '../services/backupService';
import { getWebhookService } from '../services/webhookService';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Component para flex container
const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: ${fadeIn} 0.6s ease-out;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  margin-left: 280px;
  max-width: calc(100vw - 280px);
  overflow-x: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#666'};
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
`;

const StatusIndicator = styled.div<{ $status: string; $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'online':
        return props.$theme?.colors?.success || '#90EE90';
      case 'warning':
        return '#f39c12';
      case 'error':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
  animation: ${props => (props.$status === 'online' ? pulse : 'none')} 2s
    infinite;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const MetricCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props => props.$theme?.colors?.primary || '#29ABE2'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const MetricTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricValue = styled.div<{ $theme: any }>`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const MetricSubtext = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ChartContainer = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 400px;
  overflow-y: auto;
`;

const ActivityItem = styled.div<{ $type: string; $theme: any }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'success':
          return props.$theme?.colors?.success || '#90EE90';
        case 'error':
          return '#e74c3c';
        case 'warning':
          return '#f39c12';
        default:
          return '#95a5a6';
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateX(5px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const ActivityIcon = styled.div`
  font-size: 1.5rem;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const ActivityDescription = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #95a5a6;
  text-align: right;
`;

const AlertBanner = styled.div<{ $type: string; $theme: any }>`
  padding: 1rem 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background: ${props => {
    switch (props.$type) {
      case 'warning':
        return '#fff3cd';
      case 'error':
        return '#f8d7da';
      case 'success':
        return '#d4edda';
      case 'info':
        return '#d1ecf1';
      default:
        return '#e2e3e5';
    }
  }};
  border-left: 4px solid
    ${props => {
      switch (props.$type) {
        case 'warning':
          return '#ffc107';
        case 'error':
          return '#dc3545';
        case 'success':
          return '#28a745';
        case 'info':
          return '#17a2b8';
        default:
          return '#6c757d';
      }
    }};
`;

const AlertIcon = styled.span`
  font-size: 1.5rem;
`;

const AlertText = styled.div`
  flex: 1;
  color: #2c3e50;
  font-weight: 500;
`;

const RefreshButton = styled(ActionButton)<{ $theme: any }>`
  background: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(41, 171, 226, 0.3);
  }
`;

const MonitoringDashboard: React.FC = () => {
  const router = useRouter();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState('online');
  const [metrics, setMetrics] = useState({
    eventosEnviados: 0,
    eventosProcessados: 0,
    eventosComErro: 0,
    webhooksAtivos: 0,
    backupsRealizados: 0,
    logsAuditoria: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  const loadMetrics = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simular carregamento de métricas
      await new Promise(resolve => setTimeout(resolve, 1000));

      const webhookService = getWebhookService();
      const backupService = getBackupService();
      const auditService = getAuditService();

      const webhookStats = webhookService.getWebhookStats();
      const backupStats = backupService.getBackupStats();
      const auditStats = auditService.getStats(30);

      setMetrics({
        eventosEnviados: Math.floor(Math.random() * 1000) + 500,
        eventosProcessados: Math.floor(Math.random() * 800) + 400,
        eventosComErro: Math.floor(Math.random() * 50) + 10,
        webhooksAtivos: webhookStats.ativos,
        backupsRealizados: backupStats.sucesso,
        logsAuditoria: auditStats.total,
      });

      // Simular atividade recente
      const mockActivity = [
        {
          id: '1',
          type: 'success',
          icon: <AccessibleEmoji emoji='✅' label='Sucesso' />,
          title: 'Evento S-2200 processado',
          description: 'Protocolo ESOCIAL-123456789',
          time: '2 minutos atrás',
        },
        {
          id: '2',
          type: 'warning',
          icon: <AccessibleEmoji emoji='⚠' label='Aviso' />,
          title: 'Webhook com falha',
          description: '3 tentativas falharam',
          time: '15 minutos atrás',
        },
        {
          id: '3',
          type: 'success',
          icon: <AccessibleEmoji emoji='💾' label='Armazenar' />,
          title: 'Backup realizado',
          description: 'Backup completo - 2.5MB',
          time: '1 hora atrás',
        },
        {
          id: '4',
          type: 'error',
          icon: <AccessibleEmoji emoji='❌' label='Erro' />,
          title: 'Erro no certificado',
          description: 'Certificado expirado',
          time: '2 horas atrás',
        },
      ];

      setRecentActivity(mockActivity);

      // Simular alertas
      const mockAlerts = [
        {
          type: 'warning',
          icon: <AccessibleEmoji emoji='⚠' label='Aviso' />,
          text: '3 webhooks com falha nas últimas 24 horas',
        },
        {
          type: 'info',
          icon: 'ℹ️',
          text: 'Próximo backup agendado para 02:00',
        },
      ];

      setAlerts(mockAlerts);

      // Determinar status do sistema
      if (metrics.eventosComErro > 50) {
        setSystemStatus('error');
      } else if (metrics.eventosComErro > 20) {
        setSystemStatus('warning');
      } else {
        setSystemStatus('online');
      }
    } catch (error) {
      toast.error('Erro ao carregar métricas');
    } finally {
      setIsLoading(false);
    }
  }, [metrics.eventosComErro]);

  const handleRefresh = () => {
    loadMetrics();
    toast.success('Métricas atualizadas!');
  };

  useEffect(() => {
    loadMetrics();

    // Atualizar métricas a cada 30 segundos
    const interval = setInterval(loadMetrics, 30000);

    return () => clearInterval(interval);
  }, [loadMetrics]);

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Sistema Online';
      case 'warning':
        return 'Atenção Necessária';
      case 'error':
        return 'Sistema com Problemas';
      default:
        return 'Status Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return '🟢';
      case 'warning':
        return '🟡';
      case 'error':
        return '🔴';
      default:
        return '⚪';
    }
  };

  return (
    <Container>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPath={router.pathname}
      />
      <MainContent>
        <WelcomeSection
          theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={alerts.length}
          onNotificationClick={() => {}}
        />

        <Header>
          <div>
            <Title>
              <AccessibleEmoji emoji='📊' label='Dashboard' /> Dashboard de
              Monitoramento
            </Title>
            <Subtitle>
              Acompanhe o status e performance do sistema eSocial
            </Subtitle>
          </div>
          <FlexContainer>
            <StatusIndicator $status={systemStatus} $theme={theme}>
              {getStatusIcon(systemStatus)} {getStatusText(systemStatus)}
            </StatusIndicator>
            <RefreshButton
              variant='primary'
              $theme={theme}
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? '⏳' : '🔄'} Atualizar
            </RefreshButton>
          </FlexContainer>
        </Header>

        {/* Alertas */}
        {alerts.map((alert, index) => (
          <AlertBanner key={index} $type={alert.type} $theme={theme}>
            <AlertIcon>{alert.icon}</AlertIcon>
            <AlertText>{alert.text}</AlertText>
          </AlertBanner>
        ))}

        {/* Métricas Principais */}
        <DashboardGrid>
          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Eventos Enviados
            </MetricTitle>
            <MetricValue $theme={theme}>
              {metrics.eventosEnviados.toLocaleString()}
            </MetricValue>
            <MetricSubtext>
              Total de eventos enviados para eSocial
            </MetricSubtext>
          </MetricCard>

          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='✅' label='Sucesso' /> Eventos Processados
            </MetricTitle>
            <MetricValue $theme={theme}>
              {metrics.eventosProcessados.toLocaleString()}
            </MetricValue>
            <MetricSubtext>Eventos processados com sucesso</MetricSubtext>
          </MetricCard>

          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='❌' label='Erro' /> Eventos com Erro
            </MetricTitle>
            <MetricValue $theme={theme}>
              {metrics.eventosComErro.toLocaleString()}
            </MetricValue>
            <MetricSubtext>Eventos que falharam no processamento</MetricSubtext>
          </MetricCard>

          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='🔗' label='Link' /> Webhooks Ativos
            </MetricTitle>
            <MetricValue $theme={theme}>{metrics.webhooksAtivos}</MetricValue>
            <MetricSubtext>Webhooks configurados e funcionando</MetricSubtext>
          </MetricCard>

          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='💾' label='Armazenar' /> Backups
              Realizados
            </MetricTitle>
            <MetricValue $theme={theme}>
              {metrics.backupsRealizados}
            </MetricValue>
            <MetricSubtext>Backups executados com sucesso</MetricSubtext>
          </MetricCard>

          <MetricCard $theme={theme}>
            <MetricTitle>
              <AccessibleEmoji emoji='📋' label='Checklist' /> Logs de Auditoria
            </MetricTitle>
            <MetricValue $theme={theme}>
              {metrics.logsAuditoria.toLocaleString()}
            </MetricValue>
            <MetricSubtext>Logs gerados nos últimos 30 dias</MetricSubtext>
          </MetricCard>
        </DashboardGrid>

        {/* Atividade Recente */}
        <ChartContainer>
          <ChartTitle>
            <AccessibleEmoji emoji='🕒' label='Tempo' /> Atividade Recente
          </ChartTitle>
          <ActivityList>
            {recentActivity.map(activity => (
              <ActivityItem
                key={activity.id}
                $type={activity.type}
                $theme={theme}
              >
                <ActivityIcon>{activity.icon}</ActivityIcon>
                <ActivityContent>
                  <ActivityTitle>{activity.title}</ActivityTitle>
                  <ActivityDescription>
                    {activity.description}
                  </ActivityDescription>
                </ActivityContent>
                <ActivityTime>{activity.time}</ActivityTime>
              </ActivityItem>
            ))}
          </ActivityList>
        </ChartContainer>
      </MainContent>
    </Container>
  );
};

export default MonitoringDashboard;
