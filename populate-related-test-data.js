const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Gerador de CPF válido para testes
function gerarCPFValido() {
  function calcularDigito(cpf, posicoes) {
    let soma = 0;
    for (let i = 0; i < posicoes - 1; i++) {
      soma += parseInt(cpf.charAt(i)) * (posicoes - i);
    }
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }
  cpf += calcularDigito(cpf, 10);
  cpf += calcularDigito(cpf, 11);
  return cpf;
}

// Gerador de CNPJ válido para testes
function gerarCNPJValido() {
  function calcularDigitoCNPJ(cnpj, posicoes) {
    let soma = 0;
    let peso = 2;
    
    for (let i = posicoes - 1; i >= 0; i--) {
      soma += parseInt(cnpj.charAt(i)) * peso;
      peso = peso === 9 ? 2 : peso + 1;
    }
    
    let resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  }

  let cnpj = '';
  for (let i = 0; i < 12; i++) {
    cnpj += Math.floor(Math.random() * 10);
  }
  cnpj += calcularDigitoCNPJ(cnpj, 12);
  cnpj += calcularDigitoCNPJ(cnpj, 13);
  return cnpj;
}

async function populateRelatedTestData() {
  try {
    console.log('🧪 Populando dados de teste RELACIONADOS e COERENTES...');

    // ==========================================
    // 1. CRIAR USUÁRIOS PRINCIPAIS (COM RELACIONAMENTOS)
    // ==========================================
    console.log('👥 Criando usuários principais...');

    const senhaPadrao = await bcrypt.hash('senha123', 10);

    // Usuário 1: Empregador Principal
    const cpfEmpregador = gerarCPFValido();
    const empregador = await prisma.usuario.create({
      data: {
        cpf: cpfEmpregador,
        nomeCompleto: 'Carlos Eduardo Silva',
        email: `carlos.silva.${Date.now()}@empresateste.com`,
        telefone: '11987654321',
        dataNascimento: new Date('1980-05-15'),
        senhaHash: senhaPadrao,
        salt: 'salt123',
        ativo: true,
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.2.0',
      },
    });

    // Usuário 2: Funcionário
    const cpfFuncionario = gerarCPFValido();
    const funcionario = await prisma.usuario.create({
      data: {
        cpf: cpfFuncionario,
        nomeCompleto: 'Maria Oliveira Santos',
        email: `maria.santos.${Date.now()}@empresateste.com`,
        telefone: '11976543210',
        dataNascimento: new Date('1985-08-22'),
        senhaHash: senhaPadrao,
        salt: 'salt123',
        ativo: true,
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.2.0',
      },
    });

    // Usuário 3: Responsável Financeiro
    const cpfFinanceiro = gerarCPFValido();
    const responsavelFinanceiro = await prisma.usuario.create({
      data: {
        cpf: cpfFinanceiro,
        nomeCompleto: 'Ana Paula Costa',
        email: `ana.costa.${Date.now()}@empresateste.com`,
        telefone: '11965432109',
        dataNascimento: new Date('1982-12-10'),
        senhaHash: senhaPadrao,
        salt: 'salt123',
        ativo: true,
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.2.0',
      },
    });

    console.log('✅ Usuários principais criados!');

    // ==========================================
    // 2. CRIAR EMPRESA (RELACIONADA AOS USUÁRIOS)
    // ==========================================
    console.log('🏢 Criando empresa...');

    const empresa = await prisma.empregador.create({
      data: {
        nome: 'Empresa Teste Integrada LTDA',
        cpfCnpj: gerarCNPJValido(),
        email: 'contato@empresateste.com',
        telefone: '1133334444',
        logradouro: 'Rua das Empresas, 123',
        numero: '123',
        complemento: 'Sala 456',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
        ativo: true,
      },
    });

    console.log('✅ Empresa criada!');

    // ==========================================
    // 3. CRIAR PERFIS (RELACIONADOS AOS USUÁRIOS)
    // ==========================================
    console.log('👤 Criando perfis...');

    // Perfil Empregador
    const perfilEmpregador = await prisma.perfil.upsert({
      where: { codigo: 'EMPREGADOR' },
      update: {},
      create: {
        codigo: 'EMPREGADOR',
        nome: 'Empregador',
        descricao: 'Responsável pela empresa e funcionários',
        cor: '#2E8B57',
        icone: '👔',
        ativo: true,
      },
    });

    // Perfil Funcionário
    const perfilFuncionario = await prisma.perfil.upsert({
      where: { codigo: 'FUNCIONARIO' },
      update: {},
      create: {
        codigo: 'FUNCIONARIO',
        nome: 'Funcionário',
        descricao: 'Colaborador da empresa',
        cor: '#4682B4',
        icone: '👷',
        ativo: true,
      },
    });

    // Perfil Família
    const perfilFamilia = await prisma.perfil.upsert({
      where: { codigo: 'FAMILIA' },
      update: {},
      create: {
        codigo: 'FAMILIA',
        nome: 'Família',
        descricao: 'Membro da família do usuário',
        cor: '#FF69B4',
        icone: '👨‍👩‍👧‍👦',
        ativo: true,
      },
    });

    // Perfil Financeiro
    const perfilFinanceiro = await prisma.perfil.upsert({
      where: { codigo: 'FINANCEIRO' },
      update: {},
      create: {
        codigo: 'FINANCEIRO',
        nome: 'Responsável Financeiro',
        descricao: 'Responsável pelas questões financeiras',
        cor: '#FF6347',
        icone: '💰',
        ativo: true,
      },
    });

    // ==========================================
    // 4. ASSOCIAR USUÁRIOS AOS PERFIS (CARLOS COM MÚLTIPLOS PERFIS)
    // ==========================================
    console.log('🔗 Associando usuários aos perfis...');

    // CARLOS - MÚLTIPLOS PERFIS (Empregador + Funcionário + Família)
    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: empregador.id,
        perfilId: perfilEmpregador.id,
        ativo: true,
      },
    });

    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: empregador.id,
        perfilId: perfilFuncionario.id,
        ativo: true,
      },
    });

    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: empregador.id,
        perfilId: perfilFamilia.id,
        ativo: true,
      },
    });

    // MARIA - Perfil Funcionário
    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: funcionario.id,
        perfilId: perfilFuncionario.id,
        ativo: true,
      },
    });

    // ANA - Perfil Financeiro
    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: responsavelFinanceiro.id,
        perfilId: perfilFinanceiro.id,
        ativo: true,
      },
    });

    console.log('✅ Perfis associados aos usuários!');

    // ==========================================
    // 5. CRIAR CERTIFICADOS DIGITAIS (RELACIONADOS AOS USUÁRIOS)
    // ==========================================
    console.log('🔐 Criando certificados digitais...');

    const certificadoEmpregador = await prisma.certificadoDigital.create({
      data: {
        nome: 'Carlos Eduardo Silva',
        tipo: 'A1',
        tipoDocumento: 'eCPF',
        cpfCnpjTitular: cpfEmpregador,
        nomeTitular: 'Carlos Eduardo Silva',
        numeroSerial: 'CERT123456789',
        emissor: 'Autoridade Certificadora Teste',
        dataEmissao: new Date('2024-01-01'),
        dataValidade: new Date('2025-12-31'),
        algoritmo: 'RSA',
        tamanhoChave: 2048,
        thumbprint: 'THUMB123456789',
        caminhoArquivo: '/certificados/certificado-carlos.pfx',
        nomeArquivoOriginal: 'certificado-carlos.pfx',
        tamanhoArquivo: 4096,
        hashArquivo: 'HASH123456789',
        senhaHash: 'hash_senha_certificado_carlos',
        senhaSalt: 'salt_certificado',
        senhaAlgoritmo: 'AES-256-GCM',
        criptografiaIV: 'iv_certificado',
        ativo: true,
        usuarioId: empregador.id,
      },
    });

    const certificadoFuncionario = await prisma.certificadoDigital.create({
      data: {
        nome: 'Maria Oliveira Santos',
        tipo: 'A1',
        tipoDocumento: 'eCPF',
        cpfCnpjTitular: cpfFuncionario,
        nomeTitular: 'Maria Oliveira Santos',
        numeroSerial: 'CERT987654321',
        emissor: 'Autoridade Certificadora Teste',
        dataEmissao: new Date('2024-02-01'),
        dataValidade: new Date('2025-11-30'),
        algoritmo: 'RSA',
        tamanhoChave: 2048,
        thumbprint: 'THUMB987654321',
        caminhoArquivo: '/certificados/certificado-maria.pfx',
        nomeArquivoOriginal: 'certificado-maria.pfx',
        tamanhoArquivo: 4096,
        hashArquivo: 'HASH987654321',
        senhaHash: 'hash_senha_certificado_maria',
        senhaSalt: 'salt_certificado',
        senhaAlgoritmo: 'AES-256-GCM',
        criptografiaIV: 'iv_certificado',
        ativo: true,
        usuarioId: funcionario.id,
      },
    });

    console.log('✅ Certificados digitais criados!');

    // ==========================================
    // 6. CRIAR MEMBROS DA FAMÍLIA (RELACIONADOS AOS USUÁRIOS)
    // ==========================================
    console.log('👨‍👩‍👧‍👦 Criando membros da família...');

    await prisma.membroFamilia.create({
      data: {
        usuarioId: empregador.id,
        nome: 'João Silva (Filho)',
        parentesco: 'FILHO',
        cpf: gerarCPFValido(),
        dataNascimento: new Date('2010-03-15'),
        telefone: '11987654322',
        email: 'joao.filho@familia.com',
        contatoEmergencia: true,
        responsavelFinanceiro: false,
      },
    });

    await prisma.membroFamilia.create({
      data: {
        usuarioId: empregador.id,
        nome: 'Silvia Silva (Esposa)',
        parentesco: 'ESPOSA',
        cpf: gerarCPFValido(),
        dataNascimento: new Date('1983-07-20'),
        telefone: '11987654323',
        email: 'silvia.esposa@familia.com',
        contatoEmergencia: true,
        responsavelFinanceiro: true,
      },
    });

    await prisma.membroFamilia.create({
      data: {
        usuarioId: funcionario.id,
        nome: 'Pedro Santos (Pai)',
        parentesco: 'PAI',
        cpf: gerarCPFValido(),
        dataNascimento: new Date('1960-04-12'),
        telefone: '11976543211',
        email: 'pedro.pai@familia.com',
        contatoEmergencia: true,
        responsavelFinanceiro: false,
      },
    });

    console.log('✅ Membros da família criados!');

    // ==========================================
    // 7. CRIAR FOLHA DE PAGAMENTO (RELACIONADA AOS USUÁRIOS)
    // ==========================================
    console.log('💰 Criando folha de pagamento...');

    await prisma.folhaPagamento.create({
      data: {
        usuarioId: empregador.id,
        empregadoId: funcionario.id,
        mes: 1,
        ano: 2024,
        salarioBase: 3500.0,
        horasTrabalhadas: 220,
        horasExtras: 20,
        faltas: 0,
        atestados: 2,
        descontos: 450.0,
        adicionais: 200.0,
        salarioLiquido: 3250.0,
        status: 'PROCESSADO',
        observacoes: 'Folha de pagamento de janeiro/2024 - Maria Oliveira Santos',
      },
    });

    await prisma.folhaPagamento.create({
      data: {
        usuarioId: empregador.id,
        empregadoId: empregador.id,
        mes: 1,
        ano: 2024,
        salarioBase: 8000.0,
        horasTrabalhadas: 220,
        horasExtras: 0,
        faltas: 0,
        atestados: 0,
        descontos: 1200.0,
        adicionais: 1000.0,
        salarioLiquido: 7800.0,
        status: 'PROCESSADO',
        observacoes: 'Folha de pagamento de janeiro/2024 - Carlos Eduardo Silva',
      },
    });

    console.log('✅ Folha de pagamento criada!');

    // ==========================================
    // 8. CRIAR GUIAS DE IMPOSTOS (RELACIONADAS AOS USUÁRIOS)
    // ==========================================
    console.log('📋 Criando guias de impostos...');

    await prisma.guiaImposto.create({
      data: {
        usuarioId: empregador.id,
        tipo: 'INSS',
        mes: 1,
        ano: 2024,
        valor: 450.0,
        vencimento: new Date('2024-02-15'),
        status: 'PAGO',
        observacoes: 'INSS janeiro/2024 - Empresa Teste Integrada LTDA',
      },
    });

    await prisma.guiaImposto.create({
      data: {
        usuarioId: empregador.id,
        tipo: 'FGTS',
        mes: 1,
        ano: 2024,
        valor: 280.0,
        vencimento: new Date('2024-02-07'),
        status: 'PAGO',
        observacoes: 'FGTS janeiro/2024 - Empresa Teste Integrada LTDA',
      },
    });

    console.log('✅ Guias de impostos criadas!');

    // ==========================================
    // 9. CRIAR NOTIFICAÇÕES (RELACIONADAS AOS USUÁRIOS)
    // ==========================================
    console.log('🔔 Criando notificações...');

    await prisma.notificacao.create({
      data: {
        usuarioId: empregador.id,
        tipo: 'info',
        titulo: 'Folha de pagamento processada',
        mensagem: 'A folha de pagamento de janeiro/2024 foi processada com sucesso.',
        categoria: 'folha_pagamento',
        prioridade: 'media',
        lida: false,
        enviada: true,
        dataEnvio: new Date(),
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    await prisma.notificacao.create({
      data: {
        usuarioId: funcionario.id,
        tipo: 'success',
        titulo: 'Comprovante de pagamento disponível',
        mensagem: 'Seu comprovante de pagamento de janeiro/2024 está disponível para download.',
        categoria: 'pagamento',
        prioridade: 'alta',
        lida: false,
        enviada: true,
        dataEnvio: new Date(),
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
      },
    });

    console.log('✅ Notificações criadas!');

    // ==========================================
    // 10. CRIAR ATIVIDADE RECENTE (RELACIONADA AOS USUÁRIOS)
    // ==========================================
    console.log('📈 Criando atividade recente...');

    await prisma.atividadeRecente.create({
      data: {
        tipo: 'success',
        titulo: 'Login realizado',
        descricao: 'Carlos Eduardo Silva fez login no sistema',
        usuarioId: empregador.id,
        dados: {
          ip: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
          timestamp: new Date().toISOString(),
        },
      },
    });

    await prisma.atividadeRecente.create({
      data: {
        tipo: 'info',
        titulo: 'Folha processada',
        descricao: 'Folha de pagamento de janeiro/2024 processada para Maria Oliveira Santos',
        usuarioId: empregador.id,
        dados: {
          funcionario: funcionario.nomeCompleto,
          valor: 3250.0,
          status: 'PROCESSADO',
        },
      },
    });

    console.log('✅ Atividade recente criada!');

    // ==========================================
    // 11. CRIAR CONFIGURAÇÕES DO SISTEMA (RELACIONADAS AOS DADOS)
    // ==========================================
    console.log('🔧 Criando configurações do sistema...');

    const configs = [
      {
        chave: 'empresa_teste_cnpj',
        valor: empresa.cpfCnpj,
        tipo: 'string',
        descricao: 'CNPJ da empresa de teste integrada',
        categoria: 'empresa',
        editavel: false,
      },
      {
        chave: 'empregador_teste_cpf',
        valor: cpfEmpregador,
        tipo: 'string',
        descricao: 'CPF do empregador de teste',
        categoria: 'usuario',
        editavel: false,
      },
      {
        chave: 'funcionario_teste_cpf',
        valor: cpfFuncionario,
        tipo: 'string',
        descricao: 'CPF do funcionário de teste',
        categoria: 'usuario',
        editavel: false,
      },
      {
        chave: 'salario_base_teste',
        valor: '3500.0',
        tipo: 'number',
        descricao: 'Salário base usado nos testes',
        categoria: 'folha',
        editavel: true,
      },
    ];

    for (const config of configs) {
      await prisma.configuracaoSistema.create({
        data: config,
      });
    }

    console.log('✅ Configurações do sistema criadas!');

    // ==========================================
    // 12. CRIAR CONFIGURAÇÃO DE TESTE INTEGRADA
    // ==========================================
    console.log('🧪 Criando configuração de teste integrada...');

    await prisma.configuracaoTeste.create({
      data: {
        nome: 'Dados de Teste Integrados',
        descricao: 'Configuração com todos os dados relacionados e coerentes',
        dados: {
          usuarios: {
            empregador: {
              id: empregador.id,
              cpf: cpfEmpregador,
              nome: empregador.nomeCompleto,
              email: empregador.email,
              perfis: ['Empregador', 'Funcionário', 'Família'],
            },
            funcionario: {
              id: funcionario.id,
              cpf: cpfFuncionario,
              nome: funcionario.nomeCompleto,
              email: funcionario.email,
              perfis: ['Funcionário'],
            },
            responsavelFinanceiro: {
              id: responsavelFinanceiro.id,
              cpf: cpfFinanceiro,
              nome: responsavelFinanceiro.nomeCompleto,
              email: responsavelFinanceiro.email,
              perfis: ['Responsável Financeiro'],
            },
          },
          empresa: {
            id: empresa.id,
            nome: empresa.nome,
            cnpj: empresa.cpfCnpj,
            email: empresa.email,
          },
          certificados: {
            empregador: {
              cpf: cpfEmpregador,
              arquivo: 'certificado-carlos.pfx',
              serial: 'CERT123456789',
            },
            funcionario: {
              cpf: cpfFuncionario,
              arquivo: 'certificado-maria.pfx',
              serial: 'CERT987654321',
            },
          },
          relacionamentos: {
            familiares: [
              { usuario: 'Carlos', membros: ['João Silva (Filho)', 'Silvia Silva (Esposa)'] },
              { usuario: 'Maria', membros: ['Pedro Santos (Pai)'] },
            ],
            folhaPagamento: {
              mes: 1,
              ano: 2024,
              funcionarios: ['Maria Oliveira Santos', 'Carlos Eduardo Silva'],
            },
            impostos: ['INSS', 'FGTS'],
            notificacoes: ['Folha processada', 'Comprovante disponível'],
          },
        },
      },
    });

    console.log('✅ Configuração de teste integrada criada!');

    console.log('🎉 Dados de teste RELACIONADOS criados com sucesso!');
    console.log('📊 Resumo dos relacionamentos:');
    console.log('   👥 3 usuários com perfis específicos');
    console.log('   🔄 CARLOS tem 3 perfis: Empregador + Funcionário + Família');
    console.log('   👷 MARIA tem 1 perfil: Funcionário');
    console.log('   💰 ANA tem 1 perfil: Responsável Financeiro');
    console.log('   🏢 1 empresa vinculada aos usuários');
    console.log('   🔐 2 certificados digitais (empregador e funcionário)');
    console.log('   👨‍👩‍👧‍👦 3 membros da família (filho, esposa, pai)');
    console.log('   💰 2 folhas de pagamento (funcionário e empregador)');
    console.log('   📋 2 guias de impostos (INSS e FGTS)');
    console.log('   🔔 2 notificações relacionadas aos usuários');
    console.log('   📈 2 atividades recentes');
    console.log('   🔧 4 configurações do sistema');
    console.log('   🧪 1 configuração de teste integrada');
    console.log('');
    console.log('🔗 TODOS os dados conversam entre si de forma lógica e coerente!');
    console.log('🎯 CARLOS é o usuário com múltiplos perfis para testar o modal!');

  } catch (error) {
    console.error('❌ Erro ao popular dados relacionados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateRelatedTestData();
