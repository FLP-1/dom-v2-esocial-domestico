import React, { useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedModal, UnifiedButton } from '../unified';
import { FormGroup, Input, Label, Select } from '../FormComponents';
import { OptimizedFormRow, OptimizedLabel, OptimizedHelpText } from '../shared/optimized-styles';

// Styled Components
const ApprovalForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ApprovalInfo = styled.div<{ $theme: any }>`
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}20;
  margin-bottom: 1rem;
`;

const ApprovalInfoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 1rem;
  font-weight: 600;
`;

const ApprovalInfoText = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const JustificationSection = styled.div`
  margin-top: 1rem;
`;

const ApprovalStatus = styled.div<{ $theme: any; $approved: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: ${props => props.$approved ? '#d4edda' : '#fff3cd'};
  border: 1px solid ${props => props.$approved ? '#c3e6cb' : '#ffeaa7'};
  border-radius: 8px;
  margin-bottom: 1rem;
  
  .status-icon {
    font-size: 1.5rem;
  }
  
  .status-text {
    font-weight: 600;
    color: ${props => props.$approved ? '#155724' : '#856404'};
  }
`;

const NotificationPreview = styled.div<{ $theme: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}30;
`;

const PreviewTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
`;

const PreviewText = styled.p`
  margin: 0;
  color: #5a6c7d;
  font-size: 0.85rem;
  font-style: italic;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
`;

// Interfaces
export interface OvertimeRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  justification: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  reviewComment?: string;
}

export interface OvertimeApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: OvertimeRequest) => void;
  theme: any;
  request?: OvertimeRequest;
}

export const OvertimeApprovalModal: React.FC<OvertimeApprovalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  theme,
  request,
}) => {
  const [newRequest, setNewRequest] = useState<Partial<OvertimeRequest>>({
    startTime: '',
    endTime: '',
    justification: '',
    status: 'pending',
    requestedAt: new Date(),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newRequest.startTime || !newRequest.endTime || !newRequest.justification) {
      return;
    }

    const overtimeRequest: OvertimeRequest = {
      id: request?.id || Date.now().toString(),
      employeeId: request?.employeeId || 'current-user',
      employeeName: request?.employeeName || 'Usuário Atual',
      date: new Date().toISOString().split('T')[0],
      startTime: newRequest.startTime,
      endTime: newRequest.endTime,
      justification: newRequest.justification,
      status: newRequest.status as 'pending' | 'approved' | 'rejected',
      requestedAt: newRequest.requestedAt || new Date(),
    };

    onSubmit(overtimeRequest);
    onClose();
  };

  const generateNotificationPreview = () => {
    if (!newRequest.justification) return 'Digite a justificativa...';
    
    return `Solicitação de hora extra para ${newRequest.startTime} - ${newRequest.endTime}. Justificativa: ${newRequest.justification}`;
  };

  const isEditing = !!request;

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Solicitação de Hora Extra' : 'Solicitar Aprovação de Hora Extra'}
    >
      <ApprovalForm onSubmit={handleSubmit}>
        {!isEditing && (
          <ApprovalInfo $theme={theme}>
            <ApprovalInfoTitle>
              <AccessibleEmoji emoji="ℹ️" label="Informação" /> Informações Importantes
            </ApprovalInfoTitle>
            <ApprovalInfoText>
              A solicitação de horas extras será enviada para aprovação do seu empregador. 
              Você receberá uma notificação quando a solicitação for analisada.
            </ApprovalInfoText>
          </ApprovalInfo>
        )}

        {isEditing && request.status !== 'pending' && (
          <ApprovalStatus $theme={theme} $approved={request.status === 'approved'}>
            <span className="status-icon">
              <AccessibleEmoji 
                emoji={request.status === 'approved' ? '✅' : '❌'} 
                label={request.status === 'approved' ? 'Aprovado' : 'Rejeitado'} 
              />
            </span>
            <span className="status-text">
              {request.status === 'approved' ? 'Hora extra aprovada' : 'Hora extra rejeitada'}
            </span>
          </ApprovalStatus>
        )}

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor="start-time">
              <AccessibleEmoji emoji="🕐" label="Início" /> Início da Hora Extra
            </OptimizedLabel>
            <Input
              $theme={theme}
              type="time"
              id="start-time"
              value={newRequest.startTime}
              onChange={(e) => setNewRequest(prev => ({ ...prev, startTime: e.target.value }))}
              required
              disabled={isEditing && request.status !== 'pending'}
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor="end-time">
              <AccessibleEmoji emoji="🕐" label="Fim" /> Fim da Hora Extra
            </OptimizedLabel>
            <Input
              $theme={theme}
              type="time"
              id="end-time"
              value={newRequest.endTime}
              onChange={(e) => setNewRequest(prev => ({ ...prev, endTime: e.target.value }))}
              required
              disabled={isEditing && request.status !== 'pending'}
            />
          </FormGroup>
        </OptimizedFormRow>

        <FormGroup>
          <OptimizedLabel htmlFor="justification">
            <AccessibleEmoji emoji="📝" label="Justificativa" /> Justificativa
          </OptimizedLabel>
          <Input
            $theme={theme}
            type="text"
            id="justification"
            value={newRequest.justification}
            onChange={(e) => setNewRequest(prev => ({ ...prev, justification: e.target.value }))}
            placeholder="Descreva o motivo da hora extra..."
            required
            disabled={isEditing && request.status !== 'pending'}
          />
          <OptimizedHelpText>
            Explique detalhadamente o motivo da necessidade de horas extras
          </OptimizedHelpText>
        </FormGroup>

        {newRequest.justification && (
          <NotificationPreview $theme={theme}>
            <PreviewTitle>Preview da Notificação:</PreviewTitle>
            <PreviewText>{generateNotificationPreview()}</PreviewText>
          </NotificationPreview>
        )}

        {isEditing && request.status === 'pending' && (
          <JustificationSection>
            <FormGroup>
              <OptimizedLabel htmlFor="review-comment">
                <AccessibleEmoji emoji="💬" label="Comentário" /> Comentário do Empregador
              </OptimizedLabel>
              <Input
                $theme={theme}
                type="text"
                id="review-comment"
                placeholder="Adicione um comentário sobre a solicitação..."
              />
            </FormGroup>
          </JustificationSection>
        )}

        <ButtonGroup>
          <UnifiedButton
            type="button"
            $variant="secondary"
            $theme={theme}
            onClick={onClose}
          >
            <AccessibleEmoji emoji="❌" label="Cancelar" /> Cancelar
          </UnifiedButton>
          
          <UnifiedButton
            type="submit"
            $variant="primary"
            $theme={theme}
            $disabled={!newRequest.startTime || !newRequest.endTime || !newRequest.justification}
          >
            <AccessibleEmoji 
              emoji={isEditing ? "💾" : "📤"} 
              label={isEditing ? "Salvar" : "Enviar"} 
            />
            {isEditing ? 'Salvar Alterações' : 'Enviar Solicitação'}
          </UnifiedButton>
        </ButtonGroup>
      </ApprovalForm>
    </UnifiedModal>
  );
};

export default OvertimeApprovalModal;
