import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { ActionButton } from '../components/ActionButton';
import EmployeeModal from '../components/EmployeeModal';
import EmployerModal from '../components/EmployerModal';
import PayrollModalNew from '../components/PayrollModalNew';
import ReportModal from '../components/ReportModal';
import Sidebar from '../components/Sidebar';
import TaxGuideModalNew from '../components/TaxGuideModalNew';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { useTheme } from '../hooks/useTheme';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Componentes styled para CSS inline
const FlexContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const FlexColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FlexWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

const EmployeeCard = styled.div`
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
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

const Subtitle = styled.div`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#666'};
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
`;

const StatusBadge = styled.span<{ $status: string; $theme: any }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'connected':
        return props.$theme?.colors?.success || '#90EE90';
      case 'disconnected':
        return '#e74c3c';
      case 'pending':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
  animation: ${props => (props.$status === 'connected' ? pulse : 'none')} 2s
    infinite;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  margin-bottom: 2rem;

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props => props.$theme?.colors?.primary || '#29ABE2'};
`;

const StatNumber = styled.div<{ $theme: any }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme?.colors?.text || '#666'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const TabGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TabCard = styled.div<{ $active: boolean; $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.primary || '#29ABE2'
        : 'transparent'};

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }
`;

const TabTitle = styled.h3<{ $theme: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TabDescription = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0;
  line-height: 1.4;
`;

const TabContent = styled.div`
  display: ${props => (props.hidden ? 'none' : 'block')};
`;

// Interfaces
interface Employee {
  id: string;
  cpf: string;
  nome: string;
  pis: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  dataDesligamento?: string;
  status: 'ATIVO' | 'INATIVO' | 'AFASTADO';
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
}

interface PayrollData {
  id: string;
  employeeId: string;
  mes: string;
  ano: string;
  salarioBase: number;
  horasTrabalhadas: number;
  horasExtras: number;
  faltas: number;
  atestados: number;
  descontos: number;
  adicionais: number;
  salarioLiquido: number;
  status: 'PENDENTE' | 'PROCESSADO' | 'ENVIADO';
}

interface TaxGuide {
  id: string;
  tipo: 'INSS' | 'FGTS' | 'IRRF';
  mes: string;
  ano: string;
  valor: number;
  vencimento: string;
  status: 'PENDENTE' | 'PAGO' | 'VENCIDO';
}

