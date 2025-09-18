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
        wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        endpoint:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos',
        consulta:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos',
        hostname: 'webservices.producaorestrita.esocial.gov.br',
      },
      producao: {
        wsdl: 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.wsdl',
        endpoint:
          'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos',
        consulta:
          'https://webservices.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos',
        hostname: 'webservices.esocial.gov.br',
      },
    };

    const ambiente = config[environment as keyof typeof config];
    const targetHost = hostname || ambiente.hostname;

    const resultados = {
      timestamp: new Date().toISOString(),
      environment,
      hostname: targetHost,
      testes: [],
    };

    // 1. TESTE DE RESOLUÇÃO DNS
    try {
      console.log(`🔍 Testando resolução DNS para ${targetHost}...`);
      const { stdout: nslookupResult } = await execAsync(
        `nslookup ${targetHost}`
      );

      const ipMatch = nslookupResult.match(/Address:\s+(\d+\.\d+\.\d+\.\d+)/);
      const ip = ipMatch ? ipMatch[1] : 'N/A';

      resultados.testes.push({
        nome: 'Resolução DNS',
        status: ip !== 'N/A' ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          ip_resolvido: ip,
          comando: `nslookup ${targetHost}`,
          resultado_completo: nslookupResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Resolução DNS',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          erro: error.message,
          comando: `nslookup ${targetHost}`,
        },
      });
    }

    // 2. TESTE DE CONECTIVIDADE DE REDE (PING)
    try {
      console.log(`🏓 Testando ping para ${targetHost}...`);
      const { stdout: pingResult } = await execAsync(`ping -n 4 ${targetHost}`);

      const pingSuccess =
        pingResult.includes('TTL=') || pingResult.includes('tempo<');

      resultados.testes.push({
        nome: 'Teste de Ping',
        status: pingSuccess ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          sucesso: pingSuccess,
          comando: `ping -n 4 ${targetHost}`,
          resultado: pingResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Teste de Ping',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          erro: error.message,
          comando: `ping -n 4 ${targetHost}`,
        },
      });
    }

    // 3. TESTE DE CONECTIVIDADE HTTPS (PORTA 443)
    try {
      console.log(`🔒 Testando conectividade HTTPS para ${targetHost}:443...`);
      const { stdout: telnetResult } = await execAsync(
        `powershell "Test-NetConnection -ComputerName ${targetHost} -Port 443"`
      );

      const httpsSuccess = telnetResult.includes('TcpTestSucceeded : True');

      resultados.testes.push({
        nome: 'Conectividade HTTPS',
        status: httpsSuccess ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          porta: 443,
          sucesso: httpsSuccess,
          comando: `Test-NetConnection -ComputerName ${targetHost} -Port 443`,
          resultado: telnetResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Conectividade HTTPS',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          porta: 443,
          erro: error.message,
          comando: `Test-NetConnection -ComputerName ${targetHost} -Port 443`,
        },
      });
    }

    // 4. TESTE DE ACESSO AO WSDL
    try {
      console.log(`📄 Testando acesso ao WSDL...`);
      const { stdout: curlResult } = await execAsync(
        `curl -I -s --connect-timeout 10 "${ambiente.wsdl}"`
      );

      const wsdlAccessible =
        curlResult.includes('HTTP/') && !curlResult.includes('404');

      resultados.testes.push({
        nome: 'Acesso ao WSDL',
        status: wsdlAccessible ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.wsdl,
          sucesso: wsdlAccessible,
          comando: `curl -I -s --connect-timeout 10 "${ambiente.wsdl}"`,
          resultado: curlResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Acesso ao WSDL',
        status: 'erro',
        detalhes: {
          url: ambiente.wsdl,
          erro: error.message,
          comando: `curl -I -s --connect-timeout 10 "${ambiente.wsdl}"`,
        },
      });
    }

    // 5. TESTE DE ACESSO AO ENDPOINT
    try {
      console.log(`🔗 Testando acesso ao endpoint...`);
      const { stdout: endpointResult } = await execAsync(
        `curl -I -s --connect-timeout 10 "${ambiente.endpoint}"`
      );

      const endpointAccessible =
        endpointResult.includes('HTTP/') && !endpointResult.includes('404');

      resultados.testes.push({
        nome: 'Acesso ao Endpoint',
        status: endpointAccessible ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.endpoint,
          sucesso: endpointAccessible,
          comando: `curl -I -s --connect-timeout 10 "${ambiente.endpoint}"`,
          resultado: endpointResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Acesso ao Endpoint',
        status: 'erro',
        detalhes: {
          url: ambiente.endpoint,
          erro: error.message,
          comando: `curl -I -s --connect-timeout 10 "${ambiente.endpoint}"`,
        },
      });
    }

    // 6. TESTE DE ROTA DE REDE
    try {
      console.log(`🛣️ Testando rota de rede...`);
      const { stdout: tracertResult } = await execAsync(
        `tracert -h 10 ${targetHost}`
      );

      const routeSuccess =
        tracertResult.includes('Rastreando') && !tracertResult.includes('*');

      resultados.testes.push({
        nome: 'Rota de Rede',
        status: routeSuccess ? 'sucesso' : 'erro',
        detalhes: {
          hostname: targetHost,
          sucesso: routeSuccess,
          comando: `tracert -h 10 ${targetHost}`,
          resultado: tracertResult,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Rota de Rede',
        status: 'erro',
        detalhes: {
          hostname: targetHost,
          erro: error.message,
          comando: `tracert -h 10 ${targetHost}`,
        },
      });
    }

    // Calcular resumo
    const totalTestes = resultados.testes.length;
    const sucessos = resultados.testes.filter(
      t => t.status === 'sucesso'
    ).length;
    const erros = resultados.testes.filter(t => t.status === 'erro').length;

    return res.status(200).json({
      success: true,
      data: {
        ...resultados,
        resumo: {
          total_testes: totalTestes,
          sucessos,
          erros,
          percentual_sucesso: Math.round((sucessos / totalTestes) * 100),
        },
      },
    });
  } catch (error) {
    console.error('Erro no teste de conectividade:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no teste de conectividade',
      details: error.message,
    });
  }
}
