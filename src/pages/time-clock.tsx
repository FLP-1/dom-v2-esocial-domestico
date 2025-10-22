import AccessibleEmoji from '../components/AccessibleEmoji';
import { useRouter } from 'next/router';
import { useEffect, useState, useMemo, useCallback, memo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useUserProfile } from '../contexts/UserProfileContext';

const PendingApprovalContainer = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1000;
  cursor: pointer;
`;
import FilterSection from '../components/FilterSection';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import PendingApprovalModal from '../components/PendingApprovalModal';
import PendingActionIcon from '../components/PendingActionIcon';
import PendingRecordsList from '../components/PendingRecordsList';
import NetworkDebugInfo from '../components/NetworkDebugInfo';
import GeofencingModal from '../components/GeofencingModal';
import { UnifiedButton, UnifiedModal, UnifiedCard } from '../components/unified';
import { useGeolocationContext } from '../contexts/GeolocationContext';
import { useAutoGeolocation } from '../hooks/useAutoGeolocation';
import { useTimeClockNotifications } from '../hooks/useTimeClockNotifications';
import { useNetworkFingerprinting } from '../hooks/useNetworkFingerprinting';
import { useNetworkDetection } from '../hooks/useNetworkDetection';
// import { useGeolocation } from '../hooks/useGeolocation'; // Removido - usando apenas nos componentes

// ✅ Função para obter IP do cliente via WebRTC
const getClientIP = async (): Promise<string> => {
  try {
    // Usar WebRTC para obter IP local (não funciona em todos os navegadores)
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        pc.close();
        resolve('unknown');
      }, 3000);
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3})/);
          if (ipMatch && ipMatch[1] !== '127.0.0.1') {
            clearTimeout(timeout);
            pc.close();
            resolve(ipMatch[1]);
          }
        }
      };
      
      pc.createDataChannel('');
      pc.createOffer().then(offer => pc.setLocalDescription(offer));
    });
  } catch (error) {
    return 'unknown';
  }
};
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

const CurrentTime = styled.h1<{ $theme: any }>`
  font-family: 'Montserrat', sans-serif;
  font-size: 3rem;
  font-weight: 700;
  color: ${props => props.$theme.colors.text.dark};
  margin: 0 0 0.5rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CurrentDate = styled.p<{ $theme: any }>`
  font-size: 1.25rem;
  color: ${props => props.$theme.colors.text.light};
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

const ScheduleTitle = styled.h3<{ $theme: any }>`
  margin: 0 0 1rem 0;
  color: ${props => props.$theme.colors.text.dark};
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

