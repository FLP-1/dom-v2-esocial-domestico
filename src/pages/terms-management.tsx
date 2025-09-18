import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { ActionButton } from '../components/ActionButton';
import { Form, FormGroup, Input } from '../components/FormComponents';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '../components/Modal';
import Sidebar from '../components/Sidebar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// CSS Global para textarea
const GlobalStyle = styled.div`
  .document-textarea {
    width: 100%;
    height: 400px;
    padding: 1rem;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 1rem;
    font-family: 'Roboto', sans-serif;
    resize: vertical;
    transition: border-color 0.3s ease;

    &:focus {
      outline: none;
      border-color: #29abe2;
    }
  }
`;

// Styled Components
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  animation: ${fadeIn} 0.6s ease-out;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 2rem;
  margin-left: 280px;
  max-width: calc(100vw - 280px);
  overflow-x: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-family: 'Montserrat', sans-serif;
  font-size: 2.5rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: ${props => props.theme?.colors?.text || '#666'};
  margin: 0.5rem 0 0 0;
  opacity: 0.8;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  margin-bottom: 2rem;
`;

const DocumentSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const DocumentTabs = styled.div`
  display: flex;
  margin-bottom: 2rem;
  border-bottom: 2px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
`;

const TabButton = styled.button<{ $active?: boolean; $theme: any }>`
  padding: 1rem 2rem;
  border: none;
  background: ${props =>
    props.$active ? props.$theme?.colors?.primary || '#29ABE2' : 'transparent'};
  color: ${props =>
    props.$active ? 'white' : props.$theme?.colors?.text || '#666'};
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background: ${props =>
      props.$active
        ? props.$theme?.colors?.primary || '#29ABE2'
        : props.$theme?.colors?.primary || '#29ABE2'}20;
    color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  }

  ${props =>
    props.$active &&
    `
    &::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${props.$theme?.colors?.primary || '#29ABE2'};
    }
  `}
`;

const DocumentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
`;

const DocumentTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.8rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0;
`;

const VersionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const VersionBadge = styled.span<{ $theme: any }>`
  background: ${props => props.$theme?.colors?.success || '#90EE90'};
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const EffectiveDate = styled.span`
  color: ${props => props.theme?.colors?.text || '#666'};
  font-size: 0.9rem;
`;

const DocumentContent = styled.div`
  max-height: 600px;
  overflow-y: auto;
  padding: 1rem;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
  line-height: 1.6;
  font-size: 0.95rem;

  h3 {
    color: ${props => props.theme?.colors?.primary || '#29ABE2'};
    margin-top: 2rem;
    margin-bottom: 1rem;
    font-family: 'Montserrat', sans-serif;
  }

  h4 {
    color: ${props => props.theme?.colors?.text || '#333'};
    margin-top: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    margin-bottom: 1rem;
    text-align: justify;
  }

  ul,
  ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin-bottom: 0.5rem;
  }

  strong {
    color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  }
`;

const DocumentActions = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
`;

const SidebarSection = styled.div`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  height: fit-content;
`;

const SidebarTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0 0 1.5rem 0;
`;

const VersionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const VersionItem = styled.div<{ $active?: boolean; $theme: any }>`
  padding: 1rem;
  border-radius: 8px;
  border: 2px solid
    ${props =>
      props.$active
        ? props.$theme?.colors?.primary || '#29ABE2'
        : props.$theme?.colors?.border || '#e0e0e0'};
  background: ${props =>
    props.$active
      ? `${props.$theme?.colors?.primary || '#29ABE2'}10`
      : 'white'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    background: ${props => props.$theme?.colors?.primary || '#29ABE2'}10;
  }
`;

const VersionNumber = styled.div`
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const VersionDate = styled.div`
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.text || '#666'};
`;

const VersionStatus = styled.span<{ $theme: any }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 0.5rem;
  background: ${props => props.$theme?.colors?.success || '#90EE90'};
  color: white;
`;

const AdminSection = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid ${props => props.theme?.colors?.border || '#e0e0e0'};
`;

const AdminTitle = styled.h4`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.theme?.colors?.primary || '#29ABE2'};
  margin: 0 0 1rem 0;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border-left: 4px solid ${props => props.$theme?.colors?.primary || '#29ABE2'};
`;

const StatNumber = styled.div<{ $theme: any }>`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme?.colors?.text || '#666'};
  font-size: 0.9rem;
  font-weight: 500;
