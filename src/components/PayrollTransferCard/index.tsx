import React, { useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard, UnifiedButton } from '../unified';

// Styled Components
const TransferContainer = styled.div<{ $theme: any }>`
  position: relative;
`;

const TransferInfo = styled.div<{ $theme: any }>`
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}20;
  margin-bottom: 1rem;
`;

const TransferInfoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferInfoText = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const TransferSummary = styled.div<{ $theme: any }>`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
  margin-bottom: 1rem;
`;

const TransferSummaryTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TransferRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransferLabel = styled.span`
  font-size: 0.9rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const TransferValue = styled.span<{ $theme: any; $highlight?: boolean }>`
  font-size: 1rem;
  font-weight: ${props => props.$highlight ? '700' : '600'};
  color: ${props => props.$highlight ? props.$theme.colors.primary : '#2c3e50'};
`;

const TransferActions = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
`;

const WarningSection = styled.div<{ $theme: any }>`
  padding: 1rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const WarningTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WarningText = styled.p`
  margin: 0;
  color: #856404;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const TitleContent = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

// Interfaces
export interface PayrollData {
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  period: string;
  lastTransfer?: Date;
  // Campos opcionais para compatibilidade com API
  upcomingTransfers?: Array<{ mesReferencia: number; anoReferencia: number }>;
  totalTransfers?: number;
  overtimeData?: { totalOvertime?: string };
}

export interface PayrollTransferCardProps {
  theme: any;
  payrollData: PayrollData;
  onTransfer: () => void;
  onViewDetails: () => void;
}

// Helper function para formatar tempo
const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins.toString().padStart(2, '0')}min`;
};

export const PayrollTransferCard: React.FC<PayrollTransferCardProps> = ({
  theme,
  payrollData,
  onTransfer,
  onViewDetails,
}) => {
  // Extrair dados reais do payrollData
  const lastTransfer = payrollData?.lastTransfer as any;
  const upcomingTransfer = payrollData?.upcomingTransfers?.[0];
  const totalTransfers = payrollData?.totalTransfers || 0;
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    setIsTransferring(true);
    try {
      await onTransfer();
    } finally {
      setIsTransferring(false);
    }
  };

  const canTransfer = (lastTransfer || upcomingTransfer) && !isTransferring;
  const hasOvertime = payrollData?.overtimeData?.totalOvertime && parseFloat(payrollData.overtimeData.totalOvertime) > 0;

  return (
    <TransferContainer $theme={theme}>
      <UnifiedCard
        theme={theme}
        variant="default"
        size="md"
        icon={<AccessibleEmoji emoji="💰" label="Folha de Pagamento" />}
        title="Transferir para Folha de Pagamento"
      >
        <TransferInfo $theme={theme}>
          <TransferInfoTitle>
            <AccessibleEmoji emoji="ℹ️" label="Informação" />
            Informações Importantes
          </TransferInfoTitle>
          <TransferInfoText>
            Os dados de horas trabalhadas serão transferidos para o sistema de cálculo da folha de pagamento. 
            Esta ação não pode ser desfeita.
          </TransferInfoText>
        </TransferInfo>

        <TransferSummary $theme={theme}>
          <TransferSummaryTitle>
            <AccessibleEmoji emoji="📊" label="Resumo" />
            Resumo das Transferências
          </TransferSummaryTitle>
          
          <TransferRow>
            <TransferLabel>Última Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {lastTransfer ? `${lastTransfer.mesReferencia.toString().padStart(2, '0')}/${lastTransfer.anoReferencia}` : 'N/A'}
            </TransferValue>
          </TransferRow>
          
          <TransferRow>
            <TransferLabel>Valor da Última Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {lastTransfer?.valorTotal ? 
                `R$ ${lastTransfer.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 
                'N/A'
              }
            </TransferValue>
          </TransferRow>
          
          <TransferRow>
            <TransferLabel>Próxima Transferência:</TransferLabel>
            <TransferValue $theme={theme}>
              {upcomingTransfer ? `${upcomingTransfer.mesReferencia.toString().padStart(2, '0')}/${upcomingTransfer.anoReferencia}` : 'Não agendada'}
            </TransferValue>
          </TransferRow>
          
          <TransferRow>
            <TransferLabel>Total de Transferências:</TransferLabel>
            <TransferValue $theme={theme} $highlight>
              {totalTransfers}
            </TransferValue>
          </TransferRow>
        </TransferSummary>

        {lastTransfer && (
          <TransferInfo $theme={theme}>
            <TransferInfoTitle>
              <AccessibleEmoji emoji="🕒" label="Última Transferência" />
              Última Transferência
            </TransferInfoTitle>
            <TransferInfoText>
              {`${lastTransfer.mesReferencia.toString().padStart(2, '0')}/${lastTransfer.anoReferencia}`} - Status: {lastTransfer.status} - Valor: R$ {lastTransfer.valorTotal?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}
            </TransferInfoText>
          </TransferInfo>
        )}

        {!canTransfer && (
          <WarningSection $theme={theme}>
            <WarningTitle>
              <AccessibleEmoji emoji="⚠️" label="Aviso" />
              Nenhuma Hora para Transferir
            </WarningTitle>
            <WarningText>
              Não há horas trabalhadas registradas neste período para transferir.
            </WarningText>
          </WarningSection>
        )}

        <TransferActions>
          <UnifiedButton
            $variant="secondary"
            $theme={theme}
            onClick={onViewDetails}
          >
            <AccessibleEmoji emoji="👁️" label="Ver Detalhes" />
            Ver Detalhes
          </UnifiedButton>
          
          <UnifiedButton
            $variant="primary"
            $theme={theme}
            onClick={handleTransfer}
            $disabled={!canTransfer || isTransferring}
            $loading={isTransferring}
          >
            <AccessibleEmoji emoji="📤" label="Transferir" />
            {isTransferring ? 'Transferindo...' : 'Transferir'}
          </UnifiedButton>
        </TransferActions>
      </UnifiedCard>
    </TransferContainer>
  );
};

export default PayrollTransferCard;
