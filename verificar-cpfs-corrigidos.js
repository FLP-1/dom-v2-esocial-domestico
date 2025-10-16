// Função para validar CPF
function validarCPF(cpf) {
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digito1 = resto < 2 ? 0 : 11 - resto;
  
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digito2 = resto < 2 ? 0 : 11 - resto;
  
  return parseInt(cpf.charAt(9)) === digito1 && parseInt(cpf.charAt(10)) === digito2;
}

// CPFs corrigidos
const cpfsCorrigidos = [
  '61519377835', // Empregador
  '41918045020'  // Funcionário
];

console.log('✅ VERIFICAÇÃO DOS CPFs CORRIGIDOS:');
console.log('==================================');

cpfsCorrigidos.forEach((cpf, index) => {
  const isValid = validarCPF(cpf);
  const tipo = index === 0 ? 'Empregador' : 'Funcionário';
  
  console.log(`${tipo}: ${cpf}`);
  console.log(`Status: ${isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
  console.log('---');
});

console.log('\n🎯 RESUMO:');
console.log('==========');
console.log('🏢 Empregador: 61519377835 (CPF válido)');
console.log('👤 Funcionário: 41918045020 (CPF válido)');
console.log('📧 Email funcionário: joao.silva.teste@empresatestemodal.com.br');
console.log('🔑 Senha: 123456');