const ESocialDomesticoCompleto: React.FC = () => {
  const router = useRouter();
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const alertManager = useAlertManager();
  const [collapsed, setCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('employees');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para dados
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [payrollData, setPayrollData] = useState<PayrollData[]>([]);
  const [taxGuides, setTaxGuides] = useState<TaxGuide[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isEmployerModalOpen, setIsEmployerModalOpen] = useState(false);
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [isTaxGuideModalOpen, setIsTaxGuideModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  // Verificar se estamos no cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Carregar funcionários
      const employeesResponse = await fetch(
        '/api/consultar-esocial-domestico',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cpf: '59876913700', ambiente: 'producao' }),
        }
      );

      const employeesData = await employeesResponse.json();
      if (employeesData.success && employeesData.data.trabalhadores.dados) {
        setEmployees(employeesData.data.trabalhadores.dados);
      }

      // Carregar dados de folha (simulado)
      setPayrollData([
        {
          id: '1',
          employeeId: '1',
          mes: '01',
          ano: '2024',
          salarioBase: 1500.0,
          horasTrabalhadas: 220,
          horasExtras: 0,
          faltas: 0,
          atestados: 0,
          descontos: 150.0,
          adicionais: 0,
          salarioLiquido: 1350.0,
          status: 'PROCESSADO',
        },
      ]);

      // Carregar guias de impostos (simulado)
      setTaxGuides([
        {
          id: '1',
          tipo: 'INSS',
          mes: '01',
          ano: '2024',
          valor: 150.0,
          vencimento: '2024-02-15',
          status: 'PAGO',
        },
        {
          id: '2',
          tipo: 'FGTS',
          mes: '01',
          ano: '2024',
          valor: 120.0,
          vencimento: '2024-02-07',
          status: 'PAGO',
        },
      ]);
    } catch (error) {
      alertManager.showError('Erro ao carregar dados iniciais');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsEmployeeModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleSaveEmployee = async (employeeData: Omit<Employee, 'id'>) => {
    try {
      if (selectedEmployee) {
        // Editar funcionário existente
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === selectedEmployee.id ? { ...emp, ...employeeData } : emp
          )
        );
        alertManager.showSuccess(
          'Funcionário atualizado com sucesso!',
          'Sucesso'
        );
      } else {
        // Adicionar novo funcionário
        const newEmployee: Employee = {
          ...employeeData,
          id: Date.now().toString(),
        };
        setEmployees(prev => [...prev, newEmployee]);
        alertManager.showSuccess(
          'Funcionário adicionado com sucesso!',
          'Sucesso'
        );
      }
    } catch (error) {
      alertManager.showError('Erro ao salvar funcionário', 'Erro');
    }
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    // Usar alertManager ao invés de confirm para consistência
    const confirmed = window.confirm(
      'Tem certeza que deseja desligar este funcionário?'
    );
    if (confirmed) {
      try {
        // Simular desligamento
        setEmployees(prev =>
          prev.map(emp =>
            emp.id === employeeId
              ? {
                  ...emp,
                  status: 'INATIVO' as const,
                  dataDesligamento: new Date().toISOString().split('T')[0],
                }
              : emp
          )
        );
        alertManager.showSuccess(
          'Funcionário desligado com sucesso!',
          'Sucesso'
        );
      } catch (error) {
        alertManager.showError('Erro ao desligar funcionário', 'Erro');
      }
    }
  };

  const handleGeneratePayroll = () => {
    setIsPayrollModalOpen(true);
  };

  const handleSavePayroll = async (
    payrollData: Omit<PayrollData, 'id' | 'salarioLiquido' | 'status'>
  ) => {
    try {
      // Calcular salário líquido
      const salarioBase = payrollData.salarioBase;
      const valorHora = salarioBase / 220;
      const descontoFaltas = payrollData.faltas * valorHora;
      const valorHorasExtras = payrollData.horasExtras * valorHora * 1.5;
      const salarioLiquido = Math.max(
        0,
        salarioBase -
          descontoFaltas -
          payrollData.descontos +
          payrollData.adicionais +
          valorHorasExtras
      );

      // Se múltiplos funcionários, criar uma folha para cada
      if (Array.isArray(payrollData.employeeId)) {
        const newPayrolls = payrollData.employeeId.map(empId => ({
          ...payrollData,
          employeeId: empId,
          id: Date.now().toString() + Math.random(),
          salarioLiquido,
          status: 'PROCESSADO' as const,
        }));

        setPayrollData(prev => [...prev, ...newPayrolls]);

        // Gerar documentos e agendar pagamentos para cada funcionário
        for (const empId of payrollData.employeeId) {
          await generateDocumentAndSchedulePayment('holerite', {
            ...payrollData,
            employeeId: empId,
            salarioLiquido,
          });
        }

        alertManager.showSuccess(
          `${payrollData.employeeId.length} folha(s) de pagamento gerada(s) com sucesso!`,
          'Sucesso'
        );
      } else {
        const newPayroll: PayrollData = {
          ...payrollData,
          id: Date.now().toString(),
          salarioLiquido,
          status: 'PROCESSADO',
        };

        setPayrollData(prev => [...prev, newPayroll]);

        // Gerar documento e agendar pagamento
        await generateDocumentAndSchedulePayment('holerite', newPayroll);

        alertManager.showSuccess(
          'Folha de pagamento gerada com sucesso!',
          'Sucesso'
        );
      }
    } catch (error) {
      alertManager.showError('Erro ao gerar folha de pagamento', 'Erro');
    }
  };

  const handleSaveTaxGuides = async (guides: any[]) => {
    try {
      const newGuides = guides.map(guide => ({
        ...guide,
        id: Date.now().toString() + Math.random(),
        valor: Math.random() * 1000 + 100, // Valor simulado
        vencimento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0], // 15 dias
        status: 'PENDENTE' as const,
      }));

      setTaxGuides(prev => [...prev, ...newGuides]);

      // Gerar documentos e agendar pagamentos para cada guia
      for (const guide of newGuides) {
        await generateDocumentAndSchedulePayment('guia_imposto', guide);
      }

      alertManager.showSuccess(
        `${guides.length} guia(s) de imposto gerada(s) com sucesso!`,
        'Sucesso'
      );
    } catch (error) {
      alertManager.showError('Erro ao gerar guias de imposto', 'Erro');
    }
  };

  const handleSaveReports = async (reports: any[]) => {
    try {
      alertManager.showSuccess(
        `${reports.length} relatório(s) solicitado(s) com sucesso!`,
        'Sucesso'
      );
      // Aqui você implementaria a lógica real de geração de relatórios
    } catch (error) {
      alertManager.showError('Erro ao gerar relatórios', 'Erro');
    }
  };

  const handleSaveEmployer = (employer: any) => {
    try {
      alertManager.showSuccess('Empregador cadastrado com sucesso!', 'Sucesso');
      // Aqui você implementaria a lógica real de cadastro do empregador
    } catch (error) {
      alertManager.showError('Erro ao cadastrar empregador', 'Erro');
    }
  };

  const generateDocumentAndSchedulePayment = async (
    tipo: 'holerite' | 'guia_imposto',
    dados: any
  ) => {
    try {
      // Gerar documento
      const documentResponse = await fetch('/api/gerar-documento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          dados,
          funcionarioId: dados.employeeId,
          mes: dados.mes,
          ano: dados.ano,
          formato: 'PDF',
        }),
      });

      const documentResult = await documentResponse.json();

      if (documentResult.success) {
        console.log('📄 Documento gerado:', documentResult.documentId);
      }

      // Agendar pagamento
      const paymentResponse = await fetch('/api/agendar-pagamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          valor: tipo === 'holerite' ? dados.salarioLiquido : dados.valor || 0,
          funcionarioId: dados.employeeId,
          mes: dados.mes,
          ano: dados.ano,
          dataVencimento: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0], // 5 dias
          descricao:
            tipo === 'holerite'
              ? `Salário ${dados.mes}/${dados.ano}`
              : `${dados.tipo} ${dados.mes}/${dados.ano}`,
          categoria:
            tipo === 'holerite'
              ? 'salario'
              : dados.tipo?.toLowerCase() || 'outros',
          prioridade: 'media',
        }),
      });

      const paymentResult = await paymentResponse.json();

      if (paymentResult.success) {
        console.log('💰 Pagamento agendado:', paymentResult.paymentId);
      }
    } catch (error) {
      console.error('❌ Erro ao gerar documento ou agendar pagamento:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ATIVO':
      case 'PROCESSADO':
      case 'PAGO':
        return '#27ae60';
      case 'INATIVO':
      case 'PENDENTE':
        return '#f39c12';
      case 'AFASTADO':
      case 'VENCIDO':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  // Estatísticas
  const totalPayroll = payrollData.reduce(
    (sum, payroll) => sum + payroll.salarioLiquido,
    0
  );
  const pendingTaxes = taxGuides.filter(
    tax => tax.status === 'PENDENTE'
  ).length;

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
          notificationCount={pendingTaxes}
          onNotificationClick={() => setActiveTab('taxes')}
        />

        <Header>
          <div>
            <Title>
              <AccessibleEmoji emoji='🏠' label='Casa' /> eSocial Doméstico
              Completo
            </Title>
            <Subtitle>
              Gestão completa de funcionários domésticos e folha de pagamento
            </Subtitle>
          </div>
          <StatusBadge $status='connected' $theme={theme}>
            <AccessibleEmoji emoji='🟢' label='Conectado' /> Conectado
          </StatusBadge>
        </Header>

        {/* Estatísticas */}
        <StatsGrid>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>
              {formatCurrency(totalPayroll)}
            </StatNumber>
            <StatLabel>Total da Folha</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{pendingTaxes}</StatNumber>
            <StatLabel>Impostos Pendentes</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Cards de Navegação */}
        <TabGrid>
          <TabCard
            $active={activeTab === 'employer'}
            $theme={theme}
            onClick={() => setActiveTab('employer')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Cadastro do
              Empregador
            </TabTitle>
            <TabDescription>
              Cadastre e gerencie os dados do empregador doméstico
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'employees'}
            $theme={theme}
            onClick={() => setActiveTab('employees')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='👥' label='Funcionários' /> Funcionários
            </TabTitle>
            <TabDescription>
              Gerencie funcionários domésticos e seus vínculos
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'payroll'}
            $theme={theme}
            onClick={() => setActiveTab('payroll')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='💰' label='Folha' /> Folha de Pagamento
            </TabTitle>
            <TabDescription>
              Gere e gerencie folhas de pagamento mensais
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'taxes'}
            $theme={theme}
            onClick={() => setActiveTab('taxes')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='📋' label='Impostos' /> Guias de Impostos
            </TabTitle>
            <TabDescription>
              Gere guias de INSS, FGTS e outros impostos
            </TabDescription>
          </TabCard>

          <TabCard
            $active={activeTab === 'reports'}
            $theme={theme}
            onClick={() => setActiveTab('reports')}
          >
            <TabTitle $theme={theme}>
              <AccessibleEmoji emoji='📈' label='Relatórios' /> Relatórios
            </TabTitle>
            <TabDescription>
              Relatórios e indicadores do eSocial Doméstico
            </TabDescription>
          </TabCard>
        </TabGrid>

        {/* Conteúdo das Abas */}
        <TabContent hidden={activeTab !== 'employer'}>
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Cadastro do
              Empregador
            </SectionTitle>
            <p>
              Gerencie os dados do empregador doméstico e configurações do
              eSocial.
            </p>
            <div style={{ marginTop: '2rem' }}>
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={() => setIsEmployerModalOpen(true)}
              >
                <AccessibleEmoji emoji='⚙️' label='Configurar' /> Configurar
                Empregador
              </ActionButton>
            </div>
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'employees'}>
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='👥' label='Funcionários' /> Gestão de
              Funcionários
            </SectionTitle>

            <div style={{ marginBottom: '1rem' }}>
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={handleAddEmployee}
              >
                <AccessibleEmoji emoji='➕' label='Adicionar' /> Adicionar
                Funcionário
              </ActionButton>
            </div>

            {employees.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Nenhum funcionário cadastrado.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {employees.map(employee => (
                  <div
                    key={employee.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <h3>{employee.nome}</h3>
                        <p>CPF: {employee.cpf}</p>
                        <p>Cargo: {employee.cargo}</p>
                        <p>Salário: {formatCurrency(employee.salario)}</p>
                        <p>
                          Status:{' '}
                          <span
                            style={{ color: getStatusColor(employee.status) }}
                          >
                            {employee.status}
                          </span>
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <ActionButton
                          variant='secondary'
                          theme={theme}
                          onClick={() => handleEditEmployee(employee)}
                        >
                          <AccessibleEmoji emoji='✏️' label='Editar' /> Editar
                        </ActionButton>
                        {employee.status === 'ATIVO' && (
                          <ActionButton
                            variant='danger'
                            theme={theme}
                            onClick={() => handleDeleteEmployee(employee.id)}
                          >
                            <AccessibleEmoji emoji='🚪' label='Desligar' />{' '}
                            Desligar
                          </ActionButton>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'payroll'}>
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='💰' label='Folha' /> Folha de Pagamento
            </SectionTitle>
            <div style={{ marginBottom: '1rem' }}>
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={handleGeneratePayroll}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' /> Gerar Folha
              </ActionButton>
            </div>

            {payrollData.length === 0 ? (
              <p>Nenhuma folha de pagamento gerada.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {payrollData.map(payroll => (
                  <div
                    key={payroll.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3>
                      Folha {payroll.mes}/{payroll.ano}
                    </h3>
                    <p>Salário Base: {formatCurrency(payroll.salarioBase)}</p>
                    <p>Horas Trabalhadas: {payroll.horasTrabalhadas}h</p>
                    <p>Descontos: {formatCurrency(payroll.descontos)}</p>
                    <p>
                      Salário Líquido: {formatCurrency(payroll.salarioLiquido)}
                    </p>
                    <p>
                      Status:{' '}
                      <span style={{ color: getStatusColor(payroll.status) }}>
                        {payroll.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'taxes'}>
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='📋' label='Impostos' /> Guias de Impostos
            </SectionTitle>

            <div style={{ marginBottom: '1rem' }}>
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={() => setIsTaxGuideModalOpen(true)}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' /> Gerar Guias
              </ActionButton>
            </div>

            {taxGuides.length === 0 ? (
              <p>Nenhuma guia de imposto gerada.</p>
            ) : (
              <div style={{ display: 'grid', gap: '1rem' }}>
                {taxGuides.map(tax => (
                  <div
                    key={tax.id}
                    style={{
                      padding: '1rem',
                      border: '1px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <h3>
                      {tax.tipo} - {tax.mes}/{tax.ano}
                    </h3>
                    <p>Valor: {formatCurrency(tax.valor)}</p>
                    <p>Vencimento: {formatDate(tax.vencimento)}</p>
                    <p>
                      Status:{' '}
                      <span style={{ color: getStatusColor(tax.status) }}>
                        {tax.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </TabContent>

        <TabContent hidden={activeTab !== 'reports'}>
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='📈' label='Relatórios' /> Relatórios e
              Indicadores
            </SectionTitle>

            <div style={{ marginBottom: '1rem' }}>
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={() => setIsReportModalOpen(true)}
              >
                <AccessibleEmoji emoji='📊' label='Gerar' /> Gerar Relatórios
              </ActionButton>
            </div>

            <p>Relatórios detalhados do eSocial Doméstico disponíveis:</p>
            <ul style={{ marginTop: '1rem', paddingLeft: '2rem' }}>
              <li>Relatório de Funcionários Ativos</li>
              <li>Relatório de Folha de Pagamento</li>
              <li>Relatório de Impostos e Contribuições</li>
              <li>Relatório de Eventos Enviados</li>
              <li>Relatório de Status de Processamento</li>
              <li>Relatório de Conformidade Legal</li>
            </ul>
          </Section>
        </TabContent>

        {/* Modais */}
        <EmployeeModal
          isOpen={isEmployeeModalOpen}
          onClose={() => setIsEmployeeModalOpen(false)}
          onSave={handleSaveEmployee}
          employee={selectedEmployee}
          theme={theme}
        />

        <PayrollModalNew
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          onSave={handleSavePayroll}
          employees={employees}
          theme={theme}
        />

        <TaxGuideModalNew
          isOpen={isTaxGuideModalOpen}
          onClose={() => setIsTaxGuideModalOpen(false)}
          onSave={handleSaveTaxGuides}
          theme={theme}
        />

        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSave={handleSaveReports}
          theme={theme}
        />

        {/* Toast Container */}
        <EmployerModal
          isOpen={isEmployerModalOpen}
          onClose={() => setIsEmployerModalOpen(false)}
          onSave={handleSaveEmployer}
          theme={theme}
        />

        <ToastContainer
          position='top-right'
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </MainContent>
    </Container>
  );
};

export default ESocialDomesticoCompleto;
