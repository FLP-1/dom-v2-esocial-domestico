import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import { documentService } from '../services/DocumentService';
import AccessibleEmoji from './AccessibleEmoji';
import { UnifiedButton } from './UnifiedButton';
import { UnifiedModal } from './UnifiedModal';
import { Form, FormGroup, Input, Select } from './FormComponents';
// SimpleModal removido - usando UnifiedModal
import { ValidationModal } from './ValidationModal';
import {
  OptimizedFormRow,
  OptimizedFormSection,
  OptimizedSectionTitle,
  OptimizedLabel,
  OptimizedInputStyled,
  OptimizedSelectStyled,
  OptimizedErrorMessage,
  OptimizedHelpText,
  OptimizedValidationContainer,
} from '../components/shared/optimized-styles';

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

const FormSection = styled.div`
  margin-bottom: 1.5rem;
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
  gap: 0.5rem;
  align-items: center;
`;

const CepContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatusIndicator = styled.div<{ $success?: boolean }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => (props.$success ? '#d4edda' : '#f8d7da')};
  border: 1px solid ${props => (props.$success ? '#c3e6cb' : '#f5c6cb')};
  border-radius: 8px;
  color: ${props => (props.$success ? '#155724' : '#721c24')};
`;

const ValidationLabel = styled.label<{ $isValid?: boolean }>`
  display: block;
  font-size: 0.9rem;
  color: ${props => (props.$isValid ? '#27ae60' : '#e74c3c')};
  cursor: pointer;
  margin-bottom: 0.5rem;
`;

const ValidationButton = styled.button`
  padding: 0.5rem;
  background: #29abe2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: background 0.3s ease;

  &:hover {
    background: #1e8bc3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const CepButton = styled.button<{ $disabled?: boolean }>`
  padding: 0.5rem 1rem;
  background: ${props => (props.$disabled ? '#ccc' : '#29abe2')};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: ${props => (props.$disabled ? 'not-allowed' : 'pointer')};
  font-size: 0.8rem;
  white-space: nowrap;
  transition: background 0.3s ease;

  &:hover {
    background: ${props => (props.$disabled ? '#ccc' : '#1e8bc3')};
  }
`;

const CertificateStatus = styled.span<{ $isValid?: boolean }>`
  color: ${props => (props.$isValid ? '#27ae60' : '#e74c3c')};
  font-size: 1.2rem;
`;

const SectionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #29abe2;
`;

const Label = styled.label`
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  display: block;
`;

const InputStyled = styled(Input)<{ $hasError?: boolean }>`
  width: 100%;
  padding: 0.6rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 0.9rem;
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
  padding: 0.6rem;
  border: 2px solid ${props => (props.$hasError ? '#e74c3c' : '#e9ecef')};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #29abe2;
    box-shadow: 0 0 0 3px rgba(41, 171, 226, 0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.2rem;
  font-weight: 500;
`;

const HelpText = styled.div`
  color: #7f8c8d;
  font-size: 0.7rem;
  margin-top: 0.2rem;
  font-style: italic;
`;

const InfoCard = styled.div`
  background: linear-gradient(135deg, #29abe2, #1e8bc3);
  color: white;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  text-align: center;
`;

const InfoTitle = styled.div`
  font-weight: bold;
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
`;

const InfoText = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

interface EmployerData {
  id: string;
  cpf: string;
  nome: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  tipoEmpregador: 'DOMESTICO' | 'RURAL' | 'OUTROS';
  status: 'ATIVO' | 'INATIVO';
}

interface EmployerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employer: Omit<EmployerData, 'id' | 'status'>) => void;
  employer?: EmployerData | null;
  theme: any;
}

