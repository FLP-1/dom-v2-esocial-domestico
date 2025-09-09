// Serviço híbrido de integração com a API do eSocial Doméstico
// Pode usar API real ou simulação baseado na configuração
import { ESocialEvent, ESocialResponse } from './esocialApi';
import type { ESocialRealApiService } from './esocialRealApi';
import { getESocialRealApiService } from './esocialRealApi';

// Interfaces exportadas
export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  isValid: boolean;
}

export interface ProxyInfo {
  documentNumber: string;
  validFrom: string;
  validTo: string;
  permissions: string[];
  isValid: boolean;
}

export interface ESocialConfig {
  environment: 'test' | 'production';
  certificatePath?: string;
  proxyPath?: string;
  companyId: string;
  apiKey?: string;
  useRealApi?: boolean; // Nova opção para usar API real
}

class ESocialHybridApiService {
  private config: ESocialConfig;
  private realApiService: ESocialRealApiService | null = null;
  private useRealApi: boolean;

  constructor(config: ESocialConfig) {
    this.config = config;
    this.useRealApi = config.useRealApi || false;

    // Se usar API real, inicializar o serviço real
    if (this.useRealApi) {
      this.realApiService = getESocialRealApiService();
    }
  }

  /**
   * Configura certificado digital
   */
  async configureCertificate(certificateFile: File): Promise<CertificateInfo> {
    if (this.useRealApi && this.realApiService) {
      // Usar API real - o certificado já está configurado no construtor
      const certInfo = this.realApiService.getCertificateInfo();
      if (!certInfo) {
        throw new Error('Certificado não carregado na API real');
      }
      return {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom.toISOString(),
        validTo: certInfo.validTo.toISOString(),
        serialNumber: certInfo.serialNumber,
        isValid: certInfo.isValid,
      };
    } else {
      // Usar simulação (código original)
      return this.simulateCertificateConfiguration(certificateFile);
    }
  }

