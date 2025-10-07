/**
 * Script para criar massa de teste completa
 * Usuário Empregador: 59876913700
 * 2 Empregados com dados completos
 * 45 dias de registros de ponto
 * Documentos e uploads
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Dados do empregador
const EMPREGADOR_CPF = '59876913700';
const EMPREGADOR_SENHA = '123456'; // Senha padrão para teste

// Dados dos empregados
const EMPREGADOS = [
  {
    cpf: '12345678901',
    nome: 'João Silva Santos',
    email: 'joao.silva@empresa.com',
    telefone: '(11) 99999-1111',
    cargo: 'Desenvolvedor Senior',
    salario: 8500.00,
    dataAdmissao: new Date('2023-01-15'),
    endereco: {
      rua: 'Rua das Flores, 123',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567'
    }
  },
  {
    cpf: '98765432109',
    nome: 'Maria Oliveira Costa',
    email: 'maria.oliveira@empresa.com',
    telefone: '(11) 99999-2222',
    cargo: 'Analista de RH',
    salario: 6500.00,
    dataAdmissao: new Date('2023-03-20'),
    endereco: {
      rua: 'Avenida Paulista, 456',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01310-100'
    }
  }
];

// Tipos de documentos
const TIPOS_DOCUMENTOS = [
  'Atestado Médico',
  'Comprovante de Residência',
  'RG',
  'CPF',
  'Carteira de Trabalho',
  'Comprovante de Escolaridade',
  'Certificado de Curso',
  'Declaração de Imposto de Renda',
  'Comprovante de PIS',
  'Contrato de Trabalho'
];

// Status dos documentos
const STATUS_DOCUMENTOS = ['Pendente', 'Aprovado', 'Rejeitado', 'Em Análise'];

// Tipos de registro de ponto
const TIPOS_REGISTRO = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'];

// Horários típicos de trabalho
const HORARIOS_TRABALHO = {
  entrada: { hora: 8, minuto: 0 },
  saida_almoco: { hora: 12, minuto: 0 },
  retorno_almoco: { hora: 13, minuto: 0 },
  saida: { hora: 17, minuto: 0 }
};

async function criarEmpregador() {
  console.log('🏢 Criando dados do empregador...');
  
  const senhaHash = await bcrypt.hash(EMPREGADOR_SENHA, 10);
  
  const empregador = await prisma.usuario.create({
    data: {
      cpf: EMPREGADOR_CPF,
      nome: 'Empresa Teste LTDA',
      email: 'admin@empresateste.com',
      telefone: '(11) 3333-4444',
      senha: senhaHash,
      isEmpresa: true,
      empresaId: null,
      configuracaoEmpresa: {
        razaoSocial: 'Empresa Teste LTDA',
        cnpj: '12.345.678/0001-90',
        endereco: 'Rua Teste, 100 - Centro - São Paulo/SP',
        telefone: '(11) 3333-4444',
        email: 'contato@empresateste.com'
      }
    }
  });

  // Criar perfil de empregador
  await prisma.usuarioPerfil.create({
    data: {
      usuarioId: empregador.id,
      perfilId: 1, // Assumindo que 1 é o ID do perfil empregador
      ativo: true,
      dataAtivacao: new Date()
    }
  });

  console.log('✅ Empregador criado:', empregador.id);
  return empregador;
}

async function criarEmpregados(empregadorId) {
  console.log('👥 Criando dados dos empregados...');
  
  const empregados = [];
  
  for (const dados of EMPREGADOS) {
    const senhaHash = await bcrypt.hash('123456', 10);
    
    const empregado = await prisma.usuario.create({
      data: {
        cpf: dados.cpf,
        nome: dados.nome,
        email: dados.email,
        telefone: dados.telefone,
        senha: senhaHash,
        isEmpresa: false,
        empresaId: empregadorId,
        configuracaoEmpresa: {
          cargo: dados.cargo,
          salario: dados.salario,
          dataAdmissao: dados.dataAdmissao,
          endereco: dados.endereco
        }
      }
    });

    // Criar perfil de empregado
    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: empregado.id,
        perfilId: 2, // Assumindo que 2 é o ID do perfil empregado
        ativo: true,
        dataAtivacao: new Date()
      }
    });

    empregados.push(empregado);
    console.log(`✅ Empregado criado: ${dados.nome} (${empregado.id})`);
  }
  
  return empregados;
}

async function criarRegistrosPonto(empregados) {
  console.log('⏰ Criando registros de ponto (45 dias)...');
  
  const hoje = new Date();
  const registrosCriados = [];
  
  for (const empregado of empregados) {
    console.log(`📅 Criando registros para ${empregado.nome}...`);
    
    for (let dias = 0; dias < 45; dias++) {
      const data = new Date(hoje);
      data.setDate(data.getDate() - dias);
      
      // Pular fins de semana
      if (data.getDay() === 0 || data.getDay() === 6) continue;
      
      // Criar registros para cada tipo de ponto
      for (const tipo of TIPOS_REGISTRO) {
        const horario = HORARIOS_TRABALHO[tipo];
        const timestamp = new Date(data);
        timestamp.setHours(horario.hora, horario.minuto + Math.floor(Math.random() * 30), Math.floor(Math.random() * 60));
        
        // Adicionar variação nos horários
        const variacao = Math.floor(Math.random() * 20) - 10; // ±10 minutos
        timestamp.setMinutes(timestamp.getMinutes() + variacao);
        
        const registro = await prisma.registroPontoNovo.create({
          data: {
            usuarioId: empregado.id,
            tipo: tipo,
            timestamp: timestamp,
            latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
            longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
            precisao: Math.random() * 50 + 10,
            endereco: `Endereço ${tipo} - ${data.toLocaleDateString('pt-BR')}`,
            wifiName: `WiFi-Empresa-${Math.floor(Math.random() * 100)}`,
            observacao: `Registro automático de teste - ${tipo}`,
            ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
            userAgent: 'Mozilla/5.0 (Teste)',
            aprovado: Math.random() > 0.1, // 90% aprovados
            observacaoAprovacao: Math.random() > 0.1 ? null : 'Horário ajustado automaticamente'
          }
        });
        
        registrosCriados.push(registro);
      }
    }
    
    console.log(`✅ ${registrosCriados.length} registros criados para ${empregado.nome}`);
  }
  
  console.log(`✅ Total de registros criados: ${registrosCriados.length}`);
  return registrosCriados;
}

async function criarDocumentos(empregados) {
  console.log('📄 Criando documentos e uploads...');
  
  const documentosCriados = [];
  
  for (const empregado of empregados) {
    console.log(`📋 Criando documentos para ${empregado.nome}...`);
    
    // Criar múltiplos documentos para cada empregado
    for (let i = 0; i < 8; i++) {
      const tipoDocumento = TIPOS_DOCUMENTOS[Math.floor(Math.random() * TIPOS_DOCUMENTOS.length)];
      const status = STATUS_DOCUMENTOS[Math.floor(Math.random() * STATUS_DOCUMENTOS.length)];
      
      const documento = await prisma.documento.create({
        data: {
          usuarioId: empregado.id,
          tipo: tipoDocumento,
          nomeArquivo: `${tipoDocumento.replace(/\s+/g, '_')}_${empregado.nome.replace(/\s+/g, '_')}.pdf`,
          caminhoArquivo: `/uploads/documentos/${empregado.id}/${tipoDocumento.replace(/\s+/g, '_')}.pdf`,
          tamanhoArquivo: Math.floor(Math.random() * 5000000) + 100000, // 100KB a 5MB
          mimeType: 'application/pdf',
          status: status,
          observacao: `Documento ${tipoDocumento} de ${empregado.nome}`,
          dataUpload: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Últimos 30 dias
          dataAprovacao: status === 'Aprovado' ? new Date() : null,
          aprovadoPor: status === 'Aprovado' ? 1 : null // ID do empregador
        }
      });
      
      documentosCriados.push(documento);
    }
    
    console.log(`✅ 8 documentos criados para ${empregado.nome}`);
  }
  
  console.log(`✅ Total de documentos criados: ${documentosCriados.length}`);
  return documentosCriados;
}

async function criarDispositivos(empregados) {
  console.log('📱 Criando dispositivos...');
  
  const dispositivos = [];
  
  for (const empregado of empregados) {
    const dispositivo = await prisma.dispositivo.create({
      data: {
        usuarioId: empregado.id,
        nome: `${empregado.nome} - Smartphone`,
        tipo: 'mobile',
        modelo: 'Samsung Galaxy S21',
        sistemaOperacional: 'Android 12',
        versaoApp: '1.0.0',
        tokenNotificacao: `token_${empregado.id}_${Math.random().toString(36).substr(2, 9)}`,
        ativo: true,
        dataRegistro: new Date(),
        ultimaAtividade: new Date()
      }
    });
    
    dispositivos.push(dispositivo);
    console.log(`✅ Dispositivo criado para ${empregado.nome}`);
  }
  
  return dispositivos;
}

async function criarConfiguracoesSistema() {
  console.log('⚙️ Criando configurações do sistema...');
  
  const configuracoes = [
    { chave: 'sistema_senha_padrao', valor: '123456', descricao: 'Senha padrão para novos usuários' },
    { chave: 'empresa_razao_social', valor: 'Empresa Teste LTDA', descricao: 'Razão social da empresa' },
    { chave: 'empresa_cnpj', valor: '12.345.678/0001-90', descricao: 'CNPJ da empresa' },
    { chave: 'geolocalizacao_precisao_maxima', valor: '10', descricao: 'Precisão máxima da geolocalização em metros' },
    { chave: 'geolocalizacao_timeout', valor: '30000', descricao: 'Timeout da geolocalização em milissegundos' },
    { chave: 'empresa_cpf_principal', valor: EMPREGADOR_CPF, descricao: 'CPF principal da empresa para login' },
    { chave: 'horario_trabalho_inicio', valor: '08:00', descricao: 'Horário de início do trabalho' },
    { chave: 'horario_trabalho_fim', valor: '17:00', descricao: 'Horário de fim do trabalho' },
    { chave: 'tolerancia_atraso', valor: '15', descricao: 'Tolerância para atraso em minutos' }
  ];
  
  for (const config of configuracoes) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: config.chave },
      update: { valor: config.valor },
      create: config
    });
  }
  
  console.log('✅ Configurações do sistema criadas');
}

async function criarDadosRelacionados(empregador, empregados) {
  console.log('🔗 Criando dados relacionados...');
  
  // Criar configurações da empresa
  await prisma.configuracaoEmpresa.create({
    data: {
      usuarioId: empregador.id,
      cnpj: '12.345.678/0001-90',
      razaoSocial: 'Empresa Teste LTDA',
      nomeFantasia: 'Empresa Teste',
      endereco: 'Rua Teste, 100',
      bairro: 'Centro',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
      telefone: '(11) 3333-4444',
      email: 'contato@empresateste.com',
      site: 'https://www.empresateste.com.br',
      responsavel: empregador.nome,
      cargoResponsavel: 'Administrador',
      ativo: true
    }
  });
  
  console.log('✅ Dados relacionados criados');
}

async function main() {
  try {
    console.log('🚀 Iniciando criação da massa de teste...');
    
    // Limpar dados existentes (opcional) - ordem correta para evitar erros de FK
    console.log('🧹 Limpando dados existentes...');
    await prisma.registroPontoNovo.deleteMany({});
    await prisma.documento.deleteMany({});
    await prisma.tarefa.deleteMany({}); // Deletar tarefas primeiro
    await prisma.dispositivo.deleteMany({});
    await prisma.usuarioPerfil.deleteMany({});
    await prisma.configuracaoEmpresa.deleteMany({});
    await prisma.usuario.deleteMany({});
    
    // Criar dados
    const empregador = await criarEmpregador();
    const empregados = await criarEmpregados(empregador.id);
    await criarRegistrosPonto(empregados);
    await criarDocumentos(empregados);
    await criarDispositivos(empregados);
    await criarConfiguracoesSistema();
    await criarDadosRelacionados(empregador, empregados);
    
    console.log('\n🎉 MASSA DE TESTE CRIADA COM SUCESSO!');
    console.log('\n📊 RESUMO DOS DADOS CRIADOS:');
    console.log(`👤 Empregador: ${empregador.cpf} - ${empregador.nome}`);
    console.log(`👥 Empregados: ${empregados.length}`);
    console.log(`⏰ Registros de ponto: ~${45 * 2 * 4} (45 dias × 2 empregados × 4 tipos)`);
    console.log(`📄 Documentos: ${empregados.length * 8}`);
    console.log(`📱 Dispositivos: ${empregados.length}`);
    console.log(`⚙️ Configurações: 9`);
    
    console.log('\n🔑 CREDENCIAIS PARA TESTE:');
    console.log(`👤 Empregador: CPF ${EMPREGADOR_CPF} | Senha: ${EMPREGADOR_SENHA}`);
    empregados.forEach(emp => {
      console.log(`👤 Empregado: CPF ${emp.cpf} | Senha: 123456`);
    });
    
    console.log('\n✅ Sistema pronto para testes completos!');
    
  } catch (error) {
    console.error('❌ Erro ao criar massa de teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
