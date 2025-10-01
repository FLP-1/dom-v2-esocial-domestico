import { useRouter } from 'next/router';
import { useState } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import { OptimizedSectionTitle } from '../components/shared/optimized-styles';

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

const BackButton = styled(UnifiedButton)`
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

const TermsPage: React.FC = () => {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={0}
          onNotificationClick={() => {}}
        />
      </TopBar>

      <PageHeader
        title='Termos de Uso'
        subtitle='Conheça nossos termos e condições'
        $theme={theme}
      />

      <ContentContainer>
        <BackButton
          $variant='secondary'
          $theme={theme}
          onClick={() => router.back()}
        >
          <AccessibleEmoji emoji='←' label='Voltar' /> Voltar
        </BackButton>

        <Section>
          <OptimizedSectionTitle>1. Aceitação dos Termos</OptimizedSectionTitle>
          <Paragraph>
            Ao utilizar o sistema DOM (Domestic Organization Management), você
            concorda em cumprir e estar vinculado a estes Termos de Uso. Se você
            não concordar com qualquer parte destes termos, não deve utilizar
            nosso serviço.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>2. Descrição do Serviço</OptimizedSectionTitle>
          <Paragraph>
            O DOM é uma plataforma de gestão doméstica e empresarial que
            oferece:
          </Paragraph>
          <List>
            <ListItem>Gestão de tarefas e atividades domésticas</ListItem>
            <ListItem>Controle de documentos e prazos</ListItem>
            <ListItem>Gestão de funcionários e folha de pagamento</ListItem>
            <ListItem>Integração com sistemas eSocial</ListItem>
            <ListItem>Comunicação interna e notificações</ListItem>
            <ListItem>Relatórios e dashboards personalizados</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>3. Conta de Usuário</OptimizedSectionTitle>
          <Paragraph>
            Para utilizar nossos serviços, você deve criar uma conta fornecendo
            informações precisas e atualizadas. Você é responsável por:
          </Paragraph>
          <List>
            <ListItem>Manter a confidencialidade de sua senha</ListItem>
            <ListItem>Todas as atividades que ocorrem em sua conta</ListItem>
            <ListItem>
              Notificar-nos imediatamente sobre qualquer uso não autorizado
            </ListItem>
            <ListItem>Fornecer informações precisas e atualizadas</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>4. Uso Aceitável</OptimizedSectionTitle>
          <Paragraph>Você concorda em não utilizar o serviço para:</Paragraph>
          <List>
            <ListItem>Atividades ilegais ou não autorizadas</ListItem>
            <ListItem>Transmitir vírus ou código malicioso</ListItem>
            <ListItem>Tentar obter acesso não autorizado aos sistemas</ListItem>
            <ListItem>Interferir no funcionamento normal do serviço</ListItem>
            <ListItem>Violar direitos de propriedade intelectual</ListItem>
          </List>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            5. Privacidade e Proteção de Dados
          </OptimizedSectionTitle>
          <Paragraph>
            Respeitamos sua privacidade e protegemos seus dados pessoais de
            acordo com nossa <Highlight>Política de Privacidade</Highlight>.
            Todos os dados são tratados com segurança e confidencialidade,
            seguindo as melhores práticas de proteção de dados.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            6. Propriedade Intelectual
          </OptimizedSectionTitle>
          <Paragraph>
            O DOM e todo seu conteúdo, incluindo textos, gráficos, logotipos,
            ícones e software, são propriedade da empresa e estão protegidos por
            leis de direitos autorais e outras leis de propriedade intelectual.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            7. Limitação de Responsabilidade
          </OptimizedSectionTitle>
          <Paragraph>
            O serviço é fornecido &quot;como está&quot; sem garantias de
            qualquer tipo. Não nos responsabilizamos por danos diretos,
            indiretos, incidentais ou consequenciais resultantes do uso do
            serviço.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>
            8. Modificações dos Termos
          </OptimizedSectionTitle>
          <Paragraph>
            Reservamo-nos o direito de modificar estes termos a qualquer
            momento. As alterações entrarão em vigor imediatamente após a
            publicação. O uso continuado do serviço constitui aceitação dos
            novos termos.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>9. Rescisão</OptimizedSectionTitle>
          <Paragraph>
            Podemos suspender ou encerrar sua conta a qualquer momento, com ou
            sem aviso prévio, por violação destes termos ou por qualquer outro
            motivo a nosso critério.
          </Paragraph>
        </Section>

        <Section>
          <OptimizedSectionTitle>10. Contato</OptimizedSectionTitle>
          <Paragraph>
            Se você tiver dúvidas sobre estes Termos de Uso, entre em contato
            conosco através dos canais disponíveis na plataforma.
          </Paragraph>
        </Section>

        <Paragraph>
          <em></em>
        </Paragraph>
      </ContentContainer>
    </PageContainer>
  );
};

export default TermsPage;
