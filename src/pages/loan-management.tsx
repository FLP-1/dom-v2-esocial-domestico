import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/loan-management.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { UnifiedButton } from '../components/unified';
import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
import { UnifiedUnifiedModal } from '../components/unified';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { UnifiedButton, UnifiedModal, UnifiedCard } from '../components/unified';
import { OptimizedFormRow, OptimizedLabel, OptimizedButtonGroup } from '../components/shared/optimized-styles';


// Styled Components para substituir estilos inline
const ButtonGroup = styled.div`
  margin-top: 1.5rem;
`;

const UnifiedModalSection = styled.div`
  margin-bottom: 1.5rem;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

const FlexRowWithMargin = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

// Interfaces
interface LoanRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: 'loan' | 'advance';
  amount: number;
  installments: number;
  dueDate: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  requestDate: string;
  approvalDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  monthlyPayment: number;
  interestRate: number;
  totalAmount: number;
}

interface LoanSummary {
  totalPending: number;
  totalApproved: number;
  totalPaid: number;
  totalOutstanding: number;
  nextPaymentDate?: string;
  nextPaymentAmount?: number;
}

// Styled Components

const SummarySection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const SummaryTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const SummaryCard = styled.div<{
  $theme: any;
  $variant?: 'primary' | 'success' | 'warning' | 'info';
}>`
  background: ${props => {
    switch (props.$variant) {
      case 'primary':
        return 'rgba(41, 171, 226, 0.1)';
      case 'success':
        return 'rgba(144, 238, 144, 0.1)';
      case 'warning':
        return 'rgba(255, 193, 7, 0.1)';
      case 'info':
        return 'rgba(52, 152, 219, 0.1)';
      default:
        return 'rgba(255, 255, 255, 0.8)';
    }
  }};
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${props => {
      switch (props.$variant) {
        case 'primary':
          return 'rgba(41, 171, 226, 0.3)';
        case 'success':
          return 'rgba(144, 238, 144, 0.3)';
        case 'warning':
          return 'rgba(255, 193, 7, 0.3)';
        case 'info':
          return 'rgba(52, 152, 219, 0.3)';
        default:
          return '#e0e0e0';
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  }
`;

const SummaryCardTitle = styled.h3`
  font-size: 0.9rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SummaryValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Montserrat', sans-serif;
`;

const SummaryDetails = styled.div`
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const RequestSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const RequestSectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FormGroupFlex = styled(FormGroup)`
  flex: 1;
`;

const CurrencyInput = styled(Input)`
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;

const ConditionsSection = styled.div<{ $theme: any }>`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  border: 1px solid #e0e0e0;
`;

const ConditionsTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
`;

const ConditionRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;

  &:last-child {
    margin-bottom: 0;
    padding-top: 0.75rem;
    border-top: 1px solid #e0e0e0;
    font-weight: 600;
  }
`;

const ConditionLabel = styled.span`
  color: #5a6c7d;
`;

const ConditionValue = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const RequestsSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const RequestsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const RequestsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
`;

const RequestCard = styled.div<{
  $theme: any;
  $status: 'pending' | 'approved' | 'rejected' | 'paid';
}>`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${props => {
      switch (props.$status) {
        case 'pending':
          return '#f39c12';
        case 'approved':
          return '#2ecc71';
        case 'rejected':
          return '#e74c3c';
        case 'paid':
          return '#95a5a6';
        default:
          return '#e0e0e0';
      }
    }};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  }
`;

const RequestHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const RequestType = styled.div<{ $type: 'loan' | 'advance' }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => (props.$type === 'loan' ? '#3498db20' : '#2ecc7120')};
  color: ${props => (props.$type === 'loan' ? '#3498db' : '#2ecc71')};
  font-size: 0.8rem;
  font-weight: 600;
`;

const RequestStatus = styled.span<{
  $status: 'pending' | 'approved' | 'rejected' | 'paid';
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#f39c12';
      case 'approved':
        return '#2ecc71';
      case 'rejected':
        return '#e74c3c';
      case 'paid':
        return '#95a5a6';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

const RequestInfo = styled.div`
  margin-bottom: 1rem;
`;

const RequestTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const RequestDetails = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const RequestAmount = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Montserrat', sans-serif;
  margin-top: 0.5rem;
`;

const RequestActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const RequestUnifiedButton = styled.button<{
  $theme: any;
  $variant?: 'primary' | 'secondary' | 'success' | 'danger';
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
      case 'secondary':
        return '#95a5a6';
      case 'success':
        return '#2ecc71';
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
        case 'secondary':
          return '#7f8c8d';
        case 'success':
          return '#27ae60';
        case 'danger':
          return '#c0392b';
        default:
          return props.$theme.colors.primaryHover;
      }
    }};
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ApprovalSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const ApprovalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
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

const TermsSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const TermsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const TermsContent = styled.div`
  font-size: 0.9rem;
  color: #5a6c7d;
  line-height: 1.6;

  h3 {
    color: #2c3e50;
    margin: 1.5rem 0 0.75rem 0;
    font-size: 1rem;
    font-weight: 600;
  }

  ul {
    margin: 0.75rem 0;
    padding-left: 1.5rem;
  }

  li {
    margin-bottom: 0.5rem;
  }
`;

export default function LoanManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LoanRequest | null>(
    null
  );
  const [showApprovalUnifiedModal, setShowApprovalUnifiedModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>(
    'approve'
  );

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const [loanSummary] = useState<LoanSummary>({
    totalPending: 2500,
    totalApproved: 5000,
    totalPaid: 3000,
    totalOutstanding: 2000,
    nextPaymentDate: '2024-02-15',
    nextPaymentAmount: 500,
  });

  const [requests, setRequests] = useState<LoanRequest[]>([
    {
      id: '1',
      employeeId: '1',
      employeeName: 'Maria Santos',
      type: 'advance',
      amount: 1000,
      installments: 1,
      dueDate: '2024-02-15',
      justification: 'Emergência médica familiar',
      status: 'pending',
      requestDate: '2024-01-15',
      monthlyPayment: 1000,
      interestRate: 0,
      totalAmount: 1000,
    },
    {
      id: '2',
      employeeId: '2',
      employeeName: 'Ana Costa',
      type: 'loan',
      amount: 3000,
      installments: 6,
      dueDate: '2024-07-15',
      justification: 'Reforma da casa',
      status: 'approved',
      requestDate: '2024-01-10',
      approvalDate: '2024-01-12',
      approvedBy: 'João Silva',
      monthlyPayment: 550,
      interestRate: 2.5,
      totalAmount: 3300,
    },
    {
      id: '3',
      employeeId: '1',
      employeeName: 'Maria Santos',
      type: 'loan',
      amount: 2000,
      installments: 4,
      dueDate: '2024-05-15',
      justification: 'Compra de eletrodomésticos',
      status: 'paid',
      requestDate: '2023-12-01',
      approvalDate: '2023-12-03',
      approvedBy: 'João Silva',
      monthlyPayment: 500,
      interestRate: 2.0,
      totalAmount: 2000,
    },
  ]);

  const [newRequest, setNewRequest] = useState({
    type: 'advance' as 'loan' | 'advance',
    amount: '',
    installments: 1,
    justification: '',
  });

  const [filters, setFilters] = useState({
    status: '',
    type: '',
    employee: '',
  });

  const [approvalComment, setApprovalComment] = useState('');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRequest.amount || !newRequest.justification) return;

    const amount = parseFloat(
      newRequest.amount.replace(/[^\d,]/g, '').replace(',', '.')
    );
    const interestRate = newRequest.type === 'loan' ? 2.5 : 0;
    const totalAmount =
      newRequest.type === 'loan' ? amount * (1 + interestRate / 100) : amount;
    const monthlyPayment = totalAmount / newRequest.installments;

    const request: LoanRequest = {
      id: Date.now().toString(),
      employeeId: currentProfile?.id || '1',
      employeeName: currentProfile?.name || 'Usuário',
      type: newRequest.type,
      amount,
      installments: newRequest.installments,
      dueDate: new Date(
        Date.now() + newRequest.installments * 30 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0]!,
      justification: newRequest.justification,
      status: 'pending',
      requestDate: new Date().toISOString().split('T')[0]!,
      monthlyPayment,
      interestRate,
      totalAmount,
    };

    setRequests(prev => [request, ...prev]);
    setNewRequest({
      type: 'advance',
      amount: '',
      installments: 1,
      justification: '',
    });
    toast.success('Solicitação enviada com sucesso!');
  };

  const handleViewRequest = (request: LoanRequest) => {
    setSelectedRequest(request);
    setUnifiedModalOpen(true);
  };

  const handleCancelRequest = (requestId: string) => {
    setRequests(prev => prev.filter(req => req.id !== requestId));
    toast.success('Solicitação cancelada!');
  };

  const handleApprovalAction = (
    requestId: string,
    action: 'approve' | 'reject'
  ) => {
    setSelectedRequest(requests.find(req => req.id === requestId) || null);
    setApprovalAction(action);
    setShowApprovalUnifiedModal(true);
  };

  const handleConfirmApproval = () => {
    if (!selectedRequest) return;

    const updatedRequest: LoanRequest = {
      ...selectedRequest,
      status: approvalAction === 'approve' ? 'approved' : 'rejected',
      approvalDate: new Date().toISOString().split('T')[0]!,
      approvedBy: currentProfile?.name || 'Usuário',
      ...(approvalAction === 'reject' && { rejectionReason: approvalComment }),
    };

    setRequests(prev =>
      prev.map(req => (req.id === selectedRequest.id ? updatedRequest : req))
    );
    setShowApprovalUnifiedModal(false);
    setSelectedRequest(null);
    setApprovalComment('');
    toast.success(
      `Solicitação ${approvalAction === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`
    );
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^\d]/g, '');
    const formattedValue = (parseInt(numericValue) / 100).toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
    return formattedValue;
  };

  const getRequestTypeName = (type: 'loan' | 'advance') => {
    return type === 'loan' ? 'Empréstimo' : 'Adiantamento';
  };

  const getRequestTypeIcon = (type: 'loan' | 'advance') => {
    return type === 'loan' ? (
      <AccessibleEmoji emoji='💵' label='Pagamento' />
    ) : (
      <AccessibleEmoji emoji='⚡' label='Rápido' />
    );
  };

  const getStatusName = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'approved':
        return 'Aprovado';
      case 'rejected':
        return 'Rejeitado';
      case 'paid':
        return 'Pago';
      default:
        return status;
    }
  };

  const getFilteredRequests = () => {
    return requests.filter(request => {
      const matchesStatus =
        !filters.status || request.status === filters.status;
      const matchesType = !filters.type || request.type === filters.type;
      const matchesEmployee =
        !filters.employee ||
        request.employeeName
          .toLowerCase()
          .includes(filters.employee.toLowerCase());
      return matchesStatus && matchesType && matchesEmployee;
    });
  };

  const calculateConditions = () => {
    if (!newRequest.amount) return null;

    const amount = parseFloat(
      newRequest.amount.replace(/[^\d,]/g, '').replace(',', '.')
    );
    const interestRate = newRequest.type === 'loan' ? 2.5 : 0;
    const totalAmount =
      newRequest.type === 'loan' ? amount * (1 + interestRate / 100) : amount;
    const monthlyPayment = totalAmount / newRequest.installments;

    return {
      amount,
      interestRate,
      totalAmount,
      monthlyPayment,
      dueDate: new Date(
        Date.now() + newRequest.installments * 30 * 24 * 60 * 60 * 1000
      ).toLocaleDateString('pt-BR'),
    };
  };

  const conditions = calculateConditions();

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
          notificationCount={
            requests.filter(r => r.status === 'pending').length
          }
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Gestão de Empréstimos e Adiantamentos'
        subtitle='Solicite, aprove e gerencie empréstimos e adiantamentos salariais'
      />

      {/* Resumo */}
      <SummarySection theme={theme}>
        <SummaryTitle>Resumo Financeiro</SummaryTitle>
        <SummaryGrid>
          <SummaryCard theme={theme} variant='warning'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='⏳' label='Carregando' /> Pendentes
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(loanSummary.totalPending)}
            </SummaryValue>
            <SummaryDetails>Solicitações aguardando aprovação</SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='success'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='✅' label='Sucesso' /> Aprovados
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(loanSummary.totalApproved)}
            </SummaryValue>
            <SummaryDetails>Valor total aprovado</SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='info'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Pagamento' /> Em Aberto
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(loanSummary.totalOutstanding)}
            </SummaryValue>
            <SummaryDetails>Valor ainda não pago</SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='primary'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='📅' label='Calendário' /> Próximo
              Pagamento
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(loanSummary.nextPaymentAmount || 0)}
            </SummaryValue>
            <SummaryDetails>
              {loanSummary.nextPaymentDate &&
                `Vencimento: ${new Date(loanSummary.nextPaymentDate).toLocaleDateString('pt-BR')}`}
            </SummaryDetails>
          </SummaryCard>
        </SummaryGrid>
      </SummarySection>

      {/* Formulário de Solicitação */}
      <RequestSection theme={theme}>
        <RequestSectionTitle>Nova Solicitação</RequestSectionTitle>
        <Form onSubmit={handleSubmitRequest}>
          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Tipo de Operação</OptimizedLabel>
              <Select
                theme={theme}
                value={newRequest.type}
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    type: e.target.value as 'loan' | 'advance',
                  }))
                }
                aria-label='Selecionar tipo de operação'
                title='Selecionar tipo de operação'
              >
                <option value='advance'>Adiantamento de Salário</option>
                <option value='loan'>Empréstimo</option>
              </Select>
            </FormGroupFlex>
            <FormGroupFlex>
              <OptimizedLabel>Valor Solicitado</OptimizedLabel>
              <CurrencyInput
                theme={theme}
                type='text'
                value={newRequest.amount}
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    amount: formatCurrencyInput(e.target.value),
                  }))
                }
                placeholder='R$ 0,00'
                required
              />
            </FormGroupFlex>
            <FormGroupFlex>
              <OptimizedLabel>Parcelas</OptimizedLabel>
              <Input
                theme={theme}
                type='number'
                min='1'
                max={newRequest.type === 'advance' ? '1' : '12'}
                value={newRequest.installments}
                onChange={e =>
                  setNewRequest(prev => ({
                    ...prev,
                    installments: parseInt(e.target.value) || 1,
                  }))
                }
                required
              />
            </FormGroupFlex>
          </OptimizedFormRow>

          <FormGroup>
            <OptimizedLabel>Justificativa</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={newRequest.justification}
              onChange={e =>
                setNewRequest(prev => ({
                  ...prev,
                  justification: e.target.value,
                }))
              }
              placeholder='Descreva o motivo da solicitação...'
              required
            />
          </FormGroup>

          {conditions && (
            <ConditionsSection theme={theme}>
              <ConditionsTitle>Resumo das Condições</ConditionsTitle>
              <ConditionRow>
                <ConditionLabel>Valor solicitado:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.amount)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Taxa de juros:</ConditionLabel>
                <ConditionValue>
                  {conditions.interestRate}% ao mês
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Valor total:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.totalAmount)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Valor da parcela:</ConditionLabel>
                <ConditionValue>
                  {formatCurrency(conditions.monthlyPayment)}
                </ConditionValue>
              </ConditionRow>
              <ConditionRow>
                <ConditionLabel>Data de vencimento:</ConditionLabel>
                <ConditionValue>{conditions.dueDate}</ConditionValue>
              </ConditionRow>
            </ConditionsSection>
          )}

          <OptimizedButtonGroup>
            <UnifiedButton type='submit' variant='primary' theme={theme}>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Enviar Solicitação
            </UnifiedButton>
          </OptimizedButtonGroup>
        </Form>
      </RequestSection>

      {/* Seção de Aprovação (apenas para empregadores) */}
      {currentProfile?.role === 'Empregador' && (
        <ApprovalSection theme={theme}>
          <ApprovalTitle>Aprovação de Solicitações</ApprovalTitle>
          <ApprovalSection theme={theme}>
            <UnifiedButton variant='secondary' theme={theme}>
              <AccessibleEmoji emoji='📊' label='Dashboard' /> Exportar
              Relatório
            </UnifiedButton>
          </ApprovalSection>
        </ApprovalSection>
      )}

      {/* Filtros */}
      <FilterSection theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
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
              <option value='pending'>Pendente</option>
              <option value='approved'>Aprovado</option>
              <option value='rejected'>Rejeitado</option>
              <option value='paid'>Pago</option>
            </Select>
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
              <option value='advance'>Adiantamento</option>
              <option value='loan'>Empréstimo</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Funcionário</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={filters.employee}
              onChange={e =>
                setFilters(prev => ({ ...prev, employee: e.target.value }))
              }
              placeholder='Nome do funcionário...'
            />
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Listagem de Solicitações */}
      <RequestsSection theme={theme}>
        <RequestsTitle>Histórico de Solicitações</RequestsTitle>

        {getFilteredRequests().length === 0 ? (
          <EmptyState>
            <div className='empty-icon'>
              <AccessibleEmoji emoji='💵' label='Dinheiro' />
            </div>
            <h3 className='empty-title'>Nenhuma solicitação encontrada</h3>
            <p className='empty-description'>
              Não há solicitações que correspondam aos filtros selecionados.
            </p>
          </EmptyState>
        ) : (
          <RequestsGrid>
            {getFilteredRequests().map(request => (
              <RequestCard
                key={request.id}
                theme={theme}
                $status={request.status}
              >
                <RequestHeader>
                  <RequestType $type={request.type}>
                    <span>{getRequestTypeIcon(request.type)}</span>
                    <span>{getRequestTypeName(request.type)}</span>
                  </RequestType>
                  <RequestStatus $status={request.status}>
                    {getStatusName(request.status)}
                  </RequestStatus>
                </RequestHeader>

                <RequestInfo>
                  <RequestTitle>{request.employeeName}</RequestTitle>
                  <RequestDetails>
                    Data:{' '}
                    {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                  </RequestDetails>
                  <RequestDetails>
                    Parcelas: {request.installments}x de{' '}
                    {formatCurrency(request.monthlyPayment)}
                  </RequestDetails>
                  <RequestDetails>
                    Vencimento:{' '}
                    {new Date(request.dueDate).toLocaleDateString('pt-BR')}
                  </RequestDetails>
                  <RequestAmount>
                    {formatCurrency(request.totalAmount)}
                  </RequestAmount>
                </RequestInfo>

                <RequestActions>
                  <RequestUnifiedButton
                    theme={theme}
                    onClick={() => handleViewRequest(request)}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Detalhes
                  </RequestUnifiedButton>

                  {request.status === 'pending' &&
                    currentProfile?.role === 'Empregador' && (
                      <>
                        <RequestUnifiedButton
                          theme={theme}
                          variant='success'
                          onClick={() =>
                            handleApprovalAction(request.id, 'approve')
                          }
                        >
                          <AccessibleEmoji emoji='✅' label='Sucesso' /> Aprovar
                        </RequestUnifiedButton>
                        <RequestUnifiedButton
                          theme={theme}
                          variant='danger'
                          onClick={() =>
                            handleApprovalAction(request.id, 'reject')
                          }
                        >
                          <AccessibleEmoji emoji='❌' label='Erro' /> Rejeitar
                        </RequestUnifiedButton>
                      </>
                    )}

                  {request.status === 'pending' &&
                    currentProfile?.role !== 'Empregador' && (
                      <RequestUnifiedButton
                        theme={theme}
                        variant='secondary'
                        onClick={() => handleCancelRequest(request.id)}
                      >
                        <AccessibleEmoji emoji='❌' label='Excluir' /> Cancelar
                      </RequestUnifiedButton>
                    )}
                </RequestActions>
              </RequestCard>
            ))}
          </RequestsGrid>
        )}
      </RequestsSection>

      {/* Termos e Condições */}
      <TermsSection theme={theme}>
        <TermsTitle>Termos e Condições</TermsTitle>
        <TermsContent>
          <h3>Adiantamento de Salário</h3>
          <ul>
            <li>Sem taxa de juros ou custos adicionais</li>
            <li>Desconto integral no próximo holerite</li>
            <li>Limite de até 50% do salário bruto</li>
            <li>Aprovação imediata para valores até R$ 500,00</li>
          </ul>

          <h3>Empréstimo</h3>
          <ul>
            <li>Taxa de juros de 2,5% ao mês (CET: 2,5% a.m.)</li>
            <li>Parcelamento em até 12 vezes</li>
            <li>Desconto automático no holerite</li>
            <li>Análise de crédito obrigatória</li>
          </ul>

          <h3>Condições Gerais</h3>
          <ul>
            <li>
              Funcionário deve estar em dia com as obrigações trabalhistas
            </li>
            <li>Prazo mínimo de 30 dias de trabalho na empresa</li>
            <li>Possibilidade de cancelamento em até 24h após aprovação</li>
            <li>Conformidade com a legislação trabalhista vigente</li>
          </ul>
        </TermsContent>
      </TermsSection>

      {/* UnifiedModal de Detalhes da Solicitação */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setSelectedRequest(null);
        }}
        title={
          selectedRequest
            ? `Detalhes da Solicitação - ${getRequestTypeName(selectedRequest.type)}`
            : 'Detalhes da Solicitação'
        }
      >
        {selectedRequest && (
          <div>
            <UnifiedModalSection>
              <h3 className='section-title'>{selectedRequest.employeeName}</h3>
              <p className='section-title'>
                <strong>Tipo:</strong>{' '}
                {getRequestTypeName(selectedRequest.type)}
              </p>
              <p className='section-title'>
                <strong>Valor:</strong>{' '}
                {formatCurrency(selectedRequest.totalAmount)}
              </p>
              <p className='section-title'>
                <strong>Parcelas:</strong> {selectedRequest.installments}x de{' '}
                {formatCurrency(selectedRequest.monthlyPayment)}
              </p>
              <p className='section-title'>
                <strong>Status:</strong> {getStatusName(selectedRequest.status)}
              </p>
              <p className='section-title'>
                <strong>Justificativa:</strong> {selectedRequest.justification}
              </p>
            </UnifiedModalSection>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => setUnifiedModalOpen(false)}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Fechar
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </div>
        )}
      </UnifiedModal>

      {/* UnifiedModal de Aprovação/Rejeição */}
      <UnifiedModal
        isOpen={showApprovalUnifiedModal}
        onClose={() => {
          setShowApprovalUnifiedModal(false);
          setSelectedRequest(null);
          setApprovalComment('');
        }}
        title={`${approvalAction === 'approve' ? 'Aprovar' : 'Rejeitar'} Solicitação`}
      >
        {selectedRequest && (
          <div>
            <UnifiedModalSection>
              <h3 className='section-title'>
                {selectedRequest.employeeName} -{' '}
                {formatCurrency(selectedRequest.totalAmount)}
              </h3>
              <p className='section-title'>{selectedRequest.justification}</p>
            </UnifiedModalSection>

            <FormGroup>
              <OptimizedLabel>
                {approvalAction === 'approve'
                  ? 'Comentário de Aprovação'
                  : 'Motivo da Rejeição'}
              </OptimizedLabel>
              <Input
                theme={theme}
                type='text'
                value={approvalComment}
                onChange={e => setApprovalComment(e.target.value)}
                placeholder={
                  approvalAction === 'approve'
                    ? 'Comentário opcional...'
                    : 'Motivo obrigatório...'
                }
                required={approvalAction === 'reject'}
              />
            </FormGroup>

            <FlexRowWithMargin>
              <FlexColumn>
                <UnifiedButton
                  variant={approvalAction === 'approve' ? 'success' : 'danger'}
                  theme={theme}
                  onClick={handleConfirmApproval}
                >
                  {approvalAction === 'approve' ? (
                    <>
                      <AccessibleEmoji emoji='✅' label='Sucesso' /> Confirmar
                      Aprovação
                    </>
                  ) : (
                    <>
                      <AccessibleEmoji emoji='❌' label='Erro' /> Confirmar
                      Rejeição
                    </>
                  )}
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => {
                    setShowApprovalUnifiedModal(false);
                    setSelectedRequest(null);
                    setApprovalComment('');
                  }}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
                </UnifiedButton>
              </FlexColumn>
            </FlexRowWithMargin>
          </div>
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
