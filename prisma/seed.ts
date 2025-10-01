/**
 * 🌱 Seed do Banco de Dados - Sistema DOM v2.2.1
 * 
 * Este arquivo popula o banco com dados iniciais
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

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
      cor: '#E74C3C',
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
      nome: 'Administrador',
      descricao: 'Administrador do sistema com acesso total',
      cor: '#34495E',
      icone: 'admin',
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
    where: { cpf: '12345678901' },
    update: {},
    create: {
      cpf: '12345678901', // Sem máscara
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

  // Usuário 2: Empregado
  const empregado = await prisma.usuario.upsert({
    where: { cpf: '98765432100' },
    update: {},
    create: {
      cpf: '98765432100',
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

  console.log('🎉 Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

