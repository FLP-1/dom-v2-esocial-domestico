// Serviço para manipulação de certificados digitais
import * as forge from 'node-forge';
import { ESOCIAL_CONFIG } from '../config/esocial';

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
  isValid: boolean;
  daysUntilExpiry: number;
  fingerprint: string;
}

export interface PrivateKeyInfo {
  key: forge.pki.PrivateKey;
  algorithm: string;
  keySize: number;
}

export class CertificateService {
  private certificateInfo: CertificateInfo | null = null;
  private privateKey: PrivateKeyInfo | null = null;
  private certificate: forge.pki.Certificate | null = null;

  /**
   * Carrega e valida o certificado digital PFX
   */
  async loadCertificate(certificateFile?: File): Promise<CertificateInfo> {
    try {
      let pfxData: ArrayBuffer;

      if (certificateFile) {
        // Usar arquivo fornecido pelo usuário
        pfxData = await certificateFile.arrayBuffer();
      } else {
        // Para demonstração, usar dados simulados
        // Em produção, o arquivo seria carregado via upload
        throw new Error('Certificado não fornecido. Use o upload de arquivo.');
      }

      const pfxBuffer = forge.util.createBuffer(pfxData);

      // Converter para base64 e decodificar
      const pfxBase64 = forge.util.encode64(pfxBuffer.getBytes());
      const pfxDer = forge.util.decode64(pfxBase64);

      // Decodificar o PFX
      const pfx = forge.pkcs12.pkcs12FromAsn1(
        forge.asn1.fromDer(pfxDer),
        false,
        ESOCIAL_CONFIG.certificate.password
      );

      // Extrair certificado e chave privada
      const certBagType = forge.pki.oids['certBag'] as any;
      const keyBagType = forge.pki.oids['pkcs8ShroudedKeyBag'] as any;

      const bags = pfx.getBags({ bagType: certBagType });
      const keyBags = pfx.getBags({ bagType: keyBagType });

      const certBags = bags[certBagType];
      const keyBagsArray = keyBags[keyBagType];

      if (!certBags || certBags.length === 0) {
        throw new Error('Nenhum certificado encontrado no arquivo PFX');
      }

      if (!keyBagsArray || keyBagsArray.length === 0) {
        throw new Error('Nenhuma chave privada encontrada no arquivo PFX');
      }

      // Obter o primeiro certificado
      this.certificate = certBags[0] as unknown as forge.pki.Certificate;
      this.privateKey = {
        key: keyBagsArray[0] as unknown as forge.pki.PrivateKey,
        algorithm: 'RSA',
        keySize: 2048,
      };

      // Extrair informações do certificado
      this.certificateInfo = this.extractCertificateInfo(this.certificate);

      // Certificado digital carregado com sucesso

      return this.certificateInfo;
    } catch (error) {
      // Erro ao carregar certificado
      throw new Error(
        `Falha ao carregar certificado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Extrai informações do certificado
   */
  private extractCertificateInfo(cert: forge.pki.Certificate): CertificateInfo {
    const now = new Date();
    const validFrom = cert.validity.notBefore;
    const validTo = cert.validity.notAfter;

    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isValid = now >= validFrom && now <= validTo;

    return {
      subject: cert.subject.getField('CN')?.value || 'N/A',
      issuer: cert.issuer.getField('CN')?.value || 'N/A',
      validFrom,
      validTo,
      serialNumber: cert.serialNumber,
      isValid,
      daysUntilExpiry,
      fingerprint: forge.md.sha1
        .create()
        .update(forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes())
        .digest()
        .toHex(),
    };
  }

  /**
   * Obtém informações do certificado carregado
   */
  getCertificateInfo(): CertificateInfo | null {
    return this.certificateInfo;
  }

  /**
   * Obtém a chave privada
   */
  getPrivateKey(): PrivateKeyInfo | null {
    return this.privateKey;
  }

  /**
   * Obtém o certificado
   */
  getCertificate(): forge.pki.Certificate | null {
    return this.certificate;
  }

  /**
   * Verifica se o certificado está válido
   */
  isCertificateValid(): boolean {
    return this.certificateInfo?.isValid || false;
  }

  /**
   * Assina dados com o certificado digital
   */
  signData(data: string): string {
    if (!this.privateKey || !this.certificate) {
      throw new Error('Certificado não carregado');
    }

    try {
      const md = forge.md.sha256.create();
      md.update(data, 'utf8');

      const signature = (this.privateKey.key as any).sign(md);
      return forge.util.encode64(signature);
    } catch (error) {
      throw new Error(
        `Erro ao assinar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Gera token de autenticação para o eSocial
   */
  generateAuthToken(): string {
    if (!this.certificate) {
      throw new Error('Certificado não carregado');
    }

    const timestamp = new Date().toISOString();
    const data = `${ESOCIAL_CONFIG.empregador.cpf}:${timestamp}`;

    return this.signData(data);
  }
}

// Instância singleton
let certificateServiceInstance: CertificateService | null = null;

export const getCertificateService = (): CertificateService => {
  if (!certificateServiceInstance) {
    certificateServiceInstance = new CertificateService();
  }
  return certificateServiceInstance;
};

export default CertificateService;
