import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { ActionButton } from '../components/ActionButton';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';

// Styled Components
const ContentContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  color: #2c3e50;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 1rem;
  border-bottom: 2px solid #29abe2;
  padding-bottom: 0.5rem;
`;

const Paragraph = styled.p`
  margin-bottom: 1rem;
  text-align: justify;
`;

const List = styled.ul`
  margin: 1rem 0;
  padding-left: 2rem;
`;

const ListItem = styled.li`
  margin-bottom: 0.5rem;
`;

const Highlight = styled.strong`
  color: #29abe2;
  font-weight: 600;
`;

const BackButton = styled(ActionButton)`
  margin-bottom: 2rem;
  background: transparent;
  border: 1px solid #e0e0e0;
  color: #2c3e50;

  &:hover {
    background: #f8f9fa;
    border-color: #29abe2;
    color: #29abe2;
  }
`;

const PrivacyPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={0}
          onNotificationClick={() => {}}
        />
      </TopBar>

      <PageHeader
        title='Política de Privacidade'
        subtitle='Como protegemos e utilizamos seus dados'
        theme={theme}
      />

      <ContentContainer>
        <BackButton
          variant='secondary'
          theme={theme}
          onClick={() => router.back()}
        >
          <AccessibleEmoji emoji='←' label='Voltar' /> Voltar
        </BackButton>

        <Section>
          <SectionTitle>1. Introdução</SectionTitle>
          <Paragraph>
            Esta Política de Privacidade descreve como o DOM (Domestic
            Organization Management) coleta, usa, armazena e protege suas
            informações pessoais. Respeitamos sua privacidade e estamos
            comprometidos em proteger seus dados pessoais.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Informações que Coletamos</SectionTitle>
          <Paragraph>
            Coletamos diferentes tipos de informações para fornecer e melhorar
            nossos serviços:
          </Paragraph>

          <SectionTitle style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
            2.1 Informações Pessoais
          </SectionTitle>
          <List>
            <ListItem>Nome completo e dados de identificação</ListItem>
            <ListItem>CPF e documentos pessoais</ListItem>
            <ListItem>Endereço de e-mail e telefone</ListItem>
            <ListItem>Informações profissionais e empresariais</ListItem>
            <ListItem>Dados de funcionários e colaboradores</ListItem>
          </List>

          <SectionTitle style={{ fontSize: '1.2rem', marginTop: '1.5rem' }}>
            2.2 Informações de Uso
          </SectionTitle>
          <List>
            <ListItem>Logs de acesso e atividades</ListItem>
            <ListItem>Preferências e configurações</ListItem>
            <ListItem>Dados de navegação e interação</ListItem>
            <ListItem>Informações de dispositivo e navegador</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. Como Utilizamos suas Informações</SectionTitle>
          <Paragraph>Utilizamos suas informações para:</Paragraph>
          <List>
            <ListItem>Fornecer e manter nossos serviços</ListItem>
            <ListItem>Processar transações e pagamentos</ListItem>
            <ListItem>Enviar notificações e comunicações importantes</ListItem>
            <ListItem>
              Melhorar a funcionalidade e experiência do usuário
            </ListItem>
            <ListItem>Cumprir obrigações legais e regulamentares</ListItem>
            <ListItem>Prevenir fraudes e garantir a segurança</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. Compartilhamento de Informações</SectionTitle>
          <Paragraph>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais
            com terceiros, exceto nas seguintes situações:
          </Paragraph>
          <List>
            <ListItem>Com seu consentimento explícito</ListItem>
            <ListItem>Para cumprir obrigações legais</ListItem>
            <ListItem>
              Com prestadores de serviços confiáveis (sob acordos de
              confidencialidade)
            </ListItem>
            <ListItem>
              Em caso de fusão, aquisição ou reestruturação da empresa
            </ListItem>
            <ListItem>
              Para proteger direitos, propriedade ou segurança
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>5. Segurança dos Dados</SectionTitle>
          <Paragraph>
            Implementamos medidas de segurança robustas para proteger suas
            informações:
          </Paragraph>
          <List>
            <ListItem>Criptografia de dados em trânsito e em repouso</ListItem>
            <ListItem>Controles de acesso rigorosos</ListItem>
            <ListItem>Monitoramento contínuo de segurança</ListItem>
            <ListItem>Backups regulares e seguros</ListItem>
            <ListItem>Treinamento de equipe em segurança de dados</ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>6. Seus Direitos</SectionTitle>
          <Paragraph>
            Você tem os seguintes direitos sobre seus dados pessoais:
          </Paragraph>
          <List>
            <ListItem>
              <Highlight>Acesso:</Highlight> Solicitar informações sobre dados
              que possuímos
            </ListItem>
            <ListItem>
              <Highlight>Retificação:</Highlight> Corrigir dados incorretos ou
              incompletos
            </ListItem>
            <ListItem>
              <Highlight>Exclusão:</Highlight> Solicitar a remoção de seus dados
            </ListItem>
            <ListItem>
              <Highlight>Portabilidade:</Highlight> Receber seus dados em
              formato estruturado
            </ListItem>
            <ListItem>
              <Highlight>Oposição:</Highlight> Opor-se ao processamento de seus
              dados
            </ListItem>
            <ListItem>
              <Highlight>Limitação:</Highlight> Restringir o processamento de
              seus dados
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>7. Retenção de Dados</SectionTitle>
          <Paragraph>
            Mantemos suas informações pessoais apenas pelo tempo necessário para
            cumprir os propósitos descritos nesta política, a menos que um
            período de retenção mais longo seja exigido ou permitido por lei.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>8. Cookies e Tecnologias Similares</SectionTitle>
          <Paragraph>
            Utilizamos cookies e tecnologias similares para melhorar sua
            experiência, analisar o uso do serviço e personalizar conteúdo. Você
            pode controlar o uso de cookies através das configurações do seu
            navegador.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. Transferência Internacional</SectionTitle>
          <Paragraph>
            Seus dados podem ser transferidos e processados em países diferentes
            do seu país de residência. Garantimos que tais transferências sejam
            feitas com proteções adequadas e em conformidade com as leis
            aplicáveis.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>10. Menores de Idade</SectionTitle>
          <Paragraph>
            Nossos serviços não são direcionados a menores de 18 anos. Não
            coletamos intencionalmente informações pessoais de menores. Se
            tomarmos conhecimento de tal coleta, removeremos essas informações
            imediatamente.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>11. Alterações nesta Política</SectionTitle>
          <Paragraph>
            Podemos atualizar esta Política de Privacidade periodicamente.
            Notificaremos sobre mudanças significativas através do serviço ou
            por e-mail. Recomendamos revisar esta política regularmente.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>12. Contato</SectionTitle>
          <Paragraph>
            Se você tiver dúvidas sobre esta Política de Privacidade ou sobre
            como tratamos seus dados pessoais, entre em contato conosco através
            dos canais disponíveis na plataforma.
          </Paragraph>
        </Section>

        <Paragraph
          style={{ marginTop: '2rem', textAlign: 'center', color: '#7f8c8d' }}
        >
          <em>Última atualização: {new Date().toLocaleDateString('pt-BR')}</em>
        </Paragraph>
      </ContentContainer>
    </PageContainer>
  );
};

export default PrivacyPage;
