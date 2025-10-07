import AccessibleEmoji from '../components/AccessibleEmoji';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import FilterSection from '../components/FilterSection';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton, UnifiedModal, UnifiedCard } from '../components/unified';
// import { useGeolocation } from '../hooks/useGeolocation'; // Removido - usando apenas nos componentes
import { getEmpresaConfig, getDefaultPassword } from '../lib/configService';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedHelpText,
  OptimizedButtonGroup,
} from '../components/shared/optimized-styles';

// Importar os novos componentes
import TimeRecordCard, { TimeRecord } from '../components/TimeRecordCard';
import OvertimeApprovalModal, { OvertimeRequest } from '../components/OvertimeApprovalModal';
import TimeSummaryCard, { TimeSummary } from '../components/TimeSummaryCard';
import DocumentUploadCard from '../components/DocumentUploadCard';
import PayrollTransferCard, { PayrollData } from '../components/PayrollTransferCard';
import DataList, { DataListColumn, DataListAction, DataListItem } from '../components/DataList';

// Styled Components
const TimeClockSection = styled.section<{ $theme: any }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
`;

const CurrentTimeDisplay = styled.div`
  text-align: center;
  margin-bottom: 2rem;
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

const TimeRecordsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  width: 100%;
`;

const OfficialScheduleCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
  margin-bottom: 2rem;
`;

const ScheduleTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
  font-size: 1.2rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ScheduleItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ScheduleLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const ScheduleTime = styled.span<{ $theme: any }>`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.$theme.colors.primary};
`;

const HistorySection = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;

const SectionTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

const RecordsList = styled.div`
  font-size: 0.8rem;
`;

const RecordItem = styled.div`
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
`;

const LocationInfo = styled.div`
  font-size: 0.8rem;
`;

const LocationItem = styled.div`
  font-size: 0.8rem;
`;

// Interfaces
interface TimeClockHistory extends DataListItem {
  id: string;
  date: string;
  records: TimeRecord[];
  totalHours: number;
  location: string;
  wifi: string;
}

