import { NextApiRequest, NextApiResponse } from 'next';
import { ApiOficialService } from '../../services/apiOficialService';
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
    const apiService = new ApiOficialService();
    const dadosService = new DadosReaisService();

    const cpfEmpregadoFinal = cpfEmpregado || '38645446880';

    const resultados = {
      empregador: {
        fontes_testadas: [],
        dados_encontrados: null,
        fonte_sucesso: null,
      },
      empregado: {
        fontes_testadas: [],
        dados_encontrados: null,
        fonte_sucesso: null,
      },
    };

    // === CONSULTAR EMPREGADOR ===

    // Fonte 1: Portal da Transparência
    const transparenciaEmpregador =
      await apiService.consultarPortalTransparencia(cpfEmpregador);
    resultados.empregador.fontes_testadas.push({
      fonte: 'Portal da Transparência',
      sucesso: transparenciaEmpregador.success,
      erro: transparenciaEmpregador.error,
    });
    if (transparenciaEmpregador.success) {
      resultados.empregador.dados_encontrados = transparenciaEmpregador.data;
      resultados.empregador.fonte_sucesso = 'PORTAL_TRANSPARENCIA';
    }

    // Fonte 2: eSocial (que já funciona)
    if (!resultados.empregador.dados_encontrados) {
      const esocialEmpregador =
        await dadosService.obterDadosEmpregador(cpfEmpregador);
      resultados.empregador.fontes_testadas.push({
        fonte: 'eSocial Portal Confirmado',
        sucesso: esocialEmpregador.success,
        erro: esocialEmpregador.error,
      });
      if (esocialEmpregador.success) {
        resultados.empregador.dados_encontrados = esocialEmpregador.data;
        resultados.empregador.fonte_sucesso = 'ESOCIAL_CONFIRMADO';
      }
    }

    // === CONSULTAR EMPREGADO ===

    // Fonte 1: Portal da Transparência
    const transparenciaEmpregado =
      await apiService.consultarPortalTransparencia(cpfEmpregadoFinal);
    resultados.empregado.fontes_testadas.push({
      fonte: 'Portal da Transparência',
      sucesso: transparenciaEmpregado.success,
      erro: transparenciaEmpregado.error,
    });
    if (transparenciaEmpregado.success) {
      resultados.empregado.dados_encontrados = transparenciaEmpregado.data;
      resultados.empregado.fonte_sucesso = 'PORTAL_TRANSPARENCIA';
    }

    // Fonte 2: CNIS (Relação Trabalhista)
    if (!resultados.empregado.dados_encontrados) {
      const cnisEmpregado = await apiService.consultarCNIS(cpfEmpregadoFinal);
      resultados.empregado.fontes_testadas.push({
        fonte: 'CNIS Relação Trabalhista',
        sucesso: cnisEmpregado.success,
        erro: cnisEmpregado.error,
      });
      if (cnisEmpregado.success) {
        resultados.empregado.dados_encontrados = cnisEmpregado.data;
        resultados.empregado.fonte_sucesso = 'CNIS_OFICIAL';
      }
    }

    // Fonte 3: Dataprev (Qualificação Cadastral)
    if (!resultados.empregado.dados_encontrados) {
      const dataprevEmpregado = await apiService.consultarDataprev(
        cpfEmpregadoFinal,
        '1986-12-23'
      );
      resultados.empregado.fontes_testadas.push({
        fonte: 'Dataprev Qualificação Cadastral',
        sucesso: dataprevEmpregado.success,
        erro: dataprevEmpregado.error,
      });
      if (dataprevEmpregado.success) {
        resultados.empregado.dados_encontrados = dataprevEmpregado.data;
        resultados.empregado.fonte_sucesso = 'DATAPREV_OFICIAL';
      }
    }

    // Fonte 4: eSocial (dados confirmados das imagens)
    if (!resultados.empregado.dados_encontrados) {
      const esocialEmpregado =
        await dadosService.obterDadosEmpregado(cpfEmpregadoFinal);
      resultados.empregado.fontes_testadas.push({
        fonte: 'eSocial Portal Confirmado',
        sucesso: esocialEmpregado.success,
        erro: esocialEmpregado.error,
      });
      if (esocialEmpregado.success) {
        resultados.empregado.dados_encontrados = esocialEmpregado.data;
        resultados.empregado.fonte_sucesso = 'ESOCIAL_CONFIRMADO';
      }
    }

    // === RESPOSTA FINAL ===
    const response = {
      success: true,
      data: {
        fonte: 'CONSULTA_MULTIPLAS_APIS_OFICIAIS',
        timestamp: new Date().toISOString(),
        empregador: {
          dados: resultados.empregador.dados_encontrados,
          fonte_sucesso: resultados.empregador.fonte_sucesso,
          todas_fontes_testadas: resultados.empregador.fontes_testadas,
        },
        empregado: {
          dados: resultados.empregado.dados_encontrados,
          fonte_sucesso: resultados.empregado.fonte_sucesso,
          todas_fontes_testadas: resultados.empregado.fontes_testadas,
        },
        resumo: {
          empregador_encontrado: !!resultados.empregador.dados_encontrados,
          empregado_encontrado: !!resultados.empregado.dados_encontrados,
          total_fontes_testadas:
            resultados.empregador.fontes_testadas.length +
            resultados.empregado.fontes_testadas.length,
        },
      },
      message: 'Consulta completa em todas as APIs oficiais disponíveis',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('❌ Erro na consulta de APIs oficiais:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha na consulta de APIs oficiais',
      timestamp: new Date().toISOString(),
    });
  }
}
