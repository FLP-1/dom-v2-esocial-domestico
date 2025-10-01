import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/document-management.tsx

import { useRouter } from 'next/router';
import { useRef, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';
import FilterSection from '../components/FilterSection';
import { FormGroup, Input, Label, Select } from '../components/FormComponents';
import { UnifiedButton, UnifiedModal } from '../components/unified';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import {
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedLabel,
} from '../components/shared/optimized-styles';

// Interfaces
interface Document {
  id: string;
  name: string;
  category: string;
  description?: string;
  dueDate?: string;
  uploadDate: string;
  fileSize: string;
  fileType: string;
  permissions: 'public' | 'private' | 'shared';
  sharedWith?: string[];
  isExpiring: boolean;
}

interface DocumentCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

// Styled Components

const UploadSection = styled.div<{ $theme: any; $isDragOver: boolean }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 2px dashed
    ${props => (props.$isDragOver ? props.$theme.colors.primary : '#e0e0e0')};
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.$theme.colors.primary};
    background: rgba(255, 255, 255, 1);
  }
`;

const UploadContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

const UploadIcon = styled.div<{ $theme: any }>`
  font-size: 3rem;
  color: ${props => props.$theme.colors.primary};
`;

const UploadText = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
  }

  p {
    margin: 0;
    color: #7f8c8d;
    font-size: 0.9rem;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DocumentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const DocumentCard = styled.div<{ $theme: any; $isExpiring: boolean }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid
    ${props => (props.$isExpiring ? '#e74c3c' : props.$theme.colors.primary)}20;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.$theme.colors.shadow};
  }

  .document-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .document-meta {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin-bottom: 0.5rem;
  }

  .document-due-date {
    color: #e74c3c;
    font-weight: 600;
  }

  .document-actions {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .action-button {
    background: none;
    border: none;
    padding: 0.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1.2rem;

    &:hover {
      background: ${props => props.$theme.colors.primary}20;
    }
  }
`;

const DocumentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TextArea = styled.textarea<{ $theme: any }>`
  padding: 0.75rem;
  border: 2px solid ${props => props.$theme?.colors?.border || '#e0e0e0'};
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.9);
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    box-shadow: 0 0 0 3px
      ${props => props.$theme?.colors?.primary || '#29ABE2'}20;
  }
`;

const PermissionBadge = styled.span<{ $permission: string }>`
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.$permission) {
      case 'public':
        return '#2ecc71';
      case 'private':
        return '#e74c3c';
      case 'shared':
        return '#f39c12';
      default:
        return '#95a5a6';
    }
  }};
  color: white;
`;

const DocumentInfo = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const DocumentInfoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const DocumentInfoText = styled.p`
  margin: 0 0 0.25rem 0;
  color: #7f8c8d;
`;

const DocumentMeta = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
`;

const DocumentDescription = styled.p`
  font-size: 0.9rem;
  color: #2c3e50;
  margin: 0.5rem 0;
`;

const DocumentHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DocumentIconSmall = styled.span`
  font-size: 1.5rem;
`;

const CategoryBadge = styled.span<{ $color: string }>`
  color: ${props => props.$color};
  font-weight: 600;
`;

const DeleteButton = styled.button`
  color: #e74c3c;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: rgba(231, 76, 60, 0.1);
  }
`;

const UploadProgressContainer = styled.div`
  margin-bottom: 1rem;
`;

const ProgressBar = styled.div<{ $theme: any }>`
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $progress: number; $theme: any }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: ${props => props.$theme.colors.primary};
  transition: width 0.3s ease;
`;

const ProgressText = styled.p`
  margin: 0.5rem 0 0 0;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const DocumentViewer = styled.div`
  text-align: center;
  padding: 2rem;
`;

const DocumentIcon = styled.div<{ $color: string }>`
  font-size: 4rem;
  margin-bottom: 1rem;
  color: ${props => props.$color};
`;

const DocumentTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const DocumentSubtitle = styled.p`
  margin: 0 0 1rem 0;
  color: #7f8c8d;
`;

