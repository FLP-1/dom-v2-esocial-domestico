import { useRouter } from 'next/router';
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { ActionButton } from '../components/ActionButton';
import CertificateUploadModal from '../components/CertificateUploadModal';
import { Form, FormGroup, Input, Select } from '../components/FormComponents';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '../components/Modal';
import ProxyUploadModal from '../components/ProxyUploadModal';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import type {
  CertificateInfo,
  ESocialConfig,
  ProxyInfo,
} from '../services/esocialApi';
import { getESocialApiService } from '../services/esocialApi';
import { validateCpf } from '../utils/cpfValidator';

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

const FlexContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
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

const Subtitle = styled.p`
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

const EventDescription = styled.p`
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

// Dados mockados
const mockEvents: ESocialEvent[] = [
  {
    id: '1',
    tipo: 'S-1000',
    descricao: 'Informações do Empregador/Contribuinte/Órgão Público',
    status: 'processed',
    dataEnvio: '2024-01-15T10:30:00Z',
    dataProcessamento: '2024-01-15T11:00:00Z',
  },
  {
    id: '2',
    tipo: 'S-2200',
    descricao:
      'Cadastramento Inicial do Vínculo e Admissão/Ingresso de Trabalhador',
    status: 'sent',
    dataEnvio: '2024-01-16T14:20:00Z',
  },
  {
    id: '3',
    tipo: 'S-2300',
    descricao: 'Trablho Sem Vínculo de Emprego/Estatutário - Início',
    status: 'pending',
  },
  {
    id: '4',
    tipo: 'S-3000',
    descricao: 'Exclusão de Eventos',
    status: 'error',
    dataEnvio: '2024-01-17T09:15:00Z',
    erro: 'Erro na validação do CPF',
  },
];