const ScheduleLabel = styled.span<{ $theme: any }>`
  font-size: 0.9rem;
  color: ${props => props.$theme.colors.text.light};
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

const SectionTitle = styled.h3<{ $theme: any }>`
  margin: 0 0 1.5rem 0;
  color: ${props => props.$theme.colors.text.dark};
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmptyState = styled.div<{ $theme: any }>`
  text-align: center;
  padding: 3rem;
  color: ${props => props.$theme.colors.text.light};

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: ${props => props.$theme.colors.text.dark};
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

const ModalColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'overtime' | 'document'>('overtime');
  const [pendingApprovalOpen, setPendingApprovalOpen] = useState(false);
  
  // Estados dos dados do usuário
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [horariosOficiais, setHorariosOficiais] = useState<any[]>([]);
  const [timeSummary, setTimeSummary] = useState<TimeSummary | null>(null);
  const [documentosRecentes, setDocumentosRecentes] = useState<any[]>([]);
  const [overtimeData, setOvertimeData] = useState<any>(null);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [theme, setTheme] = useState({
    colors: {
      primary: theme.colors?.primary || '#2E8B57',
      secondary: theme.colors?.secondary || '#4682B4',
      background: theme.colors?.background || '#f8f9fa',
      text: theme.colors?.text?.primary || '#2c3e50',
      shadow: 'rgba(0, 0, 0, 0.1)' // Cor específica para tema padrão
    }
  });

  // Estados dos registros de ponto
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);
  const [overtimeRequests, setOvertimeRequests] = useState<OvertimeRequest[]>([]);
  const [historyRecords, setHistoryRecords] = useState<TimeClockHistory[]>([]);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [overrideDraft, setOverrideDraft] = useState<{ data: any; type: TimeRecord['type'] } | null>(null);
  
  // Estados para modal de geofencing
  const [geofencingModalOpen, setGeofencingModalOpen] = useState(false);
  const [geofencingData, setGeofencingData] = useState<{
    coordenadas: { latitude: number; longitude: number; precisao: number };
    localMaisProximo: { nome: string; distancia: number } | null;
    distanciaMinima: number;
    endereco: string;
  } | null>(null);
  const { setLastCaptureStatus, setLastCaptureLocation } = useGeolocationContext();

  // ✅ Integração com sistema de notificações centralizado
  const {
    unreadCount,
    pendingApprovalCount,
    overtimeRequestCount,
    refreshNotifications,
    markAsRead
  } = useTimeClockNotifications();

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
          // login automático falhou, continuar sem autenticação
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
                primary: '#2E8B57', // Cor específica para empregador
                secondary: '#4682B4', // Cor específica para empregador
                background: '#f8f9fa', // Cor específica para empregador
                text: '#2c3e50', // Cor específica para empregador
                shadow: 'rgba(0, 0, 0, 0.1)' // Cor específica para empregador
              }
            });
          } else if (userResult.data.user.role === 'EMPREGADO') {
            setTheme({
              colors: {
                primary: '#29ABE2', // Cor específica para empregado
                secondary: '#4682B4', // Cor específica para empregado
                background: '#f8f9fa', // Cor específica para empregado
                text: '#2c3e50', // Cor específica para empregado
                shadow: 'rgba(0, 0, 0, 0.1)' // Cor específica para empregado
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
          const now = new Date();
          const todays = (result.data as any[])
            .map(r => ({ ...r, dt: new Date(r.dataHora) }))
            .filter(r => r.dt.toDateString() === now.toDateString())
            .sort((a, b) => a.dt.getTime() - b.dt.getTime());
          const formattedRecords: TimeRecord[] = todays.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: record.dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            location: record.enderecoCompleto || record.endereco || 'Local não informado',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: record.dt,
          }));
          setTimeRecords(formattedRecords);
          
          // ✅ NÃO inicializar automaticamente com último registro para evitar endereços antigos
          // A geolocalização será capturada automaticamente pelo useAutoGeolocation
        }
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
      }
    };

    loadRecords();
  }, [setLastCaptureLocation]);

  // Carregar pendências
  useEffect(() => {
    const loadPending = async () => {
      try {
        const [cnt, list] = await Promise.all([
          fetch('/api/time-clock/pending?count=true'),
          fetch('/api/time-clock/pending')
        ]);
        if (cnt.ok) {
          const cdata = await cnt.json();
          // Contagem de pendentes carregada
        }
        if (list.ok) {
          const ldata = await list.json();
          // Lista de pendentes carregada
        }
      } catch {}
    };
    loadPending();
  }, []);

  // Listener para evento de geofencing
  useEffect(() => {
    const handleGeofencingEvent = (event: CustomEvent) => {
      const { coordenadas, localMaisProximo, distanciaMinima, endereco } = event.detail;
      
      setGeofencingData({
        coordenadas,
        localMaisProximo,
        distanciaMinima,
        endereco
      });
      setGeofencingModalOpen(true);
    };

    window.addEventListener('geofencing-requer-aprovacao', handleGeofencingEvent as EventListener);
    
    return () => {
      window.removeEventListener('geofencing-requer-aprovacao', handleGeofencingEvent as EventListener);
    };
  }, []);

  // Carregar solicitações de hora extra
  useEffect(() => {
    const loadOvertime = async () => {
      try {
        const resp = await fetch('/api/time-clock/overtime-requests');
        if (resp.ok) {
          const data = await resp.json();
          setOvertimeRequests(
            (data.data || []).map((r: any) => ({
              id: r.id,
              employeeId: currentUser?.id || 'current-user',
              employeeName: currentUser?.nomeCompleto || 'Usuário',
              date: new Date(r.data).toISOString().split('T')[0],
              startTime: r.inicio,
              endTime: r.fim,
              justification: r.justificativa || '',
              status: (r.status || 'PENDENTE').toLowerCase(),
              requestedAt: new Date(r.criadoEm),
              reviewedAt: r.revisadaEm ? new Date(r.revisadaEm) : undefined,
              reviewedBy: r.revisadaPor || undefined,
              reviewComment: r.observacao || undefined,
            }))
          );
        }
      } catch {}
    };
    loadOvertime();
  }, [currentUser]);

  // Atualizar relógio a cada segundo (otimizado para evitar reflows)
  useEffect(() => {
    const timer = setInterval(() => {
      // Usar requestAnimationFrame para evitar forced reflow
      requestAnimationFrame(() => {
        setCurrentTime(new Date());
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Hook centralizado para geolocalização e WiFi (removido - usando apenas nos componentes)
  // const { location, wifiName, captureRealTimeLocation } = useGeolocation();

  // ❌ TEMPORARIAMENTE DESABILITADO - Causando loop infinito
  // useAutoGeolocation({
  //   intervalMinutes: 2, // Capturar a cada 2 minutos para teste
  //   captureOnRouteChange: false, // Desabilitado para evitar loops
  //   enableLogging: true // Habilitado temporariamente para debug
  // });

  // ✅ Sistema de fingerprinting de rede para antifraude
  const {
    fingerprint: networkFingerprint,
    analysis: networkAnalysis,
    loading: networkLoading,
    error: networkError,
    isFraudDetected,
    riskLevel
  } = useNetworkFingerprinting(true);

  // ✅ Detecção de rede unificada (inclui SSID real)
  const networkDetection = useNetworkDetection({ 
    enableLogging: false, // ✅ Desabilitado para evitar spam no console
    enableRealSSID: false // ✅ Desabilitado para evitar loop infinito
  });


  // Lógica para determinar o próximo registro possível
  const getNextAvailableRecord = useCallback((): TimeRecord['type'] | null => {
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
  }, [timeRecords]);

  // Verificar se pode registrar hora extra
  const canRequestOvertime = useCallback((): boolean => {
    const lastRecord = timeRecords[timeRecords.length - 1];
    return lastRecord?.type === 'saida';
  }, [timeRecords]);


  // Handler para registrar ponto (memoizado para evitar re-renders)
  const handleTimeRecord = useCallback(async (locationData: any, type: TimeRecord['type']) => {
    try {
      // início do registro
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);

      const response = await fetch('/api/time-clock/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: type,
          observacao: `Registro via interface web - ${type}`,
          latitude: locationData?.latitude,
          longitude: locationData?.longitude,
          precisao: locationData?.accuracy,
          endereco: locationData?.address,
          numeroEndereco: locationData?.addressComponents?.number || locationData?.addressComponents?.house_number,
          wifiName: locationData?.wifiName,
          overrideJustification: locationData?.overrideJustification,
          connectionType: locationData?.networkInfo?.connectionType,
          effectiveType: locationData?.networkInfo?.effectiveType,
          downlink: locationData?.networkInfo?.downlink,
          rtt: locationData?.networkInfo?.rtt,
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          networkTimestamp: new Date().toISOString(),
          // ✅ Adicionar campos obrigatórios para a API
          grupoId: currentUser?.gruposUsuario?.[0]?.grupoId || null,
          usuarioPerfilId: currentUser?.perfis?.find(p => p.principal)?.id || currentUser?.perfis?.[0]?.id || null,
          // ✅ Adicionar IP do cliente (se disponível via WebRTC)
          clientIP: await getClientIP(),
          // ✅ Adicionar fingerprinting de rede para antifraude
          networkFingerprint: networkFingerprint ? {
            connectionType: networkFingerprint.connectionType,
            effectiveType: networkFingerprint.effectiveType,
            downlink: networkFingerprint.downlink,
            rtt: networkFingerprint.rtt,
            ipAddress: networkFingerprint.ipAddress,
            timezone: networkFingerprint.timezone,
            language: networkFingerprint.language,
            platform: networkFingerprint.platform,
            screenResolution: networkFingerprint.screenResolution,
            sessionId: networkFingerprint.sessionId,
            timestamp: networkFingerprint.timestamp,
            // ✅ SSID real capturado do sistema operacional
            realSSID: networkDetection.realSSID,
            ssidPlatform: networkDetection.ssidPlatform
          } : null,
          // ✅ Adicionar análise de risco
          riskAnalysis: networkAnalysis ? {
            riskScore: networkAnalysis.riskScore,
            confidence: networkAnalysis.confidence,
            isFraud: networkAnalysis.riskScore > 70,
            fraudConfidence: networkAnalysis.confidence,
            anomalies: networkAnalysis.anomalies
          } : null
        }),
        signal: controller.signal
      }).finally(() => clearTimeout(timer));

      if (!response.ok) {
        let message = 'Erro ao registrar ponto';
        try {
          const data = await response.json();
          if (data?.error) message = data.error;
        } catch {}

        // ✅ Sempre atualizar contexto de geolocalização, mesmo em caso de erro
        if (locationData && setLastCaptureLocation) {
          setLastCaptureLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
            accuracy: locationData.accuracy,
            address: locationData.address,
            wifiName: locationData.wifiName,
            timestamp: new Date()
          });
        }

        if (response.status === 409) {
          // Duplicidade do mesmo tipo no dia
          toast.warning(message, { position: 'top-center', autoClose: 3000 });
          setLastCaptureStatus && setLastCaptureStatus({ pending: false, approved: false, imprecise: false, reason: message });
          return;
        }
        if (response.status === 422) {
          // Ordem inválida
          toast.warning(message, { position: 'top-center', autoClose: 3000 });
          // Se for precisão insuficiente/idade, oferecer override via modal
          if (/Precisão|Localização antiga/i.test(message)) {
            setOverrideDraft({ data: locationData, type });
            setOverrideJustification('');
            setOverrideModalOpen(true);
            setLastCaptureStatus && setLastCaptureStatus({ pending: true, approved: false, imprecise: true, reason: message });
          }
          return;
        }
        if (response.status === 401) {
          toast.error('Sessão expirada. Faça login novamente.', { position: 'top-center', autoClose: 3000 });
          setLastCaptureStatus && setLastCaptureStatus({ pending: false, approved: false, imprecise: false, reason: 'Sessão expirada' });
          return;
        }
        throw new Error(message);
      }

      const result = await response.json();
      setLastCaptureStatus && setLastCaptureStatus({ pending: false, approved: true, imprecise: false, serverRecordId: result?.data?.id });
      
      // ✅ Atualizar contexto de geolocalização com dados do registro
      if (locationData && setLastCaptureLocation) {
        setLastCaptureLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          address: locationData.address,
          wifiName: locationData.wifiName,
          timestamp: new Date()
        });
      }
      
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });

      const newRecord: TimeRecord = {
        id: result.data.id,
        type,
        time: timeString,
        location: locationData?.address || 'Localização não disponível',
        wifi: locationData?.wifiName || 'WiFi não detectado',
        timestamp: now,
      };

      setTimeRecords(prev => [...prev, newRecord]);
      toast.success(`Ponto registrado com sucesso: ${timeString}`, {
        position: 'top-center',
        autoClose: 3000,
      });

      // Revalidar registros do servidor após sucesso
      try {
        const refresh = await fetch('/api/time-clock/records');
        if (refresh.ok) {
          const server = await refresh.json();
          const now = new Date();
          const todays: any[] = (server.data as any[])
            .map(r => ({ ...r, dt: new Date(r.dataHora) }))
            .filter(r => r.dt.toDateString() === now.toDateString())
            .sort((a, b) => a.dt.getTime() - b.dt.getTime());
          const formatted: TimeRecord[] = todays.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: record.dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            location: record.enderecoCompleto || record.endereco || 'Local não informado',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: record.dt,
          }));
          setTimeRecords(formatted);
        }
      } catch {}
    } catch (error: any) {
      const msg = error?.name === 'AbortError' ? 'Tempo esgotado ao registrar ponto' : (error?.message || 'Erro ao registrar ponto. Tente novamente.');
      toast.error(msg, {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  }, [currentUser, setLastCaptureStatus, setLastCaptureLocation, networkAnalysis, networkDetection.realSSID, networkDetection.ssidPlatform, networkFingerprint]);

  // Handler para solicitar hora extra (POST)
  const handleOvertimeRequest = async (request: OvertimeRequest) => {
    try {
      const body = {
        data: request.date,
        inicio: request.startTime,
        fim: request.endTime,
        justificativa: request.justification,
      };
      const resp = await fetch('/api/time-clock/overtime-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!resp.ok) throw new Error('Falha ao criar solicitação');
      const created = await resp.json();
      const r = created.data;
      const mapped: OvertimeRequest = {
        id: r.id,
        employeeId: currentUser?.id || 'current-user',
        employeeName: currentUser?.nomeCompleto || 'Usuário',
        date: new Date(r.data).toISOString().split('T')[0],
        startTime: r.inicio,
        endTime: r.fim,
        justification: r.justificativa || '',
        status: (r.status || 'PENDENTE').toLowerCase(),
        requestedAt: new Date(r.criadoEm),
        reviewedAt: r.revisadaEm ? new Date(r.revisadaEm) : undefined,
        reviewedBy: r.revisadaPor || undefined,
        reviewComment: r.observacao || undefined,
      };
      setOvertimeRequests(prev => [mapped, ...prev]);
      toast.success('Solicitação de hora extra enviada para aprovação!');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao solicitar hora extra');
    }
  };

  const reviewOvertime = async (id: string, approve: boolean) => {
    try {
      const resp = await fetch('/api/time-clock/overtime-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: approve ? 'APROVADA' : 'REJEITADA' })
      });
      if (!resp.ok) throw new Error('Falha ao atualizar solicitação');
      const updated = await resp.json();
      setOvertimeRequests(prev => prev.map(r => r.id === id ? {
        ...r,
        status: (updated.data.status || 'PENDENTE').toLowerCase(),
        reviewedAt: updated.data.revisadaEm ? new Date(updated.data.revisadaEm) : undefined,
        reviewedBy: updated.data.revisadaPor || undefined,
        reviewComment: updated.data.observacao || undefined,
      } : r));
      toast.success(approve ? 'Solicitação aprovada' : 'Solicitação rejeitada');
    } catch (e: any) {
      toast.error(e?.message || 'Erro ao atualizar solicitação');
    }
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

  // Handlers para modal de geofencing
  const handleGeofencingApprove = async (justificativa: string) => {
    try {
      // Registrar ponto com justificativa de geofencing
      const now = new Date();
      const timeString = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      const response = await fetch('/api/time-clock/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'ENTRADA', // ou determinar tipo baseado nos registros existentes
          latitude: geofencingData?.coordenadas.latitude,
          longitude: geofencingData?.coordenadas.longitude,
          precisao: geofencingData?.coordenadas.precisao,
          endereco: geofencingData?.endereco || 'Endereço indisponível',
          wifiName: networkDetection.realSSID || 'WiFi não detectado',
          justificativaGeofencing: justificativa,
          requerAprovacao: true
        }),
      });

      if (response.ok) {
        toast.success(`Ponto registrado com justificativa: ${timeString}`, {
          position: 'top-center',
          autoClose: 3000,
        });
        
        // Recarregar registros
        const refresh = await fetch('/api/time-clock/records');
        if (refresh.ok) {
          const server = await refresh.json();
          const now = new Date();
          const todays: any[] = (server.data as any[])
            .map(r => ({ ...r, dt: new Date(r.dataHora) }))
            .filter(r => r.dt.toDateString() === now.toDateString())
            .sort((a, b) => a.dt.getTime() - b.dt.getTime());
          const formatted: TimeRecord[] = todays.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: record.dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            location: record.enderecoCompleto || record.endereco || 'Local não informado',
            wifi: record.nomeRedeWiFi || 'WiFi não detectado',
            timestamp: record.dt,
          }));
          setTimeRecords(formatted);
        }
      } else {
        throw new Error('Erro ao registrar ponto');
      }
    } catch (error: any) {
      toast.error('Erro ao registrar ponto com justificativa: ' + (error?.message || 'Erro desconhecido'));
    }
  };

  const handleGeofencingClose = () => {
    setGeofencingModalOpen(false);
    setGeofencingData(null);
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

  // Lista de pendências reutilizando DataList
  const pendingColumns: DataListColumn[] = [
    { key: 'dataHora', label: 'Data/Hora', width: '160px', render: (item) => new Date((item as any).dataHora).toLocaleString('pt-BR') },
    { key: 'tipo', label: 'Tipo', width: '140px' },
    { key: 'precisao', label: 'Precisão (m)', width: '120px', render: (item) => (item as any).precisao?.toFixed?.(0) ?? '-' },
    { key: 'wifi', label: 'WiFi', width: '160px', render: (item) => (item as any).nomeRedeWiFi ?? '—' },
  ];

  // Lista de HE
  const overtimeColumns: DataListColumn[] = [
    { key: 'data', label: 'Data', width: '120px', render: (item) => new Date((item as any).date).toLocaleDateString('pt-BR') },
    { key: 'horario', label: 'Horário', width: '140px', render: (item) => `${(item as any).startTime} - ${(item as any).endTime}` },
    { key: 'justificativa', label: 'Justificativa', width: '260px', render: (item) => (item as any).justification || '—' },
    { key: 'status', label: 'Status', width: '120px', render: (item) => (item as any).status },
  ];

  const overtimeActions: DataListAction[] = [
    { icon: '✅', label: 'Aprovar', variant: 'primary', onClick: (item) => reviewOvertime((item as any).id, true) },
    { icon: '❌', label: 'Rejeitar', variant: 'secondary', onClick: (item) => reviewOvertime((item as any).id, false) },
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

  const nextAvailableRecord = useMemo(() => getNextAvailableRecord(), [getNextAvailableRecord]);

  // Memoizar os cards de registro para evitar re-renders desnecessários
  const timeRecordCards = useMemo(() => (
    <>
      <TimeRecordCard
        record={{ id: 'entrada', type: 'entrada', time: timeRecords.find(r => r.type === 'entrada')?.time }}
        theme={theme}
        onClick={(locationData) => handleTimeRecord(locationData, 'entrada')}
        isDisabled={nextAvailableRecord !== 'entrada'}
      />
      
      <TimeRecordCard
        record={{ id: 'saida_almoco', type: 'saida_almoco', time: timeRecords.find(r => r.type === 'saida_almoco')?.time }}
        theme={theme}
        onClick={(locationData) => handleTimeRecord(locationData, 'saida_almoco')}
        isDisabled={nextAvailableRecord !== 'saida_almoco'}
      />
      
      <TimeRecordCard
        record={{ id: 'retorno_almoco', type: 'retorno_almoco', time: timeRecords.find(r => r.type === 'retorno_almoco')?.time }}
        theme={theme}
        onClick={(locationData) => handleTimeRecord(locationData, 'retorno_almoco')}
        isDisabled={nextAvailableRecord !== 'retorno_almoco'}
      />
      
      <TimeRecordCard
        record={{ id: 'saida', type: 'saida', time: timeRecords.find(r => r.type === 'saida')?.time }}
        theme={theme}
        onClick={(locationData) => handleTimeRecord(locationData, 'saida')}
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
        onClick={(locationData) => handleTimeRecord(locationData, 'fim_extra')}
        isDisabled={nextAvailableRecord !== 'fim_extra'}
      />
    </>
  ), [timeRecords, theme, handleTimeRecord, nextAvailableRecord, canRequestOvertime]);

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
          notificationCount={unreadCount}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />

        {/* Ícone de Aprovação de Registros Pendentes */}
        {pendingApprovalCount > 0 && (
          <PendingApprovalContainer>
            <PendingActionIcon
              count={pendingApprovalCount}
              variant="warning"
              size="large"
              onClick={() => setPendingApprovalOpen(true)}
              title={`Aprovar Registros Pendentes (${pendingApprovalCount})`}
              icon="⏳"
              badgeVariant="error"
            />
          </PendingApprovalContainer>
        )}
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
          {timeRecordCards}
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
            <div className="empty-icon"><span role="img" aria-label="Relógio">⏰</span></div>
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
            <OptimizedLabel htmlFor='filter-type'>Tipo de Registro</OptimizedLabel>
            <Select
              $theme={theme}
              id='filter-type'
              title='Selecionar tipo de registro'
              value={filters.type}
              onChange={(e) =>
                setFilters(prev => ({ ...prev, type: e.target.value }))
              }
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

      {/* DEBUG: Dados de Rede Capturados Automaticamente */}
      <NetworkDebugInfo />

      {/* Lista de Registros Pendentes */}
      <PendingRecordsList theme={theme} />

      {/* Solicitações de Hora Extra */}
      <HistorySection $theme={theme}>
        <SectionTitle>
          <AccessibleEmoji emoji="⏱️" label="HE" /> Solicitações de Hora Extra
        </SectionTitle>
        {overtimeRequests.length === 0 ? (
          <EmptyState>
            <div className="empty-icon">
              <AccessibleEmoji emoji="✅" label="Vazio" />
            </div>
            <div className="empty-title">Sem solicitações</div>
          </EmptyState>
        ) : (
          <DataList
            theme={theme}
            items={overtimeRequests}
            columns={overtimeColumns}
            actions={overtimeActions}
            emptyMessage="Nenhuma solicitação encontrada."
            variant="detailed"
            showHeader={true}
            striped={true}
            hoverable={true}
          />
        )}
      </HistorySection>

      {/* Modal de Override de Precisão */}
      <UnifiedModal
        isOpen={overrideModalOpen}
        onClose={() => setOverrideModalOpen(false)}
        title='Solicitar aprovação de registro'
        $theme={theme}
      >
        <ModalColumn>
          <p>
            A localização está imprecisa ou antiga. Descreva o motivo para solicitar aprovação do registro de ponto.
          </p>
          <Input
            $theme={theme}
            type='text'
            value={overrideJustification}
            onChange={(e) => setOverrideJustification(e.target.value)}
            placeholder='Ex.: Sem visão de céu, GPS lento, local interno, etc.'
          />
          <OptimizedButtonGroup>
            <UnifiedButton $variant='secondary' onClick={() => setOverrideModalOpen(false)}>
              Cancelar
            </UnifiedButton>
            <UnifiedButton
              $variant='primary'
              $disabled={!overrideJustification.trim() || !overrideDraft}
              onClick={async () => {
                if (!overrideDraft) return;
                await handleTimeRecord({ ...overrideDraft.data, overrideJustification: overrideJustification.trim() }, overrideDraft.type);
                setOverrideModalOpen(false);
              }}
            >
              Enviar para aprovação
            </UnifiedButton>
          </OptimizedButtonGroup>
        </ModalColumn>
      </UnifiedModal>

      {/* Modal de Aprovação de Horas Extras */}
      <OvertimeApprovalModal
        isOpen={modalOpen && modalType === 'overtime'}
        onClose={() => setModalOpen(false)}
        onSubmit={handleOvertimeRequest}
        theme={theme}
      />

      {/* Modal de Geofencing */}
      {geofencingData && (
        <GeofencingModal
          isOpen={geofencingModalOpen}
          onClose={handleGeofencingClose}
          onApprove={handleGeofencingApprove}
          coordenadas={geofencingData.coordenadas}
          localMaisProximo={geofencingData.localMaisProximo}
          distanciaMinima={geofencingData.distanciaMinima}
          endereco={geofencingData.endereco}
        />
      )}

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

      {/* Modal de Aprovação de Registros Pendentes */}
      <PendingApprovalModal
        isOpen={pendingApprovalOpen}
        onClose={() => setPendingApprovalOpen(false)}
        onApprovalComplete={() => {
          // ✅ Recarregar notificações após aprovação
          refreshNotifications();
          // Recarregar registros se necessário
          // loadTimeRecords(); // Função não implementada
        }}
        theme={theme}
      />
    </PageContainer>
  );
}