export default function TimeClock() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'overtime' | 'document'>('overtime');
  
  // Estados dos dados do usuário
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [horariosOficiais, setHorariosOficiais] = useState<any[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimeSummary | null>(null);
  const [documentosRecentes, setDocumentosRecentes] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any>(null);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [theme, setTheme] = useState({
    colors: {
      primary: '#2E8B57',
      secondary: '#4682B4',
      background: '#f8f9fa',
      text: '#2c3e50',
      shadow: 'rgba(0, 0, 0, 0.1)'
    }
  });

  // Estados dos registros de ponto
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [historyRecords, setHistoryRecords] = useState<TimeClockHistory[]>([]);

  // Filtros
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    type: '',
  });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Para desenvolvimento, vamos fazer login primeiro
        let token = null;
        try {
          // Obter configurações da empresa dinamicamente
          const empresaConfig = await getEmpresaConfig();
          const senhaPadrao = await getDefaultPassword();
          
          const loginResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cpf: empresaConfig.cpf,
              senha: senhaPadrao
            }),
          });
          
          if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            token = loginData.data.token;
          }
        } catch (error) {
          console.log('Login automático falhou, continuando sem autenticação');
        }

        const headers = token ? {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        } : {
          'Content-Type': 'application/json',
        };

        const [userResponse, summaryResponse, overtimeResponse, payrollResponse] = await Promise.all([
          fetch('/api/user/current', { headers }),
          fetch('/api/time-clock/summary', { headers }),
          fetch('/api/time-clock/overtime', { headers }),
          fetch('/api/time-clock/payroll', { headers })
        ]);

        if (userResponse.ok) {
          const userResult = await userResponse.json();
          setCurrentUser(userResult.data.user);
          setHorariosOficiais(userResult.data.horariosOficiais);
          setDocumentosRecentes(userResult.data.documentosRecentes);
          
          // Ajustar tema baseado no perfil do usuário
          if (userResult.data.user.role === 'EMPREGADOR') {
            setTheme({
              colors: {
                primary: '#2E8B57',
                secondary: '#4682B4',
                background: '#f8f9fa',
                text: '#2c3e50',
                shadow: 'rgba(0, 0, 0, 0.1)'
              }
            });
          } else if (userResult.data.user.role === 'EMPREGADO') {
            setTheme({
              colors: {
                primary: '#29ABE2',
                secondary: '#4682B4',
                background: '#f8f9fa',
                text: '#2c3e50',
                shadow: 'rgba(0, 0, 0, 0.1)'
              }
            });
          }
        }

        if (summaryResponse.ok) {
          const summaryResult = await summaryResponse.json();
          setTimeSummary(summaryResult.data);
        }

        if (overtimeResponse.ok) {
          const overtimeResult = await overtimeResponse.json();
          setOvertimeData(overtimeResult.data);
        }

        if (payrollResponse.ok) {
          const payrollResult = await payrollResponse.json();
          setPayrollData(payrollResult.data);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };

    loadUserData();
  }, []);

  // Carregar registros existentes
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/time-clock/records');
        if (response.ok) {
          const result = await response.json();
          const formattedRecords: TimeRecord[] = result.data.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: new Date(record.dataHora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location: record.enderecoCompleto || 'Local não informado',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: new Date(record.dataHora),
          }));
          setTimeRecords(formattedRecords);
        }
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
      }
    };

    loadRecords();
  }, []);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hook centralizado para geolocalização e WiFi (removido - usando apenas nos componentes)
  // const { location, wifiName, captureRealTimeLocation } = useGeolocation();


  // Lógica para determinar o próximo registro possível
  const getNextAvailableRecord = (): TimeRecord['type'] | null => {
    const lastRecord = timeRecords[timeRecords.length - 1];
    
    if (!lastRecord) return 'entrada';
    
    switch (lastRecord.type) {
      case 'entrada':
        return 'saida_almoco';
      case 'saida_almoco':
        return 'retorno_almoco';
      case 'retorno_almoco':
        return 'saida';
      case 'saida':
        return null; // Dia completo
      case 'inicio_extra':
        return 'fim_extra';
      case 'fim_extra':
        return null; // Extra completo
      default:
        return null;
    }
  };

  // Verificar se pode registrar hora extra
  const canRequestOvertime = (): boolean => {
    const lastRecord = timeRecords[timeRecords.length - 1];
    return lastRecord?.type === 'saida';
  };


  // Handler para registrar ponto
  const handleTimeRecord = async (type: TimeRecord['type']) => {
    try {
      console.log(`🕐 Iniciando registro de ${type}...`);
      
      // Geolocalização agora é capturada automaticamente pelo TimeRecordCard
      const response = await fetch('/api/time-clock/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: type,
          observacao: `Registro via interface web - ${type}`,
          // Dados de localização serão capturados pelo TimeRecordCard
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const now = new Date();
        
        const timeString = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        // Criar novo registro (localização será capturada pelo TimeRecordCard)
        const newRecord: TimeRecord = {
          id: result.data.id,
          type,
          time: timeString,
          location: 'Localização capturada automaticamente',
          wifi: 'WiFi detectado automaticamente',
          timestamp: now,
        };

        setTimeRecords(prev => [...prev, newRecord]);
        
        toast.success(`Ponto registrado com sucesso: ${timeString}`, {
          position: 'top-center',
          autoClose: 3000,
        });
      } else {
        throw new Error('Erro ao registrar ponto');
      }
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      toast.error('Erro ao registrar ponto. Tente novamente.', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  // Handler para solicitar hora extra
  const handleOvertimeRequest = (request: OvertimeRequest) => {
    setOvertimeRequests(prev => [request, ...prev]);
    toast.success('Solicitação de hora extra enviada para aprovação!');
  };

  // Handler para upload de documentos
  const handleDocumentUpload = (files: FileList) => {
    // Aqui seria integrado com o sistema de gestão de documentos
    toast.success(`${files.length} documento(s) enviado(s) com sucesso!`);
  };

  // Handler para transferir para folha de pagamento
  const handlePayrollTransfer = async () => {
    // Simular transferência
    await new Promise(resolve => setTimeout(resolve, 2000));
    toast.success('Dados transferidos para folha de pagamento com sucesso!');
  };

  // Dados para transferência de folha (agora carregados do banco via estado payrollData)

  // Configuração das colunas para histórico
  const historyColumns: DataListColumn[] = [
    {
      key: 'date',
      label: 'Data',
      width: '120px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return new Date(history.date).toLocaleDateString('pt-BR');
      },
    },
    {
      key: 'records',
      label: 'Registros',
      width: '300px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return (
          <RecordsList>
            {history.records.map((record, index) => (
              <RecordItem key={index}>
                <strong>{record.type}:</strong> {record.time || '--:--'}
              </RecordItem>
            ))}
          </RecordsList>
        );
      },
    },
    {
      key: 'totalHours',
      label: 'Total',
      width: '100px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        const hours = Math.floor(history.totalHours / 60);
        const minutes = history.totalHours % 60;
        return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
      },
    },
    {
      key: 'location',
      label: 'Localização',
      width: '200px',
      render: (item: DataListItem) => {
        const history = item as TimeClockHistory;
        return (
          <LocationInfo>
            <LocationItem><AccessibleEmoji emoji="📍" label="Localização" /> {history.location}</LocationItem>
            <LocationItem><AccessibleEmoji emoji="📶" label="WiFi" /> {history.wifi}</LocationItem>
          </LocationInfo>
        );
      },
    },
  ];

  // Configuração das ações para histórico
  const historyActions: DataListAction[] = [
    {
      icon: '✏️',
      label: 'Editar registros',
      variant: 'primary',
      onClick: (item: DataListItem) => {
        toast.info('Funcionalidade de edição em desenvolvimento');
      },
    },
    {
      icon: '👁️',
      label: 'Ver detalhes',
      variant: 'secondary',
      onClick: (item: DataListItem) => {
        toast.info('Funcionalidade de detalhes em desenvolvimento');
      },
    },
  ];

  const nextAvailableRecord = getNextAvailableRecord();

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentUser?.avatar || 'U'}
          userName={currentUser?.nomeCompleto || 'Usuário'}
          userRole={currentUser?.role || 'Usuário'}
          notificationCount={overtimeRequests.filter(r => r.status === 'pending').length}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Controle de Ponto'
        subtitle='Registre sua entrada, saída, intervalos e horas extras de forma segura'
      />

      {/* Relógio Atual */}
      <TimeClockSection $theme={theme}>
        <CurrentTimeDisplay>
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
        </CurrentTimeDisplay>

        {/* Cards de Registro de Horários */}
        <TimeRecordsGrid>
          <TimeRecordCard
            record={{ id: 'entrada', type: 'entrada', time: timeRecords.find(r => r.type === 'entrada')?.time }}
            theme={theme}
            onClick={() => handleTimeRecord('entrada')}
            isDisabled={nextAvailableRecord !== 'entrada'}
          />
          
          <TimeRecordCard
            record={{ id: 'saida_almoco', type: 'saida_almoco', time: timeRecords.find(r => r.type === 'saida_almoco')?.time }}
            theme={theme}
            onClick={() => handleTimeRecord('saida_almoco')}
            isDisabled={nextAvailableRecord !== 'saida_almoco'}
          />
          
          <TimeRecordCard
            record={{ id: 'retorno_almoco', type: 'retorno_almoco', time: timeRecords.find(r => r.type === 'retorno_almoco')?.time }}
            theme={theme}
            onClick={() => handleTimeRecord('retorno_almoco')}
            isDisabled={nextAvailableRecord !== 'retorno_almoco'}
          />
          
          <TimeRecordCard
            record={{ id: 'saida', type: 'saida', time: timeRecords.find(r => r.type === 'saida')?.time }}
            theme={theme}
            onClick={() => handleTimeRecord('saida')}
            isDisabled={nextAvailableRecord !== 'saida'}
          />
          
          <TimeRecordCard
            record={{ id: 'inicio_extra', type: 'inicio_extra', time: timeRecords.find(r => r.type === 'inicio_extra')?.time }}
            theme={theme}
            onClick={() => {
              setModalType('overtime');
              setModalOpen(true);
            }}
            isDisabled={!canRequestOvertime()}
          />
          
          <TimeRecordCard
            record={{ id: 'fim_extra', type: 'fim_extra', time: timeRecords.find(r => r.type === 'fim_extra')?.time }}
            theme={theme}
            onClick={() => handleTimeRecord('fim_extra')}
            isDisabled={nextAvailableRecord !== 'fim_extra'}
          />
        </TimeRecordsGrid>
      </TimeClockSection>

      {/* Horário Oficial Esperado */}
      <OfficialScheduleCard $theme={theme}>
        <ScheduleTitle>
          <AccessibleEmoji emoji="📅" label="Horário" />
          Horário de Trabalho Oficial
        </ScheduleTitle>
        {horariosOficiais.length > 0 ? (
          horariosOficiais.map((horario) => (
            <div key={horario.id}>
              <ScheduleItem>
                <ScheduleLabel>Entrada:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.entrada}</ScheduleTime>
              </ScheduleItem>
              <ScheduleItem>
                <ScheduleLabel>Saída Almoço:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.intervaloInicio || '--:--'}</ScheduleTime>
              </ScheduleItem>
              <ScheduleItem>
                <ScheduleLabel>Retorno Almoço:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.intervaloFim || '--:--'}</ScheduleTime>
              </ScheduleItem>
              <ScheduleItem>
                <ScheduleLabel>Saída:</ScheduleLabel>
                <ScheduleTime $theme={theme}>{horario.saida}</ScheduleTime>
              </ScheduleItem>
            </div>
          ))
        ) : (
          <EmptyState>
            <div className="empty-icon">⏰</div>
            <div className="empty-title">Horários oficiais não configurados</div>
          </EmptyState>
        )}
      </OfficialScheduleCard>

      {/* Cards de Resumo de Horas */}
      {timeSummary && <TimeSummaryCard summary={timeSummary} theme={theme} overtimeData={overtimeData} />}

      {/* Card de Upload de Documentos */}
      <DocumentUploadCard
        theme={theme}
        onFileUpload={handleDocumentUpload}
        recentDocuments={documentosRecentes.map(doc => ({
          id: doc.id,
          name: doc.nome,
          type: doc.tipo,
          uploadDate: doc.criadoEm
        }))}
      />

      {/* Card de Transferência para Folha */}
      <PayrollTransferCard
        theme={theme}
        payrollData={{
          totalHours: timeSummary?.day?.worked ? timeSummary.day.worked / 60 : 0,
          regularHours: timeSummary?.day?.expected ? timeSummary.day.expected / 60 : 8,
          overtimeHours: overtimeData?.totalOvertime ? parseFloat(overtimeData.totalOvertime) : 0,
          period: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
          lastTransfer: payrollData?.lastTransfer?.criadoEm ? new Date(payrollData.lastTransfer.criadoEm) : undefined,
          ...payrollData // Incluir dados reais da API
        }}
        onTransfer={handlePayrollTransfer}
        onViewDetails={() => toast.info('Detalhes em desenvolvimento')}
      />

      {/* Filtros para Histórico */}
      <FilterSection $theme={theme} title='Filtros do Histórico'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Data Inicial</OptimizedLabel>
            <Input
              $theme={theme}
              type='date'
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, dateFrom: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Data Final</OptimizedLabel>
            <Input
              $theme={theme}
              type='date'
              value={filters.dateTo}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, dateTo: e.target.value }))
              }
            />
          </FormGroup>
          <FormGroup>
            <OptimizedLabel>Tipo de Registro</OptimizedLabel>
            <Select
              $theme={theme}
              value={filters.type}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
              title="Filtrar por tipo de registro"
              aria-label="Selecionar tipo de registro"
            >
              <option value=''>Todos os tipos</option>
              <option value='entrada'>Entrada</option>
              <option value='saida_almoco'>Saída Almoço</option>
              <option value='retorno_almoco'>Retorno Almoço</option>
              <option value='saida'>Saída</option>
              <option value='extra'>Horas Extras</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {/* Histórico de Registros */}
      <HistorySection $theme={theme}>
        <SectionTitle>
          <AccessibleEmoji emoji="📋" label="Histórico" />
          Histórico de Registros
        </SectionTitle>
        
        {historyRecords.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">
              <AccessibleEmoji emoji="📅" label="Calendário" />
            </div>
            <div className="empty-title">Nenhum registro encontrado</div>
            <div className="empty-description">
              Os registros de ponto aparecerão aqui conforme você for registrando
            </div>
          </EmptyState>
        ) : (
          <DataList
            theme={theme}
            items={historyRecords}
            columns={historyColumns}
            actions={historyActions}
            onItemClick={(item) => {
              toast.info('Detalhes do registro em desenvolvimento');
            }}
            emptyMessage="Nenhum registro encontrado para o período selecionado."
            variant="detailed"
            showHeader={true}
            striped={true}
            hoverable={true}
          />
        )}
      </HistorySection>

      {/* Modal de Aprovação de Horas Extras */}
      <OvertimeApprovalModal
        isOpen={modalOpen && modalType === 'overtime'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleOvertimeRequest}
        theme={theme}
      />

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