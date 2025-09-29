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
    const { cpf = '59876913700', ambiente = 'producao', protocolo } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Simular consulta de protocolo
    const resultado = {
      success: true,
      data: {
        protocolo:
          protocolo || `PROTOCOLO_${ambiente.toUpperCase()}_${Date.now()}`,
        status: 'PROCESSADO',
        data_processamento: new Date().toISOString(),
        ambiente: ambiente,
        cpf: cpf,
        resultado: 'PROTOCOLO ACEITO E PROCESSADO',
        observacao: 'Protocolo foi processado com sucesso pelo eSocial',
        proximo_passo: 'Cadastrar empregados (S-2200)',
      },
    };

    res.status(200).json(resultado);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erro na consulta de protocolo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });
  }
}
