import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/alert-management.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton, UnifiedModal } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { OptimizedFormRow, OptimizedSectionTitle, OptimizedLabel, OptimizedHelpText, OptimizedButtonGroup } from '../components/shared/optimized-styles';


// Styled Components
const HelpText = styled.small`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const ButtonGroup = styled.div`
  margin-top: 1rem;
`;

// Interfaces
interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  date: string;
  time: string;
  frequency: Frequency;
  notificationType: NotificationType;
  notificationText: string;
  conditions?: AlertCondition[] | undefined;
  status: 'active' | 'inactive';
  createdAt: string;
  lastTriggered?: string;
  triggerCount: number;
}

interface AlertType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  category: string;
}

interface AlertCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
}

type Frequency = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
type NotificationType = 'email' | 'push' | 'sms' | 'all';

// Styled Components

const AlertStats = styled.div<{ $theme: any }>`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{
  $theme: any;
  $variant?: 'primary' | 'warning' | 'success' | 'danger';
}>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border-left: 4px solid
    ${props => {
      switch (props.$variant) {
        case 'primary':
          return props.$theme.colors.primary;
        case 'warning':
          return '#f39c12';
        case 'success':
          return '#2ecc71';
        case 'danger':
          return '#e74c3c';
        default:
          return props.$theme.colors.primary;
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px ${props => props.$theme.colors.shadow};
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const AlertsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const AlertCard = styled.div<{ $theme: any; $status: 'active' | 'inactive' }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid
    ${props =>
      props.$status === 'active'
        ? props.$theme.colors.primary + '20'
        : '#e0e0e0'};
  transition: all 0.3s ease;
  opacity: ${props => (props.$status === 'inactive' ? 0.7 : 1)};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.$theme.colors.shadow};
  }
`;

const AlertHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const AlertTypeBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  font-size: 0.8rem;
  font-weight: 600;
`;

const AlertStatus = styled.span<{ $status: 'active' | 'inactive' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => (props.$status === 'active' ? '#2ecc71' : '#95a5a6')};
  color: white;
`;

const AlertTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
`;

const AlertDescription = styled.p`
  margin: 0 0 1rem 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const AlertDateTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #5a6c7d;
`;

const AlertFrequency = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.85rem;
  color: #5a6c7d;
`;

const AlertActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const AlertUnifiedButton = styled.button<{
  $theme: any;
  $variant?: 'primary' | 'warning' | 'danger';
}>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props => {
    switch (props.$variant) {
      case 'warning':
        return '#f39c12';
      case 'danger':
        return '#e74c3c';
      default:
        return props.$theme.colors.primary;
    }
  }};
  color: white;

  &:hover {
    background: ${props => {
      switch (props.$variant) {
        case 'warning':
          return '#e67e22';
        case 'danger':
          return '#c0392b';
        default:
          return props.$theme.colors.primaryHover;
      }
    }};
    transform: translateY(-2px);
  }
`;

const CreateAlertSection = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
`;

const FormGroupFlex = styled(FormGroup)`
  flex: 1;
`;

const ConditionsSection = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const ConditionRow = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ConditionInput = styled.input<{ $theme: any }>`
  flex: 1;
  padding: 0.5rem;
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 4px;
  font-size: 0.85rem;
`;

const ConditionSelect = styled.select<{ $theme: any }>`
  padding: 0.5rem;
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 4px;
  font-size: 0.85rem;
  background: white;
`;

const AddConditionButton = styled.button<{ $theme: any }>`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: ${props => props.$theme.colors.primary};
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primaryHover};
  }
`;

const RemoveConditionButton = styled.button`
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  border: none;
  background: #e74c3c;
  color: white;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: #c0392b;
  }
`;

const NotificationPreview = styled.div<{ $theme: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}30;
`;

const PreviewTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const PreviewText = styled.p`
  margin: 0;
  color: #5a6c7d;
  font-size: 0.85rem;
  font-style: italic;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: #2c3e50;
  }

  .empty-description {
    margin: 0;
    font-size: 0.9rem;
  }
`;

