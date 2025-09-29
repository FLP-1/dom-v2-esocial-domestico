import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import AccessibleEmoji from './AccessibleEmoji';
import { ActionButton } from './ActionButton';
import { Form, FormGroup, Input, Select } from './FormComponents';
import SimpleModal from './SimpleModal';
import ValidationModal from './ValidationModal';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  /* Mobile: Single column with larger gaps */
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  /* Tablet: Maintain two columns with adjusted gaps */
  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  /* Desktop: Larger gaps for better spacing */
  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

// Importar styled-components compartilhados
import { OptimizedErrorMessage, OptimizedFlexContainer, OptimizedHelpText, OptimizedInputStyled } from './shared/optimized-styles';

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.75rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);

  &:focus {
    outline: none;
    border-color: #29abe2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const SelectStyled = styled(Select)<{ $hasError?: boolean }>`
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
    border-color: #29abe2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

interface Employee {
  id: string;
  cpf: string;
  nome: string;
  pis: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
  dataDesligamento?: string;
  status: 'ATIVO' | 'INATIVO' | 'AFASTADO';
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
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

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'id'>) => void;
  employee?: Employee | null;
  theme: any;
}

const EmployeeModal: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  theme,
}) => {
  const alertManager = useAlertManager();
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    pis: '',
    cargo: '',
    salario: '',
    dataAdmissao: '',
    status: 'ATIVO' as const,
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
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<'email' | 'phone'>(
    'email'
  );
  const [emailValidado, setEmailValidado] = useState(false);
  const [telefoneValidado, setTelefoneValidado] = useState(false);
  const [chaveValidacaoEmail, setChaveValidacaoEmail] = useState('');
  const [chaveValidacaoTelefone, setChaveValidacaoTelefone] = useState('');

  useEffect(() => {
    if (employee) {
      setFormData({
        cpf: employee.cpf,
        nome: employee.nome,
        pis: employee.pis,
        cargo: employee.cargo,
        salario: employee.salario.toString(),
        dataAdmissao: employee.dataAdmissao,
        status: employee.status,
        endereco: { ...employee.endereco },
        contato: { ...employee.contato },
      });
    } else {
      setFormData({
        cpf: '',
        nome: '',
        pis: '',
        cargo: '',
        salario: '',
        dataAdmissao: '',
        status: 'ATIVO',
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
      });
    }
    setErrors({});
  }, [employee, isOpen]);

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

  const formatPIS = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{5})(\d{2})(\d{1})/, '$1.$2.$3-$4');
  };

  const formatCPF = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const validateCPF = (cpf: string) => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');

    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;

    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    // Calcula o primeiro dígito verificador
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    // Calcula o segundo dígito verificador
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;

    return true;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const enviarCodigoEmail = async () => {
    try {
      if (
        !formData.contato.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contato.email)
      ) {
        alertManager.showError('Por favor, informe um email válido');
        return;
      }

      const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();

      const response = await fetch('/api/enviar-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.contato.email,
          codigo: codigo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setChaveValidacaoEmail(codigo);
        alertManager.showSuccess(
          `Código enviado para ${formData.contato.email}: ${codigo}`
        );
        console.log('Email enviado:', result);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na API');
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      alertManager.showError(
        `Erro ao enviar código de validação por email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const abrirModalValidacaoEmail = () => {
    if (!chaveValidacaoEmail) {
      alertManager.showWarning('Por favor, envie o código primeiro');
      return;
    }
    setValidationType('email');
    setShowValidationModal(true);
  };

  const validarEmail = (code: string) => {
    if (code === chaveValidacaoEmail) {
      setEmailValidado(true);
      setShowValidationModal(false);
      alertManager.showSuccess('Email validado com sucesso!');
    } else {
      alertManager.showError('Código inválido. Tente novamente.');
    }
  };

  const enviarCodigoTelefone = async () => {
    try {
      if (!formData.contato.telefone) {
        alertManager.showError('Por favor, informe um telefone válido');
        return;
      }

      const codigo = Math.random().toString(36).substr(2, 6).toUpperCase();

      const response = await fetch('/api/enviar-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telefone: formData.contato.telefone,
          codigo: codigo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setChaveValidacaoTelefone(codigo);
        alertManager.showSuccess(
          `Código enviado para ${formData.contato.telefone}: ${codigo}`
        );
        console.log('SMS enviado:', result);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na API');
      }
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      alertManager.showError(
        `Erro ao enviar código de validação por SMS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const abrirModalValidacaoTelefone = () => {
    if (!chaveValidacaoTelefone) {
      alertManager.showWarning('Por favor, envie o código primeiro');
      return;
    }
    setValidationType('phone');
    setShowValidationModal(true);
  };

  const validarTelefone = (code: string) => {
    if (code === chaveValidacaoTelefone) {
      setTelefoneValidado(true);
      setShowValidationModal(false);
      alertManager.showSuccess('Telefone validado com sucesso!');
    } else {
      alertManager.showError('Código inválido. Tente novamente.');
    }
  };

  const consultarCEP = async (cep: string) => {
    try {
      const cepLimpo = cep.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            endereco: {
              ...prev.endereco,
              logradouro: data.logradouro || '',
              bairro: data.bairro || '',
              cidade: data.localidade || '',
              uf: data.uf || '',
            },
          }));
        }
      }
    } catch (error) {
      console.error('Erro ao consultar CEP:', error);
    }
  };

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cpf':
        if (value && !validateCPF(value)) {
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
      case 'salario':
        if (value && (isNaN(Number(value)) || Number(value) <= 0)) {
          newErrors[field] = 'Salário deve ser um valor válido';
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

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    if (field === 'cpf') {
      formattedValue = formatCPF(value);
    } else if (field === 'cep') {
      formattedValue = formatCEP(value);
    } else if (field === 'telefone') {
      formattedValue = formatPhone(value);
    } else if (field === 'pis') {
      formattedValue = formatPIS(value);
    }

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent as keyof typeof prev]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child as any]: formattedValue,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: formattedValue }));
    }

    validateField(field, formattedValue);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar todos os campos obrigatórios
    const requiredFields = [
      'cpf',
      'nome',
      'pis',
      'cargo',
      'salario',
      'dataAdmissao',
    ];
    const newErrors: Record<string, string> = {};

    requiredFields.forEach(field => {
      if (!formData[field as keyof typeof formData]) {
        newErrors[field] = 'Campo obrigatório';
      }
    });

    // Validar email
    if (!formData.contato.email) {
      newErrors['email'] = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contato.email)) {
      newErrors['email'] = 'Email inválido';
    } else if (!emailValidado) {
      newErrors['email'] = 'Email deve ser validado';
    }

    // Validar telefone
    if (!formData.contato.telefone) {
      newErrors['telefone'] = 'Telefone é obrigatório';
    } else if (!telefoneValidado) {
      newErrors['telefone'] = 'Telefone deve ser validado';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const employeeData = {
      ...formData,
      salario: Number(formData.salario),
    };

    onSave(employeeData);
    onClose();
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <AccessibleEmoji emoji='👤' label='Funcionário' />{' '}
          {employee ? 'Editar Funcionário' : 'Adicionar Funcionário'}
        </>
      }
      maxWidth='700px'
      footer={
        <>
          <ActionButton variant='secondary' theme={theme} onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton variant='primary' theme={theme} onClick={handleSubmit}>
            <AccessibleEmoji emoji='💾' label='Salvar' />{' '}
            {employee ? 'Atualizar' : 'Adicionar'}
          </ActionButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='cpf'>CPF *</OptimizedLabel>
            <OptimizedInputStyled
              id='cpf'
              type='text'
              value={formData.cpf}
              onChange={e => handleInputChange('cpf', e.target.value)}
              onBlur={() => {
                if (formData.cpf && !validateCPF(formData.cpf)) {
                  setErrors(prev => ({ ...prev, cpf: 'CPF inválido' }));
                } else {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.cpf;
                    return newErrors;
                  });
                }
              }}
              placeholder='000.000.000-00'
              maxLength={14}
              $hasError={!!errors['cpf']}
            />
            {errors['cpf'] && <OptimizedErrorMessage>{errors['cpf']}</OptimizedErrorMessage>}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='nome'>Nome Completo *</OptimizedLabel>
            <OptimizedInputStyled
              id='nome'
              type='text'
              value={formData.nome}
              onChange={e => handleInputChange('nome', e.target.value)}
              placeholder='Nome completo do funcionário'
              $hasError={!!errors['nome']}
            />
            {errors['nome'] && <OptimizedErrorMessage>{errors['nome']}</OptimizedErrorMessage>}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='pis'>PIS *</OptimizedLabel>
            <OptimizedInputStyled
              id='pis'
              type='text'
              value={formData.pis}
              onChange={e => handleInputChange('pis', e.target.value)}
              placeholder='000.00000.00-0'
              $hasError={!!errors['pis']}
            />
            {errors['pis'] && <OptimizedErrorMessage>{errors['pis']}</OptimizedErrorMessage>}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='cargo'>Cargo *</OptimizedLabel>
            <OptimizedInputStyled
              id='cargo'
              type='text'
              value={formData.cargo}
              onChange={e => handleInputChange('cargo', e.target.value)}
              placeholder='Ex: Empregado Doméstico'
              $hasError={!!errors['cargo']}
            />
            {errors['cargo'] && <OptimizedErrorMessage>{errors['cargo']}</OptimizedErrorMessage>}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='salario'>Salário *</OptimizedLabel>
            <OptimizedInputStyled
              id='salario'
              type='number'
              value={formData.salario}
              onChange={e => handleInputChange('salario', e.target.value)}
              placeholder='0.00'
              step='0.01'
              min='0'
              $hasError={!!errors['salario']}
            />
            {errors['salario'] && (
              <OptimizedErrorMessage>{errors['salario']}</OptimizedErrorMessage>
            )}
            <OptimizedHelpText>Valor em reais (R$)</OptimizedHelpText>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='dataAdmissao'>Data de Admissão *</OptimizedLabel>
            <OptimizedInputStyled
              id='dataAdmissao'
              type='date'
              value={formData.dataAdmissao}
              onChange={e => handleInputChange('dataAdmissao', e.target.value)}
              $hasError={!!errors['dataAdmissao']}
            />
            {errors['dataAdmissao'] && (
              <OptimizedErrorMessage>{errors['dataAdmissao']}</OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='telefone'>Telefone *</OptimizedLabel>
            <OptimizedFlexContainer>
              <OptimizedInputStyled
                id='telefone'
                type='text'
                value={formData.contato.telefone}
                onChange={e =>
                  handleInputChange(
                    'contato.telefone',
                    formatPhone(e.target.value)
                  )
                }
                placeholder='(00) 00000-0000'
                maxLength={15}
                $hasError={!!errors['telefone']}
              />
              <button
                type='button'
                onClick={enviarCodigoTelefone}
                disabled={!formData.contato.telefone}
              >
                <AccessibleEmoji emoji='📱' label='Telefone' /> Enviar
              </ActionButtonStyled>
            </OptimizedFlexContainer>
            <div>
              <input
                type='checkbox'
                checked={telefoneValidado}
                aria-label='Telefone validado'
                onChange={() => {
                  if (!telefoneValidado) {
                    enviarCodigoTelefone();
                  }
                }}
              />
              <label
              >
                {telefoneValidado ? (
                  <>
                    <AccessibleEmoji emoji='✅' label='Validado' /> Telefone
                    validado
                  </>
                ) : (
                  <>
                    <AccessibleEmoji emoji='⚠️' label='Aviso' /> Clique para
                    validar telefone
                  </>
                )}
              </label>
            </RelativeContainer>
            {errors['telefone'] && (
              <OptimizedErrorMessage>{errors['telefone']}</OptimizedErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='email'>Email *</OptimizedLabel>
            <OptimizedFlexContainer>
              <OptimizedInputStyled
                id='email'
                type='email'
                value={formData.contato.email}
                onChange={e =>
                  handleInputChange('contato.email', e.target.value)
                }
                placeholder='funcionario@email.com'
                $hasError={!!errors['email']}
              />
              <button
                type='button'
                onClick={enviarCodigoEmail}
                disabled={
                  !formData.contato.email ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contato.email)
                }
              >
                <AccessibleEmoji emoji='📧' label='Email' /> Enviar
              </ActionButtonStyled>
            </OptimizedFlexContainer>
            <div>
              <input
                type='checkbox'
                checked={emailValidado}
                aria-label='Email validado'
                onChange={() => {
                  if (!emailValidado) {
                    enviarCodigoEmail();
                  }
                }}
              />
              <label
              >
                {emailValidado ? (
                  <>
                    <AccessibleEmoji emoji='✅' label='Validado' /> Email
                    validado
                  </>
                ) : (
                  <>
                    <AccessibleEmoji emoji='⚠️' label='Aviso' /> Clique para
                    validar email
                  </>
                )}
              </label>
            </RelativeContainer>
            {errors['email'] && <OptimizedErrorMessage>{errors['email']}</OptimizedErrorMessage>}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='cep'>CEP *</OptimizedLabel>
            <OptimizedFlexContainer>
              <OptimizedInputStyled
                id='cep'
                type='text'
                value={formData.endereco.cep}
                onChange={e => {
                  const value = formatCEP(e.target.value);
                  handleInputChange('endereco.cep', value);
                  if (value.replace(/\D/g, '').length === 8) {
                    consultarCEP(value);
                  }
                }}
                placeholder='00000-000'
                maxLength={9}
                $hasError={!!errors['cep']}
              />
              <button
                type='button'
                onClick={() => consultarCEP(formData.endereco.cep)}
                disabled={formData.endereco.cep.replace(/\D/g, '').length !== 8}
              >
                <AccessibleEmoji emoji='🔍' label='Buscar' /> Buscar
              </ActionButtonStyled>
            </OptimizedFlexContainer>
            {errors['cep'] && <OptimizedErrorMessage>{errors['cep']}</OptimizedErrorMessage>}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='uf'>UF *</OptimizedLabel>
            <OptimizedSelectStyled
              id='uf'
              value={formData.endereco.uf}
              onChange={e => handleInputChange('endereco.uf', e.target.value)}
              $hasError={!!errors['uf']}
              aria-label='Selecionar estado'
              title='Selecionar estado'
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
            {errors['uf'] && <OptimizedErrorMessage>{errors['uf']}</OptimizedErrorMessage>}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='logradouro'>Logradouro *</OptimizedLabel>
            <OptimizedInputStyled
              id='logradouro'
              type='text'
              value={formData.endereco.logradouro}
              onChange={e =>
                handleInputChange('endereco.logradouro', e.target.value)
              }
              placeholder='Rua, Avenida, etc.'
              $hasError={!!errors['logradouro']}
            />
            {errors['logradouro'] && (
              <OptimizedErrorMessage>{errors['logradouro']}</OptimizedErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='numero'>Número *</OptimizedLabel>
            <OptimizedInputStyled
              id='numero'
              type='text'
              value={formData.endereco.numero}
              onChange={e =>
                handleInputChange('endereco.numero', e.target.value)
              }
              placeholder='123'
              $hasError={!!errors['numero']}
            />
            {errors['numero'] && (
              <OptimizedErrorMessage>{errors['numero']}</OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormRow>

        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel htmlFor='bairro'>Bairro *</OptimizedLabel>
            <OptimizedInputStyled
              id='bairro'
              type='text'
              value={formData.endereco.bairro}
              onChange={e =>
                handleInputChange('endereco.bairro', e.target.value)
              }
              placeholder='Nome do bairro'
              $hasError={!!errors['bairro']}
            />
            {errors['bairro'] && (
              <OptimizedErrorMessage>{errors['bairro']}</OptimizedErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='cidade'>Cidade *</OptimizedLabel>
            <OptimizedInputStyled
              id='cidade'
              type='text'
              value={formData.endereco.cidade}
              onChange={e =>
                handleInputChange('endereco.cidade', e.target.value)
              }
              placeholder='Nome da cidade'
              $hasError={!!errors['cidade']}
            />
            {errors['cidade'] && (
              <OptimizedErrorMessage>{errors['cidade']}</OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormRow>

        <FormGroup>
          <OptimizedLabel htmlFor='complemento'>Complemento</OptimizedLabel>
          <OptimizedInputStyled
            id='complemento'
            type='text'
            value={formData.endereco.complemento}
            onChange={e =>
              handleInputChange('endereco.complemento', e.target.value)
            }
            placeholder='Apartamento, casa, etc.'
          />
        </FormGroup>
      </Form>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onValidate={validationType === 'email' ? validarEmail : validarTelefone}
        type={validationType}
        contact={
          validationType === 'email'
            ? formData.contato.email
            : formData.contato.telefone
        }
        theme={theme}
      />
    </SimpleModal>
  );
};

export default EmployeeModal;
