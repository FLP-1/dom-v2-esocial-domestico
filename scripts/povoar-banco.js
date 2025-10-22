// Script para povoar banco de dados com dados específicos
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function povoarBanco() {
  try {
    console.log('🗄️ Iniciando povoamento da base de dados...');

    // 1. Buscar usuário existente (Francisco)
    console.log('👤 Buscando usuário existente...');
    const usuario = await prisma.usuario.findUnique({
      where: { cpf: '59876913700' }
    });
    
    if (!usuario) {
      throw new Error('Usuário com CPF 59876913700 não encontrado. Execute o seed principal primeiro.');
    }
    console.log('✅ Usuário encontrado:', usuario.nomeCompleto);

    // 2. Buscar grupo existente do Francisco
    console.log('🏢 Buscando grupo do usuário...');
    const usuarioGrupo = await prisma.usuarioGrupo.findFirst({
      where: { usuarioId: usuario.id },
      include: { grupo: true }
    });
    
    if (!usuarioGrupo) {
      throw new Error('Usuário não está associado a nenhum grupo. Execute o seed principal primeiro.');
    }
    
    const grupo = usuarioGrupo.grupo;
    console.log('✅ Grupo encontrado:', grupo.nome);

    // 3. Relação usuário-grupo já existe (não precisa criar)
    console.log('✅ Relação usuário-grupo já existe');

    // 4. Criar local de trabalho
    console.log('📍 Criando local de trabalho...');
    const localTrabalho = await prisma.localTrabalho.upsert({
      where: { id: 'local-teste-001' },
      update: {},
      create: {
        id: 'local-teste-001',
        nome: 'Local Principal',
        endereco: 'R. Dias de Toledo, 402',
        latitude: -23.614044208984254,
        longitude: -46.63352514948363,
        raio: 50,
        ativo: true,
        empregador: {
          connect: { id: usuario.id }
        },
        criador: {
          connect: { id: usuario.id }
        },
        grupo: {
          connect: { id: grupo.id }
        },
        criadoEm: new Date()
      }
    });
    console.log('✅ Local de trabalho criado:', localTrabalho.nome);

    console.log('🎯 Dados inseridos com sucesso!');
    console.log('📊 Usuário:', usuario.id);
    console.log('🏢 Grupo:', grupo.nome);
    console.log('📍 Local:', localTrabalho.nome, '-', localTrabalho.endereco);
    console.log('📏 Coordenadas:', localTrabalho.latitude, ',', localTrabalho.longitude);
    console.log('🎯 Raio:', localTrabalho.raio, 'm');

  } catch (error) {
    console.error('❌ Erro ao povoar banco:', error);
  } finally {
    await prisma.$disconnect();
  }
}

povoarBanco();
