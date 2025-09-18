// utils/cpfValidator.ts

/**
 * Remove caracteres não numéricos e valida o CPF.
 * Retorna true se o CPF for válido, false caso contrário.
 */
export function validateCpf(cpf: string): boolean {
  // Remove tudo que não seja dígito
  cpf = cpf.replace(/[^\d]+/g, '');

  // Verifica se tem 11 dígitos ou se todos os dígitos são iguais
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  const cpfArray = cpf.split('').map(Number);

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += (cpfArray[i] ?? 0) * (10 - i);
  }
  let firstDigit = 11 - (sum % 11);
  if (firstDigit >= 10) firstDigit = 0;
  if (firstDigit !== cpfArray[9]) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += (cpfArray[i] ?? 0) * (11 - i);
  }
  let secondDigit = 11 - (sum % 11);
  if (secondDigit >= 10) secondDigit = 0;
  if (secondDigit !== cpfArray[10]) return false;

  return true;
}
