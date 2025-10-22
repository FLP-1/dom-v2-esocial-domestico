// src/components/PendingRecordsList/index.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';
import ActionIcon from '../ActionIcon';

interface PendingRecord {
  id: string;
  tipo: string;
  dataHora: string;
  endereco?: string;
  precisao?: number;
  observacao?: string;
  usuario: {
    id: string;
    nomeCompleto: string;
    email: string;
  };
}

interface PendingRecordsListProps {
  theme: any;
}

const ListContainer = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${props => props.theme?.border?.muted || '#e0e0e0'};
`;

const ListTitle = styled.h3`
  margin: 0;
  color: ${props => props.theme?.text?.dark || '#2c3e50'};
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RefreshButton = styled.button`
  background: ${props => props.theme?.navigation?.primary || '#29ABE2'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme?.navigation?.primary || '#1e8bb8'};
    transform: translateY(-1px);
  }
`;

const RecordItem = styled.div`
  background: ${props => props.theme?.background?.secondary || '#f8f9fa'};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.theme?.status?.warning?.color || '#ffc107'};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const RecordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const RecordType = styled.div`
  font-weight: 600;
  color: ${props => props.theme?.text?.dark || '#2c3e50'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const RecordTime = styled.div`
  color: ${props => props.theme?.text?.secondary || '#666'};
  font-size: 0.9rem;
`;

const RecordDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const RecordActions = styled.div`
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
`;

const RecordDescription = styled.p`
  margin-bottom: 1rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
`;

const LoadingState = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme?.text?.secondary || '#666'};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e74c3c;
  background: #fdf2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
`;

const PendingRecordsList: React.FC<PendingRecordsListProps> = ({ theme }) => {
  const { currentProfile } = useUserProfile();
  const { colors: themeColors } = useTheme(currentProfile?.role.toLowerCase());
  const [pendingRecords, setPendingRecords] = useState<PendingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPendingRecords = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/time-clock/pending-approval');
      if (!response.ok) {
        throw new Error('Erro ao carregar registros pendentes');
      }
      
      const data = await response.json();
      setPendingRecords(data.data || []); // ✅ Corrigido: usar data.data em vez de data.records
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingRecords();
  }, []);

  const handleApproval = async (recordId: string, action: 'approve' | 'reject') => {
    try {
      const response = await fetch('/api/time-clock/pending-approval', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recordId,
          action,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro`);
      }

      // Recarregar lista após ação
      await loadPendingRecords();
      
      // Disparar evento para atualizar contadores
      window.dispatchEvent(new CustomEvent('timeClockNotificationsUpdated'));
      
    } catch (err) {
      console.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro:`, err);
      // Usar toast em vez de alert para melhor UX
      // toast.error(`Erro ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} registro`);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTypeLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      'entrada': 'Entrada',
      'saida_almoco': 'Saída Almoço',
      'retorno_almoco': 'Retorno Almoço',
      'saida': 'Saída',
      'entrada_extra': 'Entrada Extra',
      'saida_extra': 'Saída Extra',
    };
    return labels[tipo] || tipo;
  };

  if (loading) {
    return (
      <ListContainer $theme={theme}>
        <LoadingState>
          <AccessibleEmoji emoji="⏳" label="Carregando" />
          Carregando registros pendentes...
        </LoadingState>
      </ListContainer>
    );
  }

  if (error) {
    return (
      <ListContainer $theme={theme}>
        <ErrorState>
          <AccessibleEmoji emoji="❌" label="Erro" />
          {error}
          <br />
          <RefreshButton onClick={loadPendingRecords}>
            Tentar Novamente
          </RefreshButton>
        </ErrorState>
      </ListContainer>
    );
  }

  return (
    <ListContainer $theme={theme}>
      <ListHeader>
        <ListTitle>
          <AccessibleEmoji emoji="🕒" label="Pendências" />
          Registros Pendentes ({pendingRecords.length})
        </ListTitle>
        <RefreshButton onClick={loadPendingRecords}>
          <AccessibleEmoji emoji="🔄" label="Atualizar" />
          Atualizar
        </RefreshButton>
      </ListHeader>

      {pendingRecords.length === 0 ? (
        <EmptyState>
          <AccessibleEmoji emoji="✅" label="Concluído" />
          <p>Não há registros pendentes para aprovação.</p>
        </EmptyState>
      ) : (
        <>
          <RecordDescription>
            Registros que precisam de aprovação ou rejeição:
          </RecordDescription>
          
          {pendingRecords.map((record) => (
            <RecordItem key={record.id}>
              <RecordHeader>
                <RecordType>
                  <AccessibleEmoji emoji="📍" label="Registro" />
                  {getTypeLabel(record.tipo)}
                </RecordType>
                <RecordTime>
                  {formatTime(record.dataHora)}
                </RecordTime>
              </RecordHeader>
              
              <RecordDetails>
                <div><strong>Usuário:</strong> {record.usuario.nomeCompleto}</div>
                <div><strong>Email:</strong> {record.usuario.email}</div>
                <div><strong>Localização:</strong> {record.endereco || 'Não informado'}</div>
                <div><strong>Precisão:</strong> {record.precisao?.toFixed(0) || 'N/A'}m</div>
                {record.observacao && (
                  <div><strong>Observação:</strong> {record.observacao}</div>
                )}
              </RecordDetails>
              
              <RecordActions>
                <ActionIcon
                  variant="approve"
                  size="medium"
                  onClick={() => handleApproval(record.id, 'approve')}  
                  title="Aprovar"
                >
                  <span role="img" aria-label="Aprovar">✅</span>
                </ActionIcon>
                <ActionIcon
                  variant="reject"
                  size="medium"
                  onClick={() => handleApproval(record.id, 'reject')}
                  title="Rejeitar"
                >
                  <span role="img" aria-label="Rejeitar">❌</span>
                </ActionIcon>
              </RecordActions>
            </RecordItem>
          ))}
        </>
      )}
    </ListContainer>
  );
};

export default PendingRecordsList;
