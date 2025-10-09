/**
 * Utilitário para validação e geração de CPFs válidos
 */

export function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  
  let resto = 11 - (soma % 11);
  let digito1 = resto >= 10 ? 0 : resto;
  
  if (digito1 !== parseInt(cpf.charAt(9))) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  
  resto = 11 - (soma % 11);
  let digito2 = resto >= 10 ? 0 : resto;
  
  if (digito2 !== parseInt(cpf.charAt(10))) return false;

  return true;
}

export function gerarCPF(): string {
  const n1 = Math.floor(Math.random() * 9);
  const n2 = Math.floor(Math.random() * 9);
  const n3 = Math.floor(Math.random() * 9);
  const n4 = Math.floor(Math.random() * 9);
  const n5 = Math.floor(Math.random() * 9);
  const n6 = Math.floor(Math.random() * 9);
  const n7 = Math.floor(Math.random() * 9);
  const n8 = Math.floor(Math.random() * 9);
  const n9 = Math.floor(Math.random() * 9);

  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;

  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;

  return `${n1}${n2}${n3}${n4}${n5}${n6}${n7}${n8}${n9}${d1}${d2}`;
}

export function formatarCPF(cpf: string): string {
  cpf = cpf.replace(/[^\d]/g, '');
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// CPFs válidos pré-gerados para testes
export const CPF_TESTES = {
  francisco: '59876913700', // Já existe e está validado
  maria: '12345678909',
  carlos: '98765432100',
  ana: '11144477735',
  pedro: '11122233396',
  joao: '30747782610', // Já existe no banco
  juliana: '52205200755',
  lucas: '00076323633',
  patricia: '40263020673',
  roberto: '51474442544'
};

// Validar todos os CPFs de teste
console.log('Validação dos CPFs de teste:');
Object.entries(CPF_TESTES).forEach(([nome, cpf]) => {
  const valido = validarCPF(cpf);
  console.log(`${nome}: ${cpf} - ${valido ? '✅' : '❌'}`);
});

