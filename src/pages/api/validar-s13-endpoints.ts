import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('🔍 === VALIDANDO ENDPOINTS S-1.3 ===');

    // Configurar serviço eSocial
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
    };

    const soapService = new ESocialSoapReal(config);

    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado digital não encontrado',
      });
    }

    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    console.log('🔐 Certificado carregado com sucesso');

    // === TESTE 1: VERIFICAR URLS CONFIGURADAS ===
    const urlsConfiguradas = (soapService as any).config;
    console.log('📋 URLs configuradas:', urlsConfiguradas);

    // === TESTE 2: TESTAR ENDPOINTS INDIVIDUALMENTE ===
    const resultados = [];

    // Teste 1: Consultar Lote (protocolo conhecido)
    console.log('\n🧪 Testando ConsultarLoteEventos...');
    try {
      const resultado1 =
        await soapService.consultarLotePorProtocolo('1.2.20250917.46410');
      resultados.push({
        teste: 'ConsultarLoteEventos',
        sucesso: resultado1.success,
        erro: resultado1.error || null,
        dados: resultado1.success ? 'Dados recebidos' : null,
      });
    } catch (error) {
      resultados.push({
        teste: 'ConsultarLoteEventos',
        sucesso: false,
        erro: error.message,
      });
    }

    // Teste 2: Consultar por CPF Trabalhador
    console.log('\n🧪 Testando ConsultarPorCpfTrabalhador...');
    try {
      const resultado2 =
        await soapService.consultarPorCpfTrabalhador('38645446880');
      resultados.push({
        teste: 'ConsultarPorCpfTrabalhador',
        sucesso: resultado2.success,
        erro: resultado2.error || null,
        dados: resultado2.success ? 'Dados recebidos' : null,
      });
    } catch (error) {
      resultados.push({
        teste: 'ConsultarPorCpfTrabalhador',
        sucesso: false,
        erro: error.message,
      });
    }

    // Teste 3: Consultar Eventos por Filtro
    console.log('\n🧪 Testando ConsultarEventosPorFiltro...');
    try {
      const resultado3 = await soapService.consultarEventosPorFiltro();
      resultados.push({
        teste: 'ConsultarEventosPorFiltro',
        sucesso: resultado3.success,
        erro: resultado3.error || null,
        dados: resultado3.success ? 'Dados recebidos' : null,
      });
    } catch (error) {
      resultados.push({
        teste: 'ConsultarEventosPorFiltro',
        sucesso: false,
        erro: error.message,
      });
    }

    // === COMPILAR RELATÓRIO ===
    const relatorio = {
      success: true,
      data: {
        versao_testada: 'S-1.3',
        namespaces_atualizados: 'v1_3_0',
        urls_configuradas: {
          consultaEmpregador:
            urlsConfiguradas?.urls?.consultaEmpregador || 'N/A',
          consultaTrabalhador:
            urlsConfiguradas?.urls?.consultaTrabalhador || 'N/A',
          consultaEventos: urlsConfiguradas?.urls?.consultaEventos || 'N/A',
        },
        testes_realizados: resultados,
        resumo: {
          total_testes: resultados.length,
          sucessos: resultados.filter(r => r.sucesso).length,
          falhas: resultados.filter(r => !r.sucesso).length,
          principais_erros: [
            ...new Set(resultados.map(r => r.erro).filter(Boolean)),
          ],
        },
        diagnostico: {
          s13_funcionando: resultados.some(r => r.sucesso),
          erro_principal: resultados.length > 0 ? resultados[0].erro : null,
          recomendacao: resultados.some(r => r.sucesso)
            ? 'Alguns endpoints S-1.3 funcionam - investigar específicos'
            : 'Nenhum endpoint S-1.3 funciona - verificar configuração',
        },
      },
      message: 'Validação de endpoints S-1.3 concluída',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro na validação:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha na validação de endpoints S-1.3',
    });
  }
}