const ESocialIntegration: React.FC = () => {
  const router = useRouter();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const [collapsed, setCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [events, setEvents] = useState<ESocialEvent[]>(mockEvents);
  const [selectedEvent, setSelectedEvent] = useState<ESocialEvent | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);
  const [isProxyModalOpen, setIsProxyModalOpen] = useState(false);
  const [certificateInfo, setCertificateInfo] =
    useState<CertificateInfo | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [esocialConfig, setEsocialConfig] = useState<ESocialConfig>({
    environment: 'test',
    companyId: '12345678000199',
  });

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
        toast.success(
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
        toast.error(`Erro ao enviar evento ${event.tipo}: ${response.erro}`);
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
      toast.error(`Erro ao enviar evento: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const handleViewEvent = (event: ESocialEvent) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleCertificateSuccess = (certInfo: CertificateInfo) => {
    setCertificateInfo(certInfo);
    setEsocialConfig(prev => ({ ...prev, certificatePath: 'configured' }));
    toast.success('Certificado digital configurado com sucesso!');
  };

  const handleProxySuccess = (proxyInfo: ProxyInfo) => {
    setProxyInfo(proxyInfo);
    setEsocialConfig(prev => ({ ...prev, proxyPath: 'configured' }));
    toast.success('Procuração eletrônica configurada com sucesso!');
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
          theme={theme}
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
            <SectionTitle>
              <AccessibleEmoji emoji='📤' label='Exportar' /> Enviando para
              eSocial...
            </SectionTitle>
            <ProgressBar $theme={theme}>
              <ProgressFill $progress={progress} $theme={theme} />
            </ProgressBar>
            <CenterText>{progress}% concluído</CenterText>
          </Section>
        )}

        <ContentGrid>
          {/* Dados do Empregador */}
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='👔' label='Empregador' /> Dados do
              Empregador
            </SectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employer-cpf'>CPF *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['cpf']}</ErrorMessage>
                  )}
                  <HelpText>CPF do empregador responsável</HelpText>
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employer-nome'>Nome Completo *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['nome']}</ErrorMessage>
                  )}
                </FormGroupStyled>
              </FormRow>

              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employer-nascimento'>
                    Data de Nascimento *
                  </Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['dataNascimento']}</ErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employer-telefone'>Telefone *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['telefone']}</ErrorMessage>
                  )}
                </FormGroupStyled>
              </FormRow>

              <FormGroupStyled>
                <Label htmlFor='employer-email'>Email *</Label>
                <InputStyled
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
                  <ErrorMessage>{errors['email']}</ErrorMessage>
                )}
              </FormGroupStyled>

              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employer-cep'>CEP *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['cep']}</ErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employer-uf'>UF *</Label>
                  <SelectStyled
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
                  </SelectStyled>
                  {errors['uf'] && <ErrorMessage>{errors['uf']}</ErrorMessage>}
                </FormGroupStyled>
              </FormRow>
            </Form>
          </Section>

          {/* Dados do Empregado */}
          <Section>
            <SectionTitle>
              <AccessibleEmoji emoji='👤' label='Pessoa' /> Dados do Empregado
            </SectionTitle>
            <Form onSubmit={e => e.preventDefault()}>
              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employee-cpf'>CPF *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['employeeCpf']}</ErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employee-nome'>Nome Completo *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['employeeNome']}</ErrorMessage>
                  )}
                </FormGroupStyled>
              </FormRow>

              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employee-pis'>PIS *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['pis']}</ErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employee-salario'>Salário *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['salario']}</ErrorMessage>
                  )}
                </FormGroupStyled>
              </FormRow>

              <FormRow>
                <FormGroupStyled>
                  <Label htmlFor='employee-admissao'>Data de Admissão *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['dataAdmissao']}</ErrorMessage>
                  )}
                </FormGroupStyled>

                <FormGroupStyled>
                  <Label htmlFor='employee-cargo'>Cargo *</Label>
                  <InputStyled
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
                    <ErrorMessage>{errors['cargo']}</ErrorMessage>
                  )}
                </FormGroupStyled>
              </FormRow>
            </Form>
          </Section>
        </ContentGrid>

        {/* Lista de Eventos */}
        <Section>
          <SectionTitle>
            <AccessibleEmoji emoji='📋' label='Checklist' /> Eventos eSocial
          </SectionTitle>
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
                    <ActionButton
                      variant='primary'
                      theme={theme}
                      onClick={() => handleSendEvent(event)}
                      disabled={isLoading}
                    >
                      <AccessibleEmoji emoji='📤' label='Exportar' /> Enviar
                    </ActionButton>
                  )}
                  <ActionButton
                    variant='secondary'
                    theme={theme}
                    onClick={() => handleViewEvent(event)}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Ver Detalhes
                  </ActionButton>
                  {event.xml && (
                    <ActionButton
                      variant='success'
                      theme={theme}
                      onClick={() => {
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
                    </ActionButton>
                  )}
                </EventActions>
              </EventCard>
            ))}
          </EventsList>
        </Section>

        {/* Configurações */}
        <ConfigSection>
          <SectionTitle>
            <AccessibleEmoji emoji='⚙' label='Configurações' /> Configurações
          </SectionTitle>
          <ConfigItem>
            <ConfigLabel>Certificado Digital</ConfigLabel>
            <FlexContainer>
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
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={() => setIsCertificateModalOpen(true)}
              >
                {certificateInfo ? 'Alterar' : 'Configurar'}
              </ActionButton>
            </FlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Procuração Eletrônica</ConfigLabel>
            <FlexContainer>
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
              <ActionButton
                variant='primary'
                theme={theme}
                onClick={() => setIsProxyModalOpen(true)}
              >
                {proxyInfo ? 'Alterar' : 'Configurar'}
              </ActionButton>
            </FlexContainer>
          </ConfigItem>
          <ConfigItem>
            <ConfigLabel>Ambiente</ConfigLabel>
            <FlexContainer>
              <ConfigValue>
                {esocialConfig.environment === 'production'
                  ? 'Produção'
                  : 'Teste'}
              </ConfigValue>
              <SelectWrapper>
                <SelectStyled
                  value={esocialConfig.environment}
                  onChange={e =>
                    setEsocialConfig(prev => ({
                      ...prev,
                      environment: e.target.value as 'test' | 'production',
                    }))
                  }
                  $theme={theme}
                  aria-label='Selecionar ambiente'
                  title='Selecionar ambiente'
                >
                  <option value='test'>Teste</option>
                  <option value='production'>Produção</option>
                </SelectStyled>
              </SelectWrapper>
            </FlexContainer>
          </ConfigItem>
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

        {/* Modal de Detalhes do Evento */}
        <Modal
          isOpen={isEventModalOpen}
          onClose={() => setIsEventModalOpen(false)}
        >
          <ModalContent>
            <ModalHeader>
              <h2>Detalhes do Evento {selectedEvent?.tipo}</h2>
            </ModalHeader>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <ActionButton
                variant='secondary'
                theme={theme}
                onClick={() => setIsEventModalOpen(false)}
              >
                Fechar
              </ActionButton>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Modal de Certificado Digital */}
        <CertificateUploadModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          onSuccess={handleCertificateSuccess}
          theme={theme}
        />

        {/* Modal de Procuração Eletrônica */}
        <ProxyUploadModal
          isOpen={isProxyModalOpen}
          onClose={() => setIsProxyModalOpen(false)}
          onSuccess={handleProxySuccess}
          theme={theme}
        />
      </MainContent>
    </Container>
  );
};

export default ESocialIntegration;
