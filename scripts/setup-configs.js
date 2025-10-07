const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupConfigs() {
  console.log('⚙️ Criando configurações do sistema...');
  
  const configs = [
    {
      chave: 'empresa_cpf_principal',
      valor: '59876913700',
      descricao: 'CPF principal da empresa',
      categoria: 'empresa',
      tipo: 'string',
      obrigatorio: true
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
      obrigatorio: true
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
      valor: 'http://localhost:3000',
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
      obrigatorio: true
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
      chave: 'autenticacao_tempo_sessao',
      valor: '86400',
      descricao: 'Tempo de sessão em segundos (24 horas)',
      categoria: 'sistema',
      tipo: 'number',
      obrigatorio: true
    }
  ];

  for (const config of configs) {
    await prisma.configuracaoSistema.upsert({
      where: { chave: config.chave },
      update: config,
      create: config
    });
    console.log('✅ Configuração:', config.chave);
  }
  
  await prisma.$disconnect();
  console.log('🎉 Configurações criadas!');
}

setupConfigs().catch(console.error);
