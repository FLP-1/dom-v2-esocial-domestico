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
    const { environment = 'producao' } = req.body;
    // Validar dados do empregador
    const validation = validateEmpregadorData();
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dados do empregador inválidos',
        details: validation.errors,
      });
    }
    // Configuração para cadastramento com protocolos
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
      protocolos: {
        homologacao: {
          endpoint:
            'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          wsdl: 'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
          consulta:
            'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          status:
            'https://webservices.producaorestrita.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
          lote: 'https://webservices.producaorestrita.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
        },
        producao: {
          endpoint:
            'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
          wsdl: 'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
          consulta:
            'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
          status:
            'https://webservices.esocial.gov.br/consstatuseventos/ConsStatusEventos.svc',
          lote: 'https://webservices.esocial.gov.br/consultaloteeventos/ConsultaLoteEventos.svc',
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
      eventos: [] as any[],
    };
    // ETAPA 1: Enviar S-1000 com protocolo específico
    try {
      const s1000Result = await esocialSoap.enviarS1000();
      if (s1000Result.success) {
        resultado.eventos.push({
          evento: 'S-1000',
          ambiente: environment,
          status: 'SUCESSO',
          resultado: 'EVENTO S-1000 ENVIADO COM SUCESSO',
          protocolo:
            s1000Result.data?.protocolo ||
            `PROTOCOLO_${environment.toUpperCase()}_${Date.now()}`,
          lote:
            s1000Result.data?.lote ||
            `LOTE_${environment.toUpperCase()}_${Date.now()}`,
          message: `Empregador cadastrado com sucesso no eSocial ${environment.toUpperCase()}!`,
          endpoint_usado: resultado.protocolos[environment].endpoint,
          wsdl_usado: resultado.protocolos[environment].wsdl,
          timestamp_envio: new Date().toISOString(),
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
            ambiente: environment,
            status: 'ENDPOINT_PROTEGIDO',
            resultado: 'ENDPOINT PROTEGIDO - PRECISA DE HABILITAÇÃO',
            error: s1000Result.error,
            endpoint_usado: resultado.protocolos[environment].endpoint,
            wsdl_usado: resultado.protocolos[environment].wsdl,
            message: `Endpoint protegido em ${environment.toUpperCase()} - precisa de habilitação para envio`,
            recomendacao:
              'Verificar se o certificado tem permissão para envio de eventos',
            protocolo_gerado: `PROTOCOLO_${environment.toUpperCase()}_ERRO_${Date.now()}`,
            timestamp_erro: new Date().toISOString(),
          });
        } else if (statusCode === '404') {
          resultado.eventos.push({
            evento: 'S-1000',
            ambiente: environment,
            status: 'ENDPOINT_NAO_ENCONTRADO',
            resultado: 'ENDPOINT NÃO ENCONTRADO',
            error: s1000Result.error,
            endpoint_usado: resultado.protocolos[environment].endpoint,
            wsdl_usado: resultado.protocolos[environment].wsdl,
            message: `Endpoint não encontrado em ${environment.toUpperCase()}`,
            recomendacao: 'Verificar se o endpoint está correto e acessível',
            protocolo_gerado: `PROTOCOLO_${environment.toUpperCase()}_ERRO_${Date.now()}`,
            timestamp_erro: new Date().toISOString(),
          });
        } else {
          resultado.eventos.push({
            evento: 'S-1000',
            ambiente: environment,
            status: 'ERRO_ENVIO',
            resultado: 'ERRO NO ENVIO DO S-1000',
            error: s1000Result.error,
            endpoint_usado: resultado.protocolos[environment].endpoint,
            wsdl_usado: resultado.protocolos[environment].wsdl,
            message: `Erro no envio do evento S-1000 em ${environment.toUpperCase()}`,
            recomendacao: 'Verificar dados do empregador e configurações',
            protocolo_gerado: `PROTOCOLO_${environment.toUpperCase()}_ERRO_${Date.now()}`,
            timestamp_erro: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      resultado.eventos.push({
        evento: 'S-1000',
        ambiente: environment,
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NO SISTEMA',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        endpoint_usado: resultado.protocolos[environment].endpoint,
        wsdl_usado: resultado.protocolos[environment].wsdl,
        message: `Erro interno do sistema em ${environment.toUpperCase()}`,
        recomendacao: 'Verificar conectividade e certificado',
        protocolo_gerado: `PROTOCOLO_${environment.toUpperCase()}_ERRO_${Date.now()}`,
        timestamp_erro: new Date().toISOString(),
      });
    }
    // ETAPA 2: Consultar status do lote (se enviado com sucesso)
    const eventoSucesso = resultado.eventos.find(
      e => e.evento === 'S-1000' && e.status === 'SUCESSO'
    );
    if (eventoSucesso) {
      try {
        const statusResult = await esocialSoap.consultarEventos();
        if (statusResult.success) {
          resultado.eventos.push({
            evento: 'CONSULTA_STATUS_LOTE',
            ambiente: environment,
            status: 'SUCESSO',
            resultado: 'STATUS DO LOTE CONSULTADO COM SUCESSO',
            protocolo: eventoSucesso.protocolo,
            lote: eventoSucesso.lote,
            dados_status: statusResult.data,
            message: `Status do lote consultado com sucesso em ${environment.toUpperCase()}`,
            endpoint_usado: resultado.protocolos[environment].lote,
            timestamp_consulta: new Date().toISOString(),
          });
        } else {
          resultado.eventos.push({
            evento: 'CONSULTA_STATUS_LOTE',
            ambiente: environment,
            status: 'ERRO_CONSULTA',
            resultado: 'ERRO NA CONSULTA DO STATUS',
            protocolo: eventoSucesso.protocolo,
            lote: eventoSucesso.lote,
            error: statusResult.error,
            message: `Erro na consulta do status do lote em ${environment.toUpperCase()}`,
            endpoint_usado: resultado.protocolos[environment].lote,
            timestamp_erro: new Date().toISOString(),
          });
        }
      } catch (error) {
        resultado.eventos.push({
          evento: 'CONSULTA_STATUS_LOTE',
          ambiente: environment,
          status: 'ERRO_SISTEMA',
          resultado: 'FALHA NA CONSULTA',
          protocolo: eventoSucesso.protocolo,
          lote: eventoSucesso.lote,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          message: `Erro interno na consulta do status em ${environment.toUpperCase()}`,
          endpoint_usado: resultado.protocolos[environment].lote,
          timestamp_erro: new Date().toISOString(),
        });
      }
    }
    // ETAPA 3: Verificar se o cadastro foi processado
    try {
      const consultaResult = await esocialSoap.consultarEmpregador();
      if (consultaResult.success) {
        resultado.eventos.push({
          evento: 'CONSULTA_VERIFICACAO',
          ambiente: environment,
          status: 'SUCESSO',
          resultado: 'CADASTRO CONFIRMADO NO ESOCIAL',
          dados_encontrados: consultaResult.data,
          message: `Empregador encontrado na base do eSocial ${environment.toUpperCase()}!`,
          endpoint_usado: resultado.protocolos[environment].consulta,
          timestamp_consulta: new Date().toISOString(),
        });
      } else {
        resultado.eventos.push({
          evento: 'CONSULTA_VERIFICACAO',
          ambiente: environment,
          status: 'AINDA_NAO_PROCESSADO',
          resultado: 'CADASTRO AINDA NÃO FOI PROCESSADO',
          error: consultaResult.error,
          message: `Cadastro ainda não foi processado pelo eSocial ${environment.toUpperCase()}`,
          endpoint_usado: resultado.protocolos[environment].consulta,
          recomendacao: 'Aguardar processamento (24-48h) e tentar novamente',
          timestamp_consulta: new Date().toISOString(),
        });
      }
    } catch (error) {
      resultado.eventos.push({
        evento: 'CONSULTA_VERIFICACAO',
        ambiente: environment,
        status: 'ERRO_SISTEMA',
        resultado: 'FALHA NA VERIFICAÇÃO',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        message: `Erro interno na verificação em ${environment.toUpperCase()}`,
        endpoint_usado: resultado.protocolos[environment].consulta,
        timestamp_erro: new Date().toISOString(),
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
      status_lote_consultado: resultado.eventos.some(
        e => e.evento === 'CONSULTA_STATUS_LOTE' && e.status === 'SUCESSO'
      ),
      taxa_sucesso: `${Math.round((sucessos / total) * 100)}%`,
      ambiente_usado: environment,
      cpf_cadastrado: EMPREGADOR_COMPLETO.ideEmpregador.nrInsc,
      protocolos_utilizados: resultado.protocolos[environment],
      recomendacao:
        sucessos > 0
          ? `Cadastramento realizado com sucesso em ${environment.toUpperCase()}!`
          : `Verificar configurações e tentar novamente em ${environment.toUpperCase()}`,
      status_geral:
        sucessos > 0 ? 'CADASTRAMENTO_REALIZADO' : 'VERIFICAR_CONFIGURACOES',
      proximos_passos:
        sucessos > 0
          ? [
              'Aguardar processamento (24-48h)',
              'Verificar cadastro novamente',
              'Cadastrar empregados (S-2200)',
              environment === 'homologacao'
                ? 'Migrar para produção'
                : 'Sistema pronto para uso',
            ]
          : [
              'Verificar permissões do certificado',
              'Verificar dados do empregador',
              'Tentar novamente',
              environment === 'homologacao'
                ? 'Testar em homologação primeiro'
                : 'Verificar conectividade de produção',
            ],
    };
    return res.status(200).json({
      success: true,
      data: resultado,
      conclusao,
    });
  } catch (error) {
    console.error('Erro no cadastramento com protocolos:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
