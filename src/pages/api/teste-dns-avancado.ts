import axios from 'axios';
import { exec } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';
import { promisify } from 'util';

const execAsync = promisify(exec);

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
    const { environment = 'homologacao', hostname } = req.body;

    // Configuração dos ambientes
    const config = {
      homologacao: {
        nome: 'Homologação (Produção Restrita)',
        hostname: 'webservices.producaorestrita.esocial.gov.br',
        wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        endpoint:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      },
      producao: {
        nome: 'Produção',
        hostname: 'webservices.esocial.gov.br',
        wsdl: 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        endpoint:
          'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      },
    };

    const ambiente = config[environment as keyof typeof config];
    const targetHost = hostname || ambiente.hostname;

    const resultados = {
      timestamp: new Date().toISOString(),
      environment: environment,
      nome: ambiente.nome,
      hostname: targetHost,
      testes: [],
    };

    // 1. TESTE DE RESOLUÇÃO DNS DETALHADO
    try {
      // Teste com nslookup
      const { stdout: nslookupResult } = await execAsync(
        `nslookup ${targetHost}`
      );
      const ipMatch = nslookupResult.match(/Address:\s+(\d+\.\d+\.\d+\.\d+)/);
      const ip = ipMatch ? ipMatch[1] : 'N/A';

      // Teste com ping para verificar conectividade
      let pingResult = '';
      let pingSuccess = false;
      try {
        const { stdout: pingOutput } = await execAsync(
          `ping -n 2 ${targetHost}`
        );
        pingResult = pingOutput;
        pingSuccess =
          pingOutput.includes('TTL=') || pingOutput.includes('tempo<');
      } catch (pingError) {
        pingResult = `Erro no ping: ${pingError.message}`;
      }

      resultados.testes.push({
        nome: 'Resolução DNS Detalhada',
        status: ip !== 'N/A' ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          ip_resolvido: ip,
          ping_sucesso: pingSuccess,
          comando_nslookup: `nslookup ${targetHost}`,
          comando_ping: `ping -n 2 ${targetHost}`,
          resultado_nslookup: nslookupResult,
          resultado_ping: pingResult,
          resolucao_dns: ip !== 'N/A' ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Resolução DNS Detalhada',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          erro: error.message,
          resolucao_dns: 'FALHOU',
        },
      });
    }

    // 2. TESTE DE CONECTIVIDADE HTTPS AVANÇADO
    try {
      // Teste com Test-NetConnection
      let netConnectionResult = '';
      let netConnectionSuccess = false;
      try {
        const { stdout: netConnOutput } = await execAsync(
          `powershell "Test-NetConnection -ComputerName ${targetHost} -Port 443 -InformationLevel Detailed"`
        );
        netConnectionResult = netConnOutput;
        netConnectionSuccess = netConnOutput.includes(
          'TcpTestSucceeded : True'
        );
      } catch (netConnError) {
        netConnectionResult = `Erro no Test-NetConnection: ${netConnError.message}`;
      }

      // Teste com curl para verificar resposta HTTP
      let curlResult = '';
      let curlSuccess = false;
      try {
        const { stdout: curlOutput } = await execAsync(
          `curl -I -s --connect-timeout 10 --max-time 15 "${ambiente.wsdl}"`
        );
        curlResult = curlOutput;
        curlSuccess =
          curlOutput.includes('HTTP/') && !curlOutput.includes('404');
      } catch (curlError) {
        curlResult = `Erro no curl: ${curlError.message}`;
      }

      resultados.testes.push({
        nome: 'Conectividade HTTPS Avançada',
        status: netConnectionSuccess || curlSuccess ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          porta: 443,
          netconnection_sucesso: netConnectionSuccess,
          curl_sucesso: curlSuccess,
          comando_netconnection: `Test-NetConnection -ComputerName ${targetHost} -Port 443`,
          comando_curl: `curl -I -s --connect-timeout 10 "${ambiente.wsdl}"`,
          resultado_netconnection: netConnectionResult,
          resultado_curl: curlResult,
          conectividade_https:
            netConnectionSuccess || curlSuccess ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Conectividade HTTPS Avançada',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          porta: 443,
          erro: error.message,
          conectividade_https: 'FALHOU',
        },
      });
    }

    // 3. TESTE DE ACESSO AO WSDL VIA AXIOS
    try {
      const wsdlResponse = await axios.get(ambiente.wsdl, {
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'DOM-System/1.0',
        },
      });

      const wsdlSuccess = wsdlResponse.status === 200;
      const isWSDL = wsdlResponse.data?.includes('wsdl:definitions') || false;

      resultados.testes.push({
        nome: 'Acesso ao WSDL via Axios',
        status: wsdlSuccess ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.wsdl,
          status: wsdlResponse.status,
          content_type: wsdlResponse.headers['content-type'],
          server: wsdlResponse.headers['server'],
          tamanho: wsdlResponse.data?.length || 0,
          eh_wsdl: isWSDL,
          sucesso: wsdlSuccess,
          acesso_wsdl: wsdlSuccess ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Acesso ao WSDL via Axios',
        status: 'erro',
        detalhes: {
          url: ambiente.wsdl,
          erro: error.message,
          codigo: error.code,
          acesso_wsdl: 'FALHOU',
        },
      });
    }

    // 4. TESTE DE ACESSO AO ENDPOINT VIA AXIOS
    try {
      const endpointResponse = await axios.get(ambiente.endpoint, {
        timeout: 15000,
        validateStatus: () => true,
        headers: {
          'User-Agent': 'DOM-System/1.0',
        },
      });

      const endpointSuccess = endpointResponse.status < 500;
      const isSOAP = endpointResponse.data?.includes('soap:Envelope') || false;

      resultados.testes.push({
        nome: 'Acesso ao Endpoint via Axios',
        status: endpointSuccess ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.endpoint,
          status: endpointResponse.status,
          content_type: endpointResponse.headers['content-type'],
          server: endpointResponse.headers['server'],
          tamanho: endpointResponse.data?.length || 0,
          eh_soap: isSOAP,
          sucesso: endpointSuccess,
          acesso_endpoint: endpointSuccess ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Acesso ao Endpoint via Axios',
        status: 'erro',
        detalhes: {
          url: ambiente.endpoint,
          erro: error.message,
          codigo: error.code,
          acesso_endpoint: 'FALHOU',
        },
      });
    }

    // 5. TESTE DE ROTA DE REDE DETALHADO
    try {
      const { stdout: tracertResult } = await execAsync(
        `tracert -h 15 ${targetHost}`
      );
      const routeSuccess =
        tracertResult.includes('Rastreando') && !tracertResult.includes('*');

      resultados.testes.push({
        nome: 'Rota de Rede Detalhada',
        status: routeSuccess ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          sucesso: routeSuccess,
          comando: `tracert -h 15 ${targetHost}`,
          resultado: tracertResult,
          rota_rede: routeSuccess ? 'OK' : 'FALHOU',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Rota de Rede Detalhada',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          erro: error.message,
          rota_rede: 'FALHOU',
        },
      });
    }

    // 6. TESTE DE CONFIGURAÇÃO DNS LOCAL
    try {
      const { stdout: dnsConfigResult } = await execAsync(`ipconfig /all`);
      const dnsServers =
        dnsConfigResult.match(/Servidores DNS[:\s]+([^\r\n]+)/gi) || [];

      resultados.testes.push({
        nome: 'Configuração DNS Local',
        status: 'sucesso',
        detalhes: {
          comando: 'ipconfig /all',
          servidores_dns: dnsServers,
          configuracao_dns: 'OK',
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Configuração DNS Local',
        status: 'erro',
        detalhes: {
          erro: error.message,
          configuracao_dns: 'FALHOU',
        },
      });
    }

    // Calcular resumo
    const totalTestes = resultados.testes.length;
    const sucessos = resultados.testes.filter(
      t => t.status === 'sucesso'
    ).length;
    const erros = resultados.testes.filter(t => t.status === 'erro').length;

    // Adicionar recomendações baseadas nos resultados
    const recomendacoes = [];

    if (erros > 0) {
      recomendacoes.push('⚠️ Foram identificados problemas de conectividade');
      recomendacoes.push('🔍 Verifique as configurações de DNS e rede');
      recomendacoes.push(
        '🌐 Considere usar servidores DNS alternativos (8.8.8.8, 1.1.1.1)'
      );
    }

    if (sucessos === totalTestes) {
      recomendacoes.push('✅ Todos os testes de conectividade passaram');
      recomendacoes.push('🚀 Sistema pronto para integração com eSocial');
    }

    return res.status(200).json({
      success: true,
      data: {
        ...resultados,
        recomendacoes,
        resumo: {
          total_testes: totalTestes,
          sucessos,
          erros,
          percentual_sucesso: Math.round((sucessos / totalTestes) * 100),
        },
      },
    });
  } catch (error) {
    console.error('Erro no teste DNS avançado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no teste DNS avançado',
      details: error.message,
    });
  }
}
