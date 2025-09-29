import { spawn } from 'child_process';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // URLs para testar
    const urlsParaTestar = [
      {
        nome: 'Envio (que funciona)',
        url: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      },
      {
        nome: 'Consulta Lotes (URLs CORRETAS)',
        url: 'https://webservices.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
      },
      {
        nome: 'Consulta Eventos (URLs CORRETAS)',
        url: 'https://webservices.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc',
      },
    ];

    const resultados = [];

    for (const endpoint of urlsParaTestar) {
      // Teste 1: Ping básico
      const pingResult = await executarComando('curl', [
        '-I',
        '-s',
        '-k',
        '--max-time',
        '10',
        '--connect-timeout',
        '5',
        endpoint.url,
      ]);

      // Teste 2: WSDL (sem certificado)
      const wsdlResult = await executarComando('curl', [
        '-s',
        '-k',
        '--max-time',
        '10',
        '--connect-timeout',
        '5',
        `${endpoint.url}?wsdl`,
      ]);

      resultados.push({
        nome: endpoint.nome,
        url: endpoint.url,
        conectividade: {
          sucesso: pingResult.success,
          status_http: extrairStatusHttp(pingResult.stdout),
          erro: pingResult.error,
        },
        wsdl: {
          sucesso: wsdlResult.success,
          tamanho: wsdlResult.stdout?.length || 0,
          contem_wsdl:
            wsdlResult.stdout?.includes('<wsdl:') ||
            wsdlResult.stdout?.includes('<definitions') ||
            false,
          contem_html: wsdlResult.stdout?.includes('<html') || false,
          primeiras_linhas:
            wsdlResult.stdout?.split('\n').slice(0, 3).join('\\n') || '',
          erro: wsdlResult.error,
        },
      });
    }

    // Análise dos resultados
    const analise = {
      total_testados: resultados.length,
      conectiveis: resultados.filter(r => r.conectividade.sucesso).length,
      wsdls_acessiveis: resultados.filter(r => r.wsdl.contem_wsdl).length,
      problemas_identificados: [],
    };

    // Identificar problemas
    const envioFunciona = resultados.find(r => r.nome.includes('Envio'));
    const consultasFalham = resultados.filter(
      r => r.nome.includes('Consulta') && !r.wsdl.contem_wsdl
    );

    if (envioFunciona?.conectividade.sucesso && consultasFalham.length > 0) {
      analise.problemas_identificados.push(
        'Envio funciona mas consultas falham - problema específico de consultas'
      );
    }

    if (resultados.some(r => r.wsdl.contem_html)) {
      analise.problemas_identificados.push(
        'Servidor retorna HTML em vez de WSDL - possível erro de endpoint'
      );
    }

    if (resultados.every(r => !r.conectividade.sucesso)) {
      analise.problemas_identificados.push(
        'Nenhum endpoint acessível - problema de rede ou firewall'
      );
    }

    const relatorio = {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        resultados_por_endpoint: resultados,
        analise: analise,
        recomendacoes: gerarRecomendacoes(resultados, analise),
      },
      message: 'Teste de conectividade simples concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste de conectividade',
    });
  }
}

// Executar comando cURL
function executarComando(comando: string, args: string[]): Promise<any> {
  return new Promise(resolve => {
    const processo = spawn(comando, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    processo.stdout?.on('data', data => {
      stdout += data.toString();
    });

    processo.stderr?.on('data', data => {
      stderr += data.toString();
    });

    processo.on('close', code => {
      resolve({
        success: code === 0,
        stdout: stdout,
        stderr: stderr,
        error: code !== 0 ? stderr || `Código de saída: ${code}` : null,
      });
    });

    processo.on('error', error => {
      resolve({
        success: false,
        stdout: '',
        stderr: '',
        error: error.message,
      });
    });

    // Timeout
    setTimeout(() => {
      processo.kill();
      resolve({
        success: false,
        stdout: stdout,
        stderr: stderr,
        error: 'Timeout',
      });
    }, 15000);
  });
}

// Extrair status HTTP da resposta
function extrairStatusHttp(resposta: string): string {
  const match = resposta.match(/HTTP\/[\d.]+\s+(\d+)/);
  return match ? match[1] : 'Desconhecido';
}

// Gerar recomendações
function gerarRecomendacoes(resultados: any[], analise: any): string[] {
  const recomendacoes = [];

  if (analise.conectiveis === 0) {
    recomendacoes.push(
      'Verificar conectividade de rede e configurações de proxy/firewall'
    );
  }

  if (analise.wsdls_acessiveis === 0) {
    recomendacoes.push(
      'Nenhum WSDL acessível - verificar se endpoints mudaram na versão S-1.3'
    );
  }

  const envio = resultados.find(r => r.nome.includes('Envio'));
  if (envio?.conectividade.sucesso) {
    recomendacoes.push(
      'Endpoint de envio acessível - problema específico dos endpoints de consulta'
    );
  }

  if (resultados.some(r => r.wsdl.contem_html)) {
    recomendacoes.push(
      'Servidor retorna páginas HTML - URLs podem estar incorretas'
    );
  }

  recomendacoes.push(
    'Próximo passo: Testar com certificado se conectividade básica funcionar'
  );

  return recomendacoes;
}
