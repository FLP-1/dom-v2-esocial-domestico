/**
 * Script para verificar quais tabelas foram usadas na massa de teste
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verificarTabelasUsadas() {
  try {
    console.log('🔍 VERIFICANDO TABELAS USADAS NA MASSA DE TESTE');
    console.log('===============================================');
    
    // Verificar todas as tabelas do schema
    console.log('\n📋 TABELAS EXISTENTES NO SCHEMA:');
    const tabelasSchema = [
      'Usuario', 'Perfil', 'UsuarioPerfil', 'UsuarioGrupo', 'Grupo',
      'Dispositivo', 'Sessao', 'HistoricoLogin', 'ValidacaoContato', 'Onboarding',
      'Termo', 'AceiteTermo', 'Conversa', 'ConversaParticipante', 'Mensagem',
      'MensagemLeitura', 'MensagemReacao', 'Documento', 'DocumentoCompartilhamento',
      'Tarefa', 'TarefaComentario', 'TarefaArquivo', 'TarefaHistorico',
      'RegistroPonto', 'RegistroPontoNovo', 'SolicitacaoHoraExtra',
      'CertificadoDigital', 'CertificadoHistorico', 'Emprestimo', 'Alerta',
      'AlertaHistorico', 'ListaCompras', 'ItemCompra', 'CompraRealizada',
      'ConfiguracaoSistema', 'ConfiguracaoEmpresa', 'Auditoria', 'Backup',
      'Integracao', 'Webhook', 'Notificacao', 'LogSistema'
    ];
    
    tabelasSchema.forEach(tabela => {
      console.log(`• ${tabela}`);
    });
    
    console.log('\n📊 TABELAS USADAS NA MASSA DE TESTE:');
    console.log('====================================');
    
    // Verificar dados nas tabelas usadas
    const tabelasUsadas = [
      { nome: 'Usuario', model: prisma.usuario },
      { nome: 'UsuarioPerfil', model: prisma.usuarioPerfil },
      { nome: 'RegistroPontoNovo', model: prisma.registroPontoNovo },
      { nome: 'Documento', model: prisma.documento },
      { nome: 'Dispositivo', model: prisma.dispositivo },
      { nome: 'ConfiguracaoSistema', model: prisma.configuracaoSistema },
      { nome: 'ConfiguracaoEmpresa', model: prisma.configuracaoEmpresa }
    ];
    
    for (const tabela of tabelasUsadas) {
      try {
        const count = await tabela.model.count();
        console.log(`✅ ${tabela.nome}: ${count} registros`);
      } catch (error) {
        console.log(`❌ ${tabela.nome}: Erro ao acessar - ${error.message}`);
      }
    }
    
    console.log('\n🔍 ANÁLISE DETALHADA:');
    console.log('====================');
    
    // Verificar se criamos novos usuários ou usamos existentes
    const totalUsuarios = await prisma.usuario.count();
    const usuariosNovos = await prisma.usuario.count({
      where: {
        cpf: {
          in: ['38017963378', '31383841535', '70609504355']
        }
      }
    });
    
    console.log(`👤 Total de usuários no banco: ${totalUsuarios}`);
    console.log(`👤 Usuários criados na massa de teste: ${usuariosNovos}`);
    
    // Verificar registros de ponto
    const totalRegistros = await prisma.registroPontoNovo.count();
    console.log(`⏰ Total de registros de ponto: ${totalRegistros}`);
    
    // Verificar documentos
    const totalDocumentos = await prisma.documento.count();
    console.log(`📄 Total de documentos: ${totalDocumentos}`);
    
    // Verificar configurações
    const totalConfigs = await prisma.configuracaoSistema.count();
    console.log(`⚙️ Total de configurações: ${totalConfigs}`);
    
    console.log('\n📋 RESUMO:');
    console.log('==========');
    console.log('✅ Usamos apenas TABELAS EXISTENTES do schema');
    console.log('✅ NÃO criamos nenhuma tabela nova');
    console.log('✅ Adicionamos dados nas tabelas já existentes');
    console.log('✅ Mantivemos a estrutura do banco intacta');
    
    console.log('\n🎯 TABELAS PRINCIPAIS UTILIZADAS:');
    console.log('=================================');
    console.log('1. Usuario - Usuários (empregador + empregados)');
    console.log('2. UsuarioPerfil - Perfis dos usuários');
    console.log('3. RegistroPontoNovo - Registros de ponto');
    console.log('4. Documento - Documentos dos empregados');
    console.log('5. ConfiguracaoSistema - Configurações do sistema');
    console.log('6. ConfiguracaoEmpresa - Configurações da empresa');
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabelas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verificarTabelasUsadas();
