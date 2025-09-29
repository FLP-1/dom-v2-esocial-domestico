import { NextApiRequest, NextApiResponse } from 'next';
import { DadosReaisService } from '../../services/dadosReaisService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cpfEmpregador, cpfEmpregado } = req.body;

  if (!cpfEmpregador) {
    return res.status(400).json({
      success: false,
      error: 'CPF do empregador é obrigatório',
    });
  }

  try {
    console.log(`🎯 CONSULTA DE DADOS REAIS CONFIRMADOS`);
    console.log(`🏢 Empregador: ${cpfEmpregador}`);
    console.log(`👤 Empregado: ${cpfEmpregado || 'Todos'}`);

    const dadosService = new DadosReaisService();

    // 1. Obter dados REAIS do empregador
    const empregador = await dadosService.obterDadosEmpregador(cpfEmpregador);

    // 2. Obter dados REAIS do(s) empregado(s)
    let empregados = [];
    if (cpfEmpregado) {
      const empregado = await dadosService.obterDadosEmpregado(cpfEmpregado);
      if (empregado.success) {
        empregados = [empregado.data];
      }
    } else {
      // Se não especificou CPF, buscar todos os empregados conhecidos
      const erika = await dadosService.obterDadosEmpregado('38645446880');
      if (erika.success) {
        empregados = [erika.data];
      }
    }

    // 3. Compilar resposta com dados reais
    const response = {
      success: true,
      data: {
        fonte: 'DADOS_REAIS_FONTES_OFICIAIS',
        timestamp: new Date().toISOString(),
        empregador: empregador.success
          ? empregador.data
          : {
              cpf: cpfEmpregador,
              erro: empregador.error,
              fonte: 'ERRO_CONSULTA',
            },
        empregados: empregados,
        diagnostico: {
          empregador_encontrado: empregador.success,
          empregados_encontrados: empregados.length,
          fontes_consultadas: [
            'eSocial SOAP',
            'Portal eSocial confirmado',
            'Qualificação Cadastral oficial',
          ],
        },
      },
      message: 'Consulta de dados reais via fontes oficiais',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Erro na consulta de dados reais:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha na consulta de dados reais',
      timestamp: new Date().toISOString(),
    });
  }
}
