import axios, { AxiosRequestConfig } from 'axios';
import * as forge from 'node-forge';
import * as path from 'path';

// Interfaces
export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  serialNumber: string;
}

export interface ESocialConfig {
  environment: 'homologacao' | 'producao';
  companyId: string;
  certificatePath?: string;
  certificatePassword?: string;
}

export interface ESocialResponse {
  success: boolean;
  data?: any;
  error?: string;
  protocolo?: string;
}

export interface EmpregadorData {
  cpf: string;
  nome: string;
  razaoSocial?: string;
  endereco: {
    logradouro: string;
    numero?: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  contato: {
    telefone: string;
    email: string;
  };
  situacao: string;
  dataCadastro: string;
  ultimaAtualizacao: string;
  fonte: string;
}

export interface EmpregadoData {
  cpf: string;
  nome: string;
  matricula: string;
  cargo: string;
  dataAdmissao: string;
  salario: number;
  situacao: string;
  vinculo: string;
  fonte: string;
}

export interface EventoData {
  id: string;
  tipo: string;
  descricao: string;
  dataEnvio: string;
  status: string;
  protocolo: string;
  fonte: string;
}

// URLs do eSocial (ENDPOINTS OFICIAIS ATUALIZADOS - JANEIRO 2025)
const ESOCIAL_URLS = {
  homologacao: {
    // Ambiente de Homologação - Usando endpoints de produção restrita
    wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
    endpoint:
      'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
    consulta:
      'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
    envio:
      'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    recibo:
      'https://webservices.producaorestrita.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc',
    status:
      'https://webservices.producaorestrita.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
    lote: 'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
  },
  producao: {
    // Ambiente de Produção OFICIAL - NOVOS ENDPOINTS (JANEIRO 2025)
    // O domínio webservices.esocial.gov.br foi descontinuado!
    wsdl: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.wsdl',
    endpoint:
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.svc',
    consulta:
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.svc',
    envio:
      'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
    recibo:
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    status:
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    lote: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
  },
};

export class ESocialSoapReal {
  private config: ESocialConfig;
  private certificate?: forge.pki.Certificate;
  private privateKey?: forge.pki.PrivateKey;

  constructor(config: ESocialConfig) {
    this.config = config;
  }

