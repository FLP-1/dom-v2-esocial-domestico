/**
 * Script para validar CPFs
 */

function validarCPF(cpf) {
  // Remove pontos e traços
  cpf = cpf.replace(/[^\d]/g, '');
  
  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) {
    return false;
  }
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  
  // Validação do primeiro dígito
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = resto < 2 ? 0 : resto;
  
  if (parseInt(cpf.charAt(9)) !== dv1) {
    return false;
  }
  
  // Validação do segundo dígito
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = resto < 2 ? 0 : resto;
  
  if (parseInt(cpf.charAt(10)) !== dv2) {
    return false;
  }
  
  return true;
}

function gerarCPFValido() {
  let cpf = '';
  
  // Gera os primeiros 9 dígitos
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  
  // Calcula o primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let dv1 = resto < 2 ? 0 : resto;
  cpf += dv1;
  
  // Calcula o segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let dv2 = resto < 2 ? 0 : resto;
  cpf += dv2;
  
  return cpf;
}

// CPFs usados na massa de teste
const cpfs = [
  '59876913700', // Empregador
  '12345678901', // Empregado 1
  '98765432109'  // Empregado 2
];

console.log('🔍 VALIDAÇÃO DE CPFs DA MASSA DE TESTE:');
console.log('=====================================');

cpfs.forEach((cpf, index) => {
  const valido = validarCPF(cpf);
  const status = valido ? '✅ VÁLIDO' : '❌ INVÁLIDO';
  const tipo = index === 0 ? 'Empregador' : `Empregado ${index}`;
  
  console.log(`${tipo}: ${cpf} - ${status}`);
});

console.log('\n🔧 GERANDO CPFs VÁLIDOS ALTERNATIVOS:');
console.log('=====================================');

// Gerar CPFs válidos alternativos
const cpfsValidos = [
  gerarCPFValido(),
  gerarCPFValido(),
  gerarCPFValido()
];

cpfsValidos.forEach((cpf, index) => {
  const tipo = index === 0 ? 'Empregador' : `Empregado ${index}`;
  console.log(`${tipo}: ${cpf} - ✅ VÁLIDO`);
});

console.log('\n📋 RECOMENDAÇÃO:');
console.log('Se os CPFs atuais forem inválidos, use os CPFs válidos gerados acima.');
