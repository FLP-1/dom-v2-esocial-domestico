import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
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
    // Configuração específica para CPF cadastrado
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
      certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
      certificatePassword: '456587',
    };

    const esocialSoap = new ESocialSoapReal(config);

    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      config.certificatePath
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado não encontrado',
        path: certPath,
      });
    }

    const certificateBuffer = fs.readFileSync(certPath);
    const certInfo = await esocialSoap.loadCertificate(
      certificateBuffer,
      config.certificatePassword
    );

    const resultado = {
      timestamp: new Date().toISOString(),
      cpf: '59876913700',
      status_certificado: 'VÁLIDO',
      certificate: {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        daysUntilExpiry: Math.ceil(
          (certInfo.validTo.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      testes: [],
    };

    // TESTE 1: Consultar dados do empregador cadastrado
    console.log('🔍 Iniciando consulta do empregador...');
    try {
      const empregadorResult = await esocialSoap.consultarEmpregador();

      if (empregadorResult.success) {
        resultado.testes.push({
          teste: 'consulta_empregador',
          status: 'SUCESSO',
          resultado: 'CPF CADASTRADO NO ESOCIAL',
          dados_encontrados: empregadorResult.data,
          message: 'Empregador encontrado com sucesso!',
        });
      } else {
        // Analisar o tipo de erro
        const statusCode = empregadorResult.error?.includes('404')
          ? '404'
          : empregadorResult.error?.includes('403')
            ? '403'
            : 'OUTRO';

        if (statusCode === '404') {
          resultado.testes.push({
            teste: 'consulta_empregador',
            status: 'CPF_NAO_ENCONTRADO',
            resultado: 'CPF NÃO ESTÁ CADASTRADO NO ESOCIAL',
            error: empregadorResult.error,
            message: 'CPF não encontrado na base do eSocial',
          });
        } else if (statusCode === '403') {
          resultado.testes.push({
            teste: 'consulta_empregador',
            status: 'ACESSO_NEGADO',
            resultado: 'ENDPOINT PROTEGIDO - PODE ESTAR CADASTRADO',
            error: empregadorResult.error,
            message:
              'Acesso negado - pode indicar que o CPF existe mas precisa de credenciais específicas',
          });
        } else {
          resultado.testes.push({
            teste: 'consulta_empregador',
            status: 'ERRO',
            resultado: 'ERRO NA CONSULTA',
            error: empregadorResult.error,
            message: 'Erro inesperado na consulta',
          });
        }
      }
    } catch (error) {
      resultado.testes.push({
        teste: 'consulta_empregador',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro interno do sistema',
      });
    }

    // TESTE 2: Tentar consultar empregados
    console.log('👥 Iniciando consulta de empregados...');
    try {
      const empregadosResult = await esocialSoap.consultarEmpregados();

      if (
        empregadosResult.success &&
        empregadosResult.data &&
        empregadosResult.data.length > 0
      ) {
        resultado.testes.push({
          teste: 'consulta_empregados',
          status: 'SUCESSO',
          resultado: `${empregadosResult.data.length} EMPREGADO(S) ENCONTRADO(S)`,
          empregados: empregadosResult.data,
          message: 'Empregados encontrados com sucesso!',
        });
      } else {
        resultado.testes.push({
          teste: 'consulta_empregados',
          status: 'SEM_EMPREGADOS',
          resultado: 'NENHUM EMPREGADO ENCONTRADO',
          error: empregadosResult.error,
          message: 'Nenhum empregado cadastrado ou erro na consulta',
        });
      }
    } catch (error) {
      resultado.testes.push({
        teste: 'consulta_empregados',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: 'Erro interno do sistema',
      });
    }

    // Análise final
    const sucessos = resultado.testes.filter(
      t => t.status === 'SUCESSO'
    ).length;
    const total = resultado.testes.length;

    const conclusao = {
      cpf_cadastrado: sucessos > 0,
      tem_empregados: resultado.testes.some(
        t => t.teste === 'consulta_empregados' && t.status === 'SUCESSO'
      ),
      taxa_sucesso: `${Math.round((sucessos / total) * 100)}%`,
      recomendacao:
        sucessos > 0
          ? 'CPF está funcionando no eSocial!'
          : 'CPF pode não estar cadastrado ou precisa de configurações adicionais',
      status_geral: sucessos > 0 ? 'FUNCIONANDO' : 'VERIFICAR_CADASTRO',
    };

    return res.status(200).json({
      success: true,
      data: resultado,
      conclusao,
    });
  } catch (error) {
    console.error('Erro no teste do CPF cadastrado:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
