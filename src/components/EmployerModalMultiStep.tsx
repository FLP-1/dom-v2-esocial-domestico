import React, { useState } from 'react';
import styled from 'styled-components';
import { createThemedStyles } from '../design-system';
import { useAlertManager } from '../hooks/useAlertManager';
import { documentService } from '../services/DocumentService';
import AccessibleEmoji from './AccessibleEmoji';
import { ActionButton } from './ActionButton';
import { FormGroup, Input, Select } from './FormComponents';
import { LoadingOverlay, LoadingSpinner } from './LoadingStates';
import MultiStepForm from './MultiStepForm';
import SimpleModal from './SimpleModal';

// Interfaces
interface EmployerData {
  id?: string;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
  tipoEmpregador: string;
  senha: string;
  confirmarSenha: string;
  certificadoDigital?: File | null;
  certificadoValidado: boolean;
  emailValidado: boolean;
  telefoneValidado: boolean;
  enviarParaEsocial: boolean;
}

interface EmployerModalMultiStepProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employer: Omit<EmployerData, 'id'>) => void;
  employer?: EmployerData | null;
  theme: any;
}

// Styled Components para os steps
const StepContainer = styled.div`
  padding: 1rem 0;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const SuccessMessage = styled.span`
  color: #27ae60;
  font-weight: bold;
`;

const InfoMessage = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  color: #155724;
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3<{ $theme: any }>`
  ${props => {
    const themedStyles = createThemedStyles(props.$theme);

    return `
      font-family: 'Montserrat', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      color: ${themedStyles.text};
      margin: 0 0 1rem 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid ${themedStyles.primary};
    `;
  }}
