/**
 * Formulário de Gerenciamento de Usuários
 * Com validações em tempo real das regras de negócio
 */

import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import useValidation from '../../hooks/useValidation';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

interface UserManagementFormProps {
  mode: 'create' | 'update';
  initialData?: any;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

interface FormData {
  cpf: string;
  email: string;
  nomeCompleto: string;
  dataNascimento: string;
  telefone: string;
  perfilId: string;
  grupoId: string;
}

const FormContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 600px;
  margin: 0 auto;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: ${props => props.theme?.text?.primary || '#333'};
`;

const Input = styled.input<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? (props.theme?.status?.error?.color || '#e74c3c') : (props.theme?.border?.primary || '#ddd')};
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? (props.theme?.status?.error?.color || '#e74c3c') : (props.theme?.navigation?.primary || '#3498db')};
  }
`;

const Select = styled.select<{ hasError?: boolean }>`
  width: 100%;
  padding: 12px;
  border: 2px solid ${props => props.hasError ? (props.theme?.status?.error?.color || '#e74c3c') : (props.theme?.border?.primary || '#ddd')};
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.hasError ? (props.theme?.status?.error?.color || '#e74c3c') : (props.theme?.navigation?.primary || '#3498db')};
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme?.status?.error?.color || '#e74c3c'};
  font-size: 12px;
  margin-top: 4px;
`;

const SuccessMessage = styled.div`
  color: ${props => props.theme?.status?.success?.color || '#27ae60'};
  font-size: 12px;
  margin-top: 4px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s;

  ${props => props.variant === 'primary' ? `
    background: ${props => props.theme?.navigation?.primary || '#3498db'};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props => props.theme?.navigation?.primary || '#2980b9'};
    }
    
    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  ` : `
    background: #ecf0f1;
    color: #2c3e50;
    
    &:hover {
      background: #d5dbdb;
    }
  `}
`;

const ValidationStatus = styled.div<{ isValid?: boolean }>`
  padding: 8px 12px;
  border-radius: 4px;
  margin-top: 8px;
  font-size: 12px;
  font-weight: 500;
  
  ${props => props.isValid ? `
    background: #d5f4e6;
    color: ${props => props.theme?.status?.success?.color || '#27ae60'};
    border: 1px solid #27ae60;
  ` : `
    background: #fadbd8;
    color: ${props => props.theme?.status?.error?.color || '#e74c3c'};
    border: 1px solid #e74c3c;
  `}
`;

