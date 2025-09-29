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
    const { cpf = '59876913700', ambiente = 'producao' } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Carregar certificado
    const fs = require('fs');
    const path = require('path');
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    if (fs.existsSync(certPath)) {
      const certBuffer = fs.readFileSync(certPath);
      await soapService.loadCertificate(certBuffer, '456587');
    }

    // 1. CONSULTAR CADASTRO REAL DO EMPREGADOR

    const consultaEmpregador = await soapService.consultarEmpregador();

    // 2. TESTAR CONECTIVIDADE COM ENDPOINTS REAIS

    const testeConectividade = await soapService.testarConexao(ambiente);

    // 3. VERIFICAR SE CPF ESTÁ CADASTRADO NO eSocial

    let statusCadastro = 'NÃO CADASTRADO';
    let dadosReais = null;

    if (consultaEmpregador.success) {
      statusCadastro = 'CADASTRADO';
      dadosReais = consultaEmpregador.data;
    } else if (consultaEmpregador.error?.includes('404')) {
      statusCadastro = 'NÃO CADASTRADO - CPF não encontrado';
    } else if (consultaEmpregador.error?.includes('403')) {
      statusCadastro = 'CADASTRADO - Sem permissão de consulta';
    }

    const resultado = {
      cpf: cpf,
      ambiente: ambiente,
      status_cadastro: statusCadastro,
      dados_empregador: dadosReais,
      conectividade: {
        certificado_carregado: soapService.isCertificateLoaded(),
        teste_conexao: testeConectividade,
        endpoints_acessiveis: testeConectividade.success,
      },
      recomendacoes: {
        cadastrar_via_portal: statusCadastro.includes('NÃO CADASTRADO'),
        verificar_permissoes: statusCadastro.includes('Sem permissão'),
        usar_app_esocial: 'CPF já utiliza o app eSocial Doméstico',
        proximos_passos: statusCadastro.includes('NÃO CADASTRADO')
          ? [
              'Acessar portal eSocial',
              'Fazer login com certificado',
              'Cadastrar CPF como empregador',
            ]
          : [
              'Verificar permissões do certificado',
              'Testar envio de eventos',
              'Consultar trabalhadores cadastrados',
            ],
      },
      timestamp: new Date().toISOString(),
    };

    return res.status(200).json({
      success: true,
      data: resultado,
      message: 'Consulta do portal eSocial realizada',
    });
  } catch (error) {
    console.error('❌ Erro na consulta do portal eSocial:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro na consulta do portal eSocial',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
