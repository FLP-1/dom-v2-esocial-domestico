import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { CPF_TESTES, validarCPF } from './utils/cpf-validator';

const prisma = new PrismaClient();

/**
 * 🌱 SEED COMPLETO - MASSA DE TESTES
 * Todos os campos preenchidos com dados válidos
 * CPFs com dígitos verificadores corretos
 * Relacionamentos íntegros
 */

async function main() {
  console.log('🌱 Iniciando população COMPLETA do banco com massa de testes...\n');

  // Validar CPFs antes de iniciar
  console.log('🔍 Validando CPFs...');
  const cpfsInvalidos = Object.entries(CPF_TESTES).filter(([_, cpf]) => !validarCPF(cpf));
  if (cpfsInvalidos.length > 0) {
    throw new Error(`CPFs inválidos encontrados: ${cpfsInvalidos.map(([n, c]) => `${n}: ${c}`).join(', ')}`);
  }
  console.log('✅ Todos os CPFs são válidos\n');

  // ============================================
  // 1. LIMPAR DADOS (ordem correta)
  // ============================================
  console.log('🧹 Limpando dados existentes...');
  
  await prisma.mensagemReacao.deleteMany({});
  await prisma.mensagemLeitura.deleteMany({});
  await prisma.mensagemAnexo.deleteMany({});
  await prisma.mensagem.deleteMany({});
  await prisma.conversaParticipante.deleteMany({});
  await prisma.conversa.deleteMany({});
  await prisma.tarefaDependencia.deleteMany({});
  await prisma.tarefaComentario.deleteMany({});
  await prisma.tarefaAnexo.deleteMany({});
  await prisma.tarefa.deleteMany({});
  await prisma.emprestimo.deleteMany({});
  await prisma.membroFamilia.deleteMany({});
  await prisma.metricaSistema.deleteMany({});
  await prisma.estatisticaSistema.deleteMany({});
  await prisma.folhaPagamento.deleteMany({});
  await prisma.documento.deleteMany({});
  await prisma.notificacao.deleteMany({});
  await prisma.alerta.deleteMany({});
  await prisma.listaCompras.deleteMany({});
  await prisma.usuarioPerfil.deleteMany({});
  await prisma.usuario.deleteMany({});
  await prisma.perfil.deleteMany({});
  
  console.log('✅ Dados limpos\n');

  // ============================================
  // 2. CRIAR PERFIS
  // ============================================
  console.log('👔 Criando perfis...');
  
  const perfis = await Promise.all([
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADOR',
        nome: 'Empregador',
        descricao: 'Empregador doméstico - responsável pela contratação e gestão',
        cor: '#2E8B57',
        icone: '👨‍💼',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'EMPREGADO',
        nome: 'Empregado',
        descricao: 'Empregado doméstico - trabalhador registrado',
        cor: '#29ABE2',
        icone: '👷',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'FAMILIA',
        nome: 'Família',
        descricao: 'Membro da família do empregador',
        cor: '#FF6B6B',
        icone: '👨‍👩‍👧‍👦',
        ativo: true
      }
    }),
    prisma.perfil.create({
      data: {
        codigo: 'ADMIN',
        nome: 'Administrador',
        descricao: 'Administrador técnico do sistema',
        cor: '#9B59B6',
        icone: '👑',
        ativo: true
      }
    })
  ]);
  
  console.log(`✅ ${perfis.length} perfis criados\n`);

  // ============================================
  // 3. CRIAR USUÁRIOS COMPLETOS
  // ============================================
  console.log('👥 Criando usuários com TODOS os campos...');
  
  const senhaHash = await bcrypt.hash('123456', 10);
  const salt = await bcrypt.genSalt(10);

  // 1. Francisco (Empregador)
  const francisco = await prisma.usuario.create({
    data: {
      cpf: CPF_TESTES.francisco,
      nomeCompleto: 'Francisco Jose Lattari Papaleo',
      apelido: 'Francisco',
      dataNascimento: new Date('1975-05-15'),
      email: 'francisco@email.com',
      emailVerificado: true,
      telefone: '11987654321',
      telefoneVerificado: true,
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Paulista',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310100',
      senhaHash,
      salt,
      autenticacao2FA: false,
      biometriaAtiva: false,
      bloqueado: false,
      tentativasLogin: 0,
      ultimoAcesso: new Date(),
      notificarNovoDispositivo: true,
      notificarLoginSuspeito: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true
    }
  });

  // 2. Maria (Empregada)
  const maria = await prisma.usuario.create({
    data: {
      cpf: CPF_TESTES.maria,
      nomeCompleto: 'Maria Santos Silva',
      apelido: 'Maria',
      dataNascimento: new Date('1990-03-20'),
      email: 'maria.santos@email.com',
      emailVerificado: true,
      telefone: '11998765432',
      telefoneVerificado: true,
      logradouro: 'Avenida Paulista',
      numero: '1000',
      complemento: null,
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310200',
      senhaHash,
      salt,
      autenticacao2FA: false,
      biometriaAtiva: true,
      bloqueado: false,
      tentativasLogin: 0,
      ultimoAcesso: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2h atrás
      notificarNovoDispositivo: true,
      notificarLoginSuspeito: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true
    }
  });

  // 3. Carlos (Empregado)
  const carlos = await prisma.usuario.create({
    data: {
      cpf: CPF_TESTES.carlos,
      nomeCompleto: 'Carlos Oliveira Costa',
      apelido: 'Carlos',
      dataNascimento: new Date('1985-07-10'),
      email: 'carlos.oliveira@email.com',
      emailVerificado: true,
      telefone: '11976543210',
      telefoneVerificado: true,
      logradouro: 'Rua Augusta',
      numero: '500',
      complemento: 'Casa',
      bairro: 'Consolação',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310300',
      senhaHash,
      salt,
      autenticacao2FA: true,
      secret2FA: 'SECRET2FA_CARLOS',
      biometriaAtiva: false,
      bloqueado: false,
      tentativasLogin: 1,
      ultimoAcesso: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      notificarNovoDispositivo: true,
      notificarLoginSuspeito: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true
    }
  });

  // 4. Ana (Família)
  const ana = await prisma.usuario.create({
    data: {
      cpf: CPF_TESTES.ana,
      nomeCompleto: 'Ana Paula Lattari',
      apelido: 'Ana',
      dataNascimento: new Date('2000-11-25'),
      email: 'ana.lattari@email.com',
      emailVerificado: true,
      telefone: '11965432109',
      telefoneVerificado: true,
      logradouro: 'Rua das Flores',
      numero: '123',
      complemento: 'Apto 45',
      bairro: 'Jardim Paulista',
      cidade: 'São Paulo',
      uf: 'SP',
      cep: '01310100',
      senhaHash,
      salt,
      autenticacao2FA: false,
      biometriaAtiva: true,
      bloqueado: false,
      tentativasLogin: 0,
      ultimoAcesso: new Date(Date.now() - 30 * 60 * 1000), // 30min atrás
      notificarNovoDispositivo: true,
      notificarLoginSuspeito: true,
      consentimentoLGPD: true,
      dataConsentimento: new Date(),
      termosAceitos: true,
      versaoTermos: '1.0',
      ativo: true
    }
  });

  console.log(`✅ 4 usuários criados com todos os campos\n`);

  // ============================================
  // 4. ASSOCIAR PERFIS
  // ============================================
  console.log('🔗 Associando perfis...');
  
  const perfilEmpregador = perfis.find(p => p.codigo === 'EMPREGADOR')!;
  const perfilEmpregado = perfis.find(p => p.codigo === 'EMPREGADO')!;
  const perfilFamilia = perfis.find(p => p.codigo === 'FAMILIA')!;

  await prisma.usuarioPerfil.createMany({
    data: [
      {
        usuarioId: francisco.id,
        perfilId: perfilEmpregador.id,
        principal: true,
        ativo: true,
        avatar: 'FJ',
        apelido: 'Francisco'
      },
      {
        usuarioId: francisco.id,
        perfilId: perfilFamilia.id,
        principal: false,
        ativo: true,
        avatar: 'FJ',
        apelido: 'Chico'
      },
      {
        usuarioId: maria.id,
        perfilId: perfilEmpregado.id,
        principal: true,
        ativo: true,
        avatar: 'MS',
        apelido: 'Mari'
      },
      {
        usuarioId: carlos.id,
        perfilId: perfilEmpregado.id,
        principal: true,
        ativo: true,
        avatar: 'CO',
        apelido: 'Carlão'
      },
      {
        usuarioId: ana.id,
        perfilId: perfilFamilia.id,
        principal: true,
        ativo: true,
        avatar: 'AP',
        apelido: 'Aninha'
      }
    ]
  });

  console.log('✅ Perfis associados\n');

  // ============================================
  // 5. CRIAR GRUPOS E ASSOCIAR USUÁRIOS
  // ============================================
  console.log('🏢 Criando grupos...');

  const grupoEmpresarial = await prisma.grupo.create({
    data: {
      id: 'grupo-empresarial-001',
      nome: 'Empresa Principal',
      descricao: 'Grupo principal da empresa',
      cor: '#3498db',
      icone: 'building',
      tipo: 'empresa',
      privado: false,
      ativo: true
    }
  });

  const grupoRH = await prisma.grupo.create({
    data: {
      id: 'grupo-rh-001',
      nome: 'Recursos Humanos',
      descricao: 'Departamento de RH',
      cor: '#27ae60',
      icone: 'users',
      tipo: 'departamento',
      privado: false,
      ativo: true
    }
  });

  console.log('✅ 2 grupos criados\n');

  console.log('🔗 Associando usuários aos grupos...');

  await prisma.usuarioGrupo.createMany({
    data: [
      {
        usuarioId: francisco.id,
        grupoId: grupoRH.id,
        papel: 'admin',
        ativo: true
      },
      {
        usuarioId: maria.id,
        grupoId: grupoEmpresarial.id,
        papel: 'membro',
        ativo: true
      },
      {
        usuarioId: carlos.id,
        grupoId: grupoEmpresarial.id,
        papel: 'membro',
        ativo: true
      },
      {
        usuarioId: ana.id,
        grupoId: grupoEmpresarial.id,
        papel: 'membro',
        ativo: true
      }
    ]
  });

  console.log('✅ Usuários associados aos grupos\n');

  // Buscar os IDs dos perfis de usuário criados para usar nos registros
  const franciscoPerfilEmpregador = await prisma.usuarioPerfil.findFirst({
    where: { usuarioId: francisco.id, perfilId: perfilEmpregador.id }
  });

  // ============================================
  // 6. MEMBROS DA FAMÍLIA COMPLETOS
  // ============================================
  console.log('👨‍👩‍👧‍👦 Criando membros da família...');
  
  const membrosPedro = await prisma.membroFamilia.create({
    data: {
      usuarioId: francisco.id,
      nome: 'Pedro Costa Silva',
      parentesco: 'Primo',
      cpf: CPF_TESTES.pedro,
      dataNascimento: new Date('1980-06-15'),
      telefone: '11955667788',
      email: 'pedro.costa@email.com',
      endereco: {
        logradouro: 'Rua dos Andradas',
        numero: '789',
        complemento: 'Bloco B',
        bairro: 'Centro',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01310400'
      },
      contatoEmergencia: false,
      responsavelFinanceiro: false,
      favorito: true,
      bloqueado: false,
      avatar: 'PC',
      usuarioVinculado: null,
      ativo: true
    }
  });

  await prisma.membroFamilia.create({
    data: {
      usuarioId: francisco.id,
      nome: 'Juliana Mendes',
      parentesco: 'Amiga',
      cpf: CPF_TESTES.juliana,
      dataNascimento: new Date('1992-08-20'),
      telefone: '11944556677',
      email: 'juliana@email.com',
      endereco: {
        logradouro: 'Avenida Brasil',
        numero: '456',
        bairro: 'Jardins',
        cidade: 'São Paulo',
        uf: 'SP',
        cep: '01310500'
      },
      contatoEmergencia: true,
      responsavelFinanceiro: false,
      favorito: true,
      bloqueado: false,
      avatar: 'JM',
      usuarioVinculado: null,
      ativo: true
    }
  });

  console.log('✅ Membros da família criados\n');

  // ============================================
  // 6. CONVERSAS COMPLETAS
  // ============================================
  console.log('💬 Criando conversas...');
  
  // Conversa 1: Francisco <-> Maria
  const conv1 = await prisma.conversa.create({
    data: {
      tipo: 'individual',
      nome: null,
      descricao: null,
      avatar: null,
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: new Date()
    }
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conv1.id,
        usuarioId: francisco.id,
        papel: 'MEMBRO',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(),
        entradaEm: new Date(),
        ativo: true,
        bloqueado: false,
        favorito: true,
        apelidoLocal: 'Mari - Casa'
      },
      {
        conversaId: conv1.id,
        usuarioId: maria.id,
        papel: 'MEMBRO',
        fixada: false,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(Date.now() - 30 * 60 * 1000),
        entradaEm: new Date(),
        ativo: true,
        bloqueado: false,
        favorito: false,
        apelidoLocal: null
      }
    ]
  });

  // Mensagens da conversa
  const msg1 = await prisma.mensagem.create({
    data: {
      conversaId: conv1.id,
      remetenteId: francisco.id,
      conteudo: 'Bom dia, Maria! Como está o andamento das tarefas de hoje?',
      tipo: 'text',
      respostaParaId: null,
      lida: true,
      editada: false,
      excluida: false,
      fixada: false
    }
  });

  const msg2 = await prisma.mensagem.create({
    data: {
      conversaId: conv1.id,
      remetenteId: maria.id,
      conteudo: 'Bom dia! Está tudo indo bem. Já organizei a sala e agora vou para a cozinha.',
      tipo: 'text',
      respostaParaId: msg1.id,
      lida: true,
      editada: false,
      excluida: false,
      fixada: false
    }
  });

  await prisma.mensagem.create({
    data: {
      conversaId: conv1.id,
      remetenteId: francisco.id,
      conteudo: 'Perfeito! Lembre-se de verificar se há algum documento para organizar também.',
      tipo: 'text',
      respostaParaId: msg2.id,
      lida: false,
      editada: false,
      excluida: false,
      fixada: true
    }
  });

  // Conversa em grupo
  const convGrupo = await prisma.conversa.create({
    data: {
      tipo: 'grupo',
      nome: 'Família Lattari',
      descricao: 'Grupo da família para organização',
      avatar: '👨‍👩‍👧‍👦',
      ativa: true,
      arquivada: false,
      ultimaMensagemEm: new Date()
    }
  });

  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: convGrupo.id,
        usuarioId: francisco.id,
        papel: 'ADMIN',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(),
        entradaEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ativo: true,
        bloqueado: false,
        favorito: true,
        apelidoLocal: null
      },
      {
        conversaId: convGrupo.id,
        usuarioId: ana.id,
        papel: 'MEMBRO',
        fixada: true,
        silenciada: false,
        notificacoes: true,
        ultimaLeitura: new Date(Date.now() - 2 * 60 * 60 * 1000),
        entradaEm: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        ativo: true,
        bloqueado: false,
        favorito: false,
        apelidoLocal: null
      }
    ]
  });

  await prisma.mensagem.create({
    data: {
      conversaId: convGrupo.id,
      remetenteId: ana.id,
      conteudo: 'Lembrem-se da reunião de amanhã às 14h!',
      tipo: 'text',
      respostaParaId: null,
      lida: false,
      editada: false,
      excluida: false,
      fixada: false
    }
  });

  console.log('✅ Conversas criadas\n');

  // ============================================
  // 7. TAREFAS COMPLETAS
  // ============================================
  console.log('📋 Criando tarefas...');
  
  const tarefa1 = await prisma.tarefa.create({
    data: {
      titulo: 'Revisar contratos de trabalho',
      descricao: 'Verificar e atualizar contratos de todos os funcionários para conformidade com eSocial',
      prioridade: 'alta',
      status: 'pendente',
      atribuidoPara: francisco.id,
      criadoPor: francisco.id,
      dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      dataConclusao: null,
      tags: ['recursos_humanos', 'contratos', 'esocial'],
      corLabel: '#FF6B6B',
      tempoEstimado: 120, // minutos
      tempoGasto: null,
      tarefaPaiId: null,
      checklist: {
        items: [
          { id: 1, text: 'Revisar contrato da Maria', checked: false },
          { id: 2, text: 'Revisar contrato do Carlos', checked: false },
          { id: 3, text: 'Enviar para advogado', checked: false }
        ]
      }
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: 'Atualizar folha de pagamento',
      descricao: 'Processar folha de pagamento do mês atual incluindo horas extras',
      prioridade: 'media',
      status: 'em_andamento',
      atribuidoPara: francisco.id,
      criadoPor: francisco.id,
      dataVencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      dataConclusao: null,
      tags: ['financeiro', 'folha', 'pagamento'],
      corLabel: '#4ECDC4',
      tempoEstimado: 180,
      tempoGasto: 45,
      tarefaPaiId: null,
      checklist: null
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: 'Organizar documentos',
      descricao: 'Separar e arquivar documentos importantes do mês',
      prioridade: 'baixa',
      status: 'concluida',
      atribuidoPara: maria.id,
      criadoPor: francisco.id,
      dataVencimento: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      dataConclusao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      tags: ['documentos', 'organização', 'arquivo'],
      corLabel: '#95E1D3',
      tempoEstimado: 60,
      tempoGasto: 75,
      tarefaPaiId: null,
      checklist: null
    }
  });

  console.log('✅ Tarefas criadas\n');

  // ============================================
  // 8. EMPRÉSTIMOS COMPLETOS
  // ============================================
  console.log('💰 Criando empréstimos...');
  
  await prisma.emprestimo.createMany({
    data: [
      {
        usuarioId: francisco.id,
        empregadoId: maria.id,
        tipo: 'advance',
        valor: 1000.00,
        valorParcela: 1000.00,
        quantidadeParcelas: 1,
        parcelasPagas: 0,
        taxaJuros: 0,
        dataConcessao: new Date(),
        dataVencimento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        dataSolicitacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        dataAprovacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: 'aprovado',
        observacao: 'Adiantamento salarial conforme solicitado',
        justificativa: 'Emergência médica familiar - consulta especializada',
        aprovadoPor: 'Francisco Jose Lattari Papaleo',
        motivoRejeicao: null
      },
      {
        usuarioId: francisco.id,
        empregadoId: carlos.id,
        tipo: 'loan',
        valor: 3000.00,
        valorParcela: 550.00,
        quantidadeParcelas: 6,
        parcelasPagas: 0,
        taxaJuros: 2.5,
        dataConcessao: new Date(),
        dataVencimento: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        dataSolicitacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        dataAprovacao: null,
        status: 'pendente',
        observacao: 'Aguardando análise final',
        justificativa: 'Reforma da casa - troca de telhado e pintura externa',
        aprovadoPor: null,
        motivoRejeicao: null
      },
      {
        usuarioId: francisco.id,
        empregadoId: maria.id,
        tipo: 'loan',
        valor: 2000.00,
        valorParcela: 500.00,
        quantidadeParcelas: 4,
        parcelasPagas: 4,
        taxaJuros: 2.0,
        dataConcessao: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
        dataVencimento: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dataSolicitacao: new Date(Date.now() - 125 * 24 * 60 * 60 * 1000),
        dataAprovacao: new Date(Date.now() - 123 * 24 * 60 * 60 * 1000),
        status: 'pago',
        observacao: 'Empréstimo quitado com sucesso',
        justificativa: 'Compra de eletrodomésticos para casa',
        aprovadoPor: 'Francisco Jose Lattari Papaleo',
        motivoRejeicao: null
      }
    ]
  });

  console.log('✅ Empréstimos criados\n');

  // ============================================
  // 9. DOCUMENTOS
  // ============================================
  console.log('📄 Criando documentos...');
  
  await prisma.documento.createMany({
    data: [
      {
        usuarioId: francisco.id,
        nome: 'Contrato de Trabalho - Maria Santos',
        categoria: 'contrato',
        tipo: 'pdf',
        tamanho: 245678,
        caminhoArquivo: '/uploads/documentos/contrato-maria-2024.pdf',
        tags: ['contrato', 'trabalho', 'maria'],
        permissao: 'PRIVADO',
        validado: true,
        validadoEm: new Date(),
        validadoPor: 'Francisco Jose Lattari Papaleo',
        dataVencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        alertaVencimento: true,
        esocialPronto: true,
        backupCriado: true
      },
      {
        usuarioId: francisco.id,
        nome: 'Holerite Janeiro 2024 - Maria',
        categoria: 'folha_pagamento',
        tipo: 'pdf',
        tamanho: 128456,
        caminhoArquivo: '/uploads/documentos/holerite-maria-jan2024.pdf',
        tags: ['holerite', 'janeiro', 'maria'],
        permissao: 'PRIVADO',
        validado: true,
        validadoEm: new Date(),
        validadoPor: 'Francisco Jose Lattari Papaleo',
        dataVencimento: null,
        alertaVencimento: false,
        esocialPronto: true,
        backupCriado: true
      }
    ]
  });

  console.log('✅ Documentos criados\n');

  // ============================================
  // 10. MÉTRICAS E ESTATÍSTICAS
  // ============================================
  console.log('📊 Criando métricas...');
  
  await prisma.metricaSistema.createMany({
    data: [
      {
        chave: 'usuarios_ativos',
        valor: 4,
        descricao: 'Total de usuários ativos no sistema',
        categoria: 'usuarios'
      },
      {
        chave: 'conversas_ativas',
        valor: 2,
        descricao: 'Total de conversas ativas',
        categoria: 'comunicacao'
      },
      {
        chave: 'tarefas_pendentes',
        valor: 2,
        descricao: 'Total de tarefas pendentes',
        categoria: 'tarefas'
      },
      {
        chave: 'emprestimos_aprovados',
        valor: 1,
        descricao: 'Total de empréstimos aprovados',
        categoria: 'financeiro'
      }
    ]
  });

  await prisma.estatisticaSistema.createMany({
    data: [
      {
        chave: 'usuarios_cadastrados',
        valor: '4',
        categoria: 'usuarios',
        tipoDado: 'number',
        descricao: 'Total de usuários cadastrados'
      },
      {
        chave: 'mensagens_enviadas',
        valor: '4',
        categoria: 'comunicacao',
        tipoDado: 'number',
        descricao: 'Mensagens enviadas hoje'
      },
      {
        chave: 'tarefas_concluidas',
        valor: '1',
        categoria: 'tarefas',
        tipoDado: 'number',
        descricao: 'Tarefas concluídas hoje'
      }
    ]
  });

  console.log('✅ Métricas criadas\n');

  // ============================================
  // 11. CONFIGURAÇÕES DO SISTEMA
  // ============================================
  console.log('⚙️  Criando configurações do sistema...');
  
  const upsertConfig = async (chave: string, valor: string, tipo: string, categoria: string, descricao: string, editavel = true) => {
    await prisma.configuracaoSistema.upsert({
      where: { chave },
      update: { valor, tipo, categoria, descricao, editavel },
      create: { chave, valor, tipo, categoria, descricao, editavel }
    });
  };

  await upsertConfig('sistema_nome', 'DOM - Doméstico Online Manager', 'string', 'sistema', 'Nome do sistema', false);
  await upsertConfig('sistema_url_base', 'http://localhost:3000', 'string', 'sistema', 'URL base da aplicação', true);
  await upsertConfig('sistema_senha_padrao', '123456', 'string', 'sistema', 'Senha padrão para novos usuários', true);
  await upsertConfig('auth_jwt_secret', 'your-secret-key-change-in-production', 'string', 'autenticacao', 'Chave secreta JWT', true);
  await upsertConfig('empresa_cpf_principal', francisco.cpf, 'string', 'empresa', 'CPF do responsável principal', true);
  await upsertConfig('geolocalizacao_precisao_maxima', '50', 'number', 'geolocalizacao', 'Precisão máxima aceitável (metros) para registro de ponto', true);
  await upsertConfig('geolocalizacao_idade_maxima_segundos', '60', 'number', 'geolocalizacao', 'Idade máxima aceitável da localização (segundos)', true);
  await upsertConfig('ponto_override_roles', '["EMPREGADOR","ADMIN"]', 'json', 'ponto', 'Perfis que podem autorizar override no registro de ponto', true);

  // Termos de uso (idempotente)
  await prisma.termo.upsert({
    where: { versao: '1.0' },
    update: {
      tipo: 'TERMOS_USO',
      titulo: 'Termos de Uso do Sistema DOM',
      conteudo: 'Ao utilizar o sistema DOM, você concorda com estes termos de uso...',
      ativo: true,
      dataVigencia: new Date()
    },
    create: {
      tipo: 'TERMOS_USO',
      versao: '1.0',
      titulo: 'Termos de Uso do Sistema DOM',
      conteudo: 'Ao utilizar o sistema DOM, você concorda com estes termos de uso...',
      ativo: true,
      dataVigencia: new Date()
    }
  });

  console.log('✅ Configurações do sistema criadas\n');

  // ============================================
  // 12. PONTO: DISPOSITIVO + REGISTROS DE HOJE
  // ============================================
  console.log('🕒 Criando dispositivo e registros de ponto de hoje...');

  const deviceFrancisco = await prisma.dispositivo.create({
    data: {
      usuarioId: francisco.id,
      dispositivoId: `seed_device_${francisco.id.substring(0, 8)}`,
      nome: 'Notebook Pessoal',
      modelo: 'Windows 11',
      versaoSO: '23H2',
      tipo: 'DESKTOP',
      nomeRedeWiFi: 'WiFi: Conectado',
      enderecoIP: '127.0.0.1',
      latitude: -23.6025,
      longitude: -46.6309,
      precisao: 18.5,
      confiavel: true
    }
  });

  const today = new Date();
  const dt = (h: number, m: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0);

  await prisma.registroPonto.createMany({
    data: [
      {
        usuarioId: francisco.id,
        dispositivoId: deviceFrancisco.id,
        dataHora: dt(9, 0),
        tipo: 'entrada',
        latitude: -23.6025,
        longitude: -46.6309,
        precisao: 18.5,
        dentroGeofence: true,
        enderecoIP: '127.0.0.1',
        nomeRedeWiFi: 'WiFi: Conectado',
        aprovado: true,
        aprovadoPor: 'Seed',
        aprovadoEm: new Date(),
        observacao: 'Registro seed',
        hashIntegridade: 'seed_hash_entrada',
        grupoId: grupoRH.id,
        usuarioPerfilId: franciscoPerfilEmpregador!.id
      },
      {
        usuarioId: francisco.id,
        dispositivoId: deviceFrancisco.id,
        dataHora: dt(12, 0),
        tipo: 'saida_almoco',
        latitude: -23.6026,
        longitude: -46.6312,
        precisao: 22.0,
        dentroGeofence: true,
        enderecoIP: '127.0.0.1',
        nomeRedeWiFi: 'WiFi: Conectado',
        aprovado: true,
        aprovadoPor: 'Seed',
        aprovadoEm: new Date(),
        observacao: 'Registro seed',
        hashIntegridade: 'seed_hash_saida_almoco',
        grupoId: grupoRH.id,
        usuarioPerfilId: franciscoPerfilEmpregador!.id
      },
      {
        usuarioId: francisco.id,
        dispositivoId: deviceFrancisco.id,
        dataHora: dt(13, 0),
        tipo: 'retorno_almoco',
        latitude: -23.6025,
        longitude: -46.6309,
        precisao: 19.0,
        dentroGeofence: true,
        enderecoIP: '127.0.0.1',
        nomeRedeWiFi: 'WiFi: Conectado',
        aprovado: true,
        aprovadoPor: 'Seed',
        aprovadoEm: new Date(),
        observacao: 'Registro seed',
        hashIntegridade: 'seed_hash_retorno_almoco',
        grupoId: grupoRH.id,
        usuarioPerfilId: franciscoPerfilEmpregador!.id
      }
    ]
  });

  console.log('✅ Registros de ponto criados\n');

  // ============================================
  // 13. Solicitações de Hora Extra
  // ============================================
  console.log('⏱️  Criando solicitações de hora extra...');

  await prisma.solicitacaoHoraExtra.createMany({
    data: [
      {
        usuarioId: francisco.id,
        data: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        inicio: '18:00',
        fim: '20:00',
        justificativa: 'Atendimento emergencial',
        status: 'PENDENTE',
        grupoId: grupoRH.id,
        usuarioPerfilId: franciscoPerfilEmpregador!.id
      },
      {
        usuarioId: francisco.id,
        data: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1),
        inicio: '18:00',
        fim: '19:00',
        justificativa: 'Fechamento mensal',
        status: 'APROVADA',
        revisadaPor: 'Seed',
        revisadaEm: new Date(),
        grupoId: grupoRH.id,
        usuarioPerfilId: franciscoPerfilEmpregador!.id
      }
    ]
  });

  console.log('✅ Solicitações de HE criadas\n');

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('📊 RESUMO DA POPULAÇÃO:');
  console.log('  ═══════════════════════════════════════');

  const counts = {
    perfis: await prisma.perfil.count(),
    usuarios: await prisma.usuario.count(),
    usuariosPerfis: await prisma.usuarioPerfil.count(),
    membrosFamilia: await prisma.membroFamilia.count(),
    conversas: await prisma.conversa.count(),
    conversasParticipantes: await prisma.conversaParticipante.count(),
    mensagens: await prisma.mensagem.count(),
    tarefas: await prisma.tarefa.count(),
    emprestimos: await prisma.emprestimo.count(),
    documentos: await prisma.documento.count(),
    metricas: await prisma.metricaSistema.count(),
    estatisticas: await prisma.estatisticaSistema.count(),
    configuracoes: await prisma.configuracaoSistema.count(),
    termos: await prisma.termo.count()
  };

  Object.entries(counts).forEach(([key, count]) => {
    console.log(`  📌 ${key.padEnd(25)}: ${count}`);
  });

  console.log('  ═══════════════════════════════════════');
  console.log('  ✅ TODOS OS CAMPOS PREENCHIDOS');
  console.log('  ✅ CPFs VÁLIDOS COM DÍGITOS VERIFICADORES');
  console.log('  ✅ RELACIONAMENTOS ÍNTEGROS');
  console.log('  ✅ DADOS PRONTOS PARA TESTE\n');
  
  console.log('✅ População concluída com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao popular banco de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

