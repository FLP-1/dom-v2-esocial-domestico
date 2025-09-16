// Serviço de integração com a API do eSocial Doméstico
// Baseado na documentação oficial do eSocial

export interface ESocialConfig {
  environment: 'homologacao' | 'producao';
  certificatePath?: string;
  proxyPath?: string;
  companyId: string;
  apiKey?: string;
}

export interface ESocialEvent {
  id: string;
  tipo: string;
  versao?: string;
  xml?: string;
  status: 'pending' | 'sent' | 'processed' | 'error';
  dataEnvio?: string;
  dataProcessamento?: string;
  protocolo?: string;
  erro?: string;
  retorno?: any;
}

export interface ESocialResponse {
  success: boolean;
  protocolo?: string;
  status: string;
  mensagem?: string;
  erro?: string;
  data?: any;
}

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

class ESocialApiService {
  private config: ESocialConfig;

  constructor(config: ESocialConfig) {
    this.config = config;
  }

  // Configuração e autenticação
  async configureCertificate(certificateFile: File): Promise<CertificateInfo> {
    try {
      // Simular validação do certificado digital
      const certificateData = await this.readCertificateFile(certificateFile);

      // Em produção, aqui seria feita a validação real do certificado
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

      // Salvar configuração no localStorage
      localStorage.setItem(
        'esocial_certificate',
        JSON.stringify(certificateInfo)
      );

      return certificateInfo;
    } catch (error) {
      throw new Error(`Erro ao configurar certificado: ${error}`);
    }
  }

  async configureProxy(proxyFile: File): Promise<ProxyInfo> {
    try {
      // Simular validação da procuração eletrônica
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

      // Salvar configuração no localStorage
      localStorage.setItem('esocial_proxy', JSON.stringify(proxyInfo));

      return proxyInfo;
    } catch (error) {
      throw new Error(`Erro ao configurar procuração: ${error}`);
    }
  }

  // Geração de XML para eventos
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

  // Envio de eventos
  async sendEvent(event: ESocialEvent): Promise<ESocialResponse> {
    try {
      // Validar certificado e procuração
      await this.validateConfiguration();

      // Simular envio para API do eSocial
      const response = await this.simulateApiCall(event);

      if (response.success) {
        // Salvar evento enviado
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

  // Consulta de status
  async getEventStatus(protocolo: string): Promise<ESocialResponse> {
    try {
      // Simular consulta de status
      const response = await this.simulateStatusQuery(protocolo);
      return response;
    } catch (error) {
      return {
        success: false,
        status: 'error',
        erro: error instanceof Error ? error.message : 'Erro na consulta',
      };
    }
  }

  // Consulta de eventos pendentes
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

  // Histórico de eventos
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

  // Métodos privados
  private async readCertificateFile(file: File): Promise<any> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Simular leitura do certificado
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
        // Simular leitura da procuração
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

    // Validar se certificado e procuração estão válidos
    const certInfo: CertificateInfo = JSON.parse(certificate);
    const proxyInfo: ProxyInfo = JSON.parse(proxy);

    if (!certInfo.isValid || !proxyInfo.isValid) {
      throw new Error('Certificado ou procuração inválidos');
    }
  }

  private async simulateApiCall(
    _event: ESocialEvent
  ): Promise<ESocialResponse> {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simular resposta da API
    const success = Math.random() > 0.1; // 90% de sucesso

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

  private async simulateStatusQuery(
    _protocolo: string
  ): Promise<ESocialResponse> {
    // Simular delay da consulta
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simular status do evento
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

  // Geradores de XML para cada tipo de evento
  private generateS1000XML(data: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial xmlns="http://www.esocial.gov.br/schema/evt/evtInfoEmpregador/v_S_01_00_00">
  <evtInfoEmpregador Id="ID${Date.now()}">
    <ideEvento>
      <tpAmb>${this.config.environment === 'producao' ? '1' : '2'}</tpAmb>
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
      <tpAmb>${this.config.environment === 'producao' ? '1' : '2'}</tpAmb>
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
      <tpAmb>${this.config.environment === 'producao' ? '1' : '2'}</tpAmb>
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
      <tpAmb>${this.config.environment === 'producao' ? '1' : '2'}</tpAmb>
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

// Instância singleton do serviço
let esocialApiInstance: ESocialApiService | null = null;

export const getESocialApiService = (
  config?: ESocialConfig
): ESocialApiService => {
  if (!esocialApiInstance && config) {
    esocialApiInstance = new ESocialApiService(config);
  }

  if (!esocialApiInstance) {
    throw new Error(
      'Serviço eSocial não foi inicializado. Forneça uma configuração.'
    );
  }

  return esocialApiInstance;
};

export default ESocialApiService;
