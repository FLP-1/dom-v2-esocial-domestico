import React, { useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useAlertManager } from '../hooks/useAlertManager';
import type { ProxyInfo } from '../services/esocialHybridApi';
import { getESocialApiService } from '../services/esocialHybridApi';
import AccessibleEmoji from './AccessibleEmoji';
import { ActionButton } from './ActionButton';
import SimpleModal from './SimpleModal';

// Animações
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

// Styled Components
const UploadArea = styled.div<{ $isDragOver: boolean; $theme: any }>`
  border: 2px dashed
    ${props =>
      props.$isDragOver
        ? props.$theme?.colors?.primary || '#29ABE2'
        : '#e9ecef'};
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  background: ${props =>
    props.$isDragOver
      ? 'rgba(41, 171, 226, 0.05)'
      : 'rgba(255, 255, 255, 0.9)'};
  transition: all 0.3s ease;
  cursor: pointer;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    border-color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
    background: rgba(41, 171, 226, 0.05);
  }
`;

const UploadIcon = styled.div<{ $theme: any }>`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
`;

const UploadText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const UploadSubtext = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const FileInput = styled.input`
  display: none;
`;

const FileInfo = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  text-align: left;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const FileSize = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
`;

const ProxyInfo = styled.div<{ $theme: any }>`
  background: linear-gradient(
    135deg,
    ${props => props.$theme?.colors?.success || '#90EE90'}20,
    ${props => props.$theme?.colors?.primary || '#29ABE2'}20
  );
  border: 1px solid ${props => props.$theme?.colors?.success || '#90EE90'};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
`;

const InfoTitle = styled.div<{ $theme: any }>`
  font-weight: 700;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #2c3e50;
`;

const InfoValue = styled.span`
  color: #7f8c8d;
  text-align: right;
  max-width: 60%;
  word-break: break-all;
`;

const StatusBadge = styled.span<{ $isValid: boolean; $theme: any }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${props =>
    props.$isValid ? props.$theme?.colors?.success || '#90EE90' : '#e74c3c'};
  color: white;
  animation: ${props => (props.$isValid ? pulse : 'none')} 2s infinite;
`;

const PermissionsList = styled.div`
  margin-top: 1rem;
`;

const PermissionItem = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  color: #2c3e50;
`;

const LoadingSpinner = styled.div<{ $theme: any }>`
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid ${props => props.$theme?.colors?.primary || '#29ABE2'};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 0.5rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  border-left: 3px solid #e74c3c;
`;

const HelpSection = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
`;

const HelpTitle = styled.div<{ $theme: any }>`
  font-weight: 600;
  color: ${props => props.$theme?.colors?.primary || '#29ABE2'};
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HelpText = styled.div`
  font-size: 0.9rem;
  color: #7f8c8d;
  line-height: 1.4;
