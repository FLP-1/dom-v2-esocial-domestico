import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import AccessibleEmoji from '../AccessibleEmoji';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import ActionIcon from '../ActionIcon';
import { UnifiedModal } from '../unified';
import DataList, { DataListColumn, DataListAction } from '../DataList';

interface PendingRecord {
  id: string;
  tipo: string;
  dataHora: string;
  latitude: number;
  longitude: number;
  precisao: number;
  endereco?: string;
  nomeRedeWiFi?: string;
  observacao?: string;
  usuario: {
    nomeCompleto: string;
    email: string;
  };
}

interface PendingApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
  theme?: any;
}

const ModalContent = styled.div`
  padding: 1.5rem;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const RecordItem = styled.div`
  border: 1px solid ${props => props.theme?.border?.muted || '#e0e0e0'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  background: ${props => props.theme?.background?.secondary || '#f9f9f9'};
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RecordType = styled.span`
  font-weight: 600;
  color: ${props => props.theme?.text?.dark || '#2c3e50'};
  text-transform: capitalize;
`;

const RecordTime = styled.span`
  color: ${props => props.theme?.text?.secondary || '#666'};
  font-size: 0.9rem;
`;

const RecordDetails = styled.div`
  margin: 0.5rem 0;
  font-size: 0.9rem;
  color: ${props => props.theme?.text?.secondary || '#555'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

// ActionIcon agora é importado do componente centralizado

const JustificationInput = styled.textarea`
  width: 100%;
  min-height: 60px;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme?.border?.primary || '#ddd'};
  border-radius: 4px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  resize: vertical;
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
`;

const UserInfo = styled.div`
  .user-name {
    font-weight: 500;
  }
  .user-email {
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.secondary || '#666'};
  }
`;

const LocationInfo = styled.div`
  .address {
    font-size: 0.9rem;
  }
  .precision {
    font-size: 0.8rem;
    color: ${props => props.theme?.text?.secondary || '#666'};
  }
`;

const WifiInfo = styled.span`
  font-size: 0.9rem;
`;

const DescriptionText = styled.p`
  margin-bottom: 1rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
`;

const PendingApprovalModal: React.FC<PendingApprovalModalProps> = ({
  isOpen,
  onClose,
  onApprovalComplete,
  theme
}) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);
  const [justifications, setJustifications] = useState<Record<string, string>>({});

  // Carregar registros pendentes
  const loadPendingRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/time-clock/pending-approval');
      if (response.ok) {
        const result = await response.json();
        setPendingRecords(result.data || []);
      } else {
        toast.error('Erro ao carregar registros pendentes');
      }
    } catch (error) {
      console.error('Erro ao carregar registros pendentes:', error);
      toast.error('Erro ao carregar registros pendentes');
    } finally {
      setLoading(false);
    }
  };

  // Processar aprovação/rejeição
  const handleApproval = async (recordId: string, action: 'aprovar' | 'rejeitar') => {
    setProcessing(recordId);
    try {
      const response = await fetch('/api/time-clock/pending-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registroId: recordId,
          acao: action,
          justificativa: justifications[recordId] || undefined
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(result.message || `Registro ${action === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso`);
        
        // Remover registro da lista
        setPendingRecords(prev => prev.filter(record => record.id !== recordId));
        
        // Limpar justificativa
        setJustifications(prev => {
          const newJustifications = { ...prev };
          delete newJustifications[recordId];
          return newJustifications;
        });

        // Notificar componente pai
        onApprovalComplete();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Erro ao processar aprovação');
      }
    } catch (error) {
      console.error('Erro ao processar aprovação:', error);
      toast.error('Erro ao processar aprovação');
    } finally {
      setProcessing(null);
    }
  };

  // Carregar registros quando modal abrir
  useEffect(() => {
    if (isOpen) {
      loadPendingRecords();
    }
  }, [isOpen]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      entrada: 'Entrada',
      saida_almoco: 'Saída Almoço',
      retorno_almoco: 'Retorno Almoço',
      saida: 'Saída',
      inicio_extra: 'Início Hora Extra',
      fim_extra: 'Fim Hora Extra'
    };
    return labels[tipo] || tipo;
  };

  // Configurar colunas para o DataList
  const columns: DataListColumn[] = [
    {
      key: 'tipo',
      label: 'Tipo',
      width: '120px',
      render: (item: PendingRecord) => (
        <RecordType>
          {getTypeLabel(item.tipo)}
        </RecordType>
      )
    },
    {
      key: 'dataHora',
      label: 'Data/Hora',
      width: '150px',
      render: (item: PendingRecord) => formatTime(item.dataHora)
    },
    {
      key: 'usuario',
      label: 'Usuário',
      width: '200px',
      render: (item: PendingRecord) => (
        <UserInfo>
          <div className="user-name">{item.usuario.nomeCompleto}</div>
          <div className="user-email">{item.usuario.email}</div>
        </UserInfo>
      )
    },
    {
      key: 'endereco',
      label: 'Localização',
      width: '200px',
      render: (item: PendingRecord) => (
        <LocationInfo>
          <div className="address">{item.endereco || 'Não informado'}</div>
          <div className="precision">
            Precisão: {item.precisao?.toFixed(0) || 'N/A'}m
          </div>
        </LocationInfo>
      )
    },
    {
      key: 'wifi',
      label: 'WiFi',
      width: '120px',
      render: (item: PendingRecord) => (
        <WifiInfo>
          {item.nomeRedeWiFi || 'Não detectado'}
        </WifiInfo>
      )
    }
  ];

  // Configurar ações para o DataList
  const actions: DataListAction[] = [
    {
      icon: '✅',
      label: 'Aprovar',
      variant: 'primary',
      onClick: (item: PendingRecord) => handleApproval(item.id, 'aprovar'),
      disabled: (item: PendingRecord) => processing === item.id
    },
    {
      icon: '❌',
      label: 'Rejeitar',
      variant: 'danger',
      onClick: (item: PendingRecord) => handleApproval(item.id, 'rejeitar'),
      disabled: (item: PendingRecord) => processing === item.id
    }
  ];

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Aprovação de Registros Pendentes"
    >
      <ModalContent>
        {loading ? (
          <LoadingSpinner>
            <AccessibleEmoji emoji="⏳" label="Carregando" />
            Carregando registros pendentes...
          </LoadingSpinner>
        ) : pendingRecords.length === 0 ? (
          <EmptyState>
            <AccessibleEmoji emoji="✅" label="Concluído" />
            <p>Não há registros pendentes para aprovação.</p>
          </EmptyState>
        ) : (
          <>
            <DescriptionText>
              Registros que precisam de aprovação ou rejeição:
            </DescriptionText>
            
            <DataList
              theme={theme || { colors: { primary: '#29abe2', text: '#2c3e50', shadow: 'rgba(0, 0, 0, 0.1)' } }}
              items={pendingRecords}
              columns={columns}
              actions={actions}
              emptyMessage="Nenhum registro pendente encontrado"
              loading={loading}
              variant="detailed"
              striped={true}
              hoverable={true}
            />
          </>
        )}
      </ModalContent>
    </UnifiedModal>
  );
};

export default PendingApprovalModal;
