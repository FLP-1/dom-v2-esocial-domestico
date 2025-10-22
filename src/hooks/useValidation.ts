/**
 * Hook para validações de usuários e grupos
 * Integra com o ValidationService
 */

import { useState, useCallback } from 'react';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface UserGroupValidationData {
  cpf: string;
  grupoId: string;
  perfilId: string;
  usuarioId?: string;
}

export const useValidation = () => {
  const [loading, setLoading] = useState(false);

  const validateUserCreation = useCallback(async (cpf: string, email: string): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user-creation',
          data: { cpf, email }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateUserUpdate = useCallback(async (
    usuarioId: string, 
    cpf: string, 
    email: string
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user-update',
          data: { usuarioId, cpf, email }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateUserGroupAssignment = useCallback(async (
    data: UserGroupValidationData
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user-group-assignment',
          data
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateUserGroupRemoval = useCallback(async (
    usuarioId: string, 
    grupoId: string
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'user-group-removal',
          data: { usuarioId, grupoId }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateUniqueCPF = useCallback(async (
    cpf: string, 
    excludeUserId?: string
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unique-cpf',
          data: { cpf, excludeUserId }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateSingleEmployerPerGroup = useCallback(async (
    grupoId: string, 
    usuarioId?: string
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'single-employer-per-group',
          data: { grupoId, usuarioId }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  const validateUniqueCPFInGroup = useCallback(async (
    cpf: string, 
    grupoId: string, 
    usuarioId?: string
  ): Promise<ValidationResult> => {
    setLoading(true);
    try {
      const response = await fetch('/api/validation/validate-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'unique-cpf-in-group',
          data: { cpf, grupoId, usuarioId }
        })
      });

      const result = await response.json();
      return result.success ? result.data : { isValid: false, errors: [result.error] };
    } catch (error: any) {
      return { isValid: false, errors: ['Erro na validação'] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    validateUserCreation,
    validateUserUpdate,
    validateUserGroupAssignment,
    validateUserGroupRemoval,
    validateUniqueCPF,
    validateSingleEmployerPerGroup,
    validateUniqueCPFInGroup
  };
};

export default useValidation;
