/**
 * CONSTANTES FIXAS DO SISTEMA
 * Valores que nunca mudam e são específicos do código
 */

export const SYSTEM_CONSTANTS = {
  // Valores técnicos fixos
  DEFAULT_AVATAR: 'U',
  DEFAULT_USER_NAME: 'Usuário',
  
  // Roles válidos do sistema (fixos)
  VALID_ROLES: [
    'EMPREGADOR',
    'EMPREGADO', 
    'FAMILIA',
    'ADMIN',
    'FUNCIONARIO',
    'FINANCEIRO',
    'ADMINISTRADOR'
  ] as const,
  
  // Configurações de desenvolvimento
  DEFAULT_TIMEOUT: 30000,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export type ValidRole = typeof SYSTEM_CONSTANTS.VALID_ROLES[number];

/**
 * Verifica se um role é válido
 */
export function isValidRole(role: string | null | undefined): role is ValidRole {
  return role !== null && role !== undefined && SYSTEM_CONSTANTS.VALID_ROLES.includes(role as ValidRole);
}

/**
 * Obtém um role válido ou retorna null
 * NÃO usa fallbacks hardcoded
 */
export function getValidRole(role: string | null | undefined): ValidRole | null {
  return isValidRole(role) ? role : null;
}
