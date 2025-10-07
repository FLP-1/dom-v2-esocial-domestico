/**
 * Script simplificado para criar massa de teste
 * Não limpa dados existentes, apenas adiciona novos
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Dados do empregador
const EMPREGADOR_CPF = '59876913700';
const EMPREGADOR_SENHA = '123456';

// Dados dos empregados
const EMPREGADOS = [
  {
    cpf: '12345678901',
    nome: 'João Silva Santos',
    email: 'joao.silva@empresa.com',
    telefone: '(11) 99999-1111',
    cargo: 'Desenvolvedor Senior',
    salario: 8500.00,
    dataAdmissao: new Date('2023-01-15')
  },
  {
    cpf: '98765432109',
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@empresa.com',
    telefone: '(11) 99999-2222',
    cargo: 'Analista de RH',
    salario: 6500.00,
    dataAdmissao: new Date('2023-03-20')
  }
];

async function verificarEmpregador() {
  const empregador = await prisma.usuario.findUnique({
    where: { cpf: EMPREGADOR_CPF }
  });
  
  if (empregador) {
    console.log('✅ Empregador já existe:', empregador.nomeCompleto);
    return empregador;
  }
  
  console.log('🏢 Criando empregador...');
  const senhaHash = await bcrypt.hash(EMPREGADOR_SENHA, 10);
  
  const novoEmpregador = await prisma.usuario.create({
    data: {
      cpf: EMPREGADOR_CPF,
      nomeCompleto: 'Empresa Teste LTDA',
      apelido: 'Admin',
      dataNascimento: new Date('1990-01-01'),
      email: 'admin@empresateste.com',
      telefone: '1133334444',
      senhaHash: senhaHash,
      salt: 'salt123',
      ativo: true,
      emailVerificado: true,
      telefoneVerificado: true
    }
  });
  
  console.log('✅ Empregador criado:', novoEmpregador.id);
  return novoEmpregador;
}

async function verificarEmpregados(empregadorId) {
  const empregados = [];
  
  for (const dados of EMPREGADOS) {
    let empregado = await prisma.usuario.findUnique({
      where: { cpf: dados.cpf }
    });
    
    if (empregado) {
      console.log('✅ Empregado já existe:', empregado.nomeCompleto);
      empregados.push(empregado);
      continue;
    }
    
    console.log(`👤 Criando empregado: ${dados.nome}...`);
    const senhaHash = await bcrypt.hash('123456', 10);
    
    empregado = await prisma.usuario.create({
      data: {
        cpf: dados.cpf,
        nomeCompleto: dados.nome,
        apelido: dados.nome.split(' ')[0],
        dataNascimento: new Date('1985-01-15'),
        email: dados.email,
        telefone: dados.telefone.replace(/\D/g, ''),
        senhaHash: senhaHash,
        salt: 'salt123',
        ativo: true,
        emailVerificado: true,
        telefoneVerificado: true
      }
    });
    
    empregados.push(empregado);
    console.log('✅ Empregado criado:', empregado.id);
  }
  
  return empregados;
}

async function criarRegistrosPonto(empregados) {
  console.log('⏰ Criando registros de ponto...');
  
  const hoje = new Date();
  let totalRegistros = 0;
  
  for (const empregado of empregados) {
    console.log(`📅 Criando registros para ${empregado.nomeCompleto}...`);
    
    // Verificar se já tem registros
    const registrosExistentes = await prisma.registroPontoNovo.count({
      where: { usuarioId: empregado.id }
    });
    
    if (registrosExistentes > 0) {
      console.log(`✅ Empregado ${empregado.nomeCompleto} já tem ${registrosExistentes} registros`);
      totalRegistros += registrosExistentes;
      continue;
    }
    
    const tiposRegistro = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'];
    const horarios = {
      entrada: { hora: 8, minuto: 0 },
      saida_almoco: { hora: 12, minuto: 0 },
      retorno_almoco: { hora: 13, minuto: 0 },
      saida: { hora: 17, minuto: 0 }
    };
    
    for (let dias = 0; dias < 30; dias++) { // 30 dias para ser mais rápido
      const data = new Date(hoje);
      data.setDate(data.getDate() - dias);
      
      // Pular fins de semana
      if (data.getDay() === 0 || data.getDay() === 6) continue;
      
      for (const tipo of tiposRegistro) {
        const horario = horarios[tipo];
        const timestamp = new Date(data);
        timestamp.setHours(horario.hora, horario.minuto + Math.floor(Math.random() * 20) - 10);
        
        await prisma.registroPontoNovo.create({
          data: {
            usuarioId: empregado.id,
            tipo: tipo,
            dataHora: timestamp,
            latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
            precisao: Math.random() * 50 + 10,
            enderecoCompleto: `Endereço ${tipo} - ${data.toLocaleDateString('pt-BR')}`,
            nomeRedeWiFi: `WiFi-Empresa-${Math.floor(Math.random() * 100)}`,
            observacaoFuncionario: `Registro de teste - ${tipo}`,
            enderecoIP: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Teste)',
            aprovado: Math.random() > 0.1
          }
        });
        
        totalRegistros++;
      }
    }
    
    console.log(`✅ Registros criados para ${empregado.nomeCompleto}`);
  }
  
  console.log(`✅ Total de registros: ${totalRegistros}`);
}

async function criarDocumentos(empregados) {
  console.log('📄 Criando documentos...');
  
  const tiposDocumentos = [
    'Atestado Médico',
    'Comprovante de Residência',
    'RG',
    'CPF',
    'Carteira de Trabalho'
  ];
  
  let totalDocumentos = 0;
  
  for (const empregado of empregados) {
    console.log(`📋 Criando documentos para ${empregado.nomeCompleto}...`);
    
    // Verificar se já tem documentos
    const documentosExistentes = await prisma.documento.count({
      where: { usuarioId: empregado.id }
    });
    
    if (documentosExistentes > 0) {
      console.log(`✅ Empregado ${empregado.nomeCompleto} já tem ${documentosExistentes} documentos`);
      totalDocumentos += documentosExistentes;
      continue;
    }
    
    for (let i = 0; i < 5; i++) {
      const tipo = tiposDocumentos[i];
      
      await prisma.documento.create({
        data: {
          usuarioId: empregado.id,
          nome: `${tipo} - ${empregado.nomeCompleto}`,
          descricao: `Documento ${tipo} de ${empregado.nomeCompleto}`,
          tipo: tipo,
          categoria: 'RH',
          tamanho: Math.floor(Math.random() * 1000000) + 100000,
          caminhoArquivo: `/uploads/documentos/${empregado.id}/${tipo.replace(/\s+/g, '_')}.pdf`,
          validado: true,
          validadoEm: new Date(),
          validadoPor: 'Sistema',
          permissao: 'PRIVADO',
          tags: ['teste', 'documento', tipo.toLowerCase().replace(/\s+/g, '_')],
          esocialPronto: true
        }
      });
      
      totalDocumentos++;
    }
    
    console.log(`✅ Documentos criados para ${empregado.nomeCompleto}`);
  }
  
  console.log(`✅ Total de documentos: ${totalDocumentos}`);
}

async function criarConfiguracoes() {
  console.log('⚙️ Criando configurações...');
  
  const configuracoes = [
    { chave: 'sistema_senha_padrao', valor: '123456', categoria: 'sistema' },
    { chave: 'empresa_razao_social', valor: 'Empresa Teste LTDA', categoria: 'empresa' },
    { chave: 'empresa_cnpj', valor: '12.345.678/0001-90', categoria: 'empresa' },
    { chave: 'geolocalizacao_precisao_maxima', valor: '10', categoria: 'sistema' },
    { chave: 'geolocalizacao_timeout', valor: '30000', categoria: 'sistema' },
    { chave: 'empresa_cpf_principal', valor: EMPREGADOR_CPF, categoria: 'empresa' }
  ];
  
  for (const config of configuracoes) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor },
      create: {
        chave: config.chave,
        valor: config.valor,
        descricao: `Configuração ${config.chave}`,
        categoria: config.categoria,
        tipo: 'string',
        obrigatorio: true,
        visivel: true,
        editavel: true
      }
    });
  }
  
  console.log('✅ Configurações criadas');
}

async function main() {
  try {
    console.log('🚀 Iniciando criação da massa de teste...');
    
    const empregador = await verificarEmpregador();
    const empregados = await verificarEmpregados(empregador.id);
    await criarRegistrosPonto(empregados);
    await criarDocumentos(empregados);
    await criarConfiguracoes();
    
    console.log('\n🎉 MASSA DE TESTE CRIADA COM SUCESSO!');
    console.log('\n📊 RESUMO:');
    console.log(`👤 Empregador: ${empregador.cpf} - ${empregador.nomeCompleto}`);
    console.log(`👥 Empregados: ${empregados.length}`);
    
    console.log('\n🔑 CREDENCIAIS PARA TESTE:');
    console.log(`👤 Empregador: CPF ${EMPREGADOR_CPF} | Senha: ${EMPREGADOR_SENHA}`);
    empregados.forEach(emp => {
      console.log(`👤 Empregado: CPF ${emp.cpf} | Senha: 123456`);
    });
    
    console.log('\n✅ Sistema pronto para testes!');
    
  } catch (error) {
    console.error('❌ Erro ao criar massa de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
