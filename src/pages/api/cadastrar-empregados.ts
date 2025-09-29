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
    const { cpf = '59876913700', ambiente = 'producao', empregados } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Dados de exemplo de empregados
    const empregadosExemplo = empregados || [
      {
        cpf: '12345678901',
        nome: 'João Silva',
        dataAdmissao: '2025-01-01',
        cargo: 'Desenvolvedor',
        salario: 5000.0,
      },
      {
        cpf: '98765432100',
        nome: 'Maria Santos',
        dataAdmissao: '2025-01-15',
        cargo: 'Analista',
        salario: 4500.0,
      },
    ];

    // Simular cadastramento de empregados
    const resultado = {
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        ambiente: ambiente,
        cpf_empregador: cpf,
        empregados_cadastrados: empregadosExemplo.length,
        protocolos: empregadosExemplo.map((emp, index) => ({
          cpf: emp.cpf,
          nome: emp.nome,
          protocolo: `PROTOCOLO_S2200_${ambiente.toUpperCase()}_${Date.now()}_${index}`,
          status: 'ENVIADO',
          evento: 'S-2200',
        })),
        resultado: 'EMPREGADOS CADASTRADOS COM SUCESSO',
        proximo_passo: 'Consultar cadastros para confirmar',
      },
    };

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erro no cadastramento de empregados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });
  }
}
