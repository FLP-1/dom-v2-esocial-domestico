import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { environment = 'homologacao' } = req.body;

    // Endpoints oficiais do eSocial (conforme documentação)
    const endpointsOficiais = {
      homologacao: {
        nome: 'Homologação (Produção Restrita)',
        baseUrl: 'https://webservices.producaorestrita.esocial.gov.br',
        servicos: {
          consultaCadastro: {
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          },
          enviarLoteEventos: {
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          },
          consultarLoteEventos: {
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
          },
          consultarStatusEventos: {
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
          },
          consultarRecibo: {
            wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc?wsdl',
            endpoint:
              'https://webservices.producaorestrita.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc',
          },
        },
      },
      producao: {
        nome: 'Produção',
        baseUrl: 'https://webservices.esocial.gov.br',
        servicos: {
          consultaCadastro: {
            wsdl: 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          },
          enviarLoteEventos: {
            wsdl: 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          },
          consultarLoteEventos: {
            wsdl: 'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
          },
          consultarStatusEventos: {
            wsdl: 'https://webservices.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
          },
          consultarRecibo: {
            wsdl: 'https://webservices.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc?wsdl',
            endpoint:
              'https://webservices.esocial.gov.br/consrecibo/ConsRecebimentoEventos.svc',
          },
        },
      },
    };

    const ambiente =
      endpointsOficiais[environment as keyof typeof endpointsOficiais];
    const validacao = {
      timestamp: new Date().toISOString(),
      environment: environment,
      nome: ambiente.nome,
      baseUrl: ambiente.baseUrl,
      servicos: [],
    };

    // Função para testar acesso a um serviço
    const testarServico = async (
      nome: string,
      wsdl: string,
      endpoint: string
    ) => {
      const resultado = {
        nome,
        wsdl,
        endpoint,
        testes: [],
      };

      // Teste 1: Acesso ao WSDL
      try {
        const wsdlResponse = await axios.get(wsdl, {
          timeout: 10000,
          validateStatus: () => true, // Aceitar qualquer status
        });

        resultado.testes.push({
          tipo: 'Acesso ao WSDL',
          status: wsdlResponse.status === 200 ? 'sucesso' : 'erro',
          detalhes: {
            status: wsdlResponse.status,
            content_type: wsdlResponse.headers['content-type'],
            tamanho: wsdlResponse.data?.length || 0,
            eh_wsdl: wsdlResponse.data?.includes('wsdl:definitions') || false,
          },
        });
      } catch (error) {
        resultado.testes.push({
          tipo: 'Acesso ao WSDL',
          status: 'erro',
          detalhes: {
            erro: error.message,
            codigo: error.code,
          },
        });
      }

      // Teste 2: Acesso ao Endpoint
      try {
        const endpointResponse = await axios.get(endpoint, {
          timeout: 10000,
          validateStatus: () => true, // Aceitar qualquer status
        });

        resultado.testes.push({
          tipo: 'Acesso ao Endpoint',
          status: endpointResponse.status < 500 ? 'sucesso' : 'erro',
          detalhes: {
            status: endpointResponse.status,
            content_type: endpointResponse.headers['content-type'],
            server: endpointResponse.headers['server'],
            eh_soap: endpointResponse.data?.includes('soap:Envelope') || false,
          },
        });
      } catch (error) {
        resultado.testes.push({
          tipo: 'Acesso ao Endpoint',
          status: 'erro',
          detalhes: {
            erro: error.message,
            codigo: error.code,
          },
        });
      }

      // Teste 3: Validação de Headers
      try {
        const headResponse = await axios.head(endpoint, {
          timeout: 10000,
          validateStatus: () => true,
        });

        resultado.testes.push({
          tipo: 'Validação de Headers',
          status: 'sucesso',
          detalhes: {
            status: headResponse.status,
            headers: headResponse.headers,
            server: headResponse.headers['server'],
            content_type: headResponse.headers['content-type'],
          },
        });
      } catch (error) {
        resultado.testes.push({
          tipo: 'Validação de Headers',
          status: 'erro',
          detalhes: {
            erro: error.message,
            codigo: error.code,
          },
        });
      }

      return resultado;
    };

    // Testar todos os serviços
    for (const [nomeServico, config] of Object.entries(ambiente.servicos)) {
      const resultadoServico = await testarServico(
        nomeServico,
        config.wsdl,
        config.endpoint
      );
      validacao.servicos.push(resultadoServico);
    }

    // Calcular estatísticas
    const totalTestes = validacao.servicos.reduce(
      (acc, servico) => acc + servico.testes.length,
      0
    );
    const totalSucessos = validacao.servicos.reduce(
      (acc, servico) =>
        acc + servico.testes.filter(t => t.status === 'sucesso').length,
      0
    );
    const totalErros = totalTestes - totalSucessos;

    return res.status(200).json({
      success: true,
      data: {
        ...validacao,
        estatisticas: {
          total_servicos: validacao.servicos.length,
          total_testes,
          total_sucessos: totalSucessos,
          total_erros: totalErros,
          percentual_sucesso: Math.round((totalSucessos / totalTestes) * 100),
        },
      },
    });
  } catch (error) {
    console.error('Erro na validação de endpoints:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno na validação de endpoints',
      details: error.message,
    });
  }
}
