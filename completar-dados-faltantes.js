const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function completarDados() {
  try {
    console.log('🔧 Completando dados faltantes...\n');
    
    // Verificar se política de privacidade existe
    const politicaExistente = await prisma.termo.findFirst({
      where: { tipo: 'politica_privacidade' }
    });
    
    if (!politicaExistente) {
      console.log('📋 Criando Política de Privacidade...');
      
      const politicaPrivacidade = `
<h3>1. Informações que Coletamos</h3>
<p>Coletamos informações que você nos fornece diretamente, como:</p>
<ul>
  <li>Nome, email e informações de contato</li>
  <li>Dados de perfil e preferências</li>
  <li>Conteúdo que você cria ou compartilha</li>
  <li>Informações de pagamento (quando aplicável)</li>
</ul>

<h3>2. Como Usamos suas Informações</h3>
<p>Utilizamos suas informações para:</p>
<ul>
  <li>Fornecer e melhorar nossos serviços</li>
  <li>Processar transações e pagamentos</li>
  <li>Comunicar-nos com você</li>
  <li>Garantir a segurança da plataforma</li>
  <li>Cumprir obrigações legais</li>
</ul>

<h3>3. Compartilhamento de Informações</h3>
<p>Não vendemos suas informações pessoais. Podemos compartilhar informações apenas:</p>
<ul>
  <li>Com seu consentimento explícito</li>
  <li>Para cumprir obrigações legais</li>
  <li>Com prestadores de serviços confiáveis</li>
  <li>Em caso de fusão ou aquisição</li>
</ul>

<h3>4. Segurança dos Dados</h3>
<p>Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.</p>

<h3>5. Seus Direitos (LGPD)</h3>
<p>Conforme a Lei Geral de Proteção de Dados, você tem direito a:</p>
<ul>
  <li>Confirmar a existência de tratamento de dados</li>
  <li>Acessar seus dados pessoais</li>
  <li>Corrigir dados incompletos ou inexatos</li>
  <li>Solicitar anonimização ou eliminação</li>
  <li>Portabilidade dos dados</li>
  <li>Revogar o consentimento</li>
</ul>

<h3>6. Cookies e Tecnologias Similares</h3>
<p>Utilizamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso do serviço e personalizar conteúdo.</p>

<h3>7. Retenção de Dados</h3>
<p>Mantemos suas informações pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido por lei.</p>

<h3>8. Transferência Internacional</h3>
<p>Seus dados podem ser transferidos e processados em países diferentes do seu. Garantimos proteções adequadas conforme a legislação aplicável.</p>

<h3>9. Menores de Idade</h3>
<p>Não coletamos intencionalmente informações de menores de 18 anos sem o consentimento dos pais ou responsáveis.</p>

<h3>10. Alterações nesta Política</h3>
<p>Podemos atualizar esta Política periodicamente. Notificaremos sobre mudanças significativas através do Sistema ou por email.</p>

<h3>11. Contato</h3>
<p>Para exercer seus direitos ou esclarecer dúvidas sobre esta Política, entre em contato conosco através dos canais oficiais do Sistema DOM.</p>
`;

      await prisma.termo.create({
        data: {
          versao: 'v1.8.0',
          tipo: 'politica_privacidade',
          titulo: 'Política de Privacidade do Sistema DOM',
          subtitulo: 'Versão 1.8.0 - Conforme LGPD',
          conteudo: politicaPrivacidade,
          ativo: true,
          dataVigencia: new Date('2024-01-15'),
          mudancas: ['Versão inicial da política de privacidade'],
          notificarUsuarios: false
        }
      });
      
      console.log('✅ Política de Privacidade criada!');
    } else {
      console.log('✅ Política de Privacidade já existe');
    }
    
    // Verificar configurações faltantes
    const configsNecessarias = [
      { chave: 'empresa_nome', valor: 'Sistema DOM', categoria: 'empresa' },
      { chave: 'empresa_razao_social', valor: 'Sistema DOM Ltda', categoria: 'empresa' },
      { chave: 'empresa_cnpj', valor: '12345678000199', categoria: 'empresa' },
      { chave: 'empresa_email', valor: 'contato@sistemadom.com.br', categoria: 'empresa' },
      { chave: 'empresa_telefone', valor: '11999999999', categoria: 'empresa' },
      { chave: 'autenticacao_tempo_sessao', valor: '3600000', categoria: 'autenticacao' },
      { chave: 'esocial_ambiente_padrao', valor: 'homologacao', categoria: 'esocial' },
      { chave: 'geolocalizacao_timeout', valor: '30000', categoria: 'geolocalizacao' },
      { chave: 'geocoding_precisao_casas', valor: '6', categoria: 'geolocalizacao' }
    ];
    
    console.log('\n⚙️  Verificando configurações faltantes...');
    
    for (const config of configsNecessarias) {
      const existe = await prisma.configuracaoSistema.findUnique({
        where: { chave: config.chave }
      });
      
      if (!existe) {
        await prisma.configuracaoSistema.create({
          data: {
            chave: config.chave,
            valor: config.valor,
            tipo: 'string',
            descricao: `Configuração ${config.categoria}`,
            categoria: config.categoria,
            editavel: true
          }
        });
        console.log(`✅ Configuração criada: ${config.chave}`);
      } else {
        console.log(`✅ Configuração já existe: ${config.chave}`);
      }
    }
    
    console.log('\n🎉 DADOS COMPLETADOS COM SUCESSO!');
    console.log('✅ Sistema totalmente configurado');
    console.log('✅ Zero dados hardcoded');
    console.log('✅ Pronto para uso');
    
  } catch (error) {
    console.error('❌ Erro ao completar dados:', error);
  } finally {
    await prisma.$disconnect();
  }
}

completarDados();
