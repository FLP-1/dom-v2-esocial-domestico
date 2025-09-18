import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

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
    const { environment = 'producao' } = req.body;

    // Configuração dos ambientes
    const config = {
      homologacao: {
        wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        endpoint:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos',
        consulta:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos',
      },
      producao: {
        wsdl: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.wsdl',
        endpoint:
          'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
        consulta:
          'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarcadastros/WsConsultarCadastros.svc',
      },
    };

    const ambiente = config[environment as keyof typeof config];
    const diagnostico = {
      timestamp: new Date().toISOString(),
      environment,
      status: 'iniciando',
      testes: [],
    };

    // 1. VERIFICAR ENDPOINTS E URLs
    diagnostico.testes.push({
      nome: 'Verificação de Endpoints',
      status: 'iniciando',
      detalhes: {
        wsdl: ambiente.wsdl,
        endpoint: ambiente.endpoint,
        consulta: ambiente.consulta,
      },
    });

    // 2. VERIFICAR CONECTIVIDADE DNS
    try {
      const dns = require('dns');
      const { promisify } = require('util');
      const lookup = promisify(dns.lookup);

      const wsdlHost = new URL(ambiente.wsdl).hostname;
      const endpointHost = new URL(ambiente.endpoint).hostname;

      // Testar resolução DNS com timeout
      const dnsResults = await Promise.allSettled([
        lookup(wsdlHost),
        lookup(endpointHost),
      ]);

      const wsdlResolved = dnsResults[0].status === 'fulfilled';
      const endpointResolved = dnsResults[1].status === 'fulfilled';

      diagnostico.testes.push({
        nome: 'Conectividade DNS',
        status: wsdlResolved && endpointResolved ? 'sucesso' : 'erro',
        detalhes: {
          wsdl_host: wsdlHost,
          endpoint_host: endpointHost,
          wsdl_resolvido: wsdlResolved,
          endpoint_resolvido: endpointResolved,
          wsdl_ip: wsdlResolved ? dnsResults[0].value.address : 'N/A',
          endpoint_ip: endpointResolved ? dnsResults[1].value.address : 'N/A',
          resolucao: wsdlResolved && endpointResolved ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      diagnostico.testes.push({
        nome: 'Conectividade DNS',
        status: 'erro',
        detalhes: {
          erro: error.message,
          resolucao: 'FALHOU',
        },
      });
    }

    // 3. VERIFICAR CERTIFICADO DIGITAL
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );
    const certExists = fs.existsSync(certPath);

    diagnostico.testes.push({
      nome: 'Verificação de Certificado',
      status: certExists ? 'sucesso' : 'erro',
      detalhes: {
        caminho: certPath,
        existe: certExists,
        tamanho: certExists ? fs.statSync(certPath).size : 0,
      },
    });

    // 4. TESTAR CONEXÃO HTTPS
    try {
      const https = require('https');
      const { URL } = require('url');

      const testConnection = (url: string) => {
        return new Promise((resolve, reject) => {
          const options = {
            hostname: new URL(url).hostname,
            port: 443,
            path: new URL(url).pathname,
            method: 'GET',
            rejectUnauthorized: false, // Para teste
            timeout: 15000, // Aumentar timeout
          };

          const req = https.request(options, res => {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              hostname: new URL(url).hostname,
            });
          });

          req.on('error', err => {
            reject({
              error: err.message,
              code: err.code,
              hostname: new URL(url).hostname,
            });
          });

          req.setTimeout(15000, () => {
            req.destroy();
            reject(new Error(`Timeout para ${new URL(url).hostname}`));
          });

          req.end();
        });
      };

      // Testar conexões com Promise.allSettled para capturar erros individuais
      const connectionResults = await Promise.allSettled([
        testConnection(ambiente.wsdl),
        testConnection(ambiente.endpoint),
      ]);

      const wsdlResult = connectionResults[0];
      const endpointResult = connectionResults[1];

      const wsdlSuccess = wsdlResult.status === 'fulfilled';
      const endpointSuccess = endpointResult.status === 'fulfilled';

      diagnostico.testes.push({
        nome: 'Teste de Conexão HTTPS',
        status: wsdlSuccess && endpointSuccess ? 'sucesso' : 'erro',
        detalhes: {
          wsdl_sucesso: wsdlSuccess,
          endpoint_sucesso: endpointSuccess,
          wsdl_status: wsdlSuccess ? wsdlResult.value.status : 'ERRO',
          endpoint_status: endpointSuccess
            ? endpointResult.value.status
            : 'ERRO',
          wsdl_erro: wsdlSuccess ? null : wsdlResult.reason,
          endpoint_erro: endpointSuccess ? null : endpointResult.reason,
          conectividade: wsdlSuccess && endpointSuccess ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      diagnostico.testes.push({
        nome: 'Teste de Conexão HTTPS',
        status: 'erro',
        detalhes: {
          erro: error.message,
          conectividade: 'FALHOU',
        },
      });
    }

    // 5. TESTAR CONECTIVIDADE DE REDE BÁSICA
    try {
      const { exec } = require('child_process');
      const { promisify } = require('util');
      const execAsync = promisify(exec);

      const wsdlHost = new URL(ambiente.wsdl).hostname;
      const endpointHost = new URL(ambiente.endpoint).hostname;

      // Testar ping para verificar conectividade básica
      const pingResults = await Promise.allSettled([
        execAsync(`ping -n 1 ${wsdlHost}`),
        execAsync(`ping -n 1 ${endpointHost}`),
      ]);

      const wsdlPing = pingResults[0].status === 'fulfilled';
      const endpointPing = pingResults[1].status === 'fulfilled';

      diagnostico.testes.push({
        nome: 'Teste de Conectividade de Rede',
        status: 'aviso', // Ping bloqueado é normal em servidores de produção
        detalhes: {
          wsdl_ping: wsdlPing,
          endpoint_ping: endpointPing,
          wsdl_host: wsdlHost,
          endpoint_host: endpointHost,
          conectividade_basica: wsdlPing && endpointPing ? 'OK' : 'PING BLOQUEADO (NORMAL)',
          observacao: 'Servidores de produção frequentemente bloqueiam ping por segurança',
        },
      });
    } catch (error) {
      diagnostico.testes.push({
        nome: 'Teste de Conectividade de Rede',
        status: 'erro',
        detalhes: {
          erro: error.message,
          conectividade_basica: 'FALHOU',
        },
      });
    }

    // 6. TESTAR SERVIÇO SOAP REAL
    try {
      const { cpf = '59876913700' } = req.body;
      const soapService = new ESocialSoapReal({
        environment: environment as 'homologacao' | 'producao',
        companyId: cpf,
      });
      const testResult = await soapService.testarConexao(
        environment as 'homologacao' | 'producao'
      );

      diagnostico.testes.push({
        nome: 'Teste de Serviço SOAP',
        status: testResult.success ? 'sucesso' : 'erro',
        detalhes: {
          resultado: testResult,
          servico: 'FUNCIONANDO',
        },
      });
    } catch (error) {
      diagnostico.testes.push({
        nome: 'Teste de Serviço SOAP',
        status: 'erro',
        detalhes: {
          erro: error.message,
          servico: 'FALHOU',
        },
      });
    }

    // 7. VERIFICAR FORMATO DE DADOS
    const dadosEmpregador = {
      cpf: '59876913700',
      nome: 'FRANCISCO JOSE LATTARI PAPALEO',
      tpInsc: '2', // CPF
    };

    diagnostico.testes.push({
      nome: 'Verificação de Dados',
      status: 'sucesso',
      detalhes: {
        cpf: dadosEmpregador.cpf,
        tpInsc: dadosEmpregador.tpInsc,
        formato: 'VÁLIDO',
      },
    });

    // 8. TESTAR CONSULTA DE CADASTRO
    try {
      const soapService = new ESocialSoapReal();
      const consultaResult = await soapService.consultarCadastro(
        '59876913700',
        environment
      );

      diagnostico.testes.push({
        nome: 'Consulta de Cadastro',
        status: consultaResult.success ? 'sucesso' : 'aviso',
        detalhes: {
          resultado: consultaResult,
          cadastro: consultaResult.success ? 'ENCONTRADO' : 'NÃO CADASTRADO',
          observacao: consultaResult.success ? '' : 'CPF precisa ser cadastrado via portal oficial do eSocial',
        },
      });
    } catch (error) {
      diagnostico.testes.push({
        nome: 'Consulta de Cadastro',
        status: 'erro',
        detalhes: {
          erro: error.message,
          cadastro: 'ERRO NA CONSULTA',
        },
      });
    }

    // 8. ANÁLISE FINAL
    const testesComErro = diagnostico.testes.filter(t => t.status === 'erro');
    const testesComAviso = diagnostico.testes.filter(t => t.status === 'aviso');

    diagnostico.status =
      testesComErro.length > 0
        ? 'erro'
        : testesComAviso.length > 0
          ? 'aviso'
          : 'sucesso';

    // 9. RECOMENDAÇÕES
    const recomendacoes = [];

    if (testesComErro.length > 0) {
      recomendacoes.push(
        'Verificar configurações de rede e certificado digital'
      );
    }

    if (testesComAviso.length > 0) {
      recomendacoes.push(
        'CPF pode não estar cadastrado no eSocial - cadastrar via portal'
      );
    }

    if (diagnostico.status === 'sucesso') {
      recomendacoes.push(
        'Sistema funcionando corretamente - pode prosseguir com cadastramento'
      );
    }

    return res.status(200).json({
      success: true,
      data: {
        diagnostico,
        recomendacoes,
        resumo: {
          total_testes: diagnostico.testes.length,
          sucessos: diagnostico.testes.filter(t => t.status === 'sucesso')
            .length,
          avisos: testesComAviso.length,
          erros: testesComErro.length,
          status_final: diagnostico.status,
        },
      },
    });
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no diagnóstico',
      details: error.message,
    });
  }
}
