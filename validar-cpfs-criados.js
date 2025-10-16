// Função para validar CPF
function validarCPF(cpf) {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
  // Verifica se os dígitos verificadores estão corretos
  return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
}

// CPFs criados no script
const cpfs = [
  '11122233344', // Empregador
  '12345678902'  // Funcionário
];

console.log('🔍 VALIDAÇÃO DOS CPFs CRIADOS:');
console.log('================================');

cpfs.forEach((cpf, index) => {
  const isValid = validarCPF(cpf);
  const tipo = index === 0 ? 'Empregador' : 'Funcionário';
  
  console.log(`${tipo}: ${cpf}`);
  console.log(`Status: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  console.log('---');
});

// Gerar CPFs válidos se necessário
function gerarCPFValido() {
  // Gera 9 dígitos aleatórios
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  
  // Calcula primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  cpf += digito1;
  
  // Calcula segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  cpf += digito2;
  
  return cpf;
}

console.log('\n🎯 CPFs VÁLIDOS GERADOS:');
console.log('========================');
for (let i = 0; i < 3; i++) {
  const cpfValido = gerarCPFValido();
  console.log(`CPF ${i + 1}: ${cpfValido} ${validarCPF(cpfValido) ? '✅' : '❌'}`);
}
