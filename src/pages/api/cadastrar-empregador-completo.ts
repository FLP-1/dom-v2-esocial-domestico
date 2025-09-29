import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import {
  EMPREGADOR_COMPLETO,
  validateEmpregadorData,
} from '../../data/empregador-completo';
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
    const { environment = 'homologacao' } = req.body;

    // Validar dados do empregador
    const validation = validateEmpregadorData();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dados do empregador inválidos',
        details: validation.errors,
      });
    }

    // Configuração para cadastramento completo
    const config = {
      environment: environment as 'producao' | 'homologacao',
      companyId: EMPREGADOR_COMPLETO.ideEmpregador.nrInsc,
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
      cpf: EMPREGADOR_COMPLETO.ideEmpregador.nrInsc,
      dados_empregador: EMPREGADOR_COMPLETO,
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
      eventos: [] as any[],
    };

    // ETAPA 1: Enviar S-1000 (Informações do Empregador)
    console.log('📝 Enviando S-1000 - Informações do Empregador...');
    try {
      const s1000Result = await esocialSoap.enviarS1000();

      if (s1000Result.success) {
        resultado.eventos.push({
          evento: 'S-1000',
          status: 'SUCESSO',
          resultado: 'EVENTO S-1000 ENVIADO COM SUCESSO',
          protocolo: s1000Result.data?.protocolo || 'PROTOCOLO_GERADO',
          message: 'Empregador cadastrado com sucesso no eSocial!',
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
        });
      } else {
        // Analisar o tipo de erro
        const statusCode = s1000Result.error?.includes('404')
          ? '404'
          : s1000Result.error?.includes('403')
            ? '403'
            : s1000Result.error?.includes('500')
              ? '500'
              : 'OUTRO';

        if (statusCode === '403') {
          resultado.eventos.push({
            evento: 'S-1000',
            status: 'ENDPOINT_PROTEGIDO',
            resultado: 'ENDPOINT PROTEGIDO - PODE PRECISAR DE HABILITAÇÃO',
            error: s1000Result.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
            message:
              'Endpoint protegido - pode indicar que precisa de habilitação para envio',
            recomendacao:
              'Verificar se o certificado tem permissão para envio de eventos',
          });
        } else if (statusCode === '404') {
          resultado.eventos.push({
            evento: 'S-1000',
            status: 'ENDPOINT_NAO_ENCONTRADO',
            resultado: 'ENDPOINT NÃO ENCONTRADO',
            error: s1000Result.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
            message: 'Endpoint não encontrado',
            recomendacao: 'Verificar se o endpoint está correto e acessível',
          });
        } else {
          resultado.eventos.push({
            evento: 'S-1000',
            status: 'ERRO_ENVIO',
            resultado: 'ERRO NO ENVIO DO S-1000',
            error: s1000Result.error,
            endpoint_usado:
              environment === 'producao'
                ? 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc'
                : 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
            message: 'Erro no envio do evento S-1000',
            recomendacao: 'Verificar dados do empregador e configurações',
          });
        }
      }
    } catch (error) {
      resultado.eventos.push({
        evento: 'S-1000',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        endpoint_usado:
          environment === 'producao'
            ? 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc'
            : 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
        message: 'Erro interno do sistema',
        recomendacao: 'Verificar conectividade e certificado',
      });
    }

    // ETAPA 2: Verificar se o cadastro foi processado
    console.log('🔍 Verificando se o cadastro foi processado...');
    try {
      const consultaResult = await esocialSoap.consultarEmpregador();

      if (consultaResult.success) {
        resultado.eventos.push({
          evento: 'CONSULTA_VERIFICACAO',
          status: 'SUCESSO',
          resultado: 'CADASTRO CONFIRMADO NO ESOCIAL',
          dados_encontrados: consultaResult.data,
          message: 'Empregador encontrado na base do eSocial!',
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
        });
      } else {
        resultado.eventos.push({
          evento: 'CONSULTA_VERIFICACAO',
          status: 'AINDA_NAO_PROCESSADO',
          resultado: 'CADASTRO AINDA NÃO FOI PROCESSADO',
          error: consultaResult.error,
          message: 'Cadastro ainda não foi processado pelo eSocial',
          endpoint_usado:
            environment === 'producao'
              ? 'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc'
              : 'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          recomendacao: 'Aguardar processamento (24-48h) e tentar novamente',
        });
      }
    } catch (error) {
      resultado.eventos.push({
        evento: 'CONSULTA_VERIFICACAO',
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NA VERIFICAÇÃO',
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
    const sucessos = resultado.eventos.filter(
      e => e.status === 'SUCESSO'
    ).length;
    const total = resultado.eventos.length;

    const conclusao = {
      cadastramento_realizado: sucessos > 0,
      s1000_enviado: resultado.eventos.some(
        e => e.evento === 'S-1000' && e.status === 'SUCESSO'
      ),
      cadastro_confirmado: resultado.eventos.some(
        e => e.evento === 'CONSULTA_VERIFICACAO' && e.status === 'SUCESSO'
      ),
      taxa_sucesso: `${Math.round((sucessos / total) * 100)}%`,
      ambiente_usado: environment,
      cpf_cadastrado: EMPREGADOR_COMPLETO.ideEmpregador.nrInsc,
      recomendacao:
        sucessos > 0
          ? 'Cadastramento realizado com sucesso!'
          : 'Verificar configurações e tentar novamente',
      status_geral:
        sucessos > 0 ? 'CADASTRAMENTO_REALIZADO' : 'VERIFICAR_CONFIGURACOES',
      proximos_passos:
        sucessos > 0
          ? [
              'Aguardar processamento (24-48h)',
              'Verificar cadastro novamente',
              'Cadastrar empregados (S-2200)',
            ]
          : [
              'Verificar permissões do certificado',
              'Verificar dados do empregador',
              'Tentar novamente',
            ],
    };

    return res.status(200).json({
      success: true,
      data: resultado,
      conclusao,
    });
  } catch (error) {
    console.error('Erro no cadastramento completo do empregador:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
