import React, { useState, useEffect } from 'react';
import { useAlertManager } from '../hooks/useAlertManager';
import { UnifiedModal } from './unified';
import { UnifiedButton } from './UnifiedButton';
import { Form, FormGroup, Input, Select } from './FormComponents';
import AccessibleEmoji from './AccessibleEmoji';
import styled from 'styled-components';

const ModalContent = styled.div`
  padding: 1rem;
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

const ButtonContainer = styled.div`
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 1.5rem;
`;

const ErrorText = styled.span`
  color: red;
  font-size: 0.875rem;
`;

interface Employer {
  id: string;
  razaoSocial: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
  };
}

interface EmployerModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employer: Employer) => void;
  employer?: Employer;
  $theme: any;
}

export const EmployerModalNew: React.FC<EmployerModalNewProps> = ({
  isOpen,
  onClose,
  onSave,
  employer,
  $theme,
}) => {
  const { showAlert } = useAlertManager();
  const [formData, setFormData] = useState<Employer>({
    id: '',
    razaoSocial: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: {
      cep: '',
      logradouro: '',
      numero: '',
      bairro: '',
      cidade: '',
      uf: '',
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employer) {
      setFormData(employer);
    } else {
      setFormData({
        id: '',
        razaoSocial: '',
        cnpj: '',
        email: '',
        telefone: '',
        endereco: {
          cep: '',
          logradouro: '',
          numero: '',
          bairro: '',
          cidade: '',
          uf: '',
        },
      });
    }
  }, [employer]);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.razaoSocial.trim()) {
      newErrors.razaoSocial = 'Razão Social é obrigatória';
    }

    if (!formData.cnpj.trim()) {
      newErrors.cnpj = 'CNPJ é obrigatório';
    } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
      newErrors.cnpj = 'CNPJ deve estar no formato 00.000.000/0000-00';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.endereco.cep.trim()) {
      newErrors['endereco.cep'] = 'CEP é obrigatório';
    }

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      showAlert({
        type: 'error',
        message: 'Por favor, corrija os erros no formulário.'
      });
      return;
    }

    onSave(formData);
    showAlert({
      type: 'success',
      message: `Empregador ${employer ? 'atualizado' : 'cadastrado'} com sucesso!`
    });
    onClose();
  };

  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  const formatPhone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .replace(/(\d{4})-(\d)(\d{4})/, '$1$2-$3');
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2');
  };

  const ufOptions = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employer ? 'Editar' : 'Adicionar'} Empregador`}
      maxWidth="900px"
      $theme={$theme}
    >
      <ModalContent>
        <Form onSubmit={e => e.preventDefault()}>
          <h3>Dados da Empresa</h3>
          
          <FormRow>
            <FormGroup>
              <label htmlFor="razaoSocial">Razão Social *</label>
              <Input
                id="razaoSocial"
                type="text"
                value={formData.razaoSocial}
                onChange={e => handleInputChange('razaoSocial', e.target.value)}
                placeholder="Digite a razão social"
                $theme={$theme}
                $hasError={!!errors.razaoSocial}
              />
              {errors.razaoSocial && <ErrorText>{errors.razaoSocial}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="cnpj">CNPJ *</label>
              <Input
                id="cnpj"
                type="text"
                value={formData.cnpj}
                onChange={e => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                $theme={$theme}
                $hasError={!!errors.cnpj}
              />
              {errors.cnpj && <ErrorText>{errors.cnpj}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="email">Email *</label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                $theme={$theme}
                $hasError={!!errors.email}
              />
              {errors.email && <ErrorText>{errors.email}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="telefone">Telefone *</label>
              <Input
                id="telefone"
                type="tel"
                value={formData.telefone}
                onChange={e => handleInputChange('telefone', formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                $theme={$theme}
                $hasError={!!errors.telefone}
              />
              {errors.telefone && <ErrorText>{errors.telefone}</ErrorText>}
            </FormGroup>
          </FormRow>

          <h3>Endereço</h3>
          
          <FormRow>
            <FormGroup>
              <label htmlFor="cep">CEP *</label>
              <Input
                id="cep"
                type="text"
                value={formData.endereco.cep}
                onChange={e => handleInputChange('endereco.cep', formatCEP(e.target.value))}
                placeholder="00000-000"
                maxLength={9}
                $theme={$theme}
                $hasError={!!errors['endereco.cep']}
              />
              {errors['endereco.cep'] && <ErrorText>{errors['endereco.cep']}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="uf">UF *</label>
              <Select
                id="uf"
                value={formData.endereco.uf}
                onChange={e => handleInputChange('endereco.uf', e.target.value)}
                $theme={$theme}
              >
                <option value="">Selecione a UF</option>
                {ufOptions.map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </Select>
              {errors['endereco.uf'] && <ErrorText>{errors['endereco.uf']}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="logradouro">Logradouro *</label>
              <Input
                id="logradouro"
                type="text"
                value={formData.endereco.logradouro}
                onChange={e => handleInputChange('endereco.logradouro', e.target.value)}
                placeholder="Rua, Avenida, etc."
                $theme={$theme}
                $hasError={!!errors['endereco.logradouro']}
              />
              {errors['endereco.logradouro'] && <ErrorText>{errors['endereco.logradouro']}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="numero">Número *</label>
              <Input
                id="numero"
                type="text"
                value={formData.endereco.numero}
                onChange={e => handleInputChange('endereco.numero', e.target.value)}
                placeholder="123"
                $theme={$theme}
                $hasError={!!errors['endereco.numero']}
              />
              {errors['endereco.numero'] && <ErrorText>{errors['endereco.numero']}</ErrorText>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="bairro">Bairro *</label>
              <Input
                id="bairro"
                type="text"
                value={formData.endereco.bairro}
                onChange={e => handleInputChange('endereco.bairro', e.target.value)}
                placeholder="Digite o bairro"
                $theme={$theme}
                $hasError={!!errors['endereco.bairro']}
              />
              {errors['endereco.bairro'] && <ErrorText>{errors['endereco.bairro']}</ErrorText>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="cidade">Cidade *</label>
              <Input
                id="cidade"
                type="text"
                value={formData.endereco.cidade}
                onChange={e => handleInputChange('endereco.cidade', e.target.value)}
                placeholder="Digite a cidade"
                $theme={$theme}
                $hasError={!!errors['endereco.cidade']}
              />
              {errors['endereco.cidade'] && <ErrorText>{errors['endereco.cidade']}</ErrorText>}
            </FormGroup>
          </FormRow>

          <ButtonContainer>
            <UnifiedButton
              $variant="secondary"
              $theme={$theme}
              onClick={onClose}
            >
              Cancelar
            </UnifiedButton>
            <UnifiedButton
              $variant="primary"
              $theme={$theme}
              onClick={handleSave}
            >
              <AccessibleEmoji emoji="💾" label="Salvar" /> Salvar
            </UnifiedButton>
          </ButtonContainer>
        </Form>
      </ModalContent>
    </UnifiedModal>
  );
};