export default function AlertManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [showConditions, setShowConditions] = useState(false);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const alertTypes: AlertType[] = [
    {
      id: '1',
      name: 'Vencimento de Documento',
      icon: <AccessibleEmoji emoji='📄' label='Documento' />,
      color: '#e74c3c',
      category: 'Documentos',
    },
    {
      id: '2',
      name: 'Pagamento Pendente',
      icon: <AccessibleEmoji emoji='💵' label='Pagamento' />,
      color: '#f39c12',
      category: 'Financeiro',
    },
    {
      id: '3',
      name: 'Tarefa Atrasada',
      icon: '⏰',
      color: '#e67e22',
      category: 'Tarefas',
    },
    {
      id: '4',
      name: 'Manutenção Preventiva',
      icon: <AccessibleEmoji emoji='🔧' label='Manutenção' />,
      color: '#3498db',
      category: 'Manutenção',
    },
    {
      id: '5',
      name: 'Reunião Importante',
      icon: <AccessibleEmoji emoji='📅' label='Calendário' />,
      color: '#9b59b6',
      category: 'Agenda',
    },
    {
      id: '6',
      name: 'Aniversário',
      icon: <AccessibleEmoji emoji='🎂' label='Aniversário' />,
      color: '#e91e63',
      category: 'Pessoal',
    },
    {
      id: '7',
      name: 'Backup do Sistema',
      icon: <AccessibleEmoji emoji='💾' label='Armazenar' />,
      color: '#607d8b',
      category: 'Sistema',
    },
    {
      id: '8',
      name: 'Limpeza Periódica',
      icon: '🧹',
      color: '#795548',
      category: 'Limpeza',
    },
  ];

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      title: 'Vencimento do Contrato',
      description: 'O contrato de prestação de serviços vence em 30 dias',
      type: alertTypes[0]!,
      date: '2024-02-15',
      time: '09:00',
      frequency: 'once',
      notificationType: 'email',
      notificationText:
        'O documento {{nome_documento}} vence em {{data_vencimento}}',
      status: 'active',
      createdAt: '2024-01-15',
      triggerCount: 0,
    },
    {
      id: '2',
      title: 'Pagamento da Mensalidade',
      description: 'Lembrete para pagamento da mensalidade da escola',
      type: alertTypes[1]!,
      date: '2024-01-25',
      time: '08:00',
      frequency: 'monthly',
      notificationType: 'push',
      notificationText:
        'Não esqueça do pagamento de R$ {{valor}} que vence em {{data_vencimento}}',
      status: 'active',
      createdAt: '2024-01-10',
      lastTriggered: '2024-01-25',
      triggerCount: 1,
    },
    {
      id: '3',
      title: 'Limpeza da Piscina',
      description: 'Manutenção semanal da piscina',
      type: alertTypes[7]!,
      date: '2024-01-28',
      time: '14:00',
      frequency: 'weekly',
      notificationType: 'all',
      notificationText: 'Hora da limpeza semanal da piscina',
      status: 'active',
      createdAt: '2024-01-20',
      lastTriggered: '2024-01-21',
      triggerCount: 1,
    },
  ]);

  const [newAlert, setNewAlert] = useState({
    title: '',
    description: '',
    type: '',
    date: '',
    time: '',
    frequency: 'once' as Frequency,
    notificationType: 'email' as NotificationType,
    notificationText: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    status: '',
  });

  const [conditions, setConditions] = useState<AlertCondition[]>([]);

  const handleCreateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlert.title.trim() || !newAlert.type) return;

    const alertType = alertTypes.find(t => t.id === newAlert.type);
    if (!alertType) return;

    const alert: Alert = {
      id: Date.now().toString(),
      title: newAlert.title,
      description: newAlert.description,
      type: alertType,
      date: newAlert.date,
      time: newAlert.time,
      frequency: newAlert.frequency,
      notificationType: newAlert.notificationType,
      notificationText: newAlert.notificationText,
      conditions: conditions.length > 0 ? conditions : undefined,
      status: 'active',
      createdAt:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      triggerCount: 0,
    };

    setAlerts(prev => [alert, ...prev]);
    setNewAlert({
      title: '',
      description: '',
      type: '',
      date: '',
      time: '',
      frequency: 'once',
      notificationType: 'email',
      notificationText: '',
    });
    setConditions([]);
    setShowConditions(false);
    toast.success('Alerta criado com sucesso!');
  };

  const handleEditAlert = (alert: Alert) => {
    setEditingAlert(alert);
    setNewAlert({
      title: alert.title,
      description: alert.description,
      type: alert.type.id,
      date: alert.date,
      time: alert.time,
      frequency: alert.frequency,
      notificationType: alert.notificationType,
      notificationText: alert.notificationText,
    });
    setConditions(alert.conditions || []);
    setShowConditions((alert.conditions || []).length > 0);
    setUnifiedModalOpen(true);
  };

  const handleUpdateAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAlert || !newAlert.title.trim() || !newAlert.type) return;

    const alertType = alertTypes.find(t => t.id === newAlert.type);
    if (!alertType) return;

    const updatedAlert: Alert = {
      ...editingAlert,
      title: newAlert.title,
      description: newAlert.description,
      type: alertType,
      date: newAlert.date,
      time: newAlert.time,
      frequency: newAlert.frequency,
      notificationType: newAlert.notificationType,
      notificationText: newAlert.notificationText,
      conditions: conditions.length > 0 ? conditions : undefined,
    };

    setAlerts(prev =>
      prev.map(alert => (alert.id === editingAlert.id ? updatedAlert : alert))
    );
    setUnifiedModalOpen(false);
    setEditingAlert(null);
    setNewAlert({
      title: '',
      description: '',
      type: '',
      date: '',
      time: '',
      frequency: 'once',
      notificationType: 'email',
      notificationText: '',
    });
    setConditions([]);
    setShowConditions(false);
    toast.success('Alerta atualizado com sucesso!');
  };

  const handleToggleAlertStatus = (id: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === id
          ? {
              ...alert,
              status: alert.status === 'active' ? 'inactive' : 'active',
            }
          : alert
      )
    );
    toast.success('Status do alerta alterado!');
  };

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
    toast.success('Alerta excluído com sucesso!');
  };

  const addCondition = () => {
    const newCondition: AlertCondition = {
      id: Date.now().toString(),
      field: '',
      operator: 'equals',
      value: '',
    };
    setConditions(prev => [...prev, newCondition]);
  };

  const removeCondition = (id: string) => {
    setConditions(prev => prev.filter(condition => condition.id !== id));
  };

  const updateCondition = (
    id: string,
    field: keyof AlertCondition,
    value: string
  ) => {
    setConditions(prev =>
      prev.map(condition =>
        condition.id === id ? { ...condition, [field]: value } : condition
      )
    );
  };

  const getFilteredAlerts = () => {
    return alerts.filter(alert => {
      const matchesSearch =
        !filters.search ||
        alert.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        alert.description.toLowerCase().includes(filters.search.toLowerCase());

      const matchesType = !filters.type || alert.type.id === filters.type;
      const matchesStatus = !filters.status || alert.status === filters.status;

      return matchesSearch && matchesType && matchesStatus;
    });
  };

  const getAlertStats = () => {
    const activeAlerts = alerts.filter(
      alert => alert.status === 'active'
    ).length;
    const inactiveAlerts = alerts.filter(
      alert => alert.status === 'inactive'
    ).length;
    const triggeredToday = alerts.filter(
      alert => alert.lastTriggered === new Date().toISOString().split('T')[0]
    ).length;
    const totalTriggers = alerts.reduce(
      (sum, alert) => sum + alert.triggerCount,
      0
    );

    return { activeAlerts, inactiveAlerts, triggeredToday, totalTriggers };
  };

  const generateNotificationPreview = () => {
    if (!newAlert.notificationText) return 'Digite o texto da notificação...';

    return newAlert.notificationText
      .replace('{{nome_documento}}', 'Contrato de Serviços')
      .replace('{{data_vencimento}}', '15/02/2024')
      .replace('{{valor}}', 'R$ 1.500,00');
  };

  const stats = getAlertStats();

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={stats.activeAlerts}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Gestão de Alertas'
        subtitle='Configure alertas personalizados para nunca perder eventos importantes'
      />

      {/* Estatísticas */}
      <AlertStats theme={theme}>
        <StatCard theme={theme} variant='primary'>
          <StatNumber>{stats.activeAlerts}</StatNumber>
          <StatLabel>Alertas Ativos</StatLabel>
        </StatCard>
        <StatCard theme={theme} variant='warning'>
          <StatNumber>{stats.triggeredToday}</StatNumber>
          <StatLabel>Disparados Hoje</StatLabel>
        </StatCard>
        <StatCard theme={theme} variant='success'>
          <StatNumber>{stats.totalTriggers}</StatNumber>
          <StatLabel>Total de Disparos</StatLabel>
        </StatCard>
        <StatCard theme={theme} variant='danger'>
          <StatNumber>{stats.inactiveAlerts}</StatNumber>
          <StatLabel>Alertas Inativos</StatLabel>
        </StatCard>
      </AlertStats>

      {/* Criar Novo Alerta */}
      <CreateAlertSection theme={theme}>
        <OptimizedSectionTitle>Criar Novo Alerta</OptimizedSectionTitle>
        <Form onSubmit={handleCreateAlert}>
          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Título do Alerta</OptimizedLabel>
              <Input
                theme={theme}
                type='text'
                value={newAlert.title}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Ex: Vencimento do Contrato'
                required
              />
            </FormGroupFlex>
            <FormGroupFlex>
              <OptimizedLabel htmlFor='alert-type'>Tipo de Alerta</OptimizedLabel>
              <Select
                id='alert-type'
                theme={theme}
                value={newAlert.type}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, type: e.target.value }))
                }
                required
                aria-label='Selecionar tipo de alerta'
                title='Selecionar tipo de alerta'
              >
                <option value=''>Selecionar tipo</option>
                {alertTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </Select>
            </FormGroupFlex>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Descrição</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={newAlert.description}
              onChange={e =>
                setNewAlert(prev => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder='Descreva o alerta...'
            />
          </FormGroup>

          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Data</OptimizedLabel>
              <Input
                theme={theme}
                type='date'
                value={newAlert.date}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, date: e.target.value }))
                }
                required
              />
            </FormGroupFlex>
            <FormGroupFlex>
              <OptimizedLabel>Hora</OptimizedLabel>
              <Input
                theme={theme}
                type='time'
                value={newAlert.time}
                onChange={e =>
                  setNewAlert(prev => ({ ...prev, time: e.target.value }))
                }
                required
              />
            </FormGroupFlex>
            <FormGroupFlex>
              <OptimizedLabel>Frequência</OptimizedLabel>
              <Select
                theme={theme}
                value={newAlert.frequency}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    frequency: e.target.value as Frequency,
                  }))
                }
                aria-label='Selecionar frequência'
                title='Selecionar frequência'
              >
                <option value='once'>Uma vez</option>
                <option value='daily'>Diariamente</option>
                <option value='weekly'>Semanalmente</option>
                <option value='monthly'>Mensalmente</option>
                <option value='yearly'>Anualmente</option>
              </Select>
            </FormGroupFlex>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Tipo de Notificação</OptimizedLabel>
              <Select
                theme={theme}
                value={newAlert.notificationType}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    notificationType: e.target.value as NotificationType,
                  }))
                }
                aria-label='Selecionar tipo de notificação'
                title='Selecionar tipo de notificação'
              >
                <option value='email'>E-mail</option>
                <option value='push'>Notificação Push</option>
                <option value='sms'>SMS</option>
                <option value='all'>Todos os tipos</option>
              </Select>
            </FormGroupFlex>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Texto da Notificação</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={newAlert.notificationText}
              onChange={e =>
                setNewAlert(prev => ({
                  ...prev,
                  notificationText: e.target.value,
                }))
              }
              placeholder='Ex: O documento {{nome_documento}} vence em {{data_vencimento}}'
            />
            <OptimizedHelpText>
              Use variáveis como {'{'}nome_documento{'}'}, {'{'}
              data_vencimento{'}'}, {'{'}valor{'}'} para personalizar
            </OptimizedHelpText>
          </FormGroup>

          {newAlert.notificationText && (
            <NotificationPreview theme={theme}>
              <PreviewTitle>Preview da Notificação:</PreviewTitle>
              <PreviewText>{generateNotificationPreview()}</PreviewText>
            </NotificationPreview>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton
              type='button'
              variant='secondary'
              onClick={() => setShowConditions(!showConditions)}
            >
              {showConditions ? 'Ocultar' : 'Adicionar'} Condições
            </UnifiedButton>
          </OptimizedButtonGroup>

          {showConditions && (
            <ConditionsSection>
              <OptimizedSectionTitle>Condições do Alerta</OptimizedSectionTitle>
              {conditions.map(condition => (
                <ConditionRow key={condition.id}>
                  <ConditionInput
                    theme={theme}
                    value={condition.field}
                    onChange={e =>
                      updateCondition(condition.id, 'field', e.target.value)
                    }
                    placeholder='Campo (ex: valor, status)'
                  />
                  <ConditionSelect
                    theme={theme}
                    value={condition.operator}
                    onChange={e =>
                      updateCondition(
                        condition.id,
                        'operator',
                        e.target.value as any
                      )
                    }
                    aria-label='Selecionar operador da condição'
                    title='Selecionar operador da condição'
                  >
                    <option value='equals'>Igual a</option>
                    <option value='greater_than'>Maior que</option>
                    <option value='less_than'>Menor que</option>
                    <option value='contains'>Contém</option>
                  </ConditionSelect>
                  <ConditionInput
                    theme={theme}
                    value={condition.value}
                    onChange={e =>
                      updateCondition(condition.id, 'value', e.target.value)
                    }
                    placeholder='Valor'
                  />
                  <RemoveConditionButton
                    onClick={() => removeCondition(condition.id)}
                  >
                    <AccessibleEmoji emoji='✕' label='Remover' />
                  </RemoveConditionButton>
                </ConditionRow>
              ))}
              <AddConditionButton
                theme={theme}
                type='button'
                onClick={addCondition}
              >
                + Adicionar Condição
              </AddConditionButton>
            </ConditionsSection>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton type='submit' variant='primary' theme={theme}>
              <AccessibleEmoji emoji='➕' label='Novo' /> Criar Alerta
            </UnifiedButton>
          </OptimizedButtonGroup>
        </Form>
      </CreateAlertSection>

      {/* Filtros */}
      <FilterSection theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Buscar Alertas</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o título ou descrição...'
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo</OptimizedLabel>
            <Select
              theme={theme}
              value={filters.type}
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              aria-label='Filtrar por tipo'
              title='Filtrar por tipo'
            >
              <option value=''>Todos os tipos</option>
              {alertTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Status</OptimizedLabel>
            <Select
              theme={theme}
              value={filters.status}
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
              aria-label='Filtrar por status'
              title='Filtrar por status'
            >
              <option value=''>Todos os status</option>
              <option value='active'>Ativo</option>
              <option value='inactive'>Inativo</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Lista de Alertas */}
      {getFilteredAlerts().length === 0 ? (
        <EmptyState>
          <div className='empty-icon'>
            <AccessibleEmoji emoji='🔔' label='Notificação' />
          </div>
          <h3 className='empty-title'>Nenhum alerta encontrado</h3>
          <p className='empty-description'>
            Crie seu primeiro alerta para começar a receber notificações
            importantes.
          </p>
        </EmptyState>
      ) : (
        <AlertsGrid>
          {getFilteredAlerts().map(alert => (
            <AlertCard key={alert.id} theme={theme} $status={alert.status}>
              <AlertHeader>
                <AlertTypeBadge $color={alert.type.color}>
                  <span>{alert.type.icon}</span>
                  <span>{alert.type.name}</span>
                </AlertTypeBadge>
                <AlertStatus $status={alert.status}>
                  {alert.status === 'active' ? 'Ativo' : 'Inativo'}
                </AlertStatus>
              </AlertHeader>

              <AlertTitle>{alert.title}</AlertTitle>
              <AlertDescription>{alert.description}</AlertDescription>

              <AlertDateTime>
                <AccessibleEmoji emoji='📅' label='Calendário' />{' '}
                {new Date(alert.date).toLocaleDateString('pt-BR')} às{' '}
                {alert.time}
              </AlertDateTime>

              <AlertFrequency>
                <AccessibleEmoji emoji='🔄' label='Sincronizar' />{' '}
                {alert.frequency === 'once'
                  ? 'Uma vez'
                  : alert.frequency === 'daily'
                    ? 'Diariamente'
                    : alert.frequency === 'weekly'
                      ? 'Semanalmente'
                      : alert.frequency === 'monthly'
                        ? 'Mensalmente'
                        : 'Anualmente'}
              </AlertFrequency>

              {alert.lastTriggered && (
                <OptimizedHelpText>
                  Último disparo:{' '}
                  {new Date(alert.lastTriggered).toLocaleDateString('pt-BR')}
                </OptimizedHelpText>
              )}

              <OptimizedHelpText>Disparos: {alert.triggerCount}</OptimizedHelpText>

              <AlertActions>
                <AlertUnifiedButton
                  theme={theme}
                  onClick={() => handleEditAlert(alert)}
                >
                  <AccessibleEmoji emoji='✏' label='Editar' /> Editar
                </AlertUnifiedButton>
                <AlertUnifiedButton
                  theme={theme}
                  variant='warning'
                  onClick={() => handleToggleAlertStatus(alert.id)}
                >
                  {alert.status === 'active' ? '⏸️ Pausar' : '▶️ Ativar'}
                </AlertUnifiedButton>
                <AlertUnifiedButton
                  theme={theme}
                  variant='danger'
                  onClick={() => handleDeleteAlert(alert.id)}
                >
                  <AccessibleEmoji emoji='❌' label='Excluir' /> Excluir
                </AlertUnifiedButton>
              </AlertActions>
            </AlertCard>
          ))}
        </AlertsGrid>
      )}

      {/* UnifiedModal de Edição */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setEditingAlert(null);
          setNewAlert({
            title: '',
            description: '',
            type: '',
            date: '',
            time: '',
            frequency: 'once',
            notificationType: 'email',
            notificationText: '',
          });
          setConditions([]);
          setShowConditions(false);
        }}
        title={
          editingAlert
            ? `Editar Alerta: ${editingAlert.title}`
            : 'Editar Alerta'
        }
      >
        {editingAlert && (
          <Form onSubmit={handleUpdateAlert}>
            <OptimizedFormRow>
              <FormGroupFlex>
                <OptimizedLabel>Título do Alerta</OptimizedLabel>
                <Input
                  theme={theme}
                  type='text'
                  value={newAlert.title}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, title: e.target.value }))
                  }
                  required
                />
              </FormGroupFlex>
              <FormGroupFlex>
                <OptimizedLabel>Tipo de Alerta</OptimizedLabel>
                <Select
                  theme={theme}
                  value={newAlert.type}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, type: e.target.value }))
                  }
                  required
                  aria-label='Selecionar tipo de alerta'
                  title='Selecionar tipo de alerta'
                >
                  {alertTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.icon} {type.name}
                    </option>
                  ))}
                </Select>
              </FormGroupFlex>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Descrição</OptimizedLabel>
              <Input
                theme={theme}
                type='text'
                value={newAlert.description}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
              />
            </FormGroup>

            <OptimizedFormRow>
              <FormGroupFlex>
                <OptimizedLabel>Data</OptimizedLabel>
                <Input
                  theme={theme}
                  type='date'
                  value={newAlert.date}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, date: e.target.value }))
                  }
                  required
                />
              </FormGroupFlex>
              <FormGroupFlex>
                <OptimizedLabel>Hora</OptimizedLabel>
                <Input
                  theme={theme}
                  type='time'
                  value={newAlert.time}
                  onChange={e =>
                    setNewAlert(prev => ({ ...prev, time: e.target.value }))
                  }
                  required
                />
              </FormGroupFlex>
              <FormGroupFlex>
                <OptimizedLabel>Frequência</OptimizedLabel>
                <Select
                  theme={theme}
                  value={newAlert.frequency}
                  onChange={e =>
                    setNewAlert(prev => ({
                      ...prev,
                      frequency: e.target.value as Frequency,
                    }))
                  }
                  aria-label='Selecionar frequência'
                  title='Selecionar frequência'
                >
                  <option value='once'>Uma vez</option>
                  <option value='daily'>Diariamente</option>
                  <option value='weekly'>Semanalmente</option>
                  <option value='monthly'>Mensalmente</option>
                  <option value='yearly'>Anualmente</option>
                </Select>
              </FormGroupFlex>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroupFlex>
                <OptimizedLabel>Tipo de Notificação</OptimizedLabel>
                <Select
                  theme={theme}
                  value={newAlert.notificationType}
                  onChange={e =>
                    setNewAlert(prev => ({
                      ...prev,
                      notificationType: e.target.value as NotificationType,
                    }))
                  }
                  aria-label='Selecionar tipo de notificação'
                  title='Selecionar tipo de notificação'
                >
                  <option value='email'>E-mail</option>
                  <option value='push'>Notificação Push</option>
                  <option value='sms'>SMS</option>
                  <option value='all'>Todos os tipos</option>
                </Select>
              </FormGroupFlex>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Texto da Notificação</OptimizedLabel>
              <Input
                theme={theme}
                type='text'
                value={newAlert.notificationText}
                onChange={e =>
                  setNewAlert(prev => ({
                    ...prev,
                    notificationText: e.target.value,
                  }))
                }
              />
            </FormGroup>

            <OptimizedButtonGroup>
              <UnifiedButton type='submit' variant='primary' theme={theme}>
                <AccessibleEmoji emoji='💾' label='Armazenar' /> Salvar
                Alterações
              </UnifiedButton>
              <UnifiedButton
                type='button'
                variant='secondary'
                theme={theme}
                onClick={() => {
                  setUnifiedModalOpen(false);
                  setEditingAlert(null);
                }}
              >
                <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
              </UnifiedButton>
            </OptimizedButtonGroup>
          </Form>
        )}
      </UnifiedModal>

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
