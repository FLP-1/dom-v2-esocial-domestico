import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { UnifiedButton } from '../components/unified';
import CertificateUploadModal from '../components/CertificateUploadModal';
import { Form, FormGroup, Input, Select } from '../components/FormComponents';
import { UnifiedModal } from '../components/unified';
import ProxyUploadModal from '../components/ProxyUploadModal';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import { ESOCIAL_CONFIG } from '../config/esocial';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useAlertManager } from '../hooks/useAlertManager';
import { useTheme } from '../hooks/useTheme';
import type {
  CertificateInfo,
  ESocialConfig,
  ProxyInfo,
} from '../services/esocialHybridApi';
import { getESocialApiService } from '../services/esocialHybridApi';
// Imports SOAP removidos - usando apenas gov.br OAuth2
import { validateCpf } from '../utils/cpfValidator';
import {
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedFlexContainer,
} from '../components/shared/optimized-styles';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components para substituir estilos inline
const CenterText = styled.div`
  text-align: center;
  color: #7f8c8d;
  margin-top: 0.5rem;
`;

const ErrorText = styled.div`
  color: #e74c3c;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const SmallText = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
`;

const ApiStatusIndicator = styled.span<{ $isReal: boolean }>`
  color: ${props => (props.$isReal ? '#27ae60' : '#f39c12')};
  font-weight: bold;
`;

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const SSLWarningText = styled.div`
  color: #ff6b35;
  font-weight: bold;
`;

const SSLWarningDescription = styled.div`
  font-size: 0.9rem;
  margin-top: 8px;
`;

const DataSourceIndicator = styled.span<{ $isReal: boolean }>`
  font-size: 0.8rem;
  color: ${props => (props.$isReal ? '#27ae60' : '#f39c12')};
  margin-left: 10px;
  font-weight: bold;
`;

const SuccessText = styled.span`
  color: #90ee90;
  font-weight: 600;
`;

const ErrorSpan = styled.span`
  color: #e74c3c;
`;