`;

// Interfaces
interface DocumentVersion {
  id: string;
  version: string;
  effectiveDate: string;
  content: string;
  isActive: boolean;
  changes: string[];
}

interface TermsData {
  termsOfUse: DocumentVersion[];
  privacyPolicy: DocumentVersion[];
}

// Dados mockados
const mockTermsData: TermsData = {
  termsOfUse: [
    {
      id: '1',
      version: 'v2.1.0',
      effectiveDate: '2024-01-15',
      content: `
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
      `,
      isActive: true,
      changes: [
        'Atualização de políticas de segurança',
        'Novos termos de responsabilidade',
      ],
    },
    {
      id: '2',
      version: 'v2.0.0',
      effectiveDate: '2023-12-01',
      content: 'Versão anterior dos Termos de Uso...',
      isActive: false,
      changes: ['Versão anterior'],
    },
  ],
  privacyPolicy: [
    {
      id: '1',
      version: 'v1.8.0',
      effectiveDate: '2024-01-15',
      content: `
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
      `,
      isActive: true,
      changes: ['Atualização conforme LGPD', 'Novos direitos do titular'],
    },
  ],
};

const TermsManagement: React.FC = () => {
  const router = useRouter();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const [collapsed, setCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [selectedVersion, setSelectedVersion] = useState<string>('1');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentVersion | null>(null);
  const [documents, setDocuments] = useState<TermsData>(mockTermsData);

  const currentDocument =
    activeTab === 'terms'
      ? documents.termsOfUse.find(v => v.id === selectedVersion)
      : documents.privacyPolicy.find(v => v.id === selectedVersion);

  const currentVersions =
    activeTab === 'terms' ? documents.termsOfUse : documents.privacyPolicy;
  const activeVersion = currentVersions.find(v => v.isActive);

  const handleEditDocument = () => {
    if (currentDocument) {
      setEditingDocument(currentDocument);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveDocument = (updatedContent: string) => {
    if (!editingDocument) return;

    const newVersion: DocumentVersion = {
      ...editingDocument,
      id: Date.now().toString(),
      version: `v${parseFloat(editingDocument.version.substring(1)) + 0.1}`,
      effectiveDate: new Date().toISOString().split('T')[0]!,
      content: updatedContent,
      isActive: true,
      changes: ['Atualização de conteúdo'],
    };

    // Desativar versão anterior
    const updatedVersions = currentVersions.map(v => ({
      ...v,
      isActive: false,
    }));

    if (activeTab === 'terms') {
      setDocuments(prev => ({
        ...prev,
        termsOfUse: [...updatedVersions, newVersion],
      }));
    } else {
      setDocuments(prev => ({
        ...prev,
        privacyPolicy: [...updatedVersions, newVersion],
      }));
    }

    setSelectedVersion(newVersion.id);
    setIsEditModalOpen(false);
    setEditingDocument(null);
    toast.success('Documento atualizado com sucesso!');
  };

  const handleDownloadPDF = () => {
    // Simular download de PDF
    toast.info('Download do PDF iniciado...');
  };

  const handlePrint = () => {
    window.print();
  };

  const isAdmin =
    currentProfile?.role === 'admin' || currentProfile?.role === 'employer';

  return (
    <>
      <GlobalStyle />
      <Container>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          currentPath={router.pathname}
        />
        <MainContent>
          <WelcomeSection
            theme={theme}
            userAvatar={currentProfile?.avatar || 'U'}
            userName={currentProfile?.name || 'Usuário'}
            userRole={currentProfile?.role || 'Usuário'}
            notificationCount={0}
            onNotificationClick={() => {}}
          />
          <Header>
            <div>
              <Title>Gestão de Termos e Políticas</Title>
              <Subtitle>
                Gerencie os Termos de Uso e Políticas de Privacidade do Sistema
                DOM
              </Subtitle>
            </div>
          </Header>

          <StatsGrid>
            <StatCard $theme={theme}>
              <StatNumber $theme={theme}>
                {documents.termsOfUse.length}
              </StatNumber>
              <StatLabel>Versões dos Termos</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber $theme={theme}>
                {documents.privacyPolicy.length}
              </StatNumber>
              <StatLabel>Versões da Política</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber $theme={theme}>1,247</StatNumber>
              <StatLabel>Usuários Ativos</StatLabel>
            </StatCard>
            <StatCard $theme={theme}>
              <StatNumber $theme={theme}>98.5%</StatNumber>
              <StatLabel>Taxa de Aceite</StatLabel>
            </StatCard>
          </StatsGrid>

          <ContentGrid>
            <DocumentSection>
              <DocumentTabs>
                <TabButton
                  $active={activeTab === 'terms'}
                  $theme={theme}
                  onClick={() => setActiveTab('terms')}
                >
                  <AccessibleEmoji emoji='📋' label='Checklist' /> Termos de Uso
                </TabButton>
                <TabButton
                  $active={activeTab === 'privacy'}
                  $theme={theme}
                  onClick={() => setActiveTab('privacy')}
                >
                  <AccessibleEmoji emoji='🔒' label='Privado' /> Políticas de
                  Privacidade
                </TabButton>
              </DocumentTabs>

              <DocumentHeader>
                <div>
                  <DocumentTitle>
                    {activeTab === 'terms'
                      ? 'Termos de Uso'
                      : 'Políticas de Privacidade'}
                  </DocumentTitle>
                  {activeVersion && (
                    <VersionInfo>
                      <VersionBadge $theme={theme}>
                        {activeVersion.version} - Atual
                      </VersionBadge>
                      <EffectiveDate>
                        Vigente desde:{' '}
                        {new Date(
                          activeVersion.effectiveDate
                        ).toLocaleDateString('pt-BR')}
                      </EffectiveDate>
                    </VersionInfo>
                  )}
                </div>
              </DocumentHeader>

              <DocumentContent
                dangerouslySetInnerHTML={{
                  __html: currentDocument?.content || '',
                }}
              />

              <DocumentActions>
                <ActionButton
                  variant='primary'
                  theme={theme}
                  onClick={handleDownloadPDF}
                >
                  <AccessibleEmoji emoji='📄' label='Documento' /> Baixar PDF
                </ActionButton>
                <ActionButton
                  variant='secondary'
                  theme={theme}
                  onClick={handlePrint}
                >
                  <AccessibleEmoji emoji='🖨' label='Impressora' /> Imprimir
                </ActionButton>
                {isAdmin && (
                  <ActionButton
                    variant='warning'
                    theme={theme}
                    onClick={handleEditDocument}
                  >
                    <AccessibleEmoji emoji='✏' label='Lápis' /> Editar
                    Documento
                  </ActionButton>
                )}
              </DocumentActions>
            </DocumentSection>

            <SidebarSection>
              <SidebarTitle>Histórico de Versões</SidebarTitle>
              <VersionList>
                {currentVersions.map(version => (
                  <VersionItem
                    key={version.id}
                    $active={version.id === selectedVersion}
                    $theme={theme}
                    onClick={() => setSelectedVersion(version.id)}
                  >
                    <VersionNumber>{version.version}</VersionNumber>
                    <VersionDate>
                      {new Date(version.effectiveDate).toLocaleDateString(
                        'pt-BR'
                      )}
                    </VersionDate>
                    {version.isActive && (
                      <VersionStatus $theme={theme}>Atual</VersionStatus>
                    )}
                  </VersionItem>
                ))}
              </VersionList>

              {isAdmin && (
                <AdminSection>
                  <AdminTitle>Área Administrativa</AdminTitle>
                  <ActionButton
                    variant='success'
                    theme={theme}
                    onClick={() => {
                      const newDoc: DocumentVersion = {
                        id: Date.now().toString(),
                        version: `v${parseFloat(activeVersion?.version.substring(1) || '1') + 0.1}`,
                        effectiveDate: new Date().toISOString().split('T')[0]!,
                        content: '',
                        isActive: false,
                        changes: [],
                      };
                      setEditingDocument(newDoc);
                      setIsEditModalOpen(true);
                    }}
                  >
                    <AccessibleEmoji emoji='➕' label='Novo' /> Nova Versão
                  </ActionButton>
                </AdminSection>
              )}
            </SidebarSection>
          </ContentGrid>

          {/* Modal de Edição */}
          <Modal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
          >
            <ModalContent>
              <ModalHeader>
                <h2>Editar Documento</h2>
              </ModalHeader>
              <ModalBody>
                <Form onSubmit={e => e.preventDefault()}>
                  <FormGroup>
                    <label htmlFor='document-version'>Versão:</label>
                    <Input
                      id='document-version'
                      $theme={theme}
                      value={editingDocument?.version || ''}
                      readOnly
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='document-effective-date'>
                      Data de Vigência:
                    </label>
                    <Input
                      id='document-effective-date'
                      $theme={theme}
                      type='date'
                      value={editingDocument?.effectiveDate || ''}
                      readOnly
                    />
                  </FormGroup>
                  <FormGroup>
                    <label htmlFor='document-content'>
                      Conteúdo do Documento:
                    </label>
                    <textarea
                      id='document-content'
                      className='document-textarea'
                      value={editingDocument?.content || ''}
                      onChange={e =>
                        setEditingDocument(prev =>
                          prev ? { ...prev, content: e.target.value } : null
                        )
                      }
                      placeholder='Digite o conteúdo do documento...'
                    />
                  </FormGroup>
                </Form>
              </ModalBody>
              <ModalFooter>
                <ActionButton
                  variant='secondary'
                  theme={theme}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancelar
                </ActionButton>
                <ActionButton
                  variant='success'
                  theme={theme}
                  onClick={() =>
                    handleSaveDocument(editingDocument?.content || '')
                  }
                >
                  Salvar Documento
                </ActionButton>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </MainContent>
      </Container>
    </>
  );
};

export default TermsManagement;
