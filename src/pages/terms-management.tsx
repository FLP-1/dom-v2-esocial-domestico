import { useRouter } from 'next/router';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled, { keyframes } from 'styled-components';
import AccessibleEmoji from '../components/AccessibleEmoji';
import { Form, FormGroup, Input } from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { WidgetGrid } from '../components/WidgetGrid';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
// Interfaces para dados de termos e políticas
interface DocumentVersion {
  id: string;
  versao: string;
  tipo: string;
  titulo: string;
  subtitulo?: string;
  conteudo: string;
  ativo: boolean;
  dataVigencia: string;
  dataExpiracao?: string;
  mudancas?: string[];
}

interface Statistics {
  totalUsers: number;
  acceptanceRate: number;
}

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

const DocumentTextarea = styled.textarea`
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
`;

// Styled Components (mantendo apenas os específicos da página)

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

const LoadingContainer = styled.div`
  text-align: center;
  padding: 2rem;
  color: ${props => props.theme?.colors?.text || '#2c3e50'};
  font-size: 1.1rem;
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

// StatsGrid e StatCard removidos - agora usando WidgetGrid padrão

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

const TermsManagement: React.FC = () => {
  const router = useRouter();

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());
  const [collapsed, setCollapsed] = useState(false);

  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [selectedVersion, setSelectedVersion] = useState<string>('1');
  const [isEditUnifiedModalOpen, setIsEditUnifiedModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] =
    useState<DocumentVersion | null>(null);
  const [documents, setDocuments] = useState<TermsData>({ termsOfUse: [], privacyPolicy: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [statistics, setStatistics] = useState<Statistics>({ totalUsers: 0, acceptanceRate: 0 });

  // Função para carregar dados da API
  const loadData = async () => {
    setIsLoading(true);
    try {
      // Carregar termos e políticas
      const termsResponse = await fetch('/api/terms');
      const termsResult = await termsResponse.json();
      
      if (termsResult.success && termsResult.data) {
        const terms = termsResult.data.filter((t: any) => t.tipo === 'TERMOS_USO');
        const policies = termsResult.data.filter((t: any) => t.tipo === 'POLITICA_PRIVACIDADE');
        
        setDocuments({
          termsOfUse: terms,
          privacyPolicy: policies
        });
        
        // Definir primeira versão como selecionada
        if (terms.length > 0 && !selectedVersion) {
          setSelectedVersion(terms[0].id);
        }
      }

      // Carregar estatísticas
      const statsResponse = await fetch('/api/statistics');
      const statsResult = await statsResponse.json();
      
      if (statsResult.success && statsResult.data) {
        const usuarios = statsResult.data.usuarios?.find((s: any) => s.chave === 'total_usuarios')?.valor || '0';
        const aceite = statsResult.data.compliance?.find((s: any) => s.chave === 'taxa_aceite_termos')?.valor || '0';
        
        setStatistics({
          totalUsers: parseInt(usuarios),
          acceptanceRate: parseInt(aceite)
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados ao montar o componente
  React.useEffect(() => {
    loadData();
  }, []);

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
      setIsEditUnifiedModalOpen(true);
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
    setIsEditUnifiedModalOpen(false);
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
      <PageContainer $theme={theme} sidebarCollapsed={collapsed}>
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
          currentPath={router.pathname}
        />
        
        <TopBar $theme={theme}>
          <WelcomeSection 
            $theme={theme}
            userAvatar={currentProfile?.avatar || 'U'}
            userName={currentProfile?.name || 'Usuário'}
            userRole={currentProfile?.role || 'Usuário'}
            notificationCount={0}
            onNotificationClick={() => toast.info('Notificações em desenvolvimento')}
          />
        </TopBar>

        <PageHeader
          $theme={theme}
          title="Gestão de Termos e Políticas"
          subtitle="Gerencie os Termos de Uso e Políticas de Privacidade do Sistema DOM"
        />

        {isLoading ? (
          <LoadingContainer>
            <p>Carregando dados...</p>
          </LoadingContainer>
        ) : (
          <WidgetGrid 
            widgets={[
              {
                id: 'terms-versions',
                title: 'Versões dos Termos',
                icon: '📋',
                type: 'primary',
                theme,
                metric: documents.termsOfUse.length,
                description: 'versões disponíveis',
                content: 'Histórico completo de todas as versões dos Termos de Uso.'
              },
              {
                id: 'privacy-versions',
                title: 'Versões da Política',
                icon: '🔒',
                type: 'secondary',
                theme,
                metric: documents.privacyPolicy.length,
                description: 'versões disponíveis',
                content: 'Histórico completo de todas as versões das Políticas de Privacidade.'
              },
              {
                id: 'active-users',
                title: 'Usuários Ativos',
                icon: '👥',
                type: 'success',
                theme,
                metric: statistics.totalUsers,
                description: 'usuários ativos',
                content: 'Total de usuários ativos no sistema DOM.'
              },
              {
                id: 'acceptance-rate',
                title: 'Taxa de Aceite',
                icon: '✅',
                type: 'warning',
                theme,
                metric: `${statistics.acceptanceRate}%`,
                description: 'taxa de aceite',
                content: 'Percentual de aceite dos termos pelos usuários.'
              }
            ]} 
            onWidgetClick={(widgetId) => {
              toast.info(`Detalhes do widget ${widgetId} em desenvolvimento`);
            }}
          />
        )}

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
                <UnifiedButton
                  $variant='primary'
                  $theme={theme}
                  onClick={handleDownloadPDF}
                >
                  <AccessibleEmoji emoji='📄' label='Documento' /> Baixar PDF
                </UnifiedButton>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={handlePrint}
                >
                  <AccessibleEmoji emoji='🖨' label='Impressora' /> Imprimir
                </UnifiedButton>
                {isAdmin && (
                  <UnifiedButton
                    $variant='warning'
                    $theme={theme}
                    onClick={handleEditDocument}
                  >
                    <AccessibleEmoji emoji='✏' label='Lápis' /> Editar
                    Documento
                  </UnifiedButton>
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
                  <UnifiedButton
                    $variant='success'
                    $theme={theme}
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
                      setIsEditUnifiedModalOpen(true);
                    }}
                  >
                    <AccessibleEmoji emoji='➕' label='Novo' /> Nova Versão
                  </UnifiedButton>
                </AdminSection>
              )}
            </SidebarSection>
          </ContentGrid>

          {/* UnifiedModal de Edição */}
          <UnifiedModal
            isOpen={isEditUnifiedModalOpen}
            onClose={() => setIsEditUnifiedModalOpen(false)}
          >
            <div>
              <div>
                <h2>Editar Documento</h2>
              </div>
              <div>
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
                    <DocumentTextarea
                      id='document-content'
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
              </div>
              <div>
                <UnifiedButton
                  $variant='secondary'
                  $theme={theme}
                  onClick={() => setIsEditUnifiedModalOpen(false)}
                >
                  Cancelar
                </UnifiedButton>
                <UnifiedButton
                  $variant='success'
                  $theme={theme}
                  onClick={() =>
                    handleSaveDocument(editingDocument?.content || '')
                  }
                >
                  Salvar Documento
                </UnifiedButton>
              </div>
            </div>
          </UnifiedModal>
      </PageContainer>
    </>
  );
};

export default TermsManagement;
