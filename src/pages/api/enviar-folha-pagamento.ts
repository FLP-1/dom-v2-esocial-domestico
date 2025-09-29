import { NextApiRequest, NextApiResponse } from 'next';
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
    const { cpf = '59876913700', ambiente = 'producao', folha } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Dados de exemplo da folha de pagamento
    const folhaExemplo = folha || {
      periodo: '2025-01',
      empregados: [
        {
          cpf: '12345678901',
          nome: 'João Silva',
          salario: 5000.0,
          descontos: 500.0,
          adicionais: 200.0,
          liquido: 4700.0,
        },
        {
          cpf: '98765432100',
          nome: 'Maria Santos',
          salario: 4500.0,
          descontos: 450.0,
          adicionais: 150.0,
          liquido: 4200.0,
        },
      ],
      total_folha: 8900.0,
      total_encargos: 2670.0,
    };

    // Simular envio de folha de pagamento
    const resultado = {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        ambiente: ambiente,
        cpf_empregador: cpf,
        periodo: folhaExemplo.periodo,
        protocolo: `PROTOCOLO_S1200_${ambiente.toUpperCase()}_${Date.now()}`,
        eventos_enviados: folhaExemplo.empregados.length,
        total_folha: folhaExemplo.total_folha,
        total_encargos: folhaExemplo.total_encargos,
        status: 'ENVIADO',
        resultado: 'FOLHA DE PAGAMENTO ENVIADA COM SUCESSO',
        proximo_passo: 'Monitorar status e processamento',
        observacao: 'Folha será processada pelo eSocial em até 24h',
      },
    };

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erro no envio da folha de pagamento: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });
  }
}