export default function UserManagementForm({ 
  mode, 
  initialData, 
  onSuccess, 
  onCancel 
}: UserManagementFormProps) {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const { loading, validateUserCreation, validateUserUpdate, validateUserGroupAssignment } = useValidation();
  
  const [formData, setFormData] = useState<FormData>({
    cpf: initialData?.cpf || '',
    email: initialData?.email || '',
    nomeCompleto: initialData?.nomeCompleto || '',
    dataNascimento: initialData?.dataNascimento || '',
    telefone: initialData?.telefone || '',
    perfilId: initialData?.perfilId || '',
    grupoId: initialData?.grupoId || ''
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateCPF = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateUserCreation(formData.cpf, formData.email);
      setValidationErrors(prev => ({
        ...prev,
        cpf: result.errors.filter(error => error.includes('CPF'))
      }));
    } catch (error) {
      console.error('Erro na validação do CPF:', error);
    } finally {
      setIsValidating(false);
    }
  }, [formData.cpf, formData.email, validateUserCreation]);

  const validateEmail = useCallback(async () => {
    setIsValidating(true);
    try {
      const result = await validateUserCreation(formData.cpf, formData.email);
      setValidationErrors(prev => ({
        ...prev,
        email: result.errors.filter(error => error.includes('Email'))
      }));
    } catch (error) {
      console.error('Erro na validação do email:', error);
    } finally {
      setIsValidating(false);
    }
  }, [formData.cpf, formData.email, validateUserCreation]);

  // Validar CPF em tempo real
  useEffect(() => {
    if (formData.cpf && formData.cpf.length === 11) {
      validateCPF();
    }
  }, [formData.cpf, validateCPF]);

  // Validar email em tempo real
  useEffect(() => {
    if (formData.email && formData.email.includes('@')) {
      validateEmail();
    }
  }, [formData.email, validateEmail]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: [] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let validationResult;

      if (mode === 'create') {
        // Validar criação de usuário
        validationResult = await validateUserCreation(formData.cpf, formData.email);
        
        if (!validationResult.isValid) {
          setValidationErrors({
            cpf: validationResult.errors.filter(error => error.includes('CPF')),
            email: validationResult.errors.filter(error => error.includes('Email'))
          });
          return;
        }

        // Validar regras do grupo
        const groupValidation = await validateUserGroupAssignment({
          cpf: formData.cpf,
          grupoId: formData.grupoId,
          perfilId: formData.perfilId
        });

        if (!groupValidation.isValid) {
          setValidationErrors({
            grupo: groupValidation.errors
          });
          return;
        }

        // Criar usuário
        const response = await fetch('/api/users/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'create-user',
            data: formData
          })
        });

        const result = await response.json();
        
        if (result.success) {
          onSuccess?.(result.data);
        } else {
          setValidationErrors({
            general: [result.error]
          });
        }
      } else {
        // Validar atualização de usuário
        validationResult = await validateUserUpdate(
          initialData.id,
          formData.cpf,
          formData.email
        );
        
        if (!validationResult.isValid) {
          setValidationErrors({
            cpf: validationResult.errors.filter(error => error.includes('CPF')),
            email: validationResult.errors.filter(error => error.includes('Email'))
          });
          return;
        }

        // Atualizar usuário
        const response = await fetch('/api/users/manage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'update-user',
            data: {
              usuarioId: initialData.id,
              ...formData
            }
          })
        });

        const result = await response.json();
        
        if (result.success) {
          onSuccess?.(result.data);
        } else {
          setValidationErrors({
            general: [result.error]
          });
        }
      }
    } catch (error: any) {
      setValidationErrors({
        general: ['Erro interno do servidor']
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasErrors = Object.values(validationErrors).some(errors => errors.length > 0);
  const hasFieldErrors = Object.keys(validationErrors).some(key => 
    key !== 'general' && validationErrors[key].length > 0
  );

  return (
    <FormContainer>
      <h2>{mode === 'create' ? 'Criar Usuário' : 'Editar Usuário'}</h2>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <Label>CPF *</Label>
          <Input
            type="text"
            value={formData.cpf}
            onChange={(e) => handleInputChange('cpf', e.target.value)}
            placeholder="00000000000"
            maxLength={11}
            hasError={!!validationErrors.cpf?.length}
          />
          {validationErrors.cpf?.map((error, index) => (
            <ErrorMessage key={index}>{error}</ErrorMessage>
          ))}
          {isValidating && <SuccessMessage>Validando...</SuccessMessage>}
        </FormGroup>

        <FormGroup>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="usuario@exemplo.com"
            hasError={!!validationErrors.email?.length}
          />
          {validationErrors.email?.map((error, index) => (
            <ErrorMessage key={index}>{error}</ErrorMessage>
          ))}
        </FormGroup>

        <FormGroup>
          <Label>Nome Completo *</Label>
          <Input
            type="text"
            value={formData.nomeCompleto}
            onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
            placeholder="Nome completo do usuário"
          />
        </FormGroup>

        <FormGroup>
          <Label>Data de Nascimento *</Label>
          <Input
            type="date"
            value={formData.dataNascimento}
            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <Label>Telefone *</Label>
          <Input
            type="text"
            value={formData.telefone}
            onChange={(e) => handleInputChange('telefone', e.target.value)}
            placeholder="11999999999"
            maxLength={11}
          />
        </FormGroup>

        {mode === 'create' && (
          <>
            <FormGroup>
              <Label>Perfil *</Label>
              <Select
                value={formData.perfilId}
                onChange={(e) => handleInputChange('perfilId', e.target.value)}
                hasError={!!validationErrors.perfil?.length}
              >
                <option value="">Selecione um perfil</option>
                <option value="empregador">Empregador</option>
                <option value="funcionario">Funcionário</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Grupo *</Label>
              <Select
                value={formData.grupoId}
                onChange={(e) => handleInputChange('grupoId', e.target.value)}
                hasError={!!validationErrors.grupo?.length}
              >
                <option value="">Selecione um grupo</option>
                {/* Grupos serão carregados dinamicamente */}
              </Select>
              {validationErrors.grupo?.map((error, index) => (
                <ErrorMessage key={index}>{error}</ErrorMessage>
              ))}
            </FormGroup>
          </>
        )}

        {validationErrors.general?.map((error, index) => (
          <ErrorMessage key={index}>{error}</ErrorMessage>
        ))}

        <ValidationStatus isValid={!hasFieldErrors}>
          {hasFieldErrors 
            ? '❌ Existem erros de validação' 
            : '✅ Dados válidos'
          }
        </ValidationStatus>

        <ButtonGroup>
          <Button type="button" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="primary"
            disabled={isSubmitting || loading || hasFieldErrors}
          >
            {isSubmitting ? 'Salvando...' : (mode === 'create' ? 'Criar' : 'Atualizar')}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