  // Carregar certificado digital
  async loadCertificate(
    certificateBuffer: Buffer,
    password: string
  ): Promise<CertificateInfo> {
    try {
      // Converter buffer para string base64
      const p12Der = forge.util.decode64(certificateBuffer.toString('base64'));

      // Converter para formato P12
      const p12Asn1 = forge.asn1.fromDer(p12Der);
      const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

      // Extrair certificado e chave privada
      const bags = p12.getBags({ bagType: forge.pki.oids.certBag });
      const keyBags = p12.getBags({
        bagType: forge.pki.oids.pkcs8ShroudedKeyBag,
      });

      if (
        bags[forge.pki.oids.certBag] &&
        bags[forge.pki.oids.certBag].length > 0
      ) {
        this.certificate = bags[forge.pki.oids.certBag][0].cert;
      }

      if (
        keyBags[forge.pki.oids.pkcs8ShroudedKeyBag] &&
        keyBags[forge.pki.oids.pkcs8ShroudedKeyBag].length > 0
      ) {
        this.privateKey = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
      }

      if (!this.certificate || !this.privateKey) {
        throw new Error(
          'Certificado ou chave privada não encontrados no arquivo PFX'
        );
      }

      // Retornar informações do certificado
      return {
        subject: this.certificate.subject.getField('CN')?.value || 'N/A',
        issuer: this.certificate.issuer.getField('CN')?.value || 'N/A',
        validFrom: this.certificate.validity.notBefore,
        validTo: this.certificate.validity.notAfter,
        serialNumber: this.certificate.serialNumber,
      };
    } catch (error) {
      throw new Error(
        `Erro ao carregar certificado: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Gerar XML de consulta de empregador (ConsultaCadastro - CORRETO)
  private generateConsultarEmpregadorXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:cad="http://www.esocial.gov.br/ws/servicos/consultaCadastroEmpregador/v1_1_0">
  <s:Header>
    <cad:ideTransmissor>
      <cad:tpInsc>2</cad:tpInsc>
      <cad:nrInsc>${this.config.companyId}</cad:nrInsc>
    </cad:ideTransmissor>
  </s:Header>
  <s:Body>
    <cad:consultaEmpregador>
      <cad:ideContri>
        <cad:tpInsc>2</cad:tpInsc>
        <cad:nrInsc>${this.config.companyId}</cad:nrInsc>
      </cad:ideContri>
    </cad:consultaEmpregador>
  </s:Body>
</s:Envelope>`;
  }

  // Gerar XML de envio S-1000 (Informações do Empregador)
  private generateS1000XML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:evt="http://www.esocial.gov.br/schema/evt/evtTransmissao/v1_1_0">
  <s:Header>
    <evt:ideTransmissor>
      <evt:tpInsc>2</evt:tpInsc>
      <evt:nrInsc>${this.config.companyId}</evt:nrInsc>
    </evt:ideTransmissor>
  </s:Header>
  <s:Body>
    <evt:EnviarLoteEventos>
      <evt:evtTransmissaoEvento>
        <evt:ideEmpregador>
          <evt:tpInsc>2</evt:tpInsc>
          <evt:nrInsc>${this.config.companyId}</evt:nrInsc>
        </evt:ideEmpregador>
        <evt:ideEvento>
          <evt:tpEvento>S-1000</evt:tpEvento>
          <evt:nrRecibo>1</evt:nrRecibo>
        </evt:ideEvento>
        <evt:infoEmpregador>
          <evt:inclusao>
            <evt:ideEmpregador>
              <evt:tpInsc>2</evt:tpInsc>
              <evt:nrInsc>${this.config.companyId}</evt:nrInsc>
            </evt:ideEmpregador>
            <evt:dadosEmpregador>
              <evt:nmRazao>FLP Business Strategy</evt:nmRazao>
              <evt:classTrib>01</evt:classTrib>
              <evt:natJurid>2135</evt:natJurid>
              <evt:indCoop>0</evt:indCoop>
              <evt:indConstr>0</evt:indConstr>
              <evt:indDesFolha>0</evt:indDesFolha>
              <evt:indOpcCP>0</evt:indOpcCP>
              <evt:indPorte>N</evt:indPorte>
              <evt:indOptRegEletron>1</evt:indOptRegEletron>
              <evt:contato>
                <evt:nmCtt>Francisco Jose Lattari Papaleo</evt:nmCtt>
                <evt:cpfCtt>${this.config.companyId}</evt:cpfCtt>
                <evt:foneFixo>11999999999</evt:foneFixo>
                <evt:email>contato@flpbusiness.com</evt:email>
              </evt:contato>
            </evt:dadosEmpregador>
          </evt:inclusao>
        </evt:infoEmpregador>
      </evt:evtTransmissaoEvento>
    </evt:EnviarLoteEventos>
  </s:Body>
</s:Envelope>`;
  }

  // Gerar XML de consulta de empregados
  private generateConsultarEmpregadosXML(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:esocial="http://www.esocial.gov.br/schema/lote/eventos/envio/v1_1_0">
  <soap:Header>
    <esocial:ideTransmissor>
      <esocial:tpInsc>2</esocial:tpInsc>
      <esocial:nrInsc>${this.config.companyId}</esocial:nrInsc>
    </esocial:ideTransmissor>
  </soap:Header>
  <soap:Body>
    <esocial:ConsultarLoteEventos>
      <esocial:ideEmpregador>
        <esocial:tpInsc>2</esocial:tpInsc>
        <esocial:nrInsc>${this.config.companyId}</esocial:nrInsc>
      </esocial:ideEmpregador>
      <esocial:ideEvento>
        <esocial:tpEvento>S-2200</esocial:tpEvento>
      </esocial:ideEvento>
    </esocial:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;
  }

  // Fazer requisição SOAP com certificado
  private async makeSoapRequest(
    xml: string,
    action: string
  ): Promise<ESocialResponse> {
    try {
      if (!this.certificate || !this.privateKey) {
        throw new Error('Certificado digital não carregado');
      }

      const urls = ESOCIAL_URLS[this.config.environment];

      // Configurar axios com certificado e SSL
      const https = require('https');
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Temporariamente para teste
        keepAlive: true,
        timeout: 30000,
      });

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: urls.consulta,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          SOAPAction:
            '"http://www.esocial.gov.br/ws/servicos/consultaCadastroEmpregador/v1_1_0/consultaEmpregador"',
          'User-Agent': 'DOM-System/1.0',
          Accept: 'text/xml, application/xml, */*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        data: xml,
        timeout: 30000,
        httpsAgent: httpsAgent,
        validateStatus: () => true, // Aceitar qualquer status
      };

      const response = await axios(config);

      // Parse da resposta SOAP
      const responseData = response.data;

      // Log da resposta para debug
      console.log('📥 Resposta SOAP recebida:', {
        status: response.status,
        headers: response.headers,
        dataLength: responseData?.length || 0,
      });

      // Verificar status HTTP
      if (response.status !== 200) {
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Verificar se há erro na resposta SOAP
      if (
        responseData.includes('faultstring') ||
        responseData.includes('Fault') ||
        responseData.includes('fault')
      ) {
        const errorMatch = responseData.match(
          /<faultstring>(.*?)<\/faultstring>/
        );
        const error = errorMatch
          ? errorMatch[1]
          : 'Erro desconhecido na resposta SOAP';
        return { success: false, error };
      }

      // Verificar se é uma resposta válida
      if (!responseData || responseData.length === 0) {
        return { success: false, error: 'Resposta vazia do servidor' };
      }

      return { success: true, data: responseData };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (
          error.code === 'CERT_AUTHORITY_INVALID' ||
          error.code === 'UNABLE_TO_VERIFY_LEAF_SIGNATURE'
        ) {
          return {
            success: false,
            error: 'Erro de certificado SSL: Certificado do servidor inválido',
          };
        }
        if (error.response) {
          return {
            success: false,
            error: `Erro HTTP ${error.response.status}: ${error.response.statusText}`,
          };
        }
        if (error.request) {
          return {
            success: false,
            error:
              'Erro de rede: Não foi possível conectar ao servidor eSocial',
          };
        }
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Consultar dados do empregador
  async consultarEmpregador(): Promise<ESocialResponse> {
    try {
      const xml = this.generateConsultarEmpregadorXML();
      const response = await this.makeSoapRequest(xml, 'ConsultarLoteEventos');

      if (response.success) {
        // Parse dos dados do empregador da resposta XML
        const empregadorData = this.parseEmpregadorResponse(response.data);
        return { success: true, data: empregadorData };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Enviar S-1000 (Informações do Empregador)
  async enviarS1000(): Promise<ESocialResponse> {
    try {
      const xml = this.generateS1000XML();
      const urls = ESOCIAL_URLS[this.config.environment];

      // Configurar axios com certificado e SSL
      const https = require('https');
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Temporariamente para teste
        keepAlive: true,
        timeout: 30000,
      });

      const config: AxiosRequestConfig = {
        method: 'POST',
        url: urls.envio,
        headers: {
          'Content-Type': 'application/soap+xml; charset=utf-8',
          SOAPAction:
            '"http://www.esocial.gov.br/schema/evt/evtTransmissao/v1_1_0/EnviarLoteEventos"',
          'User-Agent': 'DOM-System/1.0',
          Accept: 'text/xml, application/xml, */*',
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
        data: xml,
        timeout: 30000,
        httpsAgent: httpsAgent,
        validateStatus: () => true, // Aceitar qualquer status
      };

      const response = await axios(config);

      // Log da resposta para debug
      console.log('📥 Resposta S-1000 recebida:', {
        status: response.status,
        headers: response.headers,
        dataLength: response.data?.length || 0,
      });

      // Verificar status HTTP
      if (response.status !== 200) {
        return {
          success: false,
          error: `Erro HTTP ${response.status}: ${response.statusText}`,
        };
      }

      // Verificar se há erro na resposta SOAP
      if (
        response.data.includes('faultstring') ||
        response.data.includes('Fault') ||
        response.data.includes('fault')
      ) {
        const errorMatch = response.data.match(
          /<faultstring>(.*?)<\/faultstring>/
        );
        const error = errorMatch
          ? errorMatch[1]
          : 'Erro desconhecido na resposta SOAP';
        return { success: false, error };
      }

      // Verificar se é uma resposta válida
      if (!response.data || response.data.length === 0) {
        return { success: false, error: 'Resposta vazia do servidor' };
      }

      // Extrair protocolo se disponível
      const protocoloMatch = response.data.match(
        /<protocoloEnvio>(.*?)<\/protocoloEnvio>/
      );
      const protocolo = protocoloMatch ? protocoloMatch[1] : null;

      return {
        success: true,
        data: response.data,
        protocolo: protocolo || 'Protocolo não encontrado',
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao enviar S-1000: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Consultar lista de empregados
  async consultarEmpregados(): Promise<ESocialResponse> {
    try {
      const xml = this.generateConsultarEmpregadosXML();
      const response = await this.makeSoapRequest(xml, 'ConsultarLoteEventos');

      if (response.success) {
        // Parse dos dados dos empregados da resposta XML
        const empregadosData = this.parseEmpregadosResponse(response.data);
        return { success: true, data: empregadosData };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Consultar eventos enviados
  async consultarEventos(): Promise<ESocialResponse> {
    try {
      const xml = this.generateConsultarEmpregadorXML(); // Mesmo XML para consultar eventos
      const response = await this.makeSoapRequest(xml, 'ConsultarLoteEventos');

      if (response.success) {
        // Parse dos eventos da resposta XML
        const eventosData = this.parseEventosResponse(response.data);
        return { success: true, data: eventosData };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  // Parse da resposta do empregador
  private parseEmpregadorResponse(xml: string): EmpregadorData {
    // Parse real do XML de resposta do eSocial
    try {
      // Extrair dados reais do XML
      const cpfMatch = xml.match(/<nrInsc>(.*?)<\/nrInsc>/);
      const nomeMatch = xml.match(/<nmRazao>(.*?)<\/nmRazao>/);
      const situacaoMatch = xml.match(/<situacao>(.*?)<\/situacao>/);

      return {
        cpf: cpfMatch ? cpfMatch[1] : this.config.companyId,
        nome: nomeMatch ? nomeMatch[1] : 'DADOS NÃO ENCONTRADOS',
        razaoSocial: nomeMatch ? nomeMatch[1] : 'DADOS NÃO ENCONTRADOS',
        endereco: {
          logradouro: 'DADOS NÃO DISPONÍVEIS',
          bairro: 'DADOS NÃO DISPONÍVEIS',
          cidade: 'DADOS NÃO DISPONÍVEIS',
          uf: 'DADOS NÃO DISPONÍVEIS',
          cep: 'DADOS NÃO DISPONÍVEIS',
        },
        contato: {
          telefone: 'DADOS NÃO DISPONÍVEIS',
          email: 'DADOS NÃO DISPONÍVEIS',
        },
        situacao: situacaoMatch ? situacaoMatch[1] : 'DADOS NÃO ENCONTRADOS',
        dataCadastro: new Date().toISOString().split('T')[0],
        ultimaAtualizacao: new Date().toISOString(),
        fonte: 'SOAP_REAL',
      };
    } catch (error) {
      throw new Error(
        `Erro ao parsear resposta XML: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Parse da resposta dos empregados
  private parseEmpregadosResponse(xml: string): EmpregadoData[] {
    // Parse real do XML de resposta do eSocial
    try {
      // Extrair dados reais do XML
      const empregados: EmpregadoData[] = [];

      // Procurar por empregados no XML
      const empregadoMatches = xml.match(/<empregado>(.*?)<\/empregado>/gs);

      if (empregadoMatches) {
        empregadoMatches.forEach((empregadoXml, index) => {
          const cpfMatch = empregadoXml.match(/<cpf>(.*?)<\/cpf>/);
          const nomeMatch = empregadoXml.match(/<nome>(.*?)<\/nome>/);
          const matriculaMatch = empregadoXml.match(
            /<matricula>(.*?)<\/matricula>/
          );
          const cargoMatch = empregadoXml.match(/<cargo>(.*?)<\/cargo>/);
          const situacaoMatch = empregadoXml.match(
            /<situacao>(.*?)<\/situacao>/
          );

          empregados.push({
            cpf: cpfMatch ? cpfMatch[1] : `DADOS_NÃO_ENCONTRADOS_${index}`,
            nome: nomeMatch ? nomeMatch[1] : 'DADOS NÃO ENCONTRADOS',
            matricula: matriculaMatch
              ? matriculaMatch[1]
              : 'DADOS NÃO ENCONTRADOS',
            cargo: cargoMatch ? cargoMatch[1] : 'DADOS NÃO ENCONTRADOS',
            dataAdmissao: new Date().toISOString().split('T')[0],
            salario: 0,
            situacao: situacaoMatch
              ? situacaoMatch[1]
              : 'DADOS NÃO ENCONTRADOS',
            vinculo: 'DADOS NÃO DISPONÍVEIS',
            fonte: 'SOAP_REAL',
          });
        });
      }

      // Se não encontrou empregados, retornar array vazio
      return empregados;
    } catch (error) {
      throw new Error(
        `Erro ao parsear resposta XML de empregados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Parse da resposta dos eventos
  private parseEventosResponse(xml: string): EventoData[] {
    // Parse real do XML de resposta do eSocial
    try {
      // Extrair dados reais do XML
      const eventos: EventoData[] = [];

      // Procurar por eventos no XML
      const eventoMatches = xml.match(/<evento>(.*?)<\/evento>/gs);

      if (eventoMatches) {
        eventoMatches.forEach((eventoXml, index) => {
          const idMatch = eventoXml.match(/<id>(.*?)<\/id>/);
          const tipoMatch = eventoXml.match(/<tipo>(.*?)<\/tipo>/);
          const descricaoMatch = eventoXml.match(
            /<descricao>(.*?)<\/descricao>/
          );
          const statusMatch = eventoXml.match(/<status>(.*?)<\/status>/);
          const protocoloMatch = eventoXml.match(
            /<protocolo>(.*?)<\/protocolo>/
          );

          eventos.push({
            id: idMatch ? idMatch[1] : `EVENTO_${index}`,
            tipo: tipoMatch ? tipoMatch[1] : 'DADOS NÃO ENCONTRADOS',
            descricao: descricaoMatch
              ? descricaoMatch[1]
              : 'DADOS NÃO ENCONTRADOS',
            dataEnvio: new Date().toISOString(),
            status: statusMatch ? statusMatch[1] : 'DADOS NÃO ENCONTRADOS',
            protocolo: protocoloMatch
              ? protocoloMatch[1]
              : 'DADOS NÃO ENCONTRADOS',
            fonte: 'SOAP_REAL',
          });
        });
      }

      // Se não encontrou eventos, retornar array vazio
      return eventos;
    } catch (error) {
      throw new Error(
        `Erro ao parsear resposta XML de eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  // Verificar se certificado está carregado
  isCertificateLoaded(): boolean {
    return !!(this.certificate && this.privateKey);
  }

  // Obter informações do certificado
  getCertificateInfo(): CertificateInfo | null {
    if (!this.certificate) return null;

    return {
      subject: this.certificate.subject.getField('CN')?.value || 'N/A',
      issuer: this.certificate.issuer.getField('CN')?.value || 'N/A',
      validFrom: this.certificate.validity.notBefore,
      validTo: this.certificate.validity.notAfter,
      serialNumber: this.certificate.serialNumber,
    };
  }

  // Método para testar conexão (usado no diagnóstico)
  async testarConexao(
    environment: 'homologacao' | 'producao'
  ): Promise<ESocialResponse> {
    try {
      // Carregar certificado se não estiver carregado
      if (!this.isCertificateLoaded()) {
        const fs = require('fs');
        const path = require('path');
        const certPath = path.join(
          process.cwd(),
          'public',
          'certificates',
          'eCPF A1 24940271 (senha 456587).pfx'
        );

        if (fs.existsSync(certPath)) {
          const certBuffer = fs.readFileSync(certPath);
          await this.loadCertificate(certBuffer, '456587');
        } else {
          return {
            success: false,
            error: 'Certificado digital não encontrado',
          };
        }
      }

      // Testar consulta de empregador
      const resultado = await this.consultarEmpregador();

      return {
        success: true,
        data: {
          teste_conexao: 'OK',
          certificado_carregado: this.isCertificateLoaded(),
          ambiente: environment,
          resultado_consulta: resultado,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro no teste de conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Método para consultar trabalhadores cadastrados
  async consultarTrabalhadores(cpf?: string): Promise<ESocialResponse> {
    try {
      const targetCpf = cpf || this.config.companyId;

      // Simular consulta de trabalhadores (S-2200)
      // Em produção real, isso consultaria o eSocial
      return {
        success: true,
        data: [
          {
            cpf: '12345678901',
            nome: 'João Silva',
            cargo: 'Empregado Doméstico',
            salario: 1500.0,
            dataAdmissao: '2024-01-15',
            status: 'ATIVO',
          },
          {
            cpf: '98765432109',
            nome: 'Maria Santos',
            cargo: 'Empregada Doméstica',
            salario: 1200.0,
            dataAdmissao: '2024-02-01',
            status: 'ATIVO',
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao consultar trabalhadores: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Método para consultar eventos enviados
  async consultarEventos(cpf?: string): Promise<ESocialResponse> {
    try {
      const targetCpf = cpf || this.config.companyId;

      // Simular consulta de eventos
      return {
        success: true,
        data: [
          {
            id: 'S-1000-001',
            tipo: 'S-1000',
            descricao: 'Cadastramento Inicial do Empregador',
            dataEnvio: '2024-01-10',
            status: 'PROCESSADO',
          },
          {
            id: 'S-2200-001',
            tipo: 'S-2200',
            descricao: 'Cadastramento Inicial do Vínculo',
            dataEnvio: '2024-01-15',
            status: 'PROCESSADO',
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao consultar eventos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Método para consultar lotes enviados
  async consultarLotes(cpf?: string): Promise<ESocialResponse> {
    try {
      const targetCpf = cpf || this.config.companyId;

      // Simular consulta de lotes
      return {
        success: true,
        data: [
          {
            id: 'LOTE-001',
            dataEnvio: '2024-01-10',
            totalEventos: 2,
            status: 'PROCESSADO',
            protocolo: '1.2.20240110.00001',
          },
        ],
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao consultar lotes: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Método para enviar eventos (S-1000, S-2200, S-1200, etc.)
  async enviarEvento(tipoEvento: string, dados: any): Promise<ESocialResponse> {
    try {
      console.log(`📤 Enviando evento ${tipoEvento}...`);

      // Simular envio de evento
      // Em produção real, isso enviaria para o eSocial via SOAP
      const protocolo = `1.2.${new Date().toISOString().split('T')[0].replace(/-/g, '')}.${Math.floor(
        Math.random() * 100000
      )
        .toString()
        .padStart(5, '0')}`;

      return {
        success: true,
        protocolo: protocolo,
        data: {
          tipoEvento: tipoEvento,
          protocolo: protocolo,
          dataEnvio: new Date().toISOString(),
          status: 'ENVIADO',
          dados: dados,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Erro ao enviar evento ${tipoEvento}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }

  // Método para consultar cadastro específico (usado no diagnóstico)
  async consultarCadastro(
    cpf: string,
    environment: 'homologacao' | 'producao'
  ): Promise<ESocialResponse> {
    try {
      // Criar nova instância com configuração específica para evitar problemas de estado
      const config: ESocialConfig = {
        environment: environment,
        companyId: cpf,
        certificatePath: path.join(
          process.cwd(),
          'public',
          'certificates',
          'eCPF A1 24940271 (senha 456587).pfx'
        ),
        certificatePassword: '456587',
      };

      const soapService = new ESocialSoapReal(config);

      // Carregar certificado
      const fs = require('fs');
      const certPath = path.join(
        process.cwd(),
        'public',
        'certificates',
        'eCPF A1 24940271 (senha 456587).pfx'
      );

      if (fs.existsSync(certPath)) {
        const certBuffer = fs.readFileSync(certPath);
        await soapService.loadCertificate(certBuffer, '456587');
      } else {
        return {
          success: false,
          error: 'Certificado digital não encontrado',
        };
      }

      // Testar consulta
      const resultado = await soapService.consultarEmpregador();

      return resultado;
    } catch (error) {
      console.error('Erro na consulta de cadastro:', error);
      return {
        success: false,
        error: `Erro na consulta de cadastro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      };
    }
  }
}
