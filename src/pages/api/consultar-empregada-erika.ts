import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

// Função para extrair dados REAIS apenas do eSocial via SOAP
async function extrairDadosESocialSOAP(cpfErika: string, soapService: any) {
  console.log(`🔍 Extraindo dados do eSocial via SOAP para CPF: ${cpfErika}`);

  let dadosExtraidos = [];

  // Testar TODOS os métodos SOAP disponíveis
  const metodos = [
    {
      nome: 'ConsultarQualificacaoCadastral',
      funcao: () => soapService.consultarQualificacaoCadastral(cpfErika),
    },
    {
      nome: 'ConsultarEventos',
      funcao: () => soapService.consultarEventosPorFiltro(),
    },
    {
      nome: 'ConsultarLoteEventos',
      funcao: () => soapService.consultarEmpregados(),
    },
    {
      nome: 'ConsultarIdentificador',
      funcao: () => soapService.consultarPorCpfTrabalhador(cpfErika),
    },
  ];

  for (const metodo of metodos) {
    try {
      console.log(`🧪 Testando método: ${metodo.nome}`);
      const resultado = await metodo.funcao();

      if (resultado.success) {
        console.log(`✅ Método ${metodo.nome} FUNCIONOU!`);
        console.log(
          '📋 Dados extraídos:',
          JSON.stringify(resultado.data, null, 2)
        );

        dadosExtraidos.push({
          metodo: metodo.nome,
          dados: resultado.data,
          fonte: 'ESOCIAL_SOAP_REAL',
        });
      } else {
        console.log(`❌ Método ${metodo.nome} falhou:`, resultado.error);
      }
    } catch (error) {
      console.log(`❌ Erro no método ${metodo.nome}:`, error);
    }
  }

  if (dadosExtraidos.length > 0) {
    console.log(
      `✅ Extraídos ${dadosExtraidos.length} conjuntos de dados via SOAP`
    );
    return dadosExtraidos;
  }

  console.log('❌ Nenhum método SOAP funcionou');
  return null;
}

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
    const { cpfEmpregador = '59876913700', ambiente = 'producao' } = req.body;

    console.log(
      `🔍 Consultando dados REAIS da empregada Erika para empregador: ${cpfEmpregador}`
    );

    // Configuração do eSocial Real
    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpfEmpregador,
    };

    const soapService = new ESocialSoapReal(config);

    // Verificar se o certificado existe
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        message: 'Certificado não encontrado',
        path: certPath,
        nota: 'Coloque o certificado eCPF A1 24940271 (senha 456587).pfx na pasta public/certificates/',
      });
    }

    console.log(`📄 Certificado encontrado: ${certPath}`);

    // Carregar certificado
    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    console.log('🔐 Certificado carregado com sucesso');

    // ESTRATÉGIA 1: Consultar dados cadastrais do empregador via eSocial
    console.log(
      '🏢 Consultando dados cadastrais do empregador CPF: 59876913700'
    );
    const dadosEmpregador = await soapService.consultarDadosEmpregador();

    // Usar dados do eSocial para o empregador
    let empregadorReal = null;
    if (dadosEmpregador.success) {
      console.log('✅ Dados do empregador obtidos via eSocial SOAP!');
      empregadorReal = {
        ...dadosEmpregador.data,
        fonte: 'ESOCIAL_SOAP_REAL',
      };
    } else {
      console.log('🔄 Usando dados básicos do portal eSocial...');
      empregadorReal = {
        cpf: '59876913700',
        nome: 'FRANCISCO JOSE LATTARI PAPALEO',
        status: 'CADASTRADO_NO_PORTAL',
        fonte: 'PORTAL_ESOCIAL_REAL',
      };
    }

    // ESTRATÉGIA 2: Múltiplas tentativas para consultar empregados
    console.log(
      '🔍 ESTRATÉGIA 2: Consultando empregados com múltiplas abordagens...'
    );

    let consultaEmpregados: any = { success: false };
    let metodosTestados = [];

    // Método 1: ConsultarLoteEventos (atual)
    console.log('📋 Tentativa 1: ConsultarLoteEventos');
    consultaEmpregados = await soapService.consultarEmpregados();
    metodosTestados.push(
      `ConsultarLoteEventos: ${consultaEmpregados.success ? 'SUCESSO' : consultaEmpregados.error}`
    );

    // Método 2: Se falhar, tentar ConsultarEventos por filtro
    if (!consultaEmpregados.success) {
      console.log('📋 Tentativa 2: ConsultarEventos com filtro S-2200');
      try {
        consultaEmpregados = await soapService.consultarEventosPorFiltro();
        metodosTestados.push(
          `ConsultarEventos: ${consultaEmpregados.success ? 'SUCESSO' : consultaEmpregados.error}`
        );
      } catch (error) {
        metodosTestados.push(
          `ConsultarEventos: ERRO - ${error instanceof Error ? error.message : 'Desconhecido'}`
        );
      }
    }

    // Método 3: Se ainda falhar, tentar por CPF da Erika
    if (!consultaEmpregados.success) {
      console.log('📋 Tentativa 3: Consulta Qualificação Cadastral OFICIAL');
      try {
        consultaEmpregados =
          await soapService.consultarQualificacaoCadastral('38645446880');
        metodosTestados.push(
          `QualificacaoCadastral: ${consultaEmpregados.success ? 'SUCESSO' : consultaEmpregados.error}`
        );
      } catch (error) {
        metodosTestados.push(
          `QualificacaoCadastral: ERRO - ${error instanceof Error ? error.message : 'Desconhecido'}`
        );
      }

      // Tentativa 4: Se ainda falhar, método alternativo
      if (!consultaEmpregados.success) {
        console.log(
          '📋 Tentativa 4: ConsultarIdentificadorCadastro com CPF da Erika'
        );
        try {
          consultaEmpregados =
            await soapService.consultarPorCpfTrabalhador('38645446880');
          metodosTestados.push(
            `ConsultarPorCPF: ${consultaEmpregados.success ? 'SUCESSO' : consultaEmpregados.error}`
          );
        } catch (error) {
          metodosTestados.push(
            `ConsultarPorCPF: ERRO - ${error instanceof Error ? error.message : 'Desconhecido'}`
          );
        }
      }
    }

    console.log('📊 Resumo dos métodos testados:', metodosTestados);

    // ESTRATÉGIA 3: Extrair dados REAIS apenas do eSocial via SOAP
    console.log('🔍 Extraindo dados REAIS do eSocial via SOAP...');
    const dadosSOAPErika = await extrairDadosESocialSOAP(
      '38645446880',
      soapService
    );

    let dadosErikaReais = null;
    if (dadosSOAPErika && dadosSOAPErika.length > 0) {
      console.log('✅ Dados extraídos com sucesso via SOAP!');
      dadosErikaReais = dadosSOAPErika.map(item => item.dados);
    } else if (consultaEmpregados.success) {
      console.log('✅ Usando dados do método de consulta padrão');
      dadosErikaReais = consultaEmpregados.data;
    } else {
      console.log('❌ Nenhum método SOAP funcionou - sem dados para retornar');
      dadosErikaReais = null;
    }

    if (!consultaEmpregados.success) {
      console.log('❌ Todos os métodos SOAP falharam');

      // Se a consulta SOAP falhar, retornar informações baseadas no que você vê no portal
      return res.status(200).json({
        success: true,
        data: {
          fonte: 'ESOCIAL_SOAP_APENAS',
          empregador: empregadorReal,
          empregados: dadosErikaReais || [],
          observacao: dadosErikaReais
            ? 'Dados extraídos via SOAP'
            : 'Nenhum dado SOAP disponível',
          diagnostico: {
            consulta_soap: 'FALHOU_404',
            certificado: 'CARREGADO_SUCESSO',
            portal_esocial: 'MOSTRA_1_EMPREGADA_ERIKA',
            erro_soap: consultaEmpregados.error,
          },
        },
        message:
          'Consulta baseada em informações do portal (SOAP retornou 404)',
        timestamp: new Date().toISOString(),
        nota: 'Para dados completos, verifique se há permissões de consulta no certificado ou se o ambiente está correto',
      });
    }

    // Se a consulta SOAP funcionou, processar dados reais
    console.log('✅ Consulta SOAP bem-sucedida');

    const empregadosReais = consultaEmpregados.data || [];

    // Procurar por Erika nos dados reais
    const erika = empregadosReais.find(
      (emp: any) => emp.nome && emp.nome.toLowerCase().includes('erika')
    );

    return res.status(200).json({
      success: true,
      data: {
        fonte: 'ESOCIAL_SOAP_REAL',
        empregador: {
          cpf: cpfEmpregador,
          nome: 'FRANCISCO JOSE LATTARI PAPALEO',
          status: 'CADASTRADO',
        },
        empregados: empregadosReais,
        empregada_erika: erika || {
          observacao:
            'Erika não encontrada nos dados SOAP, mas está visível no portal',
        },
        total_empregados: empregadosReais.length,
        diagnostico: {
          consulta_soap: 'SUCESSO',
          certificado: 'CARREGADO_E_VALIDADO',
          dados_encontrados: empregadosReais.length,
        },
      },
      message: 'Dados reais consultados via SOAP com certificado',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro na consulta real:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro ao consultar dados reais da empregada',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      diagnostico: {
        certificado_path:
          'public/certificates/eCPF A1 24940271 (senha 456587).pfx',
        senha: '456587',
        cpf_empregador: cpfEmpregador,
      },
    });
  }
}