`;

// Step 1: Dados Pessoais
const PersonalDataStep: React.FC<{
  formData: any;
  updateFormData: any;
  theme: any;
}> = ({ formData, updateFormData, theme }) => {
  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  return (
    <StepContainer>
      <SectionTitle $theme={theme}>
        <AccessibleEmoji emoji='👤' label='Pessoa' />
        Dados Pessoais
      </SectionTitle>

      <FormRow>
        <FormGroup>
          <label htmlFor='cpf-step1'>CPF *</label>
          <Input
            id='cpf-step1'
            type='text'
            value={formData.cpf || ''}
            onChange={e => handleInputChange('cpf', e.target.value)}
            placeholder='000.000.000-00'
            maxLength={14}
            theme={theme}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor='nome-step1'>Nome Completo *</label>
          <Input
            id='nome-step1'
            type='text'
            value={formData.nome || ''}
            onChange={e => handleInputChange('nome', e.target.value)}
            placeholder='Digite o nome completo'
            theme={theme}
            required
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <label htmlFor='email-step1'>Email *</label>
          <Input
            id='email-step1'
            type='email'
            value={formData.email || ''}
            onChange={e => handleInputChange('email', e.target.value)}
            placeholder='email@exemplo.com'
            theme={theme}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor='telefone-step1'>Telefone *</label>
          <Input
            id='telefone-step1'
            type='tel'
            value={formData.telefone || ''}
            onChange={e => handleInputChange('telefone', e.target.value)}
            placeholder='(11) 99999-9999'
            theme={theme}
            required
          />
        </FormGroup>
      </FormRow>
    </StepContainer>
  );
};

// Step 2: Endereço
const AddressStep: React.FC<{
  formData: any;
  updateFormData: any;
  theme: any;
}> = ({ formData, updateFormData, theme }) => {
  const [isLoadingCep, setIsLoadingCep] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    updateFormData({ [field]: value });
  };

  const consultarCEP = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      setIsLoadingCep(true);
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cep.replace(/\D/g, '')}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          updateFormData({
            endereco: {
              ...formData.endereco,
              logradouro: data.logradouro,
              bairro: data.bairro,
              cidade: data.localidade,
              uf: data.uf,
            },
          });
        }
      } catch (error) {
        console.error('Erro ao consultar CEP:', error);
      } finally {
        setIsLoadingCep(false);
      }
    }
  };

  return (
    <StepContainer>
      <SectionTitle $theme={theme}>
        <AccessibleEmoji emoji='🏠' label='Casa' />
        Endereço
      </SectionTitle>

      <FormRow>
        <FormGroup>
          <label htmlFor='cep-step2'>CEP *</label>
            <FlexContainer>
            <Input
              id='cep-step2'
              type='text'
              value={formData.endereco?.cep || ''}
              onChange={e => {
                handleInputChange('endereco.cep', e.target.value);
                if (e.target.value.replace(/\D/g, '').length === 8) {
                  consultarCEP(e.target.value);
                }
              }}
              placeholder='00000-000'
              maxLength={9}
              theme={theme}
              required
            />
            {isLoadingCep && <LoadingSpinner size='sm' theme={theme} />}
          </div>
        </FormGroup>

        <FormGroup>
          <label htmlFor='uf-step2'>UF *</label>
          <Select
            id='uf-step2'
            value={formData.endereco?.uf || ''}
            onChange={e => handleInputChange('endereco.uf', e.target.value)}
            theme={theme}
            aria-label='Selecionar estado'
            title='Selecionar estado'
            required
          >
            <option value=''>Selecione</option>
            <option value='SP'>SP</option>
            <option value='RJ'>RJ</option>
            <option value='MG'>MG</option>
            {/* Adicionar outros estados conforme necessário */}
          </Select>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <label htmlFor='logradouro-step2'>Logradouro *</label>
          <Input
            id='logradouro-step2'
            type='text'
            value={formData.endereco?.logradouro || ''}
            onChange={e =>
              handleInputChange('endereco.logradouro', e.target.value)
            }
            placeholder='Rua, Avenida, etc.'
            theme={theme}
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor='numero-step2'>Número *</label>
          <Input
            id='numero-step2'
            type='text'
            value={formData.endereco?.numero || ''}
            onChange={e => handleInputChange('endereco.numero', e.target.value)}
            placeholder='123'
            theme={theme}
            required
          />
        </FormGroup>
      </FormRow>
    </StepContainer>
  );
};

// Step 3: Validações
const ValidationStep: React.FC<{
  formData: any;
  updateFormData: any;
  theme: any;
}> = ({ formData, updateFormData, theme }) => {
  const alertManager = useAlertManager();
  const [isValidatingEmail, setIsValidatingEmail] = useState(false);
  const [isValidatingPhone, setIsValidatingPhone] = useState(false);

  const handleEmailValidation = async () => {
    setIsValidatingEmail(true);
    try {
      // Simular envio de código
      await new Promise(resolve => setTimeout(resolve, 1500));
      alertManager.showSuccess('Código enviado para o email!');
      updateFormData({ emailValidado: true });
    } catch (error) {
      alertManager.showError('Erro ao enviar código de email');
    } finally {
      setIsValidatingEmail(false);
    }
  };

  const handlePhoneValidation = async () => {
    setIsValidatingPhone(true);
    try {
      // Simular envio de SMS
      await new Promise(resolve => setTimeout(resolve, 1500));
      alertManager.showSuccess('Código enviado por SMS!');
      updateFormData({ telefoneValidado: true });
    } catch (error) {
      alertManager.showError('Erro ao enviar SMS');
    } finally {
      setIsValidatingPhone(false);
    }
  };

  return (
    <StepContainer>
      <SectionTitle $theme={theme}>
        <AccessibleEmoji emoji='✅' label='Verificação' />
        Validações
      </SectionTitle>

      <FormSection>
        <h4>Validação de Email</h4>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ActionButton
            variant='primary'
            theme={theme}
            onClick={handleEmailValidation}
            disabled={isValidatingEmail || formData.emailValidado}
            loading={isValidatingEmail}
          >
            {isValidatingEmail ? 'Enviando...' : 'Validar Email'}
          </ActionButton>

          {formData.emailValidado && (
            <SuccessMessage>
              <AccessibleEmoji emoji='✅' label='Validado' /> Email Validado
            </SuccessMessage>
          )}
        </div>
      </FormSection>

      <FormSection>
        <h4>Validação de Telefone</h4>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ActionButton
            variant='primary'
            theme={theme}
            onClick={handlePhoneValidation}
            disabled={isValidatingPhone || formData.telefoneValidado}
            loading={isValidatingPhone}
          >
            {isValidatingPhone ? 'Enviando...' : 'Validar Telefone'}
          </ActionButton>

          {formData.telefoneValidado && (
            <SuccessMessage>
              <AccessibleEmoji emoji='✅' label='Validado' /> Telefone Validado
            </SuccessMessage>
          )}
        </div>
      </FormSection>
    </StepContainer>
  );
};

// Step 4: Certificado (Opcional)
const CertificateStep: React.FC<{
  formData: any;
  updateFormData: any;
  theme: any;
}> = ({ formData, updateFormData, theme }) => {
  const alertManager = useAlertManager();
  const [isUploading, setIsUploading] = useState(false);

  const handleCertificateUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const uploadResult = await documentService.upload({
        file,
        category: 'certificado_digital',
        userId: 'temp-user-' + Date.now(),
        metadata: {
          name: 'Certificado Digital A1',
          description: 'Certificado Digital para assinatura eSocial',
          cpf: formData.cpf,
          permissions: 'private',
          tags: ['certificado', 'digital', 'esocial'],
        },
      });

      if (uploadResult.success) {
        updateFormData({
          certificadoDigital: file,
          certificadoValidado: true,
        });
        alertManager.showSuccess('Certificado validado com sucesso!');
      } else {
        throw new Error(uploadResult.message);
      }
    } catch (error) {
      alertManager.showError(
        `Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
      event.target.value = '';
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <StepContainer>
      <SectionTitle $theme={theme}>
        <AccessibleEmoji emoji='🔐' label='Certificado' />
        Certificado Digital (Opcional)
      </SectionTitle>

      <FormSection>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          O certificado digital é opcional, mas necessário para assinatura
          eletrônica no eSocial.
        </p>

        <LoadingOverlay
          isLoading={isUploading}
          message='Validando certificado...'
          theme={theme}
        >
          <FormGroup>
            <label htmlFor='certificado-step4'>
              Selecionar Certificado (.pfx ou .p12)
            </label>
            <Input
              id='certificado-step4'
              type='file'
              accept='.pfx,.p12'
              onChange={handleCertificateUpload}
              disabled={isUploading}
              theme={theme}
              aria-label='Selecionar certificado digital'
            />
          </FormGroup>
        </LoadingOverlay>

        {formData.certificadoValidado && (
           <InfoMessage>
            <AccessibleEmoji emoji='✅' label='Sucesso' />
            <strong> Certificado validado com sucesso!</strong>
            <br />
            Seu certificado está pronto para uso no eSocial.
          </InfoMessage>
        )}

        <FormGroup style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              id='enviarParaEsocial-step4'
              type='checkbox'
              checked={formData.enviarParaEsocial || false}
              onChange={e =>
                updateFormData({ enviarParaEsocial: e.target.checked })
              }
              aria-label='Enviar dados para eSocial automaticamente'
            />
            <label htmlFor='enviarParaEsocial-step4'>
              Enviar dados para eSocial automaticamente após cadastro
            </label>
          </div>
        </FormGroup>
      </FormSection>
    </StepContainer>
  );
};

