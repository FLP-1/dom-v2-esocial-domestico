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
    const { environment = 'producao' } = req.body;

    // Configuração para consulta oficial
    const config = {
      environment: environment as 'producao' | 'homologacao',
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
      ambiente: environment,
      cpf: '59876913700',
      endpoints_oficiais: {
        producao: {
          consulta:
            'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          wsdl: 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
        },
        homologacao: {
          consulta:
            'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          wsdl: 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc?wsdl',
        },
      },
      certificado: {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        serialNumber: certInfo.serialNumber,
        isValid:
          new Date() >= certInfo.validFrom && new Date() <= certInfo.validTo,
        daysUntilExpiry: Math.ceil(
          (certInfo.validTo.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      consultas: [] as any[],
    };

    // CONSULTA 1: Empregador usando endpoint oficial
    console.log('🔍 Iniciando consulta oficial do empregador...');
    try {
      const empregadorResult = await esocialSoap.consultarEmpregador();

      if (empregadorResult.success) {
        resultado.consultas.push({
          tipo: 'consulta_empregador_oficial',
          status: 'SUCESSO',
          resultado: 'CPF CADASTRADO NO ESOCIAL OFICIAL',
          dados_encontrados: empregadorResult.data,
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          message: 'Empregador encontrado com sucesso no eSocial oficial!',
        });
      } else {
        // Analisar o tipo de erro
        const statusCode = empregadorResult.error?.includes('404')
          ? '404'
          : empregadorResult.error?.includes('403')
            ? '403'
            : empregadorResult.error?.includes('500')
              ? '500'
              : 'OUTRO';

        if (statusCode === '404') {
          resultado.consultas.push({
            tipo: 'consulta_empregador_oficial',
            status: 'CPF_NAO_ENCONTRADO',
            resultado: 'CPF NÃO ESTÁ CADASTRADO NO ESOCIAL OFICIAL',
            error: empregadorResult.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
            message: 'CPF não encontrado na base oficial do eSocial',
            recomendacao:
              'Verificar se o S-1000 foi enviado e processado corretamente',
          });
        } else if (statusCode === '403') {
          resultado.consultas.push({
            tipo: 'consulta_empregador_oficial',
            status: 'ACESSO_NEGADO',
            resultado: 'ENDPOINT PROTEGIDO - PODE ESTAR CADASTRADO',
            error: empregadorResult.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
            message:
              'Acesso negado - pode indicar que o CPF existe mas precisa de credenciais específicas',
            recomendacao:
              'Verificar se o certificado tem permissão para consultar este CPF',
          });
        } else if (statusCode === '500') {
          resultado.consultas.push({
            tipo: 'consulta_empregador_oficial',
            status: 'ERRO_SERVIDOR',
            resultado: 'ERRO INTERNO DO SERVIDOR ESOCIAL',
            error: empregadorResult.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
            message: 'Erro interno do servidor eSocial',
            recomendacao: 'Tentar novamente em alguns minutos',
          });
        } else {
          resultado.consultas.push({
            tipo: 'consulta_empregador_oficial',
            status: 'ERRO_DESCONHECIDO',
            resultado: 'ERRO NA CONSULTA OFICIAL',
            error: empregadorResult.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
            message: 'Erro inesperado na consulta oficial',
            recomendacao: 'Verificar logs e configurações',
          });
        }
      }
    } catch (error) {
      resultado.consultas.push({
        tipo: 'consulta_empregador_oficial',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        endpoint_usado:
          environment === 'producao'
            ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
            : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
        message: 'Erro interno do sistema',
        recomendacao: 'Verificar conectividade e certificado',
      });
    }

    // CONSULTA 2: Empregados usando endpoint oficial
    console.log('👥 Iniciando consulta oficial de empregados...');
    try {
      const empregadosResult = await esocialSoap.consultarEmpregados();

      if (
        empregadosResult.success &&
        empregadosResult.data &&
        empregadosResult.data.length > 0
      ) {
        resultado.consultas.push({
          tipo: 'consulta_empregados_oficial',
          status: 'SUCESSO',
          resultado: `${empregadosResult.data.length} EMPREGADO(S) ENCONTRADO(S)`,
          empregados: empregadosResult.data,
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          message: 'Empregados encontrados com sucesso no eSocial oficial!',
        });
      } else {
        resultado.consultas.push({
          tipo: 'consulta_empregados_oficial',
          status: 'SEM_EMPREGADOS',
          resultado: 'NENHUM EMPREGADO ENCONTRADO',
          error: empregadosResult.error,
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          message: 'Nenhum empregado cadastrado ou erro na consulta oficial',
          recomendacao:
            'Verificar se os eventos S-2200 foram enviados e processados',
        });
      }
    } catch (error) {
      resultado.consultas.push({
        tipo: 'consulta_empregados_oficial',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        endpoint_usado:
          environment === 'producao'
            ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
            : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
        message: 'Erro interno do sistema',
        recomendacao: 'Verificar conectividade e certificado',
      });
    }

    // Análise final
    const sucessos = resultado.consultas.filter(
      c => c.status === 'SUCESSO'
    ).length;
    const total = resultado.consultas.length;

    const conclusao = {
      cpf_cadastrado_oficial: sucessos > 0,
      tem_empregados_oficial: resultado.consultas.some(
        c => c.tipo === 'consulta_empregados_oficial' && c.status === 'SUCESSO'
      ),
      taxa_sucesso: `${Math.round((sucessos / total) * 100)}%`,
      ambiente_usado: environment,
      endpoints_oficiais_utilizados: true,
      recomendacao:
        sucessos > 0
          ? 'CPF está funcionando no eSocial oficial!'
          : 'CPF pode não estar cadastrado ou precisa de configurações adicionais',
      status_geral:
        sucessos > 0 ? 'FUNCIONANDO_OFICIAL' : 'VERIFICAR_CADASTRO_OFICIAL',
      proximos_passos:
        sucessos > 0
          ? [
              'Sistema funcionando corretamente',
              'Pode prosseguir com operações normais',
            ]
          : [
              'Verificar se S-1000 foi enviado',
              'Verificar se S-1000 foi processado',
              'Verificar permissões do certificado',
            ],
    };

    return res.status(200).json({
      success: true,
      data: resultado,
      conclusao,
    });
  } catch (error) {
    console.error('Erro na consulta oficial do eSocial:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
