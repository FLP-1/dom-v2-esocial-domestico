const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function populateConfigData() {
  try {
    console.log('🔧 Populando configurações do sistema...');

    // Configurações do sistema
    const configuracoes = [
      // Configurações de teste
      {
        chave: 'test_base_url',
        valor: 'http://localhost:3000',
        tipo: 'string',
        descricao: 'URL base para testes automatizados',
        categoria: 'teste',
        editavel: true,
      },
      {
        chave: 'test_timeout',
        valor: '30000',
        tipo: 'number',
        descricao: 'Timeout para testes em milissegundos',
        categoria: 'teste',
        editavel: true,
      },
      {
        chave: 'test_retries',
        valor: '3',
        tipo: 'number',
        descricao: 'Número de tentativas em caso de falha',
        categoria: 'teste',
        editavel: true,
      },

      // Configurações de Sentry
      {
        chave: 'sentry_org',
        valor: 'your-org',
        tipo: 'string',
        descricao: 'Organização do Sentry',
        categoria: 'monitoramento',
        editavel: true,
      },
      {
        chave: 'sentry_project',
        valor: 'dom-v2',
        tipo: 'string',
        descricao: 'Projeto do Sentry',
        categoria: 'monitoramento',
        editavel: true,
      },

      // Configurações de Twilio
      {
        chave: 'twilio_phone_number',
        valor: '+12183668060',
        tipo: 'string',
        descricao: 'Número de telefone padrão do Twilio',
        categoria: 'sms',
        editavel: true,
      },

      // Configurações de performance
      {
        chave: 'performance_threshold_api',
        valor: '2000',
        tipo: 'number',
        descricao: 'Threshold de performance para APIs (ms)',
        categoria: 'performance',
        editavel: true,
      },
      {
        chave: 'performance_threshold_ui',
        valor: '1000',
        tipo: 'number',
        descricao: 'Threshold de performance para UI (ms)',
        categoria: 'performance',
        editavel: true,
      },

      // Configurações de segurança
      {
        chave: 'max_login_attempts',
        valor: '5',
        tipo: 'number',
        descricao: 'Máximo de tentativas de login',
        categoria: 'seguranca',
        editavel: true,
      },
      {
        chave: 'session_timeout',
        valor: '3600000',
        tipo: 'number',
        descricao: 'Timeout da sessão em milissegundos',
        categoria: 'seguranca',
        editavel: true,
      },
    ];

    for (const config of configuracoes) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: config,
        create: config,
      });
    }

    console.log('✅ Configurações do sistema criadas!');

    // Templates de comunicação
    console.log('📧 Criando templates de comunicação...');

    const templates = [
      // Template de validação de email
      {
        nome: 'Validação de Email',
        tipo: 'email',
        assunto: 'Código de Validação - Email',
        conteudo: `
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-title">🔐 Validação de Email</h1>
            </div>
            <div class="email-body">
              <p class="email-message">
                Olá! Você solicitou a validação do seu endereço de email.
              </p>
              <div class="code-container">
                <p class="code-label">Seu código de validação é:</p>
                <div class="code-value">{{codigo}}</div>
              </div>
              <p class="warning-text">
                ⏰ Este código expira em <strong>5 minutos</strong>
              </p>
              <p class="info-text">
                Se você não solicitou esta validação, ignore este email.
              </p>
            </div>
            <div class="email-footer">
              <p class="footer-disclaimer">Este é um email automático, não responda.</p>
              <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            </div>
          </div>
        `,
        variaveis: {
          codigo: 'string',
        },
      },

      // Template de validação SMS
      {
        nome: 'Validação SMS',
        tipo: 'sms',
        assunto: null,
        conteudo: `🔐 DOM - Validação Telefone

Código: {{codigo}}

⏰ Expira em 5 min

Não solicitou? Ignore esta mensagem.

© 2024 DOM Sistema`,
        variaveis: {
          codigo: 'string',
        },
      },

      // Template de confirmação
      {
        nome: 'Confirmação de Ação',
        tipo: 'email',
        assunto: 'Ação Confirmada - DOM',
        conteudo: `
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-title">✅ Ação Confirmada</h1>
            </div>
            <div class="email-body">
              <p class="email-message">
                Sua ação "{{acao}}" foi processada com sucesso.
              </p>
              <p class="info-text">
                Data: {{data}}<br>
                Hora: {{hora}}
              </p>
            </div>
            <div class="email-footer">
              <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            </div>
          </div>
        `,
        variaveis: {
          acao: 'string',
          data: 'string',
          hora: 'string',
        },
      },

      // Template de alerta
      {
        nome: 'Alerta do Sistema',
        tipo: 'sms',
        assunto: null,
        conteudo: `⚠️ DOM - Alerta

{{mensagem}}

Verifique sua conta para mais detalhes.

© 2024 DOM Sistema`,
        variaveis: {
          mensagem: 'string',
        },
      },
    ];

    for (const template of templates) {
      // Verificar se já existe
      const existing = await prisma.templateComunicacao.findFirst({
        where: { 
          nome: template.nome,
          tipo: template.tipo 
        },
      });

      if (existing) {
        await prisma.templateComunicacao.update({
          where: { id: existing.id },
          data: template,
        });
      } else {
        await prisma.templateComunicacao.create({
          data: template,
        });
      }
    }

    console.log('✅ Templates de comunicação criados!');

    // Configurações de teste
    console.log('🧪 Criando configurações de teste...');

    const configTestes = [
      {
        nome: 'Dados de Teste Padrão',
        descricao: 'Configuração padrão para testes automatizados',
        dados: {
          usuarios: [
            {
              cpf: '11122233344',
              nomeCompleto: 'Maria Silva Santos',
              email: 'maria.silva@teste.com',
              telefone: '11987654321',
            },
            {
              cpf: '55566677788',
              nomeCompleto: 'João Oliveira Costa',
              email: 'joao.oliveira@teste.com',
              telefone: '11976543210',
            },
            {
              cpf: '99988877766',
              nomeCompleto: 'Ana Paula Ferreira',
              email: 'ana.ferreira@teste.com',
              telefone: '11965432109',
            },
          ],
          empregadores: [
            {
              nome: 'Empresa Teste LTDA',
              cpfCnpj: '12345678000199',
              email: 'contato@empresateste.com',
            },
            {
              nome: 'Corporação Exemplo S/A',
              cpfCnpj: '98765432000188',
              email: 'admin@exemplo.com',
            },
          ],
          certificados: [
            {
              cpf: '11122233344',
              senha: 'cert123456',
              arquivo: 'certificado-maria.pfx',
            },
            {
              cpf: '55566677788',
              senha: 'cert789012',
              arquivo: 'certificado-joao.pfx',
            },
          ],
        },
      },
      {
        nome: 'Dados de Teste eSocial',
        descricao: 'Configuração específica para testes do eSocial',
        dados: {
          ambiente: 'homologacao',
          versao: '2.5.0',
          eventos: ['S-1000', 'S-1005', 'S-1010', 'S-1020', 'S-2200', 'S-2230', 'S-2240', 'S-2250'],
          protocolos: {
            sucesso: 'ESOCIAL-TESTE-001',
            erro: 'ESOCIAL-TESTE-002',
            processamento: 'ESOCIAL-TESTE-003',
            rejeitado: 'ESOCIAL-TESTE-004',
          },
          urls: {
            producao: 'https://webservices.envio.esocial.gov.br',
            homologacao: 'https://webservices.producaorestrita.esocial.gov.br',
          },
          timeouts: {
            conexao: 30000,
            resposta: 60000,
            tentativas: 3,
          },
        },
      },
    ];

    for (const config of configTestes) {
      await prisma.configuracaoTeste.upsert({
        where: { nome: config.nome },
        update: config,
        create: config,
      });
    }

    console.log('✅ Configurações de teste criadas!');

    console.log('🎉 Dados de configuração populados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular dados de configuração:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateConfigData();