const EmployerModal: React.FC<EmployerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  employer,
  theme,
}) => {
  const alertManager = useAlertManager();
  const [formData, setFormData] = useState({
    cpf: '',
    nome: '',
    email: '',
    emailValidado: false,
    chaveValidacaoEmail: '',
    codigoPais: '+55',
    telefone: '',
    telefoneValidado: false,
    chaveValidacaoTelefone: '',
    senha: '',
    confirmarSenha: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: '',
    cep: '',
    tipoEmpregador: 'DOMESTICO' as 'DOMESTICO' | 'RURAL' | 'OUTROS',
    certificadoDigital: null as File | null,
    certificadoValidado: false,
    enviarParaEsocial: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationType, setValidationType] = useState<'email' | 'phone'>(
    'email'
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (employer) {
        setFormData({
          cpf: employer.cpf,
          nome: employer.nome,
          email: employer.email,
          emailValidado: true,
          chaveValidacaoEmail: '',
          codigoPais: '+55',
          telefone: employer.telefone,
          telefoneValidado: true,
          chaveValidacaoTelefone: '',
          senha: '',
          confirmarSenha: '',
          logradouro: employer.endereco.logradouro,
          numero: employer.endereco.numero,
          complemento: employer.endereco.complemento,
          bairro: employer.endereco.bairro,
          cidade: employer.endereco.cidade,
          uf: employer.endereco.uf,
          cep: employer.endereco.cep,
          tipoEmpregador: employer.tipoEmpregador,
          certificadoDigital: null,
          certificadoValidado: true,
          enviarParaEsocial: false,
        });
      } else {
        setFormData({
          cpf: '',
          nome: '',
          email: '',
          emailValidado: false,
          chaveValidacaoEmail: '',
          codigoPais: '+55',
          telefone: '',
          telefoneValidado: false,
          chaveValidacaoTelefone: '',
          senha: '',
          confirmarSenha: '',
          logradouro: '',
          numero: '',
          complemento: '',
          bairro: '',
          cidade: '',
          uf: '',
          cep: '',
          tipoEmpregador: 'DOMESTICO',
          certificadoDigital: null,
          certificadoValidado: false,
          enviarParaEsocial: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, employer]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password: string) => {
    // Pelo menos 8 caracteres, 1 maiúscula, 1 minúscula, 1 número
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(password);
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

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10)
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const enviarCodigoEmail = async () => {
    try {
      if (!formData.email || !validateEmail(formData.email)) {
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
          email: formData.email,
          codigo: codigo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, chaveValidacaoEmail: codigo }));
        alertManager.showSuccess(
          `Código enviado para ${formData.email}: ${codigo}`
        );
        // Email enviado com sucesso
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na API');
      }
    } catch (error) {
      // Erro ao enviar email
      alertManager.showError(
        `Erro ao enviar código de validação por email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const abrirModalValidacaoEmail = () => {
    if (!formData.chaveValidacaoEmail) {
      alertManager.showWarning('Por favor, envie o código primeiro');
      return;
    }
    setValidationType('email');
    setShowValidationModal(true);
  };

  const validarEmail = (code: string) => {
    if (code === formData.chaveValidacaoEmail) {
      setFormData(prev => ({ ...prev, emailValidado: true }));
      setShowValidationModal(false);
      alertManager.showSuccess('Email validado com sucesso!');
    } else {
      alertManager.showError('Código inválido. Tente novamente.');
    }
  };

  const enviarCodigoTelefone = async () => {
    try {
      if (!formData.telefone || !validatePhone(formData.telefone)) {
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
          telefone: formData.telefone,
          codigo: codigo,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setFormData(prev => ({ ...prev, chaveValidacaoTelefone: codigo }));
        alertManager.showSuccess(
          `Código enviado para ${formData.telefone}: ${codigo}`
        );
        // SMS enviado com sucesso
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro na API');
      }
    } catch (error) {
      // Erro ao enviar SMS
      alertManager.showError(
        `Erro ao enviar código de validação por SMS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  };

  const abrirModalValidacaoTelefone = () => {
    if (!formData.chaveValidacaoTelefone) {
      alertManager.showWarning('Por favor, envie o código primeiro');
      return;
    }
    setValidationType('phone');
    setShowValidationModal(true);
  };

  const validarTelefone = (code: string) => {
    if (code === formData.chaveValidacaoTelefone) {
      setFormData(prev => ({ ...prev, telefoneValidado: true }));
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
            logradouro: data.logradouro || '',
            bairro: data.bairro || '',
            cidade: data.localidade || '',
            uf: data.uf || '',
          }));
        }
      }
    } catch (error) {
      // Erro ao consultar CEP
    }
  };

  const handleCertificadoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Validar se o CPF foi informado
        if (!formData.cpf || !validateCPF(formData.cpf)) {
          alertManager.showError(
            'Por favor, informe um CPF válido antes de fazer upload do certificado'
          );
          // Limpar o input de arquivo
          event.target.value = '';
          return;
        }

        // Validar tipo de arquivo
        const allowedTypes = ['.pfx', '.p12'];
        const fileExtension = file.name
          .toLowerCase()
          .substring(file.name.lastIndexOf('.'));
        if (!allowedTypes.includes(fileExtension)) {
          alertManager.showError(
            'Por favor, selecione um arquivo .pfx ou .p12 válido'
          );
          event.target.value = '';
          return;
        }

        // Validar tamanho do arquivo (máximo 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
          alertManager.showError('O arquivo deve ter no máximo 5MB');
          event.target.value = '';
          return;
        }

        // Primeiro validar o certificado com o CPF
        const cpfValido = await validarCertificadoComCPF(file, formData.cpf);

        if (!cpfValido) {
          alertManager.showError(
            'Certificado digital não confere com o CPF informado. Verifique se o certificado pertence ao CPF correto.'
          );
          // Limpar o input de arquivo
          event.target.value = '';
          return;
        }

        // Se chegou até aqui, o certificado é válido
        // Usar o DocumentService para upload integrado
        const uploadResult = await documentService.upload({
          file,
          category: 'certificado_digital',
          userId: 'temp-user-' + Date.now(), // Em produção, usar ID real do usuário
          metadata: {
            name: 'Certificado Digital A1',
            description: 'Certificado Digital para assinatura eSocial',
            cpf: formData.cpf,
            permissions: 'private',
            tags: ['certificado', 'digital', 'esocial'],
          },
        });

        if (uploadResult.success) {
          // Validar o certificado após upload
          const validationResult = await documentService.validate(
            uploadResult.documentId!,
            formData.cpf
          );

          if (validationResult.valid) {
            setFormData(prev => ({
              ...prev,
              certificadoDigital: file,
              certificadoValidado: true,
            }));

            alertManager.showSuccess(
              `Certificado digital validado e integrado com gestão de documentos! ID: ${uploadResult.documentId}`
            );
          } else {
            // Se validação falhou, excluir o documento
            await documentService.delete(uploadResult.documentId!);
            alertManager.showError(validationResult.message);
            event.target.value = '';
            return;
          }
        } else {
          throw new Error(uploadResult.message || 'Erro no upload');
        }
      } catch (error) {
        // Erro no upload
        alertManager.showError(
          `Erro ao enviar certificado para gestão de documentos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        );
        // Limpar o input de arquivo em caso de erro
        event.target.value = '';
      }
    }
  };

  const validarCertificadoComCPF = async (
    file: File,
    cpf: string
  ): Promise<boolean> => {
    // Simular validação do certificado com o CPF
    // Em um cenário real, aqui você:
    // 1. Extrairia o CPF do certificado digital
    // 2. Compararia com o CPF informado
    // 3. Retornaria true se coincidir

    return new Promise(resolve => {
      setTimeout(() => {
        // Simular validação (80% de chance de sucesso)
        const isValid = Math.random() > 0.2;
        resolve(isValid);
      }, 2000);
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cpf) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpf)) {
      newErrors.cpf = 'CPF inválido';
    }
    if (!formData.nome) newErrors.nome = 'Nome é obrigatório';

    if (!formData.email) {
      newErrors.email = 'Email é obrigatório';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    } else if (!formData.emailValidado) {
      newErrors.email = 'Email deve ser validado';
    }

    if (!formData.telefone) {
      newErrors.telefone = 'Telefone é obrigatório';
    } else if (!validatePhone(formData.telefone)) {
      newErrors.telefone = 'Telefone deve estar no formato (00) 00000-0000';
    } else if (!formData.telefoneValidado) {
      newErrors.telefone = 'Telefone deve ser validado';
    }

    if (!formData.senha) {
      newErrors.senha = 'Senha é obrigatória';
    } else if (!validatePassword(formData.senha)) {
      newErrors.senha =
        'Senha deve ter pelo menos 8 caracteres, 1 maiúscula, 1 minúscula e 1 número';
    }

    if (!formData.confirmarSenha) {
      newErrors.confirmarSenha = 'Confirmação de senha é obrigatória';
    } else if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha =
        'As senhas não coincidem. Verifique e tente novamente.';
    }

    if (!formData.logradouro) newErrors.logradouro = 'Logradouro é obrigatório';
    if (!formData.numero) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.cidade) newErrors.cidade = 'Cidade é obrigatória';
    if (!formData.uf) newErrors.uf = 'UF é obrigatória';
    if (!formData.cep) newErrors.cep = 'CEP é obrigatório';

    // Certificado digital é opcional, mas se fornecido deve ser validado
    if (formData.certificadoDigital && !formData.certificadoValidado) {
      newErrors.certificado = 'Certificado digital deve ser validado';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const employerData = {
      ...formData,
      endereco: {
        logradouro: formData.logradouro,
        numero: formData.numero,
        complemento: formData.complemento,
        bairro: formData.bairro,
        cidade: formData.cidade,
        uf: formData.uf,
        cep: formData.cep,
      },
    };

    onSave(employerData);
    onClose();
  };

  const countryOptions = [
    { value: '+55', label: '🇧🇷 Brasil (+55)' },
    { value: '+1', label: '🇺🇸 Estados Unidos (+1)' },
    { value: '+54', label: '🇦🇷 Argentina (+54)' },
    { value: '+56', label: '🇨🇱 Chile (+56)' },
    { value: '+57', label: '🇨🇴 Colômbia (+57)' },
    { value: '+51', label: '🇵🇪 Peru (+51)' },
    { value: '+598', label: '🇺🇾 Uruguai (+598)' },
    { value: '+595', label: '🇵🇾 Paraguai (+595)' },
    { value: '+591', label: '🇧🇴 Bolívia (+591)' },
    { value: '+593', label: '🇪🇨 Equador (+593)' },
    { value: '+58', label: '🇻🇪 Venezuela (+58)' },
    { value: '+33', label: '🇫🇷 França (+33)' },
    { value: '+49', label: '🇩🇪 Alemanha (+49)' },
    { value: '+39', label: '🇮🇹 Itália (+39)' },
    { value: '+34', label: '🇪🇸 Espanha (+34)' },
    { value: '+44', label: '🇬🇧 Reino Unido (+44)' },
    { value: '+86', label: '🇨🇳 China (+86)' },
    { value: '+81', label: '🇯🇵 Japão (+81)' },
    { value: '+82', label: '🇰🇷 Coreia do Sul (+82)' },
    { value: '+91', label: '🇮🇳 Índia (+91)' },
  ];

  const ufOptions = [
    { value: 'AC', label: 'Acre' },
    { value: 'AL', label: 'Alagoas' },
    { value: 'AP', label: 'Amapá' },
    { value: 'AM', label: 'Amazonas' },
    { value: 'BA', label: 'Bahia' },
    { value: 'CE', label: 'Ceará' },
    { value: 'DF', label: 'Distrito Federal' },
    { value: 'ES', label: 'Espírito Santo' },
    { value: 'GO', label: 'Goiás' },
    { value: 'MA', label: 'Maranhão' },
    { value: 'MT', label: 'Mato Grosso' },
    { value: 'MS', label: 'Mato Grosso do Sul' },
    { value: 'MG', label: 'Minas Gerais' },
    { value: 'PA', label: 'Pará' },
    { value: 'PB', label: 'Paraíba' },
    { value: 'PR', label: 'Paraná' },
    { value: 'PE', label: 'Pernambuco' },
    { value: 'PI', label: 'Piauí' },
    { value: 'RJ', label: 'Rio de Janeiro' },
    { value: 'RN', label: 'Rio Grande do Norte' },
    { value: 'RS', label: 'Rio Grande do Sul' },
    { value: 'RO', label: 'Rondônia' },
    { value: 'RR', label: 'Roraima' },
    { value: 'SC', label: 'Santa Catarina' },
    { value: 'SP', label: 'São Paulo' },
    { value: 'SE', label: 'Sergipe' },
    { value: 'TO', label: 'Tocantins' },
  ];

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title="Cadastro do Empregador"
      maxWidth='800px'
      footer={
        <>
          <UnifiedButton $variant='secondary' $theme={theme} onClick={onClose}>
            Cancelar
          </UnifiedButton>
          <UnifiedButton $variant='primary' $theme={theme} onClick={handleSubmit}>
            <AccessibleEmoji emoji='💾' label='Salvar' />{' '}
            {employer ? 'Atualizar' : 'Cadastrar'}
          </UnifiedButton>
        </>
      }
    >
      <Form onSubmit={handleSubmit}>
        {/* Informações do Empregador */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='👤' label='Dados' /> Dados Pessoais
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='cpf-empregador'>CPF *</OptimizedLabel>
              <OptimizedInputStyled
                id='cpf-empregador'
                type='text'
                value={formData.cpf}
                onChange={e =>
                  handleInputChange('cpf', formatCPF(e.target.value))
                }
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
                $hasError={!!errors['cpf']}
                placeholder='000.000.000-00'
                maxLength={14}
              />
              {errors['cpf'] && (
                <OptimizedErrorMessage>{errors['cpf']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='nome'>Nome Completo *</OptimizedLabel>
              <OptimizedInputStyled
                id='nome'
                type='text'
                value={formData.nome}
                onChange={e => handleInputChange('nome', e.target.value)}
                $hasError={!!errors['nome']}
                placeholder='Nome completo do empregador'
              />
              {errors['nome'] && (
                <OptimizedErrorMessage>{errors['nome']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='email'>Email *</OptimizedLabel>
              <OptimizedValidationContainer>
                <OptimizedInputStyled
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  $hasError={!!errors['email']}
                  placeholder='email@exemplo.com'
                />
                <button
                  type='button'
                  onClick={enviarCodigoEmail}
                  disabled={!formData.email || !validateEmail(formData.email)}
                >
                  <AccessibleEmoji emoji='📧' label='Email' /> Enviar
                </button>
                <button
                  type='button'
                  onClick={abrirModalValidacaoEmail}
                  disabled={!formData.chaveValidacaoEmail}
                >
                  ✓ Validar
                </button>
              </OptimizedValidationContainer>
              <div>
                <input
                  type='checkbox'
                  checked={formData.emailValidado}
                  aria-label='Email validado'
                  onChange={() => {
                    if (!formData.emailValidado) {
                      enviarCodigoEmail();
                    }
                  }}
                />
                <label>
                  {formData.emailValidado ? (
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
              </div>
              {errors['email'] && (
                <OptimizedErrorMessage>{errors['email']}</OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='telefone'>Telefone *</OptimizedLabel>
              <OptimizedValidationContainer>
                <OptimizedSelectStyled
                  id='codigoPais'
                  value={formData.codigoPais}
                  onChange={e =>
                    handleInputChange('codigoPais', e.target.value)
                  }
                  aria-label='Selecionar código do país'
                  title='Selecionar código do país'
                >
                  {countryOptions.map(country => (
                    <option key={country.value} value={country.value}>
                      {country.label}
                    </option>
                  ))}
                </OptimizedSelectStyled>
                <OptimizedInputStyled
                  id='telefone'
                  type='text'
                  value={formData.telefone}
                  onChange={e =>
                    handleInputChange('telefone', formatPhone(e.target.value))
                  }
                  $hasError={!!errors['telefone']}
                  placeholder='(00) 00000-0000'
                />
                <button
                  type='button'
                  onClick={enviarCodigoTelefone}
                  disabled={
                    !formData.telefone || !validatePhone(formData.telefone)
                  }
                >
                  <AccessibleEmoji emoji='📱' label='Telefone' /> Enviar
                </button>
                <button
                  type='button'
                  onClick={abrirModalValidacaoTelefone}
                  disabled={!formData.chaveValidacaoTelefone}
                >
                  ✓ Validar
                </button>
              </OptimizedValidationContainer>
              <div>
                <input
                  type='checkbox'
                  checked={formData.telefoneValidado}
                  aria-label='Telefone validado'
                  onChange={() => {
                    if (!formData.telefoneValidado) {
                      enviarCodigoTelefone();
                    }
                  }}
                />
                <label>
                  {formData.telefoneValidado ? (
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
              </div>
              {errors['telefone'] && (
                <OptimizedErrorMessage>
                  {errors['telefone']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='senha'>Senha *</OptimizedLabel>
              <div>
                <OptimizedInputStyled
                  id='senha'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.senha}
                  onChange={e => handleInputChange('senha', e.target.value)}
                  $hasError={!!errors['senha']}
                  placeholder='Digite sua senha'
                  autoComplete='new-password'
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors['senha'] && (
                <OptimizedErrorMessage>{errors['senha']}</OptimizedErrorMessage>
              )}
              <OptimizedHelpText>
                Mínimo 8 caracteres, 1 maiúscula, 1 minúscula e 1 número
              </OptimizedHelpText>
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='confirmarSenha'>
                Confirmar Senha *
              </OptimizedLabel>
              <div>
                <OptimizedInputStyled
                  id='confirmarSenha'
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmarSenha}
                  onChange={e =>
                    handleInputChange('confirmarSenha', e.target.value)
                  }
                  $hasError={!!errors['confirmarSenha']}
                  placeholder='Confirme sua senha'
                  autoComplete='new-password'
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {errors['confirmarSenha'] && (
                <OptimizedErrorMessage>
                  {errors['confirmarSenha']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='tipoEmpregador'>
                Tipo de Empregador *
              </OptimizedLabel>
              <OptimizedSelectStyled
                id='tipoEmpregador'
                value={formData.tipoEmpregador}
                onChange={e =>
                  handleInputChange('tipoEmpregador', e.target.value)
                }
                $hasError={!!errors['tipoEmpregador']}
                aria-label='Selecionar tipo de empregador'
                title='Selecionar tipo de empregador'
              >
                <option value='DOMESTICO'>Doméstico</option>
                <option value='RURAL'>Rural</option>
                <option value='OUTROS'>Outros</option>
              </OptimizedSelectStyled>
              {errors['tipoEmpregador'] && (
                <OptimizedErrorMessage>
                  {errors['tipoEmpregador']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='cep'>CEP *</OptimizedLabel>
              <OptimizedValidationContainer>
                <OptimizedInputStyled
                  id='cep'
                  type='text'
                  value={formData.cep}
                  onChange={e => {
                    const value = formatCEP(e.target.value);
                    handleInputChange('cep', value);
                    if (value.replace(/\D/g, '').length === 8) {
                      consultarCEP(value);
                    }
                  }}
                  $hasError={!!errors['cep']}
                  placeholder='00000-000'
                  maxLength={9}
                />
                <button
                  type='button'
                  onClick={() => consultarCEP(formData.cep)}
                  disabled={formData.cep.replace(/\D/g, '').length !== 8}
                >
                  <AccessibleEmoji emoji='🔍' label='Buscar' /> Buscar
                </button>
              </OptimizedValidationContainer>
              {errors['cep'] && (
                <OptimizedErrorMessage>{errors['cep']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        {/* Endereço */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='📍' label='Endereço' /> Endereço
          </OptimizedSectionTitle>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='logradouro'>Logradouro *</OptimizedLabel>
              <OptimizedInputStyled
                id='logradouro'
                type='text'
                value={formData.logradouro}
                onChange={e => handleInputChange('logradouro', e.target.value)}
                $hasError={!!errors['logradouro']}
                placeholder='Rua, Avenida, etc.'
              />
              {errors['logradouro'] && (
                <OptimizedErrorMessage>
                  {errors['logradouro']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='numero'>Número *</OptimizedLabel>
              <OptimizedInputStyled
                id='numero'
                type='text'
                value={formData.numero}
                onChange={e => handleInputChange('numero', e.target.value)}
                $hasError={!!errors['numero']}
                placeholder='123'
              />
              {errors['numero'] && (
                <OptimizedErrorMessage>
                  {errors['numero']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='complemento'>Complemento</OptimizedLabel>
              <OptimizedInputStyled
                id='complemento'
                type='text'
                value={formData.complemento}
                onChange={e => handleInputChange('complemento', e.target.value)}
                placeholder='Apto, Casa, etc.'
              />
              <OptimizedHelpText>Opcional</OptimizedHelpText>
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='bairro'>Bairro *</OptimizedLabel>
              <OptimizedInputStyled
                id='bairro'
                type='text'
                value={formData.bairro}
                onChange={e => handleInputChange('bairro', e.target.value)}
                $hasError={!!errors['bairro']}
                placeholder='Nome do bairro'
              />
              {errors['bairro'] && (
                <OptimizedErrorMessage>
                  {errors['bairro']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>

          <OptimizedFormRow>
            <FormGroup>
              <OptimizedLabel htmlFor='cidade'>Cidade *</OptimizedLabel>
              <OptimizedInputStyled
                id='cidade'
                type='text'
                value={formData.cidade}
                onChange={e => handleInputChange('cidade', e.target.value)}
                $hasError={!!errors['cidade']}
                placeholder='Nome da cidade'
              />
              {errors['cidade'] && (
                <OptimizedErrorMessage>
                  {errors['cidade']}
                </OptimizedErrorMessage>
              )}
            </FormGroup>

            <FormGroup>
              <OptimizedLabel htmlFor='uf'>UF *</OptimizedLabel>
              <OptimizedSelectStyled
                id='uf'
                value={formData.uf}
                onChange={e => handleInputChange('uf', e.target.value)}
                $hasError={!!errors['uf']}
                aria-label='Selecionar estado'
                title='Selecionar estado'
              >
                <option value=''>Selecione a UF</option>
                {ufOptions.map(uf => (
                  <option key={uf.value} value={uf.value}>
                    {uf.label}
                  </option>
                ))}
              </OptimizedSelectStyled>
              {errors['uf'] && (
                <OptimizedErrorMessage>{errors['uf']}</OptimizedErrorMessage>
              )}
            </FormGroup>
          </OptimizedFormRow>
        </OptimizedFormSection>

        {/* Certificado Digital */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='🔐' label='Certificado' /> Certificado
            Digital
          </OptimizedSectionTitle>

          <FormGroup>
            <OptimizedLabel htmlFor='certificado'>
              Certificado Digital (Opcional)
            </OptimizedLabel>
            <div>
              <input
                id='certificado'
                type='file'
                accept='.pfx,.p12'
                onChange={handleCertificadoUpload}
                aria-label='Selecionar certificado digital'
              />
              {formData.certificadoValidado && (
                <span>
                  <AccessibleEmoji emoji='✅' label='Sucesso' /> Validado
                </span>
              )}
            </div>
            <OptimizedHelpText>
              Arquivo .pfx ou .p12 do certificado digital
            </OptimizedHelpText>
            {errors['certificado'] && (
              <OptimizedErrorMessage>
                {errors['certificado']}
              </OptimizedErrorMessage>
            )}
          </FormGroup>
        </OptimizedFormSection>

        {/* Opção eSocial */}
        <OptimizedFormSection>
          <OptimizedSectionTitle>
            <AccessibleEmoji emoji='🏛️' label='eSocial' /> Integração eSocial
          </OptimizedSectionTitle>

          <FormGroup>
            <div>
              <input
                id='enviarParaEsocial'
                type='checkbox'
                checked={formData.enviarParaEsocial}
                aria-label='Enviar dados para eSocial'
                onChange={e =>
                  handleInputChange('enviarParaEsocial', e.target.checked.toString())
                }
              />
              <OptimizedLabel htmlFor='enviarParaEsocial'>
                Enviar cadastro para o eSocial após validação
              </OptimizedLabel>
            </div>
            <OptimizedHelpText>
              Se marcado, o evento S-1000 será enviado automaticamente para
              registrar o empregador no eSocial
            </OptimizedHelpText>
          </FormGroup>
        </OptimizedFormSection>

        {/* Informações importantes */}
        <InfoCard>
          <InfoTitle>
            <AccessibleEmoji emoji='ℹ️' label='Info' /> Informações Importantes
          </InfoTitle>
          <InfoText>
            {formData.enviarParaEsocial
              ? 'Após o cadastro, o evento S-1000 será enviado automaticamente para o eSocial.'
              : 'Após o cadastro, será necessário enviar o evento S-1000 manualmente para o eSocial.'}
          </InfoText>
        </InfoCard>
      </Form>

      <ValidationModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        onSuccess={validationType === 'email' ? validarEmail : validarTelefone}
        tipo={validationType === 'email' ? 'email' : 'telefone'}
        valor={
          validationType === 'email' ? formData.email : formData.telefone
        }
      />
    </UnifiedModal>
  );
};

export default EmployerModal;
