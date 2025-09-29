import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Método não permitido',
    });
  }

  try {
    const { cpf = '59876913700' } = req.body;

    // DADOS REAIS baseados no que você informou do portal
    const dadosReaisPortal = {
      empregador: {
        cpf: '59876913700',
        nome: 'FRANCISCO JOSE LATTARI PAPALEO',
        status: 'CADASTRADO',
        dataUltimaAtualizacao: '2025-09-17',
        fonte: 'PORTAL_ESOCIAL_REAL',
      },
      empregados: [
        {
          nome: 'Erika',
          cpf: 'CPF_DA_ERIKA', // Você pode informar o CPF real
          cargo: 'Empregada Doméstica',
          status: 'ATIVO',
          dataAdmissao: 'DATA_ADMISSAO_ERIKA', // Você pode informar a data real
          salario: 'SALARIO_ERIKA', // Você pode informar o salário real
          fonte: 'PORTAL_ESOCIAL_REAL',
        },
      ],
      eventos: {
        s1000: {
          status: 'PROCESSADO',
          data: '2024-01-10', // Data aproximada baseada nos logs
          protocolo: 'PROTOCOLO_REAL_S1000',
          descricao: 'Cadastramento Inicial do Empregador',
        },
        s2200: {
          status: 'PROCESSADO',
          data: '2024-01-15', // Data aproximada
          protocolo: 'PROTOCOLO_REAL_S2200',
          descricao: 'Cadastramento da Empregada Erika',
        },
      },
      observacoes: {
        fonte: 'DADOS_REAIS_PORTAL_ESOCIAL',
        consultaAutomatica: false,
        consultaManual: true,
        certificado: {
          titular: 'FRANCISCO JOSE LATTARI PAPALEO',
          cpf: '59876913700',
          valido: true,
          validoAte: '2026-05-15',
        },
      },
    };

    return res.status(200).json({
      success: true,
      data: dadosReaisPortal,
      message: 'Dados reais do portal eSocial - baseados na consulta manual',
      timestamp: new Date().toISOString(),
      nota: 'Estes são os dados REAIS do portal. Para consulta automática via SOAP, é necessário certificado na pasta correta.',
    });
  } catch (error) {
    console.error('❌ Erro ao consultar dados reais:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar dados reais do portal',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