const EmployerModalMultiStep: React.FC<EmployerModalMultiStepProps> = ({
  isOpen,
  onClose,
  onSave,
  employer,
  theme,
}) => {
  const alertManager = useAlertManager();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Definir etapas do formulário
  const steps = [
    {
      id: 'personal',
      title: 'Dados Pessoais',
      description: 'Informações básicas do empregador',
      component: <PersonalDataStep />,
      isValid: true, // Validação pode ser implementada
    },
    {
      id: 'address',
      title: 'Endereço',
      description: 'Dados de localização',
      component: <AddressStep />,
      isValid: true,
    },
    {
      id: 'validation',
      title: 'Validações',
      description: 'Validar email e telefone',
      component: <ValidationStep />,
      isValid: true,
    },
    {
      id: 'certificate',
      title: 'Certificado',
      description: 'Upload do certificado digital (opcional)',
      component: <CertificateStep />,
      isValid: true,
      isOptional: true,
    },
  ];

  const handleComplete = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      onSave(data);
      alertManager.showSuccess('Empregador cadastrado com sucesso!');
      onClose();
    } catch (error) {
      alertManager.showError('Erro ao cadastrar empregador');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <AccessibleEmoji emoji='👔' label='Empregador' />
          {employer ? 'Editar Empregador' : 'Cadastrar Empregador'}
        </>
      }
      maxWidth='800px'
      height='600px'
      theme={theme}
    >
      <LoadingOverlay
        isLoading={isSubmitting}
        message='Salvando dados do empregador...'
        theme={theme}
      >
        <MultiStepForm
          steps={steps}
          onComplete={handleComplete}
          onCancel={onClose}
          theme={theme}
          showStepNumbers={true}
          allowSkipSteps={false}
        />
      </LoadingOverlay>
    </SimpleModal>
  );
};

export default EmployerModalMultiStep;
