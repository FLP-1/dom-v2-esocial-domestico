/**
 * SEED DE TERMOS E POLÍTICAS
 * 
 * Este seed popula os termos de uso e políticas de privacidade
 * para substituir dados hardcoded
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const termosUso = `
<h3>1. Aceitação dos Termos</h3>
<p>Estes Termos de Uso ("Termos") regem o uso do Sistema DOM ("Sistema", "Serviço") operado por nossa empresa ("nós", "nosso", "empresa").</p>

<h3>2. Descrição do Serviço</h3>
<p>O Sistema DOM é uma plataforma de gestão doméstica que oferece funcionalidades para:</p>
<ul>
  <li>Gestão de tarefas e atividades</li>
  <li>Controle de documentos</li>
  <li>Gestão financeira e salarial</li>
  <li>Comunicação interna</li>
  <li>Controle de acesso e segurança</li>
</ul>

<h3>3. Conta de Usuário</h3>
<p>Ao criar uma conta, você concorda em:</p>
<ul>
  <li>Fornecer informações precisas e atualizadas</li>
  <li>Manter a segurança de sua senha</li>
  <li>Ser responsável por todas as atividades em sua conta</li>
  <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
</ul>

<h3>4. Uso Aceitável</h3>
<p>Você concorda em não usar o Sistema para:</p>
<ul>
  <li>Atividades ilegais ou não autorizadas</li>
  <li>Interferir com o funcionamento do Sistema</li>
  <li>Tentar acessar contas de outros usuários</li>
  <li>Distribuir malware ou código malicioso</li>
</ul>

<h3>5. Propriedade Intelectual</h3>
<p>O Sistema e seu conteúdo são protegidos por direitos autorais e outras leis de propriedade intelectual. Você não pode copiar, modificar ou distribuir nosso conteúdo sem autorização.</p>

<h3>6. Limitação de Responsabilidade</h3>
<p>O Sistema é fornecido "como está". Não garantimos que será ininterrupto ou livre de erros. Nossa responsabilidade é limitada ao máximo permitido por lei.</p>

<h3>7. Modificações dos Termos</h3>
<p>Reservamo-nos o direito de modificar estes Termos a qualquer momento. Mudanças significativas serão comunicadas com 30 dias de antecedência.</p>

<h3>8. Rescisão</h3>
<p>Podemos suspender ou encerrar sua conta se você violar estes Termos. Você pode encerrar sua conta a qualquer momento.</p>

<h3>9. Lei Aplicável</h3>
<p>Estes Termos são regidos pelas leis brasileiras. Qualquer disputa será resolvida nos tribunais competentes do Brasil.</p>

<h3>10. Contato</h3>
<p>Para questões sobre estes Termos, entre em contato conosco através dos canais oficiais do Sistema DOM.</p>
`;

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

async function seedTermosPoliticas() {
  console.log('🌱 Iniciando seed de termos e políticas...');

  try {
    // Verificar se já existem termos
    const existingTerms = await prisma.termo.count();
    
    if (existingTerms > 0) {
      console.log('⚠️  Termos já existem. Pulando seed...');
      return;
    }

    // Criar Termos de Uso
    const termosUsoCriado = await prisma.termo.create({
      data: {
        versao: 'v2.1.0',
        tipo: 'termos_uso',
        titulo: 'Termos de Uso do Sistema DOM',
        subtitulo: 'Versão 2.1.0 - Vigente desde Janeiro 2024',
        conteudo: termosUso,
        ativo: true,
        dataVigencia: new Date('2024-01-15'),
        mudancas: ['Versão inicial dos termos de uso'],
        notificarUsuarios: false
      }
    });

    console.log(`✅ Termos de Uso criados: ${termosUsoCriado.id}`);

    // Criar Política de Privacidade
    const politicaCriada = await prisma.termo.create({
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

    console.log(`✅ Política de Privacidade criada: ${politicaCriada.id}`);

    console.log('🎉 Seed de termos e políticas concluído!');

  } catch (error) {
    console.error('❌ Erro no seed de termos e políticas:', error);
    throw error;
  }
}

export default seedTermosPoliticas;

// Executar se chamado diretamente
if (require.main === module) {
  seedTermosPoliticas()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
