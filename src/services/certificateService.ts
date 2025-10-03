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
        // Certificado deve ser fornecido via upload ou configuração
        throw new Error('Certificado não fornecido. Use o upload de arquivo ou configure o caminho no ambiente.');
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
      const certBag = certBags[0];
      //
      // Verificar se é um certificado válido
      if (!certBag || typeof certBag !== 'object') {
        throw new Error('Certificado extraído não é um objeto válido');
      }
      // Tentar diferentes formas de extrair o certificado
      if ((certBag as any).cert) {
        this.certificate = (certBag as any).cert;
      } else if ((certBag as any).certificate) {
        this.certificate = (certBag as any).certificate;
      } else {
        this.certificate = certBag as unknown as forge.pki.Certificate;
      }
      // Validar se o certificado foi extraído corretamente
      if (!this.certificate) {
        throw new Error('Falha ao extrair certificado do arquivo PFX');
      }
      //
      // );
      // Extrair a chave privada corretamente
      const keyBag = keyBagsArray[0];
      if (!keyBag || typeof keyBag !== 'object') {
        throw new Error('Chave privada extraída não é um objeto válido');
      }
      // Verificar se a chave privada tem a estrutura correta
      let privateKey: forge.pki.PrivateKey;
      if ((keyBag as any).key) {
        privateKey = (keyBag as any).key;
      } else if ((keyBag as any).privateKey) {
        privateKey = (keyBag as any).privateKey;
      } else {
        privateKey = keyBag as unknown as forge.pki.PrivateKey;
      }
      // Validar se a chave privada tem o método sign
      if (!privateKey || typeof (privateKey as any).sign !== 'function') {
        throw new Error('Chave privada inválida: método sign não disponível');
      }
      this.privateKey = {
        key: privateKey,
        algorithm: 'RSA',
        keySize: 2048,
      };
      // Extrair informações do certificado
      this.certificateInfo = this.extractCertificateInfo(this.certificate);
      // Validar se o certificado foi extraído corretamente
      if (!this.certificateInfo) {
        throw new Error('Falha ao extrair informações do certificado');
      }
      // Certificado digital carregado com sucesso
      //
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
    // Validar se o certificado foi parseado corretamente
    if (!cert) {
      throw new Error('Certificado não foi parseado corretamente');
    }
    // );
    //
    //
    // Verificar se é um certificado válido do node-forge
    if (!cert.validity) {
      // Tentar verificar se é um certificado válido de outra forma
      if ((cert as any).validityNotBefore && (cert as any).validityNotAfter) {
        // Certificado com propriedades diferentes
        const now = new Date();
        const validFrom = (cert as any).validityNotBefore;
        const validTo = (cert as any).validityNotAfter;
        const daysUntilExpiry = Math.ceil(
          (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const isValid = now >= validFrom && now <= validTo;
        return {
          subject: cert.subject?.getField?.('CN')?.value || 'N/A',
          issuer: cert.issuer?.getField?.('CN')?.value || 'N/A',
          validFrom,
          validTo,
          serialNumber: cert.serialNumber || 'N/A',
          isValid,
          daysUntilExpiry,
          fingerprint: 'N/A', // Não conseguimos calcular sem validity
        };
      }
      throw new Error('Certificado não possui informações de validade');
    }
    if (!cert.validity.notBefore || !cert.validity.notAfter) {
      throw new Error('Certificado não possui datas de validade válidas');
    }
    const now = new Date();
    const validFrom = cert.validity.notBefore;
    const validTo = cert.validity.notAfter;
    const daysUntilExpiry = Math.ceil(
      (validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    const isValid = now >= validFrom && now <= validTo;
    // Validar subject e issuer
    let subject = 'N/A';
    let issuer = 'N/A';
    try {
      if (cert.subject && cert.subject.getField) {
        subject = cert.subject.getField('CN')?.value || 'N/A';
      }
    } catch (error) {
      // console.warn('Erro ao extrair subject:', error);
    }
    try {
      if (cert.issuer && cert.issuer.getField) {
        issuer = cert.issuer.getField('CN')?.value || 'N/A';
      }
    } catch (error) {
      // console.warn('Erro ao extrair issuer:', error);
    }
    return {
      subject,
      issuer,
      validFrom,
      validTo,
      serialNumber: cert.serialNumber || 'N/A',
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
      // Verificar se a chave privada tem o método sign
      if (
        !this.privateKey.key ||
        typeof (this.privateKey.key as any).sign !== 'function'
      ) {
        throw new Error('Chave privada inválida ou método sign não disponível');
      }
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
