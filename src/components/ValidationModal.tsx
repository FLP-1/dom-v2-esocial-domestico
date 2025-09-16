import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import AccessibleEmoji from './AccessibleEmoji';
import { ActionButton } from './ActionButton';
import { Form, FormGroup, Input } from './FormComponents';
import SimpleModal from './SimpleModal';

const TimerDisplay = styled.div`
  font-size: 0.9rem;
  color: #e74c3c;
  font-weight: 600;
  text-align: center;
  margin: 0.5rem 0;
`;

const ValidationText = styled.p`
  text-align: center;
  margin-bottom: 1rem;
`;

const CodeInput = styled(Input)`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 0.2rem;
  text-transform: uppercase;
`;

const ResendButton = styled.button`
  background: none;
  border: none;
  color: #29abe2;
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: underline;
  margin-top: 0.5rem;

  &:hover {
    color: #1e8bc3;
  }

  &:disabled {
    color: #bdc3c7;
    cursor: not-allowed;
  }
`;

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (code: string) => void;
  type: 'email' | 'phone';
  contact: string;
  theme: any;
}

const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  onValidate,
  type,
  contact,
  theme,
}) => {
  const alertManager = useAlertManager();
  const [code, setCode] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutos
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setTimeLeft(300);
      setCanResend(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      onValidate(code);
    }
  };

  const handleResend = () => {
    setTimeLeft(300);
    setCanResend(false);
    // Aqui você implementaria o reenvio do código
    alertManager.showInfo(`Código reenviado para ${contact}`);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <AccessibleEmoji
            emoji={type === 'email' ? '📧' : '📱'}
            label={type === 'email' ? 'Email' : 'Telefone'}
          />
          Validar {type === 'email' ? 'Email' : 'Telefone'}
        </>
      }
      maxWidth='400px'
      footer={
        <>
          <ActionButton variant='secondary' theme={theme} onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton
            variant='primary'
            theme={theme}
            onClick={handleSubmit}
            disabled={code.length !== 6}
          >
            <AccessibleEmoji emoji='✓' label='Validar' /> Validar
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <FormGroup>
          <ValidationText>
            Digite o código de 6 dígitos enviado para:
            <br />
            <strong>{contact}</strong>
          </ValidationText>

          <CodeInput
            type='text'
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder='000000'
            maxLength={6}
            style={{ marginBottom: '0.5rem' }}
          />

          <TimerDisplay>
            {timeLeft > 0
              ? `Tempo restante: ${formatTime(timeLeft)}`
              : 'Código expirado'}
          </TimerDisplay>

          <ResendButton
            type='button'
            onClick={handleResend}
            disabled={!canResend}
          >
            {canResend ? 'Reenviar código' : 'Aguarde para reenviar'}
          </ResendButton>
        </FormGroup>
      </Form>
    </SimpleModal>
  );
};

export default ValidationModal;
