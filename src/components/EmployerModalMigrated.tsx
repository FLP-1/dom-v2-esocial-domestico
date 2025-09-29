import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import { documentService } from '../services/DocumentService';
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

// Importar styled-components compartilhados
import { OptimizedErrorMessage, OptimizedFlexContainer, OptimizedHelpText, OptimizedInputStyled, OptimizedSelectStyled, OptimizedFormSection, OptimizedSectionTitle } from './shared/optimized-styles';

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  display: block;
`;

interface EmployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employer: any) => void;
  employer?: any;
  theme: any;
}

interface EmployerFormData {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual: string;
  inscricaoMunicipal: string;
  email: string;
  telefone: string;
  site: string;
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
  representante: {
    nome: string;
    cpf: string;
    cargo: string;
    email: string;
    telefone: string;
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

const EmployerModalMigrated: React.FC<EmployerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employer,
  theme,
}) => {
  const { showAlert } = useAlertManager();
  const [formData, setFormData] = useState<EmployerFormData>({
    razaoSocial: '',
    nomeFantasia: '',
    cnpj: '',
    inscricaoEstadual: '',
    inscricaoMunicipal: '',
    email: '',
    telefone: '',
    site: '',
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
    representante: {
      nome: '',
      cpf: '',
      cargo: '',
      email: '',
      telefone: '',
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

  // Carregar dados do empregador se estiver editando
  useEffect(() => {
    if (employer && isOpen) {
      setFormData({
        razaoSocial: employer.razaoSocial || '',
        nomeFantasia: employer.nomeFantasia || '',
        cnpj: employer.cnpj || '',
        inscricaoEstadual: employer.inscricaoEstadual || '',
        inscricaoMunicipal: employer.inscricaoMunicipal || '',
        email: employer.email || '',
        telefone: employer.telefone || '',
        site: employer.site || '',
        endereco: {
          logradouro: employer.endereco?.logradouro || '',
          numero: employer.endereco?.numero || '',
          complemento: employer.endereco?.complemento || '',
          bairro: employer.endereco?.bairro || '',
          cidade: employer.endereco?.cidade || '',
          uf: employer.endereco?.uf || '',
          cep: employer.endereco?.cep || '',
        },
        contato: {
          telefone: employer.contato?.telefone || '',
          email: employer.contato?.email || '',
        },
        representante: {
          nome: employer.representante?.nome || '',
          cpf: employer.representante?.cpf || '',
          cargo: employer.representante?.cargo || '',
          email: employer.representante?.email || '',
          telefone: employer.representante?.telefone || '',
        },
      });
    }
  }, [employer, isOpen]);

  // Validar CNPJ
  const validateCNPJ = (cnpj: string): boolean => {
    const cleanCNPJ = cnpj.replace(/\D/g, '');
    if (cleanCNPJ.length !== 14) return false;
    
    // Verificar se todos os dígitos são iguais
    if (/^(\d)\1{13}$/.test(cleanCNPJ)) return false;
    
    // Algoritmo de validação do CNPJ
    let sum = 0;
    let weight = 2;
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    let remainder = sum % 11;
    const firstDigit = remainder < 2 ? 0 : 11 - remainder;
    if (firstDigit !== parseInt(cleanCNPJ.charAt(12))) return false;
    
    sum = 0;
    weight = 2;
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(cleanCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    remainder = sum % 11;
    const secondDigit = remainder < 2 ? 0 : 11 - remainder;
    if (secondDigit !== parseInt(cleanCNPJ.charAt(13))) return false;
    
    return true;
  };

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

  // Formatar CNPJ
  const formatCNPJ = (value: string): string => {
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
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
      case 'cnpj':
        formattedValue = formatCNPJ(value);
        break;
      case 'representante.cpf':
        formattedValue = formatCPF(value);
        break;
      case 'telefone':
      case 'contato.telefone':
      case 'representante.telefone':
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
        if (parent === 'representante') {
          newData.representante = {
            ...newData.representante,
            [child]: formattedValue,
          };
        } else {
          newData[parent as keyof EmployerFormData] = {
            ...(newData[parent as keyof EmployerFormData] as any),
            [child]: formattedValue,
          };
        }
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
    if (!formData.razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão Social é obrigatória';
    }

    if (!formData.nomeFantasia.trim()) {
      newErrors.nomeFantasia = 'Nome Fantasia é obrigatório';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!validateCNPJ(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ inválido';
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

    // Validar representante
    if (!formData.representante.nome.trim()) {
      newErrors['representante.nome'] = 'Nome do representante é obrigatório';
    }

    if (!formData.representante.cpf.trim()) {
      newErrors['representante.cpf'] = 'CPF do representante é obrigatório';
    } else if (!validateCPF(formData.representante.cpf)) {
      newErrors['representante.cpf'] = 'CPF do representante inválido';
    }

    if (!formData.representante.cargo.trim()) {
      newErrors['representante.cargo'] = 'Cargo do representante é obrigatório';
    }

    if (!formData.representante.email.trim()) {
      newErrors['representante.email'] = 'Email do representante é obrigatório';
    } else if (!validateEmail(formData.representante.email)) {
      newErrors['representante.email'] = 'Email do representante inválido';
    }

    if (!formData.representante.telefone.trim()) {
      newErrors['representante.telefone'] = 'Telefone do representante é obrigatório';
    } else if (!validateTelefone(formData.representante.telefone)) {
      newErrors['representante.telefone'] = 'Telefone do representante inválido';
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
    showAlert('success', 'Empregador salvo com sucesso!');
  };

  const handleClose = () => {
    setFormData({
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
      inscricaoMunicipal: '',
      email: '',
      telefone: '',
      site: '',
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
      representante: {
        nome: '',
        cpf: '',
        cargo: '',
        email: '',
        telefone: '',
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
            <AccessibleEmoji emoji="🏢" label="Empresa" />
            {employer ? 'Editar Empregador' : 'Novo Empregador'}
          </TitleContainer>
        }
        variant="default"
        maxWidth="900px"
        theme={theme}
      >
        <Form>
          <OptimizedFormSection>
            <OptimizedSectionTitle $theme={theme} $size="md">
              <AccessibleEmoji emoji="🏢" label="Empresa" /> Informações da Empresa
            </OptimizedSectionTitle>
            
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="razaoSocial">Razão Social *</OptimizedLabel>
                <OptimizedInputStyled
                  id="razaoSocial"
                  type="text"
                  value={formData.razaoSocial}
                  onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                  $hasError={!!errors.razaoSocial}
                  placeholder="Digite a razão social"
                />
                {errors.razaoSocial && <OptimizedErrorMessage>{errors.razaoSocial}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="nomeFantasia">Nome Fantasia *</OptimizedLabel>
                <OptimizedInputStyled
                  id="nomeFantasia"
                  type="text"
                  value={formData.nomeFantasia}
                  onChange={(e) => handleInputChange('nomeFantasia', e.target.value)}
                  $hasError={!!errors.nomeFantasia}
                  placeholder="Digite o nome fantasia"
                />
                {errors.nomeFantasia && <OptimizedErrorMessage>{errors.nomeFantasia}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="cnpj">CNPJ *</OptimizedLabel>
                <OptimizedInputStyled
                  id="cnpj"
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => handleInputChange('cnpj', e.target.value)}
                  $hasError={!!errors.cnpj}
                  placeholder="00.000.000/0000-00"
                  maxLength={18}
                />
                {errors.cnpj && <OptimizedErrorMessage>{errors.cnpj}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="inscricaoEstadual">Inscrição Estadual</OptimizedLabel>
                <OptimizedInputStyled
                  id="inscricaoEstadual"
                  type="text"
                  value={formData.inscricaoEstadual}
                  onChange={(e) => handleInputChange('inscricaoEstadual', e.target.value)}
                  placeholder="Digite a inscrição estadual"
                />
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="inscricaoMunicipal">Inscrição Municipal</OptimizedLabel>
                <OptimizedInputStyled
                  id="inscricaoMunicipal"
                  type="text"
                  value={formData.inscricaoMunicipal}
                  onChange={(e) => handleInputChange('inscricaoMunicipal', e.target.value)}
                  placeholder="Digite a inscrição municipal"
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="site">Site</OptimizedLabel>
                <OptimizedInputStyled
                  id="site"
                  type="url"
                  value={formData.site}
                  onChange={(e) => handleInputChange('site', e.target.value)}
                  placeholder="https://www.exemplo.com"
                />
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

          <OptimizedFormSection>
            <OptimizedSectionTitle $theme={theme} $size="md">
              <AccessibleEmoji emoji="👤" label="Pessoa" /> Representante Legal
            </OptimizedSectionTitle>
            
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="representanteNome">Nome do Representante *</OptimizedLabel>
                <OptimizedInputStyled
                  id="representanteNome"
                  type="text"
                  value={formData.representante.nome}
                  onChange={(e) => handleInputChange('representante.nome', e.target.value)}
                  $hasError={!!errors['representante.nome']}
                  placeholder="Digite o nome do representante"
                />
                {errors['representante.nome'] && <OptimizedErrorMessage>{errors['representante.nome']}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="representanteCpf">CPF do Representante *</OptimizedLabel>
                <OptimizedInputStyled
                  id="representanteCpf"
                  type="text"
                  value={formData.representante.cpf}
                  onChange={(e) => handleInputChange('representante.cpf', e.target.value)}
                  $hasError={!!errors['representante.cpf']}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                {errors['representante.cpf'] && <OptimizedErrorMessage>{errors['representante.cpf']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="representanteCargo">Cargo *</OptimizedLabel>
                <OptimizedInputStyled
                  id="representanteCargo"
                  type="text"
                  value={formData.representante.cargo}
                  onChange={(e) => handleInputChange('representante.cargo', e.target.value)}
                  $hasError={!!errors['representante.cargo']}
                  placeholder="Digite o cargo"
                />
                {errors['representante.cargo'] && <OptimizedErrorMessage>{errors['representante.cargo']}</OptimizedErrorMessage>}
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor="representanteEmail">Email do Representante *</OptimizedLabel>
                <OptimizedInputStyled
                  id="representanteEmail"
                  type="email"
                  value={formData.representante.email}
                  onChange={(e) => handleInputChange('representante.email', e.target.value)}
                  $hasError={!!errors['representante.email']}
                  placeholder="email@exemplo.com"
                />
                {errors['representante.email'] && <OptimizedErrorMessage>{errors['representante.email']}</OptimizedErrorMessage>}
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel htmlFor="representanteTelefone">Telefone do Representante *</OptimizedLabel>
                <OptimizedInputStyled
                  id="representanteTelefone"
                  type="text"
                  value={formData.representante.telefone}
                  onChange={(e) => handleInputChange('representante.telefone', e.target.value)}
                  $hasError={!!errors['representante.telefone']}
                  placeholder="(00) 00000-0000"
                />
                {errors['representante.telefone'] && <OptimizedErrorMessage>{errors['representante.telefone']}</OptimizedErrorMessage>}
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
            <AccessibleEmoji emoji="💾" label="Salvar" /> Salvar Empregador
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

export default EmployerModalMigrated;
