/**
 * 🌱 Seed do Banco de Dados - Sistema DOM
 * 
 * Este arquivo popula o banco com dados iniciais
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ============================================
// 🔢 FUNÇÃO PARA GERAR CPF VÁLIDO
// ============================================
function gerarCPFValido(): string {
  // Gera 9 primeiros dígitos aleatórios
  const base = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10))
  
  // Calcula primeiro dígito verificador
  let soma = 0
  for (let i = 0; i < 9; i++) {
    soma += base[i] * (10 - i)
  }
  let digito1 = 11 - (soma % 11)
  digito1 = digito1 >= 10 ? 0 : digito1
  
  // Calcula segundo dígito verificador
  soma = 0
  for (let i = 0; i < 9; i++) {
    soma += base[i] * (11 - i)
  }
  soma += digito1 * 2
  let digito2 = 11 - (soma % 11)
  digito2 = digito2 >= 10 ? 0 : digito2
  
  return [...base, digito1, digito2].join('')
}

// CPFs válidos pré-gerados para os usuários principais
const CPF_FRANCISCO = '59876913700' // CPF real do empregador
const CPF_MARIA = '38645446880' // CPF válido gerado
const CPF_ADMIN = gerarCPFValido()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // ==========================================
  // 0️⃣ CONFIGURAÇÕES DO SISTEMA
  // ==========================================
  console.log('⚙️ Criando configurações do sistema...')
  
  // Configurações básicas do sistema
  const configuracoesSistema = [
    {
      chave: 'empresa_cpf_principal',
      valor: CPF_FRANCISCO,
      descricao: 'CPF principal da empresa',
      categoria: 'empresa',
      tipo: 'string',
      obrigatorio: true,
      validacao: '^[0-9]{11}$'
    },
    {
      chave: 'empresa_nome',
      valor: 'FLP Business Strategy',
      descricao: 'Nome da empresa',
      categoria: 'empresa',
      tipo: 'string',
      obrigatorio: true
    },
    {
      chave: 'empresa_email',
      valor: 'contato@flpbusiness.com',
      descricao: 'Email principal da empresa',
      categoria: 'empresa',
      tipo: 'string',
      obrigatorio: true,
      validacao: '^[^@]+@[^@]+\\.[^@]+$'
    },
    {
      chave: 'empresa_telefone',
      valor: '11999999999',
      descricao: 'Telefone principal da empresa',
      categoria: 'empresa',
      tipo: 'string',
      obrigatorio: true
    },
    {
      chave: 'sistema_url_base',
      valor: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      descricao: 'URL base do sistema',
      categoria: 'sistema',
      tipo: 'string',
      obrigatorio: true
    },
    {
      chave: 'esocial_ambiente_padrao',
      valor: 'homologacao',
      descricao: 'Ambiente padrão do eSocial',
      categoria: 'integracao',
      tipo: 'string',
      obrigatorio: true,
      valoresPermitidos: JSON.stringify(['homologacao', 'producao'])
    },
          {
            chave: 'geocoding_precisao_casas',
            valor: '11',
            descricao: 'Número de casas decimais para precisão de geolocalização',
            categoria: 'sistema',
            tipo: 'number',
            obrigatorio: true
          },
          {
            chave: 'geolocalizacao_precisao_maxima',
            valor: '10',
            descricao: 'Precisão máxima aceitável em metros para geolocalização',
            categoria: 'sistema',
            tipo: 'number',
            obrigatorio: true
          },
          {
            chave: 'geolocalizacao_timeout',
            valor: '30000',
            descricao: 'Timeout em milissegundos para captura de geolocalização',
            categoria: 'sistema',
            tipo: 'number',
            obrigatorio: true
          },
          {
            chave: 'autenticacao_tempo_sessao',
            valor: '86400',
            descricao: 'Tempo de sessão em segundos (24 horas)',
            categoria: 'sistema',
            tipo: 'number',
            obrigatorio: true
          },
          {
            chave: 'sistema_senha_padrao',
            valor: 'senha123',
            descricao: 'Senha padrão do sistema para desenvolvimento',
            categoria: 'sistema',
            tipo: 'string',
            obrigatorio: false
          },
          {
            chave: 'empresa_razao_social',
            valor: 'FLP Business Strategy',
            descricao: 'Razão social da empresa',
            categoria: 'empresa',
            tipo: 'string',
            obrigatorio: true
          },
          {
            chave: 'empresa_cnpj',
            valor: '',
            descricao: 'CNPJ da empresa (vazio para pessoa física)',
            categoria: 'empresa',
            tipo: 'string',
            obrigatorio: false
          }
  ];

  for (const config of configuracoesSistema) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: config.chave },
      update: config,
      create: config
    });
  }

  // ==========================================
  // 1️⃣ PERFIS
  // ==========================================
  console.log('📋 Criando perfis...')

  const perfilEmpregado = await prisma.perfil.upsert({
    where: { codigo: 'EMPREGADO' },
    update: {},
    create: {
      codigo: 'EMPREGADO',
      nome: 'Empregado',
      descricao: 'Empregado doméstico com acesso a funcionalidades de trabalho',
      cor: '#29ABE2',
      icone: 'worker',
      ativo: true,
    },
  })

  const perfilEmpregador = await prisma.perfil.upsert({
    where: { codigo: 'EMPREGADOR' },
    update: {},
    create: {
      codigo: 'EMPREGADOR',
      nome: 'Empregador',
      descricao: 'Empregador com acesso a gestão completa',
      cor: '#2E8B57',
      icone: 'business',
      ativo: true,
    },
  })

  const perfilFamilia = await prisma.perfil.upsert({
    where: { codigo: 'FAMILIA' },
    update: {},
    create: {
      codigo: 'FAMILIA',
      nome: 'Família',
      descricao: 'Familiar com acesso a funcionalidades domésticas',
      cor: '#9B59B6',
      icone: 'family',
      ativo: true,
    },
  })

  const perfilAdmin = await prisma.perfil.upsert({
    where: { codigo: 'ADMIN' },
    update: {},
    create: {
      codigo: 'ADMIN',
      nome: 'Administrador Técnico',
      descricao: 'Administrador técnico do sistema',
      cor: '#6B7280',
      icone: 'admin',
      ativo: true,
    },
  })

  const perfilFuncionario = await prisma.perfil.upsert({
    where: { codigo: 'FUNCIONARIO' },
    update: {},
    create: {
      codigo: 'FUNCIONARIO',
      nome: 'Funcionário',
      descricao: 'Colaborador da empresa',
      cor: '#4682B4',
      icone: 'worker',
      ativo: true,
    },
  })

  const perfilFinanceiro = await prisma.perfil.upsert({
    where: { codigo: 'FINANCEIRO' },
    update: {},
    create: {
      codigo: 'FINANCEIRO',
      nome: 'Responsável Financeiro',
      descricao: 'Responsável pelas questões financeiras',
      cor: '#FF6347',
      icone: 'money',
      ativo: true,
    },
  })

  const perfilAdministrador = await prisma.perfil.upsert({
    where: { codigo: 'ADMINISTRADOR' },
    update: {},
    create: {
      codigo: 'ADMINISTRADOR',
      nome: 'Administrador (Dono)',
      descricao: 'Dono e idealizador do projeto',
      cor: '#000000',
      icone: 'owner',
      ativo: true,
    },
  })

  console.log('✅ Perfis criados!')

  // ==========================================
  // 2️⃣ FUNCIONALIDADES
  // ==========================================
  console.log('⚙️ Criando funcionalidades...')

  const funcionalidades = [
    {
      codigo: 'dashboard',
      nome: 'Dashboard',
      descricao: 'Dashboard personalizado por perfil',
      icone: 'home',
      rota: '/dashboard',
      ordem: 1,
    },
    {
      codigo: 'time-clock',
      nome: 'Controle de Ponto',
      descricao: 'Registro de ponto com geolocalização',
      icone: 'clock',
      rota: '/time-clock',
      ordem: 2,
    },
    {
      codigo: 'task-management',
      nome: 'Gestão de Tarefas',
      descricao: 'Criação e acompanhamento de tarefas',
      icone: 'checklist',
      rota: '/task-management',
      ordem: 3,
    },
    {
      codigo: 'document-management',
      nome: 'Gestão de Documentos',
      descricao: 'Upload e gestão de documentos',
      icone: 'document',
      rota: '/document-management',
      ordem: 4,
    },
    {
      codigo: 'communication',
      nome: 'Comunicação',
      descricao: 'Chat e mensagens entre usuários',
      icone: 'message',
      rota: '/communication',
      ordem: 5,
    },
    {
      codigo: 'shopping-management',
      nome: 'Gestão de Compras',
      descricao: 'Listas de compras e controle',
      icone: 'shopping',
      rota: '/shopping-management',
      ordem: 6,
    },
    {
      codigo: 'alert-management',
      nome: 'Gestão de Alertas',
      descricao: 'Alertas e notificações',
      icone: 'alert',
      rota: '/alert-management',
      ordem: 7,
    },
    {
      codigo: 'payroll-management',
      nome: 'Cálculos Salariais',
      descricao: 'Folha de pagamento e cálculos',
      icone: 'calculator',
      rota: '/payroll-management',
      ordem: 8,
    },
    {
      codigo: 'loan-management',
      nome: 'Empréstimos',
      descricao: 'Gestão de empréstimos',
      icone: 'bank',
      rota: '/loan-management',
      ordem: 9,
    },
    {
      codigo: 'esocial',
      nome: 'eSocial Doméstico',
      descricao: 'Integração com eSocial',
      icone: 'government',
      rota: '/esocial-domestico-completo',
      ordem: 10,
    },
    {
      codigo: 'monitoring',
      nome: 'Monitoramento',
      descricao: 'Monitoramento e métricas',
      icone: 'dashboard',
      rota: '/monitoring-dashboard',
      ordem: 11,
    },
  ]

  const funcionalidadesCriadas = []
  for (const func of funcionalidades) {
    const funcionalidade = await prisma.funcionalidade.upsert({
      where: { codigo: func.codigo },
      update: {},
      create: func,
    })
    funcionalidadesCriadas.push(funcionalidade)
  }

  console.log('✅ Funcionalidades criadas!')

  // ==========================================
  // 3️⃣ PERMISSÕES (Perfil x Funcionalidade)
  // ==========================================
  console.log('🔐 Configurando permissões...')

  // EMPREGADO - Acesso limitado
  const permissoesEmpregado = [
    { funcCodigo: 'dashboard', leitura: true, escrita: false },
    { funcCodigo: 'time-clock', leitura: true, escrita: true }, // Pode registrar ponto
    { funcCodigo: 'task-management', leitura: true, escrita: true },
    { funcCodigo: 'document-management', leitura: true, escrita: true },
    { funcCodigo: 'communication', leitura: true, escrita: true },
  ]

  for (const perm of permissoesEmpregado) {
    const func = funcionalidadesCriadas.find(f => f.codigo === perm.funcCodigo)
    if (func) {
      await prisma.perfilFuncionalidade.upsert({
        where: {
          perfilId_funcionalidadeId: {
            perfilId: perfilEmpregado.id,
            funcionalidadeId: func.id,
          },
        },
        update: {},
        create: {
          perfilId: perfilEmpregado.id,
          funcionalidadeId: func.id,
          permissaoLeitura: perm.leitura,
          permissaoEscrita: perm.escrita,
          permissaoExclusao: false,
          permissaoAdmin: false,
        },
      })
    }
  }

  // EMPREGADOR - Acesso completo de gestão
  const permissoesEmpregador = [
    { funcCodigo: 'dashboard', leitura: true, escrita: true },
    { funcCodigo: 'time-clock', leitura: true, escrita: true },
    { funcCodigo: 'task-management', leitura: true, escrita: true },
    { funcCodigo: 'document-management', leitura: true, escrita: true },
    { funcCodigo: 'communication', leitura: true, escrita: true },
    { funcCodigo: 'shopping-management', leitura: true, escrita: true },
    { funcCodigo: 'alert-management', leitura: true, escrita: true },
    { funcCodigo: 'payroll-management', leitura: true, escrita: true },
    { funcCodigo: 'loan-management', leitura: true, escrita: true },
    { funcCodigo: 'esocial', leitura: true, escrita: true },
    { funcCodigo: 'monitoring', leitura: true, escrita: false },
  ]

  for (const perm of permissoesEmpregador) {
    const func = funcionalidadesCriadas.find(f => f.codigo === perm.funcCodigo)
    if (func) {
      await prisma.perfilFuncionalidade.upsert({
        where: {
          perfilId_funcionalidadeId: {
            perfilId: perfilEmpregador.id,
            funcionalidadeId: func.id,
          },
        },
        update: {},
        create: {
          perfilId: perfilEmpregador.id,
          funcionalidadeId: func.id,
          permissaoLeitura: perm.leitura,
          permissaoEscrita: perm.escrita,
          permissaoExclusao: true, // Empregador pode excluir
          permissaoAdmin: false,
        },
      })
    }
  }

  // FAMILIA - Acesso doméstico
  const permissoesFamilia = [
    { funcCodigo: 'dashboard', leitura: true, escrita: false },
    { funcCodigo: 'task-management', leitura: true, escrita: true },
    { funcCodigo: 'shopping-management', leitura: true, escrita: true },
    { funcCodigo: 'communication', leitura: true, escrita: true },
    { funcCodigo: 'alert-management', leitura: true, escrita: true },
  ]

  for (const perm of permissoesFamilia) {
    const func = funcionalidadesCriadas.find(f => f.codigo === perm.funcCodigo)
    if (func) {
      await prisma.perfilFuncionalidade.upsert({
        where: {
          perfilId_funcionalidadeId: {
            perfilId: perfilFamilia.id,
            funcionalidadeId: func.id,
          },
        },
        update: {},
        create: {
          perfilId: perfilFamilia.id,
          funcionalidadeId: func.id,
          permissaoLeitura: perm.leitura,
          permissaoEscrita: perm.escrita,
          permissaoExclusao: false,
          permissaoAdmin: false,
        },
      })
    }
  }

  // ADMIN - Acesso total
  for (const func of funcionalidadesCriadas) {
    await prisma.perfilFuncionalidade.upsert({
      where: {
        perfilId_funcionalidadeId: {
          perfilId: perfilAdmin.id,
          funcionalidadeId: func.id,
        },
      },
      update: {},
      create: {
        perfilId: perfilAdmin.id,
        funcionalidadeId: func.id,
        permissaoLeitura: true,
        permissaoEscrita: true,
        permissaoExclusao: true,
        permissaoAdmin: true,
      },
    })
  }

  console.log('✅ Permissões configuradas!')

  // ==========================================
  // 4️⃣ USUÁRIOS DE EXEMPLO
  // ==========================================
  console.log('👤 Criando usuários de exemplo...')

  const senhaPadrao = await bcrypt.hash('senha123', 10)

  // Usuário 1: Empregador
  const empregador = await prisma.usuario.upsert({
    where: { cpf: CPF_FRANCISCO },
    update: {},
    create: {
      cpf: CPF_FRANCISCO, // CPF VÁLIDO com dígito verificador
      nomeCompleto: 'Francisco Jose Lattari Papaleo',
      apelido: 'Francisco',
      dataNascimento: new Date('1975-05-15'),
      email: 'francisco@flpbusiness.com',
      emailVerificado: true,
      telefone: '11999999999', // Sem máscara
      telefoneVerificado: true,
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Sala 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567', // Sem máscara
      senhaHash: senhaPadrao,
      salt: 'salt123',
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      ativo: true,
    },
  })

  // Associar perfil de empregador
  await prisma.usuarioPerfil.upsert({
    where: {
      usuarioId_perfilId: {
        usuarioId: empregador.id,
        perfilId: perfilEmpregador.id,
      },
    },
    update: {},
    create: {
      usuarioId: empregador.id,
      perfilId: perfilEmpregador.id,
      avatar: 'FP',
      apelido: 'Francisco',
      ativo: true,
      principal: true,
    },
  })

  // Adicionar perfil de família para o Francisco (para testar modal)
  await prisma.usuarioPerfil.upsert({
    where: {
      usuarioId_perfilId: {
        usuarioId: empregador.id,
        perfilId: perfilFamilia.id,
      },
    },
    update: {},
    create: {
      usuarioId: empregador.id,
      perfilId: perfilFamilia.id,
      avatar: 'FP',
      apelido: 'Francisco',
      ativo: true,
      principal: false,
    },
  })

  // Usuário 2: Empregado
  const empregado = await prisma.usuario.upsert({
    where: { cpf: CPF_MARIA },
    update: {},
    create: {
      cpf: CPF_MARIA, // CPF VÁLIDO com dígito verificador
      nomeCompleto: 'Maria da Silva Santos',
      apelido: 'Maria',
      dataNascimento: new Date('1990-08-20'),
      email: 'maria.santos@email.com',
      emailVerificado: true,
      telefone: '11988888888',
      telefoneVerificado: true,
      logradouro: 'Rua das Palmeiras',
      numero: '456',
      bairro: 'Jardim das Flores',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '04567890',
      senhaHash: senhaPadrao,
      salt: 'salt456',
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: 'v2.1.0',
      ativo: true,
    },
  })

  // Associar perfil de empregado
  await prisma.usuarioPerfil.upsert({
    where: {
      usuarioId_perfilId: {
        usuarioId: empregado.id,
        perfilId: perfilEmpregado.id,
      },
    },
    update: {},
    create: {
      usuarioId: empregado.id,
      perfilId: perfilEmpregado.id,
      avatar: 'MS',
      apelido: 'Maria',
      ativo: true,
      principal: true,
    },
  })

  console.log('✅ Usuários criados!')

  // ==========================================
  // 5️⃣ TERMOS E POLÍTICAS
  // ==========================================
  console.log('📜 Criando termos...')

  await prisma.termo.upsert({
    where: { versao: 'v2.1.0' },
    update: {},
    create: {
      versao: 'v2.1.0',
      tipo: 'TERMOS_USO',
      titulo: 'Termos de Uso - Sistema DOM',
      conteudo: 'Conteúdo completo dos termos de uso...',
      ativo: true,
      dataVigencia: new Date('2024-01-01'),
      mudancas: [
        'Atualização de cláusulas LGPD',
        'Novos recursos de segurança',
        'Política de privacidade atualizada',
      ],
    },
  })

  console.log('✅ Termos criados!')

  // ==========================================
  // 6️⃣ CONFIGURAÇÕES INICIAIS
  // ==========================================
  console.log('⚙️ Criando configurações...')

  const configuracoes = [
    {
      chave: 'SISTEMA_VERSAO',
      valor: '2.2.1',
      tipo: 'STRING',
      descricao: 'Versão do sistema',
      categoria: 'SISTEMA',
    },
    {
      chave: 'ESOCIAL_AMBIENTE',
      valor: 'PRODUCAO',
      tipo: 'STRING',
      descricao: 'Ambiente eSocial (PRODUCAO ou HOMOLOGACAO)',
      categoria: 'ESOCIAL',
    },
    {
      chave: 'ESOCIAL_VERSAO',
      valor: 'S-1.3',
      tipo: 'STRING',
      descricao: 'Versão do eSocial',
      categoria: 'ESOCIAL',
    },
    {
      chave: 'SESSAO_TIMEOUT',
      valor: '3600000',
      tipo: 'NUMBER',
      descricao: 'Timeout da sessão em ms (1 hora)',
      categoria: 'SEGURANCA',
    },
    {
      chave: 'MAX_LOGIN_TENTATIVAS',
      valor: '5',
      tipo: 'NUMBER',
      descricao: 'Máximo de tentativas de login',
      categoria: 'SEGURANCA',
    },
    {
      chave: 'BACKUP_HABILITADO',
      valor: 'true',
      tipo: 'BOOLEAN',
      descricao: 'Backup automático habilitado',
      categoria: 'SISTEMA',
    },
  ]

  for (const config of configuracoes) {
    await prisma.configuracao.upsert({
      where: { chave: config.chave },
      update: {},
      create: config,
    })
  }

  console.log('✅ Configurações criadas!')

  // ==========================================
  // 7️⃣ MAIS USUÁRIOS DE TESTE (CPFs VÁLIDOS)
  // ==========================================
  console.log('👥 Criando mais usuários de teste...')
  
  const usuariosExtras = []
  const nomes = ['João', 'Ana', 'Pedro', 'Julia', 'Carlos', 'Fernanda']
  const sobrenomes = ['Silva', 'Santos', 'Oliveira', 'Costa', 'Souza', 'Lima']
  
  for (let i = 0; i < 6; i++) {
    const cpfValido = gerarCPFValido()
    const nome = `${nomes[i]} ${sobrenomes[i]}`
    
    const usuario = await prisma.usuario.create({
      data: {
        cpf: cpfValido,
        nomeCompleto: nome,
        apelido: nomes[i],
        dataNascimento: new Date(1980 + i * 5, i, 15),
        email: `${nomes[i].toLowerCase()}.${sobrenomes[i].toLowerCase()}@email.com`,
        emailVerificado: i % 2 === 0,
        telefone: `119${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
        telefoneVerificado: i % 3 === 0,
        logradouro: `Rua ${sobrenomes[i]}`,
        numero: String(100 + i * 10),
        bairro: 'Jardim América',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: String(Math.floor(Math.random() * 90000000) + 10000000).substring(0, 8),
        senhaHash: senhaPadrao,
        salt: `salt${i}`,
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.1.0',
        ativo: true,
      },
    })
    
    // Alternar perfis
    const perfil = i % 3 === 0 ? perfilEmpregador : i % 3 === 1 ? perfilEmpregado : perfilFamilia
    
    await prisma.usuarioPerfil.create({
      data: {
        usuarioId: usuario.id,
        perfilId: perfil.id,
        avatar: nomes[i].substring(0, 2).toUpperCase(),
        apelido: nomes[i],
        ativo: true,
        principal: true,
      },
    })
    
    usuariosExtras.push(usuario)
  }
  
  console.log(`✅ ${usuariosExtras.length} usuários extras criados!`)

  // ==========================================
  // 8️⃣ GRUPOS E MEMBROS
  // ==========================================
  console.log('👥 Criando grupos...')
  
  const grupoFamilia = await prisma.grupo.create({
    data: {
      nome: 'Família Papaleo',
      descricao: 'Grupo familiar principal',
      cor: '#FFD93D',
      icone: 'home',
      tipo: 'FAMILIAR',
      privado: false,
    },
  })
  
  // Adicionar membros ao grupo
  await prisma.usuarioGrupo.create({
    data: {
      usuarioId: empregador.id,
      grupoId: grupoFamilia.id,
      papel: 'ADMIN',
    },
  })
  
  for (let i = 0; i < 3; i++) {
    await prisma.usuarioGrupo.create({
      data: {
        usuarioId: usuariosExtras[i].id,
        grupoId: grupoFamilia.id,
        papel: i === 0 ? 'MODERADOR' : 'MEMBRO',
      },
    })
  }
  
  console.log('✅ Grupos criados!')

  // ==========================================
  // 9️⃣ DISPOSITIVOS
  // ==========================================
  console.log('📱 Criando dispositivos...')
  
  const todosUsuarios = [empregador, empregado, ...usuariosExtras]
  
  for (const usuario of todosUsuarios.slice(0, 5)) {
    await prisma.dispositivo.create({
      data: {
        usuarioId: usuario.id,
        dispositivoId: `device_${Math.random().toString(36).substring(7)}`,
        nome: `${usuario.apelido} - Smartphone`,
        modelo: ['iPhone 14', 'Samsung Galaxy S23', 'Xiaomi 13'][Math.floor(Math.random() * 3)],
        versaoSO: ['iOS 17', 'Android 14', 'Android 13'][Math.floor(Math.random() * 3)],
        tipo: 'MOBILE',
        nomeRedeWiFi: 'Casa',
        enderecoIP: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        latitude: -23.55052 + (Math.random() * 0.1),
        longitude: -46.633308 + (Math.random() * 0.1),
        precisao: 10.5,
        confiavel: true,
      },
    })
  }
  
  console.log('✅ Dispositivos criados!')

  // ==========================================
  // 🔟 DOCUMENTOS
  // ==========================================
  console.log('📄 Criando documentos de exemplo...')
  
  const categorias = ['RG', 'CPF', 'CNH', 'COMPROVANTE_RESIDENCIA', 'CTPS']
  
  for (let i = 0; i < 15; i++) {
    await prisma.documento.create({
      data: {
        usuarioId: todosUsuarios[i % todosUsuarios.length].id,
        nome: `Documento ${categorias[i % categorias.length]} - ${i + 1}`,
        descricao: `Arquivo de ${categorias[i % categorias.length]}`,
        categoria: categorias[i % categorias.length],
        tipo: 'PDF',
        tamanho: Math.floor(Math.random() * 5000000),
        caminhoArquivo: `/uploads/documentos/doc_${i + 1}.pdf`,
        validado: i % 3 === 0,
        permissao: i % 2 === 0 ? 'PRIVADO' : 'COMPARTILHADO',
        tags: ['importante', 'pessoal'],
      },
    })
  }
  
  console.log('✅ Documentos criados!')

  // ==========================================
  // 1️⃣1️⃣ TAREFAS
  // ==========================================
  console.log('✅ Criando tarefas...')
  
  const prioridades = ['BAIXA', 'MEDIA', 'ALTA', 'URGENTE']
  const statusTarefa = ['PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA']
  
  for (let i = 0; i < 20; i++) {
    await prisma.tarefa.create({
      data: {
        titulo: `Tarefa ${i + 1}`,
        descricao: `Descrição detalhada da tarefa ${i + 1}`,
        prioridade: prioridades[i % prioridades.length],
        status: statusTarefa[i % statusTarefa.length],
        atribuidoPara: todosUsuarios[(i + 1) % todosUsuarios.length].id,
        criadoPor: todosUsuarios[i % todosUsuarios.length].id,
        dataVencimento: new Date(Date.now() + (i + 1) * 86400000),
        tags: ['trabalho', 'importante'],
        corLabel: ['#FF6B6B', '#4ECDC4', '#45B7D1'][i % 3],
      },
    })
  }
  
  console.log('✅ Tarefas criadas!')

  // ==========================================
  // 1️⃣2️⃣ PLANOS E ASSINATURAS
  // ==========================================
  console.log('💳 Criando planos de assinatura...')
  
  const planoFree = await prisma.planoAssinatura.create({
    data: {
      codigo: 'FREE',
      nome: 'Plano Gratuito',
      tagline: 'Ideal para começar',
      descricao: 'Recursos básicos para uso pessoal',
      precoMensal: 0,
      precoAnual: 0,
      recursos: ['1 usuário', '5 documentos', 'Suporte básico'],
      gratuito: true,
      ordem: 1,
    },
  })
  
  const planoBasico = await prisma.planoAssinatura.create({
    data: {
      codigo: 'BASIC',
      nome: 'Plano Básico',
      tagline: 'Para famílias pequenas',
      descricao: 'Recursos completos para uso familiar',
      precoMensal: 29.90,
      precoAnual: 299.00,
      descontoAnual: '17%',
      recursos: ['Até 5 usuários', 'Documentos ilimitados', 'Suporte prioritário'],
      popular: true,
      ordem: 2,
    },
  })
  
  await prisma.planoAssinatura.create({
    data: {
      codigo: 'PREMIUM',
      nome: 'Plano Premium',
      tagline: 'Para empresas',
      descricao: 'Todos os recursos + eSocial',
      precoMensal: 99.90,
      precoAnual: 999.00,
      descontoAnual: '17%',
      recursos: ['Usuários ilimitados', 'eSocial completo', 'Suporte 24/7'],
      recomendado: true,
      ordem: 3,
    },
  })
  
  // Criar assinaturas
  await prisma.assinatura.create({
    data: {
      usuarioId: empregador.id,
      planoId: planoBasico.id,
      tipoCobranca: 'MENSAL',
      status: 'ATIVA',
      inicioEm: new Date(),
      proximaCobrancaEm: new Date(Date.now() + 30 * 86400000),
      valorAtual: 29.90,
    },
  })
  
  console.log('✅ Planos e assinaturas criados!')

  // ==========================================
  // 1️⃣3️⃣ LISTAS DE COMPRAS
  // ==========================================
  console.log('🛒 Criando listas de compras...')
  
  const lista = await prisma.listaCompras.create({
    data: {
      usuarioId: empregador.id,
      nome: 'Compras do Mês',
      categoria: 'SUPERMERCADO',
      totalItens: 10,
      itensComprados: 3,
      valorEstimado: 500.00,
      ativa: true,
    },
  })
  
  const itens = [
    { nome: 'Arroz', quantidade: '2 kg', preco: 15.90, categoria: 'ALIMENTOS' },
    { nome: 'Feijão', quantidade: '1 kg', preco: 8.50, categoria: 'ALIMENTOS' },
    { nome: 'Macarrão', quantidade: '500g', preco: 4.90, categoria: 'ALIMENTOS' },
    { nome: 'Leite', quantidade: '2L', preco: 6.50, categoria: 'BEBIDAS' },
    { nome: 'Sabonete', quantidade: '4 un', preco: 8.00, categoria: 'HIGIENE' },
    { nome: 'Detergente', quantidade: '3 un', preco: 6.90, categoria: 'LIMPEZA' },
  ]
  
  for (let i = 0; i < itens.length; i++) {
    await prisma.itemCompra.create({
      data: {
        listaId: lista.id,
        ...itens[i],
        comprado: i < 3,
        ordem: i,
      },
    })
  }
  
  console.log('✅ Listas de compras criadas!')

  // ==========================================
  // 1️⃣4️⃣ ALERTAS
  // ==========================================
  console.log('🔔 Criando alertas...')
  
  for (let i = 0; i < 5; i++) {
    await prisma.alerta.create({
      data: {
        usuarioId: todosUsuarios[i % todosUsuarios.length].id,
        titulo: `Alerta ${i + 1}`,
        descricao: `Descrição do alerta ${i + 1}`,
        tipo: ['VENCIMENTO', 'PAGAMENTO', 'TAREFA'][i % 3],
        prioridade: ['BAIXA', 'MEDIA', 'ALTA'][i % 3],
        categoria: 'GERAL',
        status: i % 2 === 0 ? 'ATIVO' : 'RESOLVIDO',
        lido: i % 3 === 0,
        dataAlerta: new Date(Date.now() + i * 86400000),
        notificarEmail: i % 2 === 0,
        notificarPush: true,
      },
    })
  }
  
  console.log('✅ Alertas criados!')

  // ==========================================
  // 🏢 EMPREGADORES
  // ==========================================
  console.log('🏢 Criando empregadores...')

  const empregadorPrincipal = await prisma.empregador.upsert({
    where: { cpfCnpj: '59876913700' },
    update: {},
    create: {
      cpfCnpj: '59876913700',
      tipoInscricao: 'CPF',
      nome: 'FLP Business Strategy',
      razaoSocial: 'FLP Business Strategy',
      email: 'contato@flpbusiness.com',
      telefone: '11999999999',
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Sala 45',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01234567',
      ambienteESocial: 'HOMOLOGACAO',
      ativo: true,
    },
  })

  console.log('✅ Empregadores criados!')

  // ==========================================
  // 🔐 CERTIFICADOS DIGITAIS
  // ==========================================
  console.log('🔐 Criando certificados digitais...')

  // Importa funções de criptografia (simuladas para o seed)
  const crypto = await import('crypto')
  
  // Função para criptografar senha (simulada - no sistema real usa o serviço)
  function encryptPasswordForSeed(password: string) {
    const salt = crypto.randomBytes(64).toString('hex')
    const iv = crypto.randomBytes(16).toString('hex')
    const hash = crypto.createHash('sha256').update(password + salt).digest('hex')
    return { hash, salt, iv }
  }

  const { hash: senhaHash, salt: senhaSalt, iv: criptografiaIV } = encryptPasswordForSeed('456587')

  const certificadoPrincipal = await prisma.certificadoDigital.upsert({
    where: { numeroSerial: 'ECPF-A1-24940271-2024' },
    update: {},
    create: {
      empregadorId: empregadorPrincipal.id,
      nome: 'Certificado eCPF A1 - FLP Business Strategy',
      descricao: 'Certificado digital e-CPF A1 para assinatura de documentos eSocial',
      tipo: 'E_CPF_A1',
      tipoDocumento: 'CERTIFICADO_DIGITAL',
      cpfCnpjTitular: '24940271000',
      nomeTitular: 'FLP Business Strategy',
      numeroSerial: 'ECPF-A1-24940271-2024',
      emissor: 'Autoridade Certificadora',
      dataEmissao: new Date('2024-01-01'),
      dataValidade: new Date('2025-12-31'),
      algoritmo: 'RSA',
      tamanhoChave: 2048,
      thumbprint: crypto.createHash('sha1').update('certificado-flp-2024').digest('hex').toUpperCase(),
      caminhoArquivo: './certificados/eCPF A1 24940271 (senha 456587).pfx',
      nomeArquivoOriginal: 'eCPF A1 24940271 (senha 456587).pfx',
      tamanhoArquivo: 5120,
      hashArquivo: crypto.createHash('sha256').update('certificado-flp-2024').digest('hex'),
      senhaHash,
      senhaSalt,
      senhaAlgoritmo: 'AES-256-GCM',
      criptografiaIV,
      ativo: true,
      revogado: false,
      alertaVencimento: true,
      diasAntesAlerta: 30,
      consentimentoLGPD: true,
      dataConsentimentoLGPD: new Date(),
      ipCadastro: '127.0.0.1',
      usuarioCadastro: 'SISTEMA_SEED',
      observacoes: 'Certificado cadastrado automaticamente no seed inicial',
    },
  })

  // Registra o histórico de criação
  await prisma.certificadoHistorico.create({
    data: {
      certificadoId: certificadoPrincipal.id,
      acao: 'CRIACAO',
      descricao: 'Certificado cadastrado automaticamente pelo seed do sistema',
      enderecoIP: '127.0.0.1',
      userAgent: 'Sistema/Seed',
      sucesso: true,
    },
  })

  console.log('✅ Certificados digitais criados!')
  console.log('   ⚠️  IMPORTANTE: A senha do certificado está CRIPTOGRAFADA no banco!')

  // ==========================================
  // 15️⃣ ESTATÍSTICAS DO SISTEMA
  // ==========================================
  console.log('📊 Criando estatísticas do sistema...')
  
  await prisma.estatisticaSistema.upsert({
    where: { chave: 'total_usuarios' },
    update: {},
    create: {
      chave: 'total_usuarios',
      valor: '0',
      descricao: 'Total de usuários cadastrados no sistema',
      categoria: 'usuarios',
      tipoDado: 'numero',
    },
  })

  await prisma.estatisticaSistema.upsert({
    where: { chave: 'usuarios_ativos' },
    update: {},
    create: {
      chave: 'usuarios_ativos',
      valor: '0',
      descricao: 'Usuários ativos no sistema',
      categoria: 'usuarios',
      tipoDado: 'numero',
    },
  })

  await prisma.estatisticaSistema.upsert({
    where: { chave: 'taxa_aceite_termos' },
    update: {},
    create: {
      chave: 'taxa_aceite_termos',
      valor: '95',
      descricao: 'Taxa de aceite dos termos de uso (%)',
      categoria: 'compliance',
      tipoDado: 'porcentagem',
    },
  })

  await prisma.estatisticaSistema.upsert({
    where: { chave: 'total_tarefas_concluidas' },
    update: {},
    create: {
      chave: 'total_tarefas_concluidas',
      valor: '0',
      descricao: 'Total de tarefas concluídas',
      categoria: 'produtividade',
      tipoDado: 'numero',
    },
  })

  console.log('✅ Estatísticas do sistema criadas!')

  // ==========================================
  // 16️⃣ MEMBROS DA FAMÍLIA
  // ==========================================
  console.log('👨‍👩‍👧‍👦 Criando membros da família...')
  
  const francisco = await prisma.usuario.findUnique({
    where: { cpf: CPF_FRANCISCO }
  })

  if (francisco) {
    // Cônjuge
    await prisma.membroFamilia.create({
      data: {
        usuarioId: francisco.id,
      nome: 'Maria Silva Lima',
      parentesco: 'CONJUGE',
      cpf: CPF_MARIA,
      dataNascimento: new Date('1985-03-15'),
      telefone: '11987654321',
      email: 'maria.silva@email.com',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
      },
      contatoEmergencia: true,
      responsavelFinanceiro: false,
      }
    })

    // Filho
    await prisma.membroFamilia.create({
      data: {
        usuarioId: francisco.id,
      nome: 'João Pedro Lima',
      parentesco: 'FILHO',
      dataNascimento: new Date('2010-07-20'),
      telefone: '11987654322',
      email: 'joao.pedro@email.com',
      endereco: {
        logradouro: 'Rua das Flores',
        numero: '123',
        complemento: 'Sala 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01234567',
      },
      contatoEmergencia: false,
      responsavelFinanceiro: false,
      }
    })
  }

  console.log('✅ Membros da família criados!')

  // ==========================================
  // 17️⃣ DADOS DE PÁGINAS
  // ==========================================
  console.log('📄 Criando dados de páginas...')
  
  await prisma.dadosPagina.upsert({
    where: { slug: 'home-dashboard' },
    update: {},
    create: {
      slug: 'home-dashboard',
      titulo: 'Dashboard Principal',
      conteudo: 'Bem-vindo ao Sistema DOM - Sua central de gestão doméstica',
      tipoPagina: 'DASHBOARD',
      categoria: 'PRINCIPAL',
      tags: ['dashboard', 'inicio', 'principal'],
      ativa: true,
      publica: false,
      versao: '1.0',
    },
  })

  await prisma.dadosPagina.upsert({
    where: { slug: 'sobre-sistema' },
    update: {},
    create: {
      slug: 'sobre-sistema',
      titulo: 'Sobre o Sistema DOM',
      conteudo: 'O Sistema DOM é uma plataforma completa para gestão doméstica, incluindo tarefas, documentos, finanças e muito mais.',
      tipoPagina: 'INFORMATIVO',
      categoria: 'SOBRE',
      tags: ['sobre', 'sistema', 'informacoes'],
      ativa: true,
      publica: true,
      versao: '1.0',
    },
  })

  console.log('✅ Dados de páginas criados!')

  // ==========================================
  // 18️⃣ NOTIFICAÇÕES INICIAIS
  // ==========================================
  console.log('🔔 Criando notificações iniciais...')
  
  if (francisco) {
    await prisma.notificacao.create({
      data: {
        usuarioId: francisco.id,
        tipo: 'INFO',
        titulo: 'Bem-vindo ao Sistema DOM!',
        mensagem: 'Seu acesso foi configurado com sucesso. Explore todas as funcionalidades disponíveis.',
        categoria: 'SISTEMA',
        prioridade: 'MEDIA',
        lida: false,
        enviada: true,
        dataEnvio: new Date(),
      },
    })

    await prisma.notificacao.create({
      data: {
        usuarioId: francisco.id,
        tipo: 'SUCCESS',
        titulo: 'Certificado Digital Configurado',
        mensagem: 'Seu certificado digital foi configurado e está pronto para uso nas integrações eSocial.',
        categoria: 'ESOCIAL',
        prioridade: 'ALTA',
        lida: false,
        enviada: true,
        dataEnvio: new Date(),
      },
    })
  }

  console.log('✅ Notificações iniciais criadas!')

  // Criar dados de folha de pagamento
  console.log('💰 Criando dados de folha de pagamento...')
  await prisma.folhaPagamento.create({
    data: {
      usuarioId: empregador.id,
      empregadoId: empregado.id,
      mes: 1,
      ano: 2024,
      salarioBase: 1500.0,
      horasTrabalhadas: 220,
      horasExtras: 0,
      faltas: 0,
      atestados: 0,
      descontos: 150.0,
      adicionais: 0,
      salarioLiquido: 1350.0,
      status: 'PROCESSADO',
      observacoes: 'Folha de pagamento de janeiro/2024',
    },
  })

  await prisma.folhaPagamento.create({
    data: {
      usuarioId: empregador.id,
      empregadoId: empregado.id,
      mes: 2,
      ano: 2024,
      salarioBase: 1500.0,
      horasTrabalhadas: 200,
      horasExtras: 20,
      faltas: 0,
      atestados: 0,
      descontos: 120.0,
      adicionais: 100.0,
      salarioLiquido: 1480.0,
      status: 'PROCESSADO',
      observacoes: 'Folha de pagamento de fevereiro/2024',
    },
  })
  console.log('✅ Dados de folha de pagamento criados!')

  // Criar guias de impostos
  console.log('📋 Criando guias de impostos...')
  await prisma.guiaImposto.create({
    data: {
      usuarioId: empregador.id,
      tipo: 'INSS',
      mes: 1,
      ano: 2024,
      valor: 150.0,
      vencimento: new Date('2024-02-15'),
      status: 'PAGO',
      observacoes: 'INSS janeiro/2024',
    },
  })

  await prisma.guiaImposto.create({
    data: {
      usuarioId: empregador.id,
      tipo: 'FGTS',
      mes: 1,
      ano: 2024,
      valor: 120.0,
      vencimento: new Date('2024-02-07'),
      status: 'PAGO',
      observacoes: 'FGTS janeiro/2024',
    },
  })

  await prisma.guiaImposto.create({
    data: {
      usuarioId: empregador.id,
      tipo: 'INSS',
      mes: 2,
      ano: 2024,
      valor: 160.0,
      vencimento: new Date('2024-03-15'),
      status: 'PENDENTE',
      observacoes: 'INSS fevereiro/2024',
    },
  })
  console.log('✅ Guias de impostos criadas!')

  // Criar métricas do sistema
  console.log('📊 Criando métricas do sistema...')
  await prisma.metricaSistema.upsert({
    where: { chave: 'eventos_enviados' },
    update: {},
    create: {
      chave: 'eventos_enviados',
      valor: 1250,
      descricao: 'Total de eventos eSocial enviados',
      categoria: 'esocial',
    },
  })

  await prisma.metricaSistema.upsert({
    where: { chave: 'eventos_processados' },
    update: {},
    create: {
      chave: 'eventos_processados',
      valor: 1180,
      descricao: 'Total de eventos eSocial processados',
      categoria: 'esocial',
    },
  })

  await prisma.metricaSistema.upsert({
    where: { chave: 'eventos_com_erro' },
    update: {},
    create: {
      chave: 'eventos_com_erro',
      valor: 15,
      descricao: 'Total de eventos eSocial com erro',
      categoria: 'esocial',
    },
  })

  await prisma.metricaSistema.upsert({
    where: { chave: 'webhooks_ativos' },
    update: {},
    create: {
      chave: 'webhooks_ativos',
      valor: 3,
      descricao: 'Total de webhooks ativos',
      categoria: 'webhook',
    },
  })

  await prisma.metricaSistema.upsert({
    where: { chave: 'backups_realizados' },
    update: {},
    create: {
      chave: 'backups_realizados',
      valor: 28,
      descricao: 'Total de backups realizados',
      categoria: 'backup',
    },
  })

  await prisma.metricaSistema.upsert({
    where: { chave: 'logs_auditoria' },
    update: {},
    create: {
      chave: 'logs_auditoria',
      valor: 15420,
      descricao: 'Total de logs de auditoria',
      categoria: 'auditoria',
    },
  })
  console.log('✅ Métricas do sistema criadas!')

  // Criar atividade recente
  console.log('📈 Criando atividade recente...')
  await prisma.atividadeRecente.create({
    data: {
      tipo: 'success',
      titulo: 'Evento S-2200 processado',
      descricao: 'Protocolo ESOCIAL-123456789',
      usuarioId: empregador.id,
      dados: {
        protocolo: 'ESOCIAL-123456789',
        evento: 'S-2200',
        status: 'processado',
      },
    },
  })

  await prisma.atividadeRecente.create({
    data: {
      tipo: 'warning',
      titulo: 'Webhook com falha',
      descricao: '3 tentativas falharam',
      usuarioId: empregador.id,
      dados: {
        webhookId: 'webhook_001',
        tentativas: 3,
        ultimoErro: 'Connection timeout',
      },
    },
  })

  await prisma.atividadeRecente.create({
    data: {
      tipo: 'success',
      titulo: 'Backup realizado',
      descricao: 'Backup completo - 2.5MB',
      usuarioId: empregador.id,
      dados: {
        tamanho: '2.5MB',
        tipo: 'completo',
        duracao: '15 minutos',
      },
    },
  })

  await prisma.atividadeRecente.create({
    data: {
      tipo: 'error',
      titulo: 'Erro no certificado',
      descricao: 'Certificado expirado',
      usuarioId: empregador.id,
      dados: {
        certificadoId: 'cert_001',
        dataExpiracao: '2024-01-15',
        diasRestantes: -5,
      },
    },
  })
  console.log('✅ Atividade recente criada!')

  // ==========================================
  // 🕐 DADOS DE TESTE PARA TIME-CLOCK
  // ==========================================
  console.log('🕐 Criando dados de teste para Time-Clock...')

  // Buscar usuários existentes
  const franciscoTimeClock = await prisma.usuario.findUnique({
    where: { email: 'francisco@flpbusiness.com' }
  })
  const mariaTimeClock = await prisma.usuario.findUnique({
    where: { email: 'maria@flpbusiness.com' }
  })

  if (franciscoTimeClock && mariaTimeClock) {
    // 1. Horários Oficiais
    const horariosOficiais = [
      { diaSemana: 1, entrada: '08:00', saida: '17:00', intervaloInicio: '12:00', intervaloFim: '13:00' }, // Segunda
      { diaSemana: 2, entrada: '08:00', saida: '17:00', intervaloInicio: '12:00', intervaloFim: '13:00' }, // Terça
      { diaSemana: 3, entrada: '08:00', saida: '17:00', intervaloInicio: '12:00', intervaloFim: '13:00' }, // Quarta
      { diaSemana: 4, entrada: '08:00', saida: '17:00', intervaloInicio: '12:00', intervaloFim: '13:00' }, // Quinta
      { diaSemana: 5, entrada: '08:00', saida: '17:00', intervaloInicio: '12:00', intervaloFim: '13:00' }, // Sexta
    ]

    for (const horario of horariosOficiais) {
      await prisma.horarioOficial.upsert({
        where: { 
          usuarioId_diaSemana: { 
            usuarioId: franciscoTimeClock.id, 
            diaSemana: horario.diaSemana 
          } 
        },
        update: horario,
        create: {
          ...horario,
          usuarioId: franciscoTimeClock.id,
        }
      })
    }

    // 2. Registros de Ponto de Exemplo (últimos 7 dias)
    const hoje = new Date()
    const registrosExemplo = []
    
    for (let i = 0; i < 7; i++) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      // Pular fins de semana
      if (data.getDay() === 0 || data.getDay() === 6) continue
      
      const diaSemana = data.getDay()
      const baseTime = new Date(data)
      baseTime.setHours(8, 0, 0, 0) // 08:00
      
      registrosExemplo.push(
        {
          usuarioId: franciscoTimeClock.id,
          dataHora: new Date(baseTime.getTime() + Math.random() * 1800000), // ±15 min
          tipo: 'entrada',
          latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
          longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
          enderecoCompleto: 'Rua das Flores, 123 - Vila Mariana, São Paulo - SP',
          nomeRedeWiFi: 'Empresa_WiFi_5G',
          enderecoIP: '192.168.1.100',
          aprovado: true,
          aprovadoPor: 'Sistema',
          aprovadoEm: new Date(),
        },
        {
          usuarioId: franciscoTimeClock.id,
          dataHora: new Date(baseTime.getTime() + 4 * 3600000 + Math.random() * 300000), // 12:00 ±5 min
          tipo: 'saida_almoco',
          latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
          longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
          enderecoCompleto: 'Rua das Flores, 123 - Vila Mariana, São Paulo - SP',
          nomeRedeWiFi: 'Empresa_WiFi_5G',
          enderecoIP: '192.168.1.100',
          aprovado: true,
          aprovadoPor: 'Sistema',
          aprovadoEm: new Date(),
        },
        {
          usuarioId: franciscoTimeClock.id,
          dataHora: new Date(baseTime.getTime() + 5 * 3600000 + Math.random() * 300000), // 13:00 ±5 min
          tipo: 'retorno_almoco',
          latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
          longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
          enderecoCompleto: 'Rua das Flores, 123 - Vila Mariana, São Paulo - SP',
          nomeRedeWiFi: 'Empresa_WiFi_5G',
          enderecoIP: '192.168.1.100',
          aprovado: true,
          aprovadoPor: 'Sistema',
          aprovadoEm: new Date(),
        },
        {
          usuarioId: franciscoTimeClock.id,
          dataHora: new Date(baseTime.getTime() + 9 * 3600000 + Math.random() * 1800000), // 17:00 ±15 min
          tipo: 'saida',
          latitude: -23.5505 + (Math.random() - 0.5) * 0.01,
          longitude: -46.6333 + (Math.random() - 0.5) * 0.01,
          enderecoCompleto: 'Rua das Flores, 123 - Vila Mariana, São Paulo - SP',
          nomeRedeWiFi: 'Empresa_WiFi_5G',
          enderecoIP: '192.168.1.100',
          aprovado: true,
          aprovadoPor: 'Sistema',
          aprovadoEm: new Date(),
        }
      )
    }

    // Inserir registros de ponto
    for (const registro of registrosExemplo) {
      await prisma.registroPontoNovo.create({
        data: registro
      })
    }

    // 3. Solicitações de Hora Extra de Exemplo
    const solicitacoesHoraExtra = [
      {
        usuarioId: francisco.id,
        dataHoraInicio: new Date(hoje.getTime() - 24 * 3600000), // Ontem
        dataHoraFim: new Date(hoje.getTime() - 24 * 3600000 + 2 * 3600000), // Ontem + 2h
        justificativa: 'Preciso finalizar o relatório mensal que está atrasado',
        status: 'APROVADO',
        aprovadoPor: 'Supervisor',
        aprovadoEm: new Date(hoje.getTime() - 20 * 3600000),
        observacoesAprovacao: 'Aprovado para finalizar as pendências',
        horasAprovadas: 2.0,
        valorHoraExtra: 25.50,
      },
      {
        usuarioId: francisco.id,
        dataHoraInicio: new Date(hoje.getTime() + 2 * 3600000), // Hoje + 2h
        dataHoraFim: new Date(hoje.getTime() + 4 * 3600000), // Hoje + 4h
        justificativa: 'Reunião importante com cliente que só pode ser feita após o horário normal',
        status: 'PENDENTE',
      },
    ]

    for (const solicitacao of solicitacoesHoraExtra) {
      await prisma.solicitacaoHoraExtra.create({
        data: solicitacao
      })
    }

    // 4. Resumos de Horas Trabalhadas (últimos 30 dias)
    for (let i = 0; i < 30; i++) {
      const data = new Date(hoje)
      data.setDate(data.getDate() - i)
      
      if (data.getDay() === 0 || data.getDay() === 6) continue // Pular fins de semana
      
      await prisma.resumoHorasTrabalhadas.upsert({
        where: {
          usuarioId_dataReferencia_periodo: {
            usuarioId: franciscoTimeClock.id,
            dataReferencia: data,
            periodo: 'DIA'
          }
        },
        update: {},
        create: {
          usuarioId: franciscoTimeClock.id,
          dataReferencia: data,
          periodo: 'DIA',
          horasTrabalhadas: 8.0 + Math.random() * 2, // 8-10 horas
          horasOficiais: 8.0,
          horasExtras: Math.random() * 2, // 0-2 horas extras
          horasExtrasAprovadas: Math.random() * 1.5,
          horasExtrasPendentes: Math.random() * 0.5,
          diferenca: Math.random() * 2,
          registrosPonto: 4,
          faltas: Math.random() > 0.95 ? 1 : 0,
          atrasos: Math.random() > 0.9 ? 1 : 0,
        }
      })
    }

    console.log('✅ Dados de teste para Time-Clock criados com sucesso!')
    console.log(`   📅 Horários oficiais: ${horariosOficiais.length}`)
    console.log(`   📝 Registros de ponto: ${registrosExemplo.length}`)
    console.log(`   ⏰ Solicitações hora extra: ${solicitacoesHoraExtra.length}`)
    console.log(`   📊 Resumos de horas: 30 dias`)
  }

  // ==========================================
  // ESTATÍSTICAS FINAIS
  // ==========================================
  const stats = {
    usuarios: await prisma.usuario.count(),
    perfis: await prisma.perfil.count(),
    funcionalidades: await prisma.funcionalidade.count(),
    grupos: await prisma.grupo.count(),
    dispositivos: await prisma.dispositivo.count(),
    documentos: await prisma.documento.count(),
    tarefas: await prisma.tarefa.count(),
    planos: await prisma.planoAssinatura.count(),
    assinaturas: await prisma.assinatura.count(),
    listas: await prisma.listaCompras.count(),
    itens: await prisma.itemCompra.count(),
    alertas: await prisma.alerta.count(),
    empregadores: await prisma.empregador.count(),
    certificados: await prisma.certificadoDigital.count(),
    historicoCertificados: await prisma.certificadoHistorico.count(),
    configuracoes: await prisma.configuracao.count(),
    estatisticas: await prisma.estatisticaSistema.count(),
    membrosFamilia: await prisma.membroFamilia.count(),
    dadosPaginas: await prisma.dadosPagina.count(),
    notificacoes: await prisma.notificacao.count(),
    folhaPagamento: await prisma.folhaPagamento.count(),
    guiasImpostos: await prisma.guiaImposto.count(),
    metricasSistema: await prisma.metricaSistema.count(),
    atividadeRecente: await prisma.atividadeRecente.count(),
    horariosOficiais: await prisma.horarioOficial.count(),
    registrosPontoNovos: await prisma.registroPontoNovo.count(),
    solicitacoesHoraExtra: await prisma.solicitacaoHoraExtra.count(),
    resumosHorasTrabalhadas: await prisma.resumoHorasTrabalhadas.count(),
    transferenciasFolha: await prisma.transferenciaFolha.count(),
  }

  console.log('\n╔════════════════════════════════════════════════╗')
  console.log('║        🎉 SEED CONCLUÍDO COM SUCESSO!         ║')
  console.log('╚════════════════════════════════════════════════╝\n')
  
  console.log('📊 ESTATÍSTICAS:')
  console.log(`   👤 Usuários: ${stats.usuarios}`)
  console.log(`   👔 Perfis: ${stats.perfis}`)
  console.log(`   ⚙️  Funcionalidades: ${stats.funcionalidades}`)
  console.log(`   👥 Grupos: ${stats.grupos}`)
  console.log(`   📱 Dispositivos: ${stats.dispositivos}`)
  console.log(`   📄 Documentos: ${stats.documentos}`)
  console.log(`   ✅ Tarefas: ${stats.tarefas}`)
  console.log(`   💳 Planos: ${stats.planos}`)
  console.log(`   📋 Assinaturas: ${stats.assinaturas}`)
  console.log(`   🛒 Listas de Compras: ${stats.listas}`)
  console.log(`   📦 Itens de Compra: ${stats.itens}`)
  console.log(`   🔔 Alertas: ${stats.alertas}`)
  console.log(`   🏢 Empregadores: ${stats.empregadores}`)
  console.log(`   🔐 Certificados Digitais: ${stats.certificados}`)
  console.log(`   📜 Histórico de Certificados: ${stats.historicoCertificados}`)
  console.log(`   ⚙️  Configurações: ${stats.configuracoes}`)
  console.log(`   📊 Estatísticas do Sistema: ${stats.estatisticas}`)
  console.log(`   👨‍👩‍👧‍👦 Membros da Família: ${stats.membrosFamilia}`)
  console.log(`   📄 Dados de Páginas: ${stats.dadosPaginas}`)
  console.log(`   🔔 Notificações: ${stats.notificacoes}`)
  console.log(`   💰 Folha de Pagamento: ${stats.folhaPagamento}`)
  console.log(`   📋 Guias de Impostos: ${stats.guiasImpostos}`)
  console.log(`   📊 Métricas do Sistema: ${stats.metricasSistema}`)
  console.log(`   📈 Atividade Recente: ${stats.atividadeRecente}`)
  console.log(`   🕐 Horários Oficiais: ${stats.horariosOficiais}`)
  console.log(`   📝 Registros de Ponto Novos: ${stats.registrosPontoNovos}`)
  console.log(`   ⏰ Solicitações Hora Extra: ${stats.solicitacoesHoraExtra}`)
  console.log(`   📊 Resumos Horas Trabalhadas: ${stats.resumosHorasTrabalhadas}`)
  console.log(`   💰 Transferências Folha: ${stats.transferenciasFolha}\n`)
  
  console.log('🔑 CREDENCIAIS DE ACESSO:')
  console.log('   📧 Email: francisco@flpbusiness.com')
  console.log('   🔒 Senha: senha123')
  console.log(`   👤 CPF: ${CPF_FRANCISCO}\n`)
  
  console.log('💡 TODOS OS USUÁRIOS:')
  console.log('   🔒 Senha padrão: senha123')
  console.log('   ✅ CPFs gerados com VALIDAÇÃO CORRETA\n')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

