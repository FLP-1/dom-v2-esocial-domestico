const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Popular TODAS as configurações do sistema
 * Incluindo: senhas, tokens, emails, eSocial, URLs, etc.
 */

async function popularConfiguracoes() {
  console.log('🔧 Populando configurações completas do sistema...\n');

  try {
    // ============================================
    // 1. CONFIGURAÇÕES DO SISTEMA
    // ============================================
    console.log('⚙️  Criando configurações do sistema...');
    
    const configuracoes = [
      // Sistema
      {
        chave: 'sistema_nome',
        valor: 'DOM - Doméstico Online Manager',
        tipo: 'string',
        categoria: 'sistema',
        descricao: 'Nome do sistema',
        editavel: false
      },
      {
        chave: 'sistema_versao',
        valor: '1.0.0',
        tipo: 'string',
        categoria: 'sistema',
        descricao: 'Versão atual do sistema',
        editavel: false
      },
      {
        chave: 'sistema_url_base',
        valor: 'http://localhost:3000',
        tipo: 'string',
        categoria: 'sistema',
        descricao: 'URL base da aplicação',
        editavel: true
      },
      {
        chave: 'sistema_senha_padrao',
        valor: '123456',
        tipo: 'string',
        categoria: 'sistema',
        descricao: 'Senha padrão para novos usuários',
        editavel: true
      },
      {
        chave: 'sistema_timeout_padrao',
        valor: '30000',
        tipo: 'number',
        categoria: 'sistema',
        descricao: 'Timeout padrão em milissegundos',
        editavel: true
      },
      {
        chave: 'sistema_sessao_tempo',
        valor: '86400',
        tipo: 'number',
        categoria: 'sistema',
        descricao: 'Tempo de sessão em segundos (24h)',
        editavel: true
      },

      // Geolocalização
      {
        chave: 'geolocalizacao_timeout',
        valor: '30000',
        tipo: 'number',
        categoria: 'geolocalizacao',
        descricao: 'Timeout para geolocalização em ms',
        editavel: true
      },
      {
        chave: 'geolocalizacao_precisao_maxima',
        valor: '10',
        tipo: 'number',
        categoria: 'geolocalizacao',
        descricao: 'Precisão máxima em metros',
        editavel: true
      },
      {
        chave: 'geocoding_precisao_casas',
        valor: '11',
        tipo: 'number',
        categoria: 'geolocalizacao',
        descricao: 'Casas decimais para coordenadas',
        editavel: true
      },

      // Email
      {
        chave: 'email_smtp_host',
        valor: 'smtp.gmail.com',
        tipo: 'string',
        categoria: 'email',
        descricao: 'Host SMTP para envio de emails',
        editavel: true
      },
      {
        chave: 'email_smtp_port',
        valor: '587',
        tipo: 'number',
        categoria: 'email',
        descricao: 'Porta SMTP',
        editavel: true
      },
      {
        chave: 'email_from',
        valor: 'noreply@dom.com.br',
        tipo: 'string',
        categoria: 'email',
        descricao: 'Email remetente padrão',
        editavel: true
      },

      // eSocial
      {
        chave: 'esocial_ambiente',
        valor: 'homologacao',
        tipo: 'string',
        categoria: 'esocial',
        descricao: 'Ambiente eSocial (homologacao/producao)',
        editavel: true
      },
      {
        chave: 'esocial_url_homologacao',
        valor: 'https://webservices.producaorestrita.esocial.gov.br',
        tipo: 'string',
        categoria: 'esocial',
        descricao: 'URL do eSocial homologação',
        editavel: false
      },
      {
        chave: 'esocial_url_producao',
        valor: 'https://webservices.envio.esocial.gov.br',
        tipo: 'string',
        categoria: 'esocial',
        descricao: 'URL do eSocial produção',
        editavel: false
      },

      // Empresa
      {
        chave: 'empresa_nome',
        valor: 'FLP Business Strategy',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'Nome da empresa',
        editavel: true
      },
      {
        chave: 'empresa_cnpj',
        valor: '12.345.678/0001-90',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'CNPJ da empresa',
        editavel: true
      },
      {
        chave: 'empresa_email',
        valor: 'contato@flpbusiness.com',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'Email de contato da empresa',
        editavel: true
      },
      {
        chave: 'empresa_telefone',
        valor: '11999999999',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'Telefone da empresa',
        editavel: true
      },
      {
        chave: 'empresa_razao_social',
        valor: 'FLP Business Strategy LTDA',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'Razão social da empresa',
        editavel: true
      },
      {
        chave: 'empresa_cpf_principal',
        valor: '38017963378',
        tipo: 'string',
        categoria: 'empresa',
        descricao: 'CPF do responsável principal',
        editavel: true
      },

      // Documentos
      {
        chave: 'documento_tamanho_max_mb',
        valor: '10',
        tipo: 'number',
        categoria: 'documento',
        descricao: 'Tamanho máximo de documento em MB',
        editavel: true
      },
      {
        chave: 'documento_tipos_aceitos',
        valor: JSON.stringify(['pdf', 'jpg', 'png', 'doc', 'docx']),
        tipo: 'json',
        categoria: 'documento',
        descricao: 'Tipos de arquivo aceitos',
        editavel: true
      },
      {
        chave: 'documento_pasta_upload',
        valor: '/uploads/documentos',
        tipo: 'string',
        categoria: 'documento',
        descricao: 'Pasta padrão para uploads',
        editavel: true
      },

      // Autenticação
      {
        chave: 'auth_jwt_secret',
        valor: 'your-secret-key-change-in-production',
        tipo: 'string',
        categoria: 'autenticacao',
        descricao: 'Chave secreta JWT',
        editavel: true
      },
      {
        chave: 'auth_jwt_expires_in',
        valor: '24h',
        tipo: 'string',
        categoria: 'autenticacao',
        descricao: 'Tempo de expiração do token JWT',
        editavel: true
      },
      {
        chave: 'auth_tentativas_max',
        valor: '5',
        tipo: 'number',
        categoria: 'autenticacao',
        descricao: 'Número máximo de tentativas de login',
        editavel: true
      },
      {
        chave: 'auth_bloqueio_tempo_min',
        valor: '30',
        tipo: 'number',
        categoria: 'autenticacao',
        descricao: 'Tempo de bloqueio em minutos após tentativas excedidas',
        editavel: true
      }
    ];

    for (const config of configuracoes) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: {
          valor: config.valor,
          tipo: config.tipo,
          categoria: config.categoria,
          descricao: config.descricao,
          editavel: config.editavel
        },
        create: config
      });
      console.log(`  ✅ ${config.chave}`);
    }

    console.log(`\n✅ ${configuracoes.length} configurações criadas\n`);

    // ============================================
    // 2. TERMOS DE USO E POLÍTICAS
    // ============================================
    console.log('📜 Criando termos de uso...');

    const termos = [
      {
        tipo: 'TERMOS_USO',
        versao: '1.0',
        titulo: 'Termos de Uso do Sistema DOM',
        conteudo: `
# Termos de Uso - DOM Sistema

## 1. Aceitação dos Termos
Ao utilizar o sistema DOM, você concorda com estes termos de uso.

## 2. Uso do Sistema
- O sistema destina-se à gestão de empregados domésticos
- Dados pessoais serão tratados conforme LGPD
- Usuário é responsável pela veracidade das informações

## 3. Privacidade
- Coletamos apenas dados necessários
- Dados são protegidos conforme legislação
- Não compartilhamos com terceiros sem consentimento

## 4. Responsabilidades
- Manter credenciais seguras
- Não compartilhar acesso
- Reportar problemas de segurança

Versão 1.0 - Data: ${new Date().toLocaleDateString('pt-BR')}
        `,
        obrigatorio: true,
        ativo: true
      },
      {
        tipo: 'POLITICA_PRIVACIDADE',
        versao: '1.0',
        titulo: 'Política de Privacidade',
        conteudo: `
# Política de Privacidade - DOM Sistema

## 1. Coleta de Dados
Coletamos: nome, CPF, email, telefone, endereço e dados trabalhistas.

## 2. Uso dos Dados
- Gestão de empregados domésticos
- Emissão de documentos
- Integração com eSocial

## 3. Proteção
- Criptografia de dados sensíveis
- Acesso restrito
- Backup regular

## 4. Direitos do Usuário
- Acesso aos seus dados
- Correção de dados
- Exclusão de dados (quando aplicável)

## 5. LGPD
Estamos em conformidade com a Lei Geral de Proteção de Dados.

Versão 1.0 - Data: ${new Date().toLocaleDateString('pt-BR')}
        `,
        obrigatorio: true,
        ativo: true
      }
    ];

    for (const termo of termos) {
      await prisma.termo.upsert({
        where: {
          versao: termo.versao
        },
        update: termo,
        create: termo
      });
      console.log(`  ✅ ${termo.titulo}`);
    }

    console.log(`\n✅ ${termos.length} termos criados\n`);

    // ============================================
    // 3. RESUMO FINAL
    // ============================================
    console.log('📊 RESUMO:');
    console.log('  ═══════════════════════════════════════');
    
    const totalConfigs = await prisma.configuracaoSistema.count();
    console.log(`  ⚙️  Configurações: ${totalConfigs}`);
    
    const totalTermos = await prisma.termo.count();
    console.log(`  📜 Termos: ${totalTermos}`);
    
    const configsPorCategoria = await prisma.configuracaoSistema.groupBy({
      by: ['categoria'],
      _count: true
    });
    
    console.log('\n  📋 Por categoria:');
    configsPorCategoria.forEach(c => {
      console.log(`     ${c.categoria}: ${c._count}`);
    });
    
    console.log('  ═══════════════════════════════════════');
    console.log('\n✅ Configurações completas populadas com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao popular configurações:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

popularConfiguracoes();

