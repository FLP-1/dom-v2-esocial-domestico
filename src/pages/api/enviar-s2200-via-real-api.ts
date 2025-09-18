import { NextApiRequest, NextApiResponse } from 'next';
import { ESocialRealApiService } from '../../services/esocialRealApi';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cpfEmpregador = '59876913700', ambiente = 'producao' } = req.body;

  try {
    console.log('📤 Enviando S-2200 via ESocialRealApiService...');
    console.log('🏢 Empregador:', cpfEmpregador);

    // Configurar serviço real
    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpfEmpregador,
    };

    const realApiService = new ESocialRealApiService(config);

    // Dados da Erika para S-2200
    const eventoS2200 = {
      tipo: 'S-2200',
      dados: {
        empregador: {
          cpf: cpfEmpregador,
          nome: 'FRANCISCO JOSE LATTARI PAPALEO',
        },
        empregado: {
          cpf: '38645446880',
          nome: 'ERIKA APARECIDA DOS SANTOS BARBOSA',
          dataNascimento: '1986-12-23',
          dataAdmissao: '2024-01-15',
          cargo: 'Empregada Doméstica',
          salario: 1412.0,
        },
      },
    };

    console.log('📤 Enviando evento S-2200 via API Real...');
    console.log('👤 Dados:', JSON.stringify(eventoS2200, null, 2));

    // Enviar evento
    const resultado = await realApiService.enviarLote([eventoS2200]);

    if (resultado.success) {
      console.log('✅ S-2200 enviado com sucesso via API Real!');
      console.log('📋 Protocolo:', resultado.protocolo);
      console.log('📋 Resposta completa:', JSON.stringify(resultado, null, 2));

      return res.status(200).json({
        success: true,
        data: {
          evento: 'S-2200',
          descricao: 'Cadastramento da Empregada Erika via API Real',
          protocolo: resultado.protocolo,
          status: resultado.status,
          dadosEnviados: eventoS2200.dados,
          respostaCompleta: resultado,
          fonte: 'ESOCIAL_REAL_API_SERVICE',
          timestamp: new Date().toISOString(),
        },
        message: 'S-2200 enviado com sucesso via ESocialRealApiService',
      });
    } else {
      console.log('❌ Erro no envio via API Real:', resultado.erro);

      return res.status(400).json({
        success: false,
        error: resultado.erro,
        message: 'Falha no envio do S-2200 via API Real',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Erro no S-2200 via API Real:', error);
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      message: 'Falha no processamento via ESocialRealApiService',
      timestamp: new Date().toISOString(),
    });
  }
}
