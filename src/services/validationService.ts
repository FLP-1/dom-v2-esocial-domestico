/**
 * Serviço Centralizado de Validações
 * Garante as regras de negócio críticas:
 * - CPF único no sistema
 * - Apenas 1 empregador por grupo
 * - CPF único dentro do mesmo grupo
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface UserGroupValidationData {
  cpf: string;
  grupoId: string;
  perfilId: string;
  usuarioId?: string; // Para updates
}

export class ValidationService {
  /**
   * Valida se um CPF é único no sistema
   */
  static async validateUniqueCPF(cpf: string, excludeUserId?: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const existingUser = await prisma.usuario.findFirst({
        where: {
          cpf,
          ...(excludeUserId && { id: { not: excludeUserId } })
        },
        select: { id: true, cpf: true, nomeCompleto: true }
      });

      if (existingUser) {
        errors.push(`CPF ${cpf} já está cadastrado no sistema para o usuário ${existingUser.nomeCompleto}`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro ao validar CPF único: ${error.message}`]
      };
    }
  }

  /**
   * Valida se um grupo tem apenas 1 empregador
   */
  static async validateSingleEmployerPerGroup(grupoId: string, usuarioId?: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Verificar se o usuário tem perfil de empregador
      const userProfile = await prisma.usuarioPerfil.findFirst({
        where: {
          usuarioId: usuarioId || '', // Será validado posteriormente
          perfil: {
            codigo: 'EMPREGADOR'
          },
          ativo: true
        }
      });

      if (!userProfile && usuarioId) {
        // Se estamos validando um usuário específico e ele não é empregador, não há problema
        return { isValid: true, errors: [] };
      }

      // Contar empregadores ativos no grupo
      const employerCount = await prisma.usuarioGrupo.count({
        where: {
          grupoId,
          ativo: true,
          usuario: {
            perfis: {
              some: {
                perfil: {
                  codigo: 'EMPREGADOR'
                },
                ativo: true
              }
            }
          },
          ...(usuarioId && { usuarioId: { not: usuarioId } }) // Excluir o usuário atual em updates
        }
      });

      if (employerCount > 0) {
        errors.push(`O grupo já possui um empregador cadastrado. Apenas 1 empregador é permitido por grupo.`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro ao validar empregador único: ${error.message}`]
      };
    }
  }

  /**
   * Valida se um CPF é único dentro de um grupo
   */
  static async validateUniqueCPFInGroup(cpf: string, grupoId: string, usuarioId?: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      const existingUserInGroup = await prisma.usuario.findFirst({
        where: {
          cpf,
          gruposUsuario: {
            some: {
              grupoId,
              ativo: true,
              ...(usuarioId && { usuarioId: { not: usuarioId } }) // Excluir o usuário atual em updates
            }
          }
        },
        select: { id: true, cpf: true, nomeCompleto: true }
      });

      if (existingUserInGroup) {
        errors.push(`CPF ${cpf} já está cadastrado neste grupo para outro usuário`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro ao validar CPF único no grupo: ${error.message}`]
      };
    }
  }

  /**
   * Validação completa para adicionar usuário a grupo
   */
  static async validateUserGroupAssignment(data: UserGroupValidationData): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // 1. Validar CPF único no sistema
      const cpfValidation = await this.validateUniqueCPF(data.cpf, data.usuarioId);
      if (!cpfValidation.isValid) {
        errors.push(...cpfValidation.errors);
      }

      // 2. Validar empregador único por grupo (se for empregador)
      const perfil = await prisma.perfil.findUnique({
        where: { id: data.perfilId },
        select: { codigo: true }
      });

      if (perfil?.codigo === 'EMPREGADOR' && data.usuarioId) {
        const employerValidation = await this.validateSingleEmployerPerGroup(data.grupoId, data.usuarioId);
        if (!employerValidation.isValid) {
          errors.push(...employerValidation.errors);
        }
      }

      // 3. Validar CPF único no grupo
      const groupValidation = await this.validateUniqueCPFInGroup(data.cpf, data.grupoId, data.usuarioId);
      if (!groupValidation.isValid) {
        errors.push(...groupValidation.errors);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro na validação completa: ${error.message}`]
      };
    }
  }

  /**
   * Validação para criação de usuário
   */
  static async validateUserCreation(cpf: string, email: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Validar CPF único
      const cpfValidation = await this.validateUniqueCPF(cpf);
      if (!cpfValidation.isValid) {
        errors.push(...cpfValidation.errors);
      }

      // Validar email único
      const existingEmail = await prisma.usuario.findUnique({
        where: { email },
        select: { id: true, email: true, nomeCompleto: true }
      });

      if (existingEmail) {
        errors.push(`Email ${email} já está cadastrado no sistema`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro na validação de criação de usuário: ${error.message}`]
      };
    }
  }

  /**
   * Validação para atualização de usuário
   */
  static async validateUserUpdate(
    usuarioId: string, 
    cpf: string, 
    email: string
  ): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Validar CPF único (excluindo o usuário atual)
      const cpfValidation = await this.validateUniqueCPF(cpf, usuarioId);
      if (!cpfValidation.isValid) {
        errors.push(...cpfValidation.errors);
      }

      // Validar email único (excluindo o usuário atual)
      const existingEmail = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: usuarioId }
        },
        select: { id: true, email: true, nomeCompleto: true }
      });

      if (existingEmail) {
        errors.push(`Email ${email} já está cadastrado para outro usuário`);
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro na validação de atualização de usuário: ${error.message}`]
      };
    }
  }

  /**
   * Validar se um usuário pode ser removido de um grupo
   * (verificar se não é o único empregador)
   */
  static async validateUserGroupRemoval(usuarioId: string, grupoId: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // Verificar se o usuário é empregador
      const userProfile = await prisma.usuarioPerfil.findFirst({
        where: {
          usuarioId,
          perfil: {
            codigo: 'EMPREGADOR'
          },
          ativo: true
        }
      });

      if (userProfile) {
        // Se é empregador, verificar se há outros empregadores no grupo
        const otherEmployers = await prisma.usuarioGrupo.count({
          where: {
            grupoId,
            ativo: true,
            usuarioId: { not: usuarioId },
            usuario: {
              perfis: {
                some: {
                  perfil: {
                    codigo: 'EMPREGADOR'
                  },
                  ativo: true
                }
              }
            }
          }
        });

        if (otherEmployers === 0) {
          errors.push(`Não é possível remover o único empregador do grupo. Um grupo deve ter pelo menos 1 empregador.`);
        }
      }

      return {
        isValid: errors.length === 0,
        errors
      };
    } catch (error: any) {
      return {
        isValid: false,
        errors: [`Erro na validação de remoção de usuário: ${error.message}`]
      };
    }
  }
}

export default ValidationService;
