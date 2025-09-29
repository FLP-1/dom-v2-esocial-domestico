import fs from 'fs';
import https from 'https';
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
    const certificateBuffer = fs.readFileSync(certPath);
    const certInfo = await esocialSoap.loadCertificate(
      certificateBuffer,
      config.certificatePassword
    );

    // Teste com configuração SSL personalizada
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

    // Teste 1: Consultar empregador com SSL configurado
    try {
      const startTime = Date.now();

      // Configurar axios com SSL personalizado
      const axios = require('axios');
      const httpsAgent = new https.Agent({
        rejectUnauthorized: false, // Temporariamente para teste
        keepAlive: true,
      });

      // Fazer requisição direta para testar conectividade
      const testUrl =
        environment === 'homologacao'
          ? 'https://webservices.producaorestrita.esocial.gov.br'
          : 'https://webservices.esocial.gov.br';

      const response = await axios.get(testUrl, {
        httpsAgent: httpsAgent,
        timeout: 10000,
        validateStatus: () => true,
      });

      const endTime = Date.now();

      results.tests.push({
        test: 'conectividade_ssl',
        status: 'SUCCESS',
        responseTime: `${endTime - startTime}ms`,
        success: true,
        statusCode: response.status,
        message: 'Conectividade SSL estabelecida com sucesso',
      });

      // Teste 2: Consultar empregador via SOAP
      const empregadorResult = await esocialSoap.consultarEmpregador();

      results.tests.push({
        test: 'consultarEmpregador',
        status: empregadorResult.success ? 'SUCCESS' : 'ERROR',
        success: empregadorResult.success,
        error: empregadorResult.error,
        dataSource: empregadorResult.success ? 'real_data' : 'error',
      });
    } catch (error) {
      results.tests.push({
        test: 'conectividade_ssl',
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        success: false,
      });
    }

    // Calcular sucesso geral
    const successCount = results.tests.filter(t => t.success).length;
    const totalTests = results.tests.length;
    const overallSuccess = successCount > 0;

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
    console.error('❌ Erro no teste SSL:', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
