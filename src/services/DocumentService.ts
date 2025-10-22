// Serviço unificado de gestão de documentos
export interface DocumentMetadata {
  id?: string;
  name: string;
  category: string;
  description?: string;
  userId: string;
  cpf?: string;
  fileType: string;
  fileSize: number;
  uploadDate?: string;
  expirationDate?: string;
  isValidated?: boolean;
  validationDetails?: {
    cpfMatch?: boolean;
    certificateValid?: boolean;
    validationDate?: string;
  };
  permissions: 'public' | 'private' | 'shared';
  sharedWith?: string[];
  tags?: string[];
}

export interface UploadResult {
  success: boolean;
  documentId?: string;
  message: string;
  metadata?: DocumentMetadata;
  error?: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  details?: {
    cpfMatch?: boolean;
    certificateValid?: boolean;
    expirationDate?: string;
    issuer?: string;
  };
}

/**
 * Serviço centralizado para gestão de documentos
 * Integra upload, validação e armazenamento
 */
export class DocumentService {
  private static instance: DocumentService;

  // Singleton pattern
  public static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  /**
   * Upload de documento com validação integrada
   */
  async upload(params: {
    file: File;
    category: string;
    userId: string;
    metadata?: Partial<DocumentMetadata>;
  }): Promise<UploadResult> {
    try {
      const { file, category, userId, metadata = {} } = params;

      // Validações básicas
      const validation = this.validateFile(file, category);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          error: validation.message,
        };
      }

      // Preparar dados para upload
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('category', category);
      uploadData.append('userId', userId);
      uploadData.append('name', metadata.name || file.name);
      uploadData.append('description', metadata.description || '');

      if (metadata.cpf) {
        uploadData.append('cpf', metadata.cpf);
      }

      // Chamar API de upload
      const response = await fetch('/api/upload-documento', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro no upload');
      }

      const result = await response.json();

      // Criar metadata completa
      const documentMetadata: DocumentMetadata = {
        id: result.documentId,
        name: metadata.name || file.name,
        category,
        description: metadata.description,
        userId,
        cpf: metadata.cpf,
        fileType: file.type || this.getFileTypeFromExtension(file.name),
        fileSize: file.size,
        uploadDate: new Date().toISOString(),
        isValidated: false,
        permissions: metadata.permissions || 'private',
        tags: metadata.tags || [category],
        ...metadata,
      };

      return {
        success: true,
        documentId: result.documentId,
        message: 'Documento enviado com sucesso',
        metadata: documentMetadata,
      };
    } catch (error) {
      // Erro no DocumentService.upload
      return {
        success: false,
        message: `Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Validar documento (especialmente certificados digitais)
   */
  async validate(documentId: string, cpf?: string): Promise<ValidationResult> {
    try {
      // Simular validação do certificado
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Em um cenário real, aqui você:
      // 1. Buscaria o documento no storage
      // 2. Validaria o certificado digital
      // 3. Verificaria se o CPF confere
      // 4. Checaria a validade do certificado

      const isValid = Math.random() > 0.2; // 80% de chance de ser válido (simulação)
      const cpfMatch = cpf ? Math.random() > 0.1 : true; // 90% de chance de CPF conferir

      if (!isValid) {
        return {
          valid: false,
          message: 'Certificado digital inválido ou corrompido',
        };
      }

      if (cpf && !cpfMatch) {
        return {
          valid: false,
          message: 'CPF do certificado não confere com o CPF informado',
        };
      }

      return {
        valid: true,
        message: 'Documento validado com sucesso',
        details: {
          cpfMatch: cpfMatch,
          certificateValid: isValid,
          expirationDate: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(), // 1 ano
          issuer: 'AC Certisign RFB G5',
        },
      };
    } catch (error) {
      // Erro na validação do documento
      return {
        valid: false,
        message: `Erro na validação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  /**
   * Excluir documento
   */
  async delete(
    documentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Simular exclusão
      await new Promise(resolve => setTimeout(resolve, 500));

      // Em um cenário real, aqui você:
      // 1. Removeria o arquivo do storage
      // 2. Removeria os metadados do banco
      // 3. Limparia caches relacionados

      return {
        success: true,
        message: 'Documento excluído com sucesso',
      };
    } catch (error) {
      // Erro ao excluir documento
      return {
        success: false,
        message: `Erro na exclusão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  /**
   * Buscar documentos por usuário
   */
  async getDocumentsByUser(
    userId: string,
    category?: string
  ): Promise<DocumentMetadata[]> {
    try {
      // Simular busca no banco
      await new Promise(resolve => setTimeout(resolve, 300));

      // Buscar documentos reais do banco de dados
      const response = await fetch(`/api/documents?userId=${userId}&category=${category || ''}`);
      if (!response.ok) {
        throw new Error('Erro ao buscar documentos');
      }
      
      const filteredDocs = await response.json();

      return filteredDocs;
    } catch (error) {
      // Erro ao buscar documentos
      return [];
    }
  }

  /**
   * Validações de arquivo
   */
  private validateFile(file: File, category: string): ValidationResult {
    // Validações por categoria
    const categoryRules = {
      certificado_digital: {
        allowedExtensions: ['.pfx', '.p12'],
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['application/x-pkcs12', 'application/octet-stream'],
      },
      documento_pessoal: {
        allowedExtensions: ['.pdf', '.jpg', '.jpeg', '.png'],
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      },
      holerite: {
        allowedExtensions: ['.pdf'],
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimeTypes: ['application/pdf'],
      },
    };

    const rules = categoryRules[category as keyof typeof categoryRules];
    if (!rules) {
      return {
        valid: false,
        message: `Categoria de documento não suportada: ${category}`,
      };
    }

    // Validar extensão
    const fileExtension = file.name
      .toLowerCase()
      .substring(file.name.lastIndexOf('.'));
    if (!rules.allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        message: `Tipo de arquivo não permitido. Use: ${rules.allowedExtensions.join(', ')}`,
      };
    }

    // Validar tamanho
    if (file.size > rules.maxSize) {
      const maxSizeMB = Math.round(rules.maxSize / (1024 * 1024));
      return {
        valid: false,
        message: `Arquivo muito grande. Tamanho máximo: ${maxSizeMB}MB`,
      };
    }

    // Validar MIME type (se disponível)
    if (file.type && !rules.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        message: 'Tipo de arquivo não suportado',
      };
    }

    return {
      valid: true,
      message: 'Arquivo válido',
    };
  }

  /**
   * Obter tipo de arquivo pela extensão
   */
  private getFileTypeFromExtension(filename: string): string {
    const extension = filename
      .toLowerCase()
      .substring(filename.lastIndexOf('.'));

    const typeMap: Record<string, string> = {
      '.pdf': 'application/pdf',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.pfx': 'application/x-pkcs12',
      '.p12': 'application/x-pkcs12',
    };

    return typeMap[extension] || 'application/octet-stream';
  }

  /**
   * Gerar nome único para documento
   */
  generateDocumentName(
    category: string,
    userId: string,
    originalName?: string
  ): string {
    const timestamp = Date.now();
    const prefix = category.toUpperCase().replace('_', '-');
    const suffix = originalName ? `-${originalName.split('.')[0]}` : '';

    return `${prefix}-${userId}-${timestamp}${suffix}`;
  }
}

// Instância singleton
export const documentService = DocumentService.getInstance();
