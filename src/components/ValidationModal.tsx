import React, { useEffect, useState } from 'react';
import { Modal } from './Modal';

interface ValidationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  tipo: 'email' | 'telefone';
  valor: string; // email ou telefone a ser validado
  titulo?: string;
}

interface ValidationState {
  step: 'input' | 'code' | 'success' | 'error';
  codigo: string;
  loading: boolean;
  error: string;
  timeLeft: number;
  canResend: boolean;
}

export const ValidationModal: React.FC<ValidationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  tipo,
  valor,
  titulo,
}) => {
  const [state, setState] = useState<ValidationState>({
    step: 'input',
    codigo: '',
    loading: false,
    error: '',
    timeLeft: 0,
    canResend: true,
  });

  // Timer para reenvio
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (state.timeLeft > 0) {
      timer = setTimeout(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
        }));
      }, 1000);
    } else if (state.timeLeft === 0 && !state.canResend) {
      setState(prev => ({
        ...prev,
        canResend: true,
      }));
    }

    return () => clearTimeout(timer);
  }, [state.timeLeft]);

  // Enviar código de validação
  const enviarCodigo = async () => {
    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const endpoint =
        tipo === 'email' ? '/api/validar-email' : '/api/validar-telefone';
      const campo = tipo === 'email' ? 'email' : 'telefone';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [campo]: valor,
          action: 'enviar',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          step: 'code',
          loading: false,
          timeLeft: 300, // 5 minutos
          canResend: false,
        }));

        // Se estiver em modo simulação, mostrar o código
        if (result.codigo) {
          console.log(`🔐 Código de validação (simulação): ${result.codigo}`);
        }
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Erro ao enviar código',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro de conexão. Tente novamente.',
      }));
    }
  };

  // Verificar código informado
  const verificarCodigo = async () => {
    if (!state.codigo.trim()) {
      setState(prev => ({ ...prev, error: 'Digite o código recebido' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const endpoint =
        tipo === 'email' ? '/api/validar-email' : '/api/validar-telefone';
      const campo = tipo === 'email' ? 'email' : 'telefone';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [campo]: valor,
          action: 'verificar',
          codigoInformado: state.codigo.trim(),
        }),
      });

      const result = await response.json();

      if (result.success) {
        setState(prev => ({
          ...prev,
          step: 'success',
          loading: false,
        }));

        // Chamar callback de sucesso após um breve delay
        setTimeout(() => {
          onSuccess(result);
          onClose();
        }, 1500);
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Código inválido',
        }));
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erro de conexão. Tente novamente.',
      }));
    }
  };

  // Formatar tempo restante
  const formatarTempo = (segundos: number): string => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, '0')}`;
  };

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setState({
        step: 'input',
        codigo: '',
        loading: false,
        error: '',
        timeLeft: 0,
        canResend: true,
      });
    }
  }, [isOpen]);

  const renderContent = () => {
    switch (state.step) {
      case 'input':
        return (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                {tipo === 'email' ? '📧' : '📱'}
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                {titulo || `Validar ${tipo === 'email' ? 'Email' : 'Telefone'}`}
              </h3>
              <p className='text-gray-600'>
                Enviaremos um código de validação para:
              </p>
              <p className='font-medium text-blue-600 mt-2'>
                {tipo === 'email'
                  ? valor
                  : valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </p>
            </div>

            {state.error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
                <p className='text-red-600 text-sm'>{state.error}</p>
              </div>
            )}

            <button
              onClick={enviarCodigo}
              disabled={state.loading}
              className='w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
            >
              {state.loading ? (
                <span className='flex items-center justify-center'>
                  <svg
                    className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                `Enviar Código ${tipo === 'email' ? 'por Email' : 'por SMS'}`
              )}
            </button>
          </div>
        );

      case 'code':
        return (
          <div className='text-center'>
            <div className='mb-6'>
              <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                🔐
              </div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>
                Digite o Código
              </h3>
              <p className='text-gray-600 mb-4'>
                Enviamos um código de 6 dígitos para:
              </p>
              <p className='font-medium text-blue-600 mb-4'>
                {tipo === 'email'
                  ? valor
                  : valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')}
              </p>

              {state.timeLeft > 0 && (
                <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4'>
                  <p className='text-yellow-700 text-sm'>
                    ⏰ Código expira em:{' '}
                    <strong>{formatarTempo(state.timeLeft)}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className='mb-4'>
              <input
                type='text'
                value={state.codigo}
                onChange={e => {
                  const valor = e.target.value
                    .replace(/\D/g, '')
                    .substring(0, 6);
                  setState(prev => ({ ...prev, codigo: valor, error: '' }));
                }}
                placeholder='000000'
                className='w-full text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg py-3 px-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                maxLength={6}
                autoFocus
              />
            </div>

            {state.error && (
              <div className='bg-red-50 border border-red-200 rounded-lg p-3 mb-4'>
                <p className='text-red-600 text-sm'>{state.error}</p>
              </div>
            )}

            <div className='space-y-3'>
              <button
                onClick={verificarCodigo}
                disabled={state.loading || state.codigo.length !== 6}
                className='w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {state.loading ? (
                  <span className='flex items-center justify-center'>
                    <svg
                      className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                      fill='none'
                      viewBox='0 0 24 24'
                    >
                      <circle
                        className='opacity-25'
                        cx='12'
                        cy='12'
                        r='10'
                        stroke='currentColor'
                        strokeWidth='4'
                      ></circle>
                      <path
                        className='opacity-75'
                        fill='currentColor'
                        d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                      ></path>
                    </svg>
                    Verificando...
                  </span>
                ) : (
                  'Verificar Código'
                )}
              </button>

              <button
                onClick={enviarCodigo}
                disabled={!state.canResend || state.loading}
                className='w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                {!state.canResend
                  ? `Reenviar em ${formatarTempo(state.timeLeft)}`
                  : 'Reenviar Código'}
              </button>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className='text-center'>
            <div className='w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              ✅
            </div>
            <h3 className='text-lg font-semibold text-green-900 mb-2'>
              Validação Concluída!
            </h3>
            <p className='text-green-600'>
              {tipo === 'email' ? 'Email' : 'Telefone'} validado com sucesso.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='sm'>
      <div className='p-6'>
        {renderContent()}

        {state.step !== 'success' && (
          <div className='mt-6 pt-4 border-t border-gray-200'>
            <button
              onClick={onClose}
              className='w-full text-gray-500 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors'
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
