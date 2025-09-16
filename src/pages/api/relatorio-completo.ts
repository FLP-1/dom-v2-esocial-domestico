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

    // Executar todos os testes em sequência
    const testes = [
      {
        nome: 'DNS Avançado',
        url: '/api/teste-dns-avancado',
        body: { environment },
      },
      {
        nome: 'SOAP Avançado',
        url: '/api/teste-soap-avancado',
        body: { environment, cpf: '59876913700' },
      },
      {
        nome: 'Conectividade',
        url: '/api/teste-conectividade',
        body: { environment },
      },
      { nome: 'Simples', url: '/api/teste-simples', body: { environment } },
    ];

    const resultados = [];
    const erros = [];

    for (const teste of testes) {
      try {
        const response = await fetch(`http://localhost:3000${teste.url}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(teste.body),
        });

        const data = await response.json();

        if (data.success) {
          resultados.push({
            nome: teste.nome,
            sucesso: true,
            dados: data.data,
          });
        } else {
          erros.push({
            nome: teste.nome,
            erro: data.error,
          });
        }
      } catch (error) {
        erros.push({
          nome: teste.nome,
          erro: error.message,
        });
      }
    }

    // Gerar relatório consolidado
    const relatorio = {
      timestamp: new Date().toISOString(),
      environment: environment,
      resumo: {
        total_testes: resultados.length,
        sucessos: resultados.length,
        erros: erros.length,
        percentual_sucesso: Math.round(
          (resultados.length / (resultados.length + erros.length)) * 100
        ),
      },
      resultados: resultados,
      erros: erros,
      recomendacoes: [],
      proximos_passos: [],
    };

    // Adicionar recomendações baseadas nos resultados
    if (erros.length > 0) {
      relatorio.recomendacoes.push(
        '⚠️ Foram identificados problemas em alguns testes'
      );
      relatorio.recomendacoes.push(
        '🔍 Revise os erros detalhados e execute correções'
      );
      relatorio.recomendacoes.push(
        '🌐 Verifique configurações de DNS e conectividade de rede'
      );
    }

    if (resultados.length > 0) {
      relatorio.recomendacoes.push(
        '✅ Alguns testes foram executados com sucesso'
      );
      relatorio.recomendacoes.push(
        '📋 Analise os resultados detalhados para identificar problemas específicos'
      );
    }

    // Adicionar próximos passos
    relatorio.proximos_passos.push(
      '1. Analisar resultados detalhados de cada teste'
    );
    relatorio.proximos_passos.push('2. Corrigir problemas identificados');
    relatorio.proximos_passos.push(
      '3. Executar testes novamente para validar correções'
    );
    relatorio.proximos_passos.push(
      '4. Implementar melhorias baseadas nos resultados'
    );

    return res.status(200).json({
      success: true,
      data: relatorio,
    });
  } catch (error) {
    console.error('Erro no relatório completo:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no relatório completo',
      details: error.message,
    });
  }
}
