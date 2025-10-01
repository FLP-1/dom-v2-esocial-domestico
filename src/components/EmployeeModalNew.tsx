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

interface Employee {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cargo: string;
  salario: number;
  dataAdmissao: string;
}

interface EmployeeModalNewProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Employee) => void;
  employee?: Employee;
  $theme: any;
}

export const EmployeeModalNew: React.FC<EmployeeModalNewProps> = ({
  isOpen,
  onClose,
  onSave,
  employee,
  $theme,
}) => {
  const { showAlert } = useAlertManager();
  const [formData, setFormData] = useState<Employee>({
    id: '',
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cargo: '',
    salario: 0,
    dataAdmissao: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      setFormData({
        id: '',
        nome: '',
        cpf: '',
        email: '',
        telefone: '',
        cargo: '',
        salario: 0,
        dataAdmissao: '',
      });
    }
  }, [employee]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'CPF é obrigatório';
    } else if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(formData.cpf)) {
      newErrors.cpf = 'CPF deve estar no formato 000.000.000-00';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email deve ter um formato válido';
    }

    if (!formData.telefone.trim()) {
      newErrors.telefone = 'Telefone é obrigatório';
    }

    if (!formData.cargo.trim()) {
      newErrors.cargo = 'Cargo é obrigatório';
    }

    if (formData.salario <= 0) {
      newErrors.salario = 'Salário deve ser maior que zero';
    }

    if (!formData.dataAdmissao) {
      newErrors.dataAdmissao = 'Data de admissão é obrigatória';
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
      message: `Funcionário ${employee ? 'atualizado' : 'cadastrado'} com sucesso!`
    });
    onClose();
  };

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

  return (
    <UnifiedModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${employee ? 'Editar' : 'Adicionar'} Funcionário`}
      maxWidth="800px"
      $theme={$theme}
    >
      <ModalContent>
        <Form onSubmit={e => e.preventDefault()}>
          <FormRow>
            <FormGroup>
              <label htmlFor="nome">Nome Completo *</label>
              <Input
                id="nome"
                type="text"
                value={formData.nome}
                onChange={e => handleInputChange('nome', e.target.value)}
                placeholder="Digite o nome completo"
                $theme={$theme}
                $hasError={!!errors.nome}
              />
              {errors.nome && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.nome}</span>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="cpf">CPF *</label>
              <Input
                id="cpf"
                type="text"
                value={formData.cpf}
                onChange={e => handleInputChange('cpf', formatCPF(e.target.value))}
                placeholder="000.000.000-00"
                maxLength={14}
                $theme={$theme}
                $hasError={!!errors.cpf}
              />
              {errors.cpf && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.cpf}</span>}
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
              {errors.email && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.email}</span>}
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
              {errors.telefone && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.telefone}</span>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="cargo">Cargo *</label>
              <Input
                id="cargo"
                type="text"
                value={formData.cargo}
                onChange={e => handleInputChange('cargo', e.target.value)}
                placeholder="Digite o cargo"
                $theme={$theme}
                $hasError={!!errors.cargo}
              />
              {errors.cargo && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.cargo}</span>}
            </FormGroup>

            <FormGroup>
              <label htmlFor="salario">Salário *</label>
              <Input
                id="salario"
                type="number"
                value={formData.salario}
                onChange={e => handleInputChange('salario', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                step="0.01"
                min="0"
                $theme={$theme}
                $hasError={!!errors.salario}
              />
              {errors.salario && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.salario}</span>}
            </FormGroup>
          </FormRow>

          <FormRow>
            <FormGroup>
              <label htmlFor="dataAdmissao">Data de Admissão *</label>
              <Input
                id="dataAdmissao"
                type="date"
                value={formData.dataAdmissao}
                onChange={e => handleInputChange('dataAdmissao', e.target.value)}
                $theme={$theme}
                $hasError={!!errors.dataAdmissao}
              />
              {errors.dataAdmissao && <span style={{ color: 'red', fontSize: '0.875rem' }}>{errors.dataAdmissao}</span>}
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
