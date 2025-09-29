import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/payroll-management.tsx
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
import { OptimizedFormRow, OptimizedLabel } from '../components/shared/optimized-styles';


// Styled Components para substituir estilos inline
const UnifiedModalSection = styled.div`
  margin-bottom: 1rem;
`;

const LargeIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
`;

const SmallText = styled.div`
  font-size: 0.8rem;
  margin-top: 0.5rem;
`;

const FlexRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const FlexColumn = styled.div`
  flex: 1;
`;

// Interfaces
interface PayrollSummary {
  id: string;
  period: string;
  baseSalary: number;
  additions: {
    overtime: number;
    nightShift: number;
    holiday: number;
    bonus: number;
    total: number;
  };
  deductions: {
    inss: number;
    irrf: number;
    fgts: number;
    other: number;
    total: number;
  };
  netSalary: number;
  grossSalary: number;
  status: 'paid' | 'pending' | 'processing';
  paymentDate?: string;
}

interface PayrollDocument {
  id: string;
  type: 'holerite' | 'recibo' | 'vale_transporte' | 'comprovante_pagamento';
  period: string;
  issueDate: string;
  amount: number;
  status: 'available' | 'processing' | 'error';
  downloadUrl?: string;
  viewUrl?: string;
  employeeId: string;
  employeeName: string;
}

interface Employee {
  id: string;
  name: string;
  position: string;
  avatar: string;
  baseSalary: number;
  hireDate: string;
  status: 'active' | 'inactive';
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
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SummaryCard = styled.div<{
  $theme: any;
  $variant?: 'success' | 'warning' | 'info';
}>`
  background: ${props => {
    switch (props.$variant) {
      case 'success':
        return 'rgba(46, 204, 113, 0.1)';
      case 'warning':
        return 'rgba(241, 196, 15, 0.1)';
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
        case 'success':
          return 'rgba(46, 204, 113, 0.3)';
        case 'warning':
          return 'rgba(241, 196, 15, 0.3)';
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
  font-size: 1rem;
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
  margin-top: 0.75rem;
  font-size: 0.85rem;
  color: #7f8c8d;
`;

const ChartSection = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const ChartTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const ChartContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieChart = styled.div`
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: conic-gradient(
    #3498db 0deg 120deg,
    #2ecc71 120deg 180deg,
    #e74c3c 180deg 240deg,
    #f39c12 240deg 360deg
  );
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80px;
    height: 80px;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
  }
`;

const ChartLegend = styled.div`
  flex: 1;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  flex-shrink: 0;
`;

const DocumentsSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const DocumentsTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const DocumentsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const DocumentCard = styled.div<{
  $theme: any;
  $status: 'available' | 'processing' | 'error';
}>`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid
    ${props => {
      switch (props.$status) {
        case 'available':
          return '#2ecc71';
        case 'processing':
          return '#f39c12';
        case 'error':
          return '#e74c3c';
        default:
          return '#e0e0e0';
      }
    }};
  transition: all 0.3s ease;
  opacity: ${props => (props.$status === 'processing' ? 0.7 : 1)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  }
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const DocumentType = styled.div<{ $type: string }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => {
    switch (props.$type) {
      case 'holerite':
        return '#3498db20';
      case 'recibo':
        return '#2ecc7120';
      case 'vale_transporte':
        return '#f39c1220';
      case 'comprovante_pagamento':
        return '#9b59b620';
      default:
        return '#95a5a620';
    }
  }};
  color: ${props => {
    switch (props.$type) {
      case 'holerite':
        return '#3498db';
      case 'recibo':
        return '#2ecc71';
      case 'vale_transporte':
        return '#f39c12';
      case 'comprovante_pagamento':
        return '#9b59b6';
      default:
        return '#95a5a6';
    }
  }};
  font-size: 0.8rem;
  font-weight: 600;
`;

const DocumentStatus = styled.span<{
  $status: 'available' | 'processing' | 'error';
}>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'available':
        return '#2ecc71';
      case 'processing':
        return '#f39c12';
      case 'error':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

const DocumentInfo = styled.div`
  margin-bottom: 1rem;
`;

const DocumentTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
`;

const DocumentPeriod = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
  margin-bottom: 0.25rem;
`;

const DocumentAmount = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  font-family: 'Montserrat', sans-serif;
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const DocumentUnifiedButton = styled.button<{
  $theme: any;
  $variant?: 'primary' | 'secondary' | 'success';
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

const PaymentSection = styled.section<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px ${props => props.$theme.colors.shadow};
`;

const PaymentTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0 0 1.5rem 0;
  font-family: 'Montserrat', sans-serif;
`;

const EmployeeSelector = styled.div`
  margin-bottom: 1.5rem;
`;

const EmployeeCard = styled.div<{ $theme: any; $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid
    ${props => (props.$selected ? props.$theme.colors.primary : '#e0e0e0')};
  background: ${props =>
    props.$selected ? props.$theme.colors.primary + '10' : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$theme.colors.primary};
    background: ${props => props.$theme.colors.primary + '05'};
  }
`;

const EmployeeAvatar = styled.div<{ $color: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
`;

const EmployeeInfo = styled.div`
  flex: 1;
`;

const EmployeeName = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.25rem;
`;

const EmployeeDetails = styled.div`
  font-size: 0.85rem;
  color: #7f8c8d;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
  margin-bottom: 1rem;
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

const PDFViewer = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
  border: 1px solid #e0e0e0;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

export default function PayrollManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<PayrollDocument | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const employees: Employee[] = [
    {
      id: '1',
      name: 'Maria Santos',
      position: 'Empregada Doméstica',
      avatar: 'MS',
      baseSalary: 1500,
      hireDate: '2023-01-15',
      status: 'active',
    },
    {
      id: '2',
      name: 'Ana Costa',
      position: 'Cozinheira',
      avatar: 'AC',
      baseSalary: 1800,
      hireDate: '2023-03-20',
      status: 'active',
    },
  ];

  const [payrollSummary] = useState<PayrollSummary>({
    id: '1',
    period: 'Janeiro 2024',
    baseSalary: 1500,
    additions: {
      overtime: 200,
      nightShift: 150,
      holiday: 100,
      bonus: 50,
      total: 500,
    },
    deductions: {
      inss: 120,
      irrf: 80,
      fgts: 120,
      other: 30,
      total: 350,
    },
    netSalary: 1650,
    grossSalary: 2000,
    status: 'paid',
    paymentDate: '2024-01-31',
  });

  const [documents] = useState<PayrollDocument[]>([
    {
      id: '1',
      type: 'holerite',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '2',
      type: 'recibo',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '3',
      type: 'vale_transporte',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 200,
      status: 'available',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
    {
      id: '4',
      type: 'comprovante_pagamento',
      period: 'Janeiro 2024',
      issueDate: '2024-01-31',
      amount: 1650,
      status: 'processing',
      employeeId: '1',
      employeeName: 'Maria Santos',
    },
  ]);

  const [filters, setFilters] = useState({
    period: '',
    type: '',
    status: '',
  });

  const handleViewDocument = (document: PayrollDocument) => {
    setSelectedDocument(document);
    setUnifiedModalOpen(true);
  };

  const handleDownloadDocument = (document: PayrollDocument) => {
    toast.success(`Baixando ${getDocumentTypeName(document.type)}...`);
    // Aqui seria implementada a lógica de download
  };

  const handlePrintDocument = (document: PayrollDocument) => {
    toast.success(`Imprimindo ${getDocumentTypeName(document.type)}...`);
    // Aqui seria implementada a lógica de impressão
  };

  const handleProcessPayment = () => {
    if (selectedEmployee) {
      toast.success('Processando pagamento...');
      setShowPaymentForm(false);
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'holerite':
        return 'Holerite';
      case 'recibo':
        return 'Recibo';
      case 'vale_transporte':
        return 'Vale Transporte';
      case 'comprovante_pagamento':
        return 'Comprovante de Pagamento';
      default:
        return 'Documento';
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case 'holerite':
        return <AccessibleEmoji emoji='📄' label='Documento' />;
      case 'recibo':
        return '🧾';
      case 'vale_transporte':
        return <AccessibleEmoji emoji='🚌' label='Transporte' />;
      case 'comprovante_pagamento':
        return <AccessibleEmoji emoji='💵' label='Pagamento' />;
      default:
        return <AccessibleEmoji emoji='📋' label='Checklist' />;
    }
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesPeriod =
        !filters.period || doc.period.includes(filters.period);
      const matchesType = !filters.type || doc.type === filters.type;
      const matchesStatus = !filters.status || doc.status === filters.status;
      return matchesPeriod && matchesType && matchesStatus;
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

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
          notificationCount={0}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Cálculos Salariais e Holerites'
        subtitle='Gerencie pagamentos, consulte documentos e acompanhe cálculos salariais'
      />

      {/* Resumo Salarial */}
      <SummarySection theme={theme}>
        <SummaryTitle>Resumo Salarial - {payrollSummary.period}</SummaryTitle>
        <SummaryGrid>
          <SummaryCard theme={theme}>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Pagamento' /> Salário Base
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.baseSalary)}
            </SummaryValue>
            <SummaryDetails>Valor fixo mensal</SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='success'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='➕' label='Novo' /> Adicionais
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.additions.total)}
            </SummaryValue>
            <SummaryDetails>
              Horas extras: {formatCurrency(payrollSummary.additions.overtime)}
              <br />
              Adicional noturno:{' '}
              {formatCurrency(payrollSummary.additions.nightShift)}
              <br />
              Feriados: {formatCurrency(payrollSummary.additions.holiday)}
              <br />
              Bônus: {formatCurrency(payrollSummary.additions.bonus)}
            </SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='warning'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='➖' label='Remover' /> Descontos
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.deductions.total)}
            </SummaryValue>
            <SummaryDetails>
              INSS: {formatCurrency(payrollSummary.deductions.inss)}
              <br />
              IRRF: {formatCurrency(payrollSummary.deductions.irrf)}
              <br />
              FGTS: {formatCurrency(payrollSummary.deductions.fgts)}
              <br />
              Outros: {formatCurrency(payrollSummary.deductions.other)}
            </SummaryDetails>
          </SummaryCard>

          <SummaryCard theme={theme} variant='info'>
            <SummaryCardTitle>
              <AccessibleEmoji emoji='💵' label='Dinheiro' /> Salário Líquido
            </SummaryCardTitle>
            <SummaryValue>
              {formatCurrency(payrollSummary.netSalary)}
            </SummaryValue>
            <SummaryDetails>
              Bruto: {formatCurrency(payrollSummary.grossSalary)}
              <br />
              Status: {payrollSummary.status === 'paid' ? 'Pago' : 'Pendente'}
              {payrollSummary.paymentDate && (
                <>
                  <br />
                  Pago em:{' '}
                  {new Date(payrollSummary.paymentDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </>
              )}
            </SummaryDetails>
          </SummaryCard>
        </SummaryGrid>
      </SummarySection>

      {/* Gráfico de Distribuição */}
      <ChartSection theme={theme}>
        <ChartTitle>Distribuição dos Valores</ChartTitle>
        <ChartContainer>
          <PieChart />
          <ChartLegend>
            <LegendItem>
              <LegendColor $color='#3498db' />
              <span>
                Salário Base: {formatCurrency(payrollSummary.baseSalary)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#2ecc71' />
              <span>
                Adicionais: {formatCurrency(payrollSummary.additions.total)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#e74c3c' />
              <span>
                Descontos: {formatCurrency(payrollSummary.deductions.total)}
              </span>
            </LegendItem>
            <LegendItem>
              <LegendColor $color='#f39c12' />
              <span>Líquido: {formatCurrency(payrollSummary.netSalary)}</span>
            </LegendItem>
          </ChartLegend>
        </ChartContainer>
      </ChartSection>

      {/* Seção de Pagamentos (apenas para empregadores) */}
      {currentProfile?.role === 'Empregador' && (
        <PaymentSection theme={theme}>
          <PaymentTitle>Processar Pagamentos</PaymentTitle>

          <EmployeeSelector>
            <OptimizedLabel>Selecionar Funcionário</OptimizedLabel>
            {employees.map(employee => (
              <EmployeeCard
                key={employee.id}
                theme={theme}
                $selected={selectedEmployee === employee.id}
                onClick={() => setSelectedEmployee(employee.id)}
              >
                <EmployeeAvatar
                  $color={employee.avatar === 'MS' ? '#90EE90' : '#29ABE2'}
                >
                  {employee.avatar}
                </EmployeeAvatar>
                <EmployeeInfo>
                  <EmployeeName>{employee.name}</EmployeeName>
                  <EmployeeDetails>
                    {employee.position} • {formatCurrency(employee.baseSalary)}
                    /mês
                  </EmployeeDetails>
                </EmployeeInfo>
              </EmployeeCard>
            ))}
          </EmployeeSelector>

          {selectedEmployee && (
            <div>
              <UnifiedButton
                variant='primary'
                theme={theme}
                onClick={() => setShowPaymentForm(true)}
              >
                <AccessibleEmoji emoji='💵' label='Pagamento' /> Processar
                Pagamento
              </UnifiedButton>
            </div>
          )}
        </PaymentSection>
      )}

      {/* Filtros */}
      <FilterSection theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Período</OptimizedLabel>
            <Input
              theme={theme}
              type='text'
              value={filters.period}
              onChange={e =>
                setFilters(prev => ({ ...prev, period: e.target.value }))
              }
              placeholder='Ex: Janeiro 2024'
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo de Documento</OptimizedLabel>
            <Select
              theme={theme}
              value={filters.type}
              onChange={e =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              aria-label='Filtrar por tipo de documento'
              title='Filtrar por tipo de documento'
            >
              <option value=''>Todos os tipos</option>
              <option value='holerite'>Holerite</option>
              <option value='recibo'>Recibo</option>
              <option value='vale_transporte'>Vale Transporte</option>
              <option value='comprovante_pagamento'>
                Comprovante de Pagamento
              </option>
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
              <option value='available'>Disponível</option>
              <option value='processing'>Processando</option>
              <option value='error'>Erro</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Listagem de Documentos */}
      <DocumentsSection theme={theme}>
        <DocumentsTitle>Documentos e Holerites</DocumentsTitle>

        {getFilteredDocuments().length === 0 ? (
          <EmptyState>
            <div className='empty-icon'>
              <AccessibleEmoji emoji='📄' label='Documento' />
            </div>
            <h3 className='empty-title'>Nenhum documento encontrado</h3>
            <p className='empty-description'>
              Não há documentos que correspondam aos filtros selecionados.
            </p>
          </EmptyState>
        ) : (
          <DocumentsGrid>
            {getFilteredDocuments().map(document => (
              <DocumentCard
                key={document.id}
                theme={theme}
                $status={document.status}
              >
                <DocumentHeader>
                  <DocumentType $type={document.type}>
                    <span>{getDocumentTypeIcon(document.type)}</span>
                    <span>{getDocumentTypeName(document.type)}</span>
                  </DocumentType>
                  <DocumentStatus $status={document.status}>
                    {document.status === 'available'
                      ? 'Disponível'
                      : document.status === 'processing'
                        ? 'Processando'
                        : 'Erro'}
                  </DocumentStatus>
                </DocumentHeader>

                <DocumentInfo>
                  <DocumentTitle>{document.employeeName}</DocumentTitle>
                  <DocumentPeriod>Período: {document.period}</DocumentPeriod>
                  <DocumentPeriod>
                    Emissão:{' '}
                    {new Date(document.issueDate).toLocaleDateString('pt-BR')}
                  </DocumentPeriod>
                  <DocumentAmount>
                    {formatCurrency(document.amount)}
                  </DocumentAmount>
                </DocumentInfo>

                <DocumentActions>
                  <DocumentUnifiedButton
                    theme={theme}
                    onClick={() => handleViewDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='👁' label='Visualizar' /> Visualizar
                  </DocumentUnifiedButton>
                  <DocumentUnifiedButton
                    theme={theme}
                    variant='success'
                    onClick={() => handleDownloadDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='⬇️' label='Baixar' /> Baixar
                  </DocumentUnifiedButton>
                  <DocumentUnifiedButton
                    theme={theme}
                    variant='secondary'
                    onClick={() => handlePrintDocument(document)}
                    disabled={document.status !== 'available'}
                  >
                    <AccessibleEmoji emoji='🖨' label='Imprimir' /> Imprimir
                  </DocumentUnifiedButton>
                </DocumentActions>
              </DocumentCard>
            ))}
          </DocumentsGrid>
        )}
      </DocumentsSection>

      {/* UnifiedModal de Visualização de Documento */}
      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => {
          setUnifiedModalOpen(false);
          setSelectedDocument(null);
        }}
        title={
          selectedDocument
            ? `${getDocumentTypeName(selectedDocument.type)} - ${selectedDocument.period}`
            : 'Visualizar Documento'
        }
      >
        {selectedDocument && (
          <div>
            <UnifiedModalSection>
              <h3 className='section-title'>{selectedDocument.employeeName}</h3>
              <p className='section-title'>
                Período: {selectedDocument.period}
              </p>
              <p className='section-title'>
                Valor: {formatCurrency(selectedDocument.amount)}
              </p>
            </UnifiedModalSection>

            <PDFViewer theme={theme}>
              <div className='stat-item'>
                <LargeIcon>
                  <AccessibleEmoji emoji='📄' label='Documento' />
                </LargeIcon>
                <div>Visualizador de PDF</div>
                <SmallText>Aqui seria exibido o documento PDF</SmallText>
              </div>
            </PDFViewer>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  variant='success'
                  theme={theme}
                  onClick={() => handleDownloadDocument(selectedDocument)}
                >
                  <AccessibleEmoji emoji='⬇️' label='Baixar' /> Baixar PDF
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => handlePrintDocument(selectedDocument)}
                >
                  <AccessibleEmoji emoji='🖨' label='Imprimir' /> Imprimir
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </div>
        )}
      </UnifiedModal>

      {/* UnifiedModal de Processamento de Pagamento */}
      <UnifiedModal
        isOpen={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        title='Processar Pagamento'
      >
        <div>
          <PaymentSection theme={theme}>
            <h3 className='section-title'>Confirmar Pagamento</h3>
            <p className='section-title'>
              Funcionário:{' '}
              {employees.find(e => e.id === selectedEmployee)?.name}
            </p>
            <p className='section-title'>
              Valor: {formatCurrency(payrollSummary.netSalary)}
            </p>
          </PaymentSection>

          <Form onSubmit={e => e.preventDefault()}>
            <FormGroup>
              <OptimizedLabel>Data do Pagamento</OptimizedLabel>
              <Input
                theme={theme}
                type='date'
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </FormGroup>

            <FormGroup>
              <OptimizedLabel>Método de Pagamento</OptimizedLabel>
              <Select
                theme={theme}
                aria-label='Selecionar método de pagamento'
                title='Selecionar método de pagamento'
              >
                <option value='pix'>PIX</option>
                <option value='transferencia'>Transferência Bancária</option>
                <option value='dinheiro'>Dinheiro</option>
              </Select>
            </FormGroup>

            <FlexRow>
              <FlexColumn>
                <UnifiedButton
                  variant='primary'
                  theme={theme}
                  onClick={handleProcessPayment}
                >
                  <AccessibleEmoji emoji='💵' label='Pagamento' /> Confirmar
                  Pagamento
                </UnifiedButton>
              </FlexColumn>
              <FlexColumn>
                <UnifiedButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => setShowPaymentForm(false)}
                >
                  <AccessibleEmoji emoji='❌' label='Erro' /> Cancelar
                </UnifiedButton>
              </FlexColumn>
            </FlexRow>
          </Form>
        </div>
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
