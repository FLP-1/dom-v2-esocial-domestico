/**
 * Script para corrigir CPFs inválidos na massa de teste
 * Substitui os CPFs inválidos por CPFs válidos
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// CPFs válidos gerados
const CPFS_VALIDOS = {
  empregador: '38017963378',
  empregado1: '31383841535',
  empregado2: '70609504355'
};

// Mapeamento dos CPFs antigos para novos
const MAPEAMENTO_CPFS = {
  '59876913700': CPFS_VALIDOS.empregador,  // Empregador
  '12345678901': CPFS_VALIDOS.empregado1,  // Empregado 1
  '98765432109': CPFS_VALIDOS.empregado2   // Empregado 2
};

async function corrigirCPFs() {
  console.log('🔧 CORRIGINDO CPFs INVÁLIDOS...');
  console.log('================================');
  
  try {
    for (const [cpfAntigo, cpfNovo] of Object.entries(MAPEAMENTO_CPFS)) {
      console.log(`\n🔄 Atualizando CPF: ${cpfAntigo} → ${cpfNovo}`);
      
      // Buscar usuário pelo CPF antigo
      const usuario = await prisma.usuario.findUnique({
        where: { cpf: cpfAntigo }
      });
      
      if (usuario) {
        // Verificar se o novo CPF já existe
        const usuarioExistente = await prisma.usuario.findUnique({
          where: { cpf: cpfNovo }
        });
        
        if (usuarioExistente) {
          console.log(`⚠️ CPF ${cpfNovo} já existe, pulando...`);
          continue;
        }
        
        // Atualizar CPF
        await prisma.usuario.update({
          where: { cpf: cpfAntigo },
          data: { cpf: cpfNovo }
        });
        
        console.log(`✅ CPF atualizado: ${usuario.nomeCompleto}`);
      } else {
        console.log(`⚠️ Usuário com CPF ${cpfAntigo} não encontrado`);
      }
    }
    
    console.log('\n🎉 CPFs CORRIGIDOS COM SUCESSO!');
    console.log('===============================');
    console.log('\n🔑 NOVAS CREDENCIAIS PARA TESTE:');
    console.log(`👤 Empregador: CPF ${CPFS_VALIDOS.empregador} | Senha: 123456`);
    console.log(`👤 Empregado 1: CPF ${CPFS_VALIDOS.empregado1} | Senha: 123456`);
    console.log(`👤 Empregado 2: CPF ${CPFS_VALIDOS.empregado2} | Senha: 123456`);
    
    // Verificar dados finais
    console.log('\n📊 VERIFICAÇÃO FINAL:');
    const usuarios = await prisma.usuario.count();
    const registros = await prisma.registroPontoNovo.count();
    const documentos = await prisma.documento.count();
    const configs = await prisma.configuracaoSistema.count();
    
    console.log(`👤 Usuários: ${usuarios}`);
    console.log(`⏰ Registros de ponto: ${registros}`);
    console.log(`📄 Documentos: ${documentos}`);
    console.log(`⚙️ Configurações: ${configs}`);
    
    // Verificar empregador
    const empregador = await prisma.usuario.findUnique({
      where: { cpf: CPFS_VALIDOS.empregador }
    });
    
    if (empregador) {
      console.log(`🏢 Empregador: ${empregador.nomeCompleto} (${empregador.cpf})`);
    }
    
    // Verificar empregados
    const empregados = await prisma.usuario.findMany({
      where: {
        cpf: {
          in: [CPFS_VALIDOS.empregado1, CPFS_VALIDOS.empregado2]
        }
      }
    });
    
    console.log('\n👥 EMPREGADOS:');
    empregados.forEach(emp => {
      console.log(`• ${emp.nomeCompleto} (${emp.cpf})`);
    });
    
    console.log('\n✅ Sistema pronto para testes com CPFs válidos!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir CPFs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

corrigirCPFs();
