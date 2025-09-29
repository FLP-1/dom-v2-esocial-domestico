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
    const { environment = 'homologacao' } = req.body;

    // Configuração do eSocial
    const config = {
      environment: environment as 'homologacao' | 'producao',
      companyId: '59876913700',
      certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
      certificatePassword: '456587',
    };

    // Inicializar serviço SOAP
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
        error: 'Arquivo de certificado não encontrado',
      });
    }

    const certificateBuffer = fs.readFileSync(certPath);
    const certInfo = await esocialSoap.loadCertificate(
      certificateBuffer,
      config.certificatePassword
    );

    // Teste de conectividade com certificado
    const results = {
      timestamp: new Date().toISOString(),
      environment: environment,
      certificate: {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        serialNumber: certInfo.serialNumber,
      },
      tests: [],
    };

    // Teste 1: Consultar empregador
    try {
      const startTime = Date.now();
      const empregadorResult = await esocialSoap.consultarEmpregador();
      const endTime = Date.now();

      results.tests.push({
        test: 'consultarEmpregador',
        status: empregadorResult.success ? 'SUCCESS' : 'ERROR',
        responseTime: `${endTime - startTime}ms`,
        success: empregadorResult.success,
        error: empregadorResult.error,
        dataSource: empregadorResult.success ? 'real_data' : 'error',
      });
    } catch (error) {
      results.tests.push({
        test: 'consultarEmpregador',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
      });
    }

    // Teste 2: Consultar empregados
    try {
      const startTime = Date.now();
      const empregadosResult = await esocialSoap.consultarEmpregados();
      const endTime = Date.now();

      results.tests.push({
        test: 'consultarEmpregados',
        status: empregadosResult.success ? 'SUCCESS' : 'ERROR',
        responseTime: `${endTime - startTime}ms`,
        success: empregadosResult.success,
        error: empregadosResult.error,
        dataSource: empregadosResult.success ? 'real_data' : 'error',
      });
    } catch (error) {
      results.tests.push({
        test: 'consultarEmpregados',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
      });
    }

    // Teste 3: Consultar eventos
    try {
      const startTime = Date.now();
      const eventosResult = await esocialSoap.consultarEventos();
      const endTime = Date.now();

      results.tests.push({
        test: 'consultarEventos',
        status: eventosResult.success ? 'SUCCESS' : 'ERROR',
        responseTime: `${endTime - startTime}ms`,
        success: eventosResult.success,
        error: eventosResult.error,
        dataSource: eventosResult.success ? 'real_data' : 'error',
      });
    } catch (error) {
      results.tests.push({
        test: 'consultarEventos',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
      });
    }

    // Calcular sucesso geral
    const successCount = results.tests.filter(t => t.success).length;
    const totalTests = results.tests.length;
    const overallSuccess = successCount === totalTests;

    return res.status(200).json({
      success: overallSuccess,
      data: results,
      summary: {
        totalTests: totalTests,
        successCount: successCount,
        failureCount: totalTests - successCount,
        successRate: `${Math.round((successCount / totalTests) * 100)}%`,
      },
    });
  } catch (error) {
    console.error('❌ Erro no teste com certificado:', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
