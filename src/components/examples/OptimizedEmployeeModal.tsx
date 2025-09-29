import React, { useEffect, useState } from 'react';
import { useAlertManager } from '../../hooks/useAlertManager';
import AccessibleEmoji from '../AccessibleEmoji';
import { ActionButton } from '../ActionButton';
import { Form, FormGroup } from '../FormComponents';
import ValidationModal from '../ValidationModal';
import { OptimizedErrorMessage, OptimizedFlexContainer, OptimizedFormRow, OptimizedFormSection, OptimizedInputStyled, OptimizedSectionTitle, OptimizedSelectStyled,  } from '../shared/optimized-styles';
import { UnifiedModal } from '../unified';

// Exemplo de como migrar EmployeeModal para usar componentes unificados
interface OptimizedEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: any) => void;
  employee?: any;
  theme?: any;
}

const OptimizedEmployeeModal: React.FC<OptimizedEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  theme,
}) => {
  const { showAlert } = useAlertManager();
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    pis: '',
    cargo: '',
    salario: '',
    dataAdmissao: '',
    contato: {
      email: '',
      telefone: '',
    },
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      complemento: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<'email' | 'telefone'>(
    'email'
  );
  const [emailValidado, setEmailValidado] = useState(false);
  const [telefoneValidado, setTelefoneValidado] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Formatação específica por campo
    if (field === 'cpf') {
      formattedValue = formatCPF(value);
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

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cpf':
        if (value && !validateCPF(value)) {
          newErrors.cpf = 'CPF inválido';
        } else {
          delete newErrors.cpf;
        }
        break;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          newErrors.email = 'Email inválido';
        } else {
          delete newErrors.email;
        }
        break;
      case 'telefone':
        if (value && value.length < 14) {
          newErrors.telefone = 'Telefone inválido';
        } else {
          delete newErrors.telefone;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação básica
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

    if (!formData.contato.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!emailValidado) {
      newErrors.email = 'Email deve ser validado';
    }

    if (!formData.contato.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!telefoneValidado) {
      newErrors.telefone = 'Telefone deve ser validado';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSave(formData);
    onClose();
  };

  const validarEmail = async (email: string) => {
    // Simulação de validação
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEmailValidado(true);
    setShowValidationModal(false);
    showAlert('Email validado com sucesso!', 'success');
  };

  const validarTelefone = async (telefone: string) => {
    // Simulação de validação
    await new Promise(resolve => setTimeout(resolve, 1000));
    setTelefoneValidado(true);
    setShowValidationModal(false);
    showAlert('Telefone validado com sucesso!', 'success');
  };

  // Funções auxiliares de formatação e validação
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
  };

  const formatPIS = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{5})(\d)/, '$1.$2')
      .replace(/(\d{5})\.(\d{3})(\d)/, '$1.$2-$3');
  };

  const validateCPF = (cpf: string) => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    return remainder === parseInt(cleanCPF.charAt(10));
  };

  return (
    <UnifiedModal
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
        <OptimizedFlexContainer $gap='0.75rem' $justify='flex-end'>
          <ActionButton variant='secondary' theme={theme} onClick={onClose}>
            Cancelar
          </ActionButton>
          <ActionButton variant='primary' theme={theme} onClick={handleSubmit}>
            <AccessibleEmoji emoji='💾' label='Salvar' />{' '}
            {employee ? 'Atualizar' : 'Adicionar'}
          </ActionButton>
        </OptimizedFlexContainer>
      }
    >
      <Form onSubmit={handleSubmit}>
        <OptimizedFormSection $theme={theme}>
          <OptimizedSectionTitle $theme={theme} $size='md'>
            <span role='img' aria-label='pessoa'>
              👤
            </span>{' '}
            Dados Pessoais
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='cpf'>CPF *</label>
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
                $theme={theme}
              />
              {errors['cpf'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['cpf']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor='nome'>Nome Completo *</label>
              <OptimizedInputStyled
                id='nome'
                type='text'
                value={formData.nome}
                onChange={e => handleInputChange('nome', e.target.value)}
                placeholder='Nome completo do funcionário'
                $hasError={!!errors['nome']}
                $theme={theme}
              />
              {errors['nome'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['nome']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='pis'>PIS *</label>
              <OptimizedInputStyled
                id='pis'
                type='text'
                value={formData.pis}
                onChange={e => handleInputChange('pis', e.target.value)}
                placeholder='000.00000.00-0'
                $hasError={!!errors['pis']}
                $theme={theme}
              />
              {errors['pis'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['pis']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor='cargo'>Cargo *</label>
              <OptimizedInputStyled
                id='cargo'
                type='text'
                value={formData.cargo}
                onChange={e => handleInputChange('cargo', e.target.value)}
                placeholder='Cargo do funcionário'
                $hasError={!!errors['cargo']}
                $theme={theme}
              />
              {errors['cargo'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['cargo']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='salario'>Salário *</label>
              <OptimizedInputStyled
                id='salario'
                type='text'
                value={formData.salario}
                onChange={e => handleInputChange('salario', e.target.value)}
                placeholder='R$ 0,00'
                $hasError={!!errors['salario']}
                $theme={theme}
              />
              {errors['salario'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['salario']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor='dataAdmissao'>Data de Admissão *</label>
              <OptimizedInputStyled
                id='dataAdmissao'
                type='date'
                value={formData.dataAdmissao}
                onChange={e =>
                  handleInputChange('dataAdmissao', e.target.value)
                }
                $hasError={!!errors['dataAdmissao']}
                $theme={theme}
              />
              {errors['dataAdmissao'] && (
                <OptimizedErrorMessage $theme={theme}>
                  {errors['dataAdmissao']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        <OptimizedFormSection $theme={theme}>
          <OptimizedSectionTitle $theme={theme} $size='md'>
            <span role='img' aria-label='telefone'>
              📞
            </span>{' '}
            Contato
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='email'>Email *</label>
              <OptimizedFlexContainer $gap='0.5rem' $align='center'>
                <OptimizedInputStyled
                  id='email'
                  type='email'
                  value={formData.contato.email}
                  onChange={e =>
                    handleInputChange('contato.email', e.target.value)
                  }
                  placeholder='email@exemplo.com'
                  $hasError={!!errors['email']}
                  $theme={theme}
                />
                <ActionButton
                  variant='secondary'
                  size='sm'
                  onClick={() => {
                    setValidationType('email');
                    setShowValidationModal(true);
                  }}
                  disabled={!formData.contato.email || emailValidado}
                >
                  {emailValidado ? '✓' : 'Validar'}
                </ActionButton>
              </OptimizedFlexContainer>
              {errors['email'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['email']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <label htmlFor='telefone'>Telefone *</label>
              <OptimizedFlexContainer $gap='0.5rem' $align='center'>
                <OptimizedInputStyled
                  id='telefone'
                  type='tel'
                  value={formData.contato.telefone}
                  onChange={e =>
                    handleInputChange('contato.telefone', e.target.value)
                  }
                  placeholder='(00) 00000-0000'
                  $hasError={!!errors['telefone']}
                  $theme={theme}
                />
                <ActionButton
                  variant='secondary'
                  size='sm'
                  onClick={() => {
                    setValidationType('telefone');
                    setShowValidationModal(true);
                  }}
                  disabled={!formData.contato.telefone || telefoneValidado}
                >
                  {telefoneValidado ? '✓' : 'Validar'}
                </ActionButton>
              </OptimizedFlexContainer>
              {errors['telefone'] && (
                <OptimizedErrorMessage $theme={theme}>{errors['telefone']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        <OptimizedFormSection $theme={theme}>
          <OptimizedSectionTitle $theme={theme} $size='md'>
            <span role='img' aria-label='casa'>
              🏠
            </span>{' '}
            Endereço
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='cep'>CEP</label>
              <OptimizedInputStyled
                id='cep'
                type='text'
                value={formData.endereco.cep}
                onChange={e =>
                  handleInputChange('endereco.cep', e.target.value)
                }
                placeholder='00000-000'
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor='logradouro'>Logradouro</label>
              <OptimizedInputStyled
                id='logradouro'
                type='text'
                value={formData.endereco.logradouro}
                onChange={e =>
                  handleInputChange('endereco.logradouro', e.target.value)
                }
                placeholder='Rua, Avenida, etc.'
                $theme={theme}
              />
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='numero'>Número</label>
              <OptimizedInputStyled
                id='numero'
                type='text'
                value={formData.endereco.numero}
                onChange={e =>
                  handleInputChange('endereco.numero', e.target.value)
                }
                placeholder='123'
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor='bairro'>Bairro</label>
              <OptimizedInputStyled
                id='bairro'
                type='text'
                value={formData.endereco.bairro}
                onChange={e =>
                  handleInputChange('endereco.bairro', e.target.value)
                }
                placeholder='Nome do bairro'
                $theme={theme}
              />
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <label htmlFor='cidade'>Cidade</label>
              <OptimizedInputStyled
                id='cidade'
                type='text'
                value={formData.endereco.cidade}
                onChange={e =>
                  handleInputChange('endereco.cidade', e.target.value)
                }
                placeholder='Nome da cidade'
                $theme={theme}
              />
            </FormGroup>

            <FormGroup>
              <label htmlFor='uf'>UF</label>
              <OptimizedSelectStyled
                id='uf'
                value={formData.endereco.uf}
                onChange={e => handleInputChange('endereco.uf', e.target.value)}
                $theme={theme}
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
            </FormGroup>
          </OptimizedFormRow>

          <FormGroup>
            <label htmlFor='complemento'>Complemento</label>
            <OptimizedInputStyled
              id='complemento'
              type='text'
              value={formData.endereco.complemento}
              onChange={e =>
                handleInputChange('endereco.complemento', e.target.value)
              }
              placeholder='Apartamento, casa, etc.'
              $theme={theme}
            />
          </FormGroup>
        </OptimizedFormSection>
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
    </UnifiedModal>
  );
};

export default OptimizedEmployeeModal;