export default function DocumentManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [modalType, setUnifiedModalType] = useState<'view' | 'edit' | 'upload'>(
    'view'
  );
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const categories: DocumentCategory[] = [
    {
      id: '1',
      name: 'Contratos',
      color: '#3498db',
      icon: <AccessibleEmoji emoji='📄' label='Documento' />,
    },
    { id: '2', name: 'Recibos', color: '#2ecc71', icon: '🧾' },
    {
      id: '3',
      name: 'Certidões',
      color: '#f39c12',
      icon: <AccessibleEmoji emoji='📜' label='Documento' />,
    },
    {
      id: '4',
      name: 'Fotos',
      color: '#e74c3c',
      icon: <AccessibleEmoji emoji='📸' label='Câmera' />,
    },
    {
      id: '5',
      name: 'Outros',
      color: '#95a5a6',
      icon: <AccessibleEmoji emoji='📁' label='Pasta' />,
    },
  ];

  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Contrato de Trabalho - Maria',
      category: 'Contratos',
      description: 'Contrato de trabalho da empregada doméstica',
      dueDate: '2024-12-31',
      uploadDate: '2024-01-15',
      fileSize: '2.1 MB',
      fileType: 'PDF',
      permissions: 'private',
      isExpiring: false,
    },
    {
      id: '2',
      name: 'Recibo de Pagamento - Janeiro',
      category: 'Recibos',
      description: 'Recibo de pagamento do mês de janeiro',
      dueDate: '2024-02-05',
      uploadDate: '2024-02-01',
      fileSize: '856 KB',
      fileType: 'PDF',
      permissions: 'private',
      isExpiring: true,
    },
    {
      id: '3',
      name: 'Certidão de Nascimento',
      category: 'Certidões',
      description: 'Certidão de nascimento do filho',
      uploadDate: '2024-01-20',
      fileSize: '1.5 MB',
      fileType: 'PDF',
      permissions: 'shared',
      sharedWith: ['Maria Santos'],
      isExpiring: false,
    },
  ]);

  const [newDocument, setNewDocument] = useState({
    name: '',
    category: '',
    description: '',
    dueDate: '',
    permissions: 'private' as 'public' | 'private' | 'shared',
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    expiring: false,
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file) return;

    setUnifiedModalType('upload');
    setUnifiedModalOpen(true);
    setNewDocument(prev => ({
      ...prev,
      name: file.name.split('.')[0] || file.name,
    }));

    // Simular upload progress
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocument.name.trim()) return;

    const document: Document = {
      id: Date.now().toString(),
      name: newDocument.name || 'Documento sem nome',
      category: newDocument.category,
      description: newDocument.description || '',
      dueDate: newDocument.dueDate || '',
      uploadDate:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      fileSize: '1.2 MB',
      fileType: 'PDF',
      permissions: newDocument.permissions,
      isExpiring: newDocument.dueDate
        ? new Date(newDocument.dueDate) <
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : false,
    };

    setDocuments(prev => [document, ...prev]);
    setNewDocument({
      name: '',
      category: '',
      description: '',
      dueDate: '',
      permissions: 'private',
    });
    setUnifiedModalOpen(false);
    setUploadProgress(0);
    toast.success('Documento criado com sucesso!');
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    toast.success('Documento excluído com sucesso!');
  };

  const openUnifiedModal = (
    type: 'view' | 'edit' | 'upload',
    document?: Document
  ) => {
    setUnifiedModalType(type);
    setSelectedDocument(document || null);
    setUnifiedModalOpen(true);
  };

  const getFilteredDocuments = () => {
    return documents.filter(doc => {
      const matchesSearch =
        !filters.search ||
        doc.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        doc.description?.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || doc.category === filters.category;

      const matchesExpiring = !filters.expiring || doc.isExpiring;

      return matchesSearch && matchesCategory && matchesExpiring;
    });
  };

  const getExpiringDocumentsCount = () => {
    return documents.filter(doc => doc.isExpiring).length;
  };

  const getCategoryInfo = (categoryName: string) => {
    return (
      categories.find(cat => cat.name === categoryName) || {
        color: '#95a5a6',
        icon: <AccessibleEmoji emoji='📁' label='Pasta' />,
      }
    );
  };

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={getExpiringDocumentsCount()}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader $theme={theme}
        title='Gestão de Documentos'
        subtitle='Organize, armazene e gerencie todos os documentos importantes do lar'
      />

      <UploadSection
        $theme={theme}
        $isDragOver={isDragOver}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadContent>
          <UploadIcon $theme={theme}>
            <AccessibleEmoji emoji='📁' label='Pasta' />
          </UploadIcon>
          <UploadText>
            <h3>Enviar Documento</h3>
            <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
          </UploadText>
          <UnifiedButton
            $variant='primary'
            $theme={theme}
            onClick={() => {
              fileInputRef.current?.click();
            }}
          >
            <AccessibleEmoji emoji='📤' label='Exportar' /> Selecionar Arquivo
          </UnifiedButton>
        </UploadContent>
        <HiddenFileInput
          ref={fileInputRef}
          type='file'
          accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx'
          onChange={e => handleFileUpload(e.target.files)}
        />
      </UploadSection>

      <FilterSection $theme={theme} title='Filtros e Busca'>
        <FilterRow>
          <FormGroup>
            <OptimizedLabel>Buscar Documentos</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o nome ou descrição...'
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-category'>
              Filtrar por Categoria
            </OptimizedLabel>
            <Select
              id='filter-category'
              $theme={theme}
              value={filters.category}
              onChange={e =>
                setFilters(prev => ({ ...prev, category: e.target.value }))
              }
              aria-label='Filtrar por categoria'
              title='Filtrar por categoria'
            >
              <option value=''>Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-expiring'>
              Mostrar apenas
            </OptimizedLabel>
            <Select
              id='filter-expiring'
              $theme={theme}
              value={filters.expiring ? 'expiring' : 'all'}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  expiring: e.target.value === 'expiring',
                }))
              }
              aria-label='Filtrar documentos'
              title='Filtrar documentos'
            >
              <option value='all'>Todos os documentos</option>
              <option value='expiring'>Documentos vencendo</option>
            </Select>
          </FormGroup>
        </FilterRow>
      </FilterSection>

      <DocumentGrid>
        {getFilteredDocuments().map(document => {
          const categoryInfo = getCategoryInfo(document.category);
          return (
            <DocumentCard
              key={document.id}
              $theme={theme}
              $isExpiring={document.isExpiring}
              onClick={() => openUnifiedModal('view', document)}
            >
              <div className='document-header'>
                <DocumentHeader>
                  <DocumentIconSmall>{categoryInfo.icon}</DocumentIconSmall>
                  <DocumentTitle>{document.name}</DocumentTitle>
                </DocumentHeader>
                <PermissionBadge $permission={document.permissions}>
                  {document.permissions === 'public'
                    ? 'Público'
                    : document.permissions === 'private'
                      ? 'Privado'
                      : 'Compartilhado'}
                </PermissionBadge>
              </div>

              <div className='document-meta'>
                <CategoryBadge $color={categoryInfo.color}>
                  {document.category}
                </CategoryBadge>
                {document.dueDate && (
                  <div className='document-due-date'>
                    <AccessibleEmoji emoji='📅' label='Calendário' /> Vence em:{' '}
                    {new Date(document.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                )}
              </div>

              <DocumentMeta>
                <AccessibleEmoji emoji='📊' label='Dashboard' />{' '}
                {document.fileSize} •{' '}
                <AccessibleEmoji emoji='📅' label='Calendário' />{' '}
                {new Date(document.uploadDate).toLocaleDateString('pt-BR')}
              </DocumentMeta>

              <DocumentDescription>{document.description}</DocumentDescription>

              <div className='document-actions'>
                <DeleteButton
                  className='action-button'
                  onClick={e => {
                    e.stopPropagation();
                    openUnifiedModal('edit', document);
                  }}
                  title='Editar documento'
                >
                  <AccessibleEmoji emoji='✏' label='Editar' />
                </DeleteButton>
                <DeleteButton
                  className='action-button'
                  onClick={e => {
                    e.stopPropagation();
                    openUnifiedModal('view', document);
                  }}
                  title='Compartilhar documento'
                >
                  <AccessibleEmoji emoji='🔗' label='Compartilhar' />
                </DeleteButton>
                <DeleteButton
                  className='action-button'
                  onClick={e => {
                    e.stopPropagation();
                    handleDeleteDocument(document.id);
                  }}
                  title='Excluir documento'
                >
                  <AccessibleEmoji emoji='❌' label='Excluir' />
                </DeleteButton>
              </div>
            </DocumentCard>
          );
        })}
      </DocumentGrid>

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={
          modalType === 'view'
            ? 'Visualizar Documento'
            : modalType === 'edit'
              ? 'Editar Documento'
              : 'Enviar Documento'
        }
      >
        {modalType === 'view' && selectedDocument && (
          <div>
            <DocumentViewer>
              <DocumentIcon
                $color={getCategoryInfo(selectedDocument.category).color}
              >
                {getCategoryInfo(selectedDocument.category).icon}
              </DocumentIcon>
              <DocumentTitle>{selectedDocument.name}</DocumentTitle>
              <DocumentSubtitle>
                {selectedDocument.fileType} • {selectedDocument.fileSize}
              </DocumentSubtitle>
            </DocumentViewer>

            <DocumentInfo>
              <DocumentInfoTitle>Informações do Documento</DocumentInfoTitle>
              <DocumentInfoText>
                <strong>Categoria:</strong> {selectedDocument.category}
              </DocumentInfoText>
              {selectedDocument.description && (
                <DocumentInfoText>
                  <strong>Descrição:</strong> {selectedDocument.description}
                </DocumentInfoText>
              )}
              {selectedDocument.dueDate && (
                <DocumentInfoText>
                  <strong>Data de Vencimento:</strong>{' '}
                  {new Date(selectedDocument.dueDate).toLocaleDateString(
                    'pt-BR'
                  )}
                </DocumentInfoText>
              )}
              <DocumentInfoText>
                <strong>Data de Upload:</strong>{' '}
                {new Date(selectedDocument.uploadDate).toLocaleDateString(
                  'pt-BR'
                )}
              </DocumentInfoText>
              <DocumentInfoText>
                <strong>Permissões:</strong>{' '}
                <PermissionBadge $permission={selectedDocument.permissions}>
                  {selectedDocument.permissions === 'public'
                    ? 'Público'
                    : selectedDocument.permissions === 'private'
                      ? 'Privado'
                      : 'Compartilhado'}
                </PermissionBadge>
              </DocumentInfoText>
            </DocumentInfo>
          </div>
        )}

        {(modalType === 'edit' || modalType === 'upload') && (
          <DocumentForm onSubmit={handleCreateDocument}>
            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Nome do Documento</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='text'
                  value={newDocument.name}
                  onChange={e =>
                    setNewDocument(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder='Digite o nome do documento'
                  required
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor='document-category'>
                  Categoria
                </OptimizedLabel>
                <Select
                  id='document-category'
                  $theme={theme}
                  value={newDocument.category}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  aria-label='Selecionar categoria'
                  required
                  title='Selecionar categoria'
                >
                  <option value=''>Selecionar categoria</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.name}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <OptimizedFormRow>
              <FormGroup>
                <OptimizedLabel>Data de Vencimento (Opcional)</OptimizedLabel>
                <Input
                  $theme={theme}
                  type='date'
                  value={newDocument.dueDate}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      dueDate: e.target.value,
                    }))
                  }
                />
              </FormGroup>

              <FormGroup>
                <OptimizedLabel htmlFor='document-permissions'>
                  Permissões
                </OptimizedLabel>
                <Select
                  id='document-permissions'
                  $theme={theme}
                  value={newDocument.permissions}
                  onChange={e =>
                    setNewDocument(prev => ({
                      ...prev,
                      permissions: e.target.value as
                        | 'public'
                        | 'private'
                        | 'shared',
                    }))
                  }
                  aria-label='Selecionar permissões'
                  title='Selecionar permissões'
                >
                  <option value='private'>Privado</option>
                  <option value='shared'>Compartilhado</option>
                  <option value='public'>Público</option>
                </Select>
              </FormGroup>
            </OptimizedFormRow>

            <FormGroup>
              <OptimizedLabel>Descrição (Opcional)</OptimizedLabel>
              <TextArea
                $theme={theme}
                value={newDocument.description}
                onChange={e =>
                  setNewDocument(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder='Digite uma descrição para o documento'
              />
            </FormGroup>

            {modalType === 'upload' && uploadProgress < 100 && (
              <UploadProgressContainer>
                <OptimizedLabel>Progresso do Upload</OptimizedLabel>
                <ProgressBar $theme={theme}>
                  <ProgressFill $progress={uploadProgress} $theme={theme} />
                </ProgressBar>
                <ProgressText>{uploadProgress}% concluído</ProgressText>
              </UploadProgressContainer>
            )}

            <UnifiedButton
              type='submit'
              $variant='primary'
              $theme={theme}
              $disabled={modalType === 'upload' && uploadProgress < 100}
            >
              {modalType === 'edit'
                ? 'Salvar Alterações'
                : modalType === 'upload'
                  ? uploadProgress < 100
                    ? 'Enviando...'
                    : 'Finalizar Upload'
                  : 'Criar Documento'}
            </UnifiedButton>
          </DocumentForm>
        )}
      </UnifiedModal>

      <ToastContainer
        position='top-center'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </PageContainer>
  );
}
