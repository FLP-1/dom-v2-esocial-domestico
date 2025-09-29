import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import AccessibleEmoji from './AccessibleEmoji';
// ActionButton substituído por UnifiedButton
import { Form, FormGroup, Input } from './FormComponents';
import { UnifiedModal, UnifiedButton } from './unified';
import ValidationModal from './ValidationModal';
import {
  OptimizedFormRow,
  OptimizedFormSection,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedSuccessMessage,
  OptimizedValidationContainer
} from './shared/optimized-styles';

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.25rem;
    margin-bottom: 1.25rem;
  }

  @media (min-width: 768px) and (max-width: 992px) {
    gap: 1.25rem;
  }

  @media (min-width: 992px) {
    gap: 1.5rem;
  }
`;

// Importar styled-components compartilhados
import { OptimizedErrorMessage, OptimizedFlexContainer, OptimizedHelpText, OptimizedInputStyled, OptimizedSelectStyled, OptimizedFormSection, OptimizedSectionTitle } from './shared/optimized-styles';

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

// FormSection já importado de shared/styles

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ValidationContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const SuccessMessage = styled.span`
  color: #27ae60;
  font-weight: bold;
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
  }
`;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: any) => void;
  employee?: any;
  theme: any;
}

interface EmployeeFormData {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  salario: string;
  dataAdmissao: string;
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

interface ValidationState {
  email: {
    isValid: boolean;
    isVerified: boolean;
    isVerifying: boolean;
  };
  telefone: {
    isValid: boolean;
    isVerified: boolean;
    isVerifying: boolean;
  };
}

const EmployeeModalMigrated: React.FC<EmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  theme,
}) => {
  const { showAlert } = useAlertManager();
  const [formData, setFormData] = useState<EmployeeFormData>({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    salario: '',
    dataAdmissao: '',
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

  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, isVerified: false, isVerifying: false },
    telefone: { isValid: false, isVerified: false, isVerifying: false },
  });

  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<'email' | 'telefone'>('email');
  const [validationValue, setValidationValue] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Carregar dados do funcionário se estiver editando
  useEffect(() => {
    if (employee && isOpen) {
      setFormData({
        nome: employee.nome || '',
        cpf: employee.cpf || '',
        email: employee.email || '',
        telefone: employee.telefone || '',
        cargo: employee.cargo || '',
        salario: employee.salario || '',
        dataAdmissao: employee.dataAdmissao || '',
        endereco: {
          logradouro: employee.endereco?.logradouro || '',
          numero: employee.endereco?.numero || '',
          complemento: employee.endereco?.complemento || '',
          bairro: employee.endereco?.bairro || '',
          cidade: employee.endereco?.cidade || '',
          uf: employee.endereco?.uf || '',
          cep: employee.endereco?.cep || '',
        },
        contato: {
          telefone: employee.contato?.telefone || '',
          email: employee.contato?.email || '',
        },
      });
    }
  }, [employee, isOpen]);

  // Validar CPF
  const validateCPF = (cpf: string): boolean => {
    const cleanCPF = cpf.replace(/\D/g, '');
    if (cleanCPF.length !== 11) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Algoritmo de validação do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = 11 - (sum % 11);
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  // Validar email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar telefone
  const validateTelefone = (telefone: string): boolean => {
    const cleanTelefone = telefone.replace(/\D/g, '');
    return cleanTelefone.length >= 10 && cleanTelefone.length <= 11;
  };

  // Formatar CPF
  const formatCPF = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  // Formatar telefone
  const formatTelefone = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 10) {
      return cleanValue.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  // Formatar CEP
  const formatCEP = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  const handleInputChange = (field: string, value: string) => {
    let formattedValue = value;

    // Aplicar formatação baseada no campo
    switch (field) {
      case 'cpf':
        formattedValue = formatCPF(value);
        break;
      case 'telefone':
      case 'contato.telefone':
        formattedValue = formatTelefone(value);
        break;
      case 'endereco.cep':
        formattedValue = formatCEP(value);
        break;
    }

    setFormData(prev => {
      const newData = { ...prev };
      
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        newData[parent as keyof EmployeeFormData] = {
          ...(newData[parent as keyof EmployeeFormData] as any),
          [child]: formattedValue,
        };
      } else {
        (newData as any)[field] = formattedValue;
      }
      
      return newData;
    });

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleValidation = async (type: 'email' | 'telefone') => {
    const value = type === 'email' ? formData.email : formData.telefone;
    
    if (!value.trim()) {
      showAlert('error', `Por favor, preencha o ${type === 'email' ? 'email' : 'telefone'} primeiro.`);
      return;
    }

    setValidationType(type);
    setValidationValue(value);
    setShowValidationModal(true);
  };

  const handleValidationSuccess = (data: any) => {
    setValidation(prev => ({
      ...prev,
      [validationType]: {
        ...prev[validationType],
        isVerified: true,
        isValid: true,
      },
    }));
    
    showAlert('success', `${validationType === 'email' ? 'Email' : 'Telefone'} validado com sucesso!`);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validar campos obrigatórios
    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validateTelefone(formData.telefone)) {
      newErrors.telefone = 'Telefone inválido';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (!formData.salario.trim()) {
      newErrors.salario = 'Salário é obrigatório';
    }

    if (!formData.dataAdmissao.trim()) {
      newErrors.dataAdmissao = 'Data de admissão é obrigatória';
    }

    // Validar endereço
    if (!formData.endereco.logradouro.trim()) {
      newErrors['endereco.logradouro'] = 'Logradouro é obrigatório';
    }

    if (!formData.endereco.numero.trim()) {
      newErrors['endereco.numero'] = 'Número é obrigatório';
    }

    if (!formData.endereco.bairro.trim()) {
      newErrors['endereco.bairro'] = 'Bairro é obrigatório';
    }

    if (!formData.endereco.cidade.trim()) {
      newErrors['endereco.cidade'] = 'Cidade é obrigatória';
    }

    if (!formData.endereco.uf.trim()) {
      newErrors['endereco.uf'] = 'UF é obrigatória';
    }

    if (!formData.endereco.cep.trim()) {
      newErrors['endereco.cep'] = 'CEP é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      showAlert('error', 'Por favor, corrija os erros no formulário.');
      return;
    }

    // Verificar se email e telefone foram validados
    if (!validation.email.isVerified) {
      showAlert('warning', 'Por favor, valide o email antes de salvar.');
      return;
    }

    if (!validation.telefone.isVerified) {
      showAlert('warning', 'Por favor, valide o telefone antes de salvar.');
      return;
    }

    onSave(formData);
    onClose();
    showAlert('success', 'Funcionário salvo com sucesso!');
  };

  const handleClose = () => {
    setFormData({
      nome: '',
      cpf: '',
      email: '',
      telefone: '',
      cargo: '',
      salario: '',
      dataAdmissao: '',
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
    setErrors({});
    setValidation({
      email: { isValid: false, isVerified: false, isVerifying: false },
      telefone: { isValid: false, isVerified: false, isVerifying: false },
    });
    onClose();
  };

  return (
    <>
      <UnifiedModal
        isOpen={isOpen}
        onClose={handleClose}
        title={
          <TitleContainer>
            <AccessibleEmoji emoji="👤" label="Pessoa" />
            {employee ? 'Editar Funcionário' : 'Novo Funcionário'}
          </TitleContainer>
        }
        variant="default"
        maxWidth="800px"
        theme={theme}
      >
        <Form>
          <OptimizedFormSection>
            <OptimizedSectionTitle $theme={theme} $size="md">
              <AccessibleEmoji emoji="📋" label="Checklist" /> Informações Pessoais
            </OptimizedSectionTitle>
            
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="nome">Nome Completo *</OptimizedLabel>
                <OptimizedInputStyled
                  id="nome"
                  type="text"
                  value={formData.nome}
                  onChange={(e) => handleInputChange('nome', e.target.value)}
                  $hasError={!!errors.nome}
                  placeholder="Digite o nome completo"
                />
                {errors.nome && <OptimizedErrorMessage>{errors.nome}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="cpf">CPF *</OptimizedLabel>
                <OptimizedInputStyled
                  id="cpf"
                  type="text"
                  value={formData.cpf}
                  onChange={(e) => handleInputChange('cpf', e.target.value)}
                  $hasError={!!errors.cpf}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors.cpf && <OptimizedErrorMessage>{errors.cpf}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="email">Email *</OptimizedLabel>
                <OptimizedValidationContainer>
                  <OptimizedInputStyled
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    $hasError={!!errors.email}
                    placeholder="email@exemplo.com"
                    style={{ flex: 1 }}
                  />
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleValidation('email')}
                    disabled={!formData.email.trim() || validation.email.isVerified}
                  >
                    {validation.email.isVerified ? (
                      <AccessibleEmoji emoji="✅" label="Verificado" />
                    ) : (
                      <AccessibleEmoji emoji="🔍" label="Verificar" />
                    )}
                  </UnifiedButton>
                </OptimizedValidationContainer>
                {validation.email.isVerified && (
                  <OptimizedSuccessMessage>
                    <AccessibleEmoji emoji="✅" label="Verificado" /> Email verificado
                  </OptimizedSuccessMessage>
                )}
                {errors.email && <OptimizedErrorMessage>{errors.email}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="telefone">Telefone *</OptimizedLabel>
                <OptimizedValidationContainer>
                  <OptimizedInputStyled
                    id="telefone"
                    type="text"
                    value={formData.telefone}
                    onChange={(e) => handleInputChange('telefone', e.target.value)}
                    $hasError={!!errors.telefone}
                    placeholder="(00) 00000-0000"
                    style={{ flex: 1 }}
                  />
                  <UnifiedButton
                    variant="secondary"
                    size="sm"
                    onClick={() => handleValidation('telefone')}
                    disabled={!formData.telefone.trim() || validation.telefone.isVerified}
                  >
                    {validation.telefone.isVerified ? (
                      <AccessibleEmoji emoji="✅" label="Verificado" />
                    ) : (
                      <AccessibleEmoji emoji="🔍" label="Verificar" />
                    )}
                  </UnifiedButton>
                </OptimizedValidationContainer>
                {validation.telefone.isVerified && (
                  <OptimizedSuccessMessage>
                    <AccessibleEmoji emoji="✅" label="Verificado" /> Telefone verificado
                  </OptimizedSuccessMessage>
                )}
                {errors.telefone && <OptimizedErrorMessage>{errors.telefone}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>
          </OptimizedFormSection>

          <OptimizedFormSection>
            <OptimizedSectionTitle $theme={theme} $size="md">
              <AccessibleEmoji emoji="💼" label="Trabalho" /> Informações Profissionais
            </OptimizedSectionTitle>
            
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="cargo">Cargo *</OptimizedLabel>
                <OptimizedInputStyled
                  id="cargo"
                  type="text"
                  value={formData.cargo}
                  onChange={(e) => handleInputChange('cargo', e.target.value)}
                  $hasError={!!errors.cargo}
                  placeholder="Digite o cargo"
                />
                {errors.cargo && <OptimizedErrorMessage>{errors.cargo}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="salario">Salário *</OptimizedLabel>
                <OptimizedInputStyled
                  id="salario"
                  type="text"
                  value={formData.salario}
                  onChange={(e) => handleInputChange('salario', e.target.value)}
                  $hasError={!!errors.salario}
                  placeholder="R$ 0,00"
                />
                {errors.salario && <OptimizedErrorMessage>{errors.salario}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="dataAdmissao">Data de Admissão *</OptimizedLabel>
                <OptimizedInputStyled
                  id="dataAdmissao"
                  type="date"
                  value={formData.dataAdmissao}
                  onChange={(e) => handleInputChange('dataAdmissao', e.target.value)}
                  $hasError={!!errors.dataAdmissao}
                />
                {errors.dataAdmissao && <OptimizedErrorMessage>{errors.dataAdmissao}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>
          </OptimizedFormSection>

          <OptimizedFormSection>
            <OptimizedSectionTitle $theme={theme} $size="md">
              <AccessibleEmoji emoji="🏠" label="Casa" /> Endereço
            </OptimizedSectionTitle>
            
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="logradouro">Logradouro *</OptimizedLabel>
                <OptimizedInputStyled
                  id="logradouro"
                  type="text"
                  value={formData.endereco.logradouro}
                  onChange={(e) => handleInputChange('endereco.logradouro', e.target.value)}
                  $hasError={!!errors['endereco.logradouro']}
                  placeholder="Rua, Avenida, etc."
                />
                {errors['endereco.logradouro'] && <OptimizedErrorMessage>{errors['endereco.logradouro']}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="numero">Número *</OptimizedLabel>
                <OptimizedInputStyled
                  id="numero"
                  type="text"
                  value={formData.endereco.numero}
                  onChange={(e) => handleInputChange('endereco.numero', e.target.value)}
                  $hasError={!!errors['endereco.numero']}
                  placeholder="123"
                />
                {errors['endereco.numero'] && <OptimizedErrorMessage>{errors['endereco.numero']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="complemento">Complemento</OptimizedLabel>
                <OptimizedInputStyled
                  id="complemento"
                  type="text"
                  value={formData.endereco.complemento}
                  onChange={(e) => handleInputChange('endereco.complemento', e.target.value)}
                  placeholder="Apartamento, bloco, etc."
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="bairro">Bairro *</OptimizedLabel>
                <OptimizedInputStyled
                  id="bairro"
                  type="text"
                  value={formData.endereco.bairro}
                  onChange={(e) => handleInputChange('endereco.bairro', e.target.value)}
                  $hasError={!!errors['endereco.bairro']}
                  placeholder="Digite o bairro"
                />
                {errors['endereco.bairro'] && <OptimizedErrorMessage>{errors['endereco.bairro']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="cidade">Cidade *</OptimizedLabel>
                <OptimizedInputStyled
                  id="cidade"
                  type="text"
                  value={formData.endereco.cidade}
                  onChange={(e) => handleInputChange('endereco.cidade', e.target.value)}
                  $hasError={!!errors['endereco.cidade']}
                  placeholder="Digite a cidade"
                />
                {errors['endereco.cidade'] && <OptimizedErrorMessage>{errors['endereco.cidade']}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="uf">UF *</OptimizedLabel>
                <OptimizedSelectStyled
                  id="uf"
                  value={formData.endereco.uf}
                  onChange={(e) => handleInputChange('endereco.uf', e.target.value)}
                  $hasError={!!errors['endereco.uf']}
                  $theme={theme}
                  title="Selecione o estado"
                  aria-label="Selecionar estado"
                >
                  <option value="">Selecione</option>
                  <option value="AC">AC</option>
                  <option value="AL">AL</option>
                  <option value="AP">AP</option>
                  <option value="AM">AM</option>
                  <option value="BA">BA</option>
                  <option value="CE">CE</option>
                  <option value="DF">DF</option>
                  <option value="ES">ES</option>
                  <option value="GO">GO</option>
                  <option value="MA">MA</option>
                  <option value="MT">MT</option>
                  <option value="MS">MS</option>
                  <option value="MG">MG</option>
                  <option value="PA">PA</option>
                  <option value="PB">PB</option>
                  <option value="PR">PR</option>
                  <option value="PE">PE</option>
                  <option value="PI">PI</option>
                  <option value="RJ">RJ</option>
                  <option value="RN">RN</option>
                  <option value="RS">RS</option>
                  <option value="RO">RO</option>
                  <option value="RR">RR</option>
                  <option value="SC">SC</option>
                  <option value="SP">SP</option>
                  <option value="SE">SE</option>
                  <option value="TO">TO</option>
                </OptimizedSelectStyled>
                {errors['endereco.uf'] && <OptimizedErrorMessage>{errors['endereco.uf']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="cep">CEP *</OptimizedLabel>
                <OptimizedInputStyled
                  id="cep"
                  type="text"
                  value={formData.endereco.cep}
                  onChange={(e) => handleInputChange('endereco.cep', e.target.value)}
                  $hasError={!!errors['endereco.cep']}
                  placeholder="00000-000"
                  maxLength={9}
                />
                {errors['endereco.cep'] && <OptimizedErrorMessage>{errors['endereco.cep']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>
          </OptimizedFormSection>
        </Form>

        <ButtonContainer>
          <UnifiedButton
            variant="secondary"
            onClick={handleClose}
            theme={theme}
          >
            Cancelar
          </UnifiedButton>
          <UnifiedButton
            variant="primary"
            onClick={handleSave}
            theme={theme}
          >
            <AccessibleEmoji emoji="💾" label="Salvar" /> Salvar Funcionário
          </UnifiedButton>
        </ButtonContainer>
      </UnifiedModal>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onSuccess={handleValidationSuccess}
        tipo={validationType}
        valor={validationValue}
        titulo={`Validar ${validationType === 'email' ? 'Email' : 'Telefone'}`}
      />
    </>
  );
};

export default EmployeeModalMigrated;
