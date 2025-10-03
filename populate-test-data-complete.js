const { PrismaClient } = require('@prisma/client');

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

  // Gerar 9 dígitos aleatórios
  let cpf = '';
  for (let i = 0; i < 9; i++) {
    cpf += Math.floor(Math.random() * 10);
  }

  // Calcular primeiro dígito verificador
  cpf += calcularDigito(cpf, 10);
  
  // Calcular segundo dígito verificador
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

  // Gerar 12 dígitos aleatórios
  let cnpj = '';
  for (let i = 0; i < 12; i++) {
    cnpj += Math.floor(Math.random() * 10);
  }

  // Calcular primeiro dígito verificador
  cnpj += calcularDigitoCNPJ(cnpj, 12);
  
  // Calcular segundo dígito verificador
  cnpj += calcularDigitoCNPJ(cnpj, 13);

  return cnpj;
}

async function populateCompleteTestData() {
  try {
    console.log('🧪 Populando massa completa de dados de teste...');

    // 1. Configurações do Sistema Adicionais
    console.log('🔧 Criando configurações adicionais do sistema...');
    
    const configsAdicionais = [
      // Configurações de performance
      {
        chave: 'api_timeout_default',
        valor: '30000',
        tipo: 'number',
        descricao: 'Timeout padrão para APIs em milissegundos',
        categoria: 'api',
        editavel: true,
      },
      {
        chave: 'database_connection_pool',
        valor: '10',
        tipo: 'number',
        descricao: 'Tamanho do pool de conexões do banco',
        categoria: 'database',
        editavel: true,
      },
      
      // Configurações de cache
      {
        chave: 'cache_ttl_default',
        valor: '3600',
        tipo: 'number',
        descricao: 'TTL padrão do cache em segundos',
        categoria: 'cache',
        editavel: true,
      },
      {
        chave: 'cache_max_size',
        valor: '1000',
        tipo: 'number',
        descricao: 'Tamanho máximo do cache em MB',
        categoria: 'cache',
        editavel: true,
      },

      // Configurações de notificação
      {
        chave: 'notification_batch_size',
        valor: '100',
        tipo: 'number',
        descricao: 'Tamanho do lote para envio de notificações',
        categoria: 'notification',
        editavel: true,
      },
      {
        chave: 'notification_retry_attempts',
        valor: '3',
        tipo: 'number',
        descricao: 'Número de tentativas para envio de notificações',
        categoria: 'notification',
        editavel: true,
      },
    ];

    for (const config of configsAdicionais) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: config,
        create: config,
      });
    }

    console.log('✅ Configurações adicionais criadas!');

    // 2. Templates de Comunicação Adicionais
    console.log('📧 Criando templates adicionais...');
    
    const templatesAdicionais = [
      // Template de boas-vindas
      {
        nome: 'Boas-vindas',
        tipo: 'email',
        assunto: 'Bem-vindo ao DOM!',
        conteudo: `
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-title">🎉 Bem-vindo ao DOM!</h1>
            </div>
            <div class="email-body">
              <p class="email-message">
                Olá {{nome}}! Seja bem-vindo ao Sistema DOM de Gestão Doméstica.
              </p>
              <p class="info-text">
                Sua conta foi criada com sucesso em {{data}} às {{hora}}.
              </p>
              <div class="action-container">
                <a href="{{linkAtivacao}}" class="action-button">
                  Ativar Minha Conta
                </a>
              </div>
              <p class="warning-text">
                Este link expira em 24 horas.
              </p>
            </div>
            <div class="email-footer">
              <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            </div>
          </div>
        `,
        variaveis: {
          nome: 'string',
          data: 'string',
          hora: 'string',
          linkAtivacao: 'string',
        },
      },

      // Template de recuperação de senha
      {
        nome: 'Recuperação de Senha',
        tipo: 'email',
        assunto: 'Recuperação de Senha - DOM',
        conteudo: `
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-title">🔑 Recuperação de Senha</h1>
            </div>
            <div class="email-body">
              <p class="email-message">
                Olá {{nome}}! Você solicitou a recuperação de senha.
              </p>
              <div class="code-container">
                <p class="code-label">Seu código de recuperação é:</p>
                <div class="code-value">{{codigo}}</div>
              </div>
              <p class="warning-text">
                ⏰ Este código expira em <strong>15 minutos</strong>
              </p>
              <p class="info-text">
                Se você não solicitou esta recuperação, ignore este email.
              </p>
            </div>
            <div class="email-footer">
              <p class="footer-disclaimer">Este é um email automático, não responda.</p>
              <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            </div>
          </div>
        `,
        variaveis: {
          nome: 'string',
          codigo: 'string',
        },
      },

      // Template de notificação push
      {
        nome: 'Notificação Push',
        tipo: 'push',
        assunto: null,
        conteudo: `📱 DOM - {{titulo}}

{{mensagem}}

{{acao}}

{{timestamp}}`,
        variaveis: {
          titulo: 'string',
          mensagem: 'string',
          acao: 'string',
          timestamp: 'string',
        },
      },

      // Template de relatório
      {
        nome: 'Relatório Mensal',
        tipo: 'email',
        assunto: 'Relatório Mensal - {{mes}}/{{ano}}',
        conteudo: `
          <div class="email-container">
            <div class="email-header">
              <h1 class="email-title">📊 Relatório Mensal</h1>
            </div>
            <div class="email-body">
              <p class="email-message">
                Olá {{nome}}! Seu relatório mensal de {{mes}}/{{ano}} está pronto.
              </p>
              
              <div class="stats-container">
                <div class="stat-item">
                  <span class="stat-label">Eventos Enviados:</span>
                  <span class="stat-value">{{eventosEnviados}}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Eventos Processados:</span>
                  <span class="stat-value">{{eventosProcessados}}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Taxa de Sucesso:</span>
                  <span class="stat-value">{{taxaSucesso}}%</span>
                </div>
              </div>

              <div class="action-container">
                <a href="{{linkRelatorio}}" class="action-button">
                  Ver Relatório Completo
                </a>
              </div>
            </div>
            <div class="email-footer">
              <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            </div>
          </div>
        `,
        variaveis: {
          nome: 'string',
          mes: 'string',
          ano: 'string',
          eventosEnviados: 'number',
          eventosProcessados: 'number',
          taxaSucesso: 'number',
          linkRelatorio: 'string',
        },
      },
    ];

    for (const template of templatesAdicionais) {
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

    console.log('✅ Templates adicionais criados!');

    // 3. Configurações de Teste Adicionais com Dados Únicos
    console.log('🧪 Criando configurações de teste adicionais...');
    
    const configsTesteAdicionais = [
      {
        nome: 'Dados de Teste Performance',
        descricao: 'Configuração para testes de performance e carga',
        dados: {
          usuarios: [
            {
              cpf: gerarCPFValido(),
              nomeCompleto: 'Carlos Eduardo Performance',
              email: 'carlos.performance@teste.com',
              telefone: '11912345678',
            },
            {
              cpf: gerarCPFValido(),
              nomeCompleto: 'Lucia Maria Carga',
              email: 'lucia.carga@teste.com',
              telefone: '11923456789',
            },
          ],
          empresas: [
            {
              nome: 'Performance Corp LTDA',
              cnpj: gerarCNPJValido(),
              email: 'perf@performance.com',
            },
          ],
          configuracoes: {
            timeout: 5000,
            concorrencia: 100,
            iteracoes: 1000,
          },
        },
      },
      {
        nome: 'Dados de Teste Segurança',
        descricao: 'Configuração para testes de segurança e validação',
        dados: {
          usuarios: [
            {
              cpf: gerarCPFValido(),
              nomeCompleto: 'Roberto Segurança Silva',
              email: 'roberto.seguranca@teste.com',
              telefone: '11934567890',
            },
          ],
          certificados: [
            {
              cpf: gerarCPFValido(),
              senha: 'seg123456',
              arquivo: 'certificado-seguranca.pfx',
            },
          ],
          validacoes: {
            cpf: true,
            cnpj: true,
            email: true,
            telefone: true,
            senha: true,
          },
        },
      },
      {
        nome: 'Dados de Teste Integração',
        descricao: 'Configuração para testes de integração com APIs externas',
        dados: {
          apis: {
            esocial: {
              url: 'https://api-hom.esocial.gov.br',
              timeout: 30000,
              retry: 3,
            },
            govbr: {
              url: 'https://sso.acesso.gov.br',
              clientId: 'test-client-id',
              timeout: 15000,
            },
            twilio: {
              url: 'https://api.twilio.com',
              timeout: 10000,
            },
          },
          webhooks: [
            {
              url: 'https://webhook-test.com/callback',
              eventos: ['evento1', 'evento2'],
              ativo: true,
            },
          ],
        },
      },
    ];

    for (const config of configsTesteAdicionais) {
      await prisma.configuracaoTeste.upsert({
        where: { nome: config.nome },
        update: config,
        create: config,
      });
    }

    console.log('✅ Configurações de teste adicionais criadas!');

    console.log('🎉 Massa completa de dados de teste populada com sucesso!');
    console.log('📊 Resumo:');
    console.log('   - Configurações do sistema: +6');
    console.log('   - Templates de comunicação: +4');
    console.log('   - Configurações de teste: +3');
    console.log('   - Dados únicos gerados com CPF/CNPJ válidos');

  } catch (error) {
    console.error('❌ Erro ao popular massa completa de dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

populateCompleteTestData();
