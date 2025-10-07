import React, { useRef } from 'react';
import styled from 'styled-components';
import AccessibleEmoji from '../AccessibleEmoji';
import { UnifiedCard, UnifiedButton } from '../unified';

// Styled Components
const DocumentUploadContainer = styled.div<{ $theme: any; $isDragOver: boolean }>`
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const UploadSection = styled.div<{ $theme: any; $isDragOver: boolean }>`
  border: 2px dashed ${props => 
    props.$isDragOver ? props.$theme.colors.primary : '#e0e0e0'};
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  background: ${props => 
    props.$isDragOver ? props.$theme.colors.primary + '10' : 'transparent'};
  transition: all 0.3s ease;
  margin-bottom: 1rem;
`;

const UploadButton = styled.div`
  margin-top: 1rem;
`;

const UploadIcon = styled.div<{ $theme: any }>`
  font-size: 2.5rem;
  color: ${props => props.$theme.colors.primary};
  margin-bottom: 1rem;
`;

const UploadText = styled.div`
  h3 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 1.1rem;
    font-weight: 600;
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

const DocumentTypes = styled.div<{ $theme: any }>`
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  border: 1px solid ${props => props.$theme.colors.primary}20;
`;

const DocumentTypesTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
`;

const DocumentTypesList = styled.ul`
  margin: 0;
  padding-left: 1rem;
  color: #7f8c8d;
  font-size: 0.8rem;
  line-height: 1.4;
`;

const RecentDocuments = styled.div`
  margin-top: 1rem;
`;

const RecentDocumentsTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const DocumentItem = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.8rem;
  color: #7f8c8d;
  
  .document-icon {
    color: ${props => props.$theme.colors.primary};
  }
`;

const DocumentDate = styled.span`
  margin-left: auto;
  font-size: 0.7rem;
`;

// Interfaces
export interface DocumentUploadCardProps {
  theme: any;
  onFileUpload: (files: FileList) => void;
  recentDocuments?: Array<{
    id: string;
    name: string;
    type: string;
    uploadDate: string;
  }>;
}

export const DocumentUploadCard: React.FC<DocumentUploadCardProps> = ({
  theme,
  onFileUpload,
  recentDocuments = [],
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

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
    if (files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <DocumentUploadContainer $theme={theme} $isDragOver={isDragOver}>
      <UnifiedCard
        theme={theme}
        variant="default"
        size="md"
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AccessibleEmoji emoji="📄" label="Documentos" />
            Atestados e Documentos
          </div>
        }
      >
        <UploadSection
          $theme={theme}
          $isDragOver={isDragOver}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <UploadIcon $theme={theme}>
            <AccessibleEmoji emoji="📁" label="Upload" />
          </UploadIcon>
          <UploadText>
            <h3>Enviar Documento</h3>
            <p>Arraste e solte arquivos aqui ou clique para selecionar</p>
          </UploadText>
          
          <UploadButton>
            <UnifiedButton
              $variant="primary"
              $theme={theme}
              $size="sm"
              onClick={handleClick}
            >
              <AccessibleEmoji emoji="📤" label="Upload" />
              Selecionar Arquivo
            </UnifiedButton>
          </UploadButton>
        </UploadSection>

        <HiddenFileInput
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
          onChange={handleFileSelect}
          multiple
        />

        <DocumentTypes $theme={theme}>
          <DocumentTypesTitle>
            <AccessibleEmoji emoji="📋" label="Tipos" />
            Tipos de Documentos Aceitos:
          </DocumentTypesTitle>
          <DocumentTypesList>
            <li>Atestados médicos (PDF, DOC)</li>
            <li>Comprovantes (PDF, JPG, PNG)</li>
            <li>Declarações (PDF, DOC)</li>
            <li>Outros documentos oficiais</li>
          </DocumentTypesList>
        </DocumentTypes>

        {recentDocuments.length > 0 && (
          <RecentDocuments>
            <RecentDocumentsTitle>
              <AccessibleEmoji emoji="🕒" label="Recentes" />
              Documentos Recentes:
            </RecentDocumentsTitle>
            {recentDocuments.slice(0, 3).map((doc) => (
              <DocumentItem key={doc.id} $theme={theme}>
                <span className="document-icon">
                  <AccessibleEmoji emoji="📄" label="Documento" />
                </span>
                <span>{doc.name}</span>
                <DocumentDate>
                  {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                </DocumentDate>
              </DocumentItem>
            ))}
          </RecentDocuments>
        )}
      </UnifiedCard>
    </DocumentUploadContainer>
  );
};

export default DocumentUploadCard;