  /**
   * Configura procuração eletrônica
   */
  async configureProxy(proxyFile: File): Promise<ProxyInfo> {
    if (this.useRealApi) {
      // Na API real, a procuração é opcional
      return {
        documentNumber: '12345678901',
        validFrom: new Date().toISOString(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['enviar_eventos', 'consultar_status'],
        isValid: true,
      };
    } else {
      // Usar simulação (código original)
      return this.simulateProxyConfiguration(proxyFile);
    }
  }

  /**
   * Gera XML para eventos
   */
  generateEventXML(eventType: string, data: any): string {
    const templates = {
      'S-1000': this.generateS1000XML,
      'S-2200': this.generateS2200XML,
      'S-2300': this.generateS2300XML,
      'S-3000': this.generateS3000XML,
    };

    const generator = templates[eventType as keyof typeof templates];
    if (!generator) {
      throw new Error(`Tipo de evento não suportado: ${eventType}`);
    }

    return generator(data);
  }

  /**
   * Envia evento para o eSocial
   */
  async sendEvent(event: ESocialEvent): Promise<ESocialResponse> {
    if (this.useRealApi && this.realApiService) {
      // Usar API real
      // console.log('🌐 Enviando evento via API real do eSocial...');

      try {
        // Verificar se o serviço está pronto
        if (!this.realApiService.isReady()) {
          throw new Error('Serviço eSocial não está pronto');
        }

        // Enviar como lote com um único evento
        const response = await this.realApiService.enviarLote([event]);

        if (response.success) {
          // Salvar evento enviado
          this.saveSentEvent(event, response);
        }

        return response;
      } catch (error) {
        // console.error('❌ Erro na API real:', error);
        return {
          success: false,
          status: 'error',
          erro: error instanceof Error ? error.message : 'Erro na API real',
        };
      }
    } else {
      // Usar simulação (código original)
      // console.log('🎭 Simulando envio de evento...');
      return this.simulateEventSending(event);
    }
  }

  /**
   * Consulta status de evento
   */
  async getEventStatus(protocolo: string): Promise<ESocialResponse> {
    if (this.useRealApi && this.realApiService) {
      // Usar API real
      // console.log('🌐 Consultando status via API real do eSocial...');
      return await this.realApiService.consultarLote(protocolo);
    } else {
      // Usar simulação (código original)
      // console.log('🎭 Simulando consulta de status...');
      return this.simulateStatusQuery(protocolo);
    }
  }

  /**
   * Consulta eventos pendentes
   */
  async getPendingEvents(): Promise<ESocialEvent[]> {
    try {
      const storedEvents = localStorage.getItem('esocial_events');
      if (!storedEvents) return [];

      const events: ESocialEvent[] = JSON.parse(storedEvents);
      return events.filter(event => event.status === 'pending');
    } catch (error) {
      // console.error('Erro ao buscar eventos pendentes:', error);
      return [];
    }
  }

  /**
   * Consulta histórico de eventos
   */
  async getEventHistory(): Promise<ESocialEvent[]> {
    try {
      const storedEvents = localStorage.getItem('esocial_events');
      if (!storedEvents) return [];

      return JSON.parse(storedEvents);
    } catch (error) {
      // console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }

  /**
   * Obtém informações do certificado
   */
  getCertificateInfo(): CertificateInfo | null {
    if (this.useRealApi && this.realApiService) {
      const certInfo = this.realApiService.getCertificateInfo();
      if (!certInfo) return null;

      return {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom.toISOString(),
        validTo: certInfo.validTo.toISOString(),
        serialNumber: certInfo.serialNumber,
        isValid: certInfo.isValid,
      };
    }
    return null;
  }

  /**
   * Verifica se está usando API real
   */
  isUsingRealApi(): boolean {
    return this.useRealApi;
  }

  /**
   * Verifica se o serviço está pronto
   */
  isReady(): boolean {
    if (this.useRealApi && this.realApiService) {
      return this.realApiService.isReady();
    }
    return true; // Simulação sempre está pronta
  }

  // ===== MÉTODOS DE SIMULAÇÃO (código original) =====

  private async simulateCertificateConfiguration(
    certificateFile: File
  ): Promise<CertificateInfo> {
    try {
      const certificateData = await this.readCertificateFile(certificateFile);

      const certificateInfo: CertificateInfo = {
        subject: certificateData.subject || 'CN=Empresa Teste',
        issuer: certificateData.issuer || 'Autoridade Certificadora',
        validFrom: certificateData.validFrom || new Date().toISOString(),
        validTo:
          certificateData.validTo ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        serialNumber: certificateData.serialNumber || '123456789',
        isValid: true,
      };

      localStorage.setItem(
        'esocial_certificate',
        JSON.stringify(certificateInfo)
      );
      return certificateInfo;
    } catch (error) {
      throw new Error(`Erro ao configurar certificado: ${error}`);
    }
  }

  private async simulateProxyConfiguration(
    proxyFile: File
  ): Promise<ProxyInfo> {
    try {
      const proxyData = await this.readProxyFile(proxyFile);

      const proxyInfo: ProxyInfo = {
        documentNumber: proxyData.documentNumber || '12345678901',
        validFrom: proxyData.validFrom || new Date().toISOString(),
        validTo:
          proxyData.validTo ||
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: proxyData.permissions || [
          'enviar_eventos',
          'consultar_status',
        ],
        isValid: true,
      };

      localStorage.setItem('esocial_proxy', JSON.stringify(proxyInfo));
      return proxyInfo;
    } catch (error) {
      throw new Error(`Erro ao configurar procuração: ${error}`);
    }
  }

  private async simulateEventSending(
    event: ESocialEvent
  ): Promise<ESocialResponse> {
    try {
      await this.validateConfiguration();
      const response = await this.simulateApiCall(event);

      if (response.success) {
        this.saveSentEvent(event, response);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        status: 'error',
        erro: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  private async simulateStatusQuery(
    protocolo: string
  ): Promise<ESocialResponse> {
    try {
      const response = await this.simulateStatusQueryCall(protocolo);
      return response;
    } catch (error) {
      return {
        success: false,
        status: 'error',
        erro: error instanceof Error ? error.message : 'Erro na consulta',
      };
    }
  }

  private async readCertificateFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          subject: 'CN=Empresa Teste',
          issuer: 'Autoridade Certificadora',
          validFrom: new Date().toISOString(),
          validTo: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          serialNumber: '123456789',
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async readProxyFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          documentNumber: '12345678901',
          validFrom: new Date().toISOString(),
          validTo: new Date(
            Date.now() + 365 * 24 * 60 * 60 * 1000
          ).toISOString(),
          permissions: ['enviar_eventos', 'consultar_status'],
        });
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private async validateConfiguration(): Promise<void> {
    const certificate = localStorage.getItem('esocial_certificate');
    const proxy = localStorage.getItem('esocial_proxy');

    if (!certificate) {
      throw new Error('Certificado digital não configurado');
    }

    if (!proxy) {
      throw new Error('Procuração eletrônica não configurada');
    }

    const certInfo: CertificateInfo = JSON.parse(certificate);
    const proxyInfo: ProxyInfo = JSON.parse(proxy);

    if (!certInfo.isValid || !proxyInfo.isValid) {
      throw new Error('Certificado ou procuração inválidos');
    }
  }

  private async simulateApiCall(
    _event: ESocialEvent
  ): Promise<ESocialResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const success = Math.random() > 0.1;

    if (success) {
      return {
        success: true,
        protocolo: `ESOCIAL-${Date.now()}`,
        status: 'sent',
        mensagem: 'Evento enviado com sucesso',
      };
    } else {
      return {
        success: false,
        status: 'error',
        erro: 'Erro na validação do XML',
      };
    }
  }

  private async simulateStatusQueryCall(
    _protocolo: string
  ): Promise<ESocialResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const statuses = ['sent', 'processed', 'error'];
    const randomStatus = statuses[
      Math.floor(Math.random() * statuses.length)
    ] as string;

    return {
      success: true,
      status: randomStatus,
      mensagem: `Status: ${randomStatus}`,
    };
  }

  private saveSentEvent(event: ESocialEvent, response: ESocialResponse): void {
    const updatedEvent: ESocialEvent = {
      ...event,
      status: 'sent',
      dataEnvio: new Date().toISOString(),
      ...(response.protocolo && { protocolo: response.protocolo }),
    };

    const storedEvents = localStorage.getItem('esocial_events');
    const events: ESocialEvent[] = storedEvents ? JSON.parse(storedEvents) : [];

    const existingIndex = events.findIndex(e => e.id === event.id);
    if (existingIndex >= 0) {
      events[existingIndex] = updatedEvent;
    } else {
      events.push(updatedEvent);
    }

    localStorage.setItem('esocial_events', JSON.stringify(events));
  }

  // Geradores de XML (código original)
  private generateS1000XML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_00_00">
  <evtInfoEmpregador Id="ID${Date.now()}">
    <ideEvento>
      <tpAmb>${this.config.environment === 'production' ? '1' : '2'}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${data.cpf}</nrInsc>
    </ideEmpregador>
    <infoEmpregador>
      <inclusao>
        <idePeriodo>
          <iniValid>${data.dataInicio}</iniValid>
        </idePeriodo>
        <dadosEmpregador>
          <nmRazao>${data.nome}</nmRazao>
          <classTrib>01</classTrib>
        </dadosEmpregador>
      </inclusao>
    </infoEmpregador>
  </evtInfoEmpregador>
</eSocial>`;
  }

  private generateS2200XML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtAdmissao/v_S_01_00_00">
  <evtAdmissao Id="ID${Date.now()}">
    <ideEvento>
      <tpAmb>${this.config.environment === 'production' ? '1' : '2'}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${data.empregadorCpf}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${data.cpf}</cpfTrab>
      <nmTrab>${data.nome}</nmTrab>
      <sexo>${data.sexo}</sexo>
      <racaCor>${data.racaCor}</racaCor>
      <estCiv>${data.estadoCivil}</estCiv>
      <grauInstr>${data.grauInstrucao}</grauInstr>
      <nmSoc>${data.nomeSocial}</nmSoc>
    </trabalhador>
    <vinculo>
      <matricula>${data.matricula}</matricula>
      <tpRegTrab>1</tpRegTrab>
      <tpRegPrev>1</tpRegPrev>
      <dtAdm>${data.dataAdmissao}</dtAdm>
      <codCargo>${data.codigoCargo}</codCargo>
      <codFuncao>${data.codigoFuncao}</codFuncao>
    </vinculo>
  </evtAdmissao>
</eSocial>`;
  }

  private generateS2300XML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtTSVInicio/v_S_01_00_00">
  <evtTSVInicio Id="ID${Date.now()}">
    <ideEvento>
      <tpAmb>${this.config.environment === 'production' ? '1' : '2'}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${data.empregadorCpf}</nrInsc>
    </ideEmpregador>
    <trabalhador>
      <cpfTrab>${data.cpf}</cpfTrab>
      <nmTrab>${data.nome}</nmTrab>
    </trabalhador>
    <infoTSVInicio>
      <codCateg>${data.codigoCategoria}</codCateg>
      <dtInicio>${data.dataInicio}</dtInicio>
    </infoTSVInicio>
  </evtTSVInicio>
</eSocial>`;
  }

  private generateS3000XML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtExclusao/v_S_01_00_00">
  <evtExclusao Id="ID${Date.now()}">
    <ideEvento>
      <tpAmb>${this.config.environment === 'production' ? '1' : '2'}</tpAmb>
      <procEmi>1</procEmi>
      <verProc>1.0.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${data.empregadorCpf}</nrInsc>
    </ideEmpregador>
    <infoExclusao>
      <tpEvento>${data.tipoEvento}</tpEvento>
      <nrRecEvt>${data.numeroRecibo}</nrRecEvt>
      <ideTrabalhador>
        <cpfTrab>${data.cpf}</cpfTrab>
      </ideTrabalhador>
    </infoExclusao>
  </evtExclusao>
</eSocial>`;
  }
}

// Instância singleton
let esocialHybridApiInstance: ESocialHybridApiService | null = null;

export const getESocialApiService = (
  config?: ESocialConfig
): ESocialHybridApiService => {
  if (!esocialHybridApiInstance && config) {
    esocialHybridApiInstance = new ESocialHybridApiService(config);
  }

  if (!esocialHybridApiInstance) {
    throw new Error(
      'Serviço eSocial não foi inicializado. Forneça uma configuração.'
    );
  }

  return esocialHybridApiInstance;
};

export default ESocialHybridApiService;
