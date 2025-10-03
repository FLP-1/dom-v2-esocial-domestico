const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateEssentialData() {
  try {
    console.log('🌱 Populando dados essenciais...');

    // Criar usuário principal
    const usuario = await prisma.usuario.create({
      data: {
        cpf: '59876913700',
        nomeCompleto: 'Francisco Jose Lattari Papaleo',
        email: 'francisco@flpbusiness.com',
        telefone: '11999999999',
        dataNascimento: new Date('1980-01-01'),
        senhaHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        salt: 'salt123',
        ativo: true,
        consentimentoLGPD: true,
        dataConsentimento: new Date(),
        termosAceitos: true,
        versaoTermos: 'v2.1.0',
      },
    });

    // Criar folha de pagamento
    await prisma.folhaPagamento.create({
      data: {
        usuarioId: usuario.id,
        empregadoId: usuario.id,
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
    });

    // Criar guias de impostos
    await prisma.guiaImposto.create({
      data: {
        usuarioId: usuario.id,
        tipo: 'INSS',
        mes: 1,
        ano: 2024,
        valor: 150.0,
        vencimento: new Date('2024-02-15'),
        status: 'PAGO',
        observacoes: 'INSS janeiro/2024',
      },
    });

    // Criar métricas do sistema
    await prisma.metricaSistema.createMany({
      data: [
        {
          chave: 'eventos_enviados',
          valor: 1250,
          descricao: 'Total de eventos eSocial enviados',
          categoria: 'esocial',
        },
        {
          chave: 'eventos_processados',
          valor: 1180,
          descricao: 'Total de eventos eSocial processados',
          categoria: 'esocial',
        },
        {
          chave: 'eventos_com_erro',
          valor: 15,
          descricao: 'Total de eventos eSocial com erro',
          categoria: 'esocial',
        },
        {
          chave: 'webhooks_ativos',
          valor: 3,
          descricao: 'Total de webhooks ativos',
          categoria: 'webhook',
        },
        {
          chave: 'backups_realizados',
          valor: 28,
          descricao: 'Total de backups realizados',
          categoria: 'backup',
        },
        {
          chave: 'logs_auditoria',
          valor: 15420,
          descricao: 'Total de logs de auditoria',
          categoria: 'auditoria',
        },
      ],
    });

    // Criar atividade recente
    await prisma.atividadeRecente.createMany({
      data: [
        {
          tipo: 'success',
          titulo: 'Evento S-2200 processado',
          descricao: 'Protocolo ESOCIAL-123456789',
          usuarioId: usuario.id,
          dados: {
            protocolo: 'ESOCIAL-123456789',
            evento: 'S-2200',
            status: 'processado',
          },
        },
        {
          tipo: 'warning',
          titulo: 'Webhook com falha',
          descricao: '3 tentativas falharam',
          usuarioId: usuario.id,
          dados: {
            webhookId: 'webhook_001',
            tentativas: 3,
            ultimoErro: 'Connection timeout',
          },
        },
        {
          tipo: 'success',
          titulo: 'Backup realizado',
          descricao: 'Backup completo - 2.5MB',
          usuarioId: usuario.id,
          dados: {
            tamanho: '2.5MB',
            tipo: 'completo',
            duracao: '15 minutos',
          },
        },
      ],
    });

    console.log('✅ Dados essenciais populados com sucesso!');
    console.log('🔑 CREDENCIAIS:');
    console.log('   📧 Email: francisco@flpbusiness.com');
    console.log('   🔒 Senha: senha123');
    console.log('   👤 CPF: 598.769.137-00');

  } catch (error) {
    console.error('❌ Erro ao popular dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateEssentialData();
