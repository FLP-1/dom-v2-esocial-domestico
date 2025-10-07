const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificar() {
  try {
    const usuarios = await prisma.usuario.count();
    const registros = await prisma.registroPontoNovo.count();
    const documentos = await prisma.documento.count();
    const configs = await prisma.configuracaoSistema.count();
    
    console.log('📊 DADOS CRIADOS:');
    console.log('👤 Usuários:', usuarios);
    console.log('⏰ Registros de ponto:', registros);
    console.log('📄 Documentos:', documentos);
    console.log('⚙️ Configurações:', configs);
    
    const empregador = await prisma.usuario.findUnique({ 
      where: { cpf: '59876913700' } 
    });
    console.log('🏢 Empregador:', empregador?.nomeCompleto);
    
    const empregados = await prisma.usuario.findMany({
      where: {
        cpf: {
          in: ['12345678901', '98765432109']
        }
      }
    });
    
    console.log('\n👥 EMPREGADOS:');
    empregados.forEach(emp => {
      console.log(`• ${emp.nomeCompleto} (${emp.cpf})`);
    });
    
    console.log('\n✅ Massa de teste criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificar();
