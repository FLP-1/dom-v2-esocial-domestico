import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import '../scripts/shared/load-env';

const prisma = new PrismaClient();

// Função para validar CPF
function validarCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  const digito1 = resto > 9 ? 0 : resto;

  if (parseInt(cpf.charAt(9)) !== digito1) return false;

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  const digito2 = resto > 9 ? 0 : resto;

  return parseInt(cpf.charAt(10)) === digito2;
}

async function main() {
  console.log('🌱 Criando massa de dados para NOVO EMPREGADO...\n');

  // ============================================
  // DADOS DO NOVO EMPREGADO
  // ============================================
  // Carregar configurações centrais para evitar hardcode
  const configEmpresa = await prisma.configuracaoSistema.findUnique({ where: { chave: 'empresa_cpf_principal' } });
  const configSenhaPadrao = await prisma.configuracaoSistema.findUnique({ where: { chave: 'sistema_senha_padrao' } });
  if (!configEmpresa?.valor) {
    throw new Error('ConfiguracaoSistema.empresa_cpf_principal não definida. Execute o seed completo antes.');
  }

  const novoEmpregadoData = {
    cpf: '40263020673',
    nomeCompleto: 'João Pedro Silva Santos',
    dataNascimento: new Date('1995-03-15'),
    email: 'joao.pedro.santos.novo@email.com',
    telefone: '11987654321',
    senha: configSenhaPadrao?.valor || '123456',
    empregadorCpf: configEmpresa.valor,
  };

  // Validar CPF
  console.log('🔍 Validando CPF do novo empregado...');
  if (!validarCPF(novoEmpregadoData.cpf)) {
    throw new Error(`CPF inválido: ${novoEmpregadoData.cpf}`);
  }
  console.log('✅ CPF válido!\n');

  // ============================================
  // BUSCAR EMPREGADOR
  // ============================================
  console.log('🔍 Buscando empregador...');
  const empregador = await prisma.usuario.findUnique({
    where: { cpf: novoEmpregadoData.empregadorCpf },
    include: {
      perfis: {
        include: {
          perfil: true
        }
      }
    }
  });

  if (!empregador) {
    throw new Error(`Empregador com CPF ${novoEmpregadoData.empregadorCpf} não encontrado!`);
  }
  console.log(`✅ Empregador encontrado: ${empregador.nomeCompleto}\n`);

  // ============================================
  // BUSCAR PERFIL DE EMPREGADO
  // ============================================
  console.log('🔍 Buscando perfil de Empregado...');
  const perfilEmpregado = await prisma.perfil.findFirst({
    where: { OR: [{ nome: 'Empregado' }, { codigo: 'EMPREGADO' }] }
  });

  if (!perfilEmpregado) {
    throw new Error('Perfil Empregado não encontrado!');
  }
  console.log('✅ Perfil Empregado encontrado\n');

  // ============================================
  // CRIAR NOVO USUÁRIO
  // ============================================
  console.log('👤 Criando/atualizando usuário (idempotente)...');
  const salt = await bcrypt.genSalt(10);
  const senhaHash = await bcrypt.hash(novoEmpregadoData.senha, salt);

  const usuarioExistente = await prisma.usuario.findUnique({ where: { cpf: novoEmpregadoData.cpf } });
  const novoUsuario = usuarioExistente
    ? await prisma.usuario.update({
        where: { cpf: novoEmpregadoData.cpf },
        data: {
          nomeCompleto: novoEmpregadoData.nomeCompleto,
          email: novoEmpregadoData.email,
          telefone: novoEmpregadoData.telefone,
          ativo: true,
        },
      })
    : await prisma.usuario.create({
        data: {
          cpf: novoEmpregadoData.cpf,
          nomeCompleto: novoEmpregadoData.nomeCompleto,
          dataNascimento: novoEmpregadoData.dataNascimento,
          email: novoEmpregadoData.email,
          senhaHash,
          salt,
          telefone: novoEmpregadoData.telefone,
          emailVerificado: true,
          telefoneVerificado: true,
          autenticacao2FA: false,
          ativo: true,
          logradouro: 'Rua das Flores',
          numero: '123',
          complemento: 'Apto 45',
          bairro: 'Jardim Paulista',
          cidade: 'São Paulo',
          uf: 'SP',
          cep: '01234567',
          bloqueado: false,
          tentativasLogin: 0,
          notificarNovoDispositivo: true,
          notificarLoginSuspeito: true,
          consentimentoLGPD: true,
          dataConsentimento: new Date(),
          termosAceitos: true,
          versaoTermos: '1.0'
        }
      });
  console.log(`✅ Usuário pronto: ${novoUsuario.nomeCompleto} (CPF: ${novoUsuario.cpf})\n`);

  // ============================================
  // ASSOCIAR PERFIL
  // ============================================
  console.log('🔗 Associando perfil de Empregado (idempotente)...');
  const novoUsuarioPerfil = await prisma.usuarioPerfil.upsert({
    where: { usuarioId_perfilId: { usuarioId: novoUsuario.id, perfilId: perfilEmpregado.id } },
    update: { ativo: true, principal: true },
    create: { usuarioId: novoUsuario.id, perfilId: perfilEmpregado.id, ativo: true, principal: true }
  });
  console.log('✅ Perfil associado\n');

  // ============================================
  // GARANTIR GRUPOS E ASSOCIAR USUÁRIO
  // ============================================
  console.log('🏢 Garantindo grupos (idempotente)...');
  
  const grupoEmpresarial = await prisma.grupo.upsert({
    where: { id: 'grupo-empresarial-001' },
    update: {},
    create: {
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

  await prisma.usuarioGrupo.upsert({
    where: {
      usuarioId_grupoId: {
        usuarioId: novoUsuario.id,
        grupoId: grupoEmpresarial.id
      }
    },
    update: { papel: 'membro', ativo: true },
    create: {
      usuarioId: novoUsuario.id,
      grupoId: grupoEmpresarial.id,
      papel: 'membro',
      ativo: true
    }
  });

  console.log('✅ Usuário associado ao grupo\n');

  // ============================================
  // CRIAR VÍNCULO COM EMPREGADOR (MEMBRO FAMÍLIA)
  // ============================================
  console.log('👨‍👩‍👧‍👦 Criando vínculo com empregador (idempotente)...');
  const vinculoExistente = await prisma.membroFamilia.findFirst({ where: { usuarioId: empregador.id, usuarioVinculado: novoUsuario.id } });
  if (!vinculoExistente) {
    await prisma.membroFamilia.create({
      data: {
        usuarioId: empregador.id,
        nome: novoUsuario.nomeCompleto,
        parentesco: 'FUNCIONARIO',
        cpf: novoUsuario.cpf,
        dataNascimento: novoUsuario.dataNascimento,
        telefone: novoUsuario.telefone,
        email: novoUsuario.email,
        usuarioVinculado: novoUsuario.id,
        contatoEmergencia: false,
        responsavelFinanceiro: false,
        ativo: true,
        favorito: false,
        bloqueado: false
      }
    });
    console.log('✅ Vínculo criado\n');
  } else {
    console.log('↻ Vínculo já existente\n');
  }

  // ============================================
  // CRIAR DISPOSITIVO PARA REGISTROS DE PONTO
  // ============================================
  console.log('📱 Criando/garantindo dispositivo (idempotente)...');
  const dispositivoId = `seed_device_${novoUsuario.id.substring(0, 8)}`;
  const dispositivo = await prisma.dispositivo.upsert({
    where: { dispositivoId },
    update: { usuarioId: novoUsuario.id, ultimoUso: new Date(), ativo: true, confiavel: true },
    create: {
      usuarioId: novoUsuario.id,
      dispositivoId,
      nome: 'Samsung Galaxy S21',
      modelo: 'SM-G991B',
      versaoSO: 'Android 13',
      tipo: 'SMARTPHONE',
      nomeRedeWiFi: 'WiFi-Empresa',
      enderecoIP: '192.168.1.100',
      latitude: -23.5505,
      longitude: -46.6333,
      precisao: 10.0,
      confiavel: true,
      ativo: true,
      ultimoUso: new Date()
    }
  });
  console.log('✅ Dispositivo pronto\n');

  // ============================================
  // CRIAR REGISTROS DE PONTO (40 DIAS)
  // ============================================
  console.log('🕐 Criando registros de ponto (40 dias, idempotente)...');
  
  const hoje = new Date();
  const dataInicio = new Date(hoje);
  dataInicio.setDate(dataInicio.getDate() - 40); // 40 dias atrás

  let totalRegistros = 0;
  
  for (let i = 0; i < 40; i++) {
    const data = new Date(dataInicio);
    data.setDate(dataInicio.getDate() + i);
    
    // Pular finais de semana
    const diaSemana = data.getDay();
    if (diaSemana === 0 || diaSemana === 6) continue;

    // Horários de trabalho (8h às 17h com 1h de almoço)
    const entrada1 = new Date(data);
    entrada1.setHours(8, 0, 0, 0);
    
    const saida1 = new Date(data);
    saida1.setHours(12, 0, 0, 0);
    
    const entrada2 = new Date(data);
    entrada2.setHours(13, 0, 0, 0);
    
    const saida2 = new Date(data);
    saida2.setHours(17, 0, 0, 0);

    // Evitar duplicar se já existir para a data/hora
    const existsEntrada = await prisma.registroPonto.findFirst({ where: { usuarioId: novoUsuario.id, dataHora: entrada1 } });
    if (!existsEntrada) {
      await prisma.registroPonto.create({
        data: {
          usuarioId: novoUsuario.id,
          dispositivoId: dispositivo.id,
          dataHora: entrada1,
          tipo: 'entrada',
          latitude: -23.5505,
          longitude: -46.6333,
          precisao: 10.0,
          dentroGeofence: true,
          enderecoIP: '192.168.1.100',
          nomeRedeWiFi: 'WiFi-Empresa',
          aprovado: true,
          aprovadoPor: empregador.id,
          aprovadoEm: entrada1,
          observacao: 'Entrada normal',
          hashIntegridade: `hash_${Date.now()}_entrada1`,
          grupoId: grupoEmpresarial.id,
          usuarioPerfilId: novoUsuarioPerfil.id
        }
      });
    }

    const existsSaidaAlmoco = await prisma.registroPonto.findFirst({ where: { usuarioId: novoUsuario.id, dataHora: saida1 } });
    if (!existsSaidaAlmoco) {
      await prisma.registroPonto.create({
        data: {
          usuarioId: novoUsuario.id,
          dispositivoId: dispositivo.id,
          dataHora: saida1,
          tipo: 'saida_almoco',
          latitude: -23.5505,
          longitude: -46.6333,
          precisao: 10.0,
          dentroGeofence: true,
          enderecoIP: '192.168.1.100',
          nomeRedeWiFi: 'WiFi-Empresa',
          aprovado: true,
          aprovadoPor: empregador.id,
          aprovadoEm: saida1,
          observacao: 'Saída para almoço',
          hashIntegridade: `hash_${Date.now()}_saida_almoco`,
          grupoId: grupoEmpresarial.id,
          usuarioPerfilId: novoUsuarioPerfil.id
        }
      });
    }

    const existsRetorno = await prisma.registroPonto.findFirst({ where: { usuarioId: novoUsuario.id, dataHora: entrada2 } });
    if (!existsRetorno) {
      await prisma.registroPonto.create({
        data: {
          usuarioId: novoUsuario.id,
          dispositivoId: dispositivo.id,
          dataHora: entrada2,
          tipo: 'retorno_almoco',
          latitude: -23.5505,
          longitude: -46.6333,
          precisao: 10.0,
          dentroGeofence: true,
          enderecoIP: '192.168.1.100',
          nomeRedeWiFi: 'WiFi-Empresa',
          aprovado: true,
          aprovadoPor: empregador.id,
          aprovadoEm: entrada2,
          observacao: 'Retorno do almoço',
          hashIntegridade: `hash_${Date.now()}_retorno_almoco`,
          grupoId: grupoEmpresarial.id,
          usuarioPerfilId: novoUsuarioPerfil.id
        }
      });
    }

    const existsSaida = await prisma.registroPonto.findFirst({ where: { usuarioId: novoUsuario.id, dataHora: saida2 } });
    if (!existsSaida) {
      await prisma.registroPonto.create({
        data: {
          usuarioId: novoUsuario.id,
          dispositivoId: dispositivo.id,
          dataHora: saida2,
          tipo: 'saida',
          latitude: -23.5505,
          longitude: -46.6333,
          precisao: 10.0,
          dentroGeofence: true,
          enderecoIP: '192.168.1.100',
          nomeRedeWiFi: 'WiFi-Empresa',
          aprovado: true,
          aprovadoPor: empregador.id,
          aprovadoEm: saida2,
          observacao: 'Saída normal',
          hashIntegridade: `hash_${Date.now()}_saida`,
          grupoId: grupoEmpresarial.id,
          usuarioPerfilId: novoUsuarioPerfil.id
        }
      });
    }

    totalRegistros += 4;
  }
  console.log(`✅ ${totalRegistros} registros de ponto criados (40 dias úteis)\n`);

  // ============================================
  // CRIAR TAREFAS
  // ============================================
  console.log('✅ Criando tarefas...');
  
  await prisma.tarefa.create({
    data: {
      titulo: 'Completar treinamento de integração',
      descricao: 'Assistir todos os vídeos do curso de integração e preencher o formulário',
      status: 'CONCLUIDA',
      prioridade: 'ALTA',
      dataVencimento: new Date(dataInicio.getTime() + 7 * 24 * 60 * 60 * 1000),
      dataConclusao: new Date(dataInicio.getTime() + 5 * 24 * 60 * 60 * 1000),
      criadoPor: empregador.id,
      atribuidoPara: novoUsuario.id,
      tags: ['treinamento', 'integracao'],
      corLabel: '#4CAF50',
      tempoEstimado: 480,
      tempoGasto: 420
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: 'Revisar manual do funcionário',
      descricao: 'Ler e confirmar entendimento do manual do funcionário',
      status: 'EM_ANDAMENTO',
      prioridade: 'MEDIA',
      dataVencimento: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      criadoPor: empregador.id,
      atribuidoPara: novoUsuario.id,
      tags: ['documentacao', 'politicas'],
      corLabel: '#FFC107',
      tempoEstimado: 180
    }
  });

  await prisma.tarefa.create({
    data: {
      titulo: 'Configurar acesso aos sistemas',
      descricao: 'Configurar email corporativo e acesso aos sistemas internos',
      status: 'PENDENTE',
      prioridade: 'ALTA',
      dataVencimento: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      criadoPor: empregador.id,
      atribuidoPara: novoUsuario.id,
      tags: ['configuracao', 'acesso'],
      corLabel: '#F44336',
      tempoEstimado: 120
    }
  });
  console.log('✅ 3 tarefas criadas\n');

  // ============================================
  // CRIAR DOCUMENTOS
  // ============================================
  console.log('📄 Criando documentos...');
  
  await prisma.documento.create({
    data: {
      usuarioId: novoUsuario.id,
      nome: 'Contrato de Trabalho',
      tipo: 'CONTRATO',
      categoria: 'RH',
      descricao: 'Contrato de trabalho CLT',
      caminhoArquivo: `/documentos/${novoUsuario.cpf}/contrato-trabalho.pdf`,
      tamanho: 524288,
      hash: 'abc123def456',
      validado: true,
      validadoEm: new Date(),
      validadoPor: empregador.id,
      dataVencimento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      alertaVencimento: true,
      permissao: 'PRIVADO',
      tags: ['contrato', 'trabalho', 'clt'],
      esocialPronto: true,
      backupCriado: true
    }
  });

  await prisma.documento.create({
    data: {
      usuarioId: novoUsuario.id,
      nome: 'Carteira de Trabalho (CTPS)',
      tipo: 'IDENTIFICACAO',
      categoria: 'RH',
      descricao: 'Cópia da Carteira de Trabalho',
      caminhoArquivo: `/documentos/${novoUsuario.cpf}/ctps.pdf`,
      tamanho: 256000,
      hash: 'def789ghi012',
      validado: true,
      validadoEm: new Date(),
      validadoPor: empregador.id,
      permissao: 'PRIVADO',
      tags: ['ctps', 'identificacao'],
      esocialPronto: false,
      backupCriado: true
    }
  });

  await prisma.documento.create({
    data: {
      usuarioId: novoUsuario.id,
      nome: 'Comprovante de Residência',
      tipo: 'COMPROVANTE',
      categoria: 'RH',
      descricao: 'Comprovante de endereço atualizado',
      caminhoArquivo: `/documentos/${novoUsuario.cpf}/comprovante-residencia.pdf`,
      tamanho: 128000,
      hash: 'ghi345jkl678',
      validado: true,
      validadoEm: new Date(),
      validadoPor: novoUsuario.id,
      permissao: 'PRIVADO',
      tags: ['comprovante', 'endereco'],
      esocialPronto: false,
      backupCriado: true
    }
  });
  console.log('✅ 3 documentos criados\n');

  // ============================================
  // CRIAR CONVERSAS
  // ============================================
  console.log('💬 Criando conversas...');
  
  const conversa = await prisma.conversa.create({
    data: {
      nome: 'Bem-vindo à equipe!',
      tipo: 'DIRETA',
      arquivada: false
    }
  });

  // Adicionar participantes
  await prisma.conversaParticipante.createMany({
    data: [
      {
        conversaId: conversa.id,
        usuarioId: empregador.id,
        papel: 'ADMIN',
        ativo: true
      },
      {
        conversaId: conversa.id,
        usuarioId: novoUsuario.id,
        papel: 'MEMBRO',
        ativo: true
      }
    ]
  });

  // Adicionar mensagens
  await prisma.mensagem.createMany({
    data: [
      {
        conversaId: conversa.id,
        remetenteId: empregador.id,
        conteudo: 'Olá João Pedro! Bem-vindo à nossa equipe. Estamos muito felizes em tê-lo conosco!',
        tipo: 'TEXTO',
        lida: true
      },
      {
        conversaId: conversa.id,
        remetenteId: novoUsuario.id,
        conteudo: 'Muito obrigado! Estou muito animado para começar.',
        tipo: 'TEXTO',
        lida: true
      }
    ]
  });
  console.log('✅ Conversa criada com 2 mensagens\n');

  // ============================================
  // CRIAR ALERTAS
  // ============================================
  console.log('🔔 Criando alertas...');
  
  await prisma.alerta.create({
    data: {
      usuario: { connect: { id: novoUsuario.id } },
      tipo: 'PRAZO',
      titulo: 'Bem-vindo ao sistema!',
      descricao: 'Complete seu cadastro e configure suas preferências.',
      prioridade: 'MEDIA',
      status: 'LIDO',
      lido: true,
      categoria: 'SISTEMA',
      dataAlerta: new Date()
    }
  });

  await prisma.alerta.create({
    data: {
      usuario: { connect: { id: novoUsuario.id } },
      tipo: 'TAREFA',
      titulo: 'Nova tarefa atribuída',
      descricao: 'Você tem 3 novas tarefas para completar.',
      prioridade: 'ALTA',
      status: 'NAO_LIDO',
      lido: false,
      categoria: 'TAREFA',
      dataAlerta: new Date()
    }
  });
  console.log('✅ 2 alertas criados\n');

  // ============================================
  // CRIAR EVENTOS ESOCIAL
  // ============================================
  console.log('📊 Criando eventos eSocial...');
  
  await prisma.eventoESocial.create({
    data: {
      tipoEvento: 'S-2200',
      descricao: 'Cadastramento Inicial do Vínculo',
      status: 'PROCESSADO',
      dataEnvio: new Date(dataInicio),
      dataProcessamento: new Date(dataInicio.getTime() + 60 * 60 * 1000),
      protocolo: `2.2.${Date.now()}`,
      versao: '2.5',
      xmlEnvio: '<eSocial><evento>S-2200</evento></eSocial>',
      xmlRetorno: '<retorno>Processado com sucesso</retorno>'
    }
  });

  await prisma.eventoESocial.create({
    data: {
      tipoEvento: 'S-1200',
      descricao: 'Remuneração do Trabalhador',
      status: 'PROCESSADO',
      dataEnvio: new Date(),
      dataProcessamento: new Date(Date.now() + 30 * 60 * 1000),
      protocolo: `1.2.${Date.now() + 1}`,
      versao: '2.5',
      xmlEnvio: '<eSocial><evento>S-1200</evento></eSocial>',
      xmlRetorno: '<retorno>Processado com sucesso</retorno>'
    }
  });
  console.log('✅ 2 eventos eSocial criados\n');

  // ============================================
  // CRIAR SESSÃO ATIVA
  // ============================================
  console.log('🔐 Criando sessão ativa...');
  
  await prisma.sessao.create({
    data: {
      usuarioId: novoUsuario.id,
      dispositivoId: dispositivo.id,
      token: `session_${Date.now()}_${novoUsuario.id}`,
      enderecoIP: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      expiraEm: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ativo: true
    }
  });
  console.log('✅ Sessão criada\n');

  // ============================================
  // CRIAR HISTÓRICO DE LOGIN
  // ============================================
  console.log('📝 Criando histórico de login...');
  
  for (let i = 0; i < 10; i++) {
    const dataLogin = new Date();
    dataLogin.setDate(dataLogin.getDate() - i);
    
    await prisma.historicoLogin.create({
      data: {
        usuarioId: novoUsuario.id,
        enderecoIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        sucesso: true
      }
    });
  }
  console.log('✅ 10 registros de login criados\n');

  console.log('📊 Métricas não disponíveis no schema atual\n');

  // ============================================
  // CRIAR ACEITE DE TERMOS
  // ============================================
  console.log('📋 Criando aceite de termos...');
  
  const termo = await prisma.termo.findFirst({
    where: { ativo: true }
  });

  if (termo) {
    await prisma.aceiteTermo.create({
      data: {
        usuario: { connect: { id: novoUsuario.id } },
        termo: { connect: { id: termo.id } },
        versao: termo.versao,
        enderecoIP: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    console.log('✅ Aceite de termos registrado\n');
  }

  // ============================================
  // RESUMO FINAL
  // ============================================
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 RESUMO DA CRIAÇÃO:');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const counts = {
    usuario: 1,
    registrosPonto: await prisma.registroPonto.count({ where: { usuarioId: novoUsuario.id } }),
    tarefas: await prisma.tarefa.count({ where: { atribuidoPara: novoUsuario.id } }),
    documentos: await prisma.documento.count({ where: { usuarioId: novoUsuario.id } }),
    conversas: await prisma.conversaParticipante.count({ where: { usuarioId: novoUsuario.id } }),
    mensagens: await prisma.mensagem.count({ where: { remetenteId: novoUsuario.id } }),
    alertas: await prisma.alerta.count({ where: { usuarioId: novoUsuario.id } }),
    eventosESocial: await prisma.eventoESocial.count(),
    sessoes: await prisma.sessao.count({ where: { usuarioId: novoUsuario.id } }),
    historicoLogin: await prisma.historicoLogin.count({ where: { usuarioId: novoUsuario.id } }),
  };

  console.log('👤 NOVO EMPREGADO:');
  console.log(`   Nome: ${novoUsuario.nomeCompleto}`);
  console.log(`   CPF: ${novoUsuario.cpf}`);
  console.log(`   Email: ${novoUsuario.email}`);
  console.log(`   Senha: senha123`);
  console.log('');
  console.log('🏢 EMPREGADOR:');
  console.log(`   Nome: ${empregador.nomeCompleto}`);
  console.log(`   CPF: ${empregador.cpf}`);
  console.log('');
  console.log('📊 DADOS CRIADOS:');
  console.log(`   🕐 Registros de Ponto: ${counts.registrosPonto} (40 dias úteis)`);
  console.log(`   ✅ Tarefas: ${counts.tarefas}`);
  console.log(`   📄 Documentos: ${counts.documentos}`);
  console.log(`   💬 Conversas: ${counts.conversas}`);
  console.log(`   💬 Mensagens: ${counts.mensagens}`);
  console.log(`   🔔 Alertas: ${counts.alertas}`);
  console.log(`   📊 Eventos eSocial: ${counts.eventosESocial}`);
  console.log(`   🔐 Sessões: ${counts.sessoes}`);
  console.log(`   📝 Histórico Login: ${counts.historicoLogin}`);
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('✅ MASSA DE DADOS CRIADA COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao criar massa de dados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

