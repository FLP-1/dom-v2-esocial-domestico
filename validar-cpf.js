function validateCpf(cpf) {
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

// Testar CPF do Francisco
const cpfFrancisco = '59876913700';
const isValid = validateCpf(cpfFrancisco);

console.log('=== TESTE DE VALIDAÇÃO DE CPF ===');
console.log('CPF:', cpfFrancisco);
console.log('Válido:', isValid ? '✅ SIM' : '❌ NÃO');

if (!isValid) {
  console.log('\n❌ PROBLEMA: CPF do Francisco não é válido!');
  console.log('Isso explica por que o login não funciona na interface.');
  console.log('A validação do CPF na página de login está rejeitando o CPF.');
} else {
  console.log('\n✅ CPF é válido, o problema deve estar na senha.');
}
