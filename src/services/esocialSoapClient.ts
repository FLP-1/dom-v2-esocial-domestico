// Cliente para API SOAP eSocial Doméstico (executa no browser)
// Faz chamadas HTTP para a API route do servidor

export interface ESocialSoapClientConfig {
  environment: 'homologacao' | 'producao';
  companyId: string;
}

export class ESocialSoapClientService {
  private config: ESocialSoapClientConfig;
  private baseUrl: string;

  constructor(config: ESocialSoapClientConfig) {
    this.config = config;
    this.baseUrl = '/api/esocial-soap';
  }

  /**
   * Consulta dados do empregador via API SOAP
   */
  async consultarDadosEmpregador(): Promise<any> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'consultarEmpregador',
          cpfCnpj: this.config.companyId,
          environment: this.config.environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro na consulta SOAP');
      }

      // Adicionar fonte dos dados se não existir
      if (result.data && !result.data.fonte) {
        result.data.fonte = result.fonte || 'SOAP_SIMULADO';
      }

      return result.data;
    } catch (error) {
      // console.error('❌ Erro ao consultar empregador via SOAP:', error);
      throw error;
    }
  }

  /**
   * Consulta dados dos empregados via API SOAP
   */
  async consultarDadosEmpregados(): Promise<any[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'consultarEmpregados',
          cpfCnpj: this.config.companyId,
          environment: this.config.environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro na consulta SOAP');
      }

      // Adicionar fonte dos dados se não existir
      if (result.data && !result.data.fonte) {
        result.data.fonte = result.fonte || 'SOAP_SIMULADO';
      }

      return result.data;
    } catch (error) {
      // console.error('❌ Erro ao consultar empregados via SOAP:', error);
      throw error;
    }
  }

  /**
   * Consulta eventos enviados via API SOAP
   */
  async consultarEventosEnviados(): Promise<any[]> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'consultarEventos',
          cpfCnpj: this.config.companyId,
          environment: this.config.environment,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro na consulta SOAP');
      }

      // Adicionar fonte dos dados se não existir
      if (result.data && !result.data.fonte) {
        result.data.fonte = result.fonte || 'SOAP_SIMULADO';
      }

      return result.data;
    } catch (error) {
      // console.error('❌ Erro ao consultar eventos via SOAP:', error);
      throw error;
    }
  }

  /**
   * Verifica se o serviço está pronto
   */
  isReady(): boolean {
    return true; // Cliente sempre está pronto
  }

  /**
   * Obtém informações do ambiente
   */
  getEnvironmentInfo(): any {
    return {
      environment: this.config.environment,
      baseUrl: this.baseUrl,
      companyId: this.config.companyId,
    };
  }
}

// Função utilitária para criar instância
export function createESocialSoapClient(
  config: ESocialSoapClientConfig
): ESocialSoapClientService {
  return new ESocialSoapClientService(config);
}
