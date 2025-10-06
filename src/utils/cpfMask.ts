// utils/cpfMask.ts

/**
 * Aplica máscara de CPF no formato 000.000.000-00
 * Remove caracteres não numéricos e aplica a formatação
 */
export function applyCpfMask(value: string): string {
  // Remove tudo que não seja dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 11 dígitos
  const limitedNumbers = numbers.slice(0, 11);
  
  // Aplica a máscara
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 6) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3)}`;
  } else if (limitedNumbers.length <= 9) {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}.${limitedNumbers.slice(3, 6)}.${limitedNumbers.slice(6, 9)}-${limitedNumbers.slice(9)}`;
  }
}

/**
 * Remove a máscara do CPF, retornando apenas os números
 */
export function removeCpfMask(cpf: string): string {
  return cpf.replace(/\D/g, '');
}