const SelectWrapper = styled.div`
  width: 120px;
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

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroupStyled = styled(FormGroup)`
  position: relative;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $theme: any; $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const SelectStyled = styled(Select)<{ $theme: any; $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-weight: 500;
`;

const HelpText = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
  margin-top: 0.25rem;
  font-style: italic;
`;

const EventsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EventCard = styled.div<{ $status: string; $theme: any }>`
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid
    ${props => {
      switch (props.$status) {
        case 'pending':
          return '#f39c12';
        case 'sent':
          return props.$theme?.colors?.primary || '#29ABE2';
        case 'processed':
          return props.$theme?.colors?.success || '#90EE90';
        case 'error':
          return '#e74c3c';
        default:
          return '#95a5a6';
      }
    }};
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
`;

const EventHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const EventTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0;
`;

const EventStatus = styled.span<{ $status: string; $theme: any }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$status) {
      case 'pending':
        return '#f39c12';
      case 'sent':
        return props.$theme?.colors?.primary || '#29ABE2';
      case 'processed':
        return props.$theme?.colors?.success || '#90EE90';
      case 'error':
        return '#e74c3c';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

const EventDescription = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0 0 1rem 0;
  line-height: 1.4;
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ProgressBar = styled.div<{ $theme: any }>`
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
  margin: 1rem 0;
`;

const ProgressFill = styled.div<{ $progress: number; $theme: any }>`
  height: 100%;
  width: ${props => props.$progress}%;
  background: linear-gradient(
    90deg,
    ${props => props.$theme?.colors?.primary || '#29ABE2'},
    ${props => props.$theme?.colors?.success || '#90EE90'}
  );
  border-radius: 4px;
  transition: width 0.3s ease;
  animation: ${pulse} 2s infinite;
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

const ConfigSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  margin-bottom: 2rem;
`;

const ConfigItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid #e9ecef;

  &:last-child {
    border-bottom: none;
  }
`;

const ConfigLabel = styled.div`
  font-weight: 600;
  color: #2c3e50;
`;

const ConfigValue = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const ToggleSwitch = styled.label<{ $theme: any }>`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: '';
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + .slider {
    background-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }

  input:checked + .slider:before {
    transform: translateX(26px);
  }
`;

// Interfaces
interface EmployerData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
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

interface EmployeeData {
  cpf: string;
  nome: string;
  dataNascimento: string;
  pis: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  salario: string;
  dataAdmissao: string;
  cargo: string;
}

interface ESocialEvent {
  id: string;
  tipo: string;
  descricao: string;
  status: 'pending' | 'sent' | 'processed' | 'error';
  dataEnvio?: string;
  dataProcessamento?: string;
  erro?: string;
  xml?: string;
  versao?: string;
  protocolo?: string;
}

// Dados mock locais (centralized não existe)
const MOCK_EVENTOS_ESOCIAL = [];
const MOCK_EMPREGADOS = [];

// Usar dados centralizados
const mockEvents: ESocialEvent[] = MOCK_EVENTOS_ESOCIAL;

const ESocialIntegration: React.FC = () => {
  const router = useRouter();
  const alertManager = useAlertManager();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const [collapsed, setCollapsed] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Verificar se estamos no cliente para evitar erros de hidratação
  useEffect(() => {
    setIsClient(true);
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<ESocialEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<ESocialEvent | null>(null);

  // Estados para dados carregados
  const [loadedEmployerData, setLoadedEmployerData] = useState<any>(null);
  const [loadedEmployeesData, setLoadedEmployeesData] = useState<any[]>([]);
  const [loadedEventsData, setLoadedEventsData] = useState<any[]>([]);
  const [isEventUnifiedModalOpen, setIsEventUnifiedModalOpen] = useState(false);
  const [isCertificateUnifiedModalOpen, setIsCertificateUnifiedModalOpen] =
    useState(false);
  const [isProxyUnifiedModalOpen, setIsProxyUnifiedModalOpen] = useState(false);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [esocialConfig, setEsocialConfig] = useState<ESocialConfig>({
    environment: 'homologacao', // Usar homologação para testes
    companyId: ESOCIAL_CONFIG.empregador.cpf,
    useRealApi: true, // Usar API real do eSocial
  });

  // Estado SOAP removido - usando apenas gov.br OAuth2
  // Modo SOAP removido - usando apenas gov.br OAuth2

  const [employerData, setEmployerData] = useState<EmployerData>({
    cpf: currentProfile?.cpf || '',
    nome: currentProfile?.name || '',
    dataNascimento: currentProfile?.dataNascimento || '',
    endereco: {
      logradouro: currentProfile?.endereco?.logradouro || '',
      numero: currentProfile?.endereco?.numero || '',
      complemento: currentProfile?.endereco?.complemento || '',
      bairro: currentProfile?.endereco?.bairro || '',
      cidade: currentProfile?.endereco?.cidade || '',
      uf: currentProfile?.endereco?.uf || '',
      cep: currentProfile?.endereco?.cep || '',
    },
    contato: {
      telefone: currentProfile?.contato?.telefone || '',
      email: currentProfile?.contato?.email || '',
    },
  });

  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    cpf: '',
    nome: '',
    dataNascimento: '',
    pis: '',
    endereco: {
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
      cep: '',
    },
    contato: {
      telefone: '',
      email: '',
    },
    salario: '',
    dataAdmissao: '',
    cargo: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Inicializar serviço eSocial
  useEffect(() => {
    try {
      //
      getESocialApiService(esocialConfig);
      //
    } catch (error) {
      // console.error('❌ Erro ao inicializar serviço eSocial:', error);
    }
  }, [esocialConfig]);

  // Atualizar dados do empregador quando o perfil mudar
  useEffect(() => {
    if (currentProfile) {
      setEmployerData({
        cpf: currentProfile.cpf || '',
        nome: currentProfile.name || '',
        dataNascimento: currentProfile.dataNascimento || '',
        endereco: {
          logradouro: currentProfile.endereco?.logradouro || '',
          numero: currentProfile.endereco?.numero || '',
          complemento: currentProfile.endereco?.complemento || '',
          bairro: currentProfile.endereco?.bairro || '',
          cidade: currentProfile.endereco?.cidade || '',
          uf: currentProfile.endereco?.uf || '',
          cep: currentProfile.endereco?.cep || '',
        },
        contato: {
          telefone: currentProfile.contato?.telefone || '',
          email: currentProfile.contato?.email || '',
        },
      });
    }
  }, [currentProfile]);

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cpf':
        if (value && !validateCpf(value)) {
          newErrors[field] = 'CPF inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors[field] = 'Email inválido';
        } else {
          delete newErrors[field];
        }
        break;
      case 'cep':
        if (value && value.replace(/\D/g, '').length !== 8) {
          newErrors[field] = 'CEP deve ter 8 dígitos';
        } else {
          delete newErrors[field];
        }
        break;
      default:
        if (value.trim() === '') {
          newErrors[field] = 'Campo obrigatório';
        } else {
          delete newErrors[field];
        }
    }

    setErrors(newErrors);
  };

  const handleEmployerDataChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEmployerData(prev => ({
        ...prev,
        [parent as keyof typeof prev]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as any]: formattedValue,
        },
      }));
    } else {
      setEmployerData(prev => ({ ...prev, [field]: formattedValue }));
    }

    validateField(field, formattedValue);
  };

  const handleEmployeeDataChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setEmployeeData(prev => ({
        ...prev,
        [parent as keyof typeof prev]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as any]: formattedValue,
        },
      }));
    } else {
      setEmployeeData(prev => ({ ...prev, [field]: formattedValue }));
    }

    validateField(field, formattedValue);
  };

  const handleSendEvent = async (event: ESocialEvent) => {
    setIsLoading(true);
    setProgress(0);

    try {
      // Inicializar serviço eSocial
      const esocialApi = getESocialApiService(esocialConfig);

      // Gerar XML do evento
      const eventData = {
        ...employerData,
        ...employeeData,
        empregadorCpf: employerData.cpf,
        dataInicio: employeeData.dataAdmissao,
        codigoCargo: '001',
        codigoFuncao: '001',
        matricula: '001',
        sexo: 'M',
        racaCor: '01',
        estadoCivil: '01',
        grauInstrucao: '01',
        nomeSocial: employeeData.nome,
        codigoCategoria: '001',
      };

      const xml = esocialApi.generateEventXML(event.tipo, eventData);

      // Criar evento com XML
      const eventWithXml: ESocialEvent = {
        ...event,
        xml,
        versao: 'S_01_00_00',
      };

      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Enviar evento
      const response = await esocialApi.sendEvent(eventWithXml);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.success) {
        setEvents(prevEvents =>
          prevEvents.map(e =>
            e.id === event.id
              ? {
                  ...e,
                  status: 'sent' as const,
                  dataEnvio: new Date().toISOString(),
                  ...(response.protocolo && { protocolo: response.protocolo }),
                  ...(xml && { xml }),
                }
              : e
          )
        );
        alertManager.showSuccess(
          `Evento ${event.tipo} enviado com sucesso! Protocolo: ${response.protocolo}`
        );
      } else {
        setEvents(prevEvents =>
          prevEvents.map(e =>
            e.id === event.id
              ? {
                  ...e,
                  status: 'error' as const,
                  erro: response.erro || 'Erro desconhecido',
                }
              : e
          )
        );
        alertManager.showError(
          `Erro ao enviar evento ${event.tipo}: ${response.erro}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro desconhecido';
      setEvents(prevEvents =>
        prevEvents.map(e =>
          e.id === event.id
            ? {
                ...e,
                status: 'error' as const,
                erro: errorMessage,
              }
            : e
        )
      );
      alertManager.showError(`Erro ao enviar evento: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleViewEvent = (event: ESocialEvent) => {
    setSelectedEvent(event);
    setIsEventUnifiedModalOpen(true);
  };

  const handleCertificateSuccess = (certInfo: CertificateInfo) => {
    setCertificateInfo(certInfo);
    setEsocialConfig(prev => ({ ...prev, certificatePath: 'configured' }));
    alertManager.showSuccess('Certificado digital configurado com sucesso!');
  };

  const handleProxySuccess = (proxyInfo: ProxyInfo) => {
    setProxyInfo(proxyInfo);
    setEsocialConfig(prev => ({ ...prev, proxyPath: 'configured' }));
    alertManager.showSuccess('Procuração eletrônica configurada com sucesso!');
  };

  const handleLoadEmpregadorData = async () => {
    setIsLoading(true);
    try {
      // Tentar usar SOAP real primeiro
      if (certificateInfo) {
        try {
          const response = await fetch('/api/esocial-soap-real', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'consultarEmpregador',
              cpfCnpj: esocialConfig.companyId,
              environment: esocialConfig.environment,
              certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
              certificatePassword: '456587',
            }),
          });

          const result = await response.json();
          if (result.success) {
            const dadosEmpregador = result.data;

            // Armazenar dados carregados
            setLoadedEmployerData(dadosEmpregador);

            // Atualizar dados do empregador na interface
            setEmployerData(prev => ({
              ...prev,
              cpf: dadosEmpregador.cpf,
              nome: dadosEmpregador.nome,
              endereco: {
                logradouro: dadosEmpregador.endereco.logradouro,
                numero: dadosEmpregador.endereco.numero || '',
                complemento: dadosEmpregador.endereco.complemento || '',
                bairro: dadosEmpregador.endereco.bairro,
                cidade: dadosEmpregador.endereco.cidade,
                uf: dadosEmpregador.endereco.uf,
                cep: dadosEmpregador.endereco.cep,
              },
              contato: {
                telefone: dadosEmpregador.contato.telefone,
                email: dadosEmpregador.contato.email,
              },
            }));

            alertManager.showSuccess(
              'Dados do empregador carregados via SOAP real!'
            );
            return;
          } else {
            // Erro no SOAP real, usando simulação
          }
        } catch (soapError) {
          // Erro na conexão SOAP, usando simulação
        }
      }

      // Fallback para dados simulados
      const dadosEmpregador = {
        cpf: esocialConfig.companyId,
        nome: 'FRANCISCO JOSE LATTARI PAPALEO',
        razaoSocial: 'FLP Business Strategy',
        endereco: {
          logradouro: 'Rua das Flores, 123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234567',
        },
        contato: {
          telefone: '(11) 99999-9999',
          email: 'francisco@flpbusiness.com',
        },
        situacao: 'ATIVO',
        dataCadastro: '2024-01-01',
        ultimaAtualizacao: new Date().toISOString(),
        fonte: 'SIMULADO',
      };

      // Armazenar dados carregados
      setLoadedEmployerData(dadosEmpregador);

      // Atualizar dados do empregador na interface
      setEmployerData(prev => ({
        ...prev,
        cpf: dadosEmpregador.cpf,
        nome: dadosEmpregador.nome,
        endereco: {
          logradouro: dadosEmpregador.endereco.logradouro,
          numero: '',
          complemento: '',
          bairro: dadosEmpregador.endereco.bairro,
          cidade: dadosEmpregador.endereco.cidade,
          uf: dadosEmpregador.endereco.uf,
          cep: dadosEmpregador.endereco.cep,
        },
        contato: {
          telefone: dadosEmpregador.contato.telefone,
          email: dadosEmpregador.contato.email,
        },
      }));

      alertManager.showSuccess('Dados do empregador carregados (simulação)!');
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar dados do empregador: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEmpregadosData = async () => {
    setIsLoading(true);
    try {
      // Usar serviço híbrido (REST) - DESABILITADO TEMPORARIAMENTE
      // const esocialApi = getESocialApiService(esocialConfig);
      // dadosEmpregados = await esocialApi.consultarDadosEmpregados();

      // Usar dados centralizados
      const dadosEmpregados = MOCK_EMPREGADOS;

      // Armazenar dados carregados
      setLoadedEmployeesData(dadosEmpregados);

      // Mostrar dados dos empregados em um modal ou toast
      alertManager.showSuccess(
        `${dadosEmpregados.length} empregados carregados com sucesso!`
      );
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar dados dos empregados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoadEventosData = async () => {
    setIsLoading(true);
    try {
      // Usar serviço híbrido (REST) - DESABILITADO TEMPORARIAMENTE
      // const esocialApi = getESocialApiService(esocialConfig);
      // eventosEnviados = await esocialApi.consultarEventosEnviados();

      // Fallback para dados simulados
      const eventosEnviados = [
        {
          id: '1',
          tipo: 'S1000',
          descricao: 'Cadastramento Inicial do Vínculo',
          dataEnvio: '2024-01-01T10:00:00Z',
          status: 'PROCESSADO',
          protocolo: '12345678901234567890',
          fonte: 'SIMULADO_TEMPORARIO',
        },
        {
          id: '2',
          tipo: 'S2200',
          descricao:
            'Cadastramento Inicial do Vínculo e Admissão/Ingresso de Trabalhador',
          dataEnvio: '2024-01-02T10:00:00Z',
          status: 'PROCESSADO',
          protocolo: '12345678901234567891',
          fonte: 'SIMULADO_TEMPORARIO',
        },
      ];

      // Armazenar dados carregados
      setLoadedEventsData(eventosEnviados);

      // Mostrar eventos em um modal ou toast
      alertManager.showSuccess(
        `${eventosEnviados.length} eventos encontrados!`
      );
    } catch (error) {
      alertManager.showError(
        `Erro ao carregar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendente';
      case 'sent':
        return 'Enviado';
      case 'processed':
        return 'Processado';
      case 'error':
        return 'Com Erro';
      default:
        return 'Desconhecido';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳';
      case 'sent':
        return <AccessibleEmoji emoji='📤' label='Exportar' />;
      case 'processed':
        return <AccessibleEmoji emoji='✅' label='Sucesso' />;
      case 'error':
        return <AccessibleEmoji emoji='❌' label='Erro' />;
      default:
        return <AccessibleEmoji emoji='❓' label='Desconhecido' />;
    }
  };

  const pendingEvents = events.filter(e => e.status === 'pending').length;
  const errorEvents = events.filter(e => e.status === 'error').length;
  const processedEvents = events.filter(e => e.status === 'processed').length;

  return (
    <Container>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        currentPath={router.pathname}
      />
      <MainContent>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={pendingEvents + errorEvents}
          onNotificationClick={() => {}}
        />

        <Header>
          <div>
            <Title>
              <AccessibleEmoji emoji='🏛' label='Governo' /> Integração eSocial
              Doméstico
            </Title>
            <Subtitle>
              Gerencie a integração com o eSocial para empregados domésticos
            </Subtitle>
          </div>
          <StatusBadge $status='connected' $theme={theme}>
            <AccessibleEmoji emoji='🟢' label='Conectado' /> Conectado
          </StatusBadge>
        </Header>

        {/* Alertas */}
        {errorEvents > 0 && (
          <AlertBanner $type='error' $theme={theme}>
            <AlertIcon>
              <AccessibleEmoji emoji='⚠' label='Aviso' />
            </AlertIcon>
            <AlertText>
              {errorEvents} evento(s) com erro. Verifique os detalhes e corrija
              os problemas.
            </AlertText>
          </AlertBanner>
        )}

        {pendingEvents > 0 && (
          <AlertBanner $type='warning' $theme={theme}>
            <AlertIcon>
              <AccessibleEmoji emoji='⏳' label='Carregando' />
            </AlertIcon>
            <AlertText>
              {pendingEvents} evento(s) pendente(s) de envio para o eSocial.
            </AlertText>
          </AlertBanner>
        )}

        {/* Estatísticas */}
        <StatsGrid>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{events.length}</StatNumber>
            <StatLabel>Total de Eventos</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{processedEvents}</StatNumber>
            <StatLabel>Processados</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{pendingEvents}</StatNumber>
            <StatLabel>Pendentes</StatLabel>
          </StatCard>
          <StatCard $theme={theme}>
            <StatNumber $theme={theme}>{errorEvents}</StatNumber>
            <StatLabel>Com Erro</StatLabel>
          </StatCard>
        </StatsGrid>

        {/* Barra de Progresso */}
        {isLoading && (
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Enviando para
              eSocial...
            </OptimizedSectionTitle>
            <ProgressBar $theme={theme}>
              <ProgressFill $progress={progress} $theme={theme} />
            </ProgressBar>
            <CenterText>{progress}% concluído</CenterText>
          </Section>
        )}

        <ContentGrid>
          {/* Dados do Empregador */}
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👔' label='Empregador' /> Dados do
              Empregador
            </OptimizedSectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-cpf'>CPF *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-cpf'
                    type='text'
                    value={employerData.cpf}
                    onChange={e =>
                      handleEmployerDataChange('cpf', e.target.value)
                    }
                    placeholder='000.000.000-00'
                    maxLength={14}
                    $theme={theme}
                    $hasError={!!errors['cpf']}
                  />
                  {errors['cpf'] && (
                    <OptimizedErrorMessage>
                      {errors['cpf']}
                    </OptimizedErrorMessage>
                  )}
                  <OptimizedHelpText>
                    CPF do empregador responsável
                  </OptimizedHelpText>
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-nome'>
                    Nome Completo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-nome'
                    type='text'
                    value={employerData.nome}
                    onChange={e =>
                      handleEmployerDataChange('nome', e.target.value)
                    }
                    placeholder='Nome completo do empregador'
                    $theme={theme}
                    $hasError={!!errors['nome']}
                  />
                  {errors['nome'] && (
                    <OptimizedErrorMessage>
                      {errors['nome']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-nascimento'>
                    Data de Nascimento *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-nascimento'
                    type='date'
                    value={employerData.dataNascimento}
                    onChange={e =>
                      handleEmployerDataChange('dataNascimento', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['dataNascimento']}
                  />
                  {errors['dataNascimento'] && (
                    <OptimizedErrorMessage>
                      {errors['dataNascimento']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-telefone'>
                    Telefone *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-telefone'
                    type='text'
                    value={employerData.contato.telefone}
                    onChange={e =>
                      handleEmployerDataChange(
                        'contato.telefone',
                        e.target.value
                      )
                    }
                    placeholder='(00) 00000-0000'
                    maxLength={15}
                    $theme={theme}
                    $hasError={!!errors['telefone']}
                  />
                  {errors['telefone'] && (
                    <OptimizedErrorMessage>
                      {errors['telefone']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <FormGroupStyled>
                <OptimizedLabel htmlFor='employer-email'>
                  Email *
                </OptimizedLabel>
                <OptimizedInputStyled
                  id='employer-email'
                  type='email'
                  value={employerData.contato.email}
                  onChange={e =>
                    handleEmployerDataChange('contato.email', e.target.value)
                  }
                  placeholder='empregador@email.com'
                  $theme={theme}
                  $hasError={!!errors['email']}
                />
                {errors['email'] && (
                  <OptimizedErrorMessage>
                    {errors['email']}
                  </OptimizedErrorMessage>
                )}
              </FormGroupStyled>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-cep'>CEP *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employer-cep'
                    type='text'
                    value={employerData.endereco.cep}
                    onChange={e =>
                      handleEmployerDataChange('endereco.cep', e.target.value)
                    }
                    placeholder='00000-000'
                    maxLength={9}
                    $theme={theme}
                    $hasError={!!errors['cep']}
                  />
                  {errors['cep'] && (
                    <OptimizedErrorMessage>
                      {errors['cep']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employer-uf'>UF *</OptimizedLabel>
                  <OptimizedSelectStyled
                    id='employer-uf'
                    value={employerData.endereco.uf}
                    onChange={e =>
                      handleEmployerDataChange('endereco.uf', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['uf']}
                    aria-label='Selecionar UF'
                    title='Selecionar UF'
                  >
                    <option value=''>Selecione</option>
                    <option value='AC'>AC</option>
                    <option value='AL'>AL</option>
                    <option value='AP'>AP</option>
                    <option value='AM'>AM</option>
                    <option value='BA'>BA</option>
                    <option value='CE'>CE</option>
                    <option value='DF'>DF</option>
                    <option value='ES'>ES</option>
                    <option value='GO'>GO</option>
                    <option value='MA'>MA</option>
                    <option value='MT'>MT</option>
                    <option value='MS'>MS</option>
                    <option value='MG'>MG</option>
                    <option value='PA'>PA</option>
                    <option value='PB'>PB</option>
                    <option value='PR'>PR</option>
                    <option value='PE'>PE</option>
                    <option value='PI'>PI</option>
                    <option value='RJ'>RJ</option>
                    <option value='RN'>RN</option>
                    <option value='RS'>RS</option>
                    <option value='RO'>RO</option>
                    <option value='RR'>RR</option>
                    <option value='SC'>SC</option>
                    <option value='SP'>SP</option>
                    <option value='SE'>SE</option>
                    <option value='TO'>TO</option>
                  </OptimizedSelectStyled>
                  {errors['uf'] && (
                    <OptimizedErrorMessage>
                      {errors['uf']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>
            </Form>
          </Section>

          {/* Dados do Empregado */}
          <Section>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👤' label='Pessoa' /> Dados do Empregado
            </OptimizedSectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-cpf'>CPF *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-cpf'
                    type='text'
                    value={employeeData.cpf}
                    onChange={e =>
                      handleEmployeeDataChange('cpf', e.target.value)
                    }
                    placeholder='000.000.000-00'
                    maxLength={14}
                    $theme={theme}
                    $hasError={!!errors['employeeCpf']}
                  />
                  {errors['employeeCpf'] && (
                    <OptimizedErrorMessage>
                      {errors['employeeCpf']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-nome'>
                    Nome Completo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-nome'
                    type='text'
                    value={employeeData.nome}
                    onChange={e =>
                      handleEmployeeDataChange('nome', e.target.value)
                    }
                    placeholder='Nome completo do empregado'
                    $theme={theme}
                    $hasError={!!errors['employeeNome']}
                  />
                  {errors['employeeNome'] && (
                    <OptimizedErrorMessage>
                      {errors['employeeNome']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-pis'>PIS *</OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-pis'
                    type='text'
                    value={employeeData.pis}
                    onChange={e =>
                      handleEmployeeDataChange('pis', e.target.value)
                    }
                    placeholder='000.00000.00-0'
                    $theme={theme}
                    $hasError={!!errors['pis']}
                  />
                  {errors['pis'] && (
                    <OptimizedErrorMessage>
                      {errors['pis']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-salario'>
                    Salário *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-salario'
                    type='text'
                    value={employeeData.salario}
                    onChange={e =>
                      handleEmployeeDataChange('salario', e.target.value)
                    }
                    placeholder='R$ 0,00'
                    $theme={theme}
                    $hasError={!!errors['salario']}
                  />
                  {errors['salario'] && (
                    <OptimizedErrorMessage>
                      {errors['salario']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>

              <OptimizedFormRow>
                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-admissao'>
                    Data de Admissão *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-admissao'
                    type='date'
                    value={employeeData.dataAdmissao}
                    onChange={e =>
                      handleEmployeeDataChange('dataAdmissao', e.target.value)
                    }
                    $theme={theme}
                    $hasError={!!errors['dataAdmissao']}
                  />
                  {errors['dataAdmissao'] && (
                    <OptimizedErrorMessage>
                      {errors['dataAdmissao']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <OptimizedLabel htmlFor='employee-cargo'>
                    Cargo *
                  </OptimizedLabel>
                  <OptimizedInputStyled
                    id='employee-cargo'
                    type='text'
                    value={employeeData.cargo}
                    onChange={e =>
                      handleEmployeeDataChange('cargo', e.target.value)
                    }
                    placeholder='Ex: Empregado Doméstico'
                    $theme={theme}
                    $hasError={!!errors['cargo']}
                  />
                  {errors['cargo'] && (
                    <OptimizedErrorMessage>
                      {errors['cargo']}
                    </OptimizedErrorMessage>
                  )}
                </FormGroupStyled>
              </OptimizedFormRow>
            </Form>
          </Section>
        </ContentGrid>

        {/* Lista de Eventos */}
        <Section>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📋' label='Checklist' /> Eventos eSocial
          </OptimizedSectionTitle>
          <EventsList>
            {events.map(event => (
              <EventCard key={event.id} $status={event.status} $theme={theme}>
                <EventHeader>
                  <EventTitle>
                    {getStatusIcon(event.status)} {event.tipo} -{' '}
                    {event.descricao}
                  </EventTitle>
                  <EventStatus $status={event.status} $theme={theme}>
                    {getStatusText(event.status)}
                  </EventStatus>
                </EventHeader>
                <EventDescription>
                  {event.status === 'error' && event.erro && (
                    <ErrorText>Erro: {event.erro}</ErrorText>
                  )}
                  {event.dataEnvio && (
                    <SmallText>
                      Enviado em:{' '}
                      {new Date(event.dataEnvio).toLocaleString('pt-BR')}
                    </SmallText>
                  )}
                  {event.dataProcessamento && (
                    <SmallText>
                      Processado em:{' '}
                      {new Date(event.dataProcessamento).toLocaleString(
                        'pt-BR'
                      )}
                    </SmallText>
                  )}
                </EventDescription>
                <EventActions>
                  {event.status === 'pending' && (
                    <UnifiedButton
                      $variant='primary'
                      $theme={theme}
                      onClick={() => handleSendEvent(event)}
                      $disabled={isLoading}
                    >
                      <AccessibleEmoji emoji='📤' label='Exportar' /> Enviar
                    </UnifiedButton>
                  )}
                  <UnifiedButton
                    $variant='secondary'
                    $theme={theme}
                    onClick={() => handleViewEvent(event)}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Ver Detalhes
                  </UnifiedButton>
                  {event.xml && (
                    <UnifiedButton
                      $variant='success'
                      $theme={theme}
                      onClick={() => {
                        if (!isClient) return;

                        const blob = new Blob([event.xml!], {
                          type: 'application/xml',
                        });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `evento-${event.tipo}-${event.id}.xml`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <AccessibleEmoji emoji='📄' label='Documento' /> Baixar
                      XML
                    </UnifiedButton>
                  )}
                </EventActions>
              </EventCard>
            ))}
          </EventsList>
        </Section>

        {/* Configurações */}
        <ConfigSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='⚙' label='Configurações' /> Configurações
          </OptimizedSectionTitle>
          <ConfigItem>
            <ConfigLabel>Certificado Digital</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {certificateInfo ? (
                  <SuccessText>
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {certificateInfo.subject}
                  </SuccessText>
                ) : (
                  'Não configurado'
                )}
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsCertificateUnifiedModalOpen(true)}
              >
                {certificateInfo ? 'Alterar' : 'Configurar'}
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Procuração Eletrônica</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {proxyInfo ? (
                  <SuccessText>
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {proxyInfo.documentNumber}
                  </SuccessText>
                ) : (
                  'Não configurada'
                )}
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => setIsProxyUnifiedModalOpen(true)}
              >
                {proxyInfo ? 'Alterar' : 'Configurar'}
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Ambiente</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                {esocialConfig.environment === 'producao'
                  ? 'Produção'
                  : 'Homologação'}
              </ConfigValue>
              <SelectWrapper>
                <OptimizedSelectStyled
                  value={esocialConfig.environment}
                  onChange={e =>
                    setEsocialConfig(prev => ({
                      ...prev,
                      environment: e.target.value as 'homologacao' | 'producao',
                    }))
                  }
                  $theme={theme}
                  aria-label='Selecionar ambiente'
                  title='Selecionar ambiente'
                >
                  <option value='homologacao'>Homologação</option>
                  <option value='producao'>Produção</option>
                </OptimizedSelectStyled>
              </SelectWrapper>
            </OptimizedFlexContainer>
          </ConfigItem>
          {/* Modo de operação removido - usando apenas gov.br */}
          <ConfigItem>
            <ConfigLabel>Envio Automático</ConfigLabel>
            <ToggleSwitch $theme={theme}>
              <input
                type='checkbox'
                aria-label='Ativar envio automático de eventos'
                title='Ativar envio automático de eventos'
              />
              <span className='slider'></span>
            </ToggleSwitch>
          </ConfigItem>
        </ConfigSection>

        {/* Seção de Dados do eSocial */}
        <ConfigSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📊' label='Dados' /> Dados do eSocial
          </OptimizedSectionTitle>

          {/* Aviso sobre certificado SSL */}
          <ConfigItem>
            <ConfigLabel>Status da Conexão</ConfigLabel>
            <ConfigValue>
              <SSLWarningText>
                <AccessibleEmoji emoji='⚠️' label='Aviso' /> Problema de
                Certificado SSL Detectado
              </SSLWarningText>
              <SSLWarningDescription>
                O servidor eSocial está retornando um certificado SSL inválido.
                <br />
                <strong>Soluções:</strong>
                <br />
                • Use o ambiente de teste (Produção Restrita)
                <br />
                • Configure o navegador para aceitar certificados inválidos
                <br /> • Entre em contato com o suporte do eSocial
              </SSLWarningDescription>
            </ConfigValue>
          </ConfigItem>

          <ConfigItem>
            <ConfigLabel>Dados do Empregador</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Carregar informações cadastrais do empregador
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEmpregadorData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='🏢' label='Empregador' /> Carregar Dados
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Dados dos Empregados</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Carregar lista de empregados e vínculos ativos
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEmpregadosData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='👥' label='Empregados' /> Carregar Lista
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Eventos Enviados</ConfigLabel>
            <OptimizedFlexContainer>
              <ConfigValue>
                Consultar histórico de eventos enviados ao eSocial
              </ConfigValue>
              <UnifiedButton
                $variant='primary'
                $theme={theme}
                onClick={() => {
                  //
                  handleLoadEventosData();
                }}
                $disabled={isLoading}
              >
                <AccessibleEmoji emoji='📋' label='Eventos' /> Consultar
                Histórico
              </UnifiedButton>
            </OptimizedFlexContainer>
          </ConfigItem>
        </ConfigSection>

        {/* Seção de Dados Carregados do Empregador */}
        {loadedEmployerData && (
          <ConfigSection>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='🏢' label='Empregador' /> Dados Carregados
              do Empregador
              {loadedEmployerData.fonte && (
                <DataSourceIndicator
                  $isReal={loadedEmployerData.fonte === 'SOAP_REAL'}
                >
                  (
                  {loadedEmployerData.fonte === 'SOAP_REAL'
                    ? '✅ Dados Reais'
                    : '⚠️ Dados Simulados'}
                  )
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            <ConfigItem>
              <ConfigLabel>Nome</ConfigLabel>
              <ConfigValue>{loadedEmployerData.nome}</ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>CPF</ConfigLabel>
              <ConfigValue>{loadedEmployerData.cpf}</ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Razão Social</ConfigLabel>
              <ConfigValue>{loadedEmployerData.razaoSocial}</ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Endereço</ConfigLabel>
              <ConfigValue>
                {loadedEmployerData.endereco?.logradouro},{' '}
                {loadedEmployerData.endereco?.numero || 'S/N'}
                <br />
                {loadedEmployerData.endereco?.bairro} -{' '}
                {loadedEmployerData.endereco?.cidade}/
                {loadedEmployerData.endereco?.uf}
                <br />
                CEP: {loadedEmployerData.endereco?.cep}
              </ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Contato</ConfigLabel>
              <ConfigValue>
                Telefone: {loadedEmployerData.contato?.telefone}
                <br />
                Email: {loadedEmployerData.contato?.email}
              </ConfigValue>
            </ConfigItem>
            <ConfigItem>
              <ConfigLabel>Situação</ConfigLabel>
              <ConfigValue>{loadedEmployerData.situacao}</ConfigValue>
            </ConfigItem>
          </ConfigSection>
        )}

        {/* Seção de Lista de Empregados Carregados */}
        {loadedEmployeesData.length > 0 && (
          <ConfigSection>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='👥' label='Empregados' /> Lista de
              Empregados Carregados
              {loadedEmployeesData[0]?.fonte && (
                <DataSourceIndicator
                  $isReal={loadedEmployeesData[0].fonte === 'SOAP_REAL'}
                >
                  (
                  {loadedEmployeesData[0].fonte === 'SOAP_REAL'
                    ? '✅ Dados Reais'
                    : '⚠️ Dados Simulados'}
                  )
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            {loadedEmployeesData.map((empregado, index) => (
              <ConfigItem key={index}>
                <ConfigLabel>Empregado {index + 1}</ConfigLabel>
                <ConfigValue>
                  <strong>Nome:</strong> {empregado.nome}
                  <br />
                  <strong>CPF:</strong> {empregado.cpf}
                  <br />
                  <strong>Cargo:</strong> {empregado.cargo}
                  <br />
                  <strong>Salário:</strong> {empregado.salario}
                  <br />
                  <strong>Data de Admissão:</strong> {empregado.dataAdmissao}
                  <br />
                  <strong>Situação:</strong> {empregado.situacao}
                </ConfigValue>
              </ConfigItem>
            ))}
          </ConfigSection>
        )}

        {/* Seção de Histórico de Eventos Carregados */}
        {loadedEventsData.length > 0 && (
          <ConfigSection>
            <OptimizedSectionTitle>
              <AccessibleEmoji emoji='📋' label='Eventos' /> Histórico de
              Eventos Carregados
              {loadedEventsData[0]?.fonte && (
                <DataSourceIndicator
                  $isReal={loadedEventsData[0].fonte === 'SOAP_REAL'}
                >
                  (
                  {loadedEventsData[0].fonte === 'SOAP_REAL'
                    ? '✅ Dados Reais'
                    : '⚠️ Dados Simulados'}
                  )
                </DataSourceIndicator>
              )}
            </OptimizedSectionTitle>
            {loadedEventsData.map((evento, index) => (
              <ConfigItem key={index}>
                <ConfigLabel>Evento {index + 1}</ConfigLabel>
                <ConfigValue>
                  <strong>Tipo:</strong> {evento.tipo}
                  <br />
                  <strong>ID:</strong> {evento.id}
                  <br />
                  <strong>Data de Envio:</strong> {evento.dataEnvio}
                  <br />
                  <strong>Status:</strong> {evento.status}
                  <br />
                  <strong>Protocolo:</strong> {evento.protocolo}
                  <br />
                  <strong>Descrição:</strong> {evento.descricao}
                </ConfigValue>
              </ConfigItem>
            ))}
          </ConfigSection>
        )}

        {/* UnifiedModal de Detalhes do Evento */}
        <UnifiedModal
          isOpen={isEventUnifiedModalOpen}
          onClose={() => setIsEventUnifiedModalOpen(false)}
        >
          <div>
            <div>
              <h2>Detalhes do Evento {selectedEvent?.tipo}</h2>
            </div>
            <div>
              {selectedEvent && (
                <div>
                  <p>
                    <strong>Descrição:</strong> {selectedEvent.descricao}
                  </p>
                  <p>
                    <strong>Status:</strong>{' '}
                    {getStatusText(selectedEvent.status)}
                  </p>
                  {selectedEvent.dataEnvio && (
                    <p>
                      <strong>Data de Envio:</strong>{' '}
                      {new Date(selectedEvent.dataEnvio).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  )}
                  {selectedEvent.dataProcessamento && (
                    <p>
                      <strong>Data de Processamento:</strong>{' '}
                      {new Date(selectedEvent.dataProcessamento).toLocaleString(
                        'pt-BR'
                      )}
                    </p>
                  )}
                  {selectedEvent.erro && (
                    <p>
                      <strong>Erro:</strong>{' '}
                      <ErrorSpan>{selectedEvent.erro}</ErrorSpan>
                    </p>
                  )}
                </div>
              )}
            </div>
            <div>
              <UnifiedButton
                $variant='secondary'
                $theme={theme}
                onClick={() => setIsEventUnifiedModalOpen(false)}
              >
                Fechar
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>

        {/* UnifiedModal de Certificado Digital */}
        <CertificateUploadModal
          isOpen={isCertificateUnifiedModalOpen}
          onClose={() => setIsCertificateUnifiedModalOpen(false)}
          onSuccess={handleCertificateSuccess}
          $theme={theme}
          esocialConfig={esocialConfig}
        />

        {/* UnifiedModal de Procuração Eletrônica */}
        <ProxyUploadModal
          isOpen={isProxyUnifiedModalOpen}
          onClose={() => setIsProxyUnifiedModalOpen(false)}
          onSuccess={handleProxySuccess}
          $theme={theme}
          esocialConfig={esocialConfig}
        />

        {/* Toast Container */}
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

export default ESocialIntegration;