`;

// Interfaces
interface ProxyUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (proxyInfo: ProxyInfo) => void;
  theme: any;
  esocialConfig?: any;
}

const ProxyUploadModal: React.FC<ProxyUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  theme,
  esocialConfig,
}) => {
  const alertManager = useAlertManager();
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [proxyInfo, setProxyInfo] = useState<ProxyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    // Validar tipo de arquivo
    const allowedTypes = ['.pdf', '.xml', '.json'];
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));

    if (!allowedTypes.includes(fileExtension)) {
      setError('Tipo de arquivo não suportado. Use .pdf, .xml ou .json');
      return;
    }

    // Validar tamanho (máximo 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Arquivo muito grande. Tamanho máximo: 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && files[0]) {
      handleFileSelect(files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      if (!esocialConfig) {
        throw new Error('Configuração do eSocial não fornecida');
      }
      const esocialApi = getESocialApiService(esocialConfig);
      const proxyInfo = await esocialApi.configureProxy(selectedFile);

      setProxyInfo(proxyInfo);
      alertManager.showSuccess(
        'Procuração eletrônica configurada com sucesso!'
      );

      // Chamar callback de sucesso após um pequeno delay
      setTimeout(() => {
        onSuccess(proxyInfo);
        onClose();
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Erro ao processar procuração';
      setError(errorMessage);
      alertManager.showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setProxyInfo(null);
    setError(null);
    setIsDragOver(false);
    onClose();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPermissionLabel = (permission: string): string => {
    const labels: Record<string, string> = {
      enviar_eventos: 'Enviar Eventos',
      consultar_status: 'Consultar Status',
      baixar_relatorios: 'Baixar Relatórios',
      gerenciar_configuracoes: 'Gerenciar Configurações',
    };
    return labels[permission] || permission;
  };

  return (
    <SimpleModal
      isOpen={isOpen}
      onClose={handleClose}
      title={
        <>
          <AccessibleEmoji emoji='📋' label='Checklist' /> Configurar Procuração
          Eletrônica
        </>
      }
      maxWidth='600px'
      theme={theme}
      footer={
        <>
          <ActionButton
            variant='secondary'
            theme={theme}
            onClick={handleClose}
            disabled={isLoading}
          >
            {proxyInfo ? 'Fechar' : 'Cancelar'}
          </ActionButton>

          {selectedFile && !proxyInfo && (
            <ActionButton
              variant='primary'
              theme={theme}
              onClick={handleUpload}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner $theme={theme} />
                  Processando...
                </>
              ) : (
                <>
                  <AccessibleEmoji emoji='📋' label='Checklist' /> Configurar
                  Procuração
                </>
              )}
            </ActionButton>
          )}
        </>
      }
    >
      {!proxyInfo ? (
        <>
          <UploadArea
            $isDragOver={isDragOver}
            $theme={theme}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <UploadIcon $theme={theme}>
              <AccessibleEmoji emoji='📄' label='Documento' />
            </UploadIcon>
            <UploadText>
              {isDragOver
                ? 'Solte o arquivo aqui'
                : 'Arraste a procuração eletrônica ou clique para selecionar'}
            </UploadText>
            <UploadSubtext>
              Formatos suportados: .pdf, .xml, .json (máximo 10MB)
            </UploadSubtext>

            <FileInput
              ref={fileInputRef}
              type='file'
              accept='.pdf,.xml,.json'
              onChange={handleFileInputChange}
            />
          </UploadArea>

          {selectedFile && (
            <FileInfo $theme={theme}>
              <FileName>
                <AccessibleEmoji emoji='📄' label='Documento' />{' '}
                {selectedFile.name}
              </FileName>
              <FileSize>Tamanho: {formatFileSize(selectedFile.size)}</FileSize>
            </FileInfo>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <HelpSection $theme={theme}>
            <HelpTitle $theme={theme}>
              <AccessibleEmoji emoji='ℹ️' label='Informação' /> Informações
              sobre Procuração Eletrônica
            </HelpTitle>
            <HelpText>
              A procuração eletrônica é um documento que autoriza o envio de
              eventos para o eSocial em nome da empresa. Ela deve conter as
              permissões específicas e estar devidamente assinada digitalmente.
            </HelpText>
          </HelpSection>
        </>
      ) : (
        <ProxyInfo $theme={theme}>
          <InfoTitle $theme={theme}>
            <AccessibleEmoji emoji='✅' label='Sucesso' /> Procuração Eletrônica
            Configurada
            <StatusBadge $isValid={proxyInfo.isValid} $theme={theme}>
              {proxyInfo.isValid ? 'Válida' : 'Inválida'}
            </StatusBadge>
          </InfoTitle>

          <InfoRow>
            <InfoLabel>Número do Documento:</InfoLabel>
            <InfoValue>{proxyInfo.documentNumber}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válida de:</InfoLabel>
            <InfoValue>{formatDate(proxyInfo.validFrom)}</InfoValue>
          </InfoRow>

          <InfoRow>
            <InfoLabel>Válida até:</InfoLabel>
            <InfoValue>{formatDate(proxyInfo.validTo)}</InfoValue>
          </InfoRow>

          <PermissionsList>
            <InfoLabel style={{ marginBottom: '0.5rem', display: 'block' }}>
              Permissões:
            </InfoLabel>
            {proxyInfo.permissions.map((permission, index) => (
              <PermissionItem key={index} $theme={theme}>
                <span>
                  <AccessibleEmoji emoji='✅' label='Sucesso' />
                </span>
                {getPermissionLabel(permission)}
              </PermissionItem>
            ))}
          </PermissionsList>
        </ProxyInfo>
      )}
    </SimpleModal>
  );
};

export default ProxyUploadModal;